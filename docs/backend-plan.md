# OrderHub — Backend Architecture & Data Model Plan

Status: **being implemented.** This lays out the database schema, API surface,
and security model for turning the current React prototype into a real,
multi-tenant food-delivery aggregator.

> **Framework note:** the backend is built with **Express** (plain JS/ESM), not
> NestJS — chosen for simplicity and transparency. The module boundaries below
> (auth, restaurants, menu, …) are preserved as `src/modules/<name>/` folders,
> each with `*.routes.js → *.controller.js → *.service.js → *.schemas.js`.
> **Prisma + PostgreSQL and the entire schema in §4 are unchanged.** See
> [`server/README.md`](../server/README.md) for how to run it. The `auth` and
> `restaurants` slices are implemented; other modules copy the same shape.

---

## 1. High-level architecture

```
                         ┌─────────────────────────┐
   Browser  ── HTTPS ──▶ │   NestJS API (server/)  │ ──▶  PostgreSQL (Prisma)
   (React, apps/web)     │                         │ ──▶  Redis (queues/cache)
        ▲                │  auth · RBAC · modules  │
        │  WebSocket     │  webhook receiver       │
        └────────────────┤  holds ALL secrets      │
                         └───────────┬─────────────┘
                                     │  outbound (server-side only)
                                     ▼
                    Swiggy / Zomato / UrbanPiper (partner APIs + webhooks)
```

Key principle: **the browser never talks to a database or a delivery platform
directly.** It only talks to our API. All secrets, role checks, and platform
tokens live server-side.

---

## 2. Repository layout (monorepo)

Recommended: promote the current app into `apps/web` and add `apps/api`.
(Least-disruptive alternative: keep the frontend at root and add a top-level
`server/` folder — same internal structure.)

```
aggregator/
├── apps/
│   ├── web/                     # existing React + Vite app (moved as-is)
│   │   └── src/ …               # pages already structured for a data layer
│   └── api/                     # NestJS backend  ← new
├── packages/
│   └── shared/                  # shared TS types/DTOs used by web + api (optional)
├── docker-compose.yml           # postgres + redis for local dev
└── package.json                 # workspaces
```

### NestJS internal structure (`apps/api/`)

```
apps/api/
├── prisma/
│   ├── schema.prisma            # the data model (section 4)
│   ├── migrations/              # generated, versioned
│   └── seed.ts                  # demo data (mirrors current mock data)
├── src/
│   ├── main.ts                  # bootstrap, CORS, helmet, validation pipe
│   ├── app.module.ts
│   ├── config/                  # env schema + typed config
│   ├── prisma/                  # PrismaModule + PrismaService (DB access)
│   ├── common/
│   │   ├── decorators/          # @CurrentUser(), @Roles()
│   │   ├── guards/              # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/        # logging, response shaping
│   │   ├── filters/             # HttpExceptionFilter
│   │   └── dto/                 # PaginationDto, etc.
│   ├── auth/                    # login, refresh, password hashing, JWT
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/jwt.strategy.ts
│   │   └── dto/
│   ├── users/                   # profile, admin user management
│   ├── restaurants/            # CRUD + status  ← first vertical slice
│   ├── menu/                    # dishes CRUD, availability
│   ├── orders/                  # lifecycle, status transitions
│   ├── customers/               # customer directory (role=CUSTOMER)
│   ├── delivery/                # couriers, assignment, tracking
│   ├── payments/                # transactions, payouts (via gateway)
│   ├── analytics/               # aggregated metrics for dashboards
│   ├── notifications/           # per-user notification feed
│   ├── support/                 # tickets
│   ├── reviews/                 # ratings
│   ├── integrations/            # platform adapters + inbound webhooks
│   │   ├── providers/
│   │   │   ├── urbanpiper.provider.ts
│   │   │   ├── swiggy.provider.ts
│   │   │   └── zomato.provider.ts
│   │   ├── integrations.service.ts     # menu push, store import
│   │   └── webhooks.controller.ts      # POST /webhooks/:provider  (order push)
│   └── realtime/
│       └── events.gateway.ts    # WebSocket: live orders + delivery
└── test/
```

Every domain module is the same three files — `*.module.ts`, `*.controller.ts`,
`*.service.ts` — plus a `dto/` folder. Build one (`restaurants`), copy the shape.

---

## 3. Roles & access model

Four roles, enforced by `RolesGuard` + row-level checks in services:

| Role | Sees / can do |
|------|---------------|
| `ADMIN` | Everything (the operator running the aggregator) |
| `RESTAURANT` | Only their own restaurant, menu, and its orders |
| `COURIER` | Only deliveries assigned to them; updates location/status |
| `CUSTOMER` | Their own orders, addresses, reviews |

Route protection example: `@Roles('ADMIN','RESTAURANT')` on `POST /menu`, then
the service verifies the menu item's `restaurantId` belongs to the caller.

---

## 4. Database schema (Prisma / PostgreSQL)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

// ─── Enums ────────────────────────────────────────────────
enum UserRole         { ADMIN RESTAURANT COURIER CUSTOMER }
enum RestaurantStatus { OPEN BUSY CLOSED }
enum OrderStatus      { PLACED CONFIRMED PREPARING READY PICKED_UP OUT_FOR_DELIVERY DELIVERED CANCELLED }
enum DeliveryStatus   { UNASSIGNED ASSIGNED PICKING_UP ON_THE_WAY ARRIVING DELIVERED }
enum CourierStatus    { IDLE BUSY OFFLINE }
enum PaymentMethod    { UPI CARD WALLET CASH NETBANKING }
enum TransactionType  { PAYMENT REFUND PAYOUT }
enum TransactionStatus{ PENDING SETTLED FAILED REFUNDED }
enum Provider         { DIRECT SWIGGY ZOMATO URBANPIPER }
enum Priority         { LOW MEDIUM HIGH }
enum TicketStatus     { OPEN IN_PROGRESS RESOLVED }
enum NotificationType { ORDER DELIVERY ALERT PAYMENT REVIEW RESTAURANT }

// ─── Identity ─────────────────────────────────────────────
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          UserRole @default(CUSTOMER)
  name          String
  phone         String?
  avatarUrl     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  restaurant    Restaurant?     // when role = RESTAURANT (owner)
  courier       CourierProfile? // when role = COURIER
  addresses     Address[]
  orders        Order[]         @relation("CustomerOrders")
  reviews       Review[]
  notifications Notification[]
  tickets       SupportTicket[]
}

model Address {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  label  String?
  line1  String
  city   String
  lat    Float?
  lng    Float?
  orders Order[]
}

// ─── Catalog ──────────────────────────────────────────────
model Restaurant {
  id          String           @id @default(cuid())
  name        String
  cuisine     String
  area        String
  address     String?
  rating      Float            @default(0)
  reviewCount Int              @default(0)
  prepTime    Int              @default(20)   // minutes
  commission  Float            @default(18)   // percent
  status      RestaurantStatus @default(OPEN)
  source      Provider         @default(DIRECT)
  ownerId     String?          @unique
  owner       User?            @relation(fields: [ownerId], references: [id])
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  menuItems     MenuItem[]
  orders        Order[]
  platformLinks PlatformLink[]
  reviews       Review[]

  @@index([status])
  @@index([cuisine])
}

model MenuItem {
  id           String   @id @default(cuid())
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  name         String
  description  String?
  price        Decimal  @db.Decimal(10, 2)
  cuisine      String?
  category     String?
  calories     Int?
  prepTime     Int?
  difficulty   String?
  imageUrl     String?
  isAvailable  Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  orderItems   OrderItem[]

  @@index([restaurantId])
}

// ─── Fulfilment ───────────────────────────────────────────
model CourierProfile {
  id         String        @id @default(cuid())
  userId     String        @unique
  user       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  vehicle    String        @default("Bike")
  status     CourierStatus @default(OFFLINE)
  rating     Float         @default(5)
  currentLat Float?
  currentLng Float?

  deliveries Delivery[]
}

model Order {
  id                String        @id @default(cuid())
  code              String        @unique          // e.g. ORD-7841
  customerId        String
  customer          User          @relation("CustomerOrders", fields: [customerId], references: [id])
  restaurantId      String
  restaurant        Restaurant    @relation(fields: [restaurantId], references: [id])
  deliveryAddressId String?
  deliveryAddress   Address?      @relation(fields: [deliveryAddressId], references: [id])
  status            OrderStatus   @default(PLACED)
  source            Provider      @default(DIRECT)
  externalId        String?       // Swiggy/Zomato order id when source != DIRECT
  subtotal          Decimal       @db.Decimal(10, 2)
  deliveryFee       Decimal       @db.Decimal(10, 2) @default(0)
  tax               Decimal       @db.Decimal(10, 2) @default(0)
  total             Decimal       @db.Decimal(10, 2)
  paymentMethod     PaymentMethod
  placedAt          DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  items        OrderItem[]
  delivery     Delivery?
  transactions Transaction[]
  review       Review?

  @@index([status])
  @@index([restaurantId])
  @@index([customerId])
  @@index([placedAt])
}

model OrderItem {
  id            String   @id @default(cuid())
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItemId    String?
  menuItem      MenuItem? @relation(fields: [menuItemId], references: [id])
  nameSnapshot  String                        // price/name frozen at order time
  priceSnapshot Decimal  @db.Decimal(10, 2)
  quantity      Int      @default(1)
}

model Delivery {
  id          String         @id @default(cuid())
  orderId     String         @unique
  order       Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  courierId   String?
  courier     CourierProfile? @relation(fields: [courierId], references: [id])
  status      DeliveryStatus @default(UNASSIGNED)
  etaMinutes  Int?
  assignedAt  DateTime?
  pickedUpAt  DateTime?
  deliveredAt DateTime?

  @@index([status])
}

// ─── Money ────────────────────────────────────────────────
model Transaction {
  id         String            @id @default(cuid())
  orderId    String?
  order      Order?            @relation(fields: [orderId], references: [id])
  type       TransactionType   @default(PAYMENT)
  method     PaymentMethod
  amount     Decimal           @db.Decimal(10, 2)
  fee        Decimal           @db.Decimal(10, 2) @default(0)
  status     TransactionStatus @default(PENDING)
  gatewayRef String?           // Razorpay/Stripe reference — never card data
  createdAt  DateTime          @default(now())

  @@index([type])
  @@index([status])
}

// ─── Integrations ─────────────────────────────────────────
model PlatformLink {
  id              String   @id @default(cuid())
  restaurantId    String
  restaurant      Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  provider        Provider
  externalStoreId String              // "swiggystore" / "zomatomarket" store id
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())

  @@unique([restaurantId, provider])
}

model WebhookEvent {
  id         String   @id @default(cuid())
  provider   Provider
  eventType  String?
  payload    Json                       // raw inbound body, for audit/replay
  processed  Boolean  @default(false)
  error      String?
  receivedAt DateTime @default(now())

  @@index([provider])
  @@index([processed])
}

// ─── Engagement ───────────────────────────────────────────
model Review {
  id           String   @id @default(cuid())
  customerId   String
  customer     User     @relation(fields: [customerId], references: [id])
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  orderId      String?  @unique
  order        Order?   @relation(fields: [orderId], references: [id])
  rating       Int
  comment      String?
  createdAt    DateTime @default(now())
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  body      String
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())

  @@index([userId, isRead])
}

model SupportTicket {
  id        String       @id @default(cuid())
  userId    String
  user      User         @relation(fields: [userId], references: [id])
  subject   String
  category  String
  priority  Priority     @default(MEDIUM)
  status    TicketStatus @default(OPEN)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}
```

### Order status flow

```
PLACED → CONFIRMED → PREPARING → READY → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
   └────────────────────────── CANCELLED (any pre-delivery state) ──────────────┘
```
Delivery mirrors: `UNASSIGNED → ASSIGNED → PICKING_UP → ON_THE_WAY → ARRIVING → DELIVERED`.

Design notes:
- `OrderItem` stores **name/price snapshots** so historical orders stay correct
  even after a menu item's price changes or it's deleted.
- Money is `Decimal(10,2)` — never floats.
- `source` + `externalId` + `PlatformLink` let one order model cover direct,
  Swiggy, and Zomato orders uniformly.
- `WebhookEvent` persists every inbound platform call for audit and replay.

---

## 5. API surface (per module)

| Module | Key endpoints | Guard |
|--------|---------------|-------|
| auth | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `GET /auth/me` | public / self |
| restaurants | `GET /restaurants`, `GET /:id`, `POST`, `PATCH /:id`, `PATCH /:id/status` | ADMIN, RESTAURANT |
| menu | `GET /menu?restaurantId=`, `POST`, `PATCH /:id`, `DELETE /:id`, `PATCH /:id/availability` | ADMIN, RESTAURANT |
| orders | `GET /orders`, `GET /:id`, `POST`, `PATCH /:id/status` | role-scoped |
| customers | `GET /customers`, `GET /:id` | ADMIN |
| delivery | `GET /couriers`, `POST /deliveries/:id/assign`, `PATCH /deliveries/:id/status` | ADMIN, COURIER |
| payments | `GET /transactions`, `POST /payouts`, `POST /refunds` | ADMIN |
| analytics | `GET /analytics/overview`, `/analytics/orders-by-hour` | ADMIN |
| notifications | `GET /notifications`, `PATCH /:id/read`, `POST /read-all` | self |
| support | `GET /tickets`, `POST`, `PATCH /:id` | self / ADMIN |
| integrations | `GET /integrations/providers`, `POST /integrations/:provider/import`, `POST /integrations/:provider/publish/:menuItemId` | ADMIN |
| webhooks | `POST /webhooks/:provider` (inbound order push) | token-verified, no JWT |

Responses use a consistent envelope + cursor/offset pagination (`PaginationDto`).

---

## 6. Security model

1. **AuthN** — email/password → **bcrypt/argon2** hash; short-lived **JWT access
   token** + rotating **refresh token**. `JwtAuthGuard` global, opt-out with
   `@Public()`.
2. **AuthZ** — `@Roles()` + `RolesGuard`, plus **row-level ownership checks** in
   services (a RESTAURANT can only mutate its own rows).
3. **Secrets** — platform tokens/webhook secrets in env / a secrets manager,
   **only on the server**. Nothing sensitive uses the `VITE_` prefix (those ship
   to the browser).
4. **Webhook verification** — inbound `/webhooks/:provider` validates the shared
   static token + `X-UPR-Biz-Id` (per the platform research) **before** trusting
   the order; raw body saved to `WebhookEvent`.
5. **Payments** — a gateway (Razorpay/Stripe) handles PCI; we store only
   `gatewayRef`. No card data ever touches our DB.
6. **Transport & input** — HTTPS only, `helmet`, CORS allow-list, global
   `ValidationPipe` (DTO validation), rate limiting (`@nestjs/throttler`).
7. **PII** — customer data access-controlled by role; encryption at rest;
   retention/erasure hooks for GDPR / India DPDP.

---

## 7. How the frontend changes (small)

The UI already reads through a data layer, so the swap is contained:

| Today | After |
|-------|-------|
| `lib/api.js` → DummyJSON | `lib/api.js` → `VITE_API_URL` (our API) with auth header |
| `localStorage` writes (Menu/Restaurants) | `POST`/`PATCH` to the API |
| `lib/integrations.js` calls platform directly | calls **our** `/integrations/*` (server holds secrets) |
| static badges (Orders 24, etc.) | live counts from API/WebSocket |
| — | add login screen + auth context + route guards |

Components, pages, and styling stay as-is.

---

## 8. Suggested build order (vertical slices)

1. **Foundation** — monorepo, `docker-compose` (postgres+redis), Prisma schema,
   first migration, seed script from current mock data.
2. **Auth slice** — register/login/JWT/guards + a login screen in the web app.
3. **Restaurants slice** — full CRUD end-to-end; point the Restaurants page at
   it. This proves auth + DB + endpoint + frontend swap in one line.
4. **Menu + Orders** — the core loop (browse → order → status).
5. **Delivery + realtime** — courier assignment + WebSocket live updates.
6. **Payments** — gateway integration, transactions, payouts.
7. **Integrations** — `/integrations/*` + `/webhooks/:provider` receiver.
8. **Analytics, notifications, support** — read models over the above.

---

## 9. Environment (server-side, never `VITE_`)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/orderhub
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=…
JWT_REFRESH_SECRET=…
RAZORPAY_KEY_ID=…            # or STRIPE_SECRET_KEY
RAZORPAY_KEY_SECRET=…
URBANPIPER_API_KEY=…         # platform tokens live here now
SWIGGY_PARTNER_KEY=…
ZOMATO_PARTNER_KEY=…
WEBHOOK_SHARED_TOKEN=…       # verify inbound platform webhooks
```

The web app keeps only `VITE_API_URL` (the public URL of this API).
```
```
