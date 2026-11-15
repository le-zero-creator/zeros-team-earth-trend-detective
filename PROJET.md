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

## État actuel (15/11, images et mouvement)
- Chaque grand écran a une photo large aux coins arrondis : questions du récit, étapes d'enquête, profils, globe, méthode, à propos, Ask Terra.
- Photos NASA domaine public (bibliothèque images.nasa.gov) plus les trois images IA déjà filigranées. Crédits dans CREDITS.md.
- Le globe d'accueil tourne avec trois anneaux et de petits satellites, dont un en sens inverse. Les photos glissent un peu au défilement. Un filet réaffiche le texte au bout de 1,3 s. Le mouvement réduit reste immobile.
- La bulle de Terra disparaît toute seule au bout de 5 s, une fois par page. « Ouvrir Yaoundé » est un bouton, en français sur la page française. Le croquis orange des immeubles est retiré.

## État actuel (15/11, toutes les largeurs)
- L'accueil tient dans la fenêtre de 360 à 1920 px, et sur un portable bas (1366×768). Le premier écran fait exactement la hauteur sous la barre. Le bouton « Open the globe », le crédit de la photo et Terra restent visibles. Pas de défilement horizontal.
- Le panneau Ask Terra reste dans la fenêtre, y compris à 1440. Sur téléphone il ne couvre pas le titre. Les puces de variable de l'écran Preuves sont lisibles (texte foncé sur fond clair).
- Typographie et espacements fluides (`clamp`). La bande « Et pour toi ? » et le graphique utilisent des container queries.
- Vérifié ici : `npm test` 39/39. Grilles de captures : accueil et Preuves, neuf largeurs. Le site publié n'a pas encore ce correctif tant que la PR n'est pas mergée.

## État précédent (15/11, accueil grand public + preuves)
- Branche : `feat/home-grand-public` (à partir de `feature/v1-explorer`). Pull request vers `main`. Pas de merge.
- Accueil : question, chiffre géant (T2M_MAX Yaoundé), trois cartes, globe (le bassin en vert), recherche mondiale, indices bientôt / en attente, métiers, tableau des 11 lieux.
- Enquête : Lieu → Indices → Preuves → Pour vous. Le lien direct ouvre les Preuves. Graphique annuel, droite de Sen, IC en chiffres, trois tests, q, niveau de preuve, 5 étapes Acker, comparaison des 11 lieux, deux périodes.
- Méthode, À propos, Comparer (monde = bientôt), 404.
- Vérifié ici : `npm test` 30/30 · `npm run build` OK · `npm audit` 0 · captures dans `docs/captures/` · console sans erreur · hôtes : le site et `tile.openstreetmap.org`.
- Pages GitHub : le workflow est dans le dépôt et part de `main`. L'URL publique n'est pas encore en ligne tant que la PR n'est pas mergée et que Pages n'est pas réglé sur « GitHub Actions ». Les étapes sont dans le README.
- **Non vérifié dans cette session** : `python data/validate.py` (le script relance tous les calculs et un Monte-Carlo ; il n'a pas été exécuté jusqu'au bout ici). Lighthouse.
- 15/11, correctif site en ligne : la courbe était cachée par l'animation de tracé de Recharts ; le grand chiffre affiche tout de suite +0,78 (température max de l'après-midi) ; le slogan dit « questions », pas « décisions ». Branche `fix/live-site`.
- 15/11, site public : https://trend-detective-congo.vercel.app . Filigrane sur les trois images IA, section « Use of AI », Ask Terra répond en production avec les pentes publiées (+0,78 °C / décennie et +0,50 °C / décennie pour la chaleur de l'après-midi à Yaoundé). Pas de logo NASA.

## Questions ouvertes
- Format des valeurs p : la règle écrite dit « < 0.001 » sous 0,001 et 3 chiffres significatifs ; les critères d'acceptation montrent « 0.00014 », « 0.0048 », « 0.097 » (2 chiffres). La règle écrite est appliquée pour l'instant.
- slope_unit reste en anglais en mode FR (règle : afficher slope_unit tel que dans results.json).

## Commandes utiles
- npm run build · npm test · npm run preview -- --port 4174 --strictPort
- Captures : CAPTURE_BASE=http://localhost:4174/zeros-team-earth-trend-detective/ node scripts/capture.mjs home=/   (sous Git Bash, préfixer par MSYS_NO_PATHCONV=1)
- Un ancien serveur du 14/11 occupe parfois le port 4173 : utiliser 4174.

## Prochaine étape
- Ludovic : relire les phrases, merger la PR, activer GitHub Pages (README, section GitHub Pages), puis partager l'URL.
