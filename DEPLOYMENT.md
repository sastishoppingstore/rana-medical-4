# Deployment (clinic 4)

## Vercel (single serverless function)
Vercel project `rana-medical-clinic4` — production URL `https://rana-medical-clinic4.vercel.app`.
All 31 backend handlers live in `server/handlers/` and are routed by one function: `api/[...path].js`
(Hobby plan limit: 12 functions per project).
Env: `DATABASE_URL` (Supabase transaction pooler, port 6543) + the two `VITE_*` keys for the frontend build.

## Firebase (static export at /clinic4)
```bash
VITE_BASE_PATH=/clinic4 VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... VITE_API_BASE=https://rana-medical-clinic4.vercel.app npm run build
# copy dist/ to the Firebase Hosting directory under /clinic4
```
The SPA router uses basename `/clinic4`; deep links fall back to `/clinic4/index.html` via a Hosting rewrite.

## Database
`postgres` database (27 tables) with Row Level Security enabled; the app uses Supabase Auth
(`demo@ranamedical.pk` / `demo1234`, `admin@ranamedical.pk` / `Admin@123`).
