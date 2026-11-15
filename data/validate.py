"""Independent verification of results.json (Trend Detective - Congo Basin).
Re-implements every calculation from the papers in plain numpy/scipy (no pymannkendall in the 'indep_' functions),
then compares with pymannkendall 1.4.x, scipy.stats and the published results.json.
Usage: python validate.py <nasa_power dir> <results.json> <out dir>
"""
import json, sys, glob, os, calendar, itertools
import numpy as np, scipy, scipy.stats as st, pymannkendall as mk
SRC, RES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
R = json.load(open(RES)); A = {(a["zone_id"], a["variable_id"], a["period_id"]): a for a in R["analyses"]}
CODES = {"t2m":("T2M","mean",1981),"t2m_max":("T2M_MAX","mean",1981),"t2m_min":("T2M_MIN","mean",1981),"ts":("TS","mean",1981),
         "precip":("PRECTOTCORR","sum",1981),"rh2m":("RH2M","mean",1981),"solar":("ALLSKY_SFC_SW_DWN","mean",1984),
         "wind":("WS2M","mean",1981),"soil_root":("GWETROOT","mean",1981)}
Z975 = st.norm.ppf(0.975)

# ---------- independent implementations (from the papers) ----------
def indep_S(x):                       # Mann (1945), Kendall (1975): S = sum_{i<j} sgn(x_j - x_i)
    x = np.asarray(x, float); d = x[None, :] - x[:, None]; return int(np.sign(d[np.triu_indices(len(x), 1)]).sum())
def indep_varS(x):                    # Var(S) = [n(n-1)(2n+5) - sum_t t(t-1)(2t+5)] / 18   (ties correction)
    x = np.asarray(x, float); n = len(x); _, t = np.unique(x, return_counts=True)
    return (n*(n-1)*(2*n+5) - np.sum(t*(t-1)*(2*t+5))) / 18.0
def indep_Z(S, V):                    # continuity correction
    return 0.0 if S == 0 else (S - np.sign(S)) / np.sqrt(V)
def p2(z): return 2*st.norm.sf(abs(z))  # two-sided, sf avoids 1-cdf cancellation
def indep_mk(x):
    S = indep_S(x); V = indep_varS(x); Z = indep_Z(S, V); return S, V, Z, p2(Z)
def indep_seasonal(m, period=12):     # Hirsch, Slack & Smith (1982): S'=sum_g S_g, Var'=sum_g Var_g
    m = np.asarray(m, float).reshape(-1, period); S = V = 0
    for g in range(period):
        col = m[:, g]; col = col[~np.isnan(col)]
        if len(col) > 1: S += indep_S(col); V += indep_varS(col)
    Z = indep_Z(S, V); return S, V, Z, p2(Z)
def indep_sen(x):                     # Sen (1968): median of (x_j-x_i)/(j-i), i<j
    x = np.asarray(x, float); n = len(x); i, j = np.triu_indices(n, 1); sl = (x[j]-x[i])/(j-i); return np.median(sl), np.sort(sl)
def indep_sen_ci(x, ties=True):       # Gilbert (1987) eq. 16.17-16.19: C=z*sqrt(Var S), M1=(N-C)/2, M2=(N+C)/2 (1-based ranks), upper = M2+1
    b, sl = indep_sen(x); N = len(sl); V = indep_varS(x) if ties else len(x)*(len(x)-1)*(2*len(x)+5)/18
    C = Z975*np.sqrt(V); M1 = (N - C)/2; M2 = (N + C)/2
    lo = sl[int(np.clip(round(M1), 1, N))-1]; hi = sl[int(np.clip(round(M2)+1, 1, N))-1]; return lo, hi
def indep_acf(y):
    y = np.asarray(y, float) - np.mean(y); n = len(y); c0 = np.dot(y, y)/n
    return np.array([np.dot(y[:n-k], y[k:])/n/c0 for k in range(n)])
def indep_hamed_rao(x, alpha=0.05):   # Hamed & Rao (1998): Var*(S) = Var(S) * n/n*_s,
    x = np.asarray(x, float); n = len(x)  # n/n*_s = 1 + 2/(n(n-1)(n-2)) * sum_{k=1}^{n-1} (n-k)(n-k-1)(n-k-2) rho_k  (significant rho_k of ranks of detrended series)
    S = indep_S(x); V = indep_varS(x); b, _ = indep_sen(x)
    r = st.rankdata(x - b*np.arange(1, n+1)); rho = indep_acf(r); lim = st.norm.ppf(1-alpha/2)/np.sqrt(n)
    k = np.arange(1, n); sig = np.abs(rho[1:]) > lim
    corr = 1 + 2/(n*(n-1)*(n-2)) * np.sum(((n-k)*(n-k-1)*(n-k-2)*rho[1:])[sig])
    Vs = V*corr
    if Vs <= 0: return S, Vs, np.nan, np.nan, corr
    Z = indep_Z(S, Vs); return S, Vs, Z, p2(Z), corr
def indep_bh(p):                      # Benjamini & Hochberg (1995): q_(i) = min_{k>=i} p_(k) m/k, capped at 1
    p = np.asarray(p, float); m = len(p); o = np.argsort(p); q = p[o]*m/np.arange(1, m+1)
    q = np.minimum.accumulate(q[::-1])[::-1]; out = np.empty(m); out[o] = np.minimum(q, 1); return out
def indep_annual(P, code, agg, y0, y1=2025):
    vals = {}
    for k, v in P[code].items():
        y, m = int(k[:4]), int(k[4:])
        if m == 13 or y < y0 or y > y1: continue
        vals.setdefault(y, {})[m] = None if v == -999 else float(v)
    out = {}
    for y in sorted(vals):
        ms = vals[y]
        if len(ms) != 12 or any(v is None for v in ms.values()): continue
        d = np.array([calendar.monthrange(y, m)[1] for m in range(1, 13)]); v = np.array([ms[m] for m in range(1, 13)])
        out[y] = float((v*d).sum()) if agg == "sum" else float((v*d).sum()/d.sum())
    return out
def monthly_vec(P, code, y0, y1=2025):
    return np.array([np.nan if P[code][f"{y}{m:02d}"] == -999 else P[code][f"{y}{m:02d}"] for y in range(y0, y1+1) for m in range(1, 13)], float)

# ---------- 1. real series ----------
rows = []; maxd = {}
def upd(k, v):
    if v is None or v != v: return
    maxd[k] = max(maxd.get(k, 0.0), float(v))
def rel(a, b): return abs(a-b)/max(abs(b), 1e-300)
def r3(x): return None if x != x else float(f"{x:.3g}")
pairs = []; counts = {"series": 0, "hr_nan": 0, "kt_sig_mismatch": 0}
for f in sorted(glob.glob(os.path.join(SRC, "*_monthly_1981_2025.json"))):
    zid = os.path.basename(f).replace("_monthly_1981_2025.json", ""); P = json.load(open(f))["properties"]["parameter"]
    for vid, (code, agg, y0v) in CODES.items():
        for pid, y0 in (("p2001_2025", 2001), ("p1981_2025", y0v)):
            a = A[(zid, vid, pid)]; counts["series"] += 1
            ann = indep_annual(P, code, agg, y0); x = np.array(list(ann.values()))
            js = np.array([v["valeur"] for v in a["serie_annuelle"]]); x = np.round(x, 6)
            upd("annual_vs_results_json_abs (both at 6 dp)", np.max(np.abs(x - js)))
            if code == "PRECTOTCORR":
                api = {int(k[:4]): v for k, v in P[code].items() if k.endswith("13") and v != -999 and y0 <= int(k[:4]) <= 2025}
                upd("rain_total_vs_POWER_ANN_x_days_rel", max(rel(ann[y], api[y]*(366 if calendar.isleap(y) else 365)) for y in ann))
            S, V, Z, p = indep_mk(x); r = mk.original_test(x)
            upd("MK S |indep - pymk|", abs(S - r.s)); upd("MK VarS rel", rel(V, r.var_s)); upd("MK Z abs", abs(Z - r.z)); upd("MK p abs", abs(p - r.p))
            upd("p_mk results.json vs 3-sig-fig(indep) abs", abs(r3(p) - a["p_mk"]))
            tau_b, p_kt = st.kendalltau(np.arange(len(x)), x)
            upd("Kendall tau |indep S/(n(n-1)/2) - scipy tau_b| (scipy tau_b corrects ties in x)", abs(S/(len(x)*(len(x)-1)/2) - tau_b))
            upd("p scipy kendalltau (no continuity corr.) vs MK abs", abs(p_kt - p))
            if (p_kt < .05) != (p < .05): counts["kt_sig_mismatch"] += 1
            b, _ = indep_sen(x); ts_ = st.theilslopes(x, np.arange(len(x)))
            upd("Sen slope |indep - pymk| abs", abs(b - r.slope)); upd("Sen slope |indep - scipy.theilslopes| abs", abs(b - ts_.slope))
            upd("Sen slope x10 vs results.json pente_decennie abs (3 dp)", abs(round(b*10, 3) - a["pente_decennie"]))
            lo, hi = indep_sen_ci(x); lo0, hi0 = indep_sen_ci(x, ties=False)
            upd("Sen CI indep(ties) vs results.json abs (x10, 3dp)", max(abs(round(lo*10, 3) - a["pente_decennie_ic95"][0]), abs(round(hi*10, 3) - a["pente_decennie_ic95"][1])))
            upd("Sen CI ties vs no-ties correction abs (x10)", max(abs(lo-lo0), abs(hi-hi0))*10)
            upd("Sen CI indep vs scipy.theilslopes CI abs (x10) [scipy uses different rank rounding]", max(abs(lo - ts_.low_slope), abs(hi - ts_.high_slope))*10)
            mv = monthly_vec(P, code, y0); Ss, Vs, Zs, ps = indep_seasonal(mv); rs = mk.seasonal_test(mv, period=12)
            upd("SMK S abs", abs(Ss - rs.s)); upd("SMK VarS rel", rel(Vs, rs.var_s)); upd("SMK Z abs", abs(Zs - rs.z))
            upd("SMK p abs (pymk 1-cdf underflows to 0 below ~1e-16)", abs(ps - rs.p))
            upd("p_smk results.json vs 3-sig-fig(pymk) abs", abs(r3(rs.p) - a["p_smk"]))
            Sh, Vh, Zh, ph, corr = indep_hamed_rao(x); hr = mk.hamed_rao_modification_test(x)
            if ph != ph or hr.p != hr.p:
                counts["hr_nan"] += 1; rows.append(f"HR NaN: {zid} {vid} {pid}: correction n/n*={corr:.3f} (variance <= 0), pymk p={hr.p}, results.json p_hr={a['p_hr']}")
            else:
                upd("HR VarS rel", rel(Vh, hr.var_s)); upd("HR p abs", abs(ph - hr.p)); upd("p_hr results.json vs 3-sig-fig abs", abs(r3(ph) - a["p_hr"]))
            pairs.append((pid, zid, vid, p, a))
# BH
for pid in ("p2001_2025", "p1981_2025"):
    sub = [t for t in pairs if t[0] == pid]; praw = np.array([t[3] for t in sub]); q = indep_bh(praw)
    qs = st.false_discovery_control(praw, method="bh")
    upd("BH indep vs scipy.false_discovery_control abs", np.max(np.abs(q - qs)))
    qj = np.array([t[4]["q_bh"] for t in sub]); upd("BH q results.json vs indep(raw p) abs", np.max(np.abs(qj - q)))
    upd("BH q results.json (3 sig. fig.) vs indep(raw p) rel", np.max(np.abs(qj - q)/q))
    flips = [(t[1], t[2]) for t, qi, qjj in zip(sub, q, qj) if (qi < .05) != (qjj < .05)]
    rows.append(f"BH {pid}: fdr_significant flips between raw-p and rounded-p computation: {flips or 'none'}")
    lvl = []
    for t, qi in zip(sub, q):
        a = t[4]; rm2 = a["p_mk"] < .05 and a["p_smk"] < .05
        e = "not_enough_evidence_yet" if not rm2 else ("robust" if (a["p_hr"] is not None and a["p_hr"] < .05 and qi < .05) else "exploratory")
        if e != a["evidence_level"]: lvl.append((t[1], t[2], a["evidence_level"], e))
        if rm2 != a["significatif"]: lvl.append((t[1], t[2], "RM2 mismatch"))
    rows.append(f"evidence_level / RM2 recomputed from raw values {pid}: mismatches = {lvl or 'none'}")

# ---------- 2. pymannkendall reference fixtures (for any future JS/TS port) ----------
fx = []
for key in [("cmr_yaounde","t2m_max","p2001_2025"), ("cmr_yaounde","precip","p2001_2025"), ("cmr_yaounde","rh2m","p2001_2025"), ("caf_bangui","t2m_max","p2001_2025")]:
    a = A[key]; x = [v["valeur"] for v in a["serie_annuelle"]]; r = mk.original_test(x); h = mk.hamed_rao_modification_test(x)
    lo, hi = indep_sen_ci(np.array(x))
    fx.append({"id": "_".join(key), "input_annual_values_3dp": x, "tolerance": 1e-6,
               "expected": {"S": float(r.s), "var_s": float(r.var_s), "z": float(r.z), "p_mk": float(r.p), "tau": float(r.Tau),
                            "sen_slope_per_year": float(r.slope), "sen_intercept": float(r.intercept), "sen_ci95_per_year": [float(lo), float(hi)],
                            "p_hr": float(h.p), "var_s_hr": float(h.var_s)}})
fx.append({"id": "bh_toy", "input_p": [0.01, 0.04, 0.03, 0.2], "tolerance": 1e-6, "expected": {"q_bh": [float(v) for v in st.false_discovery_control([0.01, 0.04, 0.03, 0.2])]}})
fx.append({"id": "units", "tolerance": 1e-9, "cases": [
  {"desc": "slope per year -> per decade", "in": 0.0782, "out": 0.782},
  {"desc": "rain mm/day x days: Jan 2024 (31 d) 5.0 mm/day -> 155 mm", "in": [5.0, 31], "out": 155.0},
  {"desc": "Feb 2024 leap (29 d) 4.0 mm/day -> 116 mm", "in": [4.0, 29], "out": 116.0},
  {"desc": "Feb 2023 (28 d) 4.0 mm/day -> 112 mm", "in": [4.0, 28], "out": 112.0},
  {"desc": "day-weighted annual mean of 12 monthly means, 2023 (365 d)", "in": "sum(v_m*d_m)/365", "out": "see build_results.py"}]})
json.dump(fx, open(os.path.join(OUT, "reference_fixtures.json"), "w"), indent=1)

# ---------- 3. synthetic tests ----------
rng = np.random.default_rng(20261115); N = 2000; n = 25; syn = []
def rate(gen, test, reps=N):
    return np.mean([test(gen()) < .05 for _ in range(reps)])
mkp = lambda x: indep_mk(x)[3]; hrp = lambda x: (lambda r: 1.0 if r[3] != r[3] else r[3])(indep_hamed_rao(x))
iid = lambda: rng.normal(0, 1, n)
def ar1(phi):
    def g():
        e = rng.normal(0, 1, n+50); y = np.zeros(n+50)
        for t in range(1, n+50): y[t] = phi*y[t-1] + e[t]
        return y[50:]
    return g
syn.append(("MK, white noise n=25 (expected ~5%, slightly less due to continuity corr.)", rate(iid, mkp)))
syn.append(("pymannkendall MK, same white noise", rate(iid, lambda x: mk.original_test(x).p)))
syn.append(("Hamed-Rao, white noise n=25", rate(iid, hrp)))
syn.append(("MK, AR(1) phi=0.5 noise (no trend) -> inflated", rate(ar1(.5), mkp)))
syn.append(("Hamed-Rao, AR(1) phi=0.5 noise (should be closer to 5%)", rate(ar1(.5), hrp)))
syn.append(("pymk Hamed-Rao lag=3 (variant), white noise", rate(iid, lambda x: (lambda q: 1.0 if q != q else q)(mk.hamed_rao_modification_test(x, lag=3).p), 1000)))
syn.append(("pymk Hamed-Rao lag=3 (variant), AR(1) phi=0.5", rate(ar1(.5), lambda x: (lambda q: 1.0 if q != q else q)(mk.hamed_rao_modification_test(x, lag=3).p), 1000)))
syn.append(("pymk TFPW (Yue et al. 2002, info only), AR(1) phi=0.5", rate(ar1(.5), lambda x: mk.trend_free_pre_whitening_modification_test(x).p, 1000)))
syn.append(("Seasonal MK, monthly white noise 25 y x 12", rate(lambda: rng.normal(0, 1, 300), lambda m: indep_seasonal(m)[3], 1000)))
# BH under global null: share of runs with >=1 discovery among 99 null tests
syn.append(("BH, 99 null tests: share of runs with >= 1 discovery (expected <= 5%)", np.mean([np.any(indep_bh(st.norm.sf(np.abs(rng.normal(size=99)))*2) < .05) for _ in range(1000)])))
syn.append(("No correction, 99 null tests: share with >= 1 p<0.05 (expected ~99%)", np.mean([np.any(st.norm.sf(np.abs(rng.normal(size=99)))*2 < .05) for _ in range(1000)])))
# known trend recovery
true_b = 0.078; est = []; cover = []; det = []
for _ in range(N):
    x = true_b*np.arange(n) + rng.normal(0, 0.25, n); b, _ = indep_sen(x); lo, hi = indep_sen_ci(x); est.append(b); cover.append(lo <= true_b <= hi); det.append(mkp(x) < .05)
syn.append((f"Known trend +{true_b}/yr (= +0.78/decade, sd 0.25): mean Sen estimate per decade", np.mean(est)*10))
syn.append(("  Sen CI coverage (expected ~95%)", np.mean(cover))); syn.append(("  MK detection rate (power)", np.mean(det)))
cov_ar = []
for _ in range(N):
    x = true_b*np.arange(n) + 0.25*ar1(.5)(); lo, hi = indep_sen_ci(x); cov_ar.append(lo <= true_b <= hi)
syn.append(("  Sen CI coverage with AR(1) phi=0.5 noise (expected < 95%: CI too narrow)", np.mean(cov_ar)))
x = np.arange(25.0); syn.append(("Exact: x = 0..24 -> S", indep_S(x))); syn.append(("Exact: x = 0..24 -> Sen slope", indep_sen(x)[0]))
syn.append(("Exact: constant series -> S, Z", (indep_S(np.ones(10)), indep_Z(indep_S(np.ones(10)), 1))))
xt = np.array([1, 2, 2, 3, 3, 3, 4.]); syn.append(("Ties: x=[1,2,2,3,3,3,4] Var(S) indep / pymk", (indep_varS(xt), mk.original_test(xt).var_s)))

# ---------- report ----------
L = ["# validation_report.md — vérification indépendante des calculs", "",
     f"Généré par `validation/validate.py` (numpy {np.__version__}, scipy {scipy.__version__}, pymannkendall {getattr(mk,'__version__','1.4.x')}). Graine aléatoire 20261115.",
     f"Séries testées : {counts['series']} (11 lieux × 9 variables × 2 périodes), toutes recalculées depuis les fichiers bruts NASA POWER.", "",
     "## 1. Écarts maximaux sur les séries réelles", "", "| Contrôle | Écart max |", "|---|---|"]
L += [f"| {k} | {v:.3g} |" for k, v in maxd.items()]
L += ["", f"- Séries où scipy.kendalltau (sans correction de continuité) et MK ne donnent pas le même verdict à 0,05 : {counts['kt_sig_mismatch']}",
      f"- Séries où Hamed-Rao est indéfini (variance corrigée ≤ 0) : {counts['hr_nan']}"] + [f"- {r}" for r in rows]
L += ["", "## 2. Tests synthétiques", "", "| Cas | Résultat |", "|---|---|"]
L += [f"| {k} | {v if not isinstance(v, float) else round(v, 4)} |" for k, v in syn]
open(os.path.join(OUT, "validation_report_raw.md"), "w").write("\n".join(L) + "\n"); print("\n".join(L))

# ---------- 4. extra robustness: AR(1) Monte Carlo null for Yaoundé 2001-2025 (independent of Hamed-Rao) ----------
L2 = ["", "## 3. Contrôle supplémentaire : p empirique sous un bruit AR(1) sans tendance (Yaoundé 2001–2025)", "",
      "Méthode : résidus = série − pente de Sen ; φ = autocorrélation lag-1 des résidus ; 20 000 séries AR(1) de même φ sans tendance ; p_AR1 = part des |S| simulés ≥ |S| observé. Seconde colonne avec φ = 0,6 (hypothèse pessimiste, car φ estimé sur 25 ans est biaisé vers le bas).", "",
      "| Variable | S | φ estimé | p_mk | p_hr | p_AR1(φ estimé) | p_AR1(φ = 0,6) |", "|---|---|---|---|---|---|---|"]
def sims(phi, n, reps=20000):
    e = rng.normal(size=(reps, n+50)); y = np.zeros_like(e)
    for t in range(1, n+50): y[:, t] = phi*y[:, t-1] + e[:, t]
    y = y[:, 50:]; i, j = np.triu_indices(n, 1); return np.abs(np.sign(y[:, j] - y[:, i]).sum(1))
for vid in ["t2m_max", "t2m", "ts", "rh2m", "soil_root", "precip"]:
    a = A[("cmr_yaounde", vid, "p2001_2025")]; x = np.array([v["valeur"] for v in a["serie_annuelle"]]); n = len(x)
    b, _ = indep_sen(x); res = x - b*np.arange(n); phi = indep_acf(res)[1]; S = indep_S(x)
    pe = np.mean(sims(max(phi, 0), n) >= abs(S)); p6 = np.mean(sims(0.6, n) >= abs(S))
    L2.append(f"| {vid} | {S} | {phi:.2f} | {a['p_mk']} | {a['p_hr']} | {pe:.4f} | {p6:.4f} |")
open(os.path.join(OUT, "validation_report_raw.md"), "a").write("\n".join(L2) + "\n"); print("\n".join(L2))
