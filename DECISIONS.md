# DECISIONS.md

- 14/11/2026 : défi « Be An Earth System Trend Detective! », angle Yaoundé + lecture métier (architecte).
- 15/11/2026 : **V1 = « Trend Detective — Congo Basin »** : 11 lieux × 9 variables × 2 périodes, NASA POWER seulement (MERRA-2 + CERES). MODIS, GPM, KNMI = « Next steps » (V2).
- 15/11/2026 : écrans V1 = Home · Investigate (Place → Clues → Evidence → Verdict & Act) · Method · About · 404.
- 15/11/2026 : **aucun calcul statistique dans le navigateur.** Tout est précalculé par `scripts/build_results.py` (pymannkendall 1.4.3) dans `public/data/results.json` (schéma 2.1). L'appli affiche ce fichier.
- 15/11/2026 : verdict = règle RM2 (p_mk < 0,05 ET p_smk < 0,05) ; niveau de preuve = robust / exploratory / not_enough_evidence_yet. Jamais la chaîne « no change ».
- 15/11/2026 : technique = Vite + React + TypeScript + Recharts + react-leaflet, HashRouter, site statique sur GitHub Pages (base `/zeros-team-earth-trend-detective/`). Anglais par défaut + français.
- 15/11/2026 : design = bleu nuit #0F233C, orange #E85D04, bleu pluie #2B6CB0, gris #64748B ; polices Space Grotesk, Inter, JetBrains Mono (auto-hébergées via @fontsource).
- 15/11/2026 : le prototype du 14/11 (CSV d'exemple « MODIS/GPM », Mann-Kendall côté client, polices DM Sans + Fraunces) est remplacé. Il reste consultable sur la branche locale `archive/prototype-2026-11-14`. Raison : ses CSV étaient des séries d'exemple, pas de vraies données NASA.
- 15/11/2026 : le premier écran fonctionnel (Home) sert de maquette, à valider par Ludovic avant les autres écrans.
