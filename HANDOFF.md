# Handoff — Sprint 1 abgeschlossen

## Projekt
Backyard Ultra Live-Tracker für Augsburg. Freunde verfolgen einen Läufer in Echtzeit; Crew vor Ort pflegt Daten per Smartphone-Admin-Panel.

## Was fertig ist

- **Next.js 16** (App Router, TypeScript, Turbopack) + **Tailwind CSS v4** (`@import "tailwindcss"`, Dark Mode als Default via CSS Custom Properties)
- **Supabase-Projekt** `ultratracker`, Region `eu-central-1` (Frankfurt) — **vollständiges Schema live**
- **Supabase-Client-Skeleton** in `lib/supabase/`:
  - `client.ts` — Browser (`createBrowserClient`)
  - `server.ts` — Server Components / Route Handlers (`createServerClient` + Cookie-Bridge)
  - `admin.ts` — Service-Role für Admin-Writes
  - `database.types.ts` — **neu**: generierte TypeScript-Types für alle Tabellen & Enums
- **Vercel-Projekt** `ultra-tracker` — Production live: https://ultra-tracker.vercel.app
- Alle Env-Vars in Vercel gesetzt (Production + Preview + Development)

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
│   ├── globals.css             # Tailwind v4, Dark-Mode-Tokens
│   ├── layout.tsx              # Root Layout, lang="de"
│   └── page.tsx                # Placeholder-Landing
├── lib/supabase/
│   ├── client.ts
│   ├── server.ts
│   ├── admin.ts
│   └── database.types.ts       # NEU: generierte DB-Types
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

## Nächster Schritt — Sprint 2

**UI + Realtime-Bindings** — öffentliche Live-View und Admin-Panel:

- Öffentliche `/`-Seite: Countdown bis Runden-Deadline, aktueller Zustand, Aktivitätsfeed, Nachrichten-Wand
- Admin `/admin`: Passwortschutz, Runde loggen, Zustand setzen, Notiz + Foto-Upload
- Supabase Realtime Subscription (Websocket) für `laps`, `runner_state`, `messages`
- Foto-Upload via Service-Role gegen Storage Bucket `lap-photos` (max. 5/Runde — Validierung in API-Route)

Details: `SPRINTS.md` → Sprint 2.

## Tech-Stack

Next.js 16 · Tailwind v4 · TypeScript · Supabase (Postgres + Realtime + Storage) · Vercel · pnpm
