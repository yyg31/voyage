# asia26 — voyage Back & Ygouf 🌏

Site de préparation et de suivi du voyage en Asie des familles **Back** et
**Ygouf** (9 personnes), du 25 décembre 2026 au 10 janvier 2027 : Phnom
Penh, Ho Chi Minh, Con Dao, Singapour, Pékin.

Voir `docs/` pour le détail :
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — architecture, choix techniques
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — modèle de données
- [`docs/API.md`](docs/API.md) — endpoints de l'API REST
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — déploiement pas à pas sur le VPS

## Stack

- **Front-end**: React + Vite + TypeScript, React Router, TanStack Query (`frontend/`)
- **Back-end**: Node.js + Express + Prisma ORM (`backend/`)
- **Base de données**: PostgreSQL
- **Reverse proxy**: Caddy, **hors container**, sur l'hôte (`/Caddyfile`)
- **Conteneurisation**: Docker Compose (`docker-compose.yml`) pour `db`, `backend`, `frontend`

## Démarrage rapide (développement local)

Prérequis : Node.js 20+, PostgreSQL (local ou via Docker), npm.

```bash
# 1. Base de données
createdb asia26   # ou via docker: docker run -d -e POSTGRES_PASSWORD=... -p 5432:5432 postgres:16-alpine

# 2. Backend
cd backend
cp .env.example .env      # ajuster DATABASE_URL / JWT_SECRET
npm install
npx prisma migrate dev    # crée le schéma
npm run seed               # crée les 2 familles, 9 membres, escales, démo
npm run dev                 # API sur http://localhost:4000

# 3. Frontend (autre terminal)
cd frontend
npm install
npm run dev                 # UI sur http://localhost:5173 (proxy /api -> :4000)
```

Comptes de démo créés par `npm run seed` (mot de passe par défaut défini par
`SEED_DEFAULT_PASSWORD`, `Asia2026!` si non défini) :
- `yann.ygouf@icloud.com` — admin, famille Ygouf
- `pierre.back@example.com` — admin, famille Back
- `marie.back@example.com`, `leo.back@example.com`, `emma.back@example.com` — famille Back
- `claire.ygouf@example.com`, `hugo.ygouf@example.com`, `lina.ygouf@example.com`, `noe.ygouf@example.com` — famille Ygouf

## Déploiement (production)

Voir [`docs/DEPLOY.md`](docs/DEPLOY.md) pour le runbook détaillé (VPS avec
Docker + Caddy déjà installés). En résumé, sur le VPS :

```bash
git clone https://github.com/yyg31/voyage.git /opt/asia26 && cd /opt/asia26
./deploy/generate-env.sh   # génère .env avec des secrets aléatoires
./deploy/deploy.sh --seed  # build + démarre le stack, charge les données de démo (1ère fois)
```

Puis, **sur l'hôte** (hors Docker), brancher `/Caddyfile` (voir
`docs/DEPLOY.md` §4) afin de servir `https://asia26.ygouf.com` et router
vers les containers `frontend`/`backend` qui n'écoutent que sur
`127.0.0.1`.

## Fonctionnalités

- Gestion des membres (2 familles, 9 comptes, rôles admin/membre), pas
  d'inscription publique — création par un admin uniquement.
- Authentification par email/mot de passe (JWT), changement et
  réinitialisation de mot de passe.
- Agenda global (vue liste chronologique + vue calendrier mensuel),
  filtrable par escale / type d'activité / famille.
- Escales avec dates de présence par famille et liens associés.
- Liens & ressources (hôtels, activités, infos pratiques) avec visibilité
  par famille (Back / Ygouf / les deux).
- Vols & transports avec upload de billets (PDF/image) et intégration
  automatique dans l'agenda.
- Forum par catégories (Général, Logistique, Idées de visites, Restaurants).
- Interface responsive (mobile-first).
