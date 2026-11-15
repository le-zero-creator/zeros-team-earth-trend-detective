> **Point de départ (Ludovic) :** toutes les données sont DÉJÀ dans ce dépôt, il n'y a rien à télécharger pour la V1. Données de l'appli : `public/data/` ; séries NASA POWER brutes : `data/raw/` ; tests de référence : `data/results/reference_fixtures.json` ; vérification : `data/validate.py`. Les maquettes UI sont dans `docs/maquettes/` (s'il y en a, respecte-les). La feuille de route complète est dans `docs/claude/FEUILLE_DE_ROUTE_v2.1.md`. Les skills sont dans `.claude/skills/`. L'API NASA POWER est publique, sans clé ; elle n'est pas nécessaire pour la V1 (tout est précalculé). Si quelque chose manque vraiment, arrête-toi et dis précisément quoi, au lieu d'inventer.

# PROMPT MAÎTRE V1 — version 2 (après revue critique). Remplace PROMPT_MAITRE_V1.md.

Lis PROJET.md, AGENTS.md, CLAUDE.md et CLAUDE.v2-complement.md. Utilise les skills writing-plans (plan d'abord), frontend-design, verification-before-completion, webapp-testing.

## Mission
Construis la V1 de « Trend Detective — Congo Basin » (sous-titre : « A comparison of selected locations across the Congo Basin region »), web app statique en anglais avec bascule FR, pour NASA Space Apps 2026 (« Be An Earth System Trend Detective! »). Donne D'ABORD un plan de 15 lignes max (fichiers, étapes, tests) et attends mon OK. Puis code sur la branche feat/v1. Ne code AUCUNE fonction V2.

## Données (lecture seule, ne rien recalculer, ne rien inventer)
- public/data/results.json (schéma 2.1) : 11 zones × 9 variables × 2 périodes. Par analyse : zone_id, variable_id, period_id, period, n_years, unit, slope_unit, source_id, serie_annuelle[{annee,valeur}], serie_mensuelle_moyenne[12], pente_decennie, pente_decennie_ic95[2], intercept, variation_totale, p_mk, p_smk, p_hr, q_bh, hr_vs_mk, direction, significatif, fdr_significant, evidence_level, verdict_key, warnings[]. meta : scope_en/fr, method, sources[] (status available/pending/reference_layer), excluded_variables, qa_checks. variables[] (name.en/fr, unit, slope_unit, source_id).
- public/data/rules.json v2 : profiles[], groups{}, cards[] (why, questions, needed en/fr), level1_template, disclaimer, fallback.
- public/data/zones/congo_basin_boundary.geojson, congo_basin_points.geojson (in_hydrobasins_congo, distance_to_basin_km).
- public/data/csv/results_annual.csv, results_summary.csv.
- data/results/reference_fixtures.json (tests de référence) et data/validation_report.md (vérification indépendante) : à copier dans le dépôt sous data/, hors public/.
- Droite de Sen : y = intercept + (pente_decennie/10) × (année − première année).

## Rigueur des calculs (bloquant — détail dans CLAUDE.v2-complement.md)
- Tu ne crées aucune formule. Tu ne recalcules aucune statistique côté client : tu affiches results.json (schéma 2.1).
- Si tu modifies un calcul, tu reproduis d'abord `data/results/reference_fixtures.json` (valeurs pymannkendall 1.4.3, tolérance 1e-6), puis tu relances `data/validate.py`. Les deux preuves vont dans la PR.
- Tests unitaires obligatoires sur :
  - les unités et conversions : ×10 par décennie ; mm/jour × jours réels ; février 28 ou 29 jours ; moyenne pondérée ;
  - les libellés d'unité ;
  - le formatage des p (« < 0.001 », « n/a »).
- Toute formule affichée (onglet Scientific, page Method) cite sa source : auteurs, année, revue, DOI, tels que listés dans la section « 0 bis » du document v2.

## Écrans V1 (HashRouter) — détails : document « Feuille de route v2 », section C
1. #/ Home : hero (question « What can satellite data really tell us about change across the Congo Basin? » + sous-titre), 3 questions-cartes (deep links : Yaoundé t2m_max ; Yaoundé rh2m ; Yaoundé precip = exemple non significatif), carte du bassin (points colorés par evidence_level, Yaoundé creux + « outside the hydrological basin »), tableau « All locations for this variable », bandeau Exploratory, bandeau statut des sources.
2. #/investigate?zone=&var=&period= : stepper Place → Clues → Evidence (couches comprendre / vérifier / approfondir, onglets Discover/Analysis/Scientific, tableau des 3 tests avec leur rôle, q_bh, cycle saisonnier, source, CSV, 5 étapes Acker, bandeau Yaoundé « city-scale grid cell ~55×70 km; neighbourhood data pending ») → Verdict & Act (verdict, puces de profil, carte métier 4 blocs, « What we can't say », avertissement).
3. #/method : méthode, tests et rôles, RM2 et sa justification, evidence_level, FDR, Sen/IC, sources avec statut, variable exclue (GWETTOP), limites, « Reproduce · Compare · Validate » (seul « reproduced » est fait), next steps, déclaration IA, téléchargements.
4. #/about : équipe, crédits, licences, « No tracking · No cookies · No personal data ». 5. 404.
Pied de page partout (sources, OSM, HydroSHEDS, MIT, version + date des données).

## Règles d'affichage scientifiques (bloquantes)
- p : « < 0.001 » si < 0.001 ; null → « n/a ». Afficher p_mk, p_smk, p_hr séparément avec leur rôle ; q_bh en info.
- Badge : robust (plein + ▲/▼), exploratory (atténué + pointillé + « exploratory »), not_enough_evidence_yet (gris ≈ « Not enough evidence yet » + « This does not mean there is no change. »). Jamais la couleur seule. Chaîne « no change » interdite.
- IC en texte uniquement ; aucune bande d'incertitude dans le graphique.
- Air ≠ surface dans tous les libellés. slope_unit toujours affichée.
- Sources pending jamais présentées comme disponibles. « reproduced », jamais « validated ».
- Textes p imposés (CLAUDE.v2-complement.md).

## Produit / technique
Anglais par défaut + FR complet (mêmes clés) ; nombres localisés. Compact ≤640 px (bottom nav 3 onglets, bottom sheet carte) / complet ≥1024 px. AA, focus visible, alt text généré pour chaque graphique, aria-live sur le verdict, reduced-motion. Leaflet + tuiles OSM avec attribution, fix icônes Vite. @fontsource, aucun appel tiers hors tuiles OSM. Favicon, title, meta, og:image. Paramètres d'URL validés contre une liste blanche. CSP en <meta>. Pas de PWA (manifeste + icônes seulement). Workflow GitHub Pages ; vite base '/zeros-team-earth-trend-detective/' ; fetch via BASE_URL. README (EN) jurés + lien de secours.

## Critères d'acceptation (tous vrais avant « fini »)
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
