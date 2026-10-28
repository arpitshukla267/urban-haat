"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   ADD YOUR IMAGES HERE
   1. Put the image files in the /public/banners folder
   2. List them below, e.g. { src: "/banners/1.webp", alt: "Handloom stall" }
   While the list is empty, tinted placeholder tiles are shown.
------------------------------------------------------------------- */
const IMAGES: { src: string; alt: string }[] = [
  { src: "/banners/1.webp", alt: "Handloom stall" },
  { src: "/banners/2.webp", alt: "Street food counter" },
  { src: "/banners/3.webp", alt: "Handmade pottery" },
  { src: "/banners/4.webp", alt: "Handloom stall" },
  // { src: "/banners/5.webp", alt: "Street food counter" },
  { src: "/banners/6.png", alt: "Handmade pottery" },
];

const PLACEHOLDERS = 8;

type Item = { src?: string; alt: string };

function Arrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? "Previous image" : "Next image"}
      className={`absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-[#BF7B25]/30 bg-white/90 text-[#8a5614] shadow-md backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BF7B25] disabled:pointer-events-none disabled:opacity-0 sm:size-11 ${
        isPrev ? "left-1 sm:left-4" : "right-1 sm:right-4"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={isPrev ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  );
}

export default function Imagebanners() {
  const items: Item[] = IMAGES.length
    ? IMAGES
    : Array.from({ length: PLACEHOLDERS }, (_, i) => ({
        alt: `Placeholder ${i + 1}`,
      }));

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateEdges]);

  const scrollByItem = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("[data-slide]");
    if (!first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (first.offsetWidth + gap), behavior: "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") scrollByItem(1);
    if (e.key === "ArrowLeft") scrollByItem(-1);
  };

  return (
    <section
      aria-label="Photo gallery"
      className="relative w-full py-10 sm:py-14 mb-12"
    >
      <style>{`
        .uh-scroller {
          --slide-w: 80vw; /* <- change this to resize the center image on mobile */
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-inline: calc((100% - var(--slide-w)) / 2);
        }
        .uh-scroller::-webkit-scrollbar { display: none; }
        .uh-slide {
          flex: none;
          width: var(--slide-w);
          scroll-snap-align: center;
          scroll-snap-stop: always;
        }
        @media (min-width: 640px) {
          .uh-scroller {
            gap: 1.5rem;
            padding-inline: 1.5rem;
            scroll-padding-inline: 1.5rem;
          }
          .uh-slide { width: 20rem; scroll-snap-align: start; scroll-snap-stop: normal; }
        }
        @media (min-width: 1024px) {
          .uh-scroller { padding-inline: 2rem; scroll-padding-inline: 2rem; }
          .uh-slide { width: 20rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .uh-scroller { scroll-behavior: auto; }
        }
      `}</style>

      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={updateEdges}
          onKeyDown={onKeyDown}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Photo gallery slides"
          className="uh-scroller focus-visible:outline-none"
        >
          {items.map((item, i) => (
            <div
              key={i}
              data-slide
              className="uh-slide relative aspect-[4/6] overflow-hidden rounded-xl border border-[#BF7B25]/20 bg-[#BF7B25]/10 shadow-[0_16px_36px_-20px_rgba(120,80,20,0.5)]"
            >
              {item.src ? (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width:1024px) 320px, (min-width:640px) 288px, 77vw"
                  className="object-cover"
                  draggable={false}
                />
              ) : (
                <div className="grid size-full place-items-center text-[#BF7B25]/60">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="9" cy="10" r="1.8" />
                    <path d="M21 16l-5-5-8 8" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <Arrow
          direction="prev"
          onClick={() => scrollByItem(-1)}
          disabled={!canPrev}
        />
        <Arrow
          direction="next"
          onClick={() => scrollByItem(1)}
          disabled={!canNext}
        />
      </div>
    </section>
  );
}
