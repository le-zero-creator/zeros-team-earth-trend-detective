# Trend Detective — Congo Basin · Feuille de route UI/UX + pack Claude Code — v2

Zero's team · NASA Space Apps Challenge 2026 (Yaoundé) · Défi « Be An Earth System Trend Detective! »
v2 · 15 nov. 2026, 10 h 30 (UTC+1). Cette version remplace la v1 après la revue critique. Pas de design dans ce document.

---

## 0. Changements v2 suite à la revue critique

| # | Point de la revue | Ce qui change en v2 |
|---|---|---|
| 1 | Conseils métier en 3 niveaux, sous forme de questions | `rules.json` v2. Niveau 1 « Observed » est généré depuis les chiffres. Niveau 2 « Why it matters ». Niveau 3 « Questions to explore » : des questions, jamais des solutions. Chaque carte contient aussi « What you'd need before acting » (autres données + expertise locale). Avertissement permanent. |
| 2 | Le titre ne doit pas laisser croire qu'on représente tout le bassin | Sous-titre obligatoire : « **A comparison of selected locations across the Congo Basin region** ». Yaoundé apparaît avec un **marqueur creux** et la mention « outside the hydrological basin (~63 km) », partout : carte, textes, métadonnées et pitch. Le champ `in_hydrobasins_congo` est calculé dans le geojson. |
| 3 | Les 3 valeurs p séparées, justifier RM2, « Not enough evidence yet » | `p_mk`, `p_smk` et `p_hr` sont affichées séparément, chacune avec son rôle (section F.3). RM2 est conservée et justifiée. Un résultat non significatif s'affiche toujours « Not enough evidence yet », jamais « no change ». |
| 4 | 198 tests : comparaisons multiples | Bandeau « Exploratory results — uncorrected p-values ». Ajout de `q_bh` (Benjamini-Hochberg, famille de 99 tests par période) et de `fdr_significant`. Nouveau champ `evidence_level` : robust / exploratory / not_enough_evidence_yet. |
| 5 | Hamed-Rao | `p_hr` est affichée, avec `hr_vs_mk` (« confirms » ou « contradicts »). Texte : « corrects the test for autocorrelation; a robustness check of the same data, not an independent validation ». |
| 6 | Explication de la valeur p | Remplacée mot pour mot par le texte demandé (voir D.5). |
| 7 | IC de la pente de Sen | Méthode de Gilbert (1987), approximation normale, **non corrigée de l'autocorrélation**. L'IC est affiché en **chiffres seulement**, jamais comme une bande autour des valeurs annuelles. |
| 8 | 10 variables téléchargées, 9 analysées | GWETTOP est exclue et documentée dans `meta.excluded_variables` (redondante avec GWETROOT, plus bruitée, et 11 tests de plus). Écrans, filtres et données ont donc les mêmes 9 variables. |
| 9 | Statut des sources | Chaque source a un statut visible : **Available** (MERRA-2 et CERES via POWER), **Pending** (MODIS LST, MODIS NDVI, GPM IMERG) ou **Reference layer** (HydroSHEDS ; GIBS hors V1). CERES et MERRA-2 sont documentées séparément. L'accueil n'annonce que ce qui est Available. |
| 10 | Séparer l'air et la surface ; ne pas dire « s'assèche » ; unités ; contrôle du script | T2M_MAX = « air temperature » et TS = « skin (surface) temperature, model » ne sont jamais confondus. La pluie de Yaoundé n'est pas significative (p = 0,097) : on ne l'utilise plus pour dire « plus sec ». Unités explicites : « mm per decade (annual total) », « percentage points per decade ». Le script est réécrit (voir F.3). |
| 11 | Reproduire, comparer, valider : 3 choses différentes | Section F.6. KNMI, MODIS et GPM passent dans « Limits / Next steps » tant qu'ils ne sont pas faits. |
| 12 | V1 resserrée | La V1 se limite au parcours DISCOVER → INVESTIGATE → ACT. Explore anywhere, quartiers MODIS, GIBS, Compare complet, visites guidées et PWA passent en **V2 / bonus**. Le cas Yaoundé reste à l'échelle de la maille POWER, avec un bandeau. |
| 13 | (suite de la revue) Écran Evidence trop chargé | L'écran suit une hiérarchie en 3 couches : comprendre (verdict) → vérifier (courbe, pente, p) → approfondir (tests, saisonnalité, sources, limites). Les niveaux Discover / Analysis / Scientific organisent vraiment l'écran (D.4). |
| 14 | (suite) Statistiques recodées en TS = risque | **La V1 ne recalcule rien en TypeScript.** L'appli lit seulement results.json, validé côté Python. Cela supprime la double chaîne de calcul. Le TS reviendra en V2 avec Explore, et avec une batterie de tests (séries connues, ex-aequo, valeurs manquantes, absence de tendance, série saisonnière). |
| 15 | (suite) PWA mal spécifiée | Décision : **pas de PWA en V1** (rien d'« installable » promis). Seulement un manifeste et des icônes pour un joli raccourci. |
| 16 | (suite) Audit de sécurité trop générique | L'audit est adapté à un site statique : dépendances npm, sources externes, liens et redirections, paramètres d'URL (liste blanche), CSP, données affichées. On interdit de « cocher » un point sans preuve (G.5). |
| 17 | (suite) Storytelling | Le récit ne s'appuie plus sur Bangui ou Yokadouma (leur refroidissement ne survit ni à Hamed-Rao ni au FDR). Nouveau fil : « What can satellite data really tell us about change across the Congo Basin? », puis plusieurs lieux, un test honnête, des résultats non uniformes, ce qu'on peut dire et ne pas dire, les questions par métier. |
| 18 | (suite) Maquettes IA ≠ spécifications | Les images générées servent de référence de direction artistique. **Les chiffres viennent toujours de results.json.** |
| 19 | (ajout) Rigueur des calculs | Ajout de la section 0 bis « Méthodes et formules de référence » : formules, articles avec DOI et fonctions. Tout a été vérifié de façon indépendante (numpy, scipy, tests synthétiques) dans `data/validation_report.md`. Deux écarts ont été corrigés (v2.1) : les faux ex-aequo machine et le BH calculé sur des p arrondis. Aucun verdict ne change. |
| 20 | (ajout) Garde-fous Claude Code | Claude Code ne crée aucune formule et ne recalcule rien côté client. S'il touche un calcul, il doit reproduire les fixtures de pymannkendall à 1e-6 près. Il ajoute des tests d'unités et de conversions. Toute formule affichée cite sa source. |

Points refusés ou nuancés :
- **RM2 est conservée** et non abandonnée (justification en F.3). En revanche, `evidence_level` montre si le résultat résiste à Hamed-Rao et au FDR.
- **Le FDR ne change pas le verdict.** Il est affiché comme information, et le statut exploratoire est déclaré. Changer le verdict par FDR rendrait le résultat dépendant du nombre de variables affichées dans l'appli.
- **On ne supprime pas toute comparaison.** Le Compare élaboré passe en V2, mais la V1 garde un **tableau simple « All locations for this variable »** sur l'accueil (zéro calcul, mêmes données). La page du défi insiste justement sur les tendances opposées selon les régions.

---

## 0 bis. Méthodes et formules de référence (vérifiées le 15 nov. 2026)

Règle : chaque formule ci-dessous est celle réellement exécutée par `build_results.py` v2.1. Elle a été recalculée « à la main » en numpy et comparée à pymannkendall et scipy sur les 198 séries. Résultat : écart nul (≤ 1e-15). Le détail est dans `data/validation_report.md`. Notations : x₁…xₙ = valeurs annuelles dans l'ordre des années, n = nombre d'années complètes, sgn = signe (+1, 0, −1), Φ = loi normale centrée réduite.

**1. Agrégation annuelle (avant tout test)**
- Températures, humidité, vent, humidité du sol, rayonnement : moyenne pondérée par les jours. Xₐ = Σₘ dₘ·xₘ / Σₘ dₘ, où dₘ est le nombre réel de jours du mois (`calendar.monthrange`, années bissextiles incluses).
- Pluie : cumul annuel. Pₐ = Σₘ dₘ·rₘ, où rₘ est en mm/jour (PRECTOTCORR), donc le résultat est en mm/an.
- Seules les années complètes (12 mois valides, aucun −999) sont gardées. Les valeurs sont arrondies à 6 décimales avant les tests, pour supprimer les faux écarts d'arrondi machine, et publiées à 6 décimales.
- Contrôle : la pluie annuelle diffère de l'ANN de POWER × 365/366 de 0,21 % au plus.
- Pente par décennie = 10 × pente annuelle. Variation totale = pente annuelle × (n − 1).
- Fonction : code maison (`annual()`), vérifiée par une seconde implémentation indépendante.

**2. Statistique S de Mann-Kendall**
- Formule : S = Σ_{i<j} sgn(xⱼ − xᵢ). Tau de Kendall : τ = S / [n(n−1)/2].
- Références :
  - Mann, H. B. (1945). Nonparametric tests against trend. *Econometrica*, 13(3), 245–259. DOI 10.2307/1907187.
  - Kendall, M. G. (1975). *Rank Correlation Methods*, 4ᵉ éd. Londres : Charles Griffin (livre, pas de DOI).
- Fonction : `pymannkendall.original_test(x)` → champs `s`, `Tau`.

**3. Variance de S avec correction des ex-aequo**
- Formule : Var(S) = [ n(n−1)(2n+5) − Σₖ tₖ(tₖ−1)(2tₖ+5) ] / 18, où tₖ est la taille du k-ième groupe de valeurs égales.
- Références : Kendall (1975) ; Hirsch et al. (1982).
- Fonction : `original_test` → champ `var_s`.

**4. Z avec correction de continuité, et p bilatéral**
- Formule : Z = (S − 1)/√Var(S) si S > 0 ; 0 si S = 0 ; (S + 1)/√Var(S) si S < 0. Puis p = 2·[1 − Φ(|Z|)].
- Remarque : en dessous d'environ 1e-16, pymannkendall arrondit ce calcul à 0, d'où l'affichage « < 0.001 ».
- Fonction : `original_test` → champs `z`, `p`. Dans results.json : **p_mk** (test principal).

**5. Mann-Kendall saisonnier (période 12)**
- Formule : S′ = Σ_{g=1..12} S_g et Var(S′) = Σ_g Var(S_g), où chaque mois g est testé séparément sur les années. Z′ et p se calculent comme au point 4.
- Hypothèse : les mois sont indépendants entre eux. Elle n'est pas corrigée, donc le test est anti-conservateur (p trop petits). C'est pourquoi p_smk n'est qu'un contrôle de cohérence.
- Références :
  - Hirsch, R. M., Slack, J. R. & Smith, R. A. (1982). Techniques of trend analysis for monthly water quality data. *Water Resources Research*, 18(1), 107–121. DOI 10.1029/WR018i001p00107.
  - La correction de dépendance de Hirsch, R. M. & Slack, J. R. (1984), *WRR* 20(6), 727–732, DOI 10.1029/WR020i006p00727, n'est **pas** utilisée.
- Fonction : `pymannkendall.seasonal_test(x_mensuel, period=12)` → **p_smk**.

**6. Mann-Kendall modifié de Hamed & Rao (autocorrélation)**
- Formule : Var*(S) = Var(S) · n/n*, avec n/n* = 1 + [2 / (n(n−1)(n−2))] · Σ_{k=1}^{n−1} (n−k)(n−k−1)(n−k−2)·ρₖ.
  - ρₖ est l'autocorrélation au retard k des **rangs** de la série sans tendance : xᵢ − b·i, où b est la pente de Sen.
  - Seuls les ρₖ significatifs sont gardés : |ρₖ| > z₀,₉₇₅/√n.
  - Z et p se calculent ensuite comme au point 4.
- Limite mesurée : à n = 25, la correction est faible (voir validation_report.md, § 2). Si n/n* ≤ 0, p n'est pas défini (`null`). C'est le cas d'une seule série : Ouesso, rayonnement 2001–2025.
- Référence : Hamed, K. H. & Rao, A. R. (1998). A modified Mann-Kendall trend test for autocorrelated data. *Journal of Hydrology*, 204(1–4), 182–196. DOI 10.1016/S0022-1694(97)00125-X.
- Fonction : `pymannkendall.hamed_rao_modification_test(x)` (tous les retards, alpha = 0,05) → **p_hr**.

**7. Pente de Sen (Theil-Sen) et ordonnée à l'origine**
- Formule : b = médiane{ (xⱼ − xᵢ)/(j − i) : i < j }. Ordonnée à l'origine (Conover 1980) : a = médiane(x) − b·médiane(t), avec t = 0…n−1. Droite affichée : y = a + b·(année − première année).
- Références :
  - Sen, P. K. (1968). Estimates of the regression coefficient based on Kendall's tau. *Journal of the American Statistical Association*, 63(324), 1379–1389. DOI 10.1080/01621459.1968.10480934.
  - Theil, H. (1950). A rank-invariant method of linear and polynomial regression analysis. *Proc. KNAW*, 53, 386–392 (pas de DOI).
  - Conover, W. J. (1980). *Practical Nonparametric Statistics*, 2ᵉ éd., Wiley.
- Fonctions : `pymannkendall.original_test` → `slope`, `intercept`. Contrôle croisé : `scipy.stats.theilslopes` (écart 0).

**8. Intervalle de confiance à 95 % de la pente de Sen**
- Formule : N = n(n−1)/2 pentes triées ; C = z₀,₉₇₅·√Var(S) ; M₁ = (N − C)/2 ; M₂ = (N + C)/2.
  - Borne basse = M₁-ième pente ; borne haute = (M₂ + 1)-ième pente (rangs comptés à partir de 1, arrondis au rang le plus proche, sans interpolation).
  - Var(S) est prise sans correction des ex-aequo. L'écart mesuré avec la version corrigée est nul sur nos séries.
- Limite : l'intervalle n'est **pas corrigé de l'autocorrélation**. En simulation AR(1) avec φ = 0,5, il ne couvre que ≈ 79 % des cas au lieu de 95 %.
- Référence : Gilbert, R. O. (1987). *Statistical Methods for Environmental Pollution Monitoring*, ch. 16. New York : Van Nostrand Reinhold. ISBN 0-442-23050-8.
- Fonction : `sen_ci()` dans build_results.py. Contrôle croisé : `scipy.stats.theilslopes` (écart 0). → **pente_decennie_ic95**.

**9. Benjamini-Hochberg (FDR)**
- Formule : trier les m p-valeurs (m = 99 par période), p₍₁₎ ≤ … ≤ p₍ₘ₎. Puis q₍ᵢ₎ = min_{k ≥ i} min(1, m·p₍ₖ₎/k). On l'applique aux p_mk **non arrondis**.
- Référence : Benjamini, Y. & Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. *Journal of the Royal Statistical Society B*, 57(1), 289–300. DOI 10.1111/j.2517-6161.1995.tb02031.x.
- Fonction : `bh()` dans build_results.py. Contrôle croisé : `scipy.stats.false_discovery_control(p, method="bh")` (écart 1e-16). → **q_bh**.

**10. Règles de décision (choix du projet, ce ne sont pas des formules publiées)**
- RM2 = (p_mk < 0,05 et p_smk < 0,05).
- `evidence_level` :
  - robust = RM2, p_hr < 0,05 et q_bh < 0,05 ;
  - exploratory = RM2 seulement ;
  - sinon not_enough_evidence_yet.

**Logiciel et références des outils**
- Hussain, M. M. & Mahmud, I. (2019). pyMannKendall: a python package for non parametric Mann Kendall family of trend tests. *Journal of Open Source Software*, 4(39), 1556. DOI 10.21105/joss.01556. Version utilisée : 1.4.3.
- Yue, S., Pilon, P., Phinney, B. & Cavadias, G. (2002). The influence of autocorrelation on the ability to detect trend in hydrological series. *Hydrological Processes*, 16(9), 1807–1829. DOI 10.1002/hyp.1095. Cité pour la limite liée à l'autocorrélation ; non utilisé pour le verdict.

**Données**
- NASA POWER : « These data were obtained from the NASA Langley Research Center (LaRC) POWER Project funded through the NASA Earth Science/Applied Science Program. »
- MERRA-2 : Gelaro, R. et al. (2017), *Journal of Climate*, 30(14), 5419–5454, DOI 10.1175/JCLI-D-16-0758.1.
- CERES SYN1deg : Doelling, D. R. et al. (2013), *Journal of Atmospheric and Oceanic Technology*, 30(6), 1072–1090, DOI 10.1175/JTECH-D-12-00136.1.
- HydroSHEDS : Lehner, B. & Grill, G. (2013), *Hydrological Processes*, 27(15), 2171–2186, DOI 10.1002/hyp.9740.

**Ressources déjà fournies par l'équipe (doc « Ressources thème 2 »)**
- Acker, J. G., McMahon, E., Shen, S., Hearty, T. & Casey, N. (2009). Time-series analysis of remotely-sensed SeaWiFS chlorophyll in river-influenced coastal regions. *EARSeL eProceedings*, 8(2). NASA NTRS 20090042747. C'est la source des « 5 étapes Acker » : série → tracé → tendance → test → interprétation.
- Trouet, V. & van Oldenborgh, G. J. (2013). KNMI Climate Explorer: a web-based research tool for high-resolution paleoclimatology. *Tree-Ring Research*, 69(1), 3–13. DOI 10.3959/1536-1098-69.1.3. Étape « compare » de la V2.
- Article Medium « Statistical test methods to detect trends in time series data » (snp.kriss, 2024) et guide Statsig « A Comprehensive Guide to Statistical Significance ». Ce sont des supports pédagogiques ; ils ne servent pas de références de formules.
- Aucun PDF d'article statistique n'a été trouvé dans le Drive ni dans /workspace ; seuls existent ces liens.

**Écarts trouvés lors de la vérification, puis corrigés (v2 → v2.1)**
- Faux ex-aequo dus aux arrondis machine dans 4 séries de Kinshasa, Lubumbashi et Mbandaka. Les p changent au plus de 0,012, et aucun verdict ne change.
- Le BH était calculé sur des p déjà arrondis (écart relatif jusqu'à 5 %). Aucun verdict FDR ne change.

---

## A. Synthèse

**Nom :** « Trend Detective — Congo Basin », à valider par Ludovic.
**Sous-titre obligatoire :** « A comparison of selected locations across the Congo Basin region ».
**Question narrative :** « What can satellite data really tell us about change across the Congo Basin? »

- **Étape 1 — Détecter (science).** Série NASA POWER (2001–2025 par défaut), Mann-Kendall annuel (test principal), Mann-Kendall saisonnier, Hamed-Rao, pente de Sen par décennie avec IC à 95 %, q de Benjamini-Hochberg. On affiche ce que les données permettent de dire et ce qu'elles ne permettent pas de dire.
- **Étape 2 — Interpréter (notre valeur ajoutée).** Pour un même résultat, chaque métier reçoit **ses questions** : Observed → Why it matters → Questions to explore → What you'd need. Sur le principe des vues Revit : un seul modèle, plusieurs lectures, aucune donnée modifiée.

Catégories visées :
1. Local Impact ;
2. Best Use of Science (méthode et honnêteté visibles) ;
3. Best Use of Data (sources NASA tracées, statut des sources, téléchargement).

## B. Ce qu'on reprend des anciens gagnants (inchangé sur le fond, ajusté au périmètre V1)

| Élément repris | Projet source | Où (V1) | Comment on fait mieux |
|---|---|---|---|
| Résultat actionnable | SkySense | Verdict & Act | Des **questions** par métier liées à un résultat testé, avec leurs limites (pas de prescription) |
| Déclaration IA précise | SkySense | Method | Pour chaque outil : ce qu'il a fait, et ce qui a été vérifié par l'équipe |
| Problème local chiffré | Queñaris | Home, Investigate (Yaoundé) | T max de l'air +0,78 °C/déc. (robuste), pluie « not enough evidence » : un chiffre honnête dans les deux sens |
| Parcours court → décision | WaterWise | Stepper en 4 étapes | Chaque étape tient sur 1 écran mobile |
| Démo courte + lien qui s'ouvre | WaterWise | README, vidéo | Deep links vers le cas Yaoundé |
| Choisir sur une carte, accessibilité | Landsat Connect | Place | 11 points, liste accessible au clavier, Yaoundé distinguée |
| Suivre les étapes de l'auteur du défi | Landsat Connect | Evidence (couche « vérifier ») | Les 5 étapes Acker cochées |
| Mettre en scène la série | Connected Earth Museum | TrendChart | Tracé animé une seule fois, droite de Sen, annotation du verdict |
| Un lieu avant l'acronyme | TerraTales | Home | Des questions en langage simple |
| Régions comparées | TerraTales | Tableau « All locations » (Home) | Montre des résultats non uniformes, avec leur niveau de preuve |
| Données → choix d'aménagement | Eco-Metropolis | Profil Architecte / Urbaniste | Sous forme de questions de conception, avec les données nécessaires |
| Variable nommée + sortie immédiate | L.O.C.U.S.T. | Clues | Définition simple + type de source (réanalyse ou satellite) |

## C. Architecture V1 (resserrée)

```
#/                 Home — DISCOVER
#/investigate      Place → Clues → Evidence → Verdict & Act   (?zone=&var=&period=)
#/method           Method, data, limits & next steps (+ AI use)
#/about            About & Credits
*                  404
```
**V2 / bonus si le temps le permet** : Compare complet (graphe superposé), Explore anywhere (API POWER en direct + stats TS), Yaoundé par quartiers (MODIS), couche GIBS, visites guidées, PWA.

Navigation :
- desktop : barre du haut (Investigate · Method · About · EN|FR) ;
- mobile : barre du bas à 3 onglets (Home · Investigate · Method), About dans le menu.

**États communs** à tous les écrans :
- chargement : squelette ;
- erreur de results.json : carte d'erreur + Retry + lien vers Method ;
- vide : invitation à choisir ;
- non significatif : badge gris « Not enough evidence yet » + « This does not mean there is no change. A longer record or another dataset may be needed. »

**Écran Home (DISCOVER)**
- Objectif : une question, un lieu, de l'honnêteté dès l'entrée.
- Blocs :
  1. Hero : « What can satellite data really tell us about change across the Congo Basin? » + sous-titre obligatoire + CTA « Start an investigation ».
  2. 3 cartes-questions avec deep link : « Are afternoons getting hotter in Yaoundé? » (t2m_max) · « Is the air getting drier? » (rh2m) · « Is rainfall changing? » (precip, qui illustre un « not enough evidence »).
  3. Carte Leaflet : contour HydroSHEDS, 11 points colorés selon `evidence_level` de la variable choisie. Yaoundé en marqueur creux avec l'étiquette « outside the hydrological basin ».
  4. Tableau « All locations for this variable » : lieu, pente, p_mk, preuve. Triable et lisible au clavier.
  5. Bandeau des sources avec statuts : NASA POWER (MERRA-2) **Available** · CERES **Available** · MODIS LST/NDVI **Pending** · GPM IMERG **Pending** · HydroSHEDS **Reference layer**.
  6. Bandeau « Exploratory results — uncorrected p-values (FDR q shown) ».
- Mobile : hero, questions, carte de 260 px, puis le tableau en cartes. Desktop : hero et carte côte à côte, tableau dessous.

**Investigate — étape 1, Place**
- Carte (identique à l'accueil) + liste des 11 lieux (nom, pays, milieu). Note « Each point = one NASA POWER grid cell (~55 × 70 km), not a city boundary ».
- Yaoundé = « Local case study — outside the Congo hydrological basin, within the wider Congo Basin forest region ».
- Mobile : carte + bottom sheet. Desktop : carte à 60 %, liste à 40 %.

**Investigate — étape 2, Clues**
- 9 cartes de variables, chacune avec un nom clair, une définition simple, l'unité, la source et son type, et un **statut**. Les variables Pending (LST MODIS, NDVI, GPM) sont listées à part en grisé « Pending — not yet in this version ».
- Période : 2001–2025 (par défaut) ou 1981–2025 (« long view »). Pour solar en 1981–2025, avertissement : « possible source change in 2001, to verify ».
- Distinction obligatoire : « Air temperature (2 m) » ≠ « Skin temperature (ground surface, model) ».

**Investigate — étape 3, Evidence** (hiérarchie en 3 couches)
- **Comprendre** (toujours visible) : titre « Yaoundé · Daily max AIR temperature · 2001–2025 », badge de verdict + `evidence_level`, phrase « +0.78 °C per decade (annual mean of daily max air temperature) ».
- **Vérifier** (visible) : TrendChart (points annuels, ligne, droite de Sen pointillée, aucune bande) ; 4 chiffres : pente + IC 95 % (en texte), p_mk, n années, variation sur la période.
- **Approfondir** (onglets Analysis / Scientific, repliés sur mobile) :
  - tableau des 3 tests (p_mk, p_smk, p_hr) avec le rôle de chacun et « HR confirms / contradicts MK » ;
  - q_bh ;
  - cycle saisonnier (12 mois) ;
  - source (statut, type, résolution, période, date d'accès) ;
  - Download CSV ;
  - les 5 étapes Acker ;
  - les limites spécifiques.
- Bandeau Yaoundé : « City-scale grid cell (~55 × 70 km). Neighbourhood data (MODIS) pending. »
- État non significatif : droite de Sen grise, badge gris, texte RM4.

**Investigate — étape 4, Verdict & Act**
- Verdict + phrase simple (Discover).
- Puces de profil : Architect · Urban planner · Farmer · Health · Student · Researcher. Le profil par défaut est Student, mémorisé en localStorage.
- **Carte métier en 4 blocs** :
  1. Observed (généré, avec les chiffres) ;
  2. Why it matters for you ;
  3. Questions to explore (2–3) ;
  4. What you'd need before acting (données + expertise).
- Toujours affichés : l'avertissement « questions, not proven recommendations; a trend does not show its cause » et « What we can't say ».
- Changer de profil change les questions, **jamais les chiffres**.

**Method, data, limits & next steps**
- Méthode : agrégation annuelle, les 3 tests et leur rôle, RM2, evidence_level, FDR, Sen et IC (non corrigé de l'autocorrélation).
- Tableau des sources avec leur statut.
- Variable exclue (GWETTOP) et pourquoi.
- Limites : réanalyse, maille de 55 km, points ≠ bassin, Yaoundé hors bassin, pas de causalité, 198 tests, p_smk anti-conservateur.
- **Reproduire / Comparer / Valider** (F.6).
- Next steps : MODIS, GPM, KNMI, quartiers.
- Déclaration IA. Téléchargements : results.json, CSV, script.

**About & Credits**
- Équipe (prénoms validés), sources et citations, licences (MIT, OSM, HydroSHEDS, OFL), « No tracking · No cookies · No personal data ».

**Pied de page** (partout) : © 2026 Zero's team · Data: NASA POWER (MERRA-2, CERES) · Basin outline: HydroSHEDS · Map © OpenStreetMap contributors · MIT · Method · Credits · No tracking · v1.0 — data accessed 2026-11-15.

## D. Design system (inchangé, sauf D.4 et D.5)

**D.1 Couleurs**
| Rôle | Hex | Contraste et usage |
|---|---|---|
| Bleu nuit | #0F233C | 15,8:1 |
| Orange | #E85D04 | 3,5:1, graphiques et gros éléments seulement |
| Orange texte | #B54708 | 5,4:1 |
| Émeraude | #2A9D8F | graphiques |
| Émeraude texte | #1F7A6F | 5,2:1 |
| Bleu pluie | #2B6CB0 | — |
| Gris « not enough evidence » | #64748B | 4,8:1 |
| Fond | #F4F7FA | — |
| Texte | #0B1726 | — |
| Erreur | #B42318 | — |

Les niveaux de preuve sur la carte et dans les badges :
- **Robust** : plein, orange ou bleu selon le sens, icône ▲ ou ▼ ;
- **Exploratory** : même couleur à 50 % + contour pointillé, icône ▲? ou ▼? ;
- **Not enough evidence yet** : gris, icône ≈.

Yaoundé a toujours un marqueur **creux**.

**D.2 Polices** (@fontsource, auto-hébergées) : Space Grotesk (titres), Inter (texte, 16 px), JetBrains Mono (chiffres).

**D.3 Composants**
- AppShell, LangToggle, ProfileChips, QuestionCard, BasinMap, LocationsTable, VariableCard (avec SourceStatusBadge), PeriodToggle, Stepper, TrendChart, VerdictBadge, EvidenceLevelBadge, TestsTable, PValueExplainer, SeasonalCycle, SourceBox, ProfessionCard (4 blocs), LimitsBox, ExploratoryBanner, YaoundeScaleBanner, Footer, Skeleton, ErrorState.
- Accessibilité : AA, focus visible, texte alternatif généré pour chaque graphique, aria-live sur le verdict, prefers-reduced-motion, cibles ≥ 44 px.

**D.4 Niveaux de lecture** (organisent l'écran Evidence) :
- **Discover** : verdict, phrase simple, graphique ;
- **Analysis** : + pente, IC, p_mk, p_smk, p_hr, q_bh et leur rôle ;
- **Scientific** : + formules, agrégation, hypothèses, avertissements, CSV.

Mêmes chiffres dans les trois niveaux.

**D.5 Textes imposés** (i18n) :
- Analysis/Scientific : « The p-value measures how compatible the observed data are with the assumption of no monotonic trend. A value below 0.05 is commonly considered statistically significant. »
- Discover : « A small p-value means the observed trend would be unusual if there were no underlying trend. »
- Non significatif : « Not enough evidence yet » (jamais « no change »).
- Hamed-Rao : « Corrects the test for autocorrelation (when one year resembles the previous one). A robustness check of the same data, not an independent validation. »
- IC : « 95% range of plausible slopes (Gilbert 1987); not corrected for autocorrelation, so it may be too narrow. »

## E. Prompts de maquettes (réduits à la V1)

**Préfixe commun :** « UI mockup, clean modern scientific web app "Trend Detective — Congo Basin", subtitle "A comparison of selected locations across the Congo Basin region", flat design, light background #F4F7FA, white cards 12px radius subtle shadow, night-blue #0F233C nav and headings, solar-orange #E85D04 for robust rising trends, #2B6CB0 for robust falling trends, slate grey #64748B for "Not enough evidence yet", Space Grotesk headings, Inter text, JetBrains Mono numbers, realistic English UI text, no lorem ipsum, high fidelity, no people. Numbers are placeholders for art direction only. »

Formats : Desktop = 1440×900 ; Mobile = 390×844 avec bottom tab bar.

1. **Home — desktop.** "[prefix] Desktop. Top nav: logo, Investigate, Method, About, EN|FR. Hero headline 'What can satellite data really tell us about change across the Congo Basin?', subtitle line, orange button 'Start an investigation'. Three question cards: 'Are afternoons getting hotter in Yaoundé?', 'Is the air getting drier?', 'Is rainfall changing?'. Right: map of Central Africa with the Congo River basin outline, 10 solid dots inside, one HOLLOW dot labelled 'Yaoundé – outside the hydrological basin', legend 'Robust trend / Exploratory / Not enough evidence yet'. Below: small table 'All locations for this variable' with columns Location, Trend per decade, p (MK), Evidence. Thin banner 'Exploratory results — uncorrected p-values; FDR q shown'. Source strip with status pills: 'NASA POWER (MERRA-2) Available', 'CERES Available', 'MODIS Pending', 'GPM Pending'."
   **Mobile.** "[prefix] Mobile. Hero headline, orange CTA, 3 stacked question cards, compact basin map with hollow Yaoundé marker, locations list as cards, bottom tabs Home / Investigate / Method."
2. **Place — mobile.** "[prefix] Mobile. Stepper 'Place · Clues · Evidence · Verdict' (step 1 active). Full map with 11 points, bottom sheet list; selected 'Yaoundé (Cameroon) — local case study, outside the Congo hydrological basin'; note 'Each point = one ~55×70 km NASA POWER cell'. Button 'Next: choose clues'."
3. **Clues — desktop.** "[prefix] Desktop. Step 2. Grid of 9 variable cards each with name, plain definition, unit, source type and green 'Available' pill: 'Daily max AIR temperature (2 m) — reanalysis', 'Skin temperature (ground surface) — model', 'Rainfall, annual total — mm', 'Relative humidity — %', 'Root-zone soil wetness — 0–1', etc. A separate greyed section 'Pending — not yet in this version: MODIS land surface temperature, MODIS NDVI, GPM IMERG rainfall'. Period toggle '2001–2025' / '1981–2025 (long view)'."
4. **Evidence — desktop.** "[prefix] Desktop. Step 3. Header 'Yaoundé · Daily max air temperature · 2001–2025' with orange badge '▲ Trend detected · Robust'. Large line chart: yearly dots, thin line, dashed orange Sen trend line, NO shaded band, axes 'Year' and '°C'. Four number cards: '+0.78 °C per decade (95% range 0.45–1.30)', 'p (Mann-Kendall) = 0.00014', '25 years', 'Change over period +1.9 °C'. Tabs 'Discover | Analysis | Scientific' with Analysis open showing a small table: Mann-Kendall (annual) p=0.00014 'primary test'; Seasonal MK p<0.001 'consistent across months'; Hamed-Rao p=0.0048 'autocorrelation-corrected — confirms'; FDR q=0.007. Yellow-grey banner 'City-scale grid cell (~55×70 km). Neighbourhood data pending.'"
   **Mobile.** "[prefix] Mobile. Verdict badge and one sentence on top, compact chart, 2x2 number cards, collapsed accordions 'Tests', 'Source', 'Limits', sticky button 'What does it mean for me?'."
5. **Evidence, non significatif — mobile.** "[prefix] Mobile. 'Yaoundé · Rainfall, annual total · 2001–2025', grey dashed trend line, grey badge '≈ Not enough evidence yet', text 'p (MK) = 0.097 ≥ 0.05. This does not mean there is no change — a longer record or another dataset may be needed.', number card '−119 mm per decade (annual total), 95% range −239 to +14'."
6. **Verdict & Act — desktop.** "[prefix] Desktop. Step 4. Left: verdict badge and plain sentence; box 'What we can't say: the cause; anything below ~55 km'. Right: profile chips (Architect selected, Urban planner, Farmer, Health, Student, Researcher). One profession card with four labelled blocks: '1 Observed' (numbers), '2 Why it matters for architects', '3 Questions to explore' (three question bullets ending with '?'), '4 What you'd need before acting' (chips: hourly site data, prevailing winds, orientation, local engineer). Footer disclaimer 'Questions to explore with local experts — not recommendations proven by statistics.'"
   **Mobile.** "[prefix] Mobile. Verdict badge, horizontal profile chips, the four-block profession card stacked, disclaimer."
7. **Method — desktop.** "[prefix] Desktop documentation page, sticky left contents (Method, Tests, Evidence levels, Data sources, Excluded variable, Limits, Reproduce · Compare · Validate, Next steps, AI use, Downloads). Sources table with status pills Available / Pending / Reference layer."
8. **About & Credits — mobile.** "[prefix] Mobile. Team, sources with citations, licences, 'No tracking · No cookies · No personal data'."
9. **Chargement et erreur — desktop.** "[prefix] Desktop. Evidence step loading skeleton 'Loading NASA data…', and an error card 'We couldn't load results.json — Retry · Read the method'."

Ordre conseillé : 1, 4, 6, 5 (suffisant pour la vidéo), puis 3, 2, 7, 8, 9.

## F. Data pack v2

### F.1 Fichiers (Drive `02 UI-UX et données/data/`) — **remplacés en v2**
- `validation_report.md`, `validate.py`, `results/reference_fixtures.json` : vérification indépendante + valeurs attendues (tolérance 1e-6) pour tout portage du calcul.
- `results/results.json` (lisible) et `results.min.json` (≈ 350 Ko, pour l'appli) : schéma 2.1, 198 analyses.
- `results/results_summary.csv` : une ligne par analyse (pente, IC, p_mk, p_smk, p_hr, q_bh, hr_vs_mk, verdict, evidence_level, avertissements). C'est le fichier à relire en équipe.
- `results/results_annual.csv` : séries annuelles.
- `results/rules.json` v2 : cartes métier en 4 blocs, FR/EN.
- `results/build_results.py` v2 + `run_log_v2.txt`.
- `zones/congo_basin_points.geojson` (avec `in_hydrobasins_congo` et la distance au bassin), `congo_basin_boundary.geojson`, `yaounde_zones.geojson` (réservé à la V2).
- `nasa_power/` (inchangé) : fichiers bruts des 11 points, mensuel 1981–2025, et le journalier de Yaoundé.
- `appeears/` (inchangé, pour la V2).

### F.2 À récupérer à la main (V2 / next steps), inchangé depuis la v1
- AppEEARS : MOD11A2 et MOD13Q1 à partir de `appeears_points.csv`.
- Giovanni : GPM_3IMERGM v07, moyenne de zone.
- KNMI Climate Explorer : comparaison.
- GFW / Hansen : CSV par pays.

Statut : **Pending** dans l'appli.

### F.3 Méthode v2 (contrôlée dans le script)
- **Agrégation annuelle.** Moyenne des moyennes mensuelles pondérée par le nombre de jours. Pour la pluie, **cumul** = Σ (mm/jour × jours réels du mois), années bissextiles comprises.
  - On ne garde que les années complètes (12 mois valides, sans −999). Les années écartées sont listées dans `years_dropped_incomplete` (aucune année écartée ; le rayonnement commence en 1984).
  - **Contrôle :** l'écart maximal entre notre cumul de pluie et la valeur annuelle de POWER (ANN × jours de l'année) est de **0,21 %** sur les 22 couples zone × période, ce qui vient des arrondis.
- **Les 3 tests et leur rôle.**
  - `p_mk`, Mann-Kendall sur les valeurs annuelles : **test principal** (le test demandé par le défi) d'une tendance monotone.
  - `p_smk`, MK saisonnier sur les 300 valeurs mensuelles : vérifie que le changement est **cohérent d'un mois à l'autre** et qu'il n'est pas un artefact d'une seule saison. Il suppose les mois indépendants, ce qui le rend **anti-conservateur** : il est presque toujours très petit, d'où son rôle de condition et non de preuve.
  - `p_hr`, Hamed-Rao sur les valeurs annuelles : même test, variance corrigée de l'autocorrélation. C'est un **contrôle de robustesse**, pas une validation indépendante. `hr_vs_mk` indique s'il confirme ou contredit le MK.
- **RM2 conservée.** « Trend detected » seulement si p_mk < 0,05 ET p_smk < 0,05. Justification : on exige une tendance annuelle ET qu'elle ne disparaisse pas quand on regarde mois par mois. C'est une règle conservatrice ; elle vient du Cahier d'analyse et évite de valider une tendance qui ne tiendrait qu'à une saison. Dans les faits, c'est p_mk qui décide, ce qu'on écrit noir sur blanc.
- **evidence_level.**
  - *robust* = RM2 + p_hr < 0,05 + q_bh < 0,05 ;
  - *exploratory* = RM2 seulement ;
  - *not_enough_evidence_yet* = RM2 non remplie.
- **Comparaisons multiples.** 198 tests (11 × 9 × 2). `q_bh` est le FDR de Benjamini-Hochberg sur p_mk, par période (99 tests). Résultats déclarés **exploratoires**.
- **Sen et IC.** Pente × 10 = par décennie. IC à 95 % de Gilbert (1987) : approximation normale sur toutes les pentes deux à deux, **non corrigée de l'autocorrélation**. Affichée en chiffres seulement.
- **Unités des pentes** (champ `slope_unit`) : °C per decade ; mm per decade (annual total) ; percentage points per decade ; MJ/m²/day per decade ; m/s per decade ; fraction per decade.
- **Variable exclue.** GWETTOP (raisons dans `meta.excluded_variables`). Les 9 variables analysées sont : t2m, t2m_max, t2m_min, ts, precip, rh2m, solar, wind, soil_root.
- **Avertissement.** Le rayonnement sur 1981–2025 porte `long_period_solar_source_change_to_verify`.

### F.4 Chiffres v2 — Yaoundé (maille NASA POWER, 2001–2025)

| Indicateur | Pente | IC 95 % | p_mk | p_smk | p_hr (HR) | q_bh | Niveau |
|---|---|---|---|---|---|---|---|
| Température **de l'air** max. journalière (T2M_MAX) | **+0,78 °C/déc.** | 0,45 à 1,30 | 0,00014 | < 0,001 | 0,0048 (confirme) | 0,0070 | **robust** |
| Température de l'air moyenne (T2M) | +0,39 °C/déc. | 0,22 à 0,68 | 0,00042 | < 0,001 | 0,0088 (confirme) | 0,014 | robust |
| Température **de surface** (peau, modèle, TS) | +0,43 °C/déc. | 0,18 à 0,78 | 0,0014 | < 0,001 | 0,018 (confirme) | 0,020 | robust |
| Humidité relative (RH2M) | −1,63 pt de %/déc. | −2,60 à −1,01 | 0,000079 | < 0,001 | 0,000079 (confirme) | 0,0070 | robust |
| Humidité du sol racinaire (modèle) | −0,049 /déc. | −0,077 à −0,023 | 0,0012 | < 0,001 | 0,0145 (confirme) | 0,019 | robust |
| Pluie, cumul annuel | −119 mm/déc. | −239 à +14 | **0,097** | < 0,001 | 0,097 | 0,23 | **not enough evidence yet** |
| Température de l'air min. (T2M_MIN) | +0,26 °C/déc. | −0,03 à +0,56 | 0,088 | 0,0085 | 0,088 | 0,22 | not enough evidence yet |

(« < 0,001 » : le p_smk calculé est inférieur à 1e-13, voire nul par arrondi numérique.)

**Robustesse à l'autocorrélation.** Ce contrôle est indépendant de Hamed-Rao (`validation_report.md`, § 3). On calcule un p empirique contre un bruit AR(1) sans tendance :
- **Avec le φ estimé (≈ 0,45) :** T max 0,007 ; T2M 0,015 ; humidité relative 0,003 ; TS 0,032 ; humidité du sol 0,029.
- **Avec un φ pessimiste de 0,6 :** T max 0,020, T2M 0,035 et humidité relative 0,015 restent sous 0,05. En revanche, TS (0,063) et humidité du sol (0,059) passent juste au-dessus.

Conséquence : le récit principal s'appuie sur la **T max de l'air** et l'**humidité relative**. TS et humidité du sol sont dites « robust, but sensitive to autocorrelation » (onglet Scientific).

**Phrase autorisée :** « In the Yaoundé grid cell, daily maximum air temperature rose by about 0.8 °C per decade (2001–2025), while relative humidity and modelled root-zone soil wetness decreased. Annual rainfall shows no statistically significant trend yet. »

**Phrase interdite :** « Yaoundé is drying out because rainfall is falling. »

**Ensemble du bassin (2001–2025) :**
- 31 résultats « trend detected » sur 99, dont 15 *robust* et 16 *exploratory* ; les 68 autres sont « not enough evidence yet ».
- Le refroidissement apparent de Bangui (T max −1,57 °C/déc.) et de Yokadouma (−1,22 °C/déc.) est *exploratory* : Hamed-Rao ne le confirme pas (p_hr ≈ 0,10) et il ne passe pas le FDR. **On ne le met pas en avant.**
- Les tendances humides robustes de Bangui (pluie, humidité relative, humidité du sol) restent à recouper avec GPM.

### F.5 Schéma results.json 2.0 (par analyse)

Champs : `zone_id, variable_id, period_id, period, n_years, years_dropped_incomplete, unit, slope_unit, source_id, serie_annuelle[{annee,valeur}], serie_mensuelle_moyenne[12], pente_decennie, pente_decennie_ic95[2], intercept, variation_totale, p_mk, p_smk, p_hr, q_bh, tau_kendall, hr_vs_mk, direction, significatif, fdr_significant, evidence_level, verdict_key, warnings[]`.

- `meta` contient `scope_en/fr`, `method` (chaque règle en texte), `sources[]` (avec un `status` available / pending / reference_layer), `excluded_variables`, `qa_checks`.
- Correspondance avec le Cahier d'analyse : p_value_mk → `p_mk`, p_value_smk → `p_smk`.
- Les textes du verdict et des recommandations sont générés à partir de rules.json et i18n.
- Droite de tendance : y = intercept + (pente_decennie / 10) × (année − première année).

### F.6 Reproduire ≠ comparer ≠ valider
1. **Reproduire le calcul** : relancer `build_results.py` sur les mêmes fichiers donne les mêmes chiffres ; le cumul de pluie colle à l'ANN de POWER à 0,2 % près. → **Fait.**
2. **Comparer avec un autre produit** : MODIS LST, GPM IMERG ou ERA5 via KNMI. Cela montre si la tendance dépend du jeu de données. → **Next step** (Method > Limits / Next steps).
3. **Valider par des observations** : stations météo au sol (Yaoundé-Nsimalen, par exemple via NOAA CDO), mesures de terrain. → **Next step.**

Dans l'appli, on écrit seulement « reproduced » ; jamais « validated ».

## G. Pack Claude Code v2

### G.1 Arborescence V1
```
public/data/results.json  rules.json  csv/results_annual.csv  csv/results_summary.csv
public/data/zones/congo_basin_boundary.geojson  congo_basin_points.geojson
src/i18n/en.json fr.json · src/lib/data.ts (fetch via BASE_URL) · src/lib/rules.ts (cartes métier) · src/lib/format.ts (p, unités, langues)
src/components/… · src/pages/Home.tsx Investigate.tsx Method.tsx About.tsx NotFound.tsx · src/styles/tokens.css
scripts/build_results.py · data/raw/power/… · docs/ (3 Cahiers, maquettes, captures)
```
Pas de `src/lib/stats` en V1.

### G.2 Correspondance Drive → dépôt
| Drive `data/…` | Dépôt |
|---|---|
| results/results.min.json | public/data/results.json |
| results/rules.json | public/data/rules.json |
| results/results_annual.csv et results_summary.csv | public/data/csv/ |
| zones/congo_basin_boundary.geojson et congo_basin_points.geojson | public/data/zones/ |
| zones/yaounde_zones.geojson, appeears/* | data/raw/ (V2, non utilisés en V1) |
| nasa_power/* | data/raw/power/ |
| results/build_results.py | scripts/build_results.py |
| claude-code/CLAUDE.v2-complement.md | racine du dépôt (+ 1 ligne dans CLAUDE.md : « lire CLAUDE.v2-complement.md ») |
| claude-code/PROMPT_MAITRE_V1_v2.md | à coller dans Claude Code |

### G.3 Critères d'acceptation : voir le prompt maître v2 (dans le Drive `claude-code/`).

### G.4 Tests clés
- Aucun chiffre en dur : un test Vitest vérifie que les valeurs affichées pour Yaoundé / t2m_max sont bien celles de results.json.
- Un test vérifie que les clés EN et FR sont identiques.
- Un test vérifie que Yaoundé est rendue avec un marqueur creux et que l'étiquette « outside » est présente.
- Un test vérifie que la chaîne « no change » n'existe nulle part.
- Un test vérifie que les sources Pending n'apparaissent pas comme Available.

### G.5 Audit de sécurité adapté (site statique, sans comptes)
1. Aucun secret (grep des motifs de clé dans tout l'historique Git).
2. RLS : sans objet, aucune base. Écrire pourquoi.
3. IDOR : sans objet, aucun compte. Les paramètres d'URL `zone`, `var` et `period` sont validés contre une **liste blanche** ; une valeur inconnue renvoie un état vide.
4. Admin : aucune route.
5. Formulaires : aucun.
6. Webhooks : aucun.
7. `npm audit` (0 faille haute), versions figées par le lockfile, HTTPS (Pages), **CSP en `<meta>`** (default-src 'self' ; img-src 'self' tuiles OSM ; connect-src 'self'), `rel="noopener noreferrer"` sur les liens externes, aucune redirection ouverte, messages d'erreur sans pile, données affichées échappées (React).

Chaque point doit avoir une **preuve** (commande + sortie), sans quoi il est marqué « non vérifié ».

## H. Checklist des petites erreurs (v1 + ajouts v2)

Reprise de la v1 :
- base Vite + BASE_URL ;
- HashRouter ;
- tester le build ;
- i18n complète ;
- format des nombres et unités ;
- axes, titres et légendes des graphiques ;
- attribution de la carte ;
- verdict jamais par la couleur seule ;
- favicon, titre et og ;
- responsive à 375 / 768 / 1440 ;
- console propre ;
- liens morts ;
- polices locales et aucun analytics ;
- poids de results.json (gzip ~70 Ko) ;
- github.io bloqué au Cameroun → prévoir un miroir ;
- ne rien supprimer ;
- captures avant « fini » ;
- crédits ;
- version et date des données ;
- vocabulaire « associated with », pas « caused by ».

Ajouts v2 :
- « Not enough evidence yet », jamais « no change ».
- Ne jamais confondre air (T2M*) et surface (TS).
- Pas de bande d'IC autour des points.
- Yaoundé en marqueur creux avec l'étiquette « outside the hydrological basin ».
- Bandeau « Exploratory ».
- Les sources Pending ne sont jamais présentées comme disponibles.
- Unités de pente complètes (« mm per decade (annual total) »).
- p très petit → « < 0.001 » ; null → « n/a ».
- Les chiffres des maquettes IA ne sont jamais recopiés : seul results.json fait foi.

## I. Installer les skills et lancer Claude Code (inchangé)
1. Télécharger `Skills IA v4.zip` depuis le Drive `claude-code/`.
2. Copier les 5 dossiers de `skills\` dans `C:\Users\<toi>\.claude\skills\`.
3. Mettre `CLAUDE.v2-complement.md` à la racine du dépôt.
4. Copier les données (G.2).
5. Mettre les maquettes dans `docs/maquettes/`.
6. Dans le dossier du projet : `git pull`, puis `claude`.
7. Demander « Quels skills as-tu ? » : les 5 doivent être cités.
8. Coller `PROMPT_MAITRE_V1_v2.md` → plan → OK → code sur `feat/v1`.
9. Audit adapté (G.5), tests, captures.
10. Pull request, puis déploiement Pages, puis test en 4G.

## J. Décisions (à reporter dans DECISIONS.md)
1. **Périmètre :** 11 lieux sélectionnés dans la région du Bassin du Congo. Yaoundé est un cas local hors du bassin hydrographique, affichée comme telle partout.
2. **V1** = Home + Investigate (4 étapes) + Method + About. Compare complet, Explore, quartiers MODIS, GIBS, visites et PWA → V2.
3. **Aucun calcul statistique dans le navigateur en V1.** results.json est la seule source de vérité.
4. **RM2 conservée** + `evidence_level` (HR + FDR) affiché. Résultats déclarés exploratoires.
5. **Conseils métier** = questions en 4 blocs, jamais des prescriptions.
6. **Anglais par défaut**, FR en bascule.
7. **Stack :** Vite, React, TS, Recharts, Leaflet, avec les polices @fontsource.

---


## Annexe 1 — CLAUDE.v2-complement.md

### CLAUDE.v2-complement.md — règles V1 (version 2, après revue critique). Remplace CLAUDE.v1-complement.md.

#### Produit (V1 resserrée)
- Écrans V1 uniquement : Home (DISCOVER) · Investigate (Place → Clues → Evidence → Verdict & Act) · Method, data, limits & next steps · About & Credits · 404. Tout le reste = V2 (Compare complet, Explore anywhere, quartiers MODIS, GIBS, visites guidées, PWA). Ne pas les coder sans OK.
- Sous-titre partout : « A comparison of selected locations across the Congo Basin region ». 11 lieux ≠ moyenne du bassin.
- Yaoundé : marqueur CREUX + « outside the Congo hydrological basin (~63 km) » sur carte, textes, métadonnées (champ in_hydrobasins_congo du geojson).

#### Science (ne jamais inventer ni recalculer)
- Source unique : public/data/results.json (schéma 2.1, produit par scripts/build_results.py). AUCUN calcul statistique en TypeScript en V1.
- Afficher séparément p_mk (test principal), p_smk (cohérence mois par mois, anti-conservateur), p_hr (Hamed-Rao, corrige l'autocorrélation — contrôle de robustesse, PAS validation indépendante, afficher hr_vs_mk), q_bh (FDR Benjamini-Hochberg, info).
- Verdict RM2 = significatif ; evidence_level = robust / exploratory / not_enough_evidence_yet. Non significatif → « Not enough evidence yet » ; la chaîne « no change » est interdite.
- Bandeau « Exploratory results — uncorrected p-values (FDR q shown) ».
- IC de Sen : en chiffres seulement (Gilbert 1987, non corrigé de l'autocorrélation). JAMAIS de bande autour des valeurs annuelles.
- Air (T2M, T2M_MAX, T2M_MIN) ≠ surface (TS « skin temperature, model »). Unités = slope_unit (ex. « mm per decade (annual total) »).
- Sources avec statut visible (meta.sources[].status) : available / pending / reference_layer. Rien de pending présenté comme disponible.
- Écrire « reproduced », jamais « validated ». KNMI, MODIS, GPM = « Next steps ».
- Textes imposés pour p (Analysis : « The p-value measures how compatible the observed data are with the assumption of no monotonic trend. A value below 0.05 is commonly considered statistically significant. » ; Discover : « A small p-value means the observed trend would be unusual if there were no underlying trend. »).

#### Rigueur des calculs — RÈGLES STRICTES (bloquantes)
1. **Tu ne crées aucune formule.** Les seules formules autorisées sont celles de la section « 0 bis. Méthodes et formules de référence » du document v2 :
   - Mann 1945 / Kendall 1975 ;
   - Hirsch et al. 1982 ;
   - Hamed & Rao 1998 ;
   - Sen 1968 et son IC selon Gilbert 1987 ;
   - Benjamini & Hochberg 1995 ;
   - les agrégations pondérées par les jours.
   Si une formule te semble manquer, tu t'arrêtes et tu demandes.
2. **Aucun recalcul statistique côté client.** L'application **affiche** results.json et ne fait rien d'autre. Sont interdits en TS/JS :
   - le calcul de p, S, Var(S), Z ;
   - le calcul de la pente de Sen, de son IC ou de q ;
   - le calcul de la moyenne annuelle ou du cumul de pluie.
   Seuls calculs permis :
   - le formatage des nombres ;
   - la droite de Sen tracée par y = intercept + (pente_decennie/10)·(année − première année).
3. **Si tu touches un calcul** (script Python ou futur portage), procède ainsi :
   - Reproduis d'abord `data/results/reference_fixtures.json`, issu de pymannkendall 1.4.3. Valeurs attendues : S, var_s, z, p_mk, tau, pente, intercept, IC, p_hr, var_s_hr, q_bh. Tolérance absolue : **1e-6**.
   - Relance ensuite `python data/validate.py nasa_power results/results.json .`. Il doit afficher 0 désaccord sur RM2 et sur evidence_level.
   - Sans ces deux preuves, n'ouvre aucune PR.
4. **Tests unitaires obligatoires sur les unités et conversions** (Vitest pour l'affichage, pytest pour le script) :
   - pente/an × 10 = pente/décennie ;
   - mm/jour × jours réels du mois = mm/mois (février 28 ou 29 jours) ;
   - cumul annuel en mm ;
   - moyenne annuelle pondérée par les jours ;
   - slope_unit affichée = slope_unit de results.json ;
   - « < 0.001 » si p < 0,001, et « n/a » si null ;
   - aucune confusion °C air / °C surface ;
   - humidité relative en points de % (et non en %).
5. **Toute formule affichée cite sa source** (auteur, année, revue, DOI), dans l'onglet Scientific et sur la page Method. Une formule sans source ne s'affiche pas.
6. **Arrondis :**
   - p à 3 chiffres significatifs ;
   - pentes à 2 ou 3 décimales selon la variable ;
   - ne jamais arrondir **avant** de comparer un p à 0,05 (utiliser `significatif`, `evidence_level` et `fdr_significant` tels que fournis).

#### Interprétation métier (rules.json v2)
- Carte en 4 blocs : 1 Observed (template rempli avec les chiffres réels) · 2 Why it matters · 3 Questions to explore (questions, jamais des solutions) · 4 What you'd need before acting. Avertissement permanent. Changer de profil ne change jamais les chiffres.

#### Technique
- Vite + React + TS + Recharts + react-leaflet ; HashRouter ; base '/zeros-team-earth-trend-detective/' ; fetch via import.meta.env.BASE_URL. i18n en.json (défaut) + fr.json. @fontsource (Inter, Space Grotesk, JetBrains Mono). Aucun tracking/cookie ; localStorage = langue + profil.
- Compact ≤640 px (bottom nav 3 onglets) / complet ≥1024 px.
- Maquettes IA = direction artistique seulement ; les chiffres viennent de results.json.

#### Sécurité (site statique) — chaque point avec preuve
Pas de secret (grep historique) ; RLS/IDOR/admin/formulaires/webhooks sans objet (le justifier) ; paramètres d'URL zone/var/period en liste blanche ; npm audit 0 haute ; CSP <meta> ; rel="noopener noreferrer" ; pas de redirection ouverte ; erreurs sans détails internes.

#### Livraison
Branche feat/v1 → PR. npm run build + npm test + captures 375/1440 avant « fini ». README (EN), CREDITS.md, DECISIONS.md, PROJET.md à jour. Rien supprimé sans accord.

## Annexe 2 — PROMPT MAÎTRE V1 (v2)

### PROMPT MAÎTRE V1 — version 2 (après revue critique). Remplace PROMPT_MAITRE_V1.md.

Lis PROJET.md, AGENTS.md, CLAUDE.md et CLAUDE.v2-complement.md. Utilise les skills writing-plans (plan d'abord), frontend-design, verification-before-completion, webapp-testing.

#### Mission
Construis la V1 de « Trend Detective — Congo Basin » (sous-titre : « A comparison of selected locations across the Congo Basin region »), web app statique en anglais avec bascule FR, pour NASA Space Apps 2026 (« Be An Earth System Trend Detective! »). Donne D'ABORD un plan de 15 lignes max (fichiers, étapes, tests) et attends mon OK. Puis code sur la branche feat/v1. Ne code AUCUNE fonction V2.

#### Données (lecture seule, ne rien recalculer, ne rien inventer)
- public/data/results.json (schéma 2.1) : 11 zones × 9 variables × 2 périodes. Par analyse : zone_id, variable_id, period_id, period, n_years, unit, slope_unit, source_id, serie_annuelle[{annee,valeur}], serie_mensuelle_moyenne[12], pente_decennie, pente_decennie_ic95[2], intercept, variation_totale, p_mk, p_smk, p_hr, q_bh, hr_vs_mk, direction, significatif, fdr_significant, evidence_level, verdict_key, warnings[]. meta : scope_en/fr, method, sources[] (status available/pending/reference_layer), excluded_variables, qa_checks. variables[] (name.en/fr, unit, slope_unit, source_id).
- public/data/rules.json v2 : profiles[], groups{}, cards[] (why, questions, needed en/fr), level1_template, disclaimer, fallback.
- public/data/zones/congo_basin_boundary.geojson, congo_basin_points.geojson (in_hydrobasins_congo, distance_to_basin_km).
- public/data/csv/results_annual.csv, results_summary.csv.
- data/results/reference_fixtures.json (tests de référence) et data/validation_report.md (vérification indépendante) : à copier dans le dépôt sous data/, hors public/.
- Droite de Sen : y = intercept + (pente_decennie/10) × (année − première année).

#### Rigueur des calculs (bloquant — détail dans CLAUDE.v2-complement.md)
- Tu ne crées aucune formule. Tu ne recalcules aucune statistique côté client : tu affiches results.json (schéma 2.1).
- Si tu modifies un calcul, tu reproduis d'abord `data/results/reference_fixtures.json` (valeurs pymannkendall 1.4.3, tolérance 1e-6), puis tu relances `data/validate.py`. Les deux preuves vont dans la PR.
- Tests unitaires obligatoires sur :
  - les unités et conversions : ×10 par décennie ; mm/jour × jours réels ; février 28 ou 29 jours ; moyenne pondérée ;
  - les libellés d'unité ;
  - le formatage des p (« < 0.001 », « n/a »).
- Toute formule affichée (onglet Scientific, page Method) cite sa source : auteurs, année, revue, DOI, tels que listés dans la section « 0 bis » du document v2.

#### Écrans V1 (HashRouter) — détails : document « Feuille de route v2 », section C
1. #/ Home : hero (question « What can satellite data really tell us about change across the Congo Basin? » + sous-titre), 3 questions-cartes (deep links : Yaoundé t2m_max ; Yaoundé rh2m ; Yaoundé precip = exemple non significatif), carte du bassin (points colorés par evidence_level, Yaoundé creux + « outside the hydrological basin »), tableau « All locations for this variable », bandeau Exploratory, bandeau statut des sources.
2. #/investigate?zone=&var=&period= : stepper Place → Clues → Evidence (couches comprendre / vérifier / approfondir, onglets Discover/Analysis/Scientific, tableau des 3 tests avec leur rôle, q_bh, cycle saisonnier, source, CSV, 5 étapes Acker, bandeau Yaoundé « city-scale grid cell ~55×70 km; neighbourhood data pending ») → Verdict & Act (verdict, puces de profil, carte métier 4 blocs, « What we can't say », avertissement).
3. #/method : méthode, tests et rôles, RM2 et sa justification, evidence_level, FDR, Sen/IC, sources avec statut, variable exclue (GWETTOP), limites, « Reproduce · Compare · Validate » (seul « reproduced » est fait), next steps, déclaration IA, téléchargements.
4. #/about : équipe, crédits, licences, « No tracking · No cookies · No personal data ». 5. 404.
Pied de page partout (sources, OSM, HydroSHEDS, MIT, version + date des données).

#### Règles d'affichage scientifiques (bloquantes)
- p : « < 0.001 » si < 0.001 ; null → « n/a ». Afficher p_mk, p_smk, p_hr séparément avec leur rôle ; q_bh en info.
- Badge : robust (plein + ▲/▼), exploratory (atténué + pointillé + « exploratory »), not_enough_evidence_yet (gris ≈ « Not enough evidence yet » + « This does not mean there is no change. »). Jamais la couleur seule. Chaîne « no change » interdite.
- IC en texte uniquement ; aucune bande d'incertitude dans le graphique.
- Air ≠ surface dans tous les libellés. slope_unit toujours affichée.
- Sources pending jamais présentées comme disponibles. « reproduced », jamais « validated ».
- Textes p imposés (CLAUDE.v2-complement.md).

#### Produit / technique
Anglais par défaut + FR complet (mêmes clés) ; nombres localisés. Compact ≤640 px (bottom nav 3 onglets, bottom sheet carte) / complet ≥1024 px. AA, focus visible, alt text généré pour chaque graphique, aria-live sur le verdict, reduced-motion. Leaflet + tuiles OSM avec attribution, fix icônes Vite. @fontsource, aucun appel tiers hors tuiles OSM. Favicon, title, meta, og:image. Paramètres d'URL validés contre une liste blanche. CSP en <meta>. Pas de PWA (manifeste + icônes seulement). Workflow GitHub Pages ; vite base '/zeros-team-earth-trend-detective/' ; fetch via BASE_URL. README (EN) jurés + lien de secours.

#### Critères d'acceptation (tous vrais avant « fini »)
1. npm ci && npm run build && npm test OK ; npm run preview sans 404 (results.json, rules.json, geojson, csv).
2. Parcours Home → « Are afternoons getting hotter in Yaoundé? » → Evidence affiche exactement : +0.78 °C per decade (95% range 0.45 to 1.30), p_mk 0.00014, p_smk < 0.001, p_hr 0.0048 (confirms), q_bh 0.0070, « Robust » → Verdict : Architect puis Farmer = questions différentes, chiffres identiques.
3. Yaoundé precip 2001–2025 : badge gris « Not enough evidence yet », p_mk 0.097, −119 mm per decade (annual total).
4. Bangui t2m_max 2001–2025 : badge « exploratory » (HR ne confirme pas, FDR non passé).
5. Yaoundé : marqueur creux + étiquette « outside the hydrological basin » sur Home et Place (test Vitest + capture).
6. Tests Vitest : valeurs affichées = results.json ; unités et conversions (×10, mm/jour × jours, février 28/29, pondération par les jours) ; formatage des p ; présence d'une source sur chaque formule affichée ; clés EN = FR ; absence de « no change » ; aucune source pending affichée « Available » ; liste blanche des paramètres d'URL.
7. Captures 375 px et 1440 px de chaque écran dans docs/captures/ ; console sans erreur.
8. Lighthouse mobile : Accessibility ≥ 90, Performance ≥ 85.
9. Onglet Réseau : aucune requête vers Google Fonts / analytics.
10. Audit sécurité adapté (CLAUDE.v2-complement.md) avec preuve par point ; npm audit 0 haute.
11. PROJET.md, DECISIONS.md, CREDITS.md à jour ; rien supprimé.
Dis clairement ce qui n'a pas pu être testé.
