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

## Sprint 6 — Polish, Mobile-Hardening, Edge Cases

**Ziel**: Race-Day-tauglich. Alles, was auf einem Smartphone der Crew bei Sonne, mäßigem Empfang
und Zeitdruck schiefgehen könnte, ist abgefedert.

### Recherche
- `find-docs`: Service Worker / Offline-Verhalten in Next.js (sollen Inserts gequeued werden bei Empfangsverlust?).
- `find-docs`: Web Vitals & Largest Contentful Paint für Hero-Komponenten.
- Skill `vercel:performance-optimizer` durchgehen.

### MCPs
- `plugin:vercel` → `list_deployments`, `get_deployment_build_logs`, `get_runtime_logs` (Production-Logs vor Go-Live prüfen).
- `plugin:supabase` → `get_advisors` (final), `get_logs` (Storage + Postgres).

### Skills
- `vercel:performance-optimizer` (Bilder, Fonts, Bundle-Größe, Edge-Caching).
- `vercel:verification` (End-to-End-Story durchspielen: Tap → API → DB → Realtime → Public-View).
- `vercel:react-best-practices`.
- `simplify` (Codebase-Refactor, ungenutzte Pfade entfernen).
- `find-docs`.

### Detailbeschreibung
- **Edge Cases**:
  - Crew tappt zweimal "Runde abschließen" → kein Duplikat (DB-Unique-Constraint auf `lap_number` + UI-Disable).
  - Foto-Upload schlägt fehl → Runde wird trotzdem geloggt (Foto ist optional), Toast informiert.
  - Realtime-Connection bricht ab → automatischer Reconnect mit Backoff, gelbe Statusleiste.
  - Cookie-Session läuft mitten im Race ab → Re-Login ohne Datenverlust (Notiz/Foto bleibt im State).
  - Falsche Systemzeit auf Crew-Phone → Server `now()` ist Source of Truth, nicht Client-Zeit.
- **Performance**:
  - Foto-Thumbnails als Storage-Transform (`?width=400`).
  - Hero-Statik mit ISR/PPR; Realtime-Layer rein clientseitig.
  - Fonts: System-Stack oder ein einziges variables Font, lokal eingebunden, kein Layout-Shift.
- **Accessibility**:
  - Touch-Targets ≥56px, Kontrast WCAG AA, keine reinen Emoji-Buttons (immer Label dazu).
  - `prefers-reduced-motion` respektieren.
- **Telemetrie**:
  - Vercel Analytics aktivieren, Speed Insights aktivieren.
  - Error-Boundary auf Admin-Routes mit klarer Fehlermeldung.

### Akzeptanzkriterien
- Vercel-Preview gegen DevTools-Throttle "Slow 4G" + "Mid-tier mobile": LCP < 2,5 s.
- Komplettes Race von Lap 1 bis Lap 5 als Trockenübung mit zwei Geräten gleichzeitig (Crew + Zuschauer) ohne Realtime-Aussetzer.
- `vercel:verification` läuft sauber durch.

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
