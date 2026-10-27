"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldShell, InlineNotice } from "@/components/ui/form";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/utils";

type AuthMode = "login" | "signup" | "forgot" | "reset";

const errorCopy: Record<string, string> = {
  "link-failed":
    "That sign-in link has expired or has already been used. Request a fresh one and try again.",
  "missing-link": "That link did not include a sign-in token. Start again from this page.",
  "session-expired": "Your session has expired. Sign in again to pick up where you left off.",
};

function friendlyError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "That email and password do not match. Check them and try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Your email has not been confirmed yet. Open the link in your inbox, then sign in.";
  }
  if (lower.includes("password should be at least") || lower.includes("password is too short")) {
    return "Use a password with at least 8 characters.";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "An account with this email may already exist. Try signing in or resetting your password.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts in a short time. Wait a minute, then try again.";
  }
  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return "We could not reach the account service. Check your connection and try again.";
  }
  if (lower.includes("same password")) {
    return "Choose a password you have not used for this account before.";
  }
  return message;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  hint,
  error,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  hint?: string;
  error?: string;
  disabled: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="input-base pr-14"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          disabled={disabled}
          required
          minLength={8}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-ink-faint transition-colors hover:text-forest"
          tabIndex={0}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </FieldShell>
  );
}

export function AuthForm({
  mode,
  nextPath = "/dashboard",
  initialError,
}: {
  mode: AuthMode;
  nextPath?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const safeNext = safeNextPath(nextPath, "/dashboard");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState(initialError ? errorCopy[initialError] ?? "" : "");
  const [notice, setNotice] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [pending, setPending] = useState(false);

  const isBusy = pending;

  function validate(): boolean {
    const errors: Record<string, string> = {};
    const trimmedEmail = email.trim();

    if (mode !== "reset") {
      if (!trimmedEmail) errors.email = "Enter your email address.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) errors.email = "Enter a valid email address.";
    }

    if (mode === "signup") {
      if (!displayName.trim()) errors.displayName = "Choose a display name.";
      else if (displayName.trim().length > 40) errors.displayName = "Keep your display name under 40 characters.";
    }

    if (mode === "login" || mode === "signup" || mode === "reset") {
      if (!password) errors.password = "Enter your password.";
      else if (password.length < 8) errors.password = "Use at least 8 characters.";
    }

    if (mode === "signup" || mode === "reset") {
      if (!confirmPassword) errors.confirmPassword = "Repeat your password.";
      else if (password !== confirmPassword) errors.confirmPassword = "Those passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!validate()) return;

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Account features are not connected yet. The setup page explains what is needed.");
      return;
    }

    setPending(true);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(friendlyError(signInError.message));
          return;
        }

        router.replace(safeNext);
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: redirectTo,
          },
        });

        if (signUpError) {
          setError(friendlyError(signUpError.message));
          return;
        }

        if (data.session) {
          router.replace(safeNext);
          router.refresh();
          return;
        }

        setSubmittedEmail(email.trim());
        setNotice("");
        return;
      }

      if (mode === "forgot") {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });

        if (resetError) {
          setError(friendlyError(resetError.message));
          return;
        }

        setSubmittedEmail(email.trim());
        return;
      }

      if (mode === "reset") {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) {
          setError(friendlyError(updateError.message));
          return;
        }

        setNotice("Your password has been updated. Taking you to your dashboard…");
        router.replace("/dashboard");
        router.refresh();
        return;
      }
    } finally {
      setPending(false);
    }
  }

  if (submittedEmail && (mode === "signup" || mode === "forgot")) {
    return (
      <div className="space-y-5">
        <InlineNotice tone="success">
          <p className="font-bold">
            {mode === "signup" ? "Check your inbox" : "Check your inbox for a reset link"}
          </p>
          <p className="mt-1.5">
            {mode === "signup" ? (
              <>
                Open the confirmation link we sent to <strong className="font-semibold">{submittedEmail}</strong>.
                It will bring you back here, signed in.
              </>
            ) : (
              <>
                If an account exists for <strong className="font-semibold">{submittedEmail}</strong>, a
                password-reset link is on its way. The link is time-limited.
              </>
            )}
          </p>
        </InlineNotice>
        <p className="text-xs leading-relaxed text-ink-faint">
          Nothing after a few minutes? Check your spam folder, or{" "}
          <button
            type="button"
            className="font-semibold text-forest underline decoration-forest/25 underline-offset-2"
            onClick={() => setSubmittedEmail("")}
          >
            try again with a different address
          </button>
          .
        </p>
        {mode === "signup" ? (
          <Link href="/login" className="link-underline text-sm">
            Back to sign in
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}

      {mode === "signup" ? (
        <FieldShell id="displayName" label="Display name" hint="This is what other players see in a room." error={fieldErrors.displayName}>
          <div className="relative">
            <UserRound
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            />
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="nickname"
              maxLength={40}
              className="input-base pl-11"
              aria-invalid={Boolean(fieldErrors.displayName)}
              aria-describedby={fieldErrors.displayName ? "displayName-error" : "displayName-hint"}
              disabled={isBusy}
              required
            />
          </div>
        </FieldShell>
      ) : null}

      {mode !== "reset" ? (
        <FieldShell id="email" label="Email" error={fieldErrors.email}>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              inputMode="email"
              className="input-base pl-11"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              disabled={isBusy}
              required
            />
          </div>
        </FieldShell>
      ) : null}

      {mode !== "forgot" ? (
        <PasswordField
          id="password"
          label={mode === "reset" ? "New password" : "Password"}
          value={password}
          onChange={setPassword}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          hint={mode === "signup" || mode === "reset" ? "At least 8 characters." : undefined}
          error={fieldErrors.password}
          disabled={isBusy}
        />
      ) : null}

      {mode === "signup" || mode === "reset" ? (
        <PasswordField
          id="confirmPassword"
          label="Repeat password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
          disabled={isBusy}
        />
      ) : null}

      {mode === "login" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs leading-relaxed text-ink-faint">Your session stays on this device.</p>
          <Link
            href="/forgot-password"
            className="inline-flex min-h-10 items-center text-xs font-semibold text-forest underline decoration-forest/25 underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={isBusy}>
        {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {isBusy
          ? mode === "login"
            ? "Signing in…"
            : mode === "signup"
              ? "Creating account…"
              : mode === "forgot"
                ? "Sending link…"
                : "Updating password…"
          : mode === "login"
            ? "Sign in"
            : mode === "signup"
              ? "Create free account"
              : mode === "forgot"
                ? "Send reset link"
                : "Set new password"}
      </Button>

      <p className="text-center text-xs leading-relaxed text-ink-faint">
        No marketing email, ever. Offline games stay free without an account.
      </p>
    </form>
  );
}
