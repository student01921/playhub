import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, KeyRound, UserRound } from "lucide-react";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { SetupNotice } from "@/components/setup-notice";
import { ButtonLink } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Account settings",
  description: `Change your ${site.name} display name, reset your password or sign out.`,
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="shell max-w-3xl py-12 sm:py-16">
        <p className="eyebrow">Your account</p>
        <h1 className="text-heading mt-3">Account settings</h1>
        <div className="mt-7">
          <SetupNotice
            title="Account settings are switched off"
            description="Connect Supabase and apply the migration before profile settings can be saved."
          />
        </div>
        <ButtonLink href="/dashboard" variant="secondary" className="mt-5">
          Back to dashboard
        </ButtonLink>
      </div>
    );
  }

  const auth = await getAuthUser();
  if (!auth) redirect("/login?next=/dashboard/settings");

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("display_name")
    .eq("id", auth.user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name?.trim() ||
    (auth.user.user_metadata?.display_name as string | undefined)?.trim() ||
    auth.user.email?.split("@")[0] ||
    "Player";

  return (
    <div className="shell py-9 sm:py-12 lg:py-14">
      <Link
        href="/dashboard"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Your dashboard
      </Link>

      <div className="mt-6 max-w-2xl">
        <p className="eyebrow">Your account</p>
        <h1 className="text-heading mt-3">Account settings</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          The small set of details this site actually keeps: a display name, an email for signing in,
          and the games you have chosen to save.
        </p>
      </div>

      <div className="mt-9 grid gap-8 lg:grid-cols-[1.5fr_0.7fr] lg:gap-12">
        <SettingsForm userId={auth.user.id} initialName={displayName} email={auth.user.email ?? ""} />

        <aside className="space-y-5">
          <div className="rounded-panel border border-line bg-paper-light p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-forest">
              <UserRound className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
              Account snapshot
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Name</dt>
                <dd className="mt-0.5 font-semibold text-forest">{displayName}</dd>
              </div>
              <div>
                <dt className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Email</dt>
                <dd className="mt-0.5 break-all font-semibold text-forest">{auth.user.email}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-faint">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  Joined
                </dt>
                <dd className="mt-0.5 font-semibold text-forest">{formatDate(auth.user.created_at)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-card border border-forest/12 bg-sage/12 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-forest">
              <KeyRound className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
              A note on security
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-soft">
              Passwords are stored by Supabase Auth, never by this site. Row-level security means your
              saved games and history are readable only by your session.
            </p>
          </div>

          <div className="rounded-card border border-line bg-white/45 p-5">
            <p className="text-sm font-bold text-forest">Prefer a fresh start?</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              You can sign out from this page at any time. The offline games do not require the account.
            </p>
            <ButtonLink href="/games" variant="secondary" size="sm" className="mt-3">
              Browse games
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}
