import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageBackground from "@/components/PageBackground";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions — 10% Off Food Coupon | Urban Haat",
  description:
    "Official terms and conditions for the Urban Hut / Urban Haat 10% Off Food Coupon valid at Urban Punjab and The Eden Cafe.",
};

interface TermItem {
  number: string;
  title: string;
  description: string;
  highlight?: string;
  icon: React.ReactNode;
}

const TERMS: TermItem[] = [
  {
    number: "01",
    title: "Applicable Outlets",
    description:
      "The 10% discount is valid exclusively on food orders placed at Urban Punjab and The Eden Cafe. It does not apply to other vendors, stalls, or services outside these designated outlets.",
    highlight: "Valid at Urban Punjab & The Eden Cafe",
    icon: (
      <svg className="size-5 sm:size-6 text-[#BF7B25]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Validity Period",
    description:
      "The coupon is valid for exactly 7 days starting from the date of issuance. Upon completion of this 7-day period, the coupon will automatically expire and cannot be re-activated or extended.",
    highlight: "Valid for 7 days from issue",
    icon: (
      <svg className="size-5 sm:size-6 text-[#BF7B25]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Single Use Only",
    description:
      "Each coupon is strictly limited to a single redemption. Once the QR code or Ticket ID has been scanned and verified during billing, it cannot be used again.",
    highlight: "One-time redemption",
    icon: (
      <svg className="size-5 sm:size-6 text-[#BF7B25]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Non-Transferable",
    description:
      "The coupon is personalized and issued solely to the individual who booked or registered for it. It is strictly non-transferable, cannot be shared, forwarded, or resold to another party.",
    highlight: "Personal & non-resellable",
    icon: (
      <svg className="size-5 sm:size-6 text-[#BF7B25]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Food Items Only",
    description:
      "The 10% discount applies exclusively to food purchases. Beverages (if applicable), bottled drinks, tobacco, merchandise, and non-food purchases are excluded unless explicitly approved by Urban Hut management.",
    highlight: "Beverages & non-food excluded",
    icon: (
      <svg className="size-5 sm:size-6 text-[#BF7B25]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    number: "06",
    title: "No Cash Alternative",
    description:
      "The coupon holds no independent monetary cash value. It cannot be exchanged, converted, or refunded for cash, store credits, or any cash equivalents.",
    highlight: "No cash redemption",
    icon: (
      <svg className="size-5 sm:size-6 text-[#BF7B25]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    number: "07",
    title: "No Stacking or Combining",
    description:
      "This discount cannot be used in conjunction with any other promotional vouchers, festive offers, combo deals, membership privileges, or discounts running concurrently at the outlet.",
    highlight: "Cannot combine with other offers",
    icon: (
      <svg className="size-5 sm:size-6 text-[#BF7B25]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    number: "08",
    title: "Redemption at Billing",
    description:
      "The digital coupon must be presented and shown to the outlet staff before or at the time of order billing. Discounts cannot be applied retrospectively after the invoice has been generated or the payment transaction is completed.",
    highlight: "Present prior to bill generation",
    icon: (
      <svg className="size-5 sm:size-6 text-[#BF7B25]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    number: "09",
    title: "Subject to Staff Verification",
    description:
      "The coupon must be validated and authenticated through the digital verification system by outlet staff prior to applying the discount to your order.",
    highlight: "Verification required",
    icon: (
      <svg className="size-5 sm:size-6 text-[#BF7B25]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    number: "10",
    title: "Management Rights",
    description:
      "Urban Hut reserves the right to decline or reject any invalid, expired, duplicate, altered, or fraudulently obtained coupons. Furthermore, management reserves the right to amend, modify, or withdraw this offer in whole or in part when deemed necessary.",
    highlight: "Right of admission reserved",
    icon: (
      <svg className="size-5 sm:size-6 text-[#BF7B25]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="relative min-h-screen">
      <PageBackground />

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#BF7B25]/20 bg-[#FAF5EC]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/logo.webp"
              alt="Urban Haat"
              width={140}
              height={70}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white/80 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-900"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>

            <Link
              href="/#tickets"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#BF7B25] to-[#E0983A] px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:brightness-105"
            >
              <span>Get Free Pass</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Header Hero */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BF7B25]/30 bg-[#BF7B25]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#9A5F18]">
            Urban Hut · Official Policy
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl md:text-5xl">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-lg font-bold text-[#BF7B25] sm:text-xl">
            10% OFF FOOD COUPON
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
            Please read these terms and conditions carefully before redeeming your coupon at participating food outlets.
          </p>
        </div>

        {/* Highlight Card: Participating Outlets & Validity */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#BF7B25]/30 bg-gradient-to-br from-[#2B1B10] via-[#1C120B] to-[#120B06] p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#BF7B25]/25 border border-[#BF7B25]/50 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                ⭐ Exclusive Dining Privilege
              </span>
              <h2 className="text-2xl font-black text-amber-100 sm:text-3xl">
                10% Off On Food Orders
              </h2>
              <p className="text-xs text-stone-300 sm:text-sm">
                Valid strictly at the following designated dining destinations:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-lg border border-[#BF7B25]/50 bg-[#BF7B25]/20 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#FED7AA]">
                  🍛 Urban Punjab
                </span>
                <span className="rounded-lg border border-[#BF7B25]/50 bg-[#BF7B25]/20 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#FED7AA]">
                  ☕ The Eden Cafe
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-white/5 p-4 text-center backdrop-blur-sm sm:min-w-[200px]">
              <span className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
                Coupon Validity
              </span>
              <span className="mt-1 block text-2xl font-black text-amber-300">
                7 Days
              </span>
              <span className="text-[11px] text-stone-300">
                From Date of Issuance
              </span>
            </div>
          </div>
        </div>

        {/* Terms List */}
        <div className="mt-8 space-y-4">
          {TERMS.map((term) => (
            <article
              key={term.number}
              className="rounded-2xl border border-[#BF7B25]/20 bg-white/85 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-[#BF7B25]/40 hover:shadow-md sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#BF7B25]/10 text-[#BF7B25] sm:size-11">
                  {term.icon}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#BF7B25]">
                        #{term.number}
                      </span>
                      <h3 className="text-base font-bold text-stone-900 sm:text-lg">
                        {term.title}
                      </h3>
                    </div>

                    {term.highlight && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                        {term.highlight}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    {term.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Quick Assistance Banner */}
        <div className="mt-10 rounded-2xl border border-[#BF7B25]/30 bg-gradient-to-br from-[#2B1B10] to-[#170E08] p-6 text-center text-white shadow-lg sm:p-8">
          <span className="inline-block text-2xl sm:text-3xl">🎪</span>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl text-amber-200">
            Enjoy Your Experience at Urban Haat!
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-stone-300">
            Have any questions regarding food coupon redemption or your booking? Reach out to our team anytime.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#tickets"
              className="rounded-xl bg-gradient-to-r from-[#BF7B25] to-[#E0983A] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
            >
              Claim Your Free Pass
            </Link>
            <a
              href="https://wa.me/919236553585?text=Hi%20Urban%20Haat%2C%20I%20have%20a%20question%20about%20the%2010%25%20Food%20Coupon."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-600 bg-white/10 px-4 py-2.5 text-sm font-semibold text-stone-200 backdrop-blur transition hover:bg-white/20 hover:text-white"
            >
              <span>Chat with Support on WhatsApp</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
