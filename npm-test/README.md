# GatherPlay

A mobile-first party games MVP: ten complete offline games, a transparent game finder, optional accounts and saved games, and one genuinely real-time online game, **Party Trivia**.

The default product name is **GatherPlay**. It is configured in one place at runtime through `NEXT_PUBLIC_SITE_NAME`; if the variable is omitted, `src/lib/site.ts` falls back to GatherPlay. The name is used in the wordmark, page copy, metadata and share text. Rebuild after changing it.

## What is included

### Offline collection

- Ten original, fully written game guides: Charades, Two Truths and a Lie, Mafia, Werewolf, Paper Telephone, Who Am I?, Never Have I Ever, Truth or Dare, Would You Rather, and Party Trivia.
- Search across titles, descriptions, materials and categories.
- Filters for player count, time, age, occasion and game style, with a live result count.
- Individually designed game pages with rules, setup, materials, winning condition, variations and a host tip.
- Original SVG game art and local photography. No remote image hotlinks and no stock “testimonial” content.

### Game finder

- A deterministic shortlist driven by occasion, player count, age group, available time, format and style.
- Every recommendation explains why it appears.
- When hard constraints cannot be met, the finder says so and suggests what to widen rather than inventing a result.

### Accounts and library

- Email/password sign-up, sign-in, confirmation, password reset and session handling with Supabase Auth.
- Editable display name.
- Saved games and play history.
- Row-level security so a user can read only their own saved games, history and profile.
- Clear setup states when Supabase is not configured. Nothing pretends to save when there is no backend.

### Party Trivia (online)

- Create a room, join with a six-character code or a shared link, and reconnect after a refresh.
- Host and player roles, a lobby, timed questions, a reveal step, a live leaderboard, final results and replay.
- Six-character codes use an unambiguous alphabet; lookalike characters are stripped on input.
- 2–10 players, 4–12 questions, 10–60 seconds per question. The defaults are 10 players, 8 questions and 20 seconds.
- Correct answers are never included in room state before the reveal. The browser does not receive the answer key.
- Scoring is server-side: 1,000 points for a correct answer plus up to 500 speed points based on the database clock. Points are applied in the reveal transaction, so the visible score cannot leak correctness early.
- Realtime updates through Supabase Realtime, with a five-second polling fallback and a manual refresh control.
- Leaving as host closes the room for everyone. Leaving as a player removes that seat and score. Rooms expire four hours after creation.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.4.3, App Router, React 19.3.1 |
| Language | TypeScript 5.9.3, strict mode |
| Styling | Tailwind CSS 3.4.19, custom CSS tokens |
| Auth and data | Supabase Auth, Postgres, Realtime, RLS, RPC |
| Icons | Lucide |
| Fonts | Fraunces and Manrope via Fontsource, served locally |
| Tests | Node test runner through `tsx`, Playwright |
| Deployment target | Vercel |

The pinned versions are intentional. `next.config.ts` also sets `turbopack.root` so a lockfile in a parent folder cannot make Next infer the wrong workspace root.

## Quick start

Requirements: Node.js 20.9 or newer (tested on Node 24.22.1) and npm. A modern browser is needed for the app; Chrome is used by the Playwright configuration.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

With no Supabase environment variables the offline library, search, filters, detail pages and finder work in full. Account and live-room routes show a setup notice instead of failing or faking a session.

### Run with Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
3. Apply both migrations in `supabase/migrations/`.
4. Add the auth redirect URLs and email templates described in [docs/SETUP.md](docs/SETUP.md).

```bash
npm run build
npm run start
```

The `/setup` page reports whether the environment is present and whether the catalogue tables answer. It cannot apply migrations for you.

> The anon key is designed for the browser. Its safety depends on the grants and RLS policies in the migrations. Never put a service-role key in a `NEXT_PUBLIC_*` variable; this app does not need one at runtime.

## Environment variables

See `.env.example` for the canonical template.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | In deployment | Public origin used for metadata and absolute links. Use `https://` in production. |
| `NEXT_PUBLIC_SITE_NAME` | No | Product name shown throughout the UI. Defaults to GatherPlay. |
| `NEXT_PUBLIC_SUPABASE_URL` | For accounts and rooms | Supabase project URL. `https://` is required in production. Local `http://localhost` / `http://127.0.0.1` URLs are accepted only outside a production build. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For accounts and rooms | Supabase anon/publishable key. Protected by RLS and grants. |

`NEXT_PUBLIC_*` values are baked into the client build. After changing one in Vercel, redeploy; restart the dev server locally.

## Database and auth setup

The complete walkthrough is in [docs/SETUP.md](docs/SETUP.md). The short version:

```bash
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase db push
```

If you do not use the CLI, run these files in order in the Supabase SQL editor:

1. `supabase/migrations/20261027000100_initial_schema.sql`
2. `supabase/migrations/20261027000200_catalogue_seed.sql`

The seed migration is generated from the TypeScript source. After editing `src/data/games.ts` or `src/data/trivia-questions.ts`, run:

```bash
npm run generate:seed
```

Then apply the regenerated migration. Both statements in the seed are upserts, so re-running it does not delete extra rows.

For reliable confirmation and password-reset emails, use the token-hash templates in [docs/SETUP.md](docs/SETUP.md#4-configure-auth-urls-and-email-templates). The default confirmation URL can work through `/auth/callback`, but the token-hash route is more reliable when an email is opened on a different device.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run typecheck` | Run TypeScript without emitting. |
| `npm test` | Run the matching, state and utility unit tests. |
| `npm run test:e2e` | Run Playwright against an existing production build on port 3101. Build first. |
| `npm run generate:seed` | Regenerate the catalogue and trivia seed migration from TypeScript data. |

## Project map

```text
src/
  app/                 Routes, metadata, auth callbacks and server actions
  components/          UI, game art, auth, dashboard and trivia room
  data/                Canonical game catalogue and trivia questions
  lib/                 Supabase clients, matching, room state, utilities
supabase/
  migrations/          Schema, RLS/RPCs, generated catalogue seed
tests/                 Unit tests
e2e/                   Playwright smoke, explorer, finder and responsive tests
docs/                  Setup, deployment and troubleshooting guides
scripts/               Seed generator
public/                Local photography, textures and favicon
```

The canonical catalogue is `src/data/games.ts`. The database seed is generated, not hand-maintained. The browser reads the catalogue from Postgres when configured; the offline pages use the TypeScript data so they remain complete without a backend.

## Testing and verification

Run the local checks:

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`npm run test:e2e` starts `next start` on port 3101 and uses locally installed Chrome via Playwright's `channel: "chrome"`. Build the app first. Unit tests cover the finder matching rules, room-code normalisation, safe redirects, room state parsing and the answer/score rules that can be exercised without a browser.

The Playwright suite covers public routes, the game explorer, the finder, responsive layouts at 320/768/1440px, the mobile menu, reduced motion, touch targets, focus visibility, the 404 page, local image loading, the setup anchors and a game-detail route. It does not create accounts or play a live multiplayer round.

**What was verified against a real backend:** the configured Supabase project answered the public `games` table, and anonymous requests to `trivia_questions`, `favorites`, `profiles` and the `join_trivia_room` RPC were denied. The migrations were applied and the catalogue was seeded.

**What was not verified end to end:** this environment had no test mailboxes or second authenticated browser, so the email confirmation round trip, password reset delivery, and a full host/player game were not exercised live. Those flows are implemented but need a real two-device smoke test. No production deployment was performed from this workspace, so no deployment URL is claimed.

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for the checks to run when you have credentials.

## Known limitations

This is a focused MVP, not a full social platform.

- Only Party Trivia is an online game. The other nine games are in-person guides.
- Online rooms require an account. There is no guest mode.
- The host is fixed. Host migration is not implemented; if the host leaves, the room closes.
- No chat, voice, spectator mode, matchmaking, tournaments, push notifications or native apps.
- No custom question packs or user-submitted questions. The seed contains 30 original questions; a round draws up to 12.
- Rooms are capped at 10 players and expire four hours after creation. Expiry is evaluated lazily when the room is read or acted on; there is no scheduled cleanup worker.
- No avatar upload; profiles store a display name and an optional avatar URL field that the UI does not currently manage.
- Account deletion is a manual Supabase dashboard or SQL operation. The exact step-by-step procedure and SQL are in [docs/SETUP.md](docs/SETUP.md#8-delete-an-account).
- Saved-game and history writes depend on the seeded `games` rows. If the catalogue is missing, the UI links to the migration instructions rather than writing orphan rows.
- No admin UI, analytics, email templates beyond the auth flows, or custom SMTP. Supabase’s built-in email sender has low limits; configure a custom SMTP provider for a public deployment.
- No dark theme. The design is intentionally a warm light editorial palette.
- No automated live-backend test suite in this repository, because tests must not depend on a production project or real email.

## Security notes

- Correct trivia answers live only in `public.trivia_questions`, which has no browser grants. Room state is returned by a `security definer` function that withholds the answer and explanation until the room reaches `reveal`.
- Answers are accepted only while the database clock says the question is open. Correctness and points are computed server-side; the submit RPC does not return either.
- Scores are applied only by the reveal path. A late answer cannot be scored into an already revealed question.
- RLS limits room reads to members, and direct writes to rooms, players, answers and scores are not granted. Room creation and gameplay go through RPCs with explicit host and membership checks.
- The service-role key is not used at runtime and must never be exposed as a `NEXT_PUBLIC_*` value.
- Questions are original writing for this project. Do not reuse third-party quiz content without checking its license.

## Photography and assets

Photography is stored locally under `public/images/` and served from the app; there are no remote image hotlinks. Three files retain their Pexels source IDs:

- `pexels-8111356.jpg`
- `pexels-8111359.jpg`
- `pexels-8111365.jpg`

`table-games.jpg` is a local reference image used in the visual direction. Check the source and license before commercial publication. The footer credits Pexels generally. Game illustrations are original SVGs created for this project. If you replace the photography, update `src/app/layout.tsx`, `src/app/page.tsx` and `src/app/games/[slug]/page.tsx` so the Open Graph and hero images stay consistent.

## Documentation

- [Setup](docs/SETUP.md) — Supabase project, environment, migrations, auth URLs and account deletion.
- [Deployment](docs/DEPLOYMENT.md) — Vercel, production environment, auth configuration and a post-deploy checklist.
- [Troubleshooting](docs/TROUBLESHOOTING.md) — setup states, RLS, email links, room errors and test issues.

## License

No license file is included in this workspace. Add an explicit license before publishing or distributing the code. The Pexels photographs and the font packages have their own licenses; the game-writing and SVG illustrations are original to this project.
