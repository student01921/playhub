import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FieldShell({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function InlineNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  const styles = {
    info: "border-forest/15 bg-forest/5 text-forest",
    error: "border-terracotta/30 bg-terracotta/10 text-terracotta-deep",
    success: "border-sage-deep/25 bg-sage/20 text-forest",
  } as const;

  return (
    <div
      className={cn("rounded-xl border px-4 py-3 text-sm leading-relaxed", styles[tone])}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
