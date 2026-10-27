import type { Metadata } from "next";
import { GamesExplorer } from "@/components/games-explorer";
import { games, OCCASIONS, type Occasion, formatPlayers } from "@/data/games";

export const metadata: Metadata = {
  title: "Offline games library",
  description:
    "Browse 10 complete party games for house parties, family gatherings, sleepovers, and college nights. Search and filter by players, age, time, occasion, and game type.",
};

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const occasionParam = typeof params.occasion === "string" ? params.occasion : "";
  const initialOccasion = OCCASIONS.includes(occasionParam as Occasion)
    ? (occasionParam as Occasion)
    : undefined;

  const largestGroup = Math.max(...games.map((game) => game.maxPlayers));
  const ages = games.map((game) => game.minAge);
  const youngest = Math.min(...ages);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line/70 pb-10 pt-12 sm:pb-12 sm:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-amber/12 blur-2xl"
        />
        <div className="shell relative">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <p className="eyebrow">The offline library</p>
              <h1 className="text-display-sm mt-4">
                The game shelf.
                <br />
                <span className="italic text-terracotta">Pick something good.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
                Ten games that work without accounts, screens, or an elaborate setup. Every entry
                has clear rules, real player counts, and a few suggestions for the second round.
              </p>
            </div>

            <div className="grid max-w-md grid-cols-3 gap-4 border-t border-forest/15 pt-5 text-forest sm:gap-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div>
                <p className="font-display text-3xl font-semibold">{games.length}</p>
                <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Games</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold">{formatPlayers(2, largestGroup)}</p>
                <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Group sizes</p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold">{youngest}+</p>
                <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Ages from</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-9 sm:py-12">
        <div className="shell">
          <GamesExplorer initialOccasion={initialOccasion} />
        </div>
      </section>
    </>
  );
}
