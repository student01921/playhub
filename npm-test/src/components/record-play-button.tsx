"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, ListPlus } from "lucide-react";
import { recordGamePlayAction } from "@/app/actions/library";
import { Button } from "@/components/ui/button";

export function RecordPlayButton({
  gameSlug,
  signedIn,
  configured,
}: {
  gameSlug: string;
  signedIn: boolean;
  configured: boolean;
}) {
  const router = useRouter();
  const [recorded, setRecorded] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!configured) return null;

  if (!signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/games/${gameSlug}`)}`}
        className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-forest/65 transition-colors hover:text-forest"
      >
        <ListPlus className="h-4 w-4" aria-hidden="true" />
        Sign in to keep a play history
      </Link>
    );
  }

  function record() {
    setMessage("");
    startTransition(async () => {
      const result = await recordGamePlayAction(gameSlug);
      if (!result.ok) {
        setMessage(result.error ?? "Could not save that. Please try again.");
        return;
      }
      setRecorded(true);
      setMessage("Added to your recently played games.");
      router.refresh();
    });
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={record}
        disabled={isPending || recorded}
        className="px-0 text-xs"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : recorded ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ListPlus className="h-4 w-4" aria-hidden="true" />
        )}
        {recorded ? "Added to history" : "Mark as played"}
      </Button>
      <p className="mt-1 min-h-4 text-xs text-forest/55" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
