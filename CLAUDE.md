# AGENTS.md — Zero's team, NASA Space Apps 2026

## Contexte
Équipe : Ludovic (architecte, chef, ne code pas), France (back-end), Alain (web/Java/Git), Noël (design), Kevin.
Public visé : jurés NASA Space Apps. Dépôt public. Langue de l'interface : français, avec l'essentiel aussi en anglais pour les jurés.
Expliquer chaque mot technique en une phrase simple. Proposer une voie, ne pas poser dix questions.

## Version 1
- Comprendre l'idée avant d'écrire du code.
- V1 minimale uniquement. Le reste va dans AMELIORATIONS_A_VENIR.md.
- Maquette (images d'écrans) validée par Ludovic avant le vrai code.
- Noter les décisions dans DECISIONS.md. Ne pas les contredire ensuite.

## Modifications
- Ne changer que ce qui est demandé. Une retouche sur un écran ne doit pas casser les autres.
- Ne jamais supprimer une fonction, un écran ou une option sans l'accord explicite de Ludovic.
- « Simplifier » = alléger le visuel, pas retirer des fonctions.
- Une fois couleurs, typo et style validés, on ne les change plus sans demander.

## Tests et vérité
- Interdit de dire « c'est fait » sans avoir lancé l'appli et joint des captures du résultat réel.
- Dire clairement ce qui n'a pas pu être testé.
- Corriger la cause, pas seulement le symptôme.

## Sécurité (dépôt public)
- Le dépôt est public : ne jamais committer une clé, un mot de passe, un jeton ou tout autre secret.
- Utiliser un fichier `.env` pour les secrets, plus un `.gitignore` qui contient au minimum `.env`, `node_modules` et les fichiers de build. Fournir un `.env.example` sans valeurs réelles.
- Avant chaque mise en ligne, lancer le prompt « Prompt audit sécurité (7 portes) avant mise en ligne.md » (dans ce pack Skills IA) et corriger ce qu'il signale.
- Aucun paiement, envoi de message, inscription ou publication sans l'accord de Ludovic.

## Contenus
- Images et musiques uniquement libres de droits, usage commercial autorisé, avec crédits (fichier CREDITS.md).
- Pas d'image choquante, pas d'œuvre protégée, pas de personne réelle célèbre en photo.

## Git et livrables
- Petite branches, petits commits, messages clairs.
- Travailler sur une branche, puis ouvrir une pull request vers main. Pas de push direct sur main.
- README.md rédigé pour les jurés : problème, solution, données NASA/partenaires utilisées (avec liens), comment lancer le projet, ce qui est dans la V1 et ce qui ne l'est pas.
- Après chaque étape validée : pousser sur GitHub et déposer une copie dans le Drive de l'équipe (jamais à la racine).

## Jetons
- Une demande claire et complète, pas dix micro-corrections.
- Plan court d'abord, code ensuite.
- Si les crédits d'un outil sont épuisés : le dire tout de suite, ne pas relancer en boucle.

## Économie de tokens
- Lis d'abord PROJET.md (résumé du projet, décisions, état actuel) au lieu de me redemander le contexte. Mets-le à jour à la fin de chaque tâche importante.
- Délègue les tâches simples (recherche dans le code, lecture de fichiers, petites modifs, tests) à des sous-agents avec un modèle léger. Garde le modèle le plus puissant pour le plan, l'architecture et les bugs difficiles.
- Ne relis pas tout le dépôt : ouvre seulement les fichiers utiles.
- Réponses courtes, pas de récapitulatif inutile.
- Une conversation = une tâche. Pour une nouvelle tâche, nouvelle conversation qui repart de PROJET.md.

## Conformité minimale (démo publique)
- Pas d'outil de pistage ni de « replay de session » (Hotjar, Clarity, etc.).
- Polices et librairies servies depuis le projet (pas d'appel direct à Google Fonts).
- Si on demande un email ou un compte : une ligne « données utilisées uniquement pour la démo », et une case âge (15 ans et plus) si inscription.
- Page ou pied de page « À propos / Crédits » : équipe Zero's team, sources des données (NASA…), licence MIT.
