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
- 15/11/2026 : **accueil grand public, analyse complète à un clic.** L'accueil pose une question et trois cartes (chaleur, air, pluie). L'écran Preuves montre, pour chaque lieu / variable / période de `results.json`, la série annuelle, la droite de Sen (formule autorisée), l'intervalle à 95 % **en chiffres seulement** (pas de bande), p_mk, p_smk, p_hr, q_bh et le niveau de preuve. Les 11 lieux se comparent dans le tableau.
- 15/11/2026 : couleurs d'accueil passées au vert forêt et à l'orange soleil, pour une lecture grand public. Les polices restent Space Grotesk, Inter et JetBrains Mono, auto-hébergées. Le bleu nuit de la première maquette n'est plus la couleur de page.
- 15/11/2026 : humidité relative affichée par le formateur existant (2 décimales) : −1,63 point de pourcentage par décennie, à partir de −1,627 dans `results.json`. On n'écrit pas −1,6 à la place.
- 15/11/2026 : la pluie de Yaoundé n'est pas présentée comme une baisse établie sur l'accueil (carte « pas encore sûr »). Sur l'écran Preuves, la pente publiée est montrée avec le badge « Pas encore assez de preuves ».
- 15/11/2026 : Yaoundé est dans la région forestière du Bassin du Congo (COMIFAC) et hors du bassin hydrographique (~63 km, champ `distance_to_basin_km`). Marqueur creux conservé.
- 15/11/2026 : questions d'humidité (`rh2m`) pour agriculteur, architecte, santé et ville, et questions supplémentaires quand le test ne conclut pas : rédigées pour cette version parce que `rules.json` n'a pas de carte pour ces cas. Ce sont des questions, pas des consignes. Les autres combinaisons viennent de `rules.json`.
- 15/11/2026 : le globe, la recherche « n'importe où », NDVI, LST satellite, GPM, perte de forêt et la comparaison mondiale sont visibles et marqués Bientôt / En attente. Aucun chiffre inventé. Seuls les 11 lieux et les 9 variables de `results.json` sont calculés (déjà) et affichés.
- 15/11/2026 : le slogan dit « questions », pas « décisions » : « Context is data. We turn NASA trends into questions for every field. »
- 15/11/2026 : le grand chiffre de l'accueil est la température maximale de l'après-midi, affichée tout de suite à la valeur publiée (pas de compteur intermédiaire). La courbe de Recharts n'est pas animée : l'animation de tracé cachait la ligne sur le site publié.
