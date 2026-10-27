import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Hash, LockKeyhole, WifiOff } from "lucide-react";
import { SetupNotice } from "@/components/setup-notice";
import { TriviaRoom } from "@/components/trivia/trivia-room";
import { ButtonLink } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import { isValidRoomCode, normaliseRoomCode } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code: rawCode } = await params;
  const code = normaliseRoomCode(rawCode);

  return {
    title: isValidRoomCode(code) ? `Trivia room ${code}` : "Trivia room",
    description: `A live Party Trivia room on ${site.name}.`,
    robots: { index: false, follow: false },
  };
}

function InvalidCode() {
  return (
    <div className="shell flex min-h-[62vh] items-center py-14">
      <div className="mx-auto w-full max-w-xl rounded-panel border border-line bg-paper-light p-6 text-center shadow-soft sm:p-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta-deep">
          <Hash className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="eyebrow mt-4">Room code</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.035em] text-forest">
          That code is not quite right.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          Room codes are six characters. They skip I, O, 0 and 1 so they are harder to misread. Ask
          the host to read it again, or join from the trivia page.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <ButtonLink href="/online/trivia">Enter a room code</ButtonLink>
          <ButtonLink href="/online" variant="secondary">
            Back to online games
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export default async function TriviaRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = normaliseRoomCode(rawCode);

  if (!isValidRoomCode(code)) return <InvalidCode />;

  if (!isSupabaseConfigured()) {
    return (
      <div className="shell max-w-3xl py-12 sm:py-16">
        <Link
          href="/online/trivia"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Party Trivia
        </Link>
        <h1 className="text-heading mt-6">Room {code}</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          This room cannot open until the site is connected to Supabase. The offline library still
          works in full.
        </p>
        <div className="mt-6">
          <SetupNotice
            title="Live rooms are switched off"
            description="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then apply the migrations. A room link from a live site cannot be simulated locally."
          />
        </div>
      </div>
    );
  }

  const auth = await getAuthUser();

  if (!auth) {
    const nextPath = `/online/trivia/room/${code}`;
    return (
      <div className="shell flex min-h-[62vh] items-center py-14">
        <div className="mx-auto w-full max-w-xl rounded-panel border border-line bg-paper-light p-6 text-center shadow-soft sm:p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sage/25 text-forest">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="eyebrow mt-4">Room {code}</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.035em] text-forest">
            Sign in to take your seat.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            Live rooms use accounts so scores are tied to a real player and a refresh can reconnect to
            the same seat. You will come straight back to room {code}.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <ButtonLink href={`/login?next=${encodeURIComponent(nextPath)}`}>Sign in and join</ButtonLink>
            <ButtonLink href={`/signup?next=${encodeURIComponent(nextPath)}`} variant="secondary">
              Create an account
            </ButtonLink>
          </div>
          <p className="mt-5 text-xs text-ink-faint">
            The offline game collection is free and does not need an account.
          </p>
        </div>
      </div>
    );
  }

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

  return <TriviaRoom code={code} userId={auth.user.id} initialName={displayName} />;
}
