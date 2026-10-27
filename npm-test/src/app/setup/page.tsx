import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleDashed,
  Code2,
  Database,
  Globe2,
  Mail,
  ShieldCheck,
  Terminal,
  Wrench,
} from "lucide-react";
import { SetupNotice } from "@/components/setup-notice";
import { ButtonLink } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Backend setup",
  description: `Connect Supabase, run the ${site.name} migrations and deploy the site.`,
};

export const dynamic = "force-dynamic";

type CatalogueStatus = "not-configured" | "unknown" | "ready" | "not-ready";

const envRows = [
  {
    name: "NEXT_PUBLIC_SITE_URL",
    required: "Yes in deployment",
    description: "The public origin, such as https://your-site.vercel.app. Used for metadata and absolute links.",
  },
  {
    name: "NEXT_PUBLIC_SITE_NAME",
    required: "No",
    description: `The product name shown throughout the UI. Defaults to ${site.name}.`,
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: "For accounts and rooms",
    description: "Project URL from Supabase → Project Settings → API.",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: "For accounts and rooms",
    description: "The publishable anon key. Safe for the browser only because RLS and grants are applied.",
  },
];

function StatusPill({ state }: { state: "ok" | "waiting" | "warn" }) {
  return (
    <span
      className={
        state === "ok"
          ? "inline-flex items-center gap-1.5 rounded-full border border-sage-deep/25 bg-sage/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-forest"
          : state === "warn"
            ? "inline-flex items-center gap-1.5 rounded-full border border-amber-deep/30 bg-amber-light/35 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-forest"
            : "inline-flex items-center gap-1.5 rounded-full border border-forest/12 bg-white/60 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink-soft"
      }
    >
      {state === "ok" ? (
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      ) : state === "warn" ? (
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      ) : (
        <CircleDashed className="h-3 w-3" aria-hidden="true" />
      )}
      {state === "ok" ? "Ready" : state === "warn" ? "Needs attention" : "Not configured"}
    </span>
  );
}

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();

  let catalogueStatus: CatalogueStatus = configured ? "unknown" : "not-configured";
  let gameCount = 0;

  if (configured) {
    const supabase = await createServerSupabase();
    if (supabase) {
      const { count, error } = await supabase.from("games").select("id", { count: "exact", head: true });
      if (!error && typeof count === "number") {
        gameCount = count;
        catalogueStatus = count >= 10 ? "ready" : "not-ready";
      } else {
        catalogueStatus = "not-ready";
      }
    }
  }

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden border-b border-line pb-10 pt-10 sm:pb-14 sm:pt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-amber/15 blur-3xl"
        />
        <div className="shell relative">
          {params.reason === "auth" ? (
            <div className="mb-6">
              <SetupNotice
                compact
                title="That account link needs Supabase"
                description="The email link was valid, but this deployment cannot complete it until Supabase is connected. Follow the steps below."
              />
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-terracotta" aria-hidden="true" />
                <p className="eyebrow">Self-hosted starter</p>
              </div>
              <h1 className="text-display-sm mt-4">Connect the backend.</h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                The offline collection is complete without any configuration. Accounts, saved games and
                live rooms need one Supabase project and two migrations. This page describes the real
                steps; it cannot apply them for you.
              </p>
            </div>

            <div className="rounded-panel border border-line bg-paper-light p-5 shadow-soft sm:p-6">
              <p className="text-[0.68rem] font-bold uppercase tracking-label text-ink-faint">Current deployment</p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-forest">Environment variables</span>
                  <StatusPill state={configured ? "ok" : "waiting"} />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-forest">Catalogue tables</span>
                  <StatusPill
                    state={catalogueStatus === "ready" ? "ok" : catalogueStatus === "not-ready" ? "warn" : "waiting"}
                  />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-forest">Auth email links</span>
                  <span className="text-xs font-semibold text-ink-faint">Check in Supabase</span>
                </li>
              </ul>
              <p className="mt-4 border-t border-line pt-3 text-[0.7rem] leading-relaxed text-ink-faint">
                {catalogueStatus === "ready"
                  ? `The games table answered with ${gameCount} catalogue rows.`
                  : catalogueStatus === "not-ready" && configured
                    ? "The Supabase URL is present, but the catalogue could not be read. Apply both migrations and check the anon key."
                    : "Connect Supabase below. This status is checked live when the page loads."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="shell mt-8 sm:mt-10">
        <div className="grid gap-9 lg:grid-cols-[1.35fr_0.65fr] lg:gap-12">
          <div className="space-y-10">
            <section aria-labelledby="without">
              <p className="eyebrow">The important bit</p>
              <h2 id="without" className="text-heading-sm mt-2">
                What works without Supabase
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-card border border-line bg-white/40 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-forest">
                    <Check className="h-4 w-4 text-sage-deep" aria-hidden="true" />
                    Always on
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink-soft">
                    <li>All ten offline games and their complete rules</li>
                    <li>Search, filters and sorting</li>
                    <li>The transparent game finder</li>
                    <li>All static pages and local imagery</li>
                  </ul>
                </div>
                <div className="rounded-card border border-amber/30 bg-amber-light/15 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-forest">
                    <AlertTriangle className="h-4 w-4 text-amber-deep" aria-hidden="true" />
                    Shows a setup state
                  </p>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink-soft">
                    <li>Sign-up, sign-in and password reset</li>
                    <li>Saved games and play history</li>
                    <li>Live trivia rooms and leaderboards</li>
                    <li>Dashboard and account settings</li>
                  </ul>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-faint">
                None of the above is simulated in local state. If the backend is missing, the buttons
                lead here rather than pretending to succeed.
              </p>
            </section>

            <section aria-labelledby="steps">
              <p className="eyebrow">The setup</p>
              <h2 id="steps" className="text-heading-sm mt-2">
                Five steps, in order
              </h2>

              <ol className="mt-5 space-y-4">
                <li className="rounded-panel border border-line bg-paper-light p-5 shadow-soft sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest text-sm font-bold text-paper-light">
                      1
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-medium text-forest">Create a Supabase project</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        Create a free project at supabase.com. Wait for its database to finish
                        provisioning. Copy the project URL and the <code className="rounded bg-forest/6 px-1 py-0.5 text-xs">anon</code>{" "}
                        public key from Project Settings → API.
                      </p>
                    </div>
                  </div>
                </li>

                <li
                  id="env"
                  className="scroll-mt-24 rounded-panel border border-line bg-paper-light p-5 shadow-soft sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest text-sm font-bold text-paper-light">
                      2
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl font-medium text-forest">Fill in the environment</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        Copy <code className="rounded bg-forest/6 px-1 py-0.5 text-xs">.env.example</code> to{" "}
                        <code className="rounded bg-forest/6 px-1 py-0.5 text-xs">.env.local</code> for local work. Add the
                        same values in Vercel for deployment.
                      </p>
                      <pre className="mt-3 overflow-x-auto rounded-xl bg-forest p-4 text-[0.72rem] leading-relaxed text-paper-light/85">
{`NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=${site.name}
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY

# Never put a service-role key in a NEXT_PUBLIC_ variable.`}
                      </pre>
                      <p className="mt-2 text-xs leading-relaxed text-ink-faint">
                        The service-role key is not used by this app at runtime. Do not add it.
                      </p>
                    </div>
                  </div>
                </li>

                <li
                  id="migrations"
                  className="scroll-mt-24 rounded-panel border border-line bg-paper-light p-5 shadow-soft sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest text-sm font-bold text-paper-light">
                      3
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl font-medium text-forest">Apply both migrations</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        Install the Supabase CLI, link the project, then push. The second migration seeds the
                        ten-game catalogue and thirty original trivia questions.
                      </p>
                      <pre className="mt-3 overflow-x-auto rounded-xl bg-forest p-4 text-[0.72rem] leading-relaxed text-paper-light/85">
{`npm install
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase db push

# Optional local stack:
npx supabase start
npx supabase db reset`}
                      </pre>
                      <p className="mt-2 text-xs leading-relaxed text-ink-faint">
                        The migrations are in <code className="rounded bg-forest/6 px-1 py-0.5">supabase/migrations/</code>.
                        The catalogue is generated from the TypeScript source; run{" "}
                        <code className="rounded bg-forest/6 px-1 py-0.5">npm run generate:seed</code> after editing games or questions.
                      </p>
                    </div>
                  </div>
                </li>

                <li className="rounded-panel border border-line bg-paper-light p-5 shadow-soft sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest text-sm font-bold text-paper-light">
                      4
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl font-medium text-forest">Set the auth URLs and email templates</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        In Supabase → Authentication → URL Configuration, set the Site URL to your deployed
                        origin and add redirect URLs:
                      </p>
                      <pre className="mt-3 overflow-x-auto rounded-xl bg-forest p-4 text-[0.72rem] leading-relaxed text-paper-light/85">
{`http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm
https://YOUR-DOMAIN/auth/callback
https://YOUR-DOMAIN/auth/confirm`}
                      </pre>
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                        For the most reliable email flow, edit the Confirm signup and Reset password
                        templates to send a token hash directly to this app:
                      </p>
                      <pre className="mt-2 overflow-x-auto rounded-xl bg-forest p-4 text-[0.72rem] leading-relaxed text-paper-light/85">
{`Confirm signup:
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard

Reset password:
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`}
                      </pre>
                      <p className="mt-2 text-xs leading-relaxed text-ink-faint">
                        The default{" "}
                        <code className="rounded bg-forest/6 px-1 py-0.5">{"{{ .ConfirmationURL }}"}</code>{" "}
                        templates can work through <code className="rounded bg-forest/6 px-1 py-0.5">/auth/callback</code>,
                        but the token-hash route avoids PKCE-verifier problems when a link is opened on a
                        different device. This build supports both routes.
                      </p>
                    </div>
                  </div>
                </li>

                <li className="rounded-panel border border-line bg-paper-light p-5 shadow-soft sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest text-sm font-bold text-paper-light">
                      5
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl font-medium text-forest">Run it, then deploy</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                        Check the build locally. If you deploy to Vercel, add the same four environment
                        variables, then redeploy after adding them.
                      </p>
                      <pre className="mt-3 overflow-x-auto rounded-xl bg-forest p-4 text-[0.72rem] leading-relaxed text-paper-light/85">
{`npm run typecheck
npm run build
npm run dev

# Deploy with the Vercel CLI if you prefer it to the dashboard:
npx vercel`}
                      </pre>
                    </div>
                  </div>
                </li>
              </ol>
            </section>

            <section aria-labelledby="verify">
              <p className="eyebrow">After the push</p>
              <h2 id="verify" className="text-heading-sm mt-2">
                Verify the parts that matter
              </h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-card border border-line bg-white/45 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-forest">
                    <Database className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
                    Catalogue and questions
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                    Run this in the Supabase SQL editor. It should return 10 games and 30 questions.
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-forest/95 p-3 text-[0.7rem] leading-relaxed text-paper-light/85">
{`select count(*) from public.games;
select count(*) from public.trivia_questions;`}
                  </pre>
                </div>
                <div className="rounded-card border border-line bg-white/45 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-forest">
                    <ShieldCheck className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
                    Browser permissions
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                    Signed in as a normal user, these reads should fail:{" "}
                    <code className="rounded bg-forest/6 px-1 py-0.5 text-[0.7rem]">trivia_questions</code> has no
                    select grant, and a room you do not belong to is blocked by row-level security. Do
                    not test with the service-role SQL editor and draw conclusions about the browser.
                  </p>
                </div>
                <div className="rounded-card border border-line bg-white/45 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-forest">
                    <Mail className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
                    A real email round trip
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                    Sign up with a mailbox you can open, confirm the link, then sign in. Reset the
                    password and confirm the new one works. Email confirmation can be disabled in
                    Supabase for a private test project, but the deployed site should keep it on.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-panel border border-forest/10 bg-forest p-5 text-paper-light sm:p-6">
              <p className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-label text-amber">
                <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                Order of operations
              </p>
              <ol className="mt-4 space-y-3 text-sm text-paper-light/70">
                <li className="flex gap-2.5">
                  <span className="shrink-0 font-display text-amber">01</span>
                  Environment variables
                </li>
                <li className="flex gap-2.5">
                  <span className="shrink-0 font-display text-amber">02</span>
                  Schema migration
                </li>
                <li className="flex gap-2.5">
                  <span className="shrink-0 font-display text-amber">03</span>
                  Catalogue + question seed
                </li>
                <li className="flex gap-2.5">
                  <span className="shrink-0 font-display text-amber">04</span>
                  Auth redirect URLs
                </li>
                <li className="flex gap-2.5">
                  <span className="shrink-0 font-display text-amber">05</span>
                  Build and deploy
                </li>
              </ol>
              <p className="mt-4 border-t border-white/12 pt-3 text-xs leading-relaxed text-paper-light/45">
                The catalogue migration is an upsert, so re-running it is safe. It will not delete games
                or questions you add separately.
              </p>
            </div>

            <div className="rounded-card border border-line bg-paper-light p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-forest">
                <Wrench className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
                Common snags
              </p>
              <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-ink-soft">
                <li>
                  <strong className="text-forest">“Game catalogue has not been seeded”</strong> — the
                  second migration did not run. Push again, then reload.
                </li>
                <li>
                  <strong className="text-forest">Email links land on localhost</strong> — update the
                  Supabase Site URL and redirect allow list for the deployed domain.
                </li>
                <li>
                  <strong className="text-forest">Room state says not a player</strong> — the link was
                  opened after the round started. Join in the lobby or ask the host to replay.
                </li>
                <li>
                  <strong className="text-forest">Scores are all zero</strong> — scores land at reveal,
                  not on submission. If the room is stuck in question, the server clock has not been
                  polled yet; refresh the room.
                </li>
              </ul>
              <p className="mt-3 text-[0.7rem] leading-relaxed text-ink-faint">
                The repo&apos;s <code className="rounded bg-forest/6 px-1 py-0.5">docs/TROUBLESHOOTING.md</code>{" "}
                has the longer checklist.
              </p>
            </div>

            <div className="rounded-card border border-amber/30 bg-amber-light/20 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-forest">
                <Globe2 className="h-4 w-4 text-amber-deep" aria-hidden="true" />
                Deployment reality
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                This repository can be built without secrets, but live rooms cannot be verified without
                a real Supabase project and two authenticated browsers. The README states exactly what
                was and was not tested in this environment.
              </p>
            </div>

            <div className="rounded-card border border-line bg-white/45 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-forest">
                <Code2 className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
                Files that matter
              </p>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink-soft">
                <li><code className="break-all">supabase/migrations/20261027000100_initial_schema.sql</code></li>
                <li><code className="break-all">supabase/migrations/20261027000200_catalogue_seed.sql</code></li>
                <li><code>.env.example</code></li>
                <li><code>docs/DEPLOYMENT.md</code></li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-panel border border-line bg-forest p-6 text-paper-light sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-2xl font-medium tracking-[-0.03em] text-paper-light">
              No Supabase yet? The games still work.
            </p>
            <p className="mt-1 text-sm text-paper-light/55">
              Start with the part that does not need a database.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/games" variant="dark" className="border-amber/30 bg-amber text-forest hover:bg-amber-light">
              Browse games
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/how-it-works" variant="dark">
              How it works
            </ButtonLink>
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-ink-faint">
          Need the long version? The repository README and the <code>docs/</code> folder cover setup,
          deployment, troubleshooting and the honest test log.{" "}
          <Link href="/" className="font-semibold text-forest underline decoration-forest/25 underline-offset-2">
            Back home
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
