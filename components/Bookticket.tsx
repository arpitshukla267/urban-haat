"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createTicket, verifyTicket } from "@/app/actions";
import Image from "next/image";

const INTERESTS = [
  " THE FUN FACTORY",
  " URBAN FOOD COURT",
  " HANDCRAFT MEET",
  " JHANSI HERITAGE",
  " GO KARTING",
  " URBAN PUNJAB",
  " ABOVE ALL"
];

type Ticket = { id: string; name: string; interest: string; url: string; issuedAt?: number };
type Errors = Partial<Record<"name" | "phone" | "interest" | "form", string>>;
type VerifyState =
  | { status: "loading" }
  | { status: "invalid" }
  | { status: "error" }
  | { status: "valid"; id: string; name: string; interest: string; phoneLast4: string; issuedAt: number };

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
        e.key === "ArrowDown" ? Math.min(i + 1, INTERESTS.length - 1) : Math.max(i - 1, 0)
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
        <span className={value ? "" : "text-stone-400"}>{value || "Select a field of interest"}</span>
        <svg
          viewBox="0 0 20 20"
          className={`size-5 flex-none text-stone-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  <svg viewBox="0 0 20 20" className="size-5 text-[#BF7B25]" aria-hidden="true">
                    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
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

/* ---------- Ticket ---------- */
function VerifiedBadge({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M9.37 2.45c.87-.6 2.01-.6 2.88 0l1.03.71c.38.26.84.38 1.3.33l1.24-.13c1.05-.11 2.01.44 2.42 1.41l.48 1.15c.18.42.5.76.91.95l1.13.51c.96.44 1.48 1.43 1.32 2.48l-.18 1.23c-.07.46.03.92.27 1.32l.68 1.05c.57.89.5 2.04-.18 2.85l-.81.95c-.3.35-.45.8-.43 1.26l.06 1.25c.05 1.06-.57 2.02-1.57 2.38l-1.18.42c-.44.15-.8.45-1.01.86l-.58 1.11c-.49.93-1.5 1.47-2.54 1.34l-1.23-.15c-.46-.06-.92.05-1.32.3l-1.07.65c-.91.55-2.07.45-2.88-.25l-.96-.82c-.36-.3-.82-.46-1.28-.44l-1.25.04c-1.06.03-2.01-.6-2.35-1.6l-.41-1.18c-.15-.44-.45-.8-.86-1.02l-1.1-.59c-.93-.5-1.46-1.51-1.32-2.56l.16-1.24c.06-.46-.05-.92-.3-1.32l-.66-1.06c-.56-.9-.47-2.06.22-2.86l.82-.95c.3-.35.45-.81.42-1.27l-.06-1.24c-.05-1.06.58-2.02 1.58-2.37l1.18-.42c.44-.16.8-.46 1.01-.87l.58-1.1c.49-.94 1.5-1.48 2.54-1.35l1.23.16c.46.05.92-.06 1.32-.31l1.07-.65z"
        fill="#00B06F"
      />
      <path
        d="M8.5 12.3l2.4 2.4 4.8-4.8"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SawtoothEdge({ className = "w-full h-4 fill-white" }: { className?: string }) {
  return (
    <div className="relative w-full overflow-hidden leading-none -mt-[1px]">
      <svg viewBox="0 0 500 16" preserveAspectRatio="none" className={className}>
        <polygon points="0,0 10,16 20,0 30,16 40,0 50,16 60,0 70,16 80,0 90,16 100,0 110,16 120,0 130,16 140,0 150,16 160,0 170,16 180,0 190,16 200,0 210,16 220,0 230,16 240,0 250,16 260,0 270,16 280,0 290,16 300,0 310,16 320,0 330,16 340,0 350,16 360,0 370,16 380,0 390,16 400,0 410,16 420,0 430,16 440,0 450,16 460,0 470,16 480,0 490,16 500,0" />
      </svg>
    </div>
  );
}

function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.84 9.84 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  );
}

function ReceiptView({ ticket, isPrint = false }: { ticket: Ticket; isPrint?: boolean }) {
  const formattedDateTime = ticket.issuedAt
    ? new Date(ticket.issuedAt).toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "";

  return (
    <div
      className={`mx-auto flex flex-col items-center justify-center bg-black text-stone-900 ${
        isPrint ? "w-[794px] min-h-[1123px] py-14 px-8" : "w-full rounded-3xl p-5 shadow-2xl"
      }`}
    >
      {/* Brand Logo at top */}
      <div className="mb-6 flex justify-center">
        <Image
          src="/logo.webp"
          alt="Urban Haat"
          width={260}
          height={130}
          className="h-auto w-56 object-contain drop-shadow"
          priority
        />
      </div>

      {/* Main Receipt Container */}
      <div className="w-full max-w-[430px] overflow-hidden drop-shadow-2xl">
        {/* Upper Card - Candidate Info (colored section) */}
        <div className="relative rounded-t-3xl bg-[#FAF5EC] px-6 pt-6 pb-5 border-t border-x border-[#BF7B25]/30">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-extrabold text-stone-900 leading-tight">{ticket.name}</p>
              <p className="mt-1.5 text-sm font-semibold text-[#BF7B25]">{ticket.interest}</p>
              <p className="mt-1 text-xs text-stone-500 font-medium">Ticket ID: {ticket.id}</p>
              <p className="mt-0.5 text-xs text-stone-500">Admit One • Free Pass</p>
            </div>
            <div className="grid size-14 flex-none place-items-center rounded-full bg-[#BF7B25]/15 font-bold text-[#8F5512] text-xl shadow-sm">
              {ticket.name.trim().charAt(0).toUpperCase() || "U"}
            </div>
          </div>

          {/* Date/time */}
          <p className="mt-3 text-xs text-stone-500 text-right">{formattedDateTime}</p>

          {/* Accent bottom stripe */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#BF7B25]" />
        </div>

        {/* White section — QR only */}
        <div className="relative rounded-b-3xl bg-white px-6 py-6">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
              <QRCodeSVG value={ticket.url} size={isPrint ? 170 : 160} level="M" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer — Logos with links */}
      {/* <div className="mt-7 flex items-center justify-center gap-6">
        <a href="https://visitinglink.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/vl.png"
            alt="Visiting Link"
            width={160}
            height={80}
            className="h-12 w-auto object-contain transition hover:opacity-80"
          />
        </a>
        <a href="https://gunnomediaproductions.com" target="_blank" rel="noopener noreferrer">
          <Image
            src="/gunno.png"
            alt="Gunno Media Productions"
            width={160}
            height={80}
            className="h-12 w-auto object-contain transition hover:opacity-80"
          />
        </a>
      </div> */}
    </div>
  );
}

/* ---------- Full-page layout used only for the PDF (rendered off-screen) ---------- */
function PrintableTicket({ ticket }: { ticket: Ticket }) {
  return <ReceiptView ticket={ticket} isPrint={true} />;
}

function TicketCard({ ticket, onReset }: { ticket: Ticket; onReset: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  // Takes a sharp picture of the designed full-page layout and puts it on an A4 PDF.
  async function downloadPdf() {
    const node = printRef.current;
    if (!node) return;
    setDownloading(true);
    setPdfError("");
    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      const png = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: "#000000",
        cacheBust: true,
        skipFonts: false,
      });
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      pdf.addImage(png, "PNG", 0, 0, 210, 297);
      pdf.save(`Urban-Haat-Ticket-${ticket.id}.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
      setPdfError("Couldn't create the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm sm:max-w-md">
      {/* Off-screen A4 layout that becomes the PDF */}
      <div aria-hidden="true" className="pointer-events-none fixed top-0" style={{ left: -10000 }}>
        <div ref={printRef}>
          <PrintableTicket ticket={ticket} />
        </div>
      </div>

      <ReceiptView ticket={ticket} isPrint={false} />

      <button
        type="button"
        onClick={downloadPdf}
        disabled={downloading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#BF7B25] px-5 py-3.5 font-bold text-white shadow-lg transition hover:bg-[#A8681C] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#BF7B25]/30 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 20h16" />
        </svg>
        {downloading ? "Preparing PDF..." : "Download ticket (PDF)"}
      </button>

      {pdfError && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
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

/* ---------- Result shown when a ticket QR is scanned ---------- */
function VerifyCard({ state, onClose }: { state: VerifyState; onClose: () => void }) {
  const valid = state.status === "valid";
  const loading = state.status === "loading";

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[#BF7B25]/25 bg-white p-8 text-center shadow-[0_24px_60px_-24px_rgba(120,80,20,0.45)]">
      {loading ? (
        <p className="py-10 text-stone-600">Checking ticket...</p>
      ) : (
        <>
          <div
            className={`mx-auto grid size-16 place-items-center rounded-full text-3xl font-extrabold ${
              valid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {valid ? "✓" : "✕"}
          </div>
          <h3 className="mt-5 text-2xl font-extrabold tracking-tight">
            {valid ? "Genuine ticket" : state.status === "error" ? "Couldn't check" : "Invalid ticket"}
          </h3>
          <p className="mt-1 text-stone-600">
            {valid
              ? "This ticket was issued by Urban Haat."
              : state.status === "error"
              ? "Please check your connection and scan again."
              : "We couldn't find this ticket. It may be fake or edited. Please do not allow entry."}
          </p>

          {state.status === "valid" && (
            <dl className="mt-7 divide-y divide-stone-200 rounded-xl border border-stone-200 text-left">
              {[
                ["Name", state.name],
                ["Interest", state.interest],
                ["Phone", `•••• ${state.phoneLast4}`],
                ["Ticket ID", state.id],
                [
                  "Issued",
                  new Date(state.issuedAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Kolkata",
                  }),
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-sm text-stone-500">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
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
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t");
    if (!t) return;
    setVerify({ status: "loading" });
    verifyTicket(t)
      .then((r) => setVerify(r.valid ? { status: "valid", ...r } : { status: "invalid" }))
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
    if (digits.length < 10 || digits.length > 13) e.phone = "Please enter a valid phone number.";
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
        const base = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
        setTicket({ id: res.id, name: res.name, interest: res.interest, url: `${base}/?t=${res.id}#tickets`, issuedAt: Date.now() });
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
    <section id="tickets" className="bg-transparent px-4 py-16 sm:px-8 sm:py-24">
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
          {verify ? (
            <div key="verify">
              <VerifyCard state={verify} onClose={closeVerify} />
            </div>
          ) : !ticket ? (
            <form
              key="form"
              onSubmit={onSubmit}
              noValidate
              className="space-y-5 rounded-2xl border border-[#BF7B25]/25 bg-[#BF7B25]/10 p-5 sm:p-8"
            >
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
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
                {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold">
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
                {errors.phone && <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="interest" className="mb-1.5 block text-sm font-semibold">
                  Field of interest
                </label>
                <InterestSelect value={interest} onChange={setInterest} invalid={!!errors.interest} />
                {errors.interest && <p className="mt-1.5 text-sm text-red-600">{errors.interest}</p>}
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-semibold">
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
                <p className="mt-1 text-right text-xs text-stone-500">{description.length}/300</p>
              </div>

              {errors.form && (
                <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
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
    </section>
  );
}