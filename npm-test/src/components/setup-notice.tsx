import Link from "next/link";
import { Database } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SetupNotice({
  title = "Connect Supabase to switch this on",
  description = "Accounts, saved games, and live rooms need a Supabase project. The rest of the site — every game, filter, and recommendation — works without it.",
  compact = false,
  className,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-panel border border-amber/40 bg-amber-light/25 p-5 sm:p-6",
        compact && "p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-deep/20 bg-white/55 text-forest">
          <Database className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className={cn("font-display font-semibold text-forest", compact ? "text-lg" : "text-xl")}>{title}</h2>
          <p className="mt-1.5 max-w-xl break-words text-sm leading-relaxed text-ink-soft">{description}</p>
          <ButtonLink href="/setup" variant="secondary" size="sm" className="mt-4">
            View setup steps
          </ButtonLink>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            Looking for the environment template?{" "}
            <Link href="/setup#env" className="font-semibold text-forest underline decoration-forest/25 underline-offset-2">
              .env.example is documented here
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
