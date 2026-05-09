# Backyard Ultra Tracker

Live-Tracking-App für einen Backyard Ultramarathon in Augsburg.

## Setup

```bash
pnpm install
cp .env.example .env.local
# .env.local befüllen (Supabase URL, Keys, Admin-Passwort)
pnpm dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Env-Variablen

| Variable | Beschreibung |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Publishable Key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key — **nur server-seitig**, nie im Client |
| `ADMIN_PASSWORD` | Passwort für Crew-Admin-Panel |
| `SESSION_SECRET` | Mindestens 32 Zeichen, für Cookie-Signierung |

`SUPABASE_SERVICE_ROLE_KEY` → Supabase Dashboard → Settings → API → service_role

## Branch-Strategie

- `main` → Production-Deploy auf Vercel
- Feature-Branches → automatische Preview-URLs auf Vercel

## Tech Stack

Next.js 16 · Tailwind CSS v4 · TypeScript · Supabase (Frankfurt) · Vercel
