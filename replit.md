# Money Maestro

Professional money transaction tracker — track dues, debts, sales, purchases, and payments with a beautiful UI powered by Supabase.

## Run & Operate

- `pnpm --filter @workspace/money-maestro run dev` — run the web app (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `DATABASE_URL` — Postgres connection string (api-server only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vanilla HTML/CSS/JS served via Vite (single `index.html`)
- Auth + DB: Supabase (CDN, email/password auth, RLS-secured transactions table)
- API: Express 5 (api-server, not used by money-maestro directly)

## Where things live

- `artifacts/money-maestro/index.html` — **entire app** (HTML + CSS + JS, single file)
- `artifacts/api-server/` — Express API server (health check only currently)
- `lib/api-spec/openapi.yaml` — API spec (health only)

## Product

- **Auth**: Email/password login & registration with animated page transitions (slide left/right)
- **Dashboard**: 4 summary cards — Total, Due, Debt, Paid — with live currency formatting
- **Transactions**: Full CRUD — Add, Edit, Mark Paid, Delete with confirmation
- **Bottom Sheet Modal**: Slides up from the bottom with smooth animation
- **Filters**: All / Due / Debt / Paid / Overdue
- **Sort**: Newest, Oldest, Amount ↑↓, Name A–Z, Due Soon
- **Search**: Real-time name + reason search
- **Multi-currency**: 12 currencies, persisted in localStorage
- **Overdue detection**: Red pulsing badge when due_date passed and status is Pending
- **Supabase RLS**: All queries auto-scoped to logged-in user via auth.uid()

## Architecture decisions

- Single `index.html` file: all CSS, HTML, and JS inline — no bundling needed, served by Vite as-is
- Supabase via CDN: no npm package needed; `window.supabase.createClient()` used directly
- `main.tsx` is a no-op export so Vite's module graph doesn't complain
- Currency symbol persisted in `localStorage` under key `mm_sym`
- Dates stored as ISO strings in Supabase, displayed as DD/MM/YYYY

## Supabase Config

- URL: https://xrchfqafpqfvjdqbibfw.supabase.co
- Table: `transactions` (id, user_id, name, amount, phone, type, given_date, due_date, status, reason, created_at)
- Auth: Email + password, session auto-persisted by Supabase SDK

## Gotchas

- After changing `index.html`, Vite HMR picks it up automatically — no restart needed
- The `main.tsx` entry just exports `{}` — all real logic is in `index.html`'s `<script>` tag
- RLS must be enabled on the `transactions` table in Supabase for user isolation to work

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
