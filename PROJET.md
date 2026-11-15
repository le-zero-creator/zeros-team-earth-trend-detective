# PROJET.md — mémoire du projet (à lire en premier, à mettre à jour après chaque tâche)

## Projet en 3 lignes
Appli web « Trend Detective — Congo Basin » de Zero's team (NASA Space Apps 2026, Yaoundé).
Elle compare 11 lieux de la région du Bassin du Congo (dont Yaoundé, étude de cas locale) sur 9 variables NASA POWER et 2 périodes,
affiche si la tendance est significative (Mann-Kendall), puis propose des questions à explorer selon le métier (architecte, etc.).

## Défi choisi
« Be An Earth System Trend Detective! » — https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/
Soumission avant le 15 novembre 2026 à 23 h 59 (UTC+1).

L'auteur du défi (Dr James Acker, NASA Goddard) attend une appli qui permet de :
1. choisir une ou plusieurs variables (pluie, température de surface, végétation NDVI, humidité du sol…) ;
2. choisir une région (quartier, ville ou monde) ;
3. choisir une période ;
4. tracer la série temporelle et l'examiner ;
5. tester si la tendance est significative (valeur p < 0,05, test de Mann-Kendall).
Conseils : une seule donnée suffit ; préférer des données mensuelles ou hebdomadaires ; une tendance saisonnière est possible.

## Données (NASA d'abord)
Giovanni, AppEEARS (MODIS LST, NDVI, Landsat), Hydrology Time Series (GPM, GLDAS), KNMI Climate Explorer.
Compte Earthdata gratuit. Toujours citer les sources dans l'appli.

## Emplacement local
Sur le PC de Ludovic : D:\NASA Space Apps Challenge 2026\zeros-team-earth-trend-detective (clone du dépôt). Tous les fichiers du projet (données, exports, captures) restent dans D:\NASA Space Apps Challenge 2026, jamais ailleurs.

## Format
Appli web simple et rapide, FR + EN. Carte + courbe + résultat du test + recommandations d'aménagement.

## Règles de travail
- Lire PROJET.md, AGENTS.md et CLAUDE.md avant de commencer.
- V1 minimale qui marche d'abord. Ne changer que ce qui est demandé. Ne jamais supprimer une fonction sans accord.
- Dépôt PUBLIC, licence MIT. Une branche par fonction, commits courts.
- Tester et vérifier le vrai résultat avec captures avant de dire « fini ».
- Sécurité : aucune clé côté client ni dans le dépôt (.env ignoré, .env.example fourni). Pas de pistage. Polices hébergées localement. Pied de page Crédits.
- Expliquer simplement les termes techniques. Réponses courtes, économie de tokens.

## Décisions
Voir DECISIONS.md (liste complète). Les règles détaillées sont dans CLAUDE.md et docs/claude/PROMPT_MAITRE.md.
- 14/11 : défi thème 2 confirmé. Angle Yaoundé + lecture métier d'architecte.
- 15/11 : V1 = NASA POWER seulement, tout précalculé dans public/data/results.json ; aucun calcul statistique dans le navigateur.

## État actuel (15/11, après la tâche « Home »)
- Branche de travail : feature/v1-explorer (commits locaux, **rien n'est poussé sur GitHub**).
- Socle en place : Vite 7 + React 18 + TypeScript, React Router 7 (HashRouter), react-leaflet, i18n EN/FR, polices auto-hébergées, CSP au build, workflow GitHub Pages (.github/workflows/pages.yml).
- **Écran Home fait** (sert de maquette, en attente de validation par Ludovic) : hero, 3 questions, carte du bassin, tableau « All locations », bandeau exploratoire, bandeau des sources.
- Investigate, Method, About : pas encore faits (écran provisoire « This screen is next »). 404 : fait.
- Vérifié : npm run build OK · npm test 20/20 · npm audit 0 faille · captures docs/captures/home-375.png et home-1440.png · console sans erreur · seuls hôtes contactés : le site et tile.openstreetmap.org.
- **Non vérifié** : python data/validate.py (Python n'est pas installé sur ce PC) ; Lighthouse.
- L'ancien prototype du 14/11 est conservé sur la branche locale archive/prototype-2026-11-14.

## Questions ouvertes
- Format des valeurs p : la règle écrite dit « < 0.001 » sous 0,001 et 3 chiffres significatifs ; les critères d'acceptation montrent « 0.00014 », « 0.0048 », « 0.097 » (2 chiffres). La règle écrite est appliquée pour l'instant.
- slope_unit reste en anglais en mode FR (règle : afficher slope_unit tel que dans results.json).

## Commandes utiles
- npm run build · npm test · npm run preview -- --port 4174 --strictPort
- Captures : CAPTURE_BASE=http://localhost:4174/zeros-team-earth-trend-detective/ node scripts/capture.mjs home=/   (sous Git Bash, préfixer par MSYS_NO_PATHCONV=1)
- Un ancien serveur du 14/11 occupe parfois le port 4173 : utiliser 4174.

## Prochaine étape
- Après validation de Home : Investigate (Place → Clues → Evidence → Verdict & Act), puis Method, About, README (EN) pour les jurés, audit de sécurité, PR vers main.
