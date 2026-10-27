# Deployment

GatherPlay is built for Vercel with Supabase as the only external service. The offline collection can be deployed without Supabase; accounts and live rooms need the migrations and auth configuration in [SETUP.md](SETUP.md).

> This workspace was not deployed from the development environment, so this document does not claim a live URL. Follow the checklist below and verify each item against your own project.

## Preflight

Run these locally before connecting a Git repository:

```bash
npm ci
npm run typecheck
npm test
npm run build
```

`npm run build` should finish without requiring Supabase credentials. With credentials present, it may query Supabase during a build for dynamic pages; a temporary network failure can then fail the build. If that happens, retry, or verify the Supabase project is awake and the environment values are correct.

The Playwright suite is not part of the Vercel build:

```bash
npm run test:e2e
```

It expects a production build and starts `next start` on port 3101. The default config uses locally installed Chrome (`channel: "chrome"`).

## 1. Import the project into Vercel

1. Push the repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the detected framework as **Next.js**.
4. Use the default install command (`npm install` or the lockfile equivalent) and build command (`npm run build`).
5. Set the Node.js version to a supported LTS release. The app was tested on Node 24.22.1; Node 22 LTS is a reasonable production choice. Next.js 16 requires Node 20.9 or newer.

If the repository is inside a larger monorepo, set the **Root Directory** to this project. `next.config.ts` already pins the Turbopack root to the app to avoid a parent lockfile changing workspace inference.

## 2. Set production environment variables

Add these under **Project → Settings → Environment Variables** for Production. Add them for Preview and Development only if those environments need accounts or rooms.

| Name | Production value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The final origin, for example `https://gatherplay.example.com` (no trailing path) |
| `NEXT_PUBLIC_SITE_NAME` | Optional. The public product name; defaults to GatherPlay. |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The project’s anon or publishable key |

Rules that matter:

- Every `NEXT_PUBLIC_*` value is embedded in the client build. Changing one requires a new deployment; editing the variable alone does not update an existing build.
- Use the anon/publishable key only. The service-role key bypasses RLS and must never be exposed to the browser or committed.
- Production Supabase URLs must use `https://`. Local HTTP URLs are intentionally rejected in a production build.
- Preview deployments have changing hostnames. If auth must work on previews, set a preview-specific `NEXT_PUBLIC_SITE_URL` and add that origin to Supabase’s redirect allow list. Otherwise test auth on the production domain.
- Keep `.env.local` out of Git. It is listed in `.gitignore`.

## 3. Configure Supabase for the deployed origin

After Vercel assigns the domain, open Supabase:

**Authentication → URL Configuration**

- Set **Site URL** to the production origin.
- Add:
  - `https://YOUR-DOMAIN/auth/callback`
  - `https://YOUR-DOMAIN/auth/confirm`
- Keep localhost entries only if you also develop locally.

**Authentication → Email Templates**

Use the token-hash templates from [SETUP.md](SETUP.md#4-configure-auth-urls-and-email-templates) for confirmation and recovery. If you keep the stock templates, `/auth/callback` handles the PKCE code flow, but links opened on a different device are less reliable.

**Authentication → Providers → Email**

- Keep email confirmation enabled for a public site.
- Configure custom SMTP before inviting real users. Supabase’s built-in mailer has low limits and is not a production email service.

**Authentication → Rate limits**

Review the defaults. The app adds its own room-creation limit (five rooms per ten minutes per host), but it relies on Supabase for auth rate limiting.

## 4. Deploy

Trigger the first deployment. After it succeeds:

1. Open `https://YOUR-DOMAIN/setup`.
2. Confirm **Environment variables** is **Ready**.
3. Confirm **Catalogue tables** is **Ready**. If not, apply the migrations and seed as described in [SETUP.md](SETUP.md).
4. Open `/games` and confirm ten games, working filters and local imagery.
5. Open `/login` and `/signup`; the setup notice should be gone.
6. Complete a real signup and confirmation email round trip.
7. Request a password reset and set a new password.
8. Save a game and confirm it appears on `/dashboard`.
9. Create a trivia room in one browser profile and join it from a second confirmed account on another device.
10. Check the lobby, start with two players, answer on both devices, reveal, advance and finish. Refresh one device during a question to verify reconnection.
11. Test the host leave path, player leave/rejoin in the lobby, and the closed-room screen.
12. Check `/how-it-works` and `/setup` at 320px width for horizontal overflow.
13. Confirm the production `<title>`, Open Graph image URL and canonical links use the deployed origin.

Do not skip step 3 or 6. A visually correct deployment with an unseeded database or broken confirmation links is not a working backend.

## 5. Updating the deployment

For code changes:

1. Run the local typecheck, unit tests and build.
2. Open a pull request or push to the deployment branch.
3. Let Vercel build the new deployment.
4. Smoke-test the changed route and `/setup`.

For catalogue or question changes:

```bash
npm run generate:seed
# review supabase/migrations/20261027000200_catalogue_seed.sql
# apply it with npx supabase db push or the SQL editor
```

Seed changes are additive/upserting. If you remove a game from TypeScript, the generated seed does not delete the old database row automatically; remove it deliberately with a reviewed SQL statement.

For environment changes:

1. Update the value in Vercel.
2. Redeploy the project.
3. Recheck `/setup` and the affected flow.

## 6. Rollback

- **Application:** Vercel keeps previous deployments. Promote the last known-good deployment from the Deployments tab.
- **Database:** take a backup before schema changes. The schema migration is written to be re-runnable where practical, but it is not a substitute for a backup. Seed data is upserted, not truncated.
- **Auth configuration:** keep a copy of the Site URL, redirect list and email templates before editing them. A wrong Site URL breaks every confirmation and reset link at once.

If a deployment references a newer schema than the code expects, roll back both together where possible.

## 7. Free-tier and operational notes

- Supabase free projects can pause after inactivity. Wake the project before a demo, and consider a small keep-alive or paid plan for an event.
- Realtime connections, database size, egress and auth emails all have plan limits. Ten players per room keeps usage small, but there is no autoscaling guarantee.
- Rooms expire four hours after creation. Expiry is evaluated lazily when the room is read or an action is attempted; there is no cron cleanup worker.
- Vercel Hobby is suitable for a personal MVP, but review its commercial-use terms before using it for a business.
- There is no queue, background job, cache, or separate API server. Next.js server components and Supabase RPCs do the work.
- Logs live in Vercel and Supabase. There is no application analytics or error-reporting integration in this build.

## 8. Security checklist

- [ ] Only the anon/publishable key is in Vercel and `.env.local`.
- [ ] The service-role key is not present in any `NEXT_PUBLIC_*` variable, source file or client bundle.
- [ ] RLS is enabled on every public table and the migration’s grants are in place.
- [ ] Anonymous reads of `trivia_questions`, `favorites` and `profiles` are denied.
- [ ] Room state is read through the RPC; answers are hidden until reveal.
- [ ] Email confirmation is enabled and custom SMTP is configured for real traffic.
- [ ] Supabase Auth redirect URLs are limited to the domains you control.
- [ ] Backups and an account-deletion process are documented. See [SETUP.md](SETUP.md#8-delete-an-account).
- [ ] The deployed site uses HTTPS.
- [ ] A privacy policy and terms are added if you collect real user data publicly. The MVP does not ship legal pages.

## 9. Honest deployment status

What is known from this workspace:

- The app builds locally and the public routes were checked in a production build.
- A configured Supabase project answered the public catalogue query; anonymous access to private tables and the join RPC was denied.
- No production deployment was performed here.
- No live two-account multiplayer round or email round trip was completed in this environment because no test mailboxes or second authenticated browser were available.

The code paths are implemented against Postgres, RLS, Realtime and Supabase Auth; they are not simulated in local state. Use the post-deploy checklist above to verify them in your own project and record the result.
