"use client";

import Image from "next/image";

/* ------------------------------------------------------------------
   ADD YOUR IMAGES HERE
   1. Put the image files in the /public/carousel folder
   2. List them below, e.g. { src: "/carousel/1.jpg", alt: "Handloom stall" }
   While the list is empty, tinted placeholder tiles are shown.
------------------------------------------------------------------- */
const IMAGES: { src: string; alt: string }[] = [
  // { src: "/carousel/1.jpg", alt: "Handloom stall" },
  // { src: "/carousel/2.jpg", alt: "Street food counter" },
  // { src: "/carousel/3.jpg", alt: "Handmade pottery" },
];

const PLACEHOLDERS = 8;
const SECONDS = 60; // time for one full loop; increase to slow down

type Item = { src?: string; alt: string };

function Group({ items, hidden = false }: { items: Item[]; hidden?: boolean }) {
  return (
    <div className="flex flex-none" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <div
          key={i}
          className="relative mr-4 aspect-[4/5] w-56 flex-none overflow-hidden rounded-xl border border-[#BF7B25]/20 bg-[#BF7B25]/10 shadow-[0_16px_36px_-20px_rgba(120,80,20,0.5)] sm:mr-6 sm:w-72 lg:w-80"
        >
          {item.src ? (
            <Image
              src={item.src}
              alt={hidden ? "" : item.alt}
              fill
              sizes="(min-width:1024px) 320px, (min-width:640px) 288px, 224px"
              className="object-cover"
              draggable={false}
            />
          ) : (
            <div className="grid size-full place-items-center text-[#BF7B25]/60">
              <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="1.8" />
                <path d="M21 16l-5-5-8 8" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ImageCarousel() {
  const base: Item[] = IMAGES.length
    ? IMAGES
    : Array.from({ length: PLACEHOLDERS }, (_, i) => ({ alt: `Placeholder ${i + 1}` }));

  // Repeat the list so one group is always wider than the screen (no gaps, even with 2-3 images).
  const repeat = Math.max(1, Math.ceil(8 / base.length));
  const items = Array.from({ length: repeat }, () => base).flat();

  return (
    <section
      aria-label="Photo gallery"
      className="w-full overflow-hidden bg-transparent py-10 sm:py-14 mb-12 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
    >
      <style>{`
        @keyframes uh-gallery { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .uh-gallery-track { animation: uh-gallery ${SECONDS}s linear infinite; }
        .uh-gallery-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .uh-gallery-track { animation-duration: ${SECONDS * 3}s; } }
      `}</style>

      <div className="uh-gallery-track flex w-max">
        <Group items={items} />
        <Group items={items} hidden />
      </div>
    </section>
  );
}