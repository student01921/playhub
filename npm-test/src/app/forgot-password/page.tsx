import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reset your password",
  description: `Request a secure password-reset link for your ${site.name} account.`,
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account help"
      title="Reset your password"
      description="Enter the email on your account and we will send a time-limited link to choose a new password."
      footer={
        <p className="text-sm text-ink-soft">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-forest underline decoration-forest/25 underline-offset-2">
            Back to sign in
          </Link>
          .
        </p>
      }
    >
      {isSupabaseConfigured() ? (
        <AuthForm mode="forgot" />
      ) : (
        <SetupNotice
          compact
          title="Password reset needs Supabase"
          description="Connect a Supabase project before accounts can send email. The setup guide walks through the whole process."
        />
      )}
    </AuthShell>
  );
}
