# Troubleshooting

Start with the symptom. The first table points to the likely area; the sections below give the checks and the actual error strings used by the app.

| Symptom | Start here |
| --- | --- |
| Offline games work, but login or rooms show “Connect Supabase” | [Environment and setup state](#environment-and-setup-state) |
| `/setup` says “Catalogue tables: Needs attention” | [Catalogue and seed](#catalogue-and-seed) |
| Confirmation or reset email opens localhost, or the link fails | [Auth emails](#auth-emails) |
| Sign-in succeeds but the dashboard bounces to login | [Sessions and cookies](#sessions-and-cookies) |
| “Your account is not allowed to do that in this room” | [RLS and permissions](#rls-and-permissions) |
| Room not found, full, already started, or closed | [Rooms](#rooms) |
| Scores stay at zero, or the answer does not reveal | [Scores and reveals](#scores-and-reveals) |
| The “Live” badge never appears | [Realtime](#realtime) |
| Build fails, or Playwright cannot start | [Build and tests](#build-and-tests) |
| A user asks to be deleted | [Account deletion](#account-deletion) |

## Environment and setup state

### The app still shows setup notices

`isSupabaseConfigured()` requires all of the following:

- `NEXT_PUBLIC_SUPABASE_URL` is present and starts with `https://` (or a local `http://localhost` / `http://127.0.0.1` URL outside a production build).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is present and longer than 20 characters.
- Both are non-empty after trimming.

Checks:

1. Confirm you edited `.env.local` in the project root, not `.env.example`.
2. Confirm the values have no quotes, trailing spaces or line breaks.
3. Restart `npm run dev`. Public values are read at startup/build, not on every request.
4. For a production build, confirm the URL is `https://`. A local HTTP URL is rejected intentionally.
5. Run `npm run build` again after changing `NEXT_PUBLIC_*`. Vercel has the same rule: changing the variable is not enough; redeploy.
6. Open `/setup` and look at the live status card. It distinguishes “Not configured” from “Needs attention”.

If the URL and key belong to different Supabase projects, the request usually fails with `Invalid API key` or an empty catalogue. Copy both from the same project.

### I changed the product name and nothing happened

Set `NEXT_PUBLIC_SITE_NAME`, restart the dev server, and rebuild/redeploy for production. If it is unset, `src/lib/site.ts` uses `GatherPlay`. The name is used in the wordmark, copy and metadata; individual game names such as Party Trivia are not renamed.

### The page says “Live rooms are not configured”

This is the room-level guard. It uses the same configuration check. Fix the environment first; reloading the room after a rebuild should show the lobby or the sign-in prompt.

## Catalogue and seed

### “The game catalogue has not been seeded in Supabase yet”

The app can see Supabase but cannot read a game row matching the requested slug. Apply the second migration:

```bash
npx supabase db push
```

Or paste `supabase/migrations/20261027000200_catalogue_seed.sql` into the SQL editor and run it. Then verify:

```sql
select count(*) from public.games;
select count(*) from public.trivia_questions;
```

Expected: 10 and 30.

If the counts are correct and the UI still fails:

- Check that `public.games` has a select grant to `anon` and `authenticated` (the migration creates it).
- Check `NEXT_PUBLIC_SUPABASE_URL`/key are the right project.
- Reload `/setup`. It reads the actual table count, not a cached flag.
- If you changed the catalogue in TypeScript, run `npm run generate:seed` and apply the regenerated file. Editing TypeScript alone does not change Postgres.

### “Game catalogue has not been seeded” appears only for one game

The database has a catalogue, but that slug is missing. The generated seed is an upsert of all ten games. Re-run it. If you deliberately renamed a slug, add a redirect or update links; old saved-game rows reference the old id and need a deliberate migration.

### The seed migration fails

- Run the schema migration first. The seed references tables and constraints that must already exist.
- Check the first error in the SQL output; later errors are often cascading.
- Do not run only the first half of a transaction. Both migrations use `begin; ... commit;`.
- The generated file is large. If your SQL editor has a size limit, use `npx supabase db push` instead.

### PostgREST cannot see a new column or table

The schema cache can lag briefly. Reload the API schema in the dashboard or run:

```sql
notify pgrst, 'reload schema';
```

Do not solve this by exposing extra tables. The app expects the RPC and table grants in the migrations.

## Auth emails

### The email link opens localhost after deployment

This is a Supabase URL configuration problem, not a React problem.

1. Supabase **Authentication → URL Configuration → Site URL** must be the deployed origin.
2. Add `https://YOUR-DOMAIN/auth/callback` and `https://YOUR-DOMAIN/auth/confirm` to the redirect allow list.
3. Set `NEXT_PUBLIC_SITE_URL` in Vercel to the same origin and redeploy.
4. Send a fresh email. Old links keep their old destination.

If you use a custom domain, update all three places: Vercel domain, `NEXT_PUBLIC_SITE_URL`, and Supabase Site URL/redirect list.

### “That sign-in link has expired or has already been used”

- Confirmation and reset tokens are one-time and time-limited. Request a new email.
- Check the Supabase Auth logs for the exact failure.
- If the link was opened on a different device from the one that started the flow, the default PKCE flow can fail because the verifier cookie is on the original device. Switch to the token-hash templates in [SETUP.md](SETUP.md#4-configure-auth-urls-and-email-templates).
- Email scanners that pre-open links can consume a token. Try the link immediately or use a token-hash flow; a corporate scanner may still open it.

### No email arrives

- Check spam and the exact address.
- Check Supabase **Auth → Users** to see whether the user exists.
- Check the Auth logs and email rate limits.
- Supabase’s built-in mailer is heavily rate-limited and not a production service. Configure custom SMTP.
- If you disabled email confirmation for testing, the user can sign in immediately; otherwise the user remains unconfirmed until the link is opened.

### “Email not confirmed”

The account exists but the confirmation link has not been completed. Send a new confirmation from Supabase or disable confirmation temporarily for a private test. Keep confirmation on for a public site.

### Password reset lands on the login page with “link failed”

- The reset template’s `type` must be `recovery`.
- The link must go to `/auth/confirm` with a valid `token_hash`, not just a bare redirect.
- The user must be on the same origin that requested the reset.
- Request a fresh link; a used or expired token is intentionally rejected.

### Custom SMTP works for signup but not reset

Check both the **Confirm signup** and **Reset password** templates. They are separate. Also check the redirect allow list; both flows use a redirect URL.

## Sessions and cookies

### Sign-in succeeds, then `/dashboard` sends me back to login

- The Supabase Site URL must match the origin in the browser. Cookies set on `https://www.example.com` are not available on `https://example.com` if the two hosts differ.
- Do not mix `http://localhost` and `http://127.0.0.1`; they are different cookie origins. Pick one and use it consistently.
- Confirm `NEXT_PUBLIC_SITE_URL` matches the address bar.
- The app refreshes sessions in `src/proxy.ts` (Next.js 16’s proxy file). If you renamed or removed it, stale sessions will not refresh.
- Clear site cookies and sign in again after changing projects or keys.
- If the browser blocks third-party cookies, that is not normally relevant here because Supabase requests are same-site from the app; check extensions/privacy settings if the issue is isolated to one browser.

### Sign-out leaves the dashboard visible

Sign-out clears the Supabase session and refreshes the router. If a cached server component still renders, hard-refresh. If it persists, check that the sign-out handler completed without an error and that cookies for the site origin were actually removed.

### The app redirects a signed-in user away from `/login`

This is intentional. `src/proxy.ts` sends authenticated users from `/login` and `/signup` to `/dashboard`. Sign out first if you need the forms for testing.

## RLS and permissions

### “Your account is not allowed to do that in this room”

The browser saw a `permission denied` error. The likely causes:

- You are signed out or the session expired.
- You are not a member of the room. Room reads require membership.
- You are a player trying a host-only action.
- The schema’s grants were altered or partially applied.

The app maps raw `permission denied` errors to a human-readable message. The underlying Postgres details are in the browser network response and Supabase logs.

### Anonymous API requests return 401

This is expected for `trivia_questions`, `favorites`, `profiles`, `game_rooms`, `room_players`, `trivia_answers` and the gameplay RPCs. `public.games` is the deliberate public read. Do not add anonymous grants to fix a 401.

### A signed-in user cannot read a room they just created

Check:

- The create RPC returned a room id and the host player row was inserted.
- You are using the same Supabase project in the browser and the migration.
- `is_room_member` exists and is executable by `authenticated`.
- The room has not expired (four hours) or been closed.

### The SQL editor can read everything, but the browser cannot

The SQL editor uses the service role and bypasses RLS. That is not a valid test of browser permissions. Test with the anon key and a real signed-in session, or use the Supabase API with the anon key.

### I rotated the anon key and now nothing works

Update `.env.local` and Vercel, then rebuild/redeploy. Also check the Supabase URL; a key from another project produces 401s even if it is a valid key.

## Rooms

### “We could not find a live room with that code”

- Room codes are six characters from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`. The letters I, O and digits 0/1 are excluded. The app strips invalid characters from pasted input.
- The room may have expired (four hours) or been closed by the host.
- You may be pointing at a different Supabase project than the host.
- The code is case-insensitive; the RPC uppercases it.

### “That game has already started”

A new player can join only while the room is in `lobby`. If a round is underway, the host must finish it and restart (which returns the room to the lobby) or create a new room. A player who left mid-game has no seat to reconnect to; rejoin is allowed only in the lobby.

### “This room is full”

The configured maximum is 10 players by default. The host counts as a player. Ask the host to raise the setting when creating a room or remove a player.

### “You are the host. Leaving closes the room”

This is deliberate. There is no host migration. If the host needs to step away, finish or restart the round first, or hand the event to a new room. A host closing the tab without pressing **Leave** does not close the room immediately; it remains until expiry or an explicit leave.

### The room is stuck in `question` after the timer reaches zero

The server is authoritative. The client requests a refresh after the timer, and the polling fallback runs every five seconds. `get_trivia_room_state` lazily moves an expired question to `reveal` and awards points. If it stays stuck:

1. Press the refresh control in the room header.
2. Check the Supabase logs for RPC errors.
3. Confirm the database clock and the room’s `question_ends_at` are in the past.
4. Do not patch the status from the client; direct writes to `game_rooms` are not granted.

### The host’s “Reveal early” button does nothing

- The room must be in `question`, not `lobby`, `reveal` or `results`.
- Only the host can call `reveal_trivia_question`.
- An error banner should appear with the RPC message. If the timer has expired, the room may already have moved to `reveal`; refresh.

### “This question is not accepting answers”

Answers are accepted only during `question` and only before `question_ends_at`. At the deadline the RPC moves the room to `reveal` and rejects the late answer. The UI also locks the options when its display clock reaches zero.

### “Time is up for this question”

The database clock says the question closed. The room is moved to reveal as part of the rejection. Refresh; the answer should be visible.

## Scores and reveals

### Everyone’s score is still zero

This is expected until reveal. Points are awarded by `award_trivia_question` when the room enters `reveal`, not when an answer is submitted. If the room never reaches reveal, no points are applied. Press **Reveal now** after time expires, or wait for the polling/refresh path.

### The score changed before the answer was revealed

That should not happen through this app. Check for a modified database function or a direct SQL update. The migration’s `award_trivia_question` is the only scoring path and is not granted to browser roles. `submit_trivia_answer` does not return correctness.

### The answer key is visible in the browser network tab

It should not be. Room state comes from `get_trivia_room_state`, which nulls `correct_option_index` and `explanation` unless status is `reveal`. If you can see answers earlier:

- Confirm you are running the migration, not an older hand-written schema.
- Confirm the browser is not reading `trivia_questions` directly; it has no select grant.
- Check for a local modification to the RPC or the React state.
- Do not “fix” this by hiding answers in CSS; fix the server response.

### A player answered but their name still says zero correct answers

The per-player correct count is computed from scored answers. It updates at reveal. If a player answered after the deadline, the answer is rejected, not counted.

### Restart does not reset scores

The host can restart only from `results`. `restart_trivia_room` deletes answers, resets scores, clears the question list and returns to `lobby`. If the UI still shows old scores, refresh; a realtime update or the five-second poll should catch up.

## Realtime

### The connection badge says “Auto-refresh” or “Connecting”

The badge is a status aid, not the source of truth. The room still polls every five seconds and offers a manual refresh. Common causes:

- Realtime is disabled or the publication does not contain `game_rooms` and `room_players`.
- The Realtime connection is blocked by a proxy, VPN or browser extension.
- The project is paused or over quota.
- RLS blocks the subscription; members should have select access through the policies.

The migration adds both tables to the `supabase_realtime` publication if it exists and sets `room_players` replica identity to full. If you apply the schema manually, verify that section ran.

### Realtime works for room status but not scores

`room_players` updates carry scores. Confirm the table is in the publication and has replica identity full. The app refetches full room state on any change, so a missed event is recoverable through polling.

### Presence count is wrong

Presence is best-effort and depends on the Realtime channel. The “N online” badge appears only when presence is available. It is not used for scoring, turn order or membership. A stale presence entry clears when the socket disconnects.

## Build and tests

### `npm run build` fails with an environment or Supabase error

- The offline build should not need Supabase. Dynamic pages may still call it. Ensure the project is awake and the URL/key are valid.
- If the URL is malformed, `metadataBase` throws during build. Use a full origin with protocol.
- If a parent folder has a lockfile, keep `turbopack.root` in `next.config.ts`; removing it can make Next infer the wrong workspace.

### `npm run test:e2e` starts the wrong thing or cannot find Chrome

- Build first: `npm run build`.
- The config starts the production server on port 3101. Stop any process already using that port or let Playwright reuse it.
- The config uses `channel: "chrome"`, so Chrome must be installed. To use Playwright’s bundled Chromium instead, remove the channel line and install browsers with `npx playwright install chromium`.
- If a previous `next start` is serving an older build, stop it and rerun. Playwright’s `reuseExistingServer` can hide a stale build during local runs.
- The smoke tests tolerate either a configured or an unconfigured backend for the routes that change. Backend-specific flows are not part of the automated suite.

### Unit tests fail after editing the catalogue or finder

`npm test` covers the matching and state rules in `tests/`. Update the expectations when the product rules intentionally change. Do not loosen a test just to make a broken recommendation pass; check the reason string and hard-constraint logic in `src/lib/matching.ts`.

### TypeScript passes locally but Vercel fails

- Confirm Vercel is using the lockfile and Node version you expect.
- Run `npm ci` locally rather than relying on an existing `node_modules`.
- Check that `NEXT_PUBLIC_*` values are present in the Vercel environment for the branch being built.
- Do not commit `.env.local`, `.next`, or `tsconfig.tsbuildinfo`.

## Account deletion

There is no self-service delete button. Use the Supabase dashboard or the SQL in [SETUP.md](SETUP.md#8-delete-an-account). Deleting the `auth.users` row cascades to the profile, favorites, play history, hosted rooms, memberships and answers. If the deleted user hosts an active room, that room closes for everyone.

Preview the account first, take a backup, and do not run a broad `delete from auth.users` without a `where` clause. If you need a user-facing deletion flow, build it with a server-side admin process and an audit trail; do not expose a service-role key to the client.

## Diagnostic commands

```bash
# Local health
npm run typecheck
npm test
npm run build
npm run dev

# Supabase CLI
npx supabase status
npx supabase migration list
npx supabase db push

# Check the deployed response headers and redirects
curl -I https://YOUR-DOMAIN/
curl -I https://YOUR-DOMAIN/auth/confirm
```

Useful SQL (run as the project owner, not with the anon key):

```sql
select count(*) from public.games;
select count(*) from public.trivia_questions;
select id, room_code, status, created_at, expires_at from public.game_rooms order by created_at desc limit 10;
select id, room_id, user_id, score from public.room_players order by joined_at desc limit 20;
select id, email, created_at, last_sign_in_at from auth.users order by created_at desc limit 20;
```

Treat the last query as sensitive. Do not paste real user emails into a public issue or screenshot.
