import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CircleHelp,
  Clock3,
  Heart,
  ListOrdered,
  LockKeyhole,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  WifiOff,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How it works",
  description: `How ${site.name}'s offline game library, game finder, accounts and live Party Trivia rooms actually work.`,
};

const pillars = [
  {
    icon: BookOpen,
    eyebrow: "The library",
    title: "Ten complete games, written to be played",
    body: "Every offline game has a real ruleset, materials list, setup note, winning condition, variations and a host tip. No placeholder cards, no “coming soon” tiles in the library.",
    href: "/games",
    link: "Browse the games",
  },
  {
    icon: ListOrdered,
    eyebrow: "The finder",
    title: "A shortlist, not a slot machine",
    body: "The finder applies transparent rules: format, player count, age, available time, occasion and style. It shows why each game fits. If nothing matches, it says so instead of inventing a result.",
    href: "/finder",
    link: "Try the finder",
  },
  {
    icon: Sparkles,
    eyebrow: "The live room",
    title: "Party Trivia is real multiplayer",
    body: "Rooms are created in Postgres, players join by code, questions are timed by the database clock and scores are awarded in the reveal step. The browser is a view, not the referee.",
    href: "/online/trivia",
    link: "Open Party Trivia",
  },
];

const faqs = [
  {
    question: `Do I need an account to use ${site.name}?`,
    answer:
      "No, not for the offline library, search, filters, game details or the game finder. An account is only needed to save games, keep a play history, host a live room or join one. The site has no guest mode for online rooms because scores need a durable player identity.",
  },
  {
    question: "How does the trivia scoring work?",
    answer:
      "A correct answer is worth 1,000 points plus a speed bonus of up to 500, based on how much time was left when the database received it. Points are not applied when the answer arrives. They are applied in the reveal transaction, so the visible leaderboard cannot reveal early who was right.",
  },
  {
    question: "Can players see the correct answer before the reveal?",
    answer:
      "Not through this app. The questions and answers tables have no browser grants. Room state comes from a security-definer function that strips the correct option and explanation until the room status is reveal. The answer is not merely hidden with CSS.",
  },
  {
    question: "What happens if I refresh or lose my connection?",
    answer:
      "Your seat is tied to your account and the room. Reloading the page rejoins the same room, and the app keeps a five-second polling fallback running if the realtime socket drops. If the question timer has run out, the next state fetch moves the room to the reveal.",
  },
  {
    question: "What happens if the host leaves?",
    answer:
      "The room closes for everyone. This MVP has no host migration: the host is the person who created the room, and their leave action intentionally ends the session. Players see a closed-room message and can start a new room themselves.",
  },
  {
    question: "How many people can play, and how long does a room last?",
    answer:
      "A Party Trivia room supports 2–10 players, 4–12 questions and 10–60 seconds per question. Rooms expire four hours after creation. The host can replay from the results screen while the room is still open.",
  },
  {
    question: "Is there a chat or voice call?",
    answer:
      "No. The live room is for the game only. Use whatever call or group chat you already have for the talking. There is also no spectator mode in this build.",
  },
  {
    question: "Where does the photography come from?",
    answer:
      "The selected photographs are local files from Pexels, credited in the footer and the README. Game illustrations are original SVGs made for this project. There are no remote image hotlinks.",
  },
  {
    question: "What is not built yet?",
    answer:
      "Only Party Trivia exists as a live online game. There are no guest accounts, chat, spectator mode, tournament brackets, matchmaking, push notifications or native apps. Account deletion is handled through Supabase for this MVP. The README lists these limitations plainly.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 top-0 h-96 w-96 rounded-full bg-sage/20 blur-3xl"
        />
        <div className="shell relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-terracotta" aria-hidden="true" />
              <p className="eyebrow">The honest version</p>
            </div>
            <h1 className="text-display mt-5">
              What this site
              <br />
              <span className="italic text-terracotta">actually does.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              {site.name} is a small collection of party games plus one genuinely live online game.
              This page explains the moving parts, including the limits, without a marketing fog.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <ButtonLink href="/games">
                Browse offline games
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/online/trivia" variant="secondary">
                See Party Trivia
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper-light py-12 sm:py-16">
        <div className="shell">
          <div className="grid gap-4 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="flex flex-col rounded-panel border border-line bg-paper p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage/25 text-forest">
                  <pillar.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="eyebrow mt-5">{pillar.eyebrow}</p>
                <h2 className="mt-2 font-display text-2xl font-medium leading-tight tracking-[-0.03em] text-forest">
                  {pillar.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{pillar.body}</p>
                <Link href={pillar.href} className="link-underline mt-5 self-start text-sm">
                  {pillar.link}
                  <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="eyebrow">In a live room</p>
              <h2 className="text-heading mt-3">The server is the referee.</h2>
              <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">
                Party Trivia is the part of the site that cannot work as a static page. Here is the
                actual path a round takes through the stack.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { icon: Users, title: "The host creates a room", body: "A Postgres function checks the request, builds a six-character code and inserts the host as the first player." },
                  { icon: LockKeyhole, title: "Players join with RLS on", body: "Membership is checked on every state read. People outside the room cannot select its rows." },
                  { icon: Clock3, title: "The database starts the clock", body: "Starting the round draws questions and sets question_started_at and question_ends_at in one transaction." },
                  { icon: ShieldCheck, title: "Answers are scored at reveal", body: "Correctness and speed are computed on submission but points land only when the room enters reveal." },
                  { icon: MonitorSmartphone, title: "Phones follow the room state", body: "Realtime events trigger a refetch; a polling fallback runs every five seconds. State is always parsed from the database, never patched locally with a guessed score." },
                ].map((step, index) => (
                  <div key={step.title} className="flex gap-3 rounded-card border border-line bg-white/40 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest/8 text-forest">
                      <step.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-forest">
                        <span className="mr-1.5 text-[0.65rem] font-bold text-ink-faint">0{index + 1}</span>
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="rounded-panel border border-forest/10 bg-forest p-6 text-paper-light sm:p-8">
                <p className="text-[0.68rem] font-bold uppercase tracking-label text-amber">The security model</p>
                <h3 className="mt-3 font-display text-2xl font-medium tracking-[-0.03em] text-paper-light">
                  Four things the browser never gets
                </h3>
                <ul className="mt-5 space-y-4 text-sm leading-relaxed text-paper-light/70">
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" aria-hidden="true" />
                    The correct option index before the reveal.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" aria-hidden="true" />
                    A correctness flag in the answer-submission response.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" aria-hidden="true" />
                    A live score change when an answer arrives. It lands at reveal instead.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" aria-hidden="true" />
                    Any direct read access to the questions or answers tables.
                  </li>
                </ul>
                <p className="mt-6 border-t border-white/12 pt-4 text-xs leading-relaxed text-paper-light/45">
                  This reduces cheating from the normal browser path. It is not a claim of perfect
                  security: anyone who controls a signed-in client can still collaborate with another
                  person outside the app.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-card border border-line bg-white/45 p-4">
                  <WifiOff className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
                  <p className="mt-2 text-sm font-bold text-forest">No backend? Still usable</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    The library and finder are static. Accounts and rooms show a setup state instead of
                    pretending to work.
                  </p>
                </div>
                <div className="rounded-card border border-line bg-white/45 p-4">
                  <Heart className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
                  <p className="mt-2 text-sm font-bold text-forest">No invented proof</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    No testimonials, review scores or player-count claims. The only numbers shown are
                    facts from your own account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper-light py-12 sm:py-16">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <CircleHelp className="h-5 w-5 text-terracotta-deep" aria-hidden="true" />
              <p className="eyebrow">Straight answers</p>
            </div>
            <h2 className="text-heading mt-3">Questions people actually ask</h2>
            <div className="mt-7 space-y-2.5">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-card border border-line bg-white/45">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-sm font-bold text-forest sm:px-5">
                    {faq.question}
                    <span
                      aria-hidden="true"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-forest/15 text-lg font-normal text-forest/60 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="border-t border-line/70 px-4 pb-5 pt-4 text-sm leading-relaxed text-ink-soft sm:px-5">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-9 flex flex-col items-start justify-between gap-4 rounded-panel border border-line bg-forest p-6 text-paper-light sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-2xl font-medium tracking-[-0.03em] text-paper-light">
                  Ready to put a game on the table?
                </p>
                <p className="mt-1 text-sm text-paper-light/55">
                  The offline collection works right now, no account required.
                </p>
              </div>
              <ButtonLink href="/games" variant="dark" className="shrink-0 border-amber/30 bg-amber text-forest hover:bg-amber-light">
                Browse games
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs">
              <Link href="/setup" className="link-underline">
                Backend setup guide
              </Link>
              <Link href="/online" className="link-underline">
                Online games
              </Link>
              <Link href="/games" className="link-underline">
                Full library
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
