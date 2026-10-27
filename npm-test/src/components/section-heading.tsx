import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  tone = "dark",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: { href: string; label: string };
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className={cn("flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        <p className={cn("eyebrow", tone === "light" && "text-paper-light/55")}>{eyebrow}</p>
        <h2 className={cn("text-heading mt-3", tone === "light" && "text-paper-light")}>{title}</h2>
        {description ? (
          <p className={cn("mt-4 max-w-xl text-[0.98rem] leading-relaxed text-ink-soft", tone === "light" && "text-paper-light/65")}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex min-h-11 shrink-0 items-center gap-2 self-start border-b border-forest/25 pb-1 text-sm font-bold text-forest transition-colors hover:border-forest sm:self-auto",
            tone === "light" && "border-white/25 text-paper-light hover:border-amber hover:text-amber",
          )}
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
