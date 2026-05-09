# 🏃 Backyard Ultramarathon Live Tracker — Initiale Planung & Implementierung

## Kontext & Ziel

Baue eine **Live Tracker Web-App** für einen Backyard Ultramarathon in Augsburg. Freunde des Läufers sollen seine Leistung in Echtzeit von zuhause verfolgen können. Die Crew vor Ort (nicht-technisch, Smartphone) pflegt die Daten über ein einfaches passwortgeschütztes Admin-Panel.

**Backyard Ultra Regel**: Der Läufer muss jede Stunde eine fixe Runde (6,7 km) abschließen. Wer die Deadline verpasst, scheidet aus.


## Zielgruppen

| Zielgruppe | Zugang | Tech-Level |
|---|---|---|
| Freunde & Familie | Öffentliche View-Seite `/` | Keine Anforderungen |
| Crew vor Ort | Admin-Panel `/admin` (Passwortschutz) | Nicht-technisch, Smartphone |
| Entwickler | Supabase Dashboard + Vercel | Fortgeschritten |

---

## Tech Stack (fix, keine Alternativen)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4
- **Sprache**: TypeScript
- **Realtime**: Supabase Realtime Subscriptions (Websocket)
- **Deployment**: Vercel (Free Tier, zero-config via GitHub)

### Backend / Datenbank
- **BaaS**: Supabase (Free Tier, Region: Frankfurt `eu-central-1`)
- **Datenbank**: PostgreSQL (relational, SQL)
- **Auth**: Env-Variable-Passwort für Admin (`ADMIN_PASSWORD`) + signiertes HTTP-Cookie via Next.js API Route
- **File Storage**: Supabase Storage (Foto-Upload, max. 1 Foto pro Runde, Public Bucket)
- **Realtime**: Supabase Postgres Changes

### Libraries
- `@supabase/supabase-js` – Client SDK
- `@supabase/ssr` – Server-Side Integration Next.js
- `lucide-react` – Icons
- `date-fns` – Zeitformatierung

---

## MVP Feature-Scope

### ✅ In Scope (Pflicht)
- Öffentliche Live-View mit Realtime-Updates
- Countdown bis nächste Runden-Deadline
- Admin-Panel mit Passwortschutz (Env-Variable)
- Runde loggen (1 Button)
- Zustand setzen (4 Emoji-Buttons)
- Optionales Crew-Notiz-Feld
- Optionaler Foto-Upload (1-5 Foto/Runde, Supabase Storage)
- Aktivitätsfeed (Runden-Timeline)
- Nachrichten-Wand (Freunde können schreiben)
- Mobil-optimiert (Smartphone-first für Admin)
- Dark Mode als Standard