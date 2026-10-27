import Link from "next/link";
import { ArrowUpRight, Clock3, Users } from "lucide-react";
import { GameArt } from "@/components/game-art";
import {
  DIFFICULTY_LABELS,
  GAME_TYPE_LABELS,
  formatDuration,
  type OfflineGame,
} from "@/data/games";
import { cn } from "@/lib/utils";

export function GameCard({
  game,
  variant = "default",
  className,
}: {
  game: OfflineGame;
  variant?: "default" | "wide";
  className?: string;
}) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border border-line bg-paper-light shadow-soft transition duration-300 ease-soft hover:-translate-y-1 hover:border-forest/25 hover:shadow-lifted focus-visible:-translate-y-0.5",
        variant === "wide" && "lg:flex-row",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          variant === "wide" ? "aspect-[16/10] lg:aspect-auto lg:w-[47%] lg:min-h-[342px]" : "aspect-[4/3]",
        )}
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-soft group-hover:scale-[1.025]">
          <GameArt theme={game.artTheme} title={game.title} />
        </div>
        <span className="absolute left-4 top-4 rounded-full border border-white/60 bg-paper-light/85 px-3 py-1.5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-forest shadow-sm backdrop-blur-md">
          {GAME_TYPE_LABELS[game.type]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.72rem] font-semibold text-terracotta-deep">{game.tagline}</p>
            <h3 className={cn("mt-2 font-display font-semibold leading-[1.08] text-forest", variant === "wide" ? "text-[1.7rem] sm:text-[2rem]" : "text-[1.42rem]")}>
              {game.title}
            </h3>
          </div>
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest/15 bg-white/50 text-forest transition duration-300 group-hover:border-forest group-hover:bg-forest group-hover:text-paper-light">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>

        <p className={cn("mt-3 text-sm leading-relaxed text-ink-soft", variant === "wide" ? "max-w-md sm:text-[0.95rem]" : "line-clamp-2")}>
          {game.description}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-forest/60" aria-hidden="true" />
              {game.minPlayers}–{game.maxPlayers} players
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-forest/60" aria-hidden="true" />
              {formatDuration(game.durationMinutes)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-terracotta" aria-hidden="true" />
              Ages {game.minAge}+
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line/70 pt-3.5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ink-faint">
              {DIFFICULTY_LABELS[game.difficulty]}
            </p>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-forest/55">
              {game.styles.slice(0, 2).map((style) => style.replace("-", " ")).join(" · ")}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
