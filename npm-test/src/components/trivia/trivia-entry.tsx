"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock3,
  Hash,
  ListOrdered,
  LoaderCircle,
  LogIn,
  Play,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldShell, InlineNotice } from "@/components/ui/form";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { actionErrorMessage } from "@/lib/trivia/state";
import { isValidRoomCode, normaliseRoomCode } from "@/lib/utils";

const playerOptions = [2, 4, 6, 8, 10];
const questionOptions = [4, 6, 8, 10, 12];
const secondOptions = [10, 15, 20, 30, 45, 60];

export function TriviaEntry({
  signedIn,
  displayName,
  defaultCode = "",
}: {
  signedIn: boolean;
  displayName: string;
  defaultCode?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [questionCount, setQuestionCount] = useState(8);
  const [seconds, setSeconds] = useState(20);
  const [code, setCode] = useState(normaliseRoomCode(defaultCode));
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"create" | "join" | null>(null);

  const cleanCode = normaliseRoomCode(code);

  async function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Live rooms are not connected yet. Check the setup page.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Add the name other players should see.");
      return;
    }

    setPending("create");
    const { data, error: rpcError } = await supabase.rpc("create_trivia_room", {
      p_display_name: trimmedName,
      p_max_players: maxPlayers,
      p_question_count: questionCount,
      p_question_seconds: seconds,
    });
    setPending(null);

    if (rpcError) {
      setError(actionErrorMessage(rpcError, "We could not create the room. Please try again."));
      return;
    }

    const room = Array.isArray(data) ? data[0] : data;
    if (!room?.room_code) {
      setError("The room was created but no code came back. Please try again.");
      return;
    }

    router.push(`/online/trivia/room/${room.room_code}`);
  }

  async function joinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isValidRoomCode(cleanCode)) {
      setError("Room codes are six characters. Check the code and try again.");
      return;
    }

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Live rooms are not connected yet. Check the setup page.");
      return;
    }

    setPending("join");
    const { data, error: rpcError } = await supabase.rpc("join_trivia_room", {
      p_room_code: cleanCode,
    });
    setPending(null);

    if (rpcError) {
      setError(actionErrorMessage(rpcError, "We could not join that room. Check the code and try again."));
      return;
    }

    const room = Array.isArray(data) ? data[0] : data;
    if (!room?.room_code) {
      setError("That room did not open correctly. Ask the host for a fresh code.");
      return;
    }

    router.push(`/online/trivia/room/${room.room_code}`);
  }

  if (!signedIn) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="surface relative overflow-hidden p-6 sm:p-8">
          <div className="noise-overlay opacity-[0.04]" aria-hidden="true" />
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-forest/10 bg-sage/25 text-forest">
            <LogIn className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-medium tracking-[-0.03em] text-forest">
            A quick account keeps the room yours
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
            Live rooms need a signed-in host and signed-in players so the server can score answers,
            keep the leaderboard honest and let you reconnect on another device.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <ButtonLink href="/login?next=/online/trivia" size="lg" className="justify-between sm:min-w-44">
              Sign in to play
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/signup?next=/online/trivia" variant="secondary" size="lg">
              Create an account
            </ButtonLink>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-ink-faint">
            The whole offline library stays free without an account.
          </p>
        </div>

        <div className="rounded-panel border border-forest/10 bg-forest p-6 text-paper-light sm:p-8">
          <p className="font-sans text-[0.68rem] font-bold uppercase tracking-label text-paper-light/45">
            In the room
          </p>
          <ul className="mt-4 space-y-4 text-sm text-paper-light/75">
            <li className="flex gap-3">
              <Hash className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
              A six-character code and a link you can paste into the group chat.
            </li>
            <li className="flex gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
              Timed questions, with answers locked until the reveal.
            </li>
            <li className="flex gap-3">
              <ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
              Scores calculated on the server, not in someone&apos;s browser.
            </li>
            <li className="flex gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
              Play again from the same room without sending a new code.
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error ? (
        <div className="mb-5">
          <InlineNotice tone="error">{error}</InlineNotice>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={createRoom} className="surface p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Host a room</p>
              <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-forest">
                Set the table
              </h2>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/12 text-terracotta-deep">
              <Play className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-6 space-y-5">
            <FieldShell id="hostName" label="Your name in the room" hint="You can change this in account settings.">
              <input
                id="hostName"
                name="hostName"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={40}
                autoComplete="nickname"
                className="input-base"
                required
              />
            </FieldShell>

            <div className="grid gap-4 sm:grid-cols-3">
              <FieldShell id="maxPlayers" label="Table size">
                <div className="relative">
                  <Users
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                    aria-hidden="true"
                  />
                  <select
                    id="maxPlayers"
                    value={maxPlayers}
                    onChange={(event) => setMaxPlayers(Number(event.target.value))}
                    className="select-base pl-10"
                  >
                    {playerOptions.map((value) => (
                      <option key={value} value={value}>
                        {value} players
                      </option>
                    ))}
                  </select>
                </div>
              </FieldShell>

              <FieldShell id="questionCount" label="Questions">
                <div className="relative">
                  <ListOrdered
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                    aria-hidden="true"
                  />
                  <select
                    id="questionCount"
                    value={questionCount}
                    onChange={(event) => setQuestionCount(Number(event.target.value))}
                    className="select-base pl-10"
                  >
                    {questionOptions.map((value) => (
                      <option key={value} value={value}>
                        {value} questions
                      </option>
                    ))}
                  </select>
                </div>
              </FieldShell>

              <FieldShell id="seconds" label="Timer">
                <div className="relative">
                  <Clock3
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
                    aria-hidden="true"
                  />
                  <select
                    id="seconds"
                    value={seconds}
                    onChange={(event) => setSeconds(Number(event.target.value))}
                    className="select-base pl-10"
                  >
                    {secondOptions.map((value) => (
                      <option key={value} value={value}>
                        {value} seconds
                      </option>
                    ))}
                  </select>
                </div>
              </FieldShell>
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full justify-between" disabled={pending !== null}>
            <span className="inline-flex items-center gap-2">
              {pending === "create" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {pending === "create" ? "Opening the room…" : "Create the room"}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <p className="mt-3 text-center text-xs text-ink-faint">
            Playing as <span className="font-semibold text-forest">{name.trim() || displayName}</span>.{" "}
            <Link href="/dashboard/settings" className="underline decoration-forest/20 underline-offset-2">
              Change my name
            </Link>
            .
          </p>
        </form>

        <div
          id="join-room"
          className="scroll-mt-28 rounded-panel border border-white/10 bg-forest p-6 text-paper-light shadow-lifted sm:p-8"
        >
          <p className="font-sans text-[0.68rem] font-bold uppercase tracking-label text-paper-light/45">
            Already invited?
          </p>
          <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-paper-light">
            Join with a code
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-paper-light/60">
            Six characters, no hyphens. Ask the host if the room has already started.
          </p>

          <form onSubmit={joinRoom} className="mt-6">
            <label
              htmlFor="roomCode"
              className="mb-2 block font-sans text-[0.78rem] font-bold uppercase tracking-[0.1em] text-paper-light/65"
            >
              Room code
            </label>
            <input
              id="roomCode"
              name="roomCode"
              value={cleanCode}
              onChange={(event) => setCode(normaliseRoomCode(event.target.value))}
              placeholder="K7M2QP"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={6}
              className="h-16 w-full rounded-2xl border border-white/15 bg-white/10 px-4 text-center font-display text-3xl font-semibold uppercase tracking-[0.28em] text-paper-light placeholder:text-paper-light/25 focus:border-amber/60 focus:bg-white/14 focus:outline-none"
              aria-describedby="roomCode-hint"
            />
            <p id="roomCode-hint" className="mt-2 text-xs text-paper-light/45">
              Codes skip letters like I and O so they are easier to read aloud.
            </p>

            <Button
              type="submit"
              size="lg"
              variant="dark"
              className="mt-4 w-full justify-between border-amber/30 bg-amber text-forest hover:bg-amber-light"
              disabled={pending !== null || cleanCode.length !== 6}
            >
              <span className="inline-flex items-center gap-2">
                {pending === "join" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {pending === "join" ? "Finding the room…" : "Join the room"}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>

          <div className="mt-7 border-t border-white/12 pt-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-paper-light/80">
              <Settings className="h-4 w-4 text-amber" aria-hidden="true" />
              Playing as {displayName}
            </p>
            <Link
              href="/dashboard/settings"
              className="mt-2 inline-flex min-h-10 items-center text-xs font-semibold text-paper-light/55 underline decoration-white/20 underline-offset-4 hover:text-paper-light"
            >
              Adjust your account details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
