"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, LogOut, Mail, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldShell, InlineNotice } from "@/components/ui/form";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function SettingsForm({
  userId,
  initialName,
  email,
}: {
  userId: string;
  initialName: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState("");
  const [nameNotice, setNameNotice] = useState("");
  const [namePending, setNamePending] = useState(false);

  const [resetNotice, setResetNotice] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetPending, setResetPending] = useState(false);

  const [signOutPending, setSignOutPending] = useState(false);

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameError("");
    setNameNotice("");

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("A display name is needed.");
      return;
    }
    if (trimmed.length > 40) {
      setNameError("Keep the display name under 40 characters.");
      return;
    }

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setNameError("Account settings are not connected yet.");
      return;
    }

    setNamePending(true);
    const { data, error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", userId)
      .select("id")
      .maybeSingle();
    setNamePending(false);

    if (error) {
      setNameError("Your name could not be saved. Check the database migration and try again.");
      return;
    }
    if (!data) {
      setNameError("No profile row was found for this account. Sign out and back in, then try again.");
      return;
    }

    setNameNotice("Display name updated. New rooms will use this name.");
    router.refresh();
  }

  async function sendResetLink() {
    setResetNotice("");
    setResetError("");

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setResetError("Password reset is not connected yet.");
      return;
    }

    setResetPending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
    });
    setResetPending(false);

    if (error) {
      setResetError("The reset email could not be sent. Try again in a moment.");
      return;
    }

    setResetNotice(
      `If the email service accepts it, a password-reset link is on its way to ${email}. The link is time-limited.`,
    );
  }

  async function signOut() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    setSignOutPending(true);
    await supabase.auth.signOut();
    setSignOutPending(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={saveName} className="rounded-panel border border-line bg-paper-light p-5 shadow-soft sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Profile</p>
            <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-forest">
              Your name at the table
            </h2>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/25 text-forest">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>

        <div className="mt-5 max-w-md">
          <FieldShell
            id="displayName"
            label="Display name"
            hint="Shown to other players in a live room. You can change it before each room too."
            error={nameError}
          >
            <input
              id="displayName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={40}
              autoComplete="nickname"
              className="input-base"
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "displayName-error" : "displayName-hint"}
              required
            />
          </FieldShell>
        </div>

        {nameNotice ? (
          <div className="mt-4 max-w-md">
            <InlineNotice tone="success">
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4" aria-hidden="true" />
                {nameNotice}
              </span>
            </InlineNotice>
          </div>
        ) : null}

        <Button type="submit" className="mt-5" disabled={namePending || name.trim() === initialName.trim()}>
          {namePending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          {namePending ? "Saving…" : "Save display name"}
        </Button>
      </form>

      <div className="rounded-panel border border-line bg-paper-light p-5 shadow-soft sm:p-6">
        <p className="eyebrow">Sign-in and security</p>
        <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-forest">
          The keys to your account
        </h2>

        <div className="mt-5 flex flex-col gap-2 rounded-xl border border-line/70 bg-white/45 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest/8 text-forest">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Email</p>
              <p className="truncate text-sm font-semibold text-forest">{email}</p>
            </div>
          </div>
          <span className="rounded-full bg-sage/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-forest">
            Email sign-in
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          We will email you a secure link to choose a new password. Changing the account email itself
          is not supported in this MVP.
        </p>

        {resetNotice ? (
          <div className="mt-4">
            <InlineNotice tone="success">{resetNotice}</InlineNotice>
          </div>
        ) : null}
        {resetError ? (
          <div className="mt-4">
            <InlineNotice tone="error">{resetError}</InlineNotice>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void sendResetLink()} disabled={resetPending}>
            {resetPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Mail className="h-4 w-4" aria-hidden="true" />
            )}
            {resetPending ? "Sending…" : "Send a password-reset email"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => void signOut()} disabled={signOutPending}>
            {signOutPending ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
            {signOutPending ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </div>

      <div className="rounded-card border border-amber/30 bg-amber-light/20 p-5">
        <p className="text-sm font-bold text-forest">What this account does not do</p>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
          There is no public profile, message inbox, social graph or payment information here. Account
          deletion happens through the Supabase dashboard for this MVP; the README documents the SQL.
        </p>
      </div>
    </div>
  );
}
