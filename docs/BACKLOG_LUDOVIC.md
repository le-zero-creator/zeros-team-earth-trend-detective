# Backlog Ludovic — Terra Trace (15/11/2026, soir)

Liste complète des demandes de Ludovic (message du 15/11, ~18 h). Statut mis à jour à chaque commit.
Si les jetons s'épuisent, reprendre ici (Claude Code) : un point = une petite modif + `npm test` + `npm run build` + captures 375/1440 (FR) + push sur `main` (Vercel déploie `main` automatiquement sur https://trend-detective-congo.vercel.app).

Règles dures : ne jamais inventer/modifier un chiffre (seulement `public/data/results.json` ; Tmax Yaoundé +0,78 °C/décennie 2001-2025 ; humidité −1,6 pt/décennie ; baisse de pluie NON prouvée) ; aucun calcul stat côté client ; pas de pistage ; aucun secret dans le dépôt/client ; pas de logo NASA ; images IA marquées « Image générée par IA » ; respecter `prefers-reduced-motion` ; responsive 360-1920 px sans débordement.

Référence design : portfolio Folio https://ludovic-fomat.vercel.app et /vision.html (intro animée, logo avant le titre, transitions douces entre bandes de couleur, révélations d'images, compteurs, verre dépoli). Easing `cubic-bezier(.16,.84,.24,1)` ; compteurs à 60 % visibles, délai 250 ms, 1,3 s, `1-(1-k)^3` ; flou 12-18 px + saturate 1,3-1,5.

Statuts : ✅ fait · 🟡 en cours · ⬜ à faire

| # | Demande | Statut | Notes |
|---|---------|--------|-------|
| 1 | Animation d'intro/chargement identique sur ordinateur et téléphone (storytelling) | ⬜ | |
| 2 | Anneaux du héros comme l'image de référence : fins, élégants, proches de la planète, petits satellites (certains en sens inverse) | ⬜ | |
| 3 | En-tête : petit logo animé + titre plus intéressant (comme le portfolio) | ⬜ | |
| 4 | Héros : garder « Qu'est-ce qui change sur notre planète ? », retirer/réécrire « Depuis la Terre entière » | ✅ | Kicker réécrit : « Une enquête sur les traces de la Terre ». Titre conservé. |
| 5 | Le site se lit comme un LIVRE : Terre → bassin du Congo → Yaoundé → pour toi → demander à Terra (FR + EN) | 🟡 | Accueil réécrit comme un livre (8 chapitres : Terre → satellites → bassin → Yaoundé → chaleur → air → pluie → pour toi), FR + EN. Autres pages : à faire. |
| 6 | Mise en page storytelling : une étape à la fois, en grand, on tourne la page ; clic pour détails si besoin | ✅ | `src/components/Book.tsx` : scène collante, une page à la fois, défilement = tourner la page, points + flèches, « En savoir plus » ouvre une fenêtre. |
| 7 | Échelle typographique unique ; sections blanches décalées sur ordinateur à réaligner | ⬜ | |
| 8 | Profils : plus de petites pastilles ; une carte par profil avec image, dépliable ; extensible (« Bientôt ») | ✅ | `MeansForYou.tsx` : une carte photo par métier dans un carrousel (on ne voit pas tout), panneau riche en dessous, 2 métiers « Bientôt » (enseignant, énergie). Lecture architecte avec dessin animé à points chauds : à faire. |
| 9 | Puces « Après-midi chauds / Air humide / Pluie » séparées du choix du profil (« Quelle trace regarder ? ») | ✅ | Étape 2 séparée « Quelle trace veux-tu lire ? » avec icônes, après « Qui es-tu ? ». |
| 10 | « Pourquoi cela peut compter », « Questions à explorer », « Ce qu'il faudrait encore » : cartes visibles, cliquables, dépliables (« Bientôt » si vide) | ✅ | Chaque point est une carte dépliable ; questions → « Demander à Terra » ; données manquantes → « Bientôt ». |
| 11 | Chaque image correspond à son contexte (NASA domaine public ou image IA marquée) ; vérifier l'image satellite « Ouvrir Yaoundé » | ⬜ | |
| 12 | Transitions entre bandes de couleur (vert → blanc) douces, pas de coupe nette | 🟡 | Héros : fondu doux. Bande verte : coins arrondis + fondu en bas (masque). Autres pages : à vérifier. |
| 13 | Éléments du bas qui ressemblent à des boutons : cliquables ou vraies phrases animées ; « Tendance locale… » expliquée | 🟡 | Accueil : fin = grandes cartes cliquables (globe, lieux, Yaoundé, méthode) + chapitres « Bientôt » dépliables. Le chiffre est expliqué (« même chiffre que dans l'histoire »). |
| 14 | UN seul design sur toutes les pages (accueil, globe, Yaoundé, Pour toi, Mon espace, Ask Terra) ; animations partout ; « Lieu », « Indice pour vous » renommés | 🟡 | Étapes Enquêter renommées en mots simples. Pages Yaoundé, Mon espace, Ask : à unifier. |
| 15 | Champ Ask Terra directement dans l'étude de cas (Yaoundé, « Pour toi ») via `/api/ask` | 🟡 | Champ Ask Terra sur l'accueil et sur « Pour toi ». Page Yaoundé : à faire. |
| 16 | « Montrer le guide » rejoue l'intro ; thème et langue en icônes avec infobulle + aria-label | ⬜ | |
| 17 | Tutoriel d'intro storytelling : le détective suit les traces de la Terre depuis l'espace jusqu'à une ville puis jusqu'à toi ; Terra guide | ⬜ | |
| 18 | « Mentions & crédits » simple : équipe, crédits données NASA, « site non officiel de la NASA », pas de pistage | ⬜ | |
| A | Polices trop grandes sur petit portable (1280-1366) et téléphone : échelle fluide `clamp` | 🟡 | `src/styles/book.css` : variables `--fs-*` (titres, sous-titres, texte). À étendre aux autres pages. |
| B | Le bouton/demi-globe vers les zones d'étude est trop caché : CTA clair « Explorer les zones d'étude », pastille qui pulse | ✅ | Bouton verre + point pulsant sur le globe, et 2e bouton sous le titre. Terra qui pointe : à faire. |
| C | Vue zones d'étude : image cassée à trouver ; chemin vers Yaoundé (hors bassin) à rendre visible ; un clic sans effet à corriger ; garder et polir l'affichage et la fenêtre | ⬜ | |
| D | Enquêter : texte qui paraît en italique, titres/sous-titres peu distincts ; AVANT le graphique, diapos pas à pas (source, variables une par une, pluie non prouvée), puis graphique animé (points puis droite), puis seulement « +0,78 °C/décennie » et son explication | ✅ | `EvidenceSlides.tsx` : 7 diapos avant le graphique (source NASA POWER/MERRA-2/CERES, trace chaleur, trace air, trace pluie « pas prouvé », c'est quoi une tendance, graphique animé points puis droite de Sen, puis seulement le chiffre). Titres serif, sous-titres sans-serif droits (`font-synthesis: none`). Étapes renommées « 1 · Choisir un lieu… ». |
| E | Page Yaoundé (preuves) : même design que le reste (en-tête, échelle typo, cartes, animations) | ⬜ | |
| 19 | Dynamique : connexion Google pour « Mon espace », panneau météo mondiale en direct (NASA POWER via `api/power.ts`) — en dernier, si sûr et gratuit | ⬜ | |

## Prochaines étapes (si non fait ce soir)
_(rempli au fur et à mesure)_
