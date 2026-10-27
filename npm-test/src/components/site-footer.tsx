import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { site } from "@/lib/site";

const columns = [
  { title: "Explore", links: site.footer.explore },
  { title: "Account", links: site.footer.account },
  { title: "The practical bits", links: site.footer.support },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-forest text-paper-light">
      <div className="noise-overlay opacity-[0.06]" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-amber/10 blur-3xl"
      />
      <div className="shell relative pb-8 pt-16 sm:pt-20">
        <div className="grid gap-12 border-b border-white/12 pb-12 md:grid-cols-[1.4fr_2fr] lg:gap-20">
          <div>
            <Wordmark tone="light" className="text-[1.8rem]" />
            <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-paper-light/65">
              A considered collection of games for real gatherings. Pull up a chair, put the phones
              down — or use them for trivia — and give everyone something to do.
            </p>
            <Link
              href="/games"
              className="mt-7 inline-flex items-center gap-2 border-b border-white/25 pb-1 text-sm font-semibold text-paper-light transition-colors hover:border-amber hover:text-amber"
            >
              Find something to play
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className="font-sans text-[0.68rem] font-bold uppercase tracking-label text-paper-light/45">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-1">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-10 items-center text-sm text-paper-light/70 transition-colors hover:text-paper-light"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-7 text-xs text-paper-light/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Made for good company.
          </p>
          <p>
            Photography from{" "}
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-white/25 underline-offset-4 transition-colors hover:text-paper-light"
            >
              Pexels
            </a>
            . No fake reviews, just the games.
          </p>
        </div>
      </div>
    </footer>
  );
}
