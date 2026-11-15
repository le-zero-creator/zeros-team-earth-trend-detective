"""Trend Detective - Congo Basin | build public/data/results.json from NASA POWER monthly point files.
v2.1 (2026-11-15, after critical review + independent validation: annual values rounded to 6 dp (float near-ties), published at 6 dp, BH on unrounded p).
Usage:  python build_results.py <dir with *_monthly_1981_2025.json> <out/results.json>
Method (documented in meta.method):
 - Annual value = day-weighted mean of monthly means (temperatures, humidity, wind, soil wetness, solar)
   or annual TOTAL for rainfall: sum over months of (mm/day x real days in month, leap years included).
 - Only complete years (12 valid months, no -999) are kept; incomplete years are dropped and counted.
 - p_mk  : Mann-Kendall test on the annual series (pymannkendall.original_test) -> PRIMARY test.
 - p_smk : Seasonal Mann-Kendall on the monthly series (period=12) -> checks the change is consistent across months.
 - p_hr  : Hamed-Rao modified MK on the annual series -> same test with variance corrected for serial autocorrelation.
           It is a robustness check of the same data, NOT an independent validation.
 - RM2 verdict: trend_detected only if p_mk < 0.05 AND p_smk < 0.05; otherwise not_enough_evidence_yet.
 - q_bh  : Benjamini-Hochberg FDR-adjusted p_mk, family = all analyses of the same period_id (11 zones x 9 vars = 99).
 - Sen slope x10 = change per decade. 95% CI: Gilbert (1987) normal approximation on all pairwise slopes;
   NOT corrected for autocorrelation (likely too narrow if the series is autocorrelated).
"""
import json, sys, glob, os, calendar, datetime as dt
import numpy as np, pandas as pd, pymannkendall as mk

SRC_DIR, OUT = sys.argv[1], sys.argv[2]
FILES = sorted(glob.glob(os.path.join(SRC_DIR, "*_monthly_1981_2025.json")))
ALPHA = 0.05
def r3(x): return None if (x is None or x != x) else float(f"{x:.3g}")

# id, POWER code, name en, name fr, unit of annual value, slope unit, aggregation, first valid year, source id
VARS = [
 ("t2m","T2M","Air temperature at 2 m (annual mean)","Température de l'air à 2 m (moyenne annuelle)","°C","°C per decade","mean",1981,"merra2"),
 ("t2m_max","T2M_MAX","Daily maximum AIR temperature at 2 m (annual mean)","Température MAXIMALE de l'AIR à 2 m (moyenne annuelle)","°C","°C per decade","mean",1981,"merra2"),
 ("t2m_min","T2M_MIN","Daily minimum AIR temperature at 2 m (annual mean)","Température MINIMALE de l'AIR à 2 m (moyenne annuelle)","°C","°C per decade","mean",1981,"merra2"),
 ("ts","TS","Earth SKIN (surface) temperature, model (annual mean)","Température de SURFACE du sol (peau), modèle (moyenne annuelle)","°C","°C per decade","mean",1981,"merra2"),
 ("precip","PRECTOTCORR","Rainfall, annual total","Pluie, cumul annuel","mm","mm per decade (annual total)","sum",1981,"merra2"),
 ("rh2m","RH2M","Relative humidity at 2 m (annual mean)","Humidité relative à 2 m (moyenne annuelle)","%","percentage points per decade","mean",1981,"merra2"),
 ("solar","ALLSKY_SFC_SW_DWN","All-sky solar radiation at surface (annual mean)","Rayonnement solaire au sol (moyenne annuelle)","MJ/m²/day","MJ/m²/day per decade","mean",1984,"ceres"),
 ("wind","WS2M","Wind speed at 2 m (annual mean)","Vitesse du vent à 2 m (moyenne annuelle)","m/s","m/s per decade","mean",1981,"merra2"),
 ("soil_root","GWETROOT","Root-zone soil wetness, model (annual mean, 0 = dry, 1 = saturated)","Humidité du sol zone racinaire, modèle (0 = sec, 1 = saturé)","0–1 (fraction)","fraction per decade","mean",1981,"merra2"),
]
EXCLUDED = [{"power_code":"GWETTOP","name_en":"Surface soil wetness (top ~5 cm)","reason_en":"Downloaded but not analysed: redundant with root-zone wetness (GWETROOT), noisier, and each extra variable adds 11 more tests (multiple-comparison risk). Raw values kept in data/raw/power.","reason_fr":"Téléchargée mais non analysée : redondante avec l'humidité racinaire (GWETROOT), plus bruitée, et chaque variable ajoute 11 tests (risque de comparaisons multiples). Valeurs brutes conservées."}]

def monthly(P, code):
    rows = {}
    for k, v in P[code].items():
        y, m = int(k[:4]), int(k[4:])
        if m == 13: continue
        rows[pd.Timestamp(y, m, 1)] = (np.nan if v == -999 else float(v))
    return pd.Series(rows).sort_index()

def annual(ts, agg, code):
    days = pd.Series([calendar.monthrange(i.year, i.month)[1] for i in ts.index], index=ts.index)
    df = pd.DataFrame({"v": ts, "d": days}).dropna()
    full = df.groupby(df.index.year)["v"].count() == 12
    if agg == "sum":   # mm/day * days in month -> mm/month, summed -> mm/yr
        a = (df["v"] * df["d"]).groupby(df.index.year).sum()
    else:              # day-weighted mean of monthly means
        a = (df["v"] * df["d"]).groupby(df.index.year).sum() / df["d"].groupby(df.index.year).sum()
    dropped = sorted(set(ts.index.year) - set(full[full].index))
    return a[full[full].index], dropped

def sen_ci(x, alpha=0.05):
    n = len(x); sl = np.sort([(x[j]-x[i])/(j-i) for i in range(n) for j in range(i+1, n)]); N = len(sl)
    var_s = n*(n-1)*(2*n+5)/18.0; C = 1.959964*np.sqrt(var_s)
    M1 = (N - C)/2.0; M2 = (N + C)/2.0 + 1          # 1-based ranks (Gilbert 1987)
    lo = sl[int(np.clip(round(M1), 1, N)) - 1]; hi = sl[int(np.clip(round(M2), 1, N)) - 1]
    return float(lo), float(hi)

def bh(p):
    p = np.asarray(p, float); n = len(p); o = np.argsort(p); q = np.empty(n)
    prev = 1.0
    for rank, idx in reversed(list(enumerate(o, start=1))):
        prev = min(prev, p[idx]*n/rank); q[idx] = prev
    return q

analyses, cells, checks = [], {}, []
P_RAW = []   # unrounded p_mk, used for BH (v2.1: BH no longer computed on 3-sig-fig p)
for f in FILES:
    zid = os.path.basename(f).replace("_monthly_1981_2025.json", "")
    d = json.load(open(f)); P = d["properties"]["parameter"]; cells[zid] = d["geometry"]["coordinates"][:2]
    for (vid, code, en, fr, unit, sunit, agg, y0, src) in VARS:
        ts_all = monthly(P, code)
        # consistency check for rainfall against POWER's own annual (ANN = mean mm/day over the year)
        if code == "PRECTOTCORR":
            ann_api = {int(k[:4]): v for k, v in P[code].items() if k.endswith("13") and v != -999}
        for (pid, start) in (("p2001_2025", 2001), ("p1981_2025", y0)):
            ts = ts_all[(ts_all.index.year >= start) & (ts_all.index.year <= 2025)]
            a, dropped = annual(ts, agg, code)
            a = a.round(6)   # v2.1: removes floating-point noise (mathematically equal years differed by ~1e-15 -> wrong S); 6 dp published, so results.json reproduces exactly
            if code == "PRECTOTCORR":
                diffs = [abs(a[y] - ann_api[y]*(366 if calendar.isleap(y) else 365)) / a[y] for y in a.index if y in ann_api]
                checks.append({"zone_id": zid, "period_id": pid, "max_rel_diff_vs_power_ANN": round(max(diffs), 4)})
            x = a.values; n = len(x)
            r = mk.original_test(x); rs = mk.seasonal_test(ts.dropna().values if ts.isna().sum()==0 else ts.values, period=12)
            hr = mk.hamed_rao_modification_test(x)
            lo, hi = sen_ci(x)
            sig = bool(r.p < ALPHA and rs.p < ALPHA)
            direction = "increasing" if r.slope > 0 else ("decreasing" if r.slope < 0 else "none")
            hr_status = None if hr.p != hr.p else ("confirms" if (hr.p < ALPHA) == (r.p < ALPHA) else "contradicts")
            warn = []
            if src == "ceres" and pid == "p1981_2025": warn.append("long_period_solar_source_change_to_verify")
            P_RAW.append(float(r.p))
            analyses.append({
              "zone_id": zid, "variable_id": vid, "period_id": pid,
              "period": f"{int(a.index[0])}-{int(a.index[-1])}", "n_years": int(n), "years_dropped_incomplete": dropped,
              "unit": unit, "slope_unit": sunit, "source_id": src,
              "serie_annuelle": [{"annee": int(y), "valeur": round(float(v), 6)} for y, v in a.items()],
              "serie_mensuelle_moyenne": [round(float(v), 3) for v in ts.groupby(ts.index.month).mean().values],
              "pente_decennie": round(r.slope*10, 3),
              "pente_decennie_ic95": [round(lo*10, 3), round(hi*10, 3)],
              "intercept": round(float(r.intercept), 3),
              "variation_totale": round(r.slope*(n-1), 3),
              "p_mk": r3(r.p), "p_smk": r3(rs.p), "p_hr": r3(hr.p), "q_bh": None,
              "tau_kendall": round(float(r.Tau), 3),
              "hr_vs_mk": hr_status,
              "direction": direction, "significatif": sig,
              "fdr_significant": None,
              "verdict_key": ("trend_detected_" + direction) if sig else "not_enough_evidence_yet",
              "warnings": warn,
            })
for pid in ("p2001_2025", "p1981_2025"):
    idx = [i for i, a in enumerate(analyses) if a["period_id"] == pid]
    q = bh([P_RAW[i] for i in idx])
    for i, qi in zip(idx, q):
        a = analyses[i]; a["q_bh"] = r3(qi); a["fdr_significant"] = bool(qi < ALPHA)
        # evidence level shown in the UI (verdict itself = RM2)
        if not a["significatif"]: a["evidence_level"] = "not_enough_evidence_yet"
        elif a["fdr_significant"] and a["p_hr"] is not None and a["p_hr"] < ALPHA: a["evidence_level"] = "robust"
        else: a["evidence_level"] = "exploratory"

meta = {
 "schema_version": "2.1", "generated_at": dt.datetime.now().isoformat(timespec="minutes"),
 "status": "EXPLORATORY - NASA POWER only (MERRA-2 reanalysis + CERES). Uncorrected p-values; BH-FDR q-values provided. MODIS / GPM not yet integrated.",
 "scope_en": "A comparison of selected locations across the Congo Basin region (11 points; not a basin-wide average).",
 "scope_fr": "Comparaison de lieux sélectionnés dans la région du Bassin du Congo (11 points ; pas une moyenne du bassin).",
 "method": {
   "annual_aggregation": "day-weighted mean of monthly means; rainfall = sum of mm/day x days in month (leap years counted); complete years only",
   "p_mk": "Mann-Kendall on annual values (primary test of a monotonic trend)",
   "p_smk": "Seasonal Mann-Kendall on monthly values, period=12 (is the change consistent across calendar months?). Assumes independence between months, so it can be anti-conservative alone.",
   "p_hr": "Hamed & Rao (1998) modified MK on annual values: corrects the variance for serial autocorrelation. Robustness check of the same data, not independent validation.",
   "rule_RM2": "trend_detected if p_mk < 0.05 AND p_smk < 0.05 (conservative: the annual trend must exist and be consistent across seasons); else not_enough_evidence_yet (never 'no change').",
   "evidence_level": "robust = RM2 AND p_hr < 0.05 AND q_bh < 0.05; exploratory = RM2 only; not_enough_evidence_yet = RM2 false. Note: p_smk is very small almost everywhere (n=300 monthly values, months assumed independent), so in practice p_mk decides RM2.",
   "q_bh": "Benjamini-Hochberg FDR on the unrounded p_mk within each period family (99 tests). Shown as information; verdict uses RM2.",
   "numerics": "Annual values are rounded to 6 decimals BEFORE the tests (removes floating-point noise that made mathematically equal years look different) and published at 6 decimals, so every statistic can be reproduced exactly from results.json or results_annual.csv. p-values are published to 3 significant figures; p < 1e-16 from the seasonal test is stored as 0.0 (floating-point limit) and must be displayed as '< 0.001'. Independent re-implementation checks: see validation_report.md.",
   "slope": "Sen's slope x10 = change per decade; 95% CI Gilbert (1987), normal approximation, NOT corrected for autocorrelation.",
   "trend_line": "y = intercept + (pente_decennie/10) * (year - first_year)",
   "multiple_comparisons": "198 tests in total (11 zones x 9 variables x 2 periods). Results are exploratory.",
   "alpha": ALPHA, "software": "Python 3.13, numpy, pandas, pymannkendall 1.4.3 (original_test, seasonal_test, hamed_rao_modification_test); Sen CI and BH implemented in build_results.py, cross-checked with scipy.stats"},
 "sources": [
   {"id": "merra2", "status": "available", "name": "NASA POWER - MERRA-2 reanalysis (meteorology, skin temperature, soil wetness)", "type": "reanalysis (model + assimilated observations), not a direct measurement", "resolution": "0.5° x 0.625° (~55 x 70 km)", "url": "https://power.larc.nasa.gov/", "accessed": dt.date.today().isoformat()},
   {"id": "ceres", "status": "available", "name": "NASA POWER - CERES SYN1deg (all-sky surface solar radiation)", "type": "satellite-derived radiative product", "resolution": "1° native, served on POWER grid", "note": "Solar series before 2001 may come from a different source in POWER (to verify); long-period trend flagged.", "url": "https://power.larc.nasa.gov/", "accessed": dt.date.today().isoformat()},
   {"id": "modis_lst", "status": "pending", "name": "MODIS MOD11A2 land surface temperature (AppEEARS)", "resolution": "1 km, 8-day"},
   {"id": "modis_ndvi", "status": "pending", "name": "MODIS MOD13Q1 NDVI (AppEEARS)", "resolution": "250 m, 16-day"},
   {"id": "gpm_imerg", "status": "pending", "name": "GPM IMERG GPM_3IMERGM v07 (Giovanni)", "resolution": "0.1°, monthly"},
   {"id": "gibs", "status": "reference_layer", "name": "NASA GIBS MODIS LST tiles (visual context only, not analysed)"},
   {"id": "hydrosheds", "status": "reference_layer", "name": "HydroSHEDS HydroBASINS v1c, Congo basin outline (Lehner & Grill 2013)"}],
 "citation": "These data were obtained from the NASA Langley Research Center (LaRC) POWER Project funded through the NASA Earth Science/Applied Science Program.",
 "excluded_variables": EXCLUDED,
 "qa_checks": {"rain_annual_total_vs_power_ANN_max_rel_diff": max(c["max_rel_diff_vs_power_ANN"] for c in checks)},
}
out = {"meta": meta,
       "variables": [{"variable_id": v[0], "power_code": v[1], "name": {"en": v[2], "fr": v[3]}, "unit": v[4], "slope_unit": v[5], "aggregation": v[6], "source_id": v[8]} for v in VARS],
       "power_cells": cells, "analyses": analyses}
json.dump(out, open(OUT, "w"), ensure_ascii=False, indent=1, allow_nan=False)
json.dump(out, open(OUT.replace(".json", ".min.json"), "w"), ensure_ascii=False, separators=(",", ":"), allow_nan=False)
rows = [(a["zone_id"], a["variable_id"], a["period_id"], p["annee"], p["valeur"]) for a in analyses for p in a["serie_annuelle"]]
pd.DataFrame(rows, columns=["zone_id", "variable_id", "period_id", "year", "value"]).to_csv(OUT.replace(".json", "_annual.csv"), index=False)
summ = [(a["zone_id"], a["variable_id"], a["period_id"], a["period"], a["n_years"], a["pente_decennie"], a["slope_unit"], a["pente_decennie_ic95"][0], a["pente_decennie_ic95"][1], a["p_mk"], a["p_smk"], a["p_hr"], a["q_bh"], a["hr_vs_mk"], a["significatif"], a["fdr_significant"], a["evidence_level"], a["verdict_key"], ";".join(a["warnings"])) for a in analyses]
pd.DataFrame(summ, columns=["zone_id","variable_id","period_id","period","n_years","slope_per_decade","slope_unit","ci95_low","ci95_high","p_mk","p_smk","p_hr","q_bh","hr_vs_mk","rm2_trend_detected","fdr_significant","evidence_level","verdict_key","warnings"]).to_csv(OUT.replace(".json","_summary.csv"), index=False)
print("QA rain total vs POWER ANN, max relative diff:", meta["qa_checks"])
print("analyses:", len(analyses), "| RM2 detected (2001-2025):", sum(a["significatif"] for a in analyses if a["period_id"]=="p2001_2025"), "| FDR q<0.05 (2001-2025):", sum(a["fdr_significant"] for a in analyses if a["period_id"]=="p2001_2025"))
for a in analyses:
    if a["zone_id"] == "cmr_yaounde" and a["period_id"] == "p2001_2025":
        print(f'{a["variable_id"]:10s} {a["pente_decennie"]:+.3f} {a["slope_unit"]:30s} CI[{a["pente_decennie_ic95"][0]:+.3f},{a["pente_decennie_ic95"][1]:+.3f}] p_mk={a["p_mk"]} p_smk={a["p_smk"]} p_hr={a["p_hr"]} q_bh={a["q_bh"]} HR:{a["hr_vs_mk"]} RM2={a["significatif"]}')
