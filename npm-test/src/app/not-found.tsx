import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] items-center py-20">
      <div className="max-w-xl">
        <p className="eyebrow">Wrong table</p>
        <h1 className="text-display-sm mt-4">This page wandered off.</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          The link may be old, the room may have closed, or the URL has a typo. The games are still
          here.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/games">Browse the games</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Back to the beginning
          </ButtonLink>
        </div>
        <p className="mt-6 text-sm text-ink-faint">
          Joining a room?{" "}
          <Link href="/online/trivia" className="font-semibold text-forest underline decoration-forest/25 underline-offset-2">
            Enter your code on the trivia page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
