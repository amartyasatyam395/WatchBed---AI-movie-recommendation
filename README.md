# WatchBed: Find what you're feeling

A React (JavaScript) website. Pick how you feel and how you want to feel; get movie and TV matches ranked by a transparent score.

## Run it
1. Install Node.js 20.6 or newer (nodejs.org).
2. Get a free TMDB v3 API key: https://www.themoviedb.org/settings/api
3. `cp .env.example .env` and paste the key after `TMDB_API_KEY=`
4. `npm install`, then `npm run dev`, and open http://localhost:5173

## Test
`npm test` (scoring engine, sample data only).

## Deploy as a website
`npm run build` then `npm start` serves the site and API together on port 3001 (works on Render, Railway, Fly.io; set `TMDB_API_KEY` as an environment variable there). Vercel/Netlify would need the two API routes in `server/index.js` converted to serverless functions.

## Where things are
- `src/moods.js`: the 10 emotions and genre weights (tune these).
- `src/scoring.js`: score = 50% mood fit + 20% comfort + 20% rating quality + 10% popularity. Explanations are templates from real TMDB data, top 5 only.
- `server/`: Express API; the TMDB key stays on the server.
- `src/App.jsx`: all screens.

## Known limits
Content limit is genre-based, not official certifications. Not yet verified against live TMDB (no access when built). Re-check TMDB terms and limits before a public launch. Not built: friend/social features, offline sync, feedback learning, AI wording layer, richer animations. Stage 2 has been built but not yet tested against a live Supabase project.

## Stage 2 setup (accounts, watchlists, ratings)
The site works without this (guest mode). To turn accounts on:
1. Create a free project at supabase.com (check current free-tier limits first).
2. SQL Editor > New query > paste `supabase/migration.sql` > Run. This creates the tables and the security rules that lock each row to its owner.
3. Authentication > Providers > Google: enable it. You need a Google Cloud OAuth client (Web); paste its client ID and secret, and add Supabase's callback URL shown on that page to Google's "Authorized redirect URIs".
4. Authentication > URL Configuration: set Site URL to your site (http://localhost:5173 for local), and add the same under Redirect URLs.
5. In `.env`, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings > API). Use the anon key only, never service_role. Restart `npm run dev`; rebuild before deploying.
6. Optional: for private-by-default data, nothing more is needed. Every table only returns the signed-in user's rows.

What you get: Google sign-in, any number of named lists (create, delete, add/remove titles), watched flag, 1-5 star rating, and a "My library" page (`#/library`). Ratings and watched are stored separately from list membership, ready for the later learning step.
