"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Caveat } from "next/font/google";

const script = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

type VideoItem = {
  src?: string;
  poster?: string;
  title?: string;
};

type HeroProps = {
  videoSrc?: string;
  poster?: string;
  /** Multiple videos for the slider. If given, it is used instead of videoSrc. */
  videos?: VideoItem[];
};

type Shape = "circle" | "square" | "triangle" | "hex" | "leaf" | "diamond";

// Brand accent: #BF7B25  (tint used for surfaces: #BF7B25 at 10% opacity)
const BRANDS: { name: string; shape: Shape }[] = [
  { name: "Kala Ghar", shape: "circle" },
  { name: "Chai Point", shape: "hex" },
  { name: "Khadi Co.", shape: "leaf" },
  { name: "Mithai Lane", shape: "diamond" },
  { name: "Jaipur Prints", shape: "square" },
  { name: "Dilli Dhaba", shape: "triangle" },
  { name: "Banaras Looms", shape: "hex" },
  { name: "Spice Route", shape: "leaf" },
  { name: "Terra Pots", shape: "circle" },
  { name: "Mela Mart", shape: "diamond" },
];

// Placeholders commented out for now
// const PLACEHOLDERS: VideoItem[] = [{}, {}, {}, {}, {}];
const PLACEHOLDERS: VideoItem[] = [];

function Mark({ shape }: { shape: Shape }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6 flex-none sm:size-7"
      fill="currentColor"
      aria-hidden="true"
    >
      {shape === "circle" && <circle cx="12" cy="12" r="10" />}
      {shape === "square" && <rect x="2" y="2" width="20" height="20" rx="4" />}
      {shape === "triangle" && <path d="M12 2l10.5 19h-21z" />}
      {shape === "hex" && <path d="M12 2l9 5v10l-9 5-9-5V7z" />}
      {shape === "leaf" && <path d="M3 21C3 10 10 3 21 3c0 11-6 18-18 18z" />}
      {shape === "diamond" && <path d="M12 1l11 11-11 11L1 12z" />}
    </svg>
  );
}

function LogoGroup({ hidden = false }: { hidden?: boolean }) {
  // Repeated twice per group so the track is always wider than the screen.
  const items = [...BRANDS, ...BRANDS];
  return (
    <div className="flex flex-none" aria-hidden={hidden || undefined}>
      {items.map((b, i) => (
        <div
          key={`${b.name}-${i}`}
          className="flex items-center gap-2.5 whitespace-nowrap px-8 text-base font-semibold tracking-tight text-stone-500 transition-colors hover:text-stone-900 sm:px-12 sm:text-xl"
        >
          <Mark shape={b.shape} />
          {b.name}
        </div>
      ))}
    </div>
  );
}

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 3l16 9-16 9z" />
    </svg>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dir === "left" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}

type SlideProps = {
  item: VideoItem;
  index: number;
  registerVideo: (index: number, el: HTMLVideoElement | null) => void;
  onPlayStart: (index: number) => void;
};

function VideoSlide({ item, index, registerVideo, onPlayStart }: SlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  // Register the <video> so the parent can pause it.
  useEffect(() => {
    registerVideo(index, videoRef.current);
    return () => registerVideo(index, null);
  }, [index, registerVideo]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      // Started from a click, so sound is allowed.
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  const label = item.title ?? `Video ${index + 1}`;

  return (
    // 1 video on mobile, 2 on tablet, 3 on desktop
    <div className="w-full flex-none snap-start sm:w-[calc((100%_-_1rem)/2)] lg:w-[calc((100%_-_2rem)/3)]">
      <div className="relative aspect-[14/16] w-full overflow-hidden rounded-xl border border-[#BF7B25]/25 bg-[#BF7B25]/10">
        {item.src ? (
          <>
            <video
              ref={videoRef}
              src={item.src}
              poster={item.poster}
              playsInline
              loop
              preload="metadata"
              aria-label={label}
              onLoadedData={() => setReady(true)}
              onPlay={() => {
                setPlaying(true);
                onPlayStart(index); // pause every other video
              }}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Whole surface is the click target */}
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? `Pause ${label}` : `Play ${label}`}
              className="group absolute inset-0 grid place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#BF7B25]"
            >
              <span
                className={`grid size-16 place-items-center rounded-full bg-[#BF7B25] shadow-md transition duration-200 group-hover:scale-105 ${
                  playing ? "scale-90 opacity-0" : "opacity-100"
                } ${!ready && !item.poster ? "animate-pulse" : ""}`}
              >
                <PlayIcon className="ml-1 size-6 fill-white" />
              </span>
            </button>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#BF7B25] shadow-md">
                <PlayIcon className="ml-1 size-6 fill-white" />
              </div>
              <p className="mt-4 text-sm text-stone-600">
                {label} goes here (14:16)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VideoSlider({ videos }: { videos: VideoItem[] }) {
  const items = videos.length ? videos : PLACEHOLDERS;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const videoEls = useRef<(HTMLVideoElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0); // first visible slide
  const [maxIndex, setMaxIndex] = useState(0); // last position we can scroll to

  const registerVideo = useCallback(
    (i: number, el: HTMLVideoElement | null) => {
      videoEls.current[i] = el;
    },
    [],
  );

  // Only one video plays at a time.
  const onPlayStart = useCallback((playingIndex: number) => {
    videoEls.current.forEach((v, i) => {
      if (i !== playingIndex) v?.pause();
    });
  }, []);

  const pauseAll = useCallback(() => {
    videoEls.current.forEach((v) => v?.pause());
  }, []);

  // Distance between two slides (width + gap).
  const getStep = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || el.children.length < 2) return el?.clientWidth ?? 0;
    const a = el.children[0] as HTMLElement;
    const b = el.children[1] as HTMLElement;
    return b.offsetLeft - a.offsetLeft;
  }, []);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    const step = getStep();
    if (!el || !step) return;
    const idx = Math.round(el.scrollLeft / step);
    const max = Math.max(
      0,
      Math.round((el.scrollWidth - el.clientWidth) / step),
    );
    activeRef.current = idx;
    setActive(idx);
    setMaxIndex(max);
  }, [getStep]);

  const goTo = useCallback(
    (i: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const next = Math.max(0, Math.min(maxIndex, i));
      el.scrollTo({ left: next * getStep(), behavior: "smooth" });
    },
    [maxIndex, getStep],
  );

  // Any sliding (swipe, arrows, dots, trackpad) pauses the playing video.
  const onScroll = () => {
    pauseAll();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(measure);
  };

  useEffect(() => {
    measure();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [measure, items.length]);

  // Re-align on resize / rotate (slide width changes between 1, 2 and 3 per view).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      el.scrollTo({ left: activeRef.current * getStep() });
      measure();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [getStep, measure]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    }
  };

  const canSlide = maxIndex > 0;
  const atStart = active <= 0;
  const atEnd = active >= maxIndex;

  const arrowBase =
    "absolute top-[calc(50%_-_0.75rem)] z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-[#BF7B25]/30 bg-white/90 text-[#BF7B25] shadow-md backdrop-blur transition hover:bg-[#BF7B25] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BF7B25] disabled:pointer-events-none disabled:opacity-0";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Urban Haat videos"
      onKeyDown={onKeyDown}
      className="relative w-[80vw] flex-none"
    >
      {/* Arrows (commented out for now as requested) */}
      {/* {canSlide && (
        <>
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            disabled={atStart}
            aria-label="Previous video"
            className={`${arrowBase} left-2 sm:-left-5`}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            disabled={atEnd}
            aria-label="Next video"
            className={`${arrowBase} right-2 sm:-right-5`}
          >
            <Chevron dir="right" />
          </button>
        </>
      )} */}

      {/* Track: smooth native scrolling with snap */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth py-1 [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BF7B25]/50 [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item, i) => (
          <VideoSlide
            key={`${item.src ?? "placeholder"}-${i}`}
            item={item}
            index={i}
            registerVideo={registerVideo}
            onPlayStart={onPlayStart}
          />
        ))}
      </div>

      {/* Dots indicator (commented out for now as requested) */}
      {/* {canSlide && (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Choose video position">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Go to position ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-[#BF7B25]" : "w-2 bg-[#BF7B25]/30 hover:bg-[#BF7B25]/60"
              }`}
            />
          ))}
        </div>
      )} */}
    </div>
  );
}

/* ---------- Handwriting "Coming Soon / This Navratri" ---------- */
function WriteLine({
  text,
  run,
  duration,
  onDone,
  className,
}: {
  text: string;
  run: boolean;
  duration: number;
  onDone?: () => void;
  className: string;
}) {
  return (
    <span
      className={`${script.className} uh-write ${run ? "uh-run" : ""} block px-2 ${className}`}
      style={{ animationDuration: `${duration}s` }}
      onAnimationEnd={onDone}
    >
      {text}
    </span>
  );
}

function ComingSoon() {
  const rootRef = useRef<HTMLDivElement>(null);
  // 0 = waiting, 1 = writing "Coming Soon", 2 = writing "This Navratri"
  const [phase, setPhase] = useState(0);

  // Start when the block enters the viewport.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setPhase(1);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase(1);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="mt-10 flex flex-col items-center sm:mt-12">
      <style>{`
        @keyframes uh-write {
          from { clip-path: inset(-10% 100% -10% 0); }
          to   { clip-path: inset(-10% -4% -10% 0); }
        }
        .uh-write {
          clip-path: inset(-10% 100% -10% 0);
        }
        .uh-run {
          animation-name: uh-write;
          animation-timing-function: cubic-bezier(.4, .1, .5, 1);
          animation-fill-mode: forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .uh-write { clip-path: none; }
          .uh-run { animation: none; }
        }
      `}</style>

      {/* Coming Soon */}
      <WriteLine
        text="Coming Soon"
        run={phase >= 1}
        duration={1.1}
        onDone={() => setPhase(2)}
        className="text-[clamp(2.75rem,9vw,5rem)] font-bold leading-none text-[#BF7B25]"
      />

      {/* This Navratri: starts the moment "Coming Soon" finishes */}
      {/* <div className="mt-2">
        <WriteLine
          text="This Navratri"
          run={phase >= 2}
          duration={0.9}
          className="text-[clamp(1.75rem,5vw,2.75rem)] font-semibold leading-tight text-stone-800"
        />
      </div> */}
    </div>
  );
}

/* ---------- Instagram Reel Carousel Component ---------- */
const REEL_IDS = [
  "DeZGuqASYJU",
  "DelWfMDKqrX",
  "Dej_99rKRD7",
  "DegiS-gq2wy",
];

function ReelCard({
  id,
  isActive,
  onActivate,
  scrollerRef,
}: {
  id: string;
  isActive: boolean;
  onActivate: () => void;
  scrollerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // If this card is no longer active, refresh the iframe to stop video playback
  useEffect(() => {
    if (!isActive) {
      setReloadKey((k) => k + 1);
    }
  }, [isActive]);

  // When card moves out of the scroller viewport or page viewport, automatically pause it
  useEffect(() => {
    const cardEl = cardRef.current;
    const scrollerEl = scrollerRef.current;
    if (!cardEl || !isActive) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If less than 40% of the active video is visible in the carousel/viewport, pause it
          if (entry.intersectionRatio < 0.4) {
            setReloadKey((k) => k + 1);
          }
        });
      },
      {
        root: scrollerEl,
        threshold: [0, 0.4, 0.8, 1.0],
      }
    );

    observer.observe(cardEl);
    return () => observer.disconnect();
  }, [isActive, scrollerRef]);

  return (
    <div
      ref={cardRef}
      onClick={onActivate}
      className="w-[85vw] max-w-[340px] flex-none snap-center sm:w-[320px] lg:w-[340px]"
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-black border border-[#BF7B25]/20 shadow-[0_20px_50px_-20px_rgba(191,123,37,0.3)]"
        style={{ aspectRatio: "9 / 16" }}
      >
        <iframe
          key={reloadKey}
          ref={iframeRef}
          src={`https://www.instagram.com/reel/${id}/embed`}
          title={`Instagram reel ${id}`}
          loading="lazy"
          allow="autoplay; encrypted-media; fullscreen"
          scrolling="no"
          className="absolute border-0"
          style={{
            width: 450,
            height: 920,
            left: -86,
            top: -64,
            transform: "scale(1.146)",
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}

function InstagramReelCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  // When window/page loses focus to an iframe, identify which reel was interacted with
  useEffect(() => {
    const onBlur = () => {
      // Small timeout to check which element became active
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (activeEl && activeEl.tagName === "IFRAME") {
          const src = (activeEl as HTMLIFrameElement).src || "";
          for (const id of REEL_IDS) {
            if (src.includes(id)) {
              setActiveReelId(id);
              break;
            }
          }
        }
      }, 50);
    };

    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const distance = 350;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full max-w-[1200px] px-2 sm:px-8">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Previous reel"
          className="absolute left-0 sm:left-2 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-[#BF7B25]/30 bg-white/95 text-[#BF7B25] shadow-lg backdrop-blur transition hover:bg-[#BF7B25] hover:text-white"
        >
          <Chevron dir="left" />
        </button>
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Next reel"
          className="absolute right-0 sm:right-2 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-[#BF7B25]/30 bg-white/95 text-[#BF7B25] shadow-lg backdrop-blur transition hover:bg-[#BF7B25] hover:text-white"
        >
          <Chevron dir="right" />
        </button>
      )}

      {/* Carousel Track */}
      <div
        ref={scrollerRef}
        onScroll={checkScroll}
        className="flex snap-x snap-mandatory gap-5 sm:gap-6 overflow-x-auto overscroll-x-contain py-4 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {REEL_IDS.map((id) => (
          <ReelCard
            key={id}
            id={id}
            isActive={activeReelId === null || activeReelId === id}
            onActivate={() => setActiveReelId(id)}
            scrollerRef={scrollerRef}
          />
        ))}
      </div>
    </div>
  );
}

export default function Hero({ videoSrc, poster, videos }: HeroProps) {
  // Slider list kept for reference
  // const list: VideoItem[] = videos?.length ? videos : videoSrc ? [{ src: videoSrc, poster }] : [];

  return (
    <header className="bg-transparent pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-4 pt-2 text-center sm:px-8 sm:pt-8">
        {/* Logo */}
        <a
          href="#"
          aria-label="Urban Haat home"
          className="inline-flex items-center gap-3 -mb-6"
        >
          <Image src="/logo.webp" alt="Urban Haat" width={200} height={100} />
        </a>

        {/* Coming Soon — handwriting animation */}
        <ComingSoon />

        {/* Tagline */}
        <h1 className="mt-8 max-w-[18ch] text-[clamp(2.25rem,6.5vw,4.25rem)] font-extrabold leading-[1.08] tracking-tight text-stone-900 sm:mt-12">
          Fun, Food & Shopping — All in One Place.
        </h1>
        <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-stone-600 sm:text-lg">
          Your neighbourhood market, now a tap away. Craft, food and stories
          from the people who make them.
        </p>

        {/* Video section - Instagram Reels Carousel */}
        <div className="mt-10 flex w-full justify-center sm:mt-14">
          <InstagramReelCarousel />
        </div>
      </div>

      {/* Full-width endless logo carousel */}
      {/* <div className="mt-12 sm:mt-20">
        <div
          aria-label="Brands we work with"
          className="w-full overflow-hidden border-y border-[#BF7B25]/20 bg-[#BF7B25]/10 py-5 sm:py-6"
        >
          <div className="animate-marquee flex w-max hover:[animation-play-state:paused]">
            <LogoGroup />
            <LogoGroup hidden />
          </div>
        </div>
      </div> */}
    </header>
  );
}
