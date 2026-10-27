"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ArrowUpRight, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { ButtonLink } from "@/components/ui/button";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { site } from "@/lib/site";
import { cn, getInitials } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function signOut() {
    const supabase = getBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const displayName =
    (user?.user_metadata?.display_name as string | undefined)?.trim() ||
    user?.email?.split("@")[0] ||
    "Your account";

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-paper/82 backdrop-blur-xl supports-[backdrop-filter]:bg-paper/68">
      <div className="shell">
        <div className="flex h-[var(--header-height)] items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Wordmark />
            <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
              {site.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative py-2 text-[0.84rem] font-semibold tracking-[-0.01em] text-forest/70 transition-colors hover:text-forest",
                    isActive(pathname, item.href) && "text-forest",
                  )}
                >
                  {item.label}
                  {isActive(pathname, item.href) ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 mx-auto h-1 w-1 rounded-full bg-terracotta"
                    />
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {!authReady ? (
              <span className="h-8 w-20 animate-pulse rounded-lg bg-forest/8" aria-hidden="true" />
            ) : user ? (
              <Link
                href="/dashboard"
                className="flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest/8"
                title={user.email}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage/60 text-xs font-bold text-forest">
                  {getInitials(displayName)}
                </span>
                <span className="hidden lg:inline">Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-forest/75 transition-colors hover:text-forest"
              >
                Sign in
              </Link>
            )}
            <ButtonLink href="/online/trivia" size="sm">
              Create a room
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-forest/15 bg-white/50 text-forest transition-colors hover:bg-white/80 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-x-0 bottom-0 top-[var(--header-height)] z-40 bg-forest/25 backdrop-blur-[2px] md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-navigation"
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-var(--header-height))] overflow-y-auto border-t border-forest/10 bg-paper-light px-5 pb-[calc(1.5rem+var(--safe-bottom))] pt-5 shadow-lifted md:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {site.navigation.map((item, index) => (
                <Link
                  key={item.href}
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={item.href}
                  className={cn(
                    "flex min-h-12 items-center justify-between border-b border-line/70 font-display text-xl tracking-[-0.02em] text-forest",
                    isActive(pathname, item.href) && "text-terracotta-deep",
                  )}
                >
                  {item.label}
                  <ArrowUpRight className="h-4 w-4 opacity-50" aria-hidden="true" />
                </Link>
              ))}
            </nav>

            <div className="mt-5 grid gap-2.5">
              <ButtonLink href="/online/trivia" size="lg" className="w-full justify-between">
                Create a trivia room
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>

              {authReady && user ? (
                <div className="mt-2 rounded-panel border border-line bg-white/55 p-4">
                  <p className="text-xs font-semibold text-ink-faint">Signed in as</p>
                  <p className="mt-1 truncate text-sm font-bold text-forest">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs text-ink-faint">{user.email}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href="/dashboard"
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-forest/15 bg-white/70 px-3 text-sm font-semibold text-forest"
                    >
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-forest/15 bg-white/70 px-3 text-sm font-semibold text-forest"
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      Settings
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={signOut}
                    className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-terracotta-deep transition-colors hover:bg-terracotta/10"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </button>
                </div>
              ) : authReady ? (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <ButtonLink href="/login" variant="secondary" className="w-full">
                    Sign in
                  </ButtonLink>
                  <ButtonLink href="/signup" variant="secondary" className="w-full">
                    Join free
                  </ButtonLink>
                </div>
              ) : null}

              <Link
                href="/how-it-works"
                className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-ink-soft"
              >
                How {site.name} works
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
