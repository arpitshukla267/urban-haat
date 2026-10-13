"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createTicket, verifyTicket } from "@/app/actions";

const INTERESTS = [
  " THE FUN FACTORY",
  " URBAN FOOD COURT",
  " HANDCRAFT MEET",
  " JHANSI HERITAGE",
  " GO KARTING",
  " URBAN PUNJAB",
  " ABOVE ALL",
];

type Ticket = {
  id: string;
  name: string;
  phone: string;
  interest: string;
  url: string;
  issuedAt?: number;
};
type Errors = Partial<Record<"name" | "phone" | "interest" | "form", string>>;
// applied  = first scan, coupon just got used
// used     = this coupon was already used before
type VerifyState =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "error" }
  | { status: "applied" }
  | { status: "used" };

const inputBase =
  "w-full rounded-lg border bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-[#BF7B25] focus:ring-4 focus:ring-[#BF7B25]/15";

/* ---------- Custom animated dropdown ---------- */
function InterestSelect({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function select(i: number) {
    onChange(INTERESTS[i]);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setActive(Math.max(0, INTERESTS.indexOf(value)));
        return setOpen(true);
      }
      setActive((i) =>
        e.key === "ArrowDown"
          ? Math.min(i + 1, INTERESTS.length - 1)
          : Math.max(i - 1, 0),
      );
    }
    if ((e.key === "Enter" || e.key === " ") && open) {
      e.preventDefault();
      select(active);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        id="interest"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="interest-list"
        aria-invalid={invalid}
        onClick={() => {
          setActive(Math.max(0, INTERESTS.indexOf(value)));
          setOpen((o) => !o);
        }}
        onKeyDown={onKeyDown}
        className={`${inputBase} flex items-center justify-between text-left ${
          invalid ? "border-red-400" : "border-stone-300"
        }`}
      >
        <span className={value ? "" : "text-stone-400"}>
          {value || "Select a field of interest"}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`size-5 flex-none text-stone-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M5 8l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          id="interest-list"
          role="listbox"
          style={{ transformOrigin: "top" }}
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-[#BF7B25]/25 bg-white p-1.5 shadow-[0_20px_40px_-16px_rgba(120,80,20,0.4)] transition-all duration-200"
        >
          {INTERESTS.map((item, i) => {
            const selected = item === value;
            return (
              <li
                key={item}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => select(i)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-[0.95rem] transition-colors ${
                  active === i ? "bg-[#BF7B25]/10" : ""
                } ${selected ? "font-semibold text-stone-900" : "text-stone-700"}`}
              >
                {item}
                {selected && (
                  <svg
                    viewBox="0 0 20 20"
                    className="size-5 text-[#BF7B25]"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10.5l4 4 8-9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- Coupon (background image + overlaid details) ---------- */
function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.84 9.84 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  );
}

const CW = 1148;
const CH = 1370;
const COUPON_BG = "/ticket.webp"; 

const fieldText: React.CSSProperties = {
  position: "absolute",
  left: 230,
  width: 498,
  height: 92,
  display: "flex",
  alignItems: "flex-end",
  paddingBottom: 30,
  color: "#4A2410",
  fontWeight: 700,
  fontSize: 36,
  lineHeight: 1.15,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

function CouponCanvas({ ticket }: { ticket: Ticket }) {
  return (
    <div
      style={{
        position: "relative",
        width: CW,
        height: CH,
        background: "#F7EFE3",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={COUPON_BG}
        alt=""
        width={CW}
        height={CH}
        style={{ position: "absolute", inset: 0, width: CW, height: CH }}
      />

      {/* 1. Name */}
      <div style={{ ...fieldText, top: 846 }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {ticket.name}
        </span>
      </div>

      {/* 2. Phone number */}
      <div style={{ ...fieldText, top: 948 }}>
        <span>{ticket.phone}</span>
      </div>

      {/* 3. Field of interest */}
      <div style={{ ...fieldText, top: 1050 }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
          {ticket.interest.trim()}
        </span>
      </div>

      {/* QR code (inside the dashed QR box) */}
      <div
        style={{
          position: "absolute",
          left: 839,
          top: 877,
          width: 176,
          height: 176,
          background: "#FFFFFF",
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
        }}
      >
        <QRCodeSVG value={ticket.url} size={160} level="M" />
      </div>

      {/* Ticket ID (small, at the very bottom) */}
      <p
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1318,
          textAlign: "center",
          fontSize: 22,
          color: "#8F5512",
          fontWeight: 600,
          letterSpacing: 1,
        }}
      >
        Ticket ID: {ticket.id}
      </p>
    </div>
  );
}

/* Shrinks the fixed-size coupon to fit whatever width the screen gives it */
function ScaledCoupon({ ticket }: { ticket: Ticket }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / CW);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="w-full overflow-hidden rounded-2xl shadow-2xl"
      style={{ height: CH * scale }}
    >
      <div
        style={{
          width: CW,
          height: CH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <CouponCanvas ticket={ticket} />
      </div>
    </div>
  );
}

function TicketCard({
  ticket,
  onReset,
}: {
  ticket: Ticket;
  onReset: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  // Takes a sharp picture of the full-size coupon and puts it on a PDF page of the same shape.
  async function downloadPdf() {
    const node = printRef.current;
    if (!node) return;
    setDownloading(true);
    setPdfError("");
    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);
      const png = await toPng(node, {
        pixelRatio: 2,
        width: CW,
        height: CH,
        cacheBust: true,
        skipFonts: false,
      });
      const pageW = 210;
      const pageH = (210 * CH) / CW;
      const pdf = new jsPDF({
        unit: "mm",
        format: [pageW, pageH],
        orientation: "portrait",
      });
      pdf.addImage(png, "PNG", 0, 0, pageW, pageH);
      pdf.save(`Urban-Haat-Coupon-${ticket.id}.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
      setPdfError("Couldn't create the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm sm:max-w-md">
      {/* Off-screen full-size coupon that becomes the PDF */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0"
        style={{ left: -10000 }}
      >
        <div ref={printRef} style={{ width: CW, height: CH }}>
          <CouponCanvas ticket={ticket} />
        </div>
      </div>

      <ScaledCoupon ticket={ticket} />

      <button
        type="button"
        onClick={downloadPdf}
        disabled={downloading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#BF7B25] px-5 py-3.5 font-bold text-white shadow-lg transition hover:bg-[#A8681C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#BF7B25]/30 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 20h16" />
        </svg>
        {downloading ? "Preparing PDF..." : "Download coupon (PDF)"}
      </button>

      {pdfError && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {pdfError}
        </p>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-3 w-full rounded-xl border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#BF7B25]/25"
      >
        Book another ticket
      </button>

      <a
        href="https://wa.me/919236553585?text=Hi%20Urban%20Haat%2C%20I%20need%20some%20help."
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25"
      >
        <WhatsAppIcon className="size-5 text-[#25D366]" />
        Helpline number
      </a>
    </div>
  );
}

/* ---------- Popup shown when a ticket QR is scanned ---------- */
function VerifyCard({
  state,
  onClose,
}: {
  state: VerifyState;
  onClose: () => void;
}) {
  const applied = state.status === "applied";
  const used = state.status === "used";
  const loading = state.status === "loading";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <style>{`
        @keyframes uh-draw { to { stroke-dashoffset: 0; } }
        @keyframes uh-pop { 0% { transform: scale(.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes uh-fill { to { opacity: 1; } }
        .uh-modal { animation: uh-pop .3s ease-out both; }
        .uh-circle { stroke-dasharray: 1; stroke-dashoffset: 1; animation: uh-draw .8s ease-out .15s forwards; }
        .uh-tick { stroke-dasharray: 1; stroke-dashoffset: 1; animation: uh-draw .5s ease-out .9s forwards; }
        .uh-glow { opacity: 0; animation: uh-fill .5s ease-out .9s forwards; }
      `}</style>

      <div className="uh-modal w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]">
        {loading ? (
          <p className="py-10 text-stone-600">Checking coupon...</p>
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
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-emerald-700">
              Your coupon has been applied successfully
            </h3>
          </>
        ) : used ? (
          <>
            <div className="mx-auto grid size-24 place-items-center rounded-full bg-red-100 text-5xl font-extrabold text-red-600">
              !
            </div>
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-red-700">
              This coupon has already been used
            </h3>
          </>
        ) : (
          <>
            <div className="mx-auto grid size-24 place-items-center rounded-full bg-red-100 text-5xl font-extrabold text-red-600">
              ✕
            </div>
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight">
              {state.status === "error" ? "Couldn't check" : "Invalid coupon"}
            </h3>
            <p className="mt-1 text-stone-600">
              {state.status === "error"
                ? "Please check your connection and scan again."
                : "We couldn't find this coupon. It may be fake or edited."}
            </p>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full rounded-lg border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#BF7B25]/25"
        >
          Book a ticket
        </button>
      </div>
    </div>
  );
}

/* ---------- Section ---------- */
export default function BookTicket() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [verify, setVerify] = useState<VerifyState | null>(null);

  // If the page was opened by scanning a ticket QR (?t=UH-...), verify it.
  // The ref makes sure the scan is counted only once (React dev mode runs effects twice).
  const scanned = useRef(false);
  useEffect(() => {
    if (scanned.current) return;
    const t = new URLSearchParams(window.location.search).get("t");
    if (!t) return;
    scanned.current = true;
    setVerify({ status: "loading" });
    verifyTicket(t)
      .then((r) =>
        setVerify(
          !r.valid
            ? { status: "invalid" }
            : r.alreadyUsed
              ? { status: "used" }
              : { status: "applied" },
        ),
      )
      .catch(() => setVerify({ status: "error" }));
  }, []);

  function closeVerify() {
    window.history.replaceState(null, "", "/#tickets");
    setVerify(null);
  }

  function validate(): Errors {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "Please enter your full name.";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13)
      e.phone = "Please enter a valid phone number.";
    if (!interest) e.interest = "Please choose a field of interest.";
    return e;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const res = await createTicket({ name, phone, interest, description });
      if (!res.ok) {
        setErrors({ form: res.error });
      } else {
        const base = (
          process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
        ).replace(/\/$/, "");
        setTicket({
          id: res.id,
          name: res.name,
          phone: phone.trim(),
          interest: res.interest,
          url: `${base}/?t=${res.id}#tickets`,
          issuedAt: Date.now(),
        });
      }
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setTicket(null);
    setName("");
    setPhone("");
    setInterest("");
    setDescription("");
    setErrors({});
  }

  return (
    <section
      id="tickets"
      className="bg-transparent px-4 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-[1100px]">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-[clamp(1.9rem,5vw,3rem)] font-extrabold leading-tight tracking-tight">
            Book your free tickets
          </h2>
          <p className="mt-3 text-base leading-relaxed text-stone-600 sm:text-lg">
            Tell us a little about yourself and get your entry ticket instantly.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl sm:mt-12">
          {!ticket ? (
            <form
              key="form"
              onSubmit={onSubmit}
              noValidate
              className="space-y-5 rounded-2xl border border-[#BF7B25]/25 bg-[#BF7B25]/10 p-5 sm:p-8"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-semibold"
                >
                  Full name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Your Name"
                  aria-invalid={!!errors.name}
                  className={`${inputBase} ${errors.name ? "border-red-400" : "border-stone-300"}`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-semibold"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="Your Phone Number"
                  aria-invalid={!!errors.phone}
                  className={`${inputBase} ${errors.phone ? "border-red-400" : "border-stone-300"}`}
                />
                {errors.phone && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="interest"
                  className="mb-1.5 block text-sm font-semibold"
                >
                  Field of interest
                </label>
                <InterestSelect
                  value={interest}
                  onChange={setInterest}
                  invalid={!!errors.interest}
                />
                {errors.interest && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {errors.interest}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-semibold"
                >
                  Anything you&apos;d like us to know?{" "}
                  <span className="font-normal text-stone-500">(optional)</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  maxLength={300}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you hoping to see or buy?"
                  className={`${inputBase} resize-none border-stone-300`}
                />
                <p className="mt-1 text-right text-xs text-stone-500">
                  {description.length}/300
                </p>
              </div>

              {errors.form && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errors.form}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#BF7B25] px-5 py-3.5 text-base font-bold text-white transition hover:bg-[#A8681C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#BF7B25]/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Generating your ticket..." : "Get your free ticket"}
              </button>
            </form>
          ) : (
            <div key="ticket">
              <TicketCard ticket={ticket} onReset={reset} />
            </div>
          )}
        </div>
      </div>

      {verify && <VerifyCard state={verify} onClose={closeVerify} />}
    </section>
  );
}
