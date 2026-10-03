# veille-front — Kanban Board (Vue 3 + PrimeVue)

Front-end du Kanban d'équipe réalisé pour la veille technologique front-end (Vue vs React vs Angular). Le rapport qui justifie le choix de Vue est dans [`rapport-veille-front.md`](./rapport-veille-front.md).

## Fonctionnalités

- **Colonnes** : ajout, renommage, suppression (avec confirmation).
- **Tâches** : ajout rapide en bas de chaque colonne, modification du titre et de la description (vide au départ), suppression.
- **Glisser-déposer** des tâches entre colonnes et dans une même colonne.
- **Aller plus loin** : date d'échéance (retards signalés), catégories, recherche, filtres et tri.
- **Connexion / inscription** (JWT) et **profils** Admin, Product Owner, Développeur, MOA, MOE : chaque rôle voit des pages et des actions différentes.
- **Tableau de bord** de pilotage (PO, MOA, MOE, Admin) et **gestion des rôles** (Admin).
- Données persistées par l'API NestJS + SQLite (`../veille-back`).

## Démarrage rapide

### Avec Docker (tout-en-un)

À la racine du dépôt :

```bash
docker compose up --build
```

- Application : http://localhost:8080
- API + Swagger : http://localhost:3000/api

Comptes de démo (mot de passe `password123`) : boutons « Comptes de démo » sur la page de connexion.

### En développement (rechargement à chaud)

```bash
# Terminal 1 — API
cd veille-back && cp .env.example .env && npm install && npm run start:dev

# Terminal 2 — front
cd veille-front && npm install && npm run dev   # http://localhost:5173
```

Vite relaie `/api` vers `http://localhost:3000` (voir `vite.config.ts`). Le navigateur ne parle qu'à une seule origine, donc aucune configuration CORS n'est nécessaire.

### Licence PrimeVue

Depuis la v5, PrimeVue demande une clé de licence. La **Community License est gratuite** pour les étudiants, les projets open source et les petites structures. Sans clé, l'application fonctionne mais affiche un bandeau.

1. Créer la clé sur https://primeui.dev/licenses/community
2. `cp .env.example .env.local` puis renseigner `VITE_PRIMEVUE_LICENSE=…`
3. Avec Docker : `VITE_PRIMEVUE_LICENSE=… docker compose up --build`

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de dev Vite (HMR) |
| `npm run build` | Vérification TypeScript (`vue-tsc`) + build de production dans `dist/` |
| `npm run test:unit` | Tests unitaires Vitest (stores, composable, composant) |
| `npm run test:e2e` | Tests Playwright (nécessite l'API lancée, comptes dans `kanban.sqlite`) |
| `npm run format` | Formatage Prettier |

## Architecture

```
src/
├── main.ts                 Création de l'app : Pinia, Router, PrimeVue (thème Aura, locale FR), Toast, Confirm
├── App.vue                 Coquille : en-tête + <RouterView>
├── api/
│   ├── http.ts             fetch + token JWT + erreurs typées (ApiError) + gestion du 401
│   ├── index.ts            Un objet par ressource : authApi, usersApi, listsApi, cardsApi
│   └── types.ts            Types partagés (User, List, Card, Role, Permission…)
├── stores/                 État global (Pinia)
│   ├── auth.ts             Utilisateur connecté, login/logout, can(permission)
│   └── board.ts            Colonnes et tâches, actions CRUD, déplacement optimiste
├── composables/
│   ├── useCardFilters.ts   Recherche / filtre / tri réutilisables
│   └── useNotify.ts        Exécute une action et affiche un toast succès/erreur
├── router/index.ts         Routes + garde globale (connexion, permissions)
├── views/                  Une vue par page (chargée à la demande)
├── components/
│   ├── AppHeader.vue       Navigation filtrée selon le rôle
│   ├── AuthCard.vue        Mise en page login/inscription
│   └── board/              KanbanColumn, TaskCard, TaskDialog
├── constants.ts            Libellés et couleurs des rôles / catégories
└── utils/dates.ts          Conversions de dates (sans décalage de fuseau)
```

### Flux de données

```
Composant ──(appelle une action)──▶ Store Pinia ──▶ api/*.ts ──▶ fetch /api ──▶ NestJS
    ▲                                   │
    └──────(réactivité : ré-affichage)──┘
```

Les composants n'appellent jamais `fetch` directement. Ils lisent l'état du store et appellent ses actions. Les composants restent simples, et la logique métier peut être testée sans navigateur.

### Rôles et sécurité côté front

- La matrice des droits vit **dans le back** (`veille-back/src/auth/roles.ts`). Le front reçoit `user.permissions` et teste `auth.can('card:update')`. Il n'y a pas de duplication, donc pas de risque de désynchronisation.
- **Routes** : chaque route déclare `meta.permission`. La garde `router.beforeEach` redirige vers `/login` (non connecté) ou `/forbidden` (rôle insuffisant).
- **Interface** : les boutons et formulaires non autorisés sont masqués ou désactivés (`v-if="can.manageLists"`).
- La vraie sécurité reste **le back** : masquer un bouton est un confort d'utilisation, l'API refuse quand même avec un 403.
- Le token JWT est stocké dans `localStorage` (simple, adapté à une API séparée). Pour une application exposée publiquement, un cookie `HttpOnly` serait plus robuste face au XSS.

### Ajouter une page réservée à un rôle

1. Créer `src/views/MaPageView.vue`.
2. Ajouter la route avec sa permission dans `src/router/index.ts` :
   ```ts
   { path: '/ma-page', component: () => import('@/views/MaPageView.vue'), meta: { permission: 'dashboard:view' } }
   ```
3. Ajouter le lien dans `links` de `AppHeader.vue` (il ne sera affiché qu'aux rôles autorisés).
4. Si une nouvelle permission est nécessaire, l'ajouter dans `roles.ts` (back) et dans le type `Permission` (`api/types.ts`).

## Performance et éco-conception

- **Découpage du code** : chaque vue est chargée à la demande (`() => import(...)`). La page de connexion ne télécharge pas le code du tableau de bord.
- **Imports à la carte** : composants PrimeVue et icônes `@primeicons/vue` importés un par un, donc le *tree-shaking* ne garde que ce qui est utilisé.
- **Mises à jour optimistes** : déplacer ou supprimer une tâche est immédiat à l'écran, puis annulé si l'API refuse.
- **Une seule requête par ressource** au chargement du tableau (`GET /lists` + `GET /cards` en parallèle).
- **Production** : nginx sert des fichiers statiques compressés (gzip) avec cache long sur les fichiers hachés. Image Docker finale sans Node.js.

## Tests

- `src/__tests__/board.store.spec.ts` : déplacement de cartes, renumérotation, annulation si l'API échoue.
- `src/__tests__/auth.store.spec.ts` : connexion, permissions, session expirée.
- `src/__tests__/useCardFilters.spec.ts` : recherche, filtres, tri.
- `src/__tests__/TaskCard.spec.ts` : rendu d'une carte et événements.
- `e2e/vue.spec.ts` : parcours navigateur (connexion PO, accès refusé MOA).
