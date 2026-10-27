import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { site } from "@/lib/site";

const assurances = [
  "Every offline game remains free and account-free.",
  "Saved games and play history stay in your own account.",
  "Live trivia rooms are private to the people you invite.",
];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-amber/15 blur-3xl"
      />
      <div className="shell relative py-10 sm:py-14 lg:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_0.82fr] lg:gap-16">
          <div className="w-full max-w-lg justify-self-center lg:justify-self-start">
            <Link
              href="/"
              className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-forest"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to {site.name}
            </Link>

            <div className="surface p-6 sm:p-8">
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.035em] text-forest sm:text-[2.5rem]">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]">{description}</p>
              <div className="mt-7">{children}</div>
              {footer ? <div className="mt-6 border-t border-line pt-5">{footer}</div> : null}
            </div>
          </div>

          <aside className="hidden lg:block lg:pt-24">
            <div className="rounded-panel border border-forest/10 bg-forest p-8 text-paper-light shadow-lifted">
              <Wordmark tone="light" className="text-2xl" />
              <p className="mt-5 font-display text-2xl leading-snug tracking-[-0.02em] text-paper-light/90">
                A place for the games you play together, not another feed to scroll.
              </p>
              <ul className="mt-7 space-y-4">
                {assurances.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-paper-light/70">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber/20 text-amber">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-t border-white/12 pt-5 text-xs leading-relaxed text-paper-light/45">
                No public profiles, no follower counts, no invented reviews. Just your games and your
                rooms.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
