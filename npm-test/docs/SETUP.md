# Setup

This guide connects GatherPlay to a real Supabase project. The offline library, search, filters, detail pages and game finder work without any of these steps. Accounts and live trivia rooms do not.

## Prerequisites

- Node.js 20.9 or newer (tested on Node 24.22.1) and npm.
- A Supabase account and one project. The free tier is enough for a small private test.
- Either the Supabase CLI or access to the project’s SQL editor.
- Optional: Docker Desktop if you want to run the whole Supabase stack locally.

No `DATABASE_URL` or service-role key is needed by the app. It uses the public project URL and anon/publishable key from the browser and server, with RLS and RPCs enforcing access.

## 1. Create the project

1. Create a project at [supabase.com](https://supabase.com).
2. Wait for database provisioning to finish.
3. Open **Project Settings → API** and copy:
   - the project URL, for example `https://abcdefghijklmnop.supabase.co`;
   - the `anon` / publishable key.
4. Do not copy the service-role key into this app.

## 2. Configure the environment

Copy the template:

```bash
cp .env.example .env.local
```

On PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Fill in the four values:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=GatherPlay
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Notes:

- `NEXT_PUBLIC_SITE_NAME` is optional; leaving it out uses `GatherPlay` from `src/lib/site.ts`. Changing it requires a rebuild because it is a public build-time value.
- `NEXT_PUBLIC_SITE_URL` must be the public origin, not a path. In production use the final `https://` origin. It is used as `metadataBase` and for absolute links.
- In production the Supabase URL must be `https://`. A local `http://localhost` or `http://127.0.0.1` URL is accepted only when `NODE_ENV` is not `production` (development or test).
- The anon key is safe to expose only after the migrations below have applied the grants and RLS policies. Never use a service-role key in a `NEXT_PUBLIC_*` variable.
- `.env.local` is git-ignored. Do not commit it. The same values must be added to Vercel for deployment.

Restart `npm run dev` after changing environment values. Public values are read when the server starts and inlined into client bundles.

## 3. Apply the migrations

There are two migrations and their order matters:

1. `supabase/migrations/20261027000100_initial_schema.sql` — tables, indexes, triggers, RLS, grants, RPCs and Realtime publication.
2. `supabase/migrations/20261027000200_catalogue_seed.sql` — ten games and thirty original trivia questions, generated from TypeScript.

### Option A: Supabase CLI (recommended)

```bash
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase db push
```

`supabase link` may ask for the database password. That password is used by the CLI, not by the app. If you are not the project owner, ask for a personal access token and the project reference instead.

Check the history:

```bash
npx supabase migration list
```

### Option B: SQL editor

1. Open the Supabase dashboard → **SQL Editor**.
2. Paste the entire contents of `20261027000100_initial_schema.sql` and run it.
3. Paste the entire contents of `20261027000200_catalogue_seed.sql` and run it.
4. Run the verification queries below.

Both files wrap their work in `begin; ... commit;`. If a statement fails, the transaction rolls back. Do not run the seed before the schema.

### Verify the catalogue

Run this in the SQL editor:

```sql
select count(*) as games from public.games;
select count(*) as questions from public.trivia_questions;
```

Expected result: `10` games and `30` questions. `public.trivia_questions` is private to the browser, so this query must be run in the SQL editor as the project owner, not with the anon key.

If those counts are correct but `/setup` still says the catalogue is not ready, check the project URL and anon key, then reload the page. The setup page reads `public.games` through the anon API.

### Editing the catalogue

`src/data/games.ts` is the canonical catalogue. `src/data/trivia-questions.ts` is the canonical question set. After editing either file:

```bash
npm run generate:seed
```

Commit the regenerated `20261027000200_catalogue_seed.sql`, then apply it again. The seed uses upserts and does not delete rows you added separately.

## 4. Configure auth URLs and email templates

Open **Authentication → URL Configuration** in Supabase.

### Site URL

Use the production origin, for example:

```text
https://your-site.vercel.app
```

For local work, the Site URL can be `http://localhost:3000`. If you use both, add the deployed origin as the Site URL and keep localhost in the redirect allow list. A Site URL pointing at localhost is the usual reason a deployed confirmation email opens the wrong host.

### Redirect URLs

Add every origin and route pair you actually use:

```text
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
https://YOUR-DOMAIN/auth/callback
https://YOUR-DOMAIN/auth/confirm
```

Add Vercel preview URLs separately if you need auth on preview deployments. Do not add a broad wildcard unless you understand which origins can then receive auth redirects.

### Recommended email templates

Use **Authentication → Email Templates**. The token-hash route avoids the PKCE verifier problem that occurs when a confirmation link is opened on a different device from the one that signed up.

**Confirm signup:**

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard
```

**Reset password:**

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
```

These templates return to `/dashboard` or `/reset-password` after confirmation. The app’s `/auth/confirm` route verifies the token hash and creates the session cookie. If you need to preserve a different post-login destination, use the default PKCE flow instead; see the note below.

### Default templates and the PKCE flow

The stock templates use `{{ .ConfirmationURL }}`. The app supports that path through `/auth/callback` and `exchangeCodeForSession`. It works when the link is opened in the same browser that started the signup or reset, because the PKCE verifier is stored in that browser’s cookie. Opening the email on a phone after signing up on a laptop will usually fail with a “link failed” message. The token-hash templates above are more reliable for real gatherings.

### Email confirmation and rate limits

- Keep email confirmation enabled for a public deployment. Disabling it is acceptable only for a short private test.
- Supabase’s built-in email sender has low limits and is not intended for production volume. Configure a custom SMTP provider in **Authentication → SMTP** before inviting a real audience.
- The app uses password authentication only. Social providers are not configured.

## 5. Run and verify locally

```bash
npm run dev
```

Open:

- `/setup` — live environment and catalogue status.
- `/signup` — create an account.
- `/login` — sign in.
- `/dashboard` — saved games and history.
- `/online/trivia` — create or join a room.

A sensible first test:

1. Sign up with a mailbox you can open. Confirm the email and sign in.
2. Open `/games/charades` and save it. Check `/dashboard`.
3. Edit your display name in `/dashboard/settings`.
4. Create a trivia room in one browser profile. Copy the room link.
5. Join as a second confirmed account in a private window or another device.
6. Start the round with two players, answer on both screens, reveal, advance, and finish the game.
7. Refresh one player mid-question. The room should reconnect to the same seat and state.
8. Leave as a player and rejoin while the room is still in the lobby.
9. Let the host leave. The room should close for everyone.
10. Request a password reset and confirm the new password works.

The signup flow sends a confirmation email. If you do not receive it, check spam and the Supabase Auth logs before changing the code.

## 6. Local Supabase (optional)

This requires Docker. It is not needed for a hosted project.

```bash
npx supabase start
npx supabase db reset
```

`npx supabase status` prints the local API URL and anon key. Put them in `.env.local`:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=LOCAL-ANON-KEY
```

Run `npm run dev`. The config accepts local HTTP URLs only outside a production build. A local production build (`npm run build && npm run start`) intentionally rejects an `http://` Supabase URL; use the hosted project or a local HTTPS tunnel for that case.

Local email is captured by the Supabase local mail catcher (Inbucket/Mailpit, depending on CLI version). Use the URL printed by `supabase status` to read confirmation and reset messages. `npx supabase stop` stops the stack.

## 7. Security verification

RLS and grants are part of the schema migration. These checks should behave as follows.

### In the SQL editor (owner/service role)

```sql
-- Should return rows.
select id, slug from public.games order by slug;

-- Should return no rows for a user you have not created.
select id, email from auth.users;
```

The SQL editor bypasses RLS, so do not use it to judge browser permissions.

### From an unauthenticated browser/API client using the anon key

These should be denied (HTTP 401/403, or an empty result where RLS applies):

```text
GET  /rest/v1/trivia_questions?select=id
GET  /rest/v1/favorites?select=game_id
GET  /rest/v1/profiles?select=id
POST /rest/v1/rpc/join_trivia_room
```

`public.games` should be readable by anon; the other tables should not be. After signing in, a player can read only their own profile, saved games and play history. Room reads go through `get_trivia_room_state`, which requires membership.

Do not “fix” a 401 by granting select on `trivia_questions`. That table contains the correct answers. The room RPC deliberately strips the answer until reveal.

### Room-specific checks

- A signed-in non-member calling `get_trivia_room_state` must be rejected.
- A non-host calling `start_trivia_game`, `reveal_trivia_question`, `advance_trivia_room` or `restart_trivia_room` must be rejected.
- `submit_trivia_answer` must not return `is_correct` or points. It returns only submission status and the answered count.
- The leaderboard should not change when answers are submitted; it should change at reveal.

## 8. Delete an account

There is no self-service account-deletion button in this MVP. Use the Supabase dashboard (**Authentication → Users → select user → Delete user**) or the SQL below as the project owner. Deleting the `auth.users` row cascades to the profile, favorites, play history, hosted rooms, room memberships and trivia answers.

Always preview first. Replace the UUID and email with the real values:

```sql
-- Preview the account. Use one identifier, not both, in the delete.
select id, email, created_at, last_sign_in_at
from auth.users
where id = '00000000-0000-0000-0000-000000000000';
-- or
select id, email, created_at, last_sign_in_at
from auth.users
where lower(email) = lower('person@example.com');

-- Destructive and irreversible. Take a backup first.
delete from auth.users
where id = '00000000-0000-0000-0000-000000000000';
```

If the user is hosting a live room, deleting them closes that room through the cascade. Tell the other players before doing this during a game.

For a production service, put deletion behind an authenticated admin process with an audit log rather than running ad-hoc SQL. Do not expose a service-role key to the browser to implement it client-side.

## 9. Troubleshooting

If a step fails, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md). The most common causes are:

- The seed migration was not applied, so `/setup` reports no catalogue.
- The Supabase Site URL still points at localhost, so email links open the wrong origin.
- A public environment value changed but the app was not rebuilt or redeployed.
- The anon key is actually a service-role key, or the URL/key belong to different projects.
- The browser is using an old build after a migration or environment change.

## 10. Deployment

The Vercel checklist, production environment variables and post-deploy smoke test are in [DEPLOYMENT.md](DEPLOYMENT.md).
