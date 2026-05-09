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


## Sprint 3 — Admin-Authentifizierung

**Ziel**: `/admin` ist hinter passwortbasiertem Login. Kein Supabase Auth — nur eine Env-Variable
und ein signiertes HTTP-Only-Cookie.

### Recherche
- `find-docs`: Next.js Middleware (Edge-Runtime), Cookie-Setzen in API-Routes.
- `find-docs`: `iron-session` **oder** `jose` (JWT signieren mit `SESSION_SECRET`) — Entscheidung im Sprint.
- `find-docs`: Best Practices für `httpOnly`, `secure`, `sameSite=strict`, Session-Lifetime.

### MCPs
- `plugin:vercel` → Env-Variablen `ADMIN_PASSWORD`, `SESSION_SECRET` in Preview + Production setzen.

### Skills
- `vercel:routing-middleware` (Schutz von `/admin/*` per Middleware).
- `vercel:env-vars` (Secrets korrekt verwalten, niemals `NEXT_PUBLIC_`).
- `vercel:auth` (Quervergleich mit Marketplace-Auth — bewusst NICHT genutzt im MVP, aber Pattern-Quelle).
- `find-docs`.

### Detailbeschreibung
- Login-Seite `/admin/login`: Single-Input (Passwort) + Submit-Button.
- API-Route `/api/admin/login`: Vergleicht plaintext mit `process.env.ADMIN_PASSWORD` (timing-safe Compare). Erfolgreich → setzt signiertes Cookie `bua_admin` (TTL 24 h, HTTP-Only, Secure, SameSite=Strict).
- API-Route `/api/admin/logout`: Cookie löschen.
- Middleware `middleware.ts`: Schützt alle `/admin`-Routen (außer `/admin/login`). Kein gültiges Cookie → Redirect zu Login.
- Rate-Limit-Schutz auf Login-Route: einfacher In-Memory-Counter pro IP (für MVP ausreichend, da Single-User).
- Logout-Button im Admin-Header.

### Akzeptanzkriterien
- Falsches Passwort → 401, kein Cookie gesetzt.
- Richtiges Passwort → Redirect `/admin`, Cookie sichtbar.
- Direkter Aufruf `/admin` ohne Cookie → Redirect Login.
- Cookie ablaufen lassen / löschen → Redirect Login.

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
