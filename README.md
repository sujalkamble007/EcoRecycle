<div align="center">

# EcoRecycle ♻️ — AI-powered E‑waste Classification & Pickup

Every year, over 50 million tonnes of e‑waste are generated globally, but only ~20% is formally recycled. EcoRecycle helps close this gap by making it effortless to identify e‑waste with AI and schedule doorstep pickups.

</div>

## Motivation

Improper e‑waste disposal contaminates soil and water with heavy metals, harms informal workers, and wastes recoverable materials like copper and gold. While users are often willing to recycle, the friction of identifying items and arranging proper disposal stops them.

EcoRecycle removes that friction:
- Identify your e‑waste instantly with AI from a single photo.
- Get a clear category with confidence and guidance.
- Schedule a pickup at your address in minutes.

## Objectives

- Lower the barrier to responsible e‑waste recycling with a delightful UX.
- Improve classification accuracy with an AI assist and clean UI feedback.
- Make scheduling transparent and fast, capturing all details needed by collectors.
- Keep user data safe using Supabase Auth and Row Level Security (RLS).

## Features

- Email/password authentication (Supabase Auth)
- AI e‑waste classification (Edge Function proxy to AI gateway)
- Guided scheduling flow with validation (Zod)
- Status and success screens with ETA
- Responsive UI with Tailwind + shadcn/ui components
- React Router with protected routes
- Type-safe API client and database typings

## Architecture

- Frontend: React 18 (Vite + TypeScript), Tailwind CSS, shadcn/ui
- State/Data: TanStack Query where applicable, local component state
- Auth: Supabase client-side (persisted sessions, auto refresh)
- Backend: Supabase Edge Function `classify-ewaste` (Deno), calls an AI gateway
- Database: Supabase Postgres with RLS (table: `pickup_requests`)

Key paths:
- App entry: `src/main.tsx`, `src/App.tsx`
- Pages: `src/pages/Index.tsx`, `src/pages/Auth.tsx`, `src/pages/Classify.tsx`, `src/pages/Schedule.tsx`, `src/pages/Success.tsx`
- Supabase client: `src/integrations/supabase/client.ts`
- Edge Function: `supabase/functions/classify-ewaste/index.ts`

## Getting Started (Local)

Prerequisites:
- Node.js 18+ and npm
- A Supabase project (URL and anon key)
- AI gateway key (for the Edge Function) — `LOVABLE_API_KEY`

1) Clone & install

```bash
git clone <YOUR_REPO_URL>
cd ECO
npm install
```

2) Configure environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL="https://<your-project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-anon-key>"
```

Optional (already present in this repo):

```env
VITE_SUPABASE_PROJECT_ID="<project-id>"
```

3) Run the dev server

```bash
npm run dev
```

Visit http://localhost:8080 (or the printed port) to use the app.

## Supabase Setup

1) Create project and retrieve:
- Project URL: Settings → API → Project URL
- anon (public) key: Settings → API → Project API keys → anon key

2) Database schema

This repo includes migrations in `supabase/migrations`. Ensure your `pickup_requests` table exists (nullable coordinates as per latest migration). Apply using the Supabase CLI or Dashboard.

Minimal schema reference:
- `pickup_requests`
	- `id` (uuid, pk)
	- `user_id` (uuid, references auth.users.id)
	- `name`, `email`, `phone`
	- `category` (text)
	- `latitude`, `longitude` (numeric, nullable)
	- `address` (text)
	- `pickup_date` (date)
	- `pickup_time` (time)
	- `confidence_score` (numeric)
	- `image_url` (text)

3) RLS policies

Enable RLS on `pickup_requests` and add policies such as:
- Insert: user can insert rows where `user_id = auth.uid()`
- Select: user can select rows where `user_id = auth.uid()`

4) Edge Function env var

In Supabase: Functions → `classify-ewaste` → Settings → Add env var

```
LOVABLE_API_KEY=<your-ai-gateway-key>
```

## Edge Function: classify‑ewaste

Path: `supabase/functions/classify-ewaste/index.ts`

What it does:
- Accepts `{ image: string }` body (Base64/data URL)
- Calls AI gateway to classify item into: Cable, Battery, TV, Mobile, Laptop, Other
- Returns `{ category: string, confidence: number, description: string }`

Auth & CORS:
- The client sends `Authorization: Bearer <access_token>` when invoking.
- The function includes permissive CORS headers for browser calls.

Local testing (with Supabase CLI):

```bash
supabase functions serve classify-ewaste --env-file ./supabase/.env
```

Client invocation example (already implemented):

```ts
await supabase.functions.invoke('classify-ewaste', {
	body: { image },
	headers: { Authorization: `Bearer ${session.access_token}` },
})
```

## Running the App

Scripts:

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — serve the production build locally
- `npm run lint` — lint the codebase

## Security Notes

- Supabase Auth is configured with persisted sessions and auto refresh.
- Protected pages check session and redirect unauthenticated users to `/auth`.
- Always pass the user’s `access_token` when calling Edge Functions.
- Set proper RLS policies before going to production.

## Deployment

You can host the frontend on any static host (Vercel, Netlify, Cloudflare Pages, etc.).

1) Build:

```bash
npm run build
```

2) Deploy `dist/` to your static host.

3) Make sure environment variables are configured in your host:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

4) Deploy Edge Function via Supabase CLI:

```bash
supabase functions deploy classify-ewaste
supabase secrets set --env-file ./supabase/.env
```

## Troubleshooting

- Auth session missing!
	- Ensure you’re logged in; if the session expired, sign in again.
	- Confirm client includes `Authorization: Bearer <token>` when invoking functions.
	- Check CORS headers in the function and that your Supabase URL/key are correct.

- Sign out doesn’t reflect in UI
	- The app now clears local state and navigates to `/auth` on sign out.
	- If it persists, hard refresh the page to clear stale caches.

## License

MIT — see LICENSE if available, or include your licensing terms here.
