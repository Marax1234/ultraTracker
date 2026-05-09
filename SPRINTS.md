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



## Sprint 5 — Aktivitätsfeed & Nachrichten-Wand

**Ziel**: Public-View zeigt vollständige Timeline; Freunde können Nachrichten posten, die live erscheinen.

### Recherche
- `find-docs`: Supabase Realtime — Filter auf Channels (z. B. nur neue `messages` ab `created_at > now()`).
- `find-docs`: Form-Validation in Next.js Server Actions, FormData-Pattern.
- Skill `vercel:vercel-firewall` einlesen (Rate-Limit-Optionen für die Public-Insert-Route).

### MCPs
- `plugin:supabase` → `execute_sql` für Spam-Test-Inserts, `get_advisors` zur Re-Validierung der RLS.

### Skills
- `frontend-design:frontend-design` (Nachrichten-Wand soll fröhlich/feiernd wirken, nicht wie ein generisches Forum).
- `vercel:vercel-firewall` (optional WAF-Regel pro IP für `/api/messages`).
- `vercel:react-best-practices`.
- `find-docs`.

### Detailbeschreibung
- Aktivitätsfeed (aus Sprint 2 erweitert): Jede Runde als Karte mit Rundenzahl, Dauer, Notiz, Foto-Thumbnail (Click → Lightbox). Animation `fade-in slide-up`, wenn neue Runde via Realtime ankommt.
- Nachrichten-Wand: Eigener Bereich unter dem Feed. Form mit zwei Feldern: Name (max 40), Nachricht (max 280). Button "Anfeuern!".
- Nach Submit: Optimistisches UI (Nachricht erscheint sofort), Server validiert und persistiert. Bei Fehler: Nachricht entfernen + Toast.
- Anti-Spam (MVP-Niveau): Honeypot-Feld + Mindest-Delay 5 s seit Pageload + Längen-Validierung serverseitig. Kein CAPTCHA.
- Anzeige: Letzte 50 Nachrichten, neue oben, mit Zeitstempel ("vor 3 min").

### Akzeptanzkriterien
- Neue Nachricht erscheint bei allen geöffneten Clients <2 s.
- Nachricht >280 Zeichen wird abgelehnt (clientseitig + serverseitig).
- Honeypot ausgefüllt → Insert wird (still) verworfen, kein 400.




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
