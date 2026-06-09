# Money Maestro

Professional money transaction tracker — track dues, debts, sales, purchases, and payments with a premium dark UI powered by Supabase.

## Run & Operate

- `pnpm --filter @workspace/money-maestro run dev` — run the web app (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `DATABASE_URL` — Postgres connection string (api-server only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vanilla HTML/CSS/JS served via Vite (single `index.html`)
- Auth + DB: Supabase (CDN, email/password auth, RLS-secured transactions table)
- API: Express 5 (api-server, health check only currently)
- Fonts: Syne (headings) + DM Sans (body) + Space Mono (numbers)

## Where things live

- `artifacts/money-maestro/index.html` — **entire app** (HTML + CSS + JS, single file, ~800 lines)
- `artifacts/money-maestro/vercel.json` — Vercel deployment config
- `artifacts/money-maestro/vite.config.vercel.ts` — Vercel-compatible Vite config (no PORT/BASE_PATH required)
- `artifacts/api-server/` — Express API server (health check only currently)
- `lib/api-spec/openapi.yaml` — API spec

## Pages (hash-based router)

| Page | Nav ID | Description |
|---|---|---|
| Home / Dashboard | `page-home` | Hero balance card, 4 summary cards, recent 5 txns |
| Transactions | `page-txns` | Full list, search, filter chips, sort |
| Analytics | `page-analytics` | 4 charts + smart insights panel |
| Profile | `page-profile` | Avatar, stats, quick action links |
| Settings | `page-settings` | Currency, export CSV, tip dev, sign out |

## Navigation

- Bottom nav: Home | Txns | [+ FAB] | Charts | More
- "More" button opens a pop-up menu: Profile, Settings, Tip the Dev, Sign Out
- `navTo(page)` switches pages programmatically
- `navFilter(filter)` switches to Txns page with a pre-set filter

## Features

- **Auth**: Email/password login & registration (Supabase)
- **Dashboard**: Hero net balance card, 4 summary cards (Due / Debt / Paid / Total)
- **Transactions**: Full CRUD — Add, Edit, Mark Paid, Delete with confirmation
- **Bottom Sheet Modal**: Slides up from bottom, smooth animation
- **Filters**: All / Due / Debt / Paid / Overdue / Sale
- **Sort**: Newest, Oldest, Amount ↑↓, Name A–Z, Due Soon
- **Search**: Real-time name + reason + notes search
- **Partial Payments**: Progress bar, remaining badge, partial amount field
- **Analytics**: 4 Chart.js charts + smart insights (overdue, net balance, paid rate, largest txn)
- **Multi-currency**: 12 currencies, persisted in localStorage
- **Export CSV**: Download all transactions as CSV
- **Tip / Donate Panel**: bKash, Nagad, Card, Bank — tap to copy number
- **Profile Page**: Avatar with initials, email, transaction stats
- **Overdue detection**: Red pulsing badge when due_date passed and status is Pending

## Tip / Donate Panel

Located in Settings page and Profile page. Tagline:
> "Built for free. Kept alive by love. Slide a lil' something, homie 💸"

Payment methods (update numbers in index.html):
- `#tip-bk` → bKash number
- `#tip-ng` → Nagad number
- `#tip-cd` → Buy Me A Coffee / card link
- `#tip-bn` → Bank account number

## Supabase Config

- URL: https://xrchfqafpqfvjdqbibfw.supabase.co
- Anon key: see `src/lib/supabase.ts` (hardcoded, no env vars)
- Tables: `transactions`, `books`, `settings`
- Auth: Email + password, session auto-persisted by Supabase SDK

### Required SQL migrations (run ALL in Supabase SQL Editor):

```sql
-- 1. Add partial payments & notes to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS partial_paid numeric DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes text;

-- 2. Books/Accounts table
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#F97316',
  icon TEXT DEFAULT '📒',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own books" ON books FOR ALL USING (auth.uid() = user_id);

-- 3. Link transactions to books
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES books(id) ON DELETE SET NULL;

-- 4. Admin tip settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin write settings" ON settings FOR ALL USING (auth.email() = 'smartmahid@gmail.com');
INSERT INTO settings (key, value) VALUES
  ('tip_bkash', '01XXXXXXXXXX'),
  ('tip_nagad', '01XXXXXXXXXX'),
  ('tip_card', 'buymeacoffee.com/yourname'),
  ('tip_bank', '1234567890 · Dutch-Bangla')
ON CONFLICT (key) DO NOTHING;
```

## Vercel Deploy

1. Push to GitHub
2. Import on vercel.com → set root dir to `artifacts/money-maestro`
3. `vercel.json` auto-applies: builds with `vite.config.vercel.ts`, rewrites to `/index.html`

## Architecture decisions

- Single `index.html` file: all CSS, HTML, and JS inline — no bundling needed
- Supabase via CDN: `window.supabase.createClient()` used directly
- `main.tsx` is a no-op export so Vite's module graph doesn't complain
- Currency symbol persisted in `localStorage` under key `mm_sym`
- Dates stored as ISO strings, displayed as DD/MM/YYYY
- Charts: Chart.js@4.4.0 via jsdelivr CDN, instances stored in `charts` object
- Confirm dialog: generic `openCF({ico,title,msg,ok,cb})` helper
- Dark theme with CSS custom properties (`--bg`, `--surf`, `--orange`, etc.)

## Gotchas

- After changing `index.html`, Vite HMR picks it up automatically — no restart needed
- The `main.tsx` entry just exports `{}` — all real logic is in `index.html`'s `<script>` tag
- RLS must be enabled on the `transactions` table in Supabase for user isolation
- Charts use `dstChart(id)` before rebuild to prevent Canvas reuse errors
- `vite.config.ts` requires PORT + BASE_PATH (Replit workflow provides them)
- `vite.config.vercel.ts` is the Vercel-safe version (no env var requirements)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
