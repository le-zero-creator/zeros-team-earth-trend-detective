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


---

# CLAUDE.v2-complement.md — règles V1 (version 2, après revue critique). Remplace CLAUDE.v1-complement.md.

## Produit (V1 resserrée)
- Écrans V1 uniquement : Home (DISCOVER) · Investigate (Place → Clues → Evidence → Verdict & Act) · Method, data, limits & next steps · About & Credits · 404. Tout le reste = V2 (Compare complet, Explore anywhere, quartiers MODIS, GIBS, visites guidées, PWA). Ne pas les coder sans OK.
- Sous-titre partout : « A comparison of selected locations across the Congo Basin region ». 11 lieux ≠ moyenne du bassin.
- Yaoundé : marqueur CREUX + « outside the Congo hydrological basin (~63 km) » sur carte, textes, métadonnées (champ in_hydrobasins_congo du geojson).

## Science (ne jamais inventer ni recalculer)
- Source unique : public/data/results.json (schéma 2.1, produit par scripts/build_results.py). AUCUN calcul statistique en TypeScript en V1.
- Afficher séparément p_mk (test principal), p_smk (cohérence mois par mois, anti-conservateur), p_hr (Hamed-Rao, corrige l'autocorrélation — contrôle de robustesse, PAS validation indépendante, afficher hr_vs_mk), q_bh (FDR Benjamini-Hochberg, info).
- Verdict RM2 = significatif ; evidence_level = robust / exploratory / not_enough_evidence_yet. Non significatif → « Not enough evidence yet » ; la chaîne « no change » est interdite.
- Bandeau « Exploratory results — uncorrected p-values (FDR q shown) ».
- IC de Sen : en chiffres seulement (Gilbert 1987, non corrigé de l'autocorrélation). JAMAIS de bande autour des valeurs annuelles.
- Air (T2M, T2M_MAX, T2M_MIN) ≠ surface (TS « skin temperature, model »). Unités = slope_unit (ex. « mm per decade (annual total) »).
- Sources avec statut visible (meta.sources[].status) : available / pending / reference_layer. Rien de pending présenté comme disponible.
- Écrire « reproduced », jamais « validated ». KNMI, MODIS, GPM = « Next steps ».
- Textes imposés pour p (Analysis : « The p-value measures how compatible the observed data are with the assumption of no monotonic trend. A value below 0.05 is commonly considered statistically significant. » ; Discover : « A small p-value means the observed trend would be unusual if there were no underlying trend. »).

## Rigueur des calculs — RÈGLES STRICTES (bloquantes)
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

## Interprétation métier (rules.json v2)
- Carte en 4 blocs : 1 Observed (template rempli avec les chiffres réels) · 2 Why it matters · 3 Questions to explore (questions, jamais des solutions) · 4 What you'd need before acting. Avertissement permanent. Changer de profil ne change jamais les chiffres.

## Technique
- Vite + React + TS + Recharts + react-leaflet ; HashRouter ; base '/zeros-team-earth-trend-detective/' ; fetch via import.meta.env.BASE_URL. i18n en.json (défaut) + fr.json. @fontsource (Inter, Space Grotesk, JetBrains Mono). Aucun tracking/cookie ; localStorage = langue + profil.
- Compact ≤640 px (bottom nav 3 onglets) / complet ≥1024 px.
- Maquettes IA = direction artistique seulement ; les chiffres viennent de results.json.

## Sécurité (site statique) — chaque point avec preuve
Pas de secret (grep historique) ; RLS/IDOR/admin/formulaires/webhooks sans objet (le justifier) ; paramètres d'URL zone/var/period en liste blanche ; npm audit 0 haute ; CSP <meta> ; rel="noopener noreferrer" ; pas de redirection ouverte ; erreurs sans détails internes.

## Livraison
Branche feat/v1 → PR. npm run build + npm test + captures 375/1440 avant « fini ». README (EN), CREDITS.md, DECISIONS.md, PROJET.md à jour. Rien supprimé sans accord.
