import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3, Hash, Info, ListOrdered, Users } from "lucide-react";
import { SetupNotice } from "@/components/setup-notice";
import { TriviaEntry } from "@/components/trivia/trivia-entry";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/server";
import { normaliseRoomCode } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Party Trivia",
  description: "Create or join a live Party Trivia room for 2–10 players.",
};

export const dynamic = "force-dynamic";

export default async function TriviaPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();
  const auth = configured ? await getAuthUser() : null;

  let displayName = "Player";
  if (auth) {
    const { data: profile } = await auth.supabase
      .from("profiles")
      .select("display_name")
      .eq("id", auth.user.id)
      .maybeSingle();
    displayName =
      profile?.display_name?.trim() ||
      (auth.user.user_metadata?.display_name as string | undefined)?.trim() ||
      auth.user.email?.split("@")[0] ||
      "Player";
  }

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 h-[28rem] w-[28rem] rounded-full bg-sage/20 blur-3xl"
      />
      <div className="shell relative py-9 sm:py-12 lg:py-16">
        <Link
          href="/online"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-forest"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Online games
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-terracotta" aria-hidden="true" />
              <p className="eyebrow">Live room · 2–10 players</p>
            </div>
            <h1 className="text-display-sm mt-4">Party Trivia</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Set a room, share the code and let the table argue over the answers. Questions are timed,
              answers stay hidden until the reveal, and the server keeps the score.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-3 text-center sm:max-w-md lg:min-w-72">
            <div className="rounded-card border border-line bg-white/50 px-3 py-3.5">
              <Users className="mx-auto h-4 w-4 text-terracotta-deep" aria-hidden="true" />
              <dt className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Table</dt>
              <dd className="mt-0.5 text-sm font-bold text-forest">2–10</dd>
            </div>
            <div className="rounded-card border border-line bg-white/50 px-3 py-3.5">
              <ListOrdered className="mx-auto h-4 w-4 text-terracotta-deep" aria-hidden="true" />
              <dt className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Default</dt>
              <dd className="mt-0.5 text-sm font-bold text-forest">8 Qs</dd>
            </div>
            <div className="rounded-card border border-line bg-white/50 px-3 py-3.5">
              <Clock3 className="mx-auto h-4 w-4 text-terracotta-deep" aria-hidden="true" />
              <dt className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Timer</dt>
              <dd className="mt-0.5 text-sm font-bold text-forest">20s</dd>
            </div>
          </dl>
        </div>

        <div className="mt-10">
          {!configured ? (
            <SetupNotice
              title="Live rooms need a Supabase connection"
              description="Add your project URL and anon key, run the migration, then create a room. The offline library and game finder work without any of this."
            />
          ) : (
            <TriviaEntry
              signedIn={Boolean(auth)}
              displayName={displayName}
              defaultCode={params.code ? normaliseRoomCode(params.code) : ""}
            />
          )}
        </div>

        <div className="mt-10 grid gap-4 border-t border-line pt-8 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-forest">
              <Hash className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
              Keep the code handy
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              Codes use six characters from an alphabet without I, O, 0 or 1. Read it aloud or share
              the link.
            </p>
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-forest">
              <Info className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
              Every player signs in
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              No guest mode in this build. A real account lets a refresh or a dropped connection join
              back into the same score.
            </p>
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-forest">
              <Clock3 className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
              Rooms are temporary
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              A room expires after four hours. The host can run another round from the results screen
              while it is open.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
