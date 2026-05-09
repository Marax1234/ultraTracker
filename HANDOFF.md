# Handoff — Sprint 5 abgeschlossen

## Projekt
**Last One Standing Augsburg** — Backyard Ultra Live-Tracker. Freunde verfolgen Kilian in Echtzeit; Crew vor Ort pflegt Daten per Smartphone-Admin-Panel. Freunde können Kilian live anfeuern (Sprint 5 fertig).

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
- **`proxy.ts`** (Next.js 16 Proxy): schützt alle `/admin/*`-Routen außer `/admin/login`; bei gültigem Cookie auf Login → Redirect zu `/admin`
- **API-Route `/api/admin/login`** (POST): timing-safe Compare (`crypto.timingSafeEqual`), Rate-Limit (5 Versuche / 60 s per IP, In-Memory), Cookie setzen
- **API-Route `/api/admin/logout`** (POST): Cookie löschen → Redirect `/admin/login`
- **Login-Seite `/admin/login`**: Race-Ops Terminal Stil, Barlow Condensed, fehlerspezifische Messages (`?error=invalid`, `?error=rate_limit`)
- **Admin-Layout** (`app/admin/layout.tsx`): sticky Header "Crew Panel" + Logout-Button

### Sprint 2 — Public Live View
- **Öffentliche Startseite** `/` — vollständig implementiert, kein Admin-Zugang nötig
- **Realtime** via Supabase `postgres_changes` — Updates in `laps`, `runner_state`, `messages` erscheinen < 2 s ohne Reload
- **Hero** (100 svh, Dark Mode): riesige Lap-Zahl (Barlow Condensed Black Italic), Status-Emoji, sekundengenauer Countdown mit Ampelfarben (grün/gelb/rot)
- **Activity Feed**: alle Runden chronologisch absteigend, Dauer, optionale Notiz, Foto-Thumbnails
- **Nachrichten-Wand**: Read-only, deutsches Datumsformat (date-fns/locale/de)
- **Connection-Indikator**: grüner Dot (Live) / gelb bei Verbindungsfehler
- **Event-Konstanten** in `lib/config.ts`: Runner-Name, Event-Name, Race-Start, Rundenparameter

### Sprint 5 — Aktivitätsfeed & Nachrichten-Wand
- **`components/live/MessageWall.tsx`** (Client Component, rebuilt): Zeigt Nachrichten + eingebettetes Anfeuern-Formular (Name max 40, Body max 280 mit Live-Counter), optimistisches UI via `useState` + `useTransition`, Toast bei Fehler
- **`lib/actions/messages.ts`** (neuer Server Action `postMessage`): Honeypot-Check, Mindest-Delay 5 s seit Pageload, serverseitige Längenvalidierung, IP-basiertes Rate-Limit (5/min), anon-INSERT in `messages`, gibt echte DB-Row zurück
- **`lib/rate-limit.ts`** erweitert: `checkRateLimit(key, opts?)` — parametrisierbar ohne Breaking-Change für admin-login
- **`components/live/ActivityFeed.tsx`** (Client Component): Foto-Thumbnails öffnen Lightbox (statt `<a target="_blank">`), neue Lap-Karten via Realtime bekommen `animate-fade-slide-up`
- **`components/live/Lightbox.tsx`** (neu): Fullscreen-Overlay, ESC + Backdrop-Click schließen, X-Button
- **`components/live/LiveDashboard.tsx`** erweitert: trackt `newLapIds` (Set aller Laps nach Mount), dedupliziert Messages per id, reicht `onMessagePosted`-Callback an MessageWall
- **`app/globals.css`** erweitert: `@keyframes fadeSlideUp` + `.animate-fade-slide-up`

### Sprint 4 — Admin-Panel: Runden-Logging, Status, Notiz, Foto-Upload
- **`app/admin/page.tsx`** (Server Component, `force-dynamic`): lädt `runner_state` + letzten Lap, berechnet `nextLapNumber`, rendert `AdminPanel`
- **`app/admin/AdminPanel.tsx`** (Client Component): vollständige Admin-UI mit optimistischem State (`useTransition`)
  - 4 Status-Buttons (2×2 Grid, ≥64 px, aktiver Status hervorgehoben)
  - Notiz-Textarea (max. 280 Zeichen)
  - Foto-Picker (max. 5 Fotos, `accept="image/*" capture="environment"`)
  - Riesiger Primary-Button „Runde X abschließen" (≥68 px, Akzentfarbe), Doppel-Tap-Schutz
  - Toast-Banner (Success/Error, 3,5 s Autohide)
  - Collapsible Race-Start-Editor (verschiebbarer offizieller Starttermin)
- **`app/admin/actions.ts`** — Server Actions (alle mit `requireAdmin()`-Guard):
  - `logLap(formData)` — berechnet Lap-Nummer und `started_at` nach Backyard-Stundenraster, inserted `laps`-Row (ohne `duration_seconds` — generated column), updated `runner_state.current_lap`, lädt Fotos in Storage hoch, inserted `photos`-Rows; Foto-Fehler brechen Lap-Log nicht ab
  - `setStatus(formData)` — updated `runner_state.current_status`
  - `setRaceStart(formData)` — updated `runner_state.race_started_at` (Crew kann Startzeit nach hinten schieben)
- **`lib/auth.ts`** erweitert: `requireAdmin()` — liest `bua_admin`-Cookie, verifiziert JWT, redirectet zu `/admin/login` bei Fehler
- **`lib/utils/photo-compress.ts`** — `compressPhoto()` via `browser-image-compression` (≤500 KB, ≤1280 px, WebWorker)
- **Schemaänderung** (Migration `add_race_started_at`): neue Spalte `runner_state.race_started_at timestamptz`, Default `2026-05-09T13:00:00Z` (= 15:00 CEST)
- **`browser-image-compression 2.0.2`** als neue Dependency

## Lap-Berechnung (Backyard-Stundenraster)
- `lap_number` = letzter `laps.lap_number` + 1
- `started_at` = `race_started_at + (lap_number − 1) × 60 min`
- `completed_at` = `now()`
- `duration_seconds` wird von Postgres als generated column automatisch berechnet

## Datenbankschema (Supabase, 9 Migrationen)

### Tabellen

| Tabelle | Zweck | Besonderheiten |
|---|---|---|
| `laps` | Eine Runde pro Eintrag | `duration_seconds` generated column (auto aus `completed_at - started_at`) |
| `runner_state` | Aktueller Zustand des Läufers | Single-Row (id = 1), `updated_at`-Trigger, `race_started_at` für verschiebbaren Start |
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
- Pfad-Konvention: `lap-{lap_number}-{timestamp}-{idx}.jpg`
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
│   │   ├── page.tsx            # Server Component (force-dynamic): lädt State → AdminPanel
│   │   ├── AdminPanel.tsx      # 'use client' — Status-Buttons, Notiz, Foto-Upload, Lap-Button
│   │   ├── actions.ts          # Server Actions: logLap, setStatus, setRaceStart
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
│   ├── auth.ts                 # COOKIE_NAME, SESSION_TTL_SECONDS, signSession(), verifySession(), requireAdmin()
│   ├── rate-limit.ts           # checkRateLimit(ip): In-Memory Sliding Window (5/60s)
│   ├── utils/
│   │   ├── time.ts             # getNextDeadline, formatCountdown, formatDuration
│   │   ├── status.ts           # runner_status → Emoji + Label + Farbe
│   │   └── photo-compress.ts   # compressPhoto() via browser-image-compression
│   └── supabase/
│       ├── client.ts           # createBrowserClient<Database>
│       ├── server.ts           # createServerClient<Database>
│       ├── admin.ts            # Service-Role für Admin-Writes
│       └── database.types.ts   # generierte DB-Types (inkl. race_started_at)
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

## Tech-Stack

Next.js 16 · Tailwind v4 · TypeScript · Supabase (Postgres + Realtime + Storage) · Vercel · pnpm · jose · date-fns · lucide-react · browser-image-compression · Barlow Condensed (Google Fonts)
