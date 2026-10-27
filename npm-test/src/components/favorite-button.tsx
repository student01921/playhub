"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Loader2, Settings } from "lucide-react";
import { toggleFavoriteAction } from "@/app/actions/library";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  gameSlug,
  gameTitle,
  initialFavorited,
  signedIn,
  configured,
  catalogueReady,
  size = "md",
  className,
}: {
  gameSlug: string;
  gameTitle: string;
  initialFavorited: boolean;
  signedIn: boolean;
  configured: boolean;
  catalogueReady: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!configured) {
    return (
      <Link
        href="/setup"
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-forest/15 bg-white/45 px-4 text-sm font-semibold text-forest/70",
          className,
        )}
      >
        <Settings className="h-4 w-4" aria-hidden="true" />
        Setup to save games
      </Link>
    );
  }

  if (!signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/games/${gameSlug}`)}`}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-forest/20 bg-white/58 px-4 text-sm font-bold text-forest transition-colors hover:bg-white/90",
          className,
        )}
      >
        <Heart className="h-4 w-4" aria-hidden="true" />
        Sign in to save
      </Link>
    );
  }

  if (!catalogueReady) {
    return (
      <Link
        href="/setup#migrations"
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-deep/25 bg-amber-light/40 px-4 text-sm font-semibold text-forest",
          className,
        )}
      >
        <Settings className="h-4 w-4" aria-hidden="true" />
        Seed catalogue to save
      </Link>
    );
  }

  function toggle() {
    setMessage("");
    startTransition(async () => {
      const result = await toggleFavoriteAction(gameSlug);
      if (!result.ok) {
        setMessage(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      const nextValue = Boolean(result.favorited);
      setFavorited(nextValue);
      setMessage(nextValue ? `Saved ${gameTitle} to your games.` : `Removed ${gameTitle} from your saved games.`);
      router.refresh();
    });
  }

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <Button
        variant={favorited ? "primary" : "secondary"}
        size={size}
        onClick={toggle}
        disabled={isPending}
        aria-pressed={favorited}
        aria-label={favorited ? `Remove ${gameTitle} from favourites` : `Save ${gameTitle} to favourites`}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Heart className={cn("h-4 w-4", favorited && "fill-current")} aria-hidden="true" />
        )}
        {favorited ? "Saved" : "Save game"}
      </Button>
      <p className="min-h-4 text-xs font-medium text-forest/60" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
