"use client";

import {
  memo,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { MouseEvent } from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

interface CountdownTimerProps {
  /** Target date (ISO string or Date). Defaults to October 30, 2026 at 10:00 AM IST */
  targetDate?: string | Date;
  /** Optional title override */
  title?: string;
  /** Optional subtitle override */
  subtitle?: string;
}

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

// Default target: October 30, 2026 10:00:00 IST (+05:30)
const DEFAULT_TARGET = "2026-10-30T10:00:00+05:30";

const EMPTY_TIME_LEFT: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isExpired: false,
};

const EXPIRED_TIME_LEFT: TimeLeft = { ...EMPTY_TIME_LEFT, isExpired: true };

const MS_SECOND = 1000;
const MS_MINUTE = 60 * MS_SECOND;
const MS_HOUR = 60 * MS_MINUTE;
const MS_DAY = 24 * MS_HOUR;

/* ---------- External clock store (1s tick, no effect/setState cascades) ---------- */

function subscribe(callback: () => void) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}

const getClientSnapshot = () => Math.floor(Date.now() / 1000);
const getServerSnapshot = () => 0;

/* ---------- Helpers ---------- */

function calculateTimeLeft(targetMs: number, currentMs: number): TimeLeft {
  const diff = targetMs - currentMs;
  if (Number.isNaN(diff) || diff <= 0) return EXPIRED_TIME_LEFT;

  return {
    days: Math.floor(diff / MS_DAY),
    hours: Math.floor((diff % MS_DAY) / MS_HOUR),
    minutes: Math.floor((diff % MS_HOUR) / MS_MINUTE),
    seconds: Math.floor((diff % MS_MINUTE) / MS_SECOND),
    isExpired: false,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/* ---------- Animations (rendered once per banner) ---------- */

function AnimationStyles() {
  return (
    <style>{`
      @keyframes uh-hourglass-flip {
        0%, 35%  { transform: rotate(0deg); }
        50%, 85% { transform: rotate(180deg); }
        100%     { transform: rotate(360deg); }
      }
      @keyframes uh-roll-out {
        from { transform: translateY(0);     opacity: 1; }
        to   { transform: translateY(-100%); opacity: 0; }
      }
      @keyframes uh-roll-in {
        from { transform: translateY(100%); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      .uh-hourglass { display: inline-block; animation: uh-hourglass-flip 3s ease-in-out infinite; }
      .uh-roll-out  { animation: uh-roll-out 450ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      .uh-roll-in   { animation: uh-roll-in 450ms cubic-bezier(0.22, 1, 0.36, 1) both; }
      @media (prefers-reduced-motion: reduce) {
        .uh-hourglass { animation: none; }
        .uh-roll-out  { display: none; }
        .uh-roll-in   { animation: none; }
      }
    `}</style>
  );
}

/** Hourglass emoji that flips (rotates 180°) on a loop. */
function HourglassIcon() {
  return (
    <span className="uh-hourglass" aria-hidden="true">
      ⏳
    </span>
  );
}

/**
 * Single character that "rolls": the old digit slides up and out,
 * the new digit slides in from below. Only digits that actually change animate.
 */
const RollingChar = memo(function RollingChar({ char }: { char: string }) {
  const [state, setState] = useState({ curr: char, prev: char, tick: 0 });

  // Derive state during render (no effect needed)
  if (state.curr !== char) {
    setState({ curr: char, prev: state.curr, tick: state.tick + 1 });
  }

  const cell =
    "col-start-1 row-start-1 flex items-center justify-center py-[0.12em]";

  return (
    <span className="inline-grid overflow-hidden leading-none">
      {state.tick > 0 && (
        <span
          key={`out-${state.tick}`}
          className={`${cell} uh-roll-out`}
          aria-hidden="true"
        >
          {state.prev}
        </span>
      )}
      <span
        key={`in-${state.tick}`}
        className={`${cell} ${state.tick > 0 ? "uh-roll-in" : ""}`}
      >
        {state.curr}
      </span>
    </span>
  );
});

const DigitCard = memo(function DigitCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const chars = pad(value).split("");

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-10 w-8 items-center justify-center rounded-md border border-[#BF7B25]/40 bg-gradient-to-b from-[#2c1d12] via-[#1c130b] to-[#120b06] shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.15)] sm:h-12 sm:w-11 sm:rounded-lg md:h-16 md:w-15">
        {/* Top sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-md bg-white/[0.04] sm:rounded-t-lg" />
        {/* Center crease */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/60 shadow-[0_1px_0_rgba(255,255,255,0.08)]" />
        {/* Outer glow */}
        <div className="pointer-events-none absolute -inset-0.5 rounded-lg bg-[#BF7B25]/10 blur-sm" />

        {/* Countdown number weight: font-semibold */}
        <span
          className="relative z-10 flex text-sm font-medium tabular-nums text-[#FED7AA] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-xl md:text-3xl"
          suppressHydrationWarning
        >
          {chars.map((c, i) => (
            <RollingChar key={i} char={c} />
          ))}
        </span>
      </div>

      <span className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-[#E0983A] sm:text-[10px] sm:tracking-widest">
        {label}
      </span>
    </div>
  );
});

const ColonSeparator = memo(function ColonSeparator() {
  return (
    <div
      aria-hidden="true"
      className="flex h-10 flex-col items-center justify-center gap-1 self-start px-px sm:h-12 sm:gap-1.5 sm:px-0.5 md:h-16"
    >
      <span className="h-1 w-1 rounded-full bg-[#E0983A] sm:h-1.5 sm:w-1.5" />
      <span className="h-1 w-1 rounded-full bg-[#E0983A] sm:h-1.5 sm:w-1.5" />
    </div>
  );
});

const ChevronDown = ({ className = "size-4" }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

/* ---------- Main component ---------- */

export default function CountdownTimer({
  targetDate = DEFAULT_TARGET,
  title = "Grand Opening · 30th October 2026",
  subtitle = "Urban Haat Jhansi",
}: CountdownTimerProps) {
  const [minimized, setMinimized] = useState(false);

  const nowSec = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const mounted = nowSec > 0;

  const targetMs = useMemo(
    () =>
      (typeof targetDate === "string"
        ? new Date(targetDate)
        : targetDate
      ).getTime(),
    [targetDate],
  );

  const timeLeft = useMemo(
    () =>
      mounted ? calculateTimeLeft(targetMs, nowSec * 1000) : EMPTY_TIME_LEFT,
    [mounted, targetMs, nowSec],
  );

  // Mobile left column: "Grand Opening" + "30 Oct"
  const shortLabel = useMemo(
    () => title.split("·")[0].trim() || title,
    [title],
  );
  const shortDate = useMemo(
    () =>
      Number.isNaN(targetMs)
        ? ""
        : new Date(targetMs).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            timeZone: "Asia/Kolkata",
          }),
    [targetMs],
  );

  const scrollToTickets = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("tickets")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const expand = useCallback(() => setMinimized(false), []);
  const minimize = useCallback(() => setMinimized(true), []);

  /* SSR / pre-hydration placeholder — keeps layout stable */
  if (!mounted) {
    return (
      <div
        className={`${poppins.className} sticky top-0 z-40 w-full border-b border-[#BF7B25]/30 bg-[#160F0A]/95 text-stone-100 backdrop-blur-md`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs font-medium text-amber-200 sm:text-sm">
              {title}
            </span>
          </div>
          <span className="text-xs font-medium text-stone-400">
            Loading countdown…
          </span>
        </div>
      </div>
    );
  }

  /* Minimized banner */
  if (minimized) {
    return (
      <div
        role="timer"
        className={`${poppins.className} sticky top-0 z-40 w-full border-b border-[#BF7B25]/40 bg-[#140D07]/95 px-3 py-1.5 shadow-md backdrop-blur-md sm:px-4`}
      >
        <AnimationStyles />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 text-[11px] sm:text-xs">
          <p className="flex min-w-0 items-center gap-1.5 font-semibold text-[#F5C278]">
            {timeLeft.isExpired ? (
              <>
                <span aria-hidden="true">🎉</span>
                <span>Urban Haat is LIVE!</span>
              </>
            ) : (
              <>
                <HourglassIcon />
                <span className="tabular-nums">
                  Opening 30 Oct in {timeLeft.days}d {pad(timeLeft.hours)}h{" "}
                  {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
                </span>
              </>
            )}
          </p>

          <div className="flex shrink-0 items-center gap-1">
            <a
              href="#tickets"
              onClick={scrollToTickets}
              className="whitespace-nowrap font-semibold text-amber-300 underline decoration-amber-500/50 underline-offset-2 transition-colors hover:text-white"
            >
              Book Free Passes
            </a>
            <button
              type="button"
              onClick={expand}
              aria-label="Expand countdown timer"
              aria-expanded={false}
              title="Expand"
              className="rounded-md p-1 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronDown />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Full banner */
  return (
    <aside
      aria-label="Event Countdown"
      className={`${poppins.className} sticky top-0 z-40 w-full border-b border-[#BF7B25]/35 bg-gradient-to-r from-[#170F09]/95 via-[#23150B]/95 to-[#170F09]/95 text-stone-100 shadow-[0_4px_25px_rgba(0,0,0,0.45)] backdrop-blur-md`}
    >
      <AnimationStyles />

      {/* Gold accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#E0983A] to-transparent shadow-[0_0_8px_rgba(224,152,58,0.7)]" />

      <div className="mx-auto max-w-7xl px-3 pb-1 pt-2 sm:px-6 md:py-3">
        {/* 3 columns: [ opening date ] [ countdown ] [ book passes ] */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-4">
          {/* Column 1 */}
          <div className="min-w-0">
            {/* Mobile: compact label + date */}
            <div className="md:hidden">
              <p className="text-[9px] font-medium uppercase leading-tight tracking-wider text-[#E0983A] sm:text-[10px]">
                {shortLabel}
              </p>
              <p className="mt-0.5 text-base font-medium leading-tight text-white sm:text-lg">
                {shortDate}
              </p>
            </div>

            {/* Desktop: icon + title + subtitle */}
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#BF7B25]/40 bg-[#BF7B25]/15 text-[#E0983A] shadow-inner">
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-medium tracking-tight text-white">
                  {title}
                </h2>
                <p className="mt-0.5 text-xs font-medium text-stone-300/90">
                  {timeLeft.isExpired
                    ? "The gates are open! Come enjoy crafts, food & stories."
                    : `${subtitle} · Gates Open 10:00 AM IST`}
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: countdown */}
          {timeLeft.isExpired ? (
            <div className="rounded-xl border border-amber-500/50 bg-amber-500/20 px-3 py-1.5 text-center shadow-[0_0_15px_rgba(245,158,11,0.2)] sm:px-5 sm:py-2">
              <span className="text-[11px] font-semibold text-amber-200 sm:text-sm md:text-base">
                🎉 Urban Haat is happening TODAY!
              </span>
            </div>
          ) : (
            <div
              role="timer"
              className="flex items-center gap-1 -pl- sm:gap-1.5 md:gap-2"
            >
              <DigitCard value={timeLeft.days} label="Days" />
              <ColonSeparator />
              <DigitCard value={timeLeft.hours} label="Hours" />
              <ColonSeparator />
              <DigitCard value={timeLeft.minutes} label="Mins" />
              <ColonSeparator />
              <DigitCard value={timeLeft.seconds} label="Secs" />
            </div>
          )}

          {/* Column 3: CTA (+ close button on desktop) */}
          <div className="flex items-center justify-end gap-2">
            <a
              href="#tickets"
              onClick={scrollToTickets}
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#BF7B25] to-[#E0983A] px-2 py-1.5 text-center text-[10px] font-semibold leading-tight text-white shadow-[0_2px_15px_rgba(191,123,37,0.4)] transition-all duration-200 hover:from-[#A6671A] hover:to-[#C67F24] hover:shadow-[0_4px_20px_rgba(191,123,37,0.6)] active:scale-[0.98] sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs md:px-5 md:py-2.5 md:text-sm md:hover:scale-[1.03]"
            >
              <svg
                className="hidden size-4 transition-transform duration-200 group-hover:-rotate-12 sm:block"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4 4h16a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V6a2 2 0 0 1 2-2zm2 2v2.5a3.5 3.5 0 0 1 0 7V18h12v-2.5a3.5 3.5 0 0 1 0-7V6H6zm4 3h4v2h-4V9zm0 4h4v2h-4v-2z" />
              </svg>
              <span>Book Free Passes</span>
              <svg
                className="hidden size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 md:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>

            <button
              type="button"
              onClick={minimize}
              aria-label="Minimize countdown timer"
              aria-expanded
              title="Minimize"
              className="hidden rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-white/10 hover:text-stone-200 md:block"
            >
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile: centered up arrow below all three columns */}
        <button
          type="button"
          onClick={minimize}
          aria-label="Minimize countdown timer"
          aria-expanded
          title="Minimize"
          className="mx-auto mt-0.5 flex rounded-full p-0.5 text-stone-400 transition-colors hover:bg-white/10 hover:text-stone-200 md:hidden"
        >
          <ChevronDown className="size-4 rotate-180" />
        </button>
      </div>
    </aside>
  );
}
