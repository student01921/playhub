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
  title: "Create an account",
  description: `Create a free ${site.name} account to save games and host live trivia rooms.`,
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next, "/dashboard");

  if (!isSupabaseConfigured()) {
    return (
      <AuthShell
        eyebrow="Join in"
        title="Create an account"
        description="An account is only needed for saved games and live rooms. Everything else stays open."
        footer={
          <p className="text-sm text-ink-soft">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-forest underline decoration-forest/25 underline-offset-2">
              Sign in
            </Link>
            .
          </p>
        }
      >
        <SetupNotice
          compact
          title="Accounts are switched off until Supabase is connected"
          description="The setup guide covers the Supabase project, environment variables and migrations. The offline library works now."
        />
      </AuthShell>
    );
  }

  const auth = await getAuthUser();
  if (auth) redirect(nextPath);

  return (
    <AuthShell
      eyebrow="Join in"
      title="Create an account"
      description="Save the games you like, see what you have played and host live trivia. It takes less than a minute."
      footer={
        <p className="text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-forest underline decoration-forest/25 underline-offset-2">
            Sign in
          </Link>
          .
        </p>
      }
    >
      <AuthForm mode="signup" nextPath={nextPath} />
    </AuthShell>
  );
}
