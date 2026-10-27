"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Clock3,
  Copy,
  Crown,
  Hash,
  Home,
  Info,
  LoaderCircle,
  LogOut,
  Play,
  RefreshCw,
  RotateCcw,
  Share2,
  Sparkles,
  Trophy,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { InlineNotice } from "@/components/ui/form";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { actionErrorMessage, parseRoomState } from "@/lib/trivia/state";
import type { TriviaPlayer, TriviaRoomState } from "@/lib/trivia/types";
import { cn, getInitials, pluralise } from "@/lib/utils";

type ConnectionState = "connecting" | "live" | "reconnecting";

const difficultyLabels: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

function useNow(active: boolean) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    if (!active) return;
    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [active]);

  return now;
}

async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the selection-based fallback.
  }

  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(area);
    return copied;
  } catch {
    return false;
  }
}

function ConnectionBadge({ connection, onRefresh }: { connection: ConnectionState; onRefresh: () => void }) {
  const live = connection === "live";
  return (
    <button
      type="button"
      onClick={onRefresh}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-forest/12 bg-white/55 px-3 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-ink-soft transition-colors hover:border-forest/25 hover:bg-white/80"
      title="Refresh the room now. A fallback refresh also runs every few seconds."
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {live ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage-deep opacity-50" />
        ) : null}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            live ? "bg-sage-deep" : connection === "connecting" ? "bg-amber-deep" : "bg-terracotta",
          )}
        />
      </span>
      {live ? "Live" : connection === "connecting" ? "Connecting" : "Auto-refresh"}
      <RefreshCw className="h-3 w-3" aria-hidden="true" />
    </button>
  );
}

function RoomCodeBar({
  code,
  statusLabel,
  playerCount,
  presentCount,
  shareNote,
  onCopy,
  onShare,
}: {
  code: string;
  statusLabel: string;
  playerCount: number;
  presentCount: number;
  shareNote: string;
  onCopy: () => void;
  onShare: () => void;
}) {
  return (
    <header className="mt-4 rounded-panel border border-line bg-paper-light/85 p-4 shadow-soft backdrop-blur-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-forest/12 bg-sage/20 text-forest">
            <Hash className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-ink-faint">Room code</p>
            <p className="font-display text-xl font-semibold tracking-[0.18em] text-forest sm:text-2xl">{code}</p>
          </div>
          <div className="ml-1 flex items-center gap-1">
            <button
              type="button"
              onClick={onCopy}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-forest/12 bg-white/60 text-forest transition-colors hover:bg-white"
              aria-label="Copy room code"
              title="Copy room code"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onShare}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-forest/12 bg-white/60 text-forest transition-colors hover:bg-white"
              aria-label="Share room link"
              title="Share room link"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold text-ink-soft">
          <span className="rounded-full border border-forest/12 bg-white/60 px-2.5 py-1">{statusLabel}</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-forest/12 bg-white/60 px-2.5 py-1">
            <Users className="h-3 w-3" aria-hidden="true" />
            {pluralise(playerCount, "player")}
          </span>
          {presentCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-sage-deep/25 bg-sage/15 px-2.5 py-1 text-forest">
              <Wifi className="h-3 w-3" aria-hidden="true" />
              {presentCount} online
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-2 min-h-4 text-xs text-ink-faint" aria-live="polite">
        {shareNote}
      </p>
    </header>
  );
}

function ScoreBoard({
  players,
  myPlayerId,
  title = "Leaderboard",
  note,
}: {
  players: TriviaPlayer[];
  myPlayerId: string;
  title?: string;
  note?: string;
}) {
  return (
    <div className="rounded-panel border border-line bg-paper-light/90 p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-forest">{title}</h2>
        <Trophy className="h-4 w-4 text-amber-deep" aria-hidden="true" />
      </div>
      {note ? <p className="mt-1 text-xs leading-relaxed text-ink-faint">{note}</p> : null}
      <ol className="mt-4 space-y-1.5">
        {players.map((player, index) => {
          const isMe = player.player_id === myPlayerId;
          return (
            <li
              key={player.player_id}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-2 py-2",
                isMe ? "bg-sage/20" : index === 0 ? "bg-amber-light/25" : "bg-transparent",
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/70 font-display text-xs font-semibold text-forest/70">
                {index + 1}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/10 text-[0.66rem] font-bold text-forest">
                {getInitials(player.display_name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className={cn("truncate text-sm font-semibold text-forest", isMe && "font-bold")}>
                    {player.display_name}
                  </span>
                  {player.is_host ? <Crown className="h-3 w-3 shrink-0 text-amber-deep" aria-label="Host" /> : null}
                </span>
                <span className="text-[0.66rem] text-ink-faint">
                  {isMe ? "You" : `${pluralise(player.correct_count, "correct answer")}`}
                </span>
              </span>
              <span className="shrink-0 font-display text-base font-semibold tabular-nums text-forest">
                {player.score.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function LobbyView({
  state,
  onStart,
  startPending,
}: {
  state: TriviaRoomState;
  onStart: () => void;
  startPending: boolean;
}) {
  const canStart = state.is_host && state.players.length >= 2 && !startPending;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
      <section className="relative overflow-hidden rounded-panel bg-forest p-6 text-paper-light shadow-lifted sm:p-8">
        <div className="noise-overlay opacity-[0.06]" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber/10 blur-2xl"
        />
        <div className="relative">
          <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-label text-amber">
            <span className="h-2 w-2 rounded-full bg-amber" aria-hidden="true" />
            The room is open
          </div>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-[-0.035em] text-paper-light sm:text-4xl">
            {state.is_host ? "You are hosting." : "Waiting for the host."}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-paper-light/65">
            {state.is_host
              ? "Share the code, wait for at least one more player, then start the round. Everyone answers on their own screen."
              : "The host will start the round when everyone is in. Keep this page open — the first question appears automatically."}
          </p>

          <div className="mt-6 grid grid-cols-6 gap-1.5 sm:gap-2" aria-label={`Room code ${state.room.room_code}`}>
            {state.room.room_code.split("").map((character, index) => (
              <span
                key={`${character}-${index}`}
                className="flex aspect-square items-center justify-center rounded-xl border border-white/15 bg-white/10 font-display text-xl font-semibold text-paper-light sm:text-2xl"
              >
                {character}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {state.is_host ? (
              <Button
                type="button"
                size="lg"
                onClick={onStart}
                disabled={!canStart}
                className="border-transparent bg-amber text-forest hover:bg-amber-light"
              >
                {startPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
                {startPending ? "Starting…" : "Start the round"}
              </Button>
            ) : (
              <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/12 bg-white/8 px-4 text-sm font-semibold text-paper-light/75">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Ready when you are
              </span>
            )}
            <span className="text-xs text-paper-light/45">
              {state.room.question_count} questions · {state.room.question_seconds}s each
            </span>
          </div>

          {state.is_host && state.players.length < 2 ? (
            <p className="mt-3 text-xs font-semibold text-amber">
              At least two players are needed before the round can start.
            </p>
          ) : null}
        </div>
      </section>

      <div className="space-y-5">
        <section className="rounded-panel border border-line bg-paper-light p-5 shadow-soft sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-medium tracking-[-0.02em] text-forest">
              At the table
            </h2>
            <span className="text-xs font-semibold text-ink-faint">
              {state.players.length}/{state.room.max_players}
            </span>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {state.players.map((player) => (
              <li
                key={player.player_id}
                className="flex items-center gap-3 rounded-xl border border-line/70 bg-white/40 px-3 py-2.5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/30 text-xs font-bold text-forest">
                  {getInitials(player.display_name)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-forest">
                  {player.display_name}
                  {player.player_id === state.my_player_id ? (
                    <span className="ml-1.5 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-ink-faint">
                      you
                    </span>
                  ) : null}
                </span>
                {player.is_host ? <Crown className="h-4 w-4 text-amber-deep" aria-label="Host" /> : null}
              </li>
            ))}
          </ul>
          {state.players.length === 1 ? (
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              Send the room code to one more person. The host&apos;s start button unlocks at two players.
            </p>
          ) : null}
        </section>

        <section className="rounded-card border border-forest/12 bg-sage/12 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-forest">
            <Info className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
            The shape of the round
          </p>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-soft">
            <li>Four options per question. One answer per player, locked when submitted.</li>
            <li>Correct answers stay hidden until the host reveals them, after the timer or early.</li>
            <li>1,000 points for a correct answer, plus up to 500 for speed.</li>
            <li>The host moves from reveal to the next question, then to the final board.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function QuestionView({
  state,
  remainingMs,
  mySelection,
  answerPending,
  revealPending,
  advancePending,
  onAnswer,
  onReveal,
  onAdvance,
}: {
  state: TriviaRoomState;
  remainingMs: number | null;
  mySelection: number | null;
  answerPending: boolean;
  revealPending: boolean;
  advancePending: boolean;
  onAnswer: (index: number) => void;
  onReveal: () => void;
  onAdvance: () => void;
}) {
  const question = state.question;
  if (!question) {
    return (
      <div className="rounded-panel border border-line bg-paper-light p-8 text-center">
        <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-forest" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-forest">Loading the question…</p>
        <p className="mt-1 text-xs text-ink-faint">This should only take a moment.</p>
      </div>
    );
  }

  const reveal = state.room.status === "reveal";
  const totalMs = state.room.question_seconds * 1000;
  const percentage = remainingMs === null ? 0 : Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
  const seconds = remainingMs === null ? null : Math.ceil(remainingMs / 1000);
  const timeUp = remainingMs !== null && remainingMs <= 0;
  const canAnswer = !reveal && mySelection === null && !answerPending && !timeUp && remainingMs !== null;
  const correctIndex = question.correct_option_index;
  const counts = question.option_counts ?? [0, 0, 0, 0];
  const totalAnswers = counts.reduce((sum, count) => sum + count, 0);
  const isCorrect = reveal && correctIndex !== null && mySelection === correctIndex;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_19rem] lg:items-start">
      <section className="rounded-panel border border-line bg-paper-light/92 p-5 shadow-soft backdrop-blur-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-forest px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-paper-light">
              Question {question.index} of {question.total}
            </span>
            <span className="rounded-full border border-forest/12 bg-white/60 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink-soft">
              {question.category}
            </span>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
              {difficultyLabels[question.difficulty] ?? question.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2" role="timer" aria-label={seconds === null ? "Question timer" : `${seconds} seconds remaining`}>
            <Clock3 className="h-4 w-4 text-ink-faint" aria-hidden="true" />
            <span
              className={cn(
                "font-display text-xl font-semibold tabular-nums",
                timeUp ? "text-terracotta-deep" : (seconds ?? 99) <= 5 ? "text-terracotta-deep" : "text-forest",
              )}
            >
              {seconds === null ? "—" : timeUp ? "0" : seconds}
              <span className="ml-0.5 text-xs font-bold">s</span>
            </span>
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-forest/10" aria-hidden="true">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500 ease-linear",
              timeUp ? "bg-terracotta" : (seconds ?? 99) <= 5 ? "bg-terracotta" : reveal ? "bg-sage-deep" : "bg-forest",
            )}
            style={{ width: `${reveal ? 100 : percentage}%` }}
          />
        </div>

        <h2 className="mt-5 font-display text-2xl font-medium leading-[1.15] tracking-[-0.03em] text-forest sm:text-3xl">
          {question.prompt}
        </h2>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {question.options.map((option, index) => {
            const selected = mySelection === index;
            const isCorrectOption = reveal && correctIndex === index;
            const isWrongSelection = reveal && selected && !isCorrectOption;
            const count = counts[index] ?? 0;
            const share = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;

            return (
              <button
                key={`${question.index}-${index}`}
                type="button"
                disabled={!canAnswer}
                onClick={() => onAnswer(index)}
                aria-pressed={selected}
                className={cn(
                  "group relative flex min-h-[4.4rem] w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition duration-200 ease-soft sm:p-4",
                  !reveal && selected && "border-forest bg-forest/8 shadow-[inset_0_0_0_1px_rgba(35,61,50,0.25)]",
                  !reveal && !selected && "border-forest/14 bg-white/55 hover:border-forest/35 hover:bg-white/85",
                  !reveal && mySelection !== null && !selected && "opacity-60",
                  reveal && isCorrectOption && "border-sage-deep bg-sage/20",
                  reveal && isWrongSelection && "border-terracotta/60 bg-terracotta/10",
                  reveal && !isCorrectOption && !isWrongSelection && "border-line bg-white/35 opacity-65",
                  !canAnswer && !reveal && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[0.72rem] font-bold",
                    !reveal && selected && "border-forest bg-forest text-paper-light",
                    !reveal && !selected && "border-forest/15 bg-white/70 text-forest/60",
                    reveal && isCorrectOption && "border-sage-deep bg-sage-deep text-white",
                    reveal && isWrongSelection && "border-terracotta bg-terracotta text-white",
                    reveal && !isCorrectOption && !isWrongSelection && "border-forest/10 bg-white/50 text-ink-faint",
                  )}
                >
                  {reveal && isCorrectOption ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : reveal && isWrongSelection ? (
                    <X className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[0.92rem] font-semibold leading-snug text-forest",
                      !reveal && selected && "font-bold",
                    )}
                  >
                    {option}
                  </span>
                  {reveal ? (
                    <span className="mt-1.5 flex items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-forest/10">
                        <span
                          className={cn("block h-full rounded-full", isCorrectOption ? "bg-sage-deep" : "bg-forest/30")}
                          style={{ width: `${share}%` }}
                        />
                      </span>
                      <span className="shrink-0 text-[0.63rem] font-semibold tabular-nums text-ink-faint">
                        {count} · {share}%
                      </span>
                    </span>
                  ) : null}
                </span>
                {reveal && isCorrectOption ? (
                  <span className="sr-only">Correct answer</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs leading-relaxed text-ink-soft" aria-live="polite">
            {reveal ? (
              mySelection === null ? (
                "You did not answer this question."
              ) : isCorrect ? (
                <span className="font-bold text-forest">Correct. Nice work.</span>
              ) : (
                <span className="font-semibold text-terracotta-deep">Not this time. The correct answer is highlighted.</span>
              )
            ) : mySelection !== null ? (
              <span className="font-semibold text-forest">Answer locked in. Correctness appears at the reveal.</span>
            ) : timeUp ? (
              "Time is up. The answer will appear in a moment."
            ) : (
              <>
                {question.answered_count} of {state.players.length} players answered.
              </>
            )}
          </div>

          {state.is_host ? (
            <div className="flex flex-wrap gap-2">
              {reveal ? (
                <Button
                  type="button"
                  onClick={onAdvance}
                  disabled={advancePending}
                  className="min-w-36"
                >
                  {advancePending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  )}
                  {question.index >= question.total ? "See final results" : "Next question"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onReveal}
                  disabled={revealPending || answerPending}
                >
                  {revealPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  )}
                  {timeUp ? "Reveal now" : "Reveal early"}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-xs text-ink-faint">
              {reveal ? "The host controls what happens next." : "The host can reveal the answer early at any point."}
            </p>
          )}
        </div>

        {reveal && question.explanation ? (
          <div className="mt-4 rounded-xl border border-amber/30 bg-amber-light/20 p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-amber-deep">Why</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{question.explanation}</p>
          </div>
        ) : null}
      </section>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <ScoreBoard
          players={state.players}
          myPlayerId={state.my_player_id}
          note="Scores change only when an answer is revealed."
        />
        {!reveal ? (
          <div className="rounded-card border border-line bg-white/45 p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-forest">
              <Info className="h-3.5 w-3.5 text-terracotta-deep" aria-hidden="true" />
              No spoilers
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              The score does not jump when you answer. That is deliberate: the live board cannot give
              away who was right before the reveal.
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function ResultsView({
  state,
  onRestart,
  restartPending,
}: {
  state: TriviaRoomState;
  onRestart: () => void;
  restartPending: boolean;
}) {
  const winner = state.players[0];
  const rest = state.players.slice(1);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <section className="overflow-hidden rounded-panel border border-forest/10 bg-forest text-paper-light shadow-lifted">
        <div className="relative p-6 sm:p-8">
          <div className="noise-overlay opacity-[0.06]" aria-hidden="true" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber/15 blur-3xl"
          />
          <div className="relative">
            <p className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-label text-amber">
              <Trophy className="h-4 w-4" aria-hidden="true" />
              Final standings
            </p>
            {winner ? (
              <>
                <h2 className="mt-4 font-display text-4xl font-medium tracking-[-0.04em] text-paper-light sm:text-5xl">
                  {winner.display_name}
                </h2>
                <p className="mt-2 text-sm text-paper-light/65">
                  {winner.score.toLocaleString()} points · {pluralise(winner.correct_count, "correct answer")}
                  {winner.is_host ? " · host" : ""}
                </p>
              </>
            ) : (
              <h2 className="mt-4 font-display text-3xl text-paper-light">No scores this time.</h2>
            )}

            <ol className="mt-7 space-y-2">
              {rest.map((player, index) => (
                <li
                  key={player.player_id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/6 px-3 py-2.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-xs font-semibold text-paper-light/70">
                    {index + 2}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber/15 text-[0.66rem] font-bold text-amber">
                    {getInitials(player.display_name)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-paper-light/85">
                    {player.display_name}
                    {player.player_id === state.my_player_id ? (
                      <span className="ml-1.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-paper-light/40">
                        you
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 font-display text-base font-semibold tabular-nums text-amber">
                    {player.score.toLocaleString()}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-7 border-t border-white/12 pt-5">
              {state.is_host ? (
                <Button
                  type="button"
                  onClick={onRestart}
                  disabled={restartPending}
                  size="lg"
                  className="border-transparent bg-amber text-forest hover:bg-amber-light"
                >
                  {restartPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  )}
                  {restartPending ? "Resetting the room…" : "Play another round"}
                </Button>
              ) : (
                <p className="flex items-center gap-2 text-sm text-paper-light/60">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Waiting for the host to start another round.
                </p>
              )}
              <p className="mt-3 text-xs leading-relaxed text-paper-light/40">
                A new round keeps the same room code, resets the scores and draws fresh questions. The
                room expires four hours after it was created.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-5">
        <ScoreBoard players={state.players} myPlayerId={state.my_player_id} title="Every score" />
        <div className="rounded-card border border-line bg-white/45 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-forest">
            <CircleCheck className="h-4 w-4 text-sage-deep" aria-hidden="true" />
            How points worked
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-soft">
            Each correct answer earned 1,000 points plus a speed bonus of up to 500. Only answers
            submitted before the database clock ran out were counted.
          </p>
        </div>
      </div>
    </div>
  );
}

function ClosedView({ code, isHost }: { code: string; isHost: boolean | null }) {
  return (
    <div className="mx-auto max-w-2xl rounded-panel border border-line bg-paper-light p-6 text-center shadow-soft sm:p-10">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta-deep">
        <WifiOff className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="eyebrow mt-5">Room {code}</p>
      <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.035em] text-forest">
        This room has closed.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
        {isHost
          ? "You left the room, so it closed for everyone. Start a fresh one when the table is ready."
          : "The host left or the four-hour room window ended. Ask them for a new code, or host the next round yourself."}
      </p>
      <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
        <ButtonLink href="/online/trivia">
          Create or join a room
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
        <ButtonLink href="/online" variant="secondary">
          Back to online games
        </ButtonLink>
      </div>
    </div>
  );
}

function LeaveDialog({
  open,
  isHost,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  isHost: boolean;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-forest-deep/50 p-4 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Cancel and stay in the room"
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (!pending) onCancel();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-title"
        className="relative w-full max-w-md rounded-panel border border-line bg-paper-light p-6 shadow-lifted sm:p-7"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta-deep">
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 id="leave-title" className="mt-4 font-display text-2xl font-medium tracking-[-0.03em] text-forest">
          Leave this room?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {isHost
            ? "You are the host. Leaving closes the room for every player, including anyone still in the middle of a question."
            : "Your seat and score will be removed from this room. You can rejoin with the same code while it is still in the lobby; once a round is underway, ask the host to start a new game."}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button ref={cancelRef} type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            Stay in the room
          </Button>
          <Button type="button" variant="terracotta" onClick={onConfirm} disabled={pending}>
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? "Leaving…" : "Leave room"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TriviaRoom({
  code,
  userId,
  initialName,
}: {
  code: string;
  userId: string;
  initialName: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [state, setState] = useState<TriviaRoomState | null>(null);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "fatal">("loading");
  const [fatalMessage, setFatalMessage] = useState("");
  const [syncError, setSyncError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [presentCount, setPresentCount] = useState(0);
  const [localAnswer, setLocalAnswer] = useState<{ key: string; index: number } | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [shareNote, setShareNote] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  const now = useNow(Boolean(state) && state?.room.status === "question");
  const mountedRef = useRef(true);
  const stateRef = useRef<TriviaRoomState | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const refreshInFlightRef = useRef(false);
  const serverOffsetRef = useRef(0);
  const expiryRequestedRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(
    async (targetRoomId?: string) => {
      const roomId = targetRoomId ?? roomIdRef.current;
      if (!supabase || !roomId || refreshInFlightRef.current) return;

      refreshInFlightRef.current = true;
      try {
        const { data, error } = await supabase.rpc("get_trivia_room_state", { p_room_id: roomId });
        if (!mountedRef.current) return;

        if (error) {
          const message = actionErrorMessage(error, "We could not refresh the room.");
          if (!stateRef.current) {
            setFatalMessage(message);
            setLoadStatus("fatal");
          } else {
            setSyncError(message);
          }
          return;
        }

        const parsed = parseRoomState(data);
        if (!parsed) {
          if (!stateRef.current) {
            setFatalMessage("The room sent back an unexpected state. Try refreshing.");
            setLoadStatus("fatal");
          } else {
            setSyncError("The room state could not be read. We will keep trying.");
          }
          return;
        }

        serverOffsetRef.current = Date.parse(parsed.server_now) - Date.now();
        stateRef.current = parsed;
        setState(parsed);
        setSyncError("");
        setLoadStatus("ready");
      } catch {
        if (!mountedRef.current) return;
        if (!stateRef.current) {
          setFatalMessage("The room could not be reached. Check your connection and try again.");
          setLoadStatus("fatal");
        } else {
          setSyncError("The connection dropped. We will keep trying to catch you up.");
        }
      } finally {
        refreshInFlightRef.current = false;
      }
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) {
      setFatalMessage("Live rooms are not configured. Check the setup page.");
      setLoadStatus("fatal");
      return;
    }

    let cancelled = false;
    setLoadStatus("loading");
    stateRef.current = null;
    setState(null);
    setFatalMessage("");
    setSyncError("");
    setConnection("connecting");

    async function connect() {
      const { data, error } = await supabase!.rpc("join_trivia_room", { p_room_code: code });
      if (cancelled) return;

      if (error) {
        setFatalMessage(actionErrorMessage(error, "We could not open that room. Check the code and try again."));
        setLoadStatus("fatal");
        return;
      }

      const room = Array.isArray(data) ? data[0] : data;
      if (!room?.room_id) {
        setFatalMessage("That room did not return a state. Ask the host for a fresh code.");
        setLoadStatus("fatal");
        return;
      }

      roomIdRef.current = room.room_id;
      await refresh(room.room_id);
      if (cancelled) return;

      const channel = supabase!
        .channel(`trivia-room:${room.room_id}`, {
          config: { presence: { key: userId } },
        })
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "game_rooms", filter: `id=eq.${room.room_id}` },
          () => {
            void refresh(room.room_id);
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${room.room_id}` },
          () => {
            void refresh(room.room_id);
          },
        )
        .on("presence", { event: "sync" }, () => {
          setPresentCount(Object.keys(channel.presenceState()).length);
        })
        .subscribe((status) => {
          if (cancelled) return;
          if (status === "SUBSCRIBED") {
            setConnection("live");
            void channel.track({ online_at: new Date().toISOString() });
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setConnection("reconnecting");
          }
        });

      channelRef.current = channel;
    }

    void connect();

    return () => {
      cancelled = true;
      const channel = channelRef.current;
      channelRef.current = null;
      if (channel) void supabase.removeChannel(channel);
    };
    // `refresh` is stable and reads the latest room state from a ref, so the
    // realtime channel does not need to be torn down after every update.
  }, [code, userId, retryToken, supabase, refresh]);

  useEffect(() => {
    if (!supabase) return;

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    document.addEventListener("visibilitychange", onVisible);
    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 5000);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(poll);
    };
  }, [refresh, supabase]);

  const question = state?.question ?? null;
  const questionEndsAt = question?.ends_at ? Date.parse(question.ends_at) : null;
  const remainingMs =
    questionEndsAt !== null && now !== null ? Math.max(0, questionEndsAt - (now + serverOffsetRef.current)) : null;
  const answerKey = state?.question ? `${state.room.current_question_index}:${state.question.index}` : "";
  const mySelection =
    question?.my_answer ?? (localAnswer && localAnswer.key === answerKey ? localAnswer.index : null);

  useEffect(() => {
    setLocalAnswer(null);
    expiryRequestedRef.current = null;
  }, [state?.room.current_question_index, state?.room.status]);

  useEffect(() => {
    if (!state || state.room.status !== "question" || remainingMs === null || remainingMs > 0) return;

    const key = `${state.room.id}:${state.room.current_question_index}`;
    if (expiryRequestedRef.current === key) return;
    expiryRequestedRef.current = key;
    const timeout = window.setTimeout(() => {
      void refresh();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [remainingMs, state, refresh]);

  useEffect(() => {
    if (!shareNote) return;
    const timeout = window.setTimeout(() => setShareNote(""), 4500);
    return () => window.clearTimeout(timeout);
  }, [shareNote]);

  async function handleCopyCode() {
    const copied = await copyText(state?.room.room_code ?? code);
    setShareNote(copied ? "Room code copied." : "Could not copy automatically. Select the code above.");
  }

  async function handleShare() {
    const url = `${window.location.origin}/online/trivia/room/${state?.room.room_code ?? code}`;
    const shareData = {
      title: "Party Trivia",
      text: `Join my Party Trivia room with code ${state?.room.room_code ?? code}.`,
      url,
    };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    const copied = await copyText(url);
    setShareNote(copied ? "Room link copied." : "Could not copy the link. You can share the room code instead.");
  }

  async function submitAnswer(optionIndex: number) {
    if (!supabase || !state || actionPending) return;

    setActionError("");
    setLocalAnswer({ key: answerKey, index: optionIndex });
    setActionPending("answer");

    const { error } = await supabase.rpc("submit_trivia_answer", {
      p_room_id: state.room.id,
      p_selected_option_index: optionIndex,
    });

    setActionPending(null);

    if (error) {
      setLocalAnswer(null);
      setActionError(actionErrorMessage(error, "That answer did not go through. Try again."));
      void refresh();
      return;
    }

    await refresh();
  }

  async function startGame() {
    if (!supabase || !state || actionPending) return;
    setActionError("");
    setActionPending("start");

    const { error } = await supabase.rpc("start_trivia_game", { p_room_id: state.room.id });

    setActionPending(null);
    if (error) {
      setActionError(actionErrorMessage(error, "The round could not start."));
      return;
    }
    await refresh();
  }

  async function revealEarly() {
    if (!supabase || !state || actionPending) return;
    setActionError("");
    setActionPending("reveal");

    const { error } = await supabase.rpc("reveal_trivia_question", { p_room_id: state.room.id });

    setActionPending(null);
    if (error) {
      setActionError(actionErrorMessage(error, "The answer could not be revealed."));
      void refresh();
      return;
    }
    await refresh();
  }

  async function advance() {
    if (!supabase || !state || actionPending) return;
    setActionError("");
    setActionPending("advance");

    const { error } = await supabase.rpc("advance_trivia_room", { p_room_id: state.room.id });

    setActionPending(null);
    if (error) {
      setActionError(actionErrorMessage(error, "The room could not move on."));
      void refresh();
      return;
    }
    await refresh();
  }

  async function restart() {
    if (!supabase || !state || actionPending) return;
    setActionError("");
    setActionPending("restart");

    const { error } = await supabase.rpc("restart_trivia_room", { p_room_id: state.room.id });

    setActionPending(null);
    if (error) {
      setActionError(actionErrorMessage(error, "The room could not reset."));
      return;
    }
    await refresh();
  }

  async function leaveRoom() {
    if (!supabase || !state || actionPending) return;
    setActionError("");
    setActionPending("leave");

    const { error } = await supabase.rpc("leave_trivia_room", { p_room_id: state.room.id });

    setActionPending(null);
    if (error) {
      setLeaveOpen(false);
      setActionError(actionErrorMessage(error, "We could not leave the room cleanly. Try again."));
      return;
    }

    roomIdRef.current = null;
    setLeaveOpen(false);
    router.replace("/online/trivia");
    router.refresh();
  }

  if (loadStatus === "loading" && !state) {
    return (
      <div className="shell flex min-h-[62vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-forest/12 bg-white/60">
          <LoaderCircle className="h-6 w-6 animate-spin text-forest" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-medium tracking-[-0.035em] text-forest">
          Opening room {code}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">Checking your seat at the table.</p>
      </div>
    );
  }

  if (loadStatus === "fatal" || !state) {
    return (
      <div className="shell flex min-h-[62vh] items-center py-14">
        <div className="mx-auto w-full max-w-xl rounded-panel border border-line bg-paper-light p-6 text-center shadow-soft sm:p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta-deep">
            <WifiOff className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="eyebrow mt-4">Room {code}</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.035em] text-forest">
            We could not open this room.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            {fatalMessage || "The room may have closed, or the code may point somewhere else."}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Button
              type="button"
              onClick={() => {
                setLoadStatus("loading");
                setRetryToken((value) => value + 1);
              }}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
            <ButtonLink href="/online/trivia" variant="secondary">
              Join another room
            </ButtonLink>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-ink-faint">
            Signed in as {initialName}. If a game is already underway, ask the host to start a new round
            or send a fresh room.
          </p>
        </div>
      </div>
    );
  }

  const { room, players, is_host } = state;
  const statusLabel =
    room.status === "lobby"
      ? "In the lobby"
      : room.status === "question"
        ? "Question live"
        : room.status === "reveal"
          ? "Answer revealed"
          : room.status === "results"
            ? "Final results"
            : "Closed";

  return (
    <div className="relative overflow-hidden pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 h-80 w-80 rounded-full bg-sage/18 blur-3xl"
      />
      <div className="shell relative pt-6 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/online"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-forest"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Online games
          </Link>
          <div className="flex items-center gap-2">
            <ConnectionBadge connection={connection} onRefresh={() => void refresh()} />
            <button
              type="button"
              onClick={() => setLeaveOpen(true)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-forest/12 bg-white/55 px-3 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-ink-soft transition-colors hover:border-terracotta/30 hover:bg-terracotta/10 hover:text-terracotta-deep"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Leave
            </button>
          </div>
        </div>

        <RoomCodeBar
          code={room.room_code}
          statusLabel={statusLabel}
          playerCount={players.length}
          presentCount={presentCount}
          shareNote={shareNote}
          onCopy={() => void handleCopyCode()}
          onShare={() => void handleShare()}
        />

        <div className="mt-4 space-y-3" aria-live="polite">
          {syncError ? (
            <InlineNotice tone="error">
              {syncError}{" "}
              <button
                type="button"
                onClick={() => void refresh()}
                className="font-bold underline decoration-current/30 underline-offset-2"
              >
                Refresh now
              </button>
            </InlineNotice>
          ) : null}
          {actionError ? (
            <InlineNotice tone="error">
              <span className="flex items-start justify-between gap-3">
                <span>{actionError}</span>
                <button
                  type="button"
                  onClick={() => setActionError("")}
                  className="shrink-0 text-xs font-bold uppercase tracking-[0.08em]"
                >
                  Dismiss
                </button>
              </span>
            </InlineNotice>
          ) : null}
        </div>

        <div className="mt-5">
          {room.status === "closed" ? <ClosedView code={room.room_code} isHost={is_host} /> : null}
          {room.status === "lobby" ? (
            <LobbyView state={state} onStart={() => void startGame()} startPending={actionPending === "start"} />
          ) : null}
          {room.status === "question" || room.status === "reveal" ? (
            <QuestionView
              state={state}
              remainingMs={remainingMs}
              mySelection={mySelection}
              answerPending={actionPending === "answer"}
              revealPending={actionPending === "reveal"}
              advancePending={actionPending === "advance"}
              onAnswer={(index) => void submitAnswer(index)}
              onReveal={() => void revealEarly()}
              onAdvance={() => void advance()}
            />
          ) : null}
          {room.status === "results" ? (
            <ResultsView state={state} onRestart={() => void restart()} restartPending={actionPending === "restart"} />
          ) : null}
        </div>

        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-xs text-ink-faint">
          <Link href="/how-it-works" className="inline-flex min-h-9 items-center gap-1 underline decoration-forest/20 underline-offset-2">
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            How rooms and scoring work
          </Link>
          <span className="inline-flex items-center gap-1">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Room {code} · expires four hours after creation
          </span>
        </p>
      </div>

      <LeaveDialog
        open={leaveOpen}
        isHost={is_host}
        pending={actionPending === "leave"}
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => void leaveRoom()}
      />
    </div>
  );
}
