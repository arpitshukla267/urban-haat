"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyTicket } from "@/app/actions";
import PageBackground from "@/components/PageBackground";

// applied = first scan, coupon just got used
// used    = this coupon was already used before
type State =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "error" }
  | { status: "applied" }
  | { status: "used" };

export default function VerifyPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });

  // The ref makes sure one scan is counted only once (React dev mode runs effects twice).
  const scanned = useRef(false);
  useEffect(() => {
    if (scanned.current) return;
    scanned.current = true;

    const t = new URLSearchParams(window.location.search).get("t");
    if (!t) {
      setState({ status: "invalid" });
      return;
    }
    verifyTicket(t)
      .then((r) =>
        setState(
          !r.valid
            ? { status: "invalid" }
            : r.alreadyUsed
              ? { status: "used" }
              : { status: "applied" },
        ),
      )
      .catch(() => setState({ status: "error" }));
  }, []);

  const applied = state.status === "applied";
  const used = state.status === "used";
  const loading = state.status === "loading";

  return (
    <main className="relative grid min-h-[100svh] place-items-center p-4">
      <PageBackground />

      <style>{`
        @keyframes uh-draw { to { stroke-dashoffset: 0; } }
        @keyframes uh-pop { 0% { transform: scale(.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes uh-fill { to { opacity: 1; } }
        .uh-modal { animation: uh-pop .3s ease-out both; }
        .uh-circle { stroke-dasharray: 1; stroke-dashoffset: 1; animation: uh-draw .8s ease-out .15s forwards; }
        .uh-tick { stroke-dasharray: 1; stroke-dashoffset: 1; animation: uh-draw .5s ease-out .9s forwards; }
        .uh-glow { opacity: 0; animation: uh-fill .5s ease-out .9s forwards; }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        className="uh-modal w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]"
      >
        {loading ? (
          <div className="py-8">
            <div className="mx-auto size-14 animate-spin rounded-full border-4 border-[#BF7B25]/20 border-t-[#BF7B25]" />
            <p className="mt-5 font-semibold text-stone-700">
              Verifying your coupon...
            </p>
          </div>
        ) : applied ? (
          <>
            <svg
              viewBox="0 0 120 120"
              className="mx-auto size-32"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="uh-glow"
                cx="60"
                cy="60"
                r="52"
                fill="#16A34A"
                fillOpacity="0.12"
              />
              <circle
                className="uh-circle"
                cx="60"
                cy="60"
                r="52"
                stroke="#16A34A"
                strokeWidth="6"
                strokeLinecap="round"
                pathLength={1}
                transform="rotate(-90 60 60)"
              />
              <path
                className="uh-tick"
                d="M38 62 L54 78 L83 44"
                stroke="#16A34A"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
              />
            </svg>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-emerald-700">
              Your coupon has been applied successfully
            </h1>
          </>
        ) : used ? (
          <>
            <div className="mx-auto grid size-24 place-items-center rounded-full bg-red-100 text-5xl font-extrabold text-red-600">
              !
            </div>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-red-700">
              This coupon has already been used
            </h1>
          </>
        ) : (
          <>
            <div className="mx-auto grid size-24 place-items-center rounded-full bg-red-100 text-5xl font-extrabold text-red-600">
              ✕
            </div>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight">
              {state.status === "error" ? "Couldn't check" : "Invalid coupon"}
            </h1>
            <p className="mt-1 text-stone-600">
              {state.status === "error"
                ? "Please check your connection and scan again."
                : "We couldn't find this coupon. It may be fake or edited."}
            </p>
          </>
        )}

        {!loading && (
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="mt-7 w-full rounded-lg bg-[#BF7B25] px-5 py-3.5 text-base font-bold text-white transition hover:bg-[#A8681C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#BF7B25]/30"
          >
            Okay
          </button>
        )}
      </div>
    </main>
  );
}
