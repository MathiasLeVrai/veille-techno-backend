# veille-back — API Kanban (NestJS + SQLite)

API REST du Kanban Board : authentification JWT, rôles d'équipe (Admin, PO, Dev, MOA, MOE), colonnes et tâches partagées. Documentation Swagger interactive sur **http://localhost:3000/api**.

## Lancer en local

```bash
cp .env.example .env   # puis changer JWT_SECRET
npm install
npm run start:dev      # http://localhost:3000/api
```

| Variable | Défaut | Rôle |
|---|---|---|
| `JWT_SECRET` | — (obligatoire) | Clé de signature des tokens (expiration 1 h) |
| `PORT` | `3000` | Port HTTP |
| `DB_PATH` | `kanban.sqlite` | Fichier SQLite (`:memory:` = base jetable pour les tests) |
| `DB_SYNCHRONIZE` | `true` | TypeORM crée/met à jour les tables depuis les entités |

**Persistance** : toutes les écritures (inscription, cartes, colonnes…) vont dans `kanban.sqlite`. Ce fichier est versionné avec des données de démo.

Comptes de démo (mot de passe `password123`) : `admin@`, `po@`, `dev@`, `moa@`, `moe@kanban.dev`.

```bash
npm run db:rebuild   # recrée kanban.sqlite (écrase le fichier : perte des comptes/cartes ajoutés depuis)
```

## Pourquoi SQLite

Une base relationnelle complète (transactions, contraintes, SQL standard) contenue dans **un seul fichier**, sans serveur à installer. C'est suffisant pour une équipe et cela simplifie les tests (`:memory:`) comme Docker (même fichier monté depuis le repo). TypeORM isole le code du moteur : passer à PostgreSQL revient à changer la configuration de `app.module.ts` et à installer `pg`.

## Rôles et permissions

La matrice est définie une seule fois dans `src/auth/roles.ts`. Le front la reçoit via `GET /api/users/me` (champ `permissions`) au lieu de la dupliquer.

| Permission | Admin | PO | MOE | Dev | MOA |
|---|:-:|:-:|:-:|:-:|:-:|
| `board:read` — voir le tableau | ✅ | ✅ | ✅ | ✅ | ✅ |
| `card:create` — créer une tâche | ✅ | ✅ | ✅ | ✅ | ✅ |
| `card:update` — modifier / déplacer | ✅ | ✅ | ✅ | ✅ | |
| `card:delete` — supprimer une tâche | ✅ | ✅ | ✅ | | |
| `list:manage` — gérer les colonnes | ✅ | ✅ | | | |
| `dashboard:view` — tableau de bord | ✅ | ✅ | ✅ | | ✅ |
| `users:manage` — gérer les rôles | ✅ | | | | |

- Le **premier inscrit** devient Admin, les suivants sont Dev ; seul un Admin change un rôle (`PATCH /api/users/:id`), et le dernier Admin ne peut pas être rétrogradé.
- Chaque route déclare sa permission avec `@RequirePermissions(...)`, vérifiée par `PermissionsGuard` (403 sinon) après `JwtAuthGuard` (401 sinon).
- Le rôle est relu en base à chaque requête (`JwtStrategy.validate`) : un changement de rôle s'applique sans reconnexion.

**Choix assumé vs. cahier des charges initial** : le tableau est **partagé** par l'équipe. Le contrôle « seul l'auteur modifie sa liste » est remplacé par le contrôle par rôle, plus adapté à une équipe PO / Dev / MOA / MOE. `ownerId` et `createdById` restent stockés pour la traçabilité.

## Routes principales

| Méthode | Route | Permission |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | publique |
| GET | `/api/users/me` | connecté |
| GET | `/api/users` | `users:manage` |
| PATCH | `/api/users/:id` | soi-même, ou `users:manage` pour le rôle |
| GET | `/api/lists`, `/api/cards`, `/api/lists/:id/cards`, `/api/cards/:id` | `board:read` |
| POST / PATCH / DELETE | `/api/lists[/:id]` | `list:manage` |
| POST | `/api/lists/:listId/cards` | `card:create` |
| PATCH | `/api/cards/:id` (titre, description, `dueDate`, `category`, `listId`, `position`) | `card:update` |
| DELETE | `/api/cards/:id` | `card:delete` |

Déplacer une carte : `PATCH /api/cards/:id` avec `listId` et/ou `position` (index 0 = en haut). Les positions des colonnes source et cible sont renumérotées dans une transaction.

## Tests

```bash
npm test           # unitaires
npm run test:e2e   # e2e sur une base SQLite en mémoire (vérifie chaque rôle : 401/403/400/404)
```
