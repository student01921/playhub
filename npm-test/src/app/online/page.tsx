import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Hash,
  ListOrdered,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Users,
  Wifi,
} from "lucide-react";
import { GameArt } from "@/components/game-art";
import { SectionHeading } from "@/components/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { partyTrivia } from "@/data/online";

export const metadata: Metadata = {
  title: "Online games",
  description:
    "Play Party Trivia live with friends. Create a room, share a code, answer timed questions and follow the server-scored leaderboard.",
};

const steps = [
  {
    title: "One person hosts",
    description: "The host signs in, picks a table size, question count and timer, then opens the room.",
    icon: Users,
  },
  {
    title: "Everyone joins",
    description: "Share the six-character code or the room link. Players sign in on their own phone or laptop.",
    icon: Hash,
  },
  {
    title: "Answers stay secret",
    description: "Everyone chooses from four options. The screen does not reveal who was right until the timer ends.",
    icon: ShieldCheck,
  },
  {
    title: "The table turns",
    description: "Scores land at the reveal, the host moves things on, and the final board settles the argument.",
    icon: ListOrdered,
  },
];

const facts = [
  { label: "2–10 players", icon: Users },
  { label: "Server-scored", icon: ShieldCheck },
  { label: "No downloads", icon: Smartphone },
  { label: "Reconnect anytime", icon: Wifi },
];

export default function OnlinePage() {
  return (
    <>
      <section className="relative overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-14 lg:pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-44 -top-20 h-[34rem] w-[34rem] rounded-full bg-amber/14 blur-3xl"
        />
        <div className="shell relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-terracotta" aria-hidden="true" />
                <p className="eyebrow">Same room, different screens</p>
              </div>
              <h1 className="text-display mt-5">
                The table goes
                <br />
                <span className="italic text-terracotta">where you are.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Party Trivia is a live room for the group chat, the long-distance birthday or the
                friends who cannot get to the same table. One host, everyone&apos;s phone, a real
                leaderboard.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {facts.map((fact) => (
                  <span
                    key={fact.label}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-forest/12 bg-white/55 px-3.5 text-xs font-semibold text-forest"
                  >
                    <fact.icon className="h-3.5 w-3.5 text-terracotta-deep" aria-hidden="true" />
                    {fact.label}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
                <ButtonLink href="/online/trivia" size="lg" className="justify-between sm:min-w-52">
                  Open Party Trivia
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/games" variant="secondary" size="lg">
                  Browse offline games
                </ButtonLink>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -left-5 top-8 hidden h-24 w-24 rounded-full border border-terracotta/25 sm:block" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2rem] border border-forest/10 bg-forest-deep shadow-lifted">
                <div className="relative aspect-[5/4]">
                  <GameArt theme="buzzer" title="Party Trivia buzzers and question cards" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-deep via-forest-deep/75 to-transparent p-5 pt-20 sm:p-7">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[0.65rem] font-bold uppercase tracking-label text-amber">
                          Live room · Party Trivia
                        </p>
                        <p className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-paper-light sm:text-3xl">
                          Question 3 of 8
                        </p>
                        <p className="mt-1 text-xs text-paper-light/55">Everyone answered · reveal in 6s</p>
                      </div>
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-amber/35 bg-amber/15 font-display text-xl font-semibold text-amber">
                        15
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-4 gap-2" aria-hidden="true">
                      {[34, 61, 22, 47].map((height, index) => (
                        <div key={index} className="flex h-12 items-end rounded-lg bg-white/6 p-1">
                          <span
                            className={`w-full rounded-md ${index === 1 ? "bg-amber" : "bg-white/25"}`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-ink-faint">
                A preview of the room. Real rooms use the questions and players in your game.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper-light py-14 sm:py-20">
        <div className="shell">
          <SectionHeading
            eyebrow="How a room runs"
            title="From code to final score"
            description="No app to install and no account for the people watching. The host steers; the server keeps score."
          />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="relative rounded-card border border-line bg-paper p-5 sm:p-6">
                <span className="absolute right-5 top-5 font-display text-3xl font-medium text-forest/10" aria-hidden="true">
                  0{index + 1}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sage/30 text-forest">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-xl font-medium tracking-[-0.02em] text-forest">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="eyebrow">Built to be trusted</p>
              <h2 className="text-heading mt-3">The leaderboard is not a polite fiction.</h2>
              <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">
                Answers are submitted to the database. Correctness and speed are scored inside the
                same reveal transaction. The browser receives the right answer only when the question
                is over — not hidden behind CSS or a client-side flag.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/how-it-works" className="link-underline text-sm">
                  How the rooms work
                  <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/setup" className="link-underline text-sm">
                  Self-host it
                  <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-panel border border-line bg-paper-light p-6">
                <ShieldCheck className="h-6 w-6 text-terracotta-deep" aria-hidden="true" />
                <h3 className="mt-4 font-display text-xl font-medium text-forest">Row-level security</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Rooms and players are visible only to their own members. The questions table has no
                  browser grants at all.
                </p>
              </div>
              <div className="rounded-panel border border-line bg-paper-light p-6">
                <Clock3 className="h-6 w-6 text-terracotta-deep" aria-hidden="true" />
                <h3 className="mt-4 font-display text-xl font-medium text-forest">Server time</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  The timer is checked against the database clock on submission. Refreshing the page
                  does not buy anyone extra seconds.
                </p>
              </div>
              <div className="rounded-panel border border-line bg-paper-light p-6">
                <Users className="h-6 w-6 text-terracotta-deep" aria-hidden="true" />
                <h3 className="mt-4 font-display text-xl font-medium text-forest">A host, not a referee</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Only the host can start, reveal early or move to the next question. The room keeps
                  its code for a rematch.
                </p>
              </div>
              <div className="rounded-panel border border-line bg-paper-light p-6">
                <MonitorSmartphone className="h-6 w-6 text-terracotta-deep" aria-hidden="true" />
                <h3 className="mt-4 font-display text-xl font-medium text-forest">Phones first</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Big answer targets, a thumb-friendly layout and no sideways scrolling — from a small
                  phone to a laptop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="shell">
          <div className="relative overflow-hidden rounded-[2rem] bg-forest px-6 py-10 text-paper-light shadow-lifted sm:px-10 sm:py-14">
            <div className="noise-overlay opacity-[0.07]" aria-hidden="true" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-label text-amber">The live one</p>
                <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.035em] text-paper-light sm:text-4xl">
                  Party Trivia is ready when you are.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper-light/65 sm:text-base">
                  A room takes about two minutes to set up. The host needs an account; every player
                  signs in too, so a refresh cannot wipe their score.
                </p>
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-paper-light/60">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-amber" aria-hidden="true" />
                    {partyTrivia.maxPlayers} player table
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-amber" aria-hidden="true" />
                    {partyTrivia.durationMinutes} minutes, give or take
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-amber" aria-hidden="true" />
                    Free while it is in MVP
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
                <ButtonLink
                  href="/online/trivia"
                  size="lg"
                  className="border-transparent bg-amber text-forest hover:bg-amber-light"
                >
                  Create or join a room
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/how-it-works" variant="dark" size="lg">
                  Read the room rules
                </ButtonLink>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-ink-faint">
            Party Trivia is the only live online game in this build. More online tables are not teased
            here because they do not exist yet. The offline collection is complete and available now.
          </p>
        </div>
      </section>
    </>
  );
}
