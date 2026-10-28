"use client";
import Image from "next/image";
import Link from "next/link";

const INSTAGRAM_URL = "https://www.instagram.com/urbanhaat_jhansi/"; 
const WHATSAPP_NUMBER = "919236553585"; 
const DISPLAY_NUMBER = "+91 92365 53585";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Urban Haat, I need some help."
)}`;

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.84 9.84 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-transparent text-gray-800">
      <div className="mx-auto flex max-w-[90vw] flex-col gap-10 px-4 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
        {/* Brand */}
        <div className="max-w-xs">
          <Image
            src="/logo.webp"
            alt="Urban Haat"
            width={260}
            height={120}
            className="h-16 w-auto object-contain"
          />
          <p className="mt-4 text-base leading-relaxed text-gray-800">
            Your neighbourhood market, now a tap away. Craft, food and stories from the people who make them.
          </p>
        </div>

        {/* Links row for mobile / separate columns on desktop */}
        <div className="flex flex-row flex-wrap items-start justify-between gap-8 sm:gap-12 md:contents">
          {/* Quick link */}
          <div>
            <p className="text-lg font-bold text-gray-900">Follow us</p>
            <div className="mt-3 flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Urban Haat on Instagram"
                className="grid size-11 place-items-center rounded-full border border-gray-800 hover:border-none transition text-gray-900 hover:bg-[#9A5F18] hover:text-[#ffffff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9A5F18]/50"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Legal / Policy */}
          <div>
            <p className="text-lg font-bold text-gray-900">Quick Links</p>
            <div className="mt-3">
              <Link
                href="/terms"
                className="inline-block text-sm font-semibold text-stone-700 hover:text-[#9A5F18] transition hover:underline"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>

          {/* Contact + social */}
          <div>
            <p className="text-lg font-bold text-gray-800">Need help?</p>
            <div className="mt-3 flex items-center">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chat with us on WhatsApp at ${DISPLAY_NUMBER}`}
                className="grid size-11 place-items-center rounded-full bg-white text-[#128C7E] shadow-sm transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9A5F18]/50"
              >
                <WhatsAppIcon className="size-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#9A5F18] pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-[#ffffff] sm:flex-row sm:px-8">
          <p>© 2026 Urban Haat. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-amber-100 hover:text-white transition hover:underline"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}