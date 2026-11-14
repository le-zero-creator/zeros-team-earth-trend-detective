# PROJET.md — mémoire du projet (à lire en premier, à mettre à jour après chaque tâche)

## Projet en 3 lignes
Appli web « Earth Trend Detective » de Zero's team (NASA Space Apps 2026, Yaoundé).
Elle détecte une tendance réelle à Yaoundé / au Cameroun (chaleur urbaine, perte de verdure ou pluies) à partir de données NASA,
teste si elle est significative, puis la traduit en recommandations d'architecte.

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
- 14/11 : défi thème 2 confirmé. Angle Yaoundé + recommandations d'architecte.

## État actuel
- Dépôt créé (README, licence, règles). Aucun code encore.

## Prochaine étape
- Proposer l'architecture de la V1 en 10 lignes (pages, librairies, source des données, calcul Mann-Kendall), puis attendre l'OK avant de coder.
