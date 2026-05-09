# Handoff — Sprint 3 abgeschlossen

## Projekt
**Last One Standing Augsburg** — Backyard Ultra Live-Tracker. Freunde verfolgen Kilian in Echtzeit; Crew vor Ort pflegt Daten per Smartphone-Admin-Panel (Sprint 3).

## Was fertig ist

### Sprint 1 — Infrastruktur
- **Next.js 16** (App Router, TypeScript, Turbopack) + **Tailwind CSS v4** (`@import "tailwindcss"`, Dark Mode als Default via CSS Custom Properties)
- **Supabase-Projekt** `ultratracker`, Region `eu-central-1` (Frankfurt) — vollständiges Schema live
- **Supabase-Clients** typisiert mit `<Database>`-Generic in `lib/supabase/`:
  - `client.ts` — Browser (`createBrowserClient<Database>`)
  - `server.ts` — Server Components / Route Handlers (`createServerClient<Database>` + Cookie-Bridge)
  - `admin.ts` — Service-Role für Admin-Writes
  - `database.types.ts` — generierte TypeScript-Types für alle Tabellen & Enums
- **Vercel-Projekt** `ultra-tracker` — Production live: https://ultra-tracker.vercel.app
- Alle Env-Vars in Vercel gesetzt (Production + Preview + Development)

### Sprint 3 — Admin-Authentifizierung
- **Auth-Layer** komplett ohne Supabase Auth: `ADMIN_PASSWORD` (env) + signiertes HTTP-Only-Cookie `bua_admin`
- **`jose` 6.x** für JWT (HS256, 24 h TTL, `SESSION_SECRET`-signiert)
- **`proxy.ts`** (Next.js 16 Proxy — früher `middleware.ts`): schützt alle `/admin/*`-Routen außer `/admin/login`; bei gültigem Cookie auf Login → Redirect zu `/admin`
- **API-Route `/api/admin/login`** (POST): timing-safe Compare (`crypto.timingSafeEqual`), Rate-Limit (5 Versuche / 60 s per IP, In-Memory), Cookie setzen
- **API-Route `/api/admin/logout`** (POST): Cookie löschen → Redirect `/admin/login`
- **Login-Seite `/admin/login`**: Race-Ops Terminal Stil, Barlow Condensed, fehlerspezifische Messages (`?error=invalid`, `?error=rate_limit`)
- **Admin-Layout** (`app/admin/layout.tsx`): sticky Header "Crew Panel" + Logout-Button
- **Stub-Dashboard** `/admin`: Platzhalter für Sprint 4

### Sprint 2 — Public Live View
- **Öffentliche Startseite** `/` — vollständig implementiert, kein Admin-Zugang nötig
- **Realtime** via Supabase `postgres_changes` — Updates in `laps`, `runner_state`, `messages` erscheinen < 2 s ohne Reload
- **Hero** (100 svh, Dark Mode): riesige Lap-Zahl (Barlow Condensed Black Italic), Status-Emoji, sekundengenauer Countdown mit Ampelfarben (grün/gelb/rot)
- **Activity Feed**: alle Runden chronologisch absteigend, Dauer, optionale Notiz, Foto-Thumbnails
- **Nachrichten-Wand**: Read-only, deutsches Datumsformat (date-fns/locale/de)
- **Connection-Indikator**: grüner Dot (Live) / gelb bei Verbindungsfehler
- **Event-Konstanten** in `lib/config.ts`: Runner-Name, Event-Name, Race-Start, Rundenparameter

## Datenbankschema (Supabase, 8 Migrationen)

### Tabellen

| Tabelle | Zweck | Besonderheiten |
|---|---|---|
| `laps` | Eine Runde pro Eintrag | `duration_seconds` generated column (auto aus `completed_at - started_at`) |
| `runner_state` | Aktueller Zustand des Läufers | Single-Row (id = 1), `updated_at`-Trigger |
| `messages` | Nachrichten-Wand | Anon kann schreiben, CHECK auf Länge |
| `photos` | Fotos pro Runde (1–5) | FK auf `laps` (cascade delete), Pfade in Storage |

### Enum
`runner_status`: `running` | `resting` | `struggling` | `done`

### RLS & Zugriff
- Alle Tabellen: RLS aktiviert, `anon`/`authenticated` darf SELECT
- `messages`: `anon`/`authenticated` darf INSERT (body ≤ 280, name ≤ 40 Zeichen)
- INSERT/UPDATE/DELETE auf `laps`, `runner_state`, `photos` → nur Service-Role
- Data API: GRANTs für `anon`/`authenticated` gesetzt

### Realtime
- `replica identity full` auf allen 4 Tabellen
- Publication `supabase_realtime` enthält alle 4 Tabellen

### Storage
- Public Bucket `lap-photos` (`public = true`)
- Pfad-Konvention: `lap-{lap_number}-{timestamp}.jpg`
- Kein Listing via API (Security); Public-URLs funktionieren direkt

## Projektstruktur

```
ultraTracker/
├── app/
│   ├── globals.css             # Tailwind v4, Dark-Mode-Tokens, --accent #b8ff57
│   ├── layout.tsx              # Root Layout, lang="de", Barlow Condensed + Geist
│   ├── page.tsx                # Async Server Component — fetcht Initial-Daten, rendert LiveDashboard
│   ├── admin/
│   │   ├── layout.tsx          # Admin-Shell: sticky Header "Crew Panel" + Logout-Form
│   │   ├── page.tsx            # Stub-Dashboard (Sprint 4)
│   │   └── login/
│   │       └── page.tsx        # Login-Formular (POST → /api/admin/login)
│   └── api/admin/
│       ├── login/route.ts      # POST: timing-safe compare, rate-limit, JWT-Cookie setzen
│       └── logout/route.ts     # POST: Cookie löschen, Redirect Login
├── components/live/
│   ├── LiveDashboard.tsx       # 'use client' — Realtime-Hub, hält gesamten State
│   ├── Hero.tsx                # 100svh Hero: Lap-Zahl, Status, Countdown
│   ├── Countdown.tsx           # 'use client' — setInterval, Ampelfarben
│   ├── ConnectionIndicator.tsx # Verbindungsstatus-Dot
│   ├── ActivityFeed.tsx        # Runden-Timeline mit Fotos
│   └── MessageWall.tsx         # Read-only Nachrichten-Wand
├── lib/
│   ├── config.ts               # Konstanten: RUNNER_NAME, EVENT_NAME, RACE_START_AT, etc.
│   ├── auth.ts                 # COOKIE_NAME, SESSION_TTL_SECONDS, signSession(), verifySession()
│   ├── rate-limit.ts           # checkRateLimit(ip): In-Memory Sliding Window (5/60s)
│   ├── utils/
│   │   ├── time.ts             # getNextDeadline, formatCountdown, formatDuration
│   │   └── status.ts           # runner_status → Emoji + Label + Farbe
│   └── supabase/
│       ├── client.ts           # createBrowserClient<Database>
│       ├── server.ts           # createServerClient<Database>
│       ├── admin.ts            # Service-Role für Admin-Writes (Sprint 4)
│       └── database.types.ts   # generierte DB-Types
├── proxy.ts                    # Next.js 16 Proxy: schützt /admin/*, außer /admin/login
├── .env.example                # Alle benötigten Var-Namen
└── SPRINTS.md                  # Vollständiger Sprintplan
```

## Env-Variablen

`.env.local` befüllen (Werte aus Vercel Dashboard oder Supabase Dashboard):

| Variable | Woher |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role |
| `ADMIN_PASSWORD` | frei wählen |
| `SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |

## Lokales Setup

```bash
pnpm install
cp .env.example .env.local
# .env.local befüllen
pnpm dev
```


## Nächster Sprint

**Sprint 4 — Admin-UI** (`/admin`)
- Runde loggen (1-Tap-Button) → INSERT in `laps` via Service-Role (`lib/supabase/admin.ts`)
- Zustand setzen (4 Status-Buttons: `running` / `resting` / `struggling` / `done`) → UPDATE `runner_state`
- Optionales Crew-Notiz-Feld (wird an `laps.note` gespeichert)
- Foto-Upload (1–5 Fotos/Runde, Supabase Storage Bucket `lap-photos`, Pfad `lap-{lap_number}-{timestamp}.jpg`)
- Smartphone-optimiert (große Touch-Targets, kein Scrollen beim Kernflow)

## Tech-Stack

Next.js 16 · Tailwind v4 · TypeScript · Supabase (Postgres + Realtime + Storage) · Vercel · pnpm · jose · date-fns · lucide-react · Barlow Condensed (Google Fonts)
