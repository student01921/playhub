import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

export function Wordmark({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-baseline font-display text-[1.45rem] font-semibold leading-none tracking-[-0.04em]",
        tone === "dark" ? "text-forest" : "text-paper-light",
        className,
      )}
      aria-label={`${site.name} home`}
    >
      <span>{site.name}</span>
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block h-[0.32em] w-[0.32em] rounded-full bg-terracotta transition-transform duration-300 ease-soft group-hover:scale-125"
      />
    </Link>
  );
}
