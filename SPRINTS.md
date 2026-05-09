# 🏃 Backyard Ultra Live Tracker — Sprintplan

Alle Sprints folgen dem **RUABI-Schema** (Recherche → Umsetzung → Abnahme → Bewertung → Inkrement).
Jeder Sprint listet explizit die zu nutzenden **MCP-Server** und **Skills** auf. Vor jedem Sprint
ist `find-docs` (Context7 via `ctx7`) Pflicht, um sicherzustellen, dass mit den aktuellen API- und
Konfigurations-Ständen gearbeitet wird (Trainingsdaten reichen nicht).

> **Konvention pro Sprint**
> - **Recherche**: Skills/MCPs aufrufen, Doku-Stand prüfen, offene Fragen klären.
> - **Umsetzung**: Kleinste sinnvolle Code-Inkremente; jede Änderung lokal testbar.
> - **Abnahme**: Akzeptanzkriterien händisch durchgehen, Realtime/Mobile prüfen.
> - **Bewertung**: Was lief gut/schlecht? Anpassung des nächsten Sprints.
> - **Inkrement**: Deploybarer Stand auf `main` bzw. Preview-URL.

---

## Sprint 0 — Bootstrap & Infrastruktur-Skelett

**Ziel**: Lauffähiges Next.js-14-Projekt lokal + Vercel-Preview + leeres Supabase-Projekt
(Region Frankfurt). Keine Features — nur das Fundament.

### Recherche (Pflicht vor Sprintstart)
- `find-docs`: Next.js 14 App Router (aktuelle Setup-Schritte, TypeScript-Defaults).
- `find-docs`: Tailwind CSS **v4** (das ist der entscheidende Punkt — v4 unterscheidet sich stark von v3, kein `tailwind.config.js` mehr, neue `@import`-Syntax).
- `find-docs`: `@supabase/supabase-js` und `@supabase/ssr` (aktuelle Cookie-Bridges).
- Skill `vercel:knowledge-update` einlesen, damit Plattform-Stand aktuell ist.

### MCPs
- `plugin:supabase` → `list_organizations`, `create_project` (Region `eu-central-1`), anschließend `get_project_url` und `get_publishable_keys`.
- `plugin:vercel` → `list_teams`, `list_projects`, `get_project` (zum Verlinken nach Repo-Push).

### Skills
- `vercel:bootstrap` (orchestriert Linking + Env-Pull + erste `dev`-Runde).
- `vercel:env-vars` (`.env.local`-Konventionen, OIDC, niemals Secrets ins Repo).
- `vercel:nextjs` (App-Router-Konventionen, `app/`-Struktur).
- `supabase:supabase` (Projekt-Skeleton, Empfehlungen für lokale Entwicklung).
- `find-docs` (siehe oben).

### Detailbeschreibung
- Next.js 14 mit TypeScript, App Router, ESLint aktiv, ohne `src/`-Ordner.
- Tailwind v4 einrichten (CSS-zentrierte Konfiguration, Dark-Mode als Default-Theme via CSS-Custom-Properties).
- `lucide-react` und `date-fns` als Abhängigkeiten installieren — noch nicht verwenden.
- `.env.example` mit `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET`.
- GitHub-Repo erstellen, Vercel-Projekt verlinken, erste Preview-Deploy auf leerem Layout.
- Supabase-Projekt anlegen (Region Frankfurt), Anon-Key in Vercel-Envs (Preview + Production) ablegen.
- Branch-Strategie festlegen: `main` = Production, Feature-Branches → Preview-URLs.

### Akzeptanzkriterien
- `pnpm dev` rendert eine leere Startseite mit Dark-Mode-Hintergrund.
- Vercel-Preview-Deploy ist grün und erreichbar.
- Supabase-Client kann clientseitig instanziiert werden (Konsole zeigt keine Fehler).

---

## Sprint 1 — Datenmodell & RLS

**Ziel**: Vollständiges, getestetes DB-Schema in Supabase. Noch keine UI-Bindung.

### Recherche
- `find-docs`: PostgreSQL — Constraint-Best-Practices, Indizes für Realtime-Workloads.
- `find-docs`: Supabase RLS (Row Level Security) Policies für public-readable / admin-writable Tabellen.
- `find-docs`: Supabase Realtime — welche Tabellen brauchen `replica identity full`?

### MCPs
- `plugin:supabase` → `list_tables` (Ist-Stand prüfen), `apply_migration` (Schema in Versionen anwenden), `get_advisors` (Security-/Performance-Hinweise einholen), `execute_sql` (Test-Daten + Verifikation).

### Skills
- `supabase:supabase` (Migration-Workflow, RLS-Patterns).
- `supabase:supabase-postgres-best-practices` (Index-/Schema-Empfehlungen — Pflicht!).
- `find-docs`.

### Detailbeschreibung
Tabellen (Endkonzept, Migrationen einzeln):
- `laps`: id, lap_number (int unique), started_at, completed_at, duration_seconds, note (text nullable), photo_url (text nullable), created_at.
- `runner_state`: Single-Row-Tabelle (id check = 1) mit current_status (enum: `running`/`resting`/`struggling`/`done`), current_lap, updated_at.
- `messages`: id, author_name (max 40 Zeichen), body (max 280 Zeichen), created_at.
- `photos` (optional als eigene Tabelle, wenn 1:n nötig — sonst nur `photo_url` in `laps`).

RLS-Policies:
- `laps`, `runner_state`, `messages` → SELECT für `anon`.
- INSERT/UPDATE/DELETE nur via Service-Role (Admin-API-Routes).
- `messages` → INSERT für `anon` mit Rate-Limit-Vorbereitung (per-IP-Tabelle oder Edge-Function später; im MVP nur Längenprüfung).

Storage:
- Public Bucket `lap-photos` (read public, write nur Service-Role).
- Pfad-Konvention: `lap-{lap_number}-{timestamp}.jpg`.

Realtime:
- Replication aktivieren für `laps`, `runner_state`, `messages`.

### Akzeptanzkriterien
- `get_advisors` meldet keine Security-Findings.
- Manuelle SELECTs als Anon liefern Daten; INSERTs als Anon werden abgewiesen (außer `messages`).
- Storage-Upload via Service-Role funktioniert; Public-URL ist abrufbar.

---



---

## Querschnitt: Skill- & MCP-Nutzungsregeln

### Vor JEDEM Sprint (nicht verhandelbar)
1. `find-docs` für jede neu berührte Library/SDK/Service-Komponente — Trainingsstand reicht nicht für Tailwind v4, Next.js 14 App Router, Supabase Realtime, etc.

### Während der Umsetzung
- **Schemaänderungen**: ausschliesslich über `plugin:supabase.apply_migration` — nie direkt `execute_sql` für DDL ausser zum Debuggen.
- **Env-Variablen**: ausschliesslich über `vercel:env-vars` und `plugin:vercel`-Tools, nie händisch im Dashboard, damit reproduzierbar.
- **Frontend-Optik**: jede UI-relevante Komponente muss durch `frontend-design:frontend-design` gegangen sein, sonst landet man im generischen AI-Look.
- **React-Code-Reviews**: nach grösseren Änderungen `vercel:react-best-practices` triggern.

### Vor jedem Deploy
- `vercel:verification` end-to-end.
- `plugin:supabase.get_advisors` (Security + Performance).
- `vercel:status` zur Sichtkontrolle der Deployments.

### Verbotene Abkürzungen
- Kein direkter SQL-DDL-Lauf gegen Production ohne Migration.
- Keine Secrets im Repo (auch nicht als `.env.example`-Default).
- Kein `--no-verify` bei Commits, kein Force-Push auf `main`.
- Keine Annahme "weiss ich auswendig" für Library-APIs — `find-docs` ist Pflicht.
