# Veille techno — Kanban Board

| Dossier | Contenu |
|---|---|
| [`veille-front/`](./veille-front) | Application Vue 3 + PrimeVue ([README](./veille-front/README.md), [rapport de veille](./veille-front/rapport-veille-front.md)) |
| [`veille-back/`](./veille-back) | API NestJS + SQLite ([README](./veille-back/README.md)) |
| [`aide/`](./aide) | Cahier des charges et contrat OpenAPI de l'exercice back |

## Lancer tout le projet avec Docker

```bash
docker compose up --build
```

- Front : http://localhost:8080
- API / Swagger : http://localhost:3000/api
- Comptes de démo : `admin@`, `po@`, `dev@`, `moa@`, `moe@kanban.dev` / `password123`

| Variable (optionnelle) | Effet |
|---|---|
| `JWT_SECRET` | Secret JWT (à définir en production) |
| `VITE_PRIMEVUE_LICENSE` | Clé PrimeUI Community (gratuite), supprime le bandeau de licence |

**Base de données** : un seul fichier [`veille-back/kanban.sqlite`](./veille-back/kanban.sqlite). En Docker, ce fichier est monté dans le conteneur back : les inscriptions et les cartes créées dans l'app **s'enregistrent dedans** (visible en local et après redémarrage). Pour repartir sur les données de démo d'origine : `cd veille-back && npm run db:rebuild`.
