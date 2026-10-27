import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to save games, keep a play history and join live trivia rooms.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next, "/dashboard");

  if (!isSupabaseConfigured()) {
    return (
      <AuthShell
        eyebrow="Your account"
        title={`Sign in to ${site.name}`}
        description="Accounts keep your saved games and live trivia rooms together. The offline library never needs one."
        footer={
          <p className="text-sm text-ink-soft">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-forest underline decoration-forest/25 underline-offset-2">
              Create an account
            </Link>
            .
          </p>
        }
      >
        <SetupNotice
          compact
          title="Accounts are switched off until Supabase is connected"
          description="Add your Supabase project URL and anon key, then run the migrations. Every offline game, filter and recommendation keeps working in the meantime."
        />
      </AuthShell>
    );
  }

  const auth = await getAuthUser();
  if (auth) redirect(nextPath);

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      description="Pick up your saved games and join the room everyone is already in."
      footer={
        <p className="text-sm text-ink-soft">
          New here?{" "}
          <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-forest underline decoration-forest/25 underline-offset-2">
            Create an account
          </Link>
          .
        </p>
      }
    >
      <AuthForm mode="login" nextPath={nextPath} initialError={params.error} />
    </AuthShell>
  );
}
