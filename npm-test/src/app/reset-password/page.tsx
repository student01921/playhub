import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { SetupNotice } from "@/components/setup-notice";
import { ButtonLink } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/server";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: `Set a new password for your ${site.name} account.`,
};

export default async function ResetPasswordPage() {
  const configured = isSupabaseConfigured();
  const auth = configured ? await getAuthUser() : null;

  return (
    <AuthShell
      eyebrow="Account help"
      title="Choose a new password"
      description={
        configured
          ? "Use at least 8 characters. You will be signed in on this device once the update is saved."
          : "Password reset needs a connected Supabase project."
      }
      footer={
        <p className="text-sm text-ink-soft">
          Need a fresh link?{" "}
          <Link href="/forgot-password" className="font-semibold text-forest underline decoration-forest/25 underline-offset-2">
            Request another reset email
          </Link>
          .
        </p>
      }
    >
      {!configured ? (
        <SetupNotice
          compact
          title="Password reset is switched off"
          description="Add Supabase environment variables and run the migration to enable accounts."
        />
      ) : auth ? (
        <AuthForm mode="reset" />
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-amber/40 bg-amber-light/25 p-4">
            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-terracotta-deep" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-forest">This reset link is not active</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Reset links are time-limited and can only be used once. Request a new one and open it
                on this device.
              </p>
            </div>
          </div>
          <ButtonLink href="/forgot-password" className="w-full">
            Request a new reset link
          </ButtonLink>
        </div>
      )}
    </AuthShell>
  );
}
