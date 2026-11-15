# validation_report.md — Vérification indépendante des calculs (Trend Detective — Congo Basin)

Date : 15 nov. 2026 (UTC+1). Données : NASA POWER, 11 lieux × 9 variables × 2 périodes = **198 séries**, toutes recalculées depuis les fichiers bruts `nasa_power/*_monthly_1981_2025.json`.
Fichiers : `validate.py` (vérification), `reference_fixtures.json` (valeurs attendues, tolérance 1e-6), `results/build_results.py` v2.1 (production).

## Résumé

| Contrôle | Résultat |
|---|---|
| Agrégation annuelle (moyenne pondérée par les jours ; pluie = Σ mm/j × jours réels, bissextiles inclus) refaite de façon indépendante | **identique** à results.json (écart 0 à 6 décimales) |
| Pluie annuelle vs valeur annuelle de POWER (ANN × 365/366) | écart max **0,21 %** (attendu : POWER calcule son ANN autrement) |
| Mann-Kendall : S, Var(S) avec ex-aequo, Z avec correction de continuité, p — numpy « à la main » vs pymannkendall.original_test | **identiques** (S, Var(S), Z : écart 0 ; p : 1e-16) |
| MK saisonnier (Hirsch et al. 1982) à la main vs pymannkendall.seasonal_test | **identiques** |
| Hamed & Rao (1998) à la main vs pymannkendall.hamed_rao_modification_test | **identiques** (2e-16), sauf 1 série indéfinie (voir écarts) |
| Pente de Sen à la main vs pymannkendall vs scipy.stats.theilslopes | **identiques** (écart 0) |
| IC 95 % de Sen (Gilbert 1987) à la main vs build_results.py vs scipy.theilslopes | **identiques** (écart 0) |
| Benjamini-Hochberg à la main vs scipy.stats.false_discovery_control | **identiques** (1e-16) |
| p_mk, p_smk, p_hr, pente, IC de results.json vs recalcul indépendant | **identiques** à l'arrondi publié près (3 chiffres significatifs) |
| RM2, fdr_significant, evidence_level recalculés | **0 désaccord** sur 198 |
| scipy.stats.kendalltau (tau-b, sans correction de continuité) vs MK | même verdict à 0,05 sur **198/198** ; p différents de ≤ 0,011 (attendu : pas de correction de continuité dans scipy) |

## Écarts trouvés et corrigés (build_results.py v2 → v2.1)

1. **Faux ex-aequo dus aux arrondis machine (corrigé).** Deux années mathématiquement égales différaient de ~1e-15 selon l'ordre des additions (pandas vs numpy), ce qui changeait S de ±1. Séries touchées : Kinshasa T min (2001–2025 : p 0,315 → 0,327 ; 1981–2025 : 1,66e-7 → 1,75e-7), Lubumbashi humidité du sol 1981–2025 (0,248 → 0,252), Mbandaka vent 1981–2025 (0,348 → 0,353). **Aucun verdict ne change.** Correction : valeurs annuelles arrondies à 6 décimales **avant** les tests et publiées à 6 décimales → reproduction exacte depuis results.json ou le CSV.
   - Piste écartée : arrondir à 3 décimales créait de **faux** ex-aequo (vent, humidité du sol) et modifiait S sur ~70 séries (ex. Yaoundé T max p 0,000141 → 0,000127). Rejeté.
2. **BH calculé sur des p déjà arrondis (corrigé).** q_bh était calculé sur p_mk arrondis à 3 chiffres (écart relatif max 5 %). Désormais calculé sur les p bruts. Aucun fdr_significant ne change. Écart restant = arrondi d'affichage de q (≤ 0,5 %).
3. **Hamed-Rao indéfini (documenté, non corrigé).** Ouesso, rayonnement 2001–2025 : le facteur de correction n/n* vaut −0,03 (autocorrélations négatives fortes) → variance négative → p = NaN, publié `null`. L'interface affiche « n/a » ; le verdict reste RM2.
4. **p du MK saisonnier très petits.** pymannkendall calcule p = 2(1 − Φ(|Z|)) : en dessous de ~1e-16, le résultat devient 0,0. Afficher « < 0.001 ». (La version « à la main » utilise la fonction de survie et donne la vraie petite valeur ; même verdict.)

## Ce que les tests synthétiques montrent (n = 25 ans, comme 2001–2025)


| Cas | Résultat |
|---|---|
| MK, white noise n=25 (expected ~5%, slightly less due to continuity corr.) | 0.0425 |
| pymannkendall MK, same white noise | 0.049 |
| Hamed-Rao, white noise n=25 | 0.087 |
| MK, AR(1) phi=0.5 noise (no trend) -> inflated | 0.2275 |
| Hamed-Rao, AR(1) phi=0.5 noise (should be closer to 5%) | 0.208 |
| pymk Hamed-Rao lag=3 (variant), white noise | 0.074 |
| pymk Hamed-Rao lag=3 (variant), AR(1) phi=0.5 | 0.201 |
| pymk TFPW (Yue et al. 2002, info only), AR(1) phi=0.5 | 0.275 |
| Seasonal MK, monthly white noise 25 y x 12 | 0.048 |
| BH, 99 null tests: share of runs with >= 1 discovery (expected <= 5%) | 0.051 |
| No correction, 99 null tests: share with >= 1 p<0.05 (expected ~99%) | 0.988 |
| Known trend +0.078/yr (= +0.78/decade, sd 0.25): mean Sen estimate per decade | 0.7811 |
|   Sen CI coverage (expected ~95%) | 0.9545 |
|   MK detection rate (power) | 1.0 |
|   Sen CI coverage with AR(1) phi=0.5 noise (expected < 95%: CI too narrow) | 0.785 |
| Exact: x = 0..24 -> S | 300 |
| Exact: x = 0..24 -> Sen slope | 1.0 |
| Exact: constant series -> S, Z | (0, 0.0) |
| Ties: x=[1,2,2,3,3,3,4] Var(S) indep / pymk | (np.float64(39.666666666666664), np.float64(39.666666666666664)) |


**Lecture :**
- Bruit pur : MK est significatif dans **≈ 4–5 %** des cas → test bien calibré (un peu prudent à cause de la correction de continuité). MK saisonnier : ≈ 5 %.
- Tendance connue (+0,78 °C/décennie) : retrouvée en moyenne (**0,78**) et l'IC de Sen la contient dans **≈ 95 %** des cas → formules correctes.
- 99 tests sans aucune tendance : sans correction, on trouve presque toujours (≈ 99 %) au moins un « significatif » → d'où le bandeau *Exploratory* et q_bh. Avec BH : ≈ 5 %.
- **Limite importante :** avec une autocorrélation AR(1) φ = 0,5, MK donne ≈ 22 % de faux positifs ; **Hamed-Rao ne corrige presque pas à n = 25** (≈ 20 %) et il est un peu libéral sur bruit pur (7–9 %). L'IC de Sen ne couvre alors que ≈ 79 % des cas. Conséquence : « HR confirms » est un contrôle **faible** sur 25 ans ; ne jamais le présenter comme une preuve.

## 3. Contrôle supplémentaire : p empirique sous un bruit AR(1) sans tendance (Yaoundé 2001–2025)

Méthode : résidus = série − pente de Sen ; φ = autocorrélation lag-1 des résidus ; 20 000 séries AR(1) de même φ sans tendance ; p_AR1 = part des |S| simulés ≥ |S| observé. Seconde colonne avec φ = 0,6 (hypothèse pessimiste, car φ estimé sur 25 ans est biaisé vers le bas).

| Variable | S | φ estimé | p_mk | p_hr | p_AR1(φ estimé) | p_AR1(φ = 0,6) |
|---|---|---|---|---|---|---|
| t2m_max | 164 | 0.46 | 0.000141 | 0.00484 | 0.0069 | 0.0201 |
| t2m | 152 | 0.49 | 0.000421 | 0.00875 | 0.0151 | 0.0345 |
| ts | 138 | 0.48 | 0.00138 | 0.0184 | 0.0320 | 0.0629 |
| rh2m | -170 | 0.42 | 7.91e-05 | 7.91e-05 | 0.0032 | 0.0154 |
| soil_root | -140 | 0.48 | 0.00117 | 0.0145 | 0.0294 | 0.0590 |
| precip | -72 | 0.06 | 0.0973 | 0.0973 | 0.1125 | 0.3785 |

**Lecture :** les séries de Yaoundé ont une autocorrélation réelle (φ ≈ 0,4–0,5 ; 41 des 99 séries 2001–2025 ont un lag-1 significatif). Avec le φ estimé, toutes les tendances « robust » de Yaoundé restent < 0,05. Avec l'hypothèse pessimiste φ = 0,6, **T max, T2M et humidité relative restent < 0,05**, mais **température de surface (0,063) et humidité du sol (0,059) passent au-dessus**. Recommandation : le récit principal s'appuie sur T max de l'air et l'humidité relative ; TS et humidité du sol sont présentées comme « robust, mais sensibles à l'autocorrélation ». La pluie reste « Not enough evidence yet ».

## Reproduire

```
python -m venv venv && . venv/bin/activate && pip install numpy pandas scipy pymannkendall==1.4.3
python results/build_results.py nasa_power results/results.json
python validate.py nasa_power results/results.json .
```
Graine aléatoire fixe (20261115) : les tests synthétiques donnent les mêmes taux à ±1 point (Monte-Carlo).
