# 🌱 KhulaGrow — Cannabis Cultivation Management System

A mobile-first, offline-capable cultivation management platform for **SAHPRA-licensed cannabis growers** in South Africa. Full seed-to-harvest traceability, compliance record-keeping, inventory, dashboards, and exportable reports — built to grow into a commercial cannabis ERP and native mobile apps (installable PWA today, Capacitor/React Native-ready architecture).

**Demo login** (after seeding): `demo@khulagrow.co.za` / `demo1234`
(also `worker@…` and `inspector@…`, same password, for role testing)

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Recharts |
| API | Next.js route handlers (REST), Zod validation |
| Database | PostgreSQL + Prisma 6 |
| Auth | JWT session cookies (jose) + bcrypt, per-farm RBAC |
| Offline | Service worker (app shell) + Dexie/IndexedDB read cache & mutation queue |
| Reports | jsPDF + jspdf-autotable (PDF), SheetJS (Excel) — generated on-device |
| Storage | Local-disk upload adapter (swap for Supabase Storage/S3 in production) |

## Getting started

```bash
npm install
createdb khulagrow                     # PostgreSQL must be running
# set DATABASE_URL + AUTH_SECRET in .env
npx prisma migrate dev                 # create schema
npx prisma db seed                     # demo farm with full history
npm run dev                            # http://localhost:3000
```

`.env` keys (see `.env.example`):

- `DATABASE_URL` — PostgreSQL connection string (Neon: use the **pooled** string)
- `DIRECT_URL` — direct/unpooled string, used by Prisma migrations (locally: same as `DATABASE_URL`)
- `AUTH_SECRET` — JWT signing secret (generate a long random value for production)
- `UPLOAD_DIR` — where photo/document uploads land (default `./uploads`)

## Payments (Yoco) — R1,500/month with a 3-day trial

Every new account gets a **3-day free trial**. After that, a **R1,500/month**
subscription (paid by the farm owner) covers the whole team — workers,
supervisors and inspectors on the owner's farms don't pay. When both trial and
subscription lapse, records stay **readable** (compliance data is never locked
away) but new data capture is paused (API returns 402) and the app routes to
the billing page.

> Yoco's public API supports hosted one-time checkouts, not auto-recurring
> debits — so renewal is a one-tap manual payment from **More → Billing**,
> with an in-app trial/expiry reminder. Each payment adds a month on top of
> whatever time remains.

Setup:

1. Get API keys at the [Yoco Portal](https://portal.yoco.co.za) → *Sell online → Payment Gateway*. Use `sk_test_…` while testing, `sk_live_…` in production → `YOCO_SECRET_KEY`.
2. Register the webhook (once per environment):

   ```bash
   curl https://payments.yoco.com/api/webhooks \
     -H "Authorization: Bearer $YOCO_SECRET_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name":"khulagrow","url":"https://YOUR-DOMAIN/api/billing/webhook"}'
   ```

   The response contains a `secret` (`whsec_…`) → `YOCO_WEBHOOK_SECRET`.
3. Set `APP_URL` to the public site origin (used for the Yoco success/cancel redirects).

The webhook activates the month on `payment.succeeded`; the billing page also
verifies directly with Yoco when the user returns, so activation works even
before the webhook lands (and in local dev, where Yoco can't reach you —
test cards: use Yoco's test card `4111 1111 1111 1111`, any future expiry/CVV).

## Deploying to Netlify + Neon

1. **Neon** — create a project at [neon.tech](https://neon.tech). From the dashboard copy both connection strings:
   - the **pooled** one (host contains `-pooler`) → `DATABASE_URL`
   - the **direct** one → `DIRECT_URL`
2. **Netlify** — "Add new site → Import an existing project", pick this repo. `netlify.toml` already sets the build (`prisma migrate deploy && next build`) and the Next.js runtime plugin.
3. **Environment variables** (Site settings → Environment variables):
   - `DATABASE_URL`, `DIRECT_URL` — from Neon (keep `?sslmode=require`)
   - `AUTH_SECRET` — `openssl rand -hex 32`
   - `UPLOAD_DIR` — `/tmp/uploads`
   - `YOCO_SECRET_KEY`, `YOCO_WEBHOOK_SECRET`, `APP_URL` — see the Payments section
4. Deploy. Migrations run automatically on every build; to load demo data run `npx prisma db seed` locally with `DATABASE_URL`/`DIRECT_URL` pointed at Neon.

> **Uploads on Netlify are ephemeral** — Lambda's `/tmp` is wiped between invocations, so photos/documents won't persist. Fine for evaluating; for production swap the write in `src/app/api/upload/route.ts` (and the read in `src/app/api/files/[name]/route.ts`) to Supabase Storage or S3 — it's the single designed swap point.

## Feature map

- **Multi-farm** — farms with GPS capture, SAHPRA licence number/expiry, size, boundary (GeoJSON field), growing areas (blocks/tunnels/rooms/greenhouses/fields) and beds; per-farm team with roles.
- **Plant lifecycle** — batches with unique codes (`KG-2026-001`), optional per-plant tags, strain/genetics registry, stage transitions (germination → clone/seedling → veg → flower → harvested/destroyed), health status, photo timeline, event log.
- **Input logging** — irrigation, nutrients, fertilizer, pesticide, fungicide, growing media, labour, equipment with quantity/unit/cost (ZAR); environment readings (temp, RH, pH, EC, CO₂) per area; daily cultivation logs.
- **Operations** — task management with priority/due dates/assignees, inspections, compliance requirement tracking, witnessed waste/destruction logs (SAHPRA), harvest records with wet/dry weights.
- **Inventory** — lots auto-created at harvest, processing chain (drying → curing → trimming → packaging) with weight in/out, storage locations, status tracking, full batch → lot traceability.
- **Documents** — licences, SOPs, certificates, permits, lab results with expiry alerts and file attachments.
- **Dashboards** — plants by stage, health breakdown, harvest yields, cost trends and category breakdowns, compliance alerts, licence-expiry warnings, recent activity.
- **Reports** — cultivation log (PDF/Excel), SAHPRA compliance report, harvest report, inventory workbook, financial summary, investor-ready portfolio. Generated client-side so they work from cached data offline.
- **RBAC** — Owner / Manager / Supervisor / Worker (write) and Inspector (read-only), enforced per farm in every route handler; append-only audit trail on all mutations.
- **Offline-first** — installable PWA; GET responses cached in IndexedDB; writes made offline are queued and replayed FIFO on reconnect (header shows sync status).

## Architecture notes

- `src/lib/auth.ts` — session + `requireFarmRole` guards; `handler()` wrapper converts thrown `Response`s into HTTP responses.
- `src/lib/offline.ts` — `apiGet` (network-first, cache fallback) and `apiMutate` (queue on network failure). The service worker (`public/sw.js`) only handles pages/static assets; API offline behaviour is owned by the app layer.
- `src/lib/audit.ts` — every mutation route appends to `AuditLog`; failures never block the primary write.
- `prisma/schema.prisma` — single source of truth for the domain; uses Postgres enums throughout.
- Uploads are served through `/api/files/[name]` behind auth; the storage write in `/api/upload` is the single point to swap for Supabase Storage.
- Mobile-first UI: bottom navigation with a central quick-log action, bottom sheets for field data entry, 44px+ tap targets, 16px inputs (no iOS zoom), safe-area padding.

## Production checklist

- [ ] Set a strong `AUTH_SECRET`; serve over HTTPS (secure cookies switch on automatically)
- [ ] Point `DATABASE_URL` at managed Postgres (Supabase/RDS); run `prisma migrate deploy`
- [ ] Swap upload adapter to Supabase Storage / S3
- [ ] Add rate limiting at the edge (proxy or WAF)
- [ ] Configure backups & point-in-time recovery — audit trail and destruction logs are compliance-critical
- [ ] Replace SVG icons with rendered PNG icon set for broader install-banner support
