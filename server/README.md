# OrderHub API

Backend for the OrderHub aggregator — **Express + Prisma + PostgreSQL** (JS/ESM).

## Stack

- **Express** — HTTP server & routing
- **Prisma** — type-safe DB client & migrations (PostgreSQL)
- **JWT** (`jsonwebtoken`) + **bcryptjs** — auth
- **Zod** — request validation
- **helmet / cors / morgan** — security headers, CORS, logging

## Layout

```
src/
  server.js            # entry — starts the HTTP listener
  app.js               # builds the Express app, mounts routers
  config.js            # env-driven config
  prisma.js            # shared PrismaClient
  lib/                 # http-error, jwt, password, async-handler
  middleware/          # auth (requireAuth/requireRole), validate, error
  modules/
    auth/              # register, login, me
    restaurants/       # CRUD + role/ownership rules  ← first vertical slice
prisma/
  schema.prisma        # full data model (15 models)
  seed.js              # admin user + demo restaurants
```

## Run it

```bash
# 1. start Postgres (+ Redis) from the repo root
docker compose up -d

# 2. install & set up the DB
cd server
cp .env.example .env         # (already present for local dev)
npm install
npm run prisma:generate
npm run prisma:migrate       # creates tables
npm run db:seed              # admin@orderhub.app / password123

# 3. start the API
npm run dev                  # http://localhost:3000/api
```

No Docker? Point `DATABASE_URL` in `.env` at any PostgreSQL instance.

## Endpoints (this slice)

| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/health` | public |
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | bearer token |
| GET | `/api/restaurants` | any logged-in (scoped by role) |
| GET | `/api/restaurants/:id` | any logged-in |
| POST | `/api/restaurants` | ADMIN, RESTAURANT |
| PATCH | `/api/restaurants/:id` | ADMIN, RESTAURANT (owner) |
| PATCH | `/api/restaurants/:id/status` | ADMIN, RESTAURANT (owner) |

### Quick test

```bash
# log in as the seeded admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@orderhub.app","password":"password123"}'

# use the returned accessToken
curl http://localhost:3000/api/restaurants \
  -H "Authorization: Bearer <accessToken>"
```

## Next modules

Copy the `restaurants/` shape (schemas → service → controller → routes) for
`menu`, `orders`, `delivery`, `payments`, then add `integrations/` (platform
adapters + webhook receiver) and a WebSocket layer for live orders.
