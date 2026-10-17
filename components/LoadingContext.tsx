"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  STORAGE_KEYS,
  cacheImageAsBase64,
  getStoredItem,
  setStoredItem,
} from "./storage";

const CRITICAL_IMAGES = ["/background.webp", "/logo.webp"];
export const BANNER_IMAGES = [
  "/banners/1.webp",
  "/banners/2.webp",
  "/banners/3.webp",
  "/banners/4.webp",
  "/banners/5.webp",
  "/banners/6.webp",
];

/* ------------------------------------------------------------------
   LOAD PLAN (one reel at a time)
   0 ms        background.webp + reel 1 (DeZGuqASYJU) start together;
               nothing else loads, so reel 1 gets the full connection
   loader      stays until bg + reel 1 are loaded (safety cap below)
   +0.4 s      loader fade-out
   then        reels 2, 3, 4 load in the background, one after another, in
               REEL_IDS order; each starts when the previous one is in
               (or after 4 s with no progress)
   any time    moving the carousel unlocks the reel you moved to + the next
   after all 4 banners are preloaded (12 s fallback)
------------------------------------------------------------------- */
export const REEL_COUNT = 4;
const INITIAL_REELS = 1; // fetched while the loader is on screen
const LOADER_MAX_MS = 6000; // safety cap: the loader normally ends as soon as reel 1 is in
const STALL_MS = 4000; // move on to the next reel if one makes no progress
const BANNERS_FALLBACK_MS = 12000;

type LoadingContextType = {
  /** bg + reels are ready (or the 2.5 s cap was hit); the loader starts fading */
  initialReady: boolean;
  /** the loader has fully faded out and is removed */
  loaderGone: boolean;
  markLoaderGone: () => void;
  /** banners may load now (all reels done, or fallback) */
  backgroundLoad: boolean;
  /** how many reels may load (reels 0..n-1); grows one reel at a time */
  reelsToLoad: number;
  /** allow reels 0..count-1 to load (used when the user moves the carousel) */
  unlockReels: (count: number) => void;
  progress: number;
  bgDataUrl: string | null;
  isReelLoaded: (index: number) => boolean;
  markReelLoaded: (index: number) => void;
  markBgLoaded: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  initialReady: false,
  loaderGone: false,
  markLoaderGone: () => {},
  backgroundLoad: false,
  reelsToLoad: INITIAL_REELS,
  unlockReels: () => {},
  progress: 10,
  bgDataUrl: null,
  isReelLoaded: () => false,
  markReelLoaded: () => {},
  markBgLoaded: () => {},
});

export function useLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [initialReady, setInitialReady] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [backgroundLoad, setBackgroundLoad] = useState(false);
  const [reelsToLoad, setReelsToLoad] = useState(INITIAL_REELS);
  const [progress, setProgress] = useState(10);
  const [bgDataUrl, setBgDataUrl] = useState<string | null>(null);

  const loadedReelsRef = useRef<Set<number>>(new Set());
  const bgLoadedRef = useRef(false);
  const initialReadyRef = useRef(false);
  const bannersStartedRef = useRef(false);
  const lastProgressRef = useRef(Date.now());

  const markLoaderGone = useCallback(() => setLoaderGone(true), []);

  const finishInitialLoad = useCallback(() => {
    if (initialReadyRef.current) return;
    initialReadyRef.current = true;
    setProgress(100);
    setInitialReady(true);
  }, []);

  // Banners (and the cached background) load only after the reels are done.
  const startBanners = useCallback(() => {
    if (bannersStartedRef.current) return;
    bannersStartedRef.current = true;
    setBackgroundLoad(true);

    const preloadBanners = () => {
      BANNER_IMAGES.forEach((src) => {
        const img = new Image();
        img.src = src;
      });

      setStoredItem(STORAGE_KEYS.BACKGROUND_LOADED, "true");
      setStoredItem(
        "uh_assets_cached",
        JSON.stringify({
          bg: "/background.webp",
          banners: BANNER_IMAGES,
          cachedAt: Date.now(),
        }),
      );

      if (!getStoredItem(STORAGE_KEYS.BG_IMAGE)) {
        cacheImageAsBase64("/background.webp", STORAGE_KEYS.BG_IMAGE).then(
          (data) => {
            if (data) setBgDataUrl(data);
          },
        );
      }
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(preloadBanners);
    } else {
      setTimeout(preloadBanners, 200);
    }
  }, []);

  // Single place that moves the load plan forward.
  const evaluate = useCallback(() => {
    const loaded = loadedReelsRef.current;

    const real = 10 + (bgLoadedRef.current ? 20 : 0) + loaded.size * 17;
    setProgress((p) => Math.max(p, Math.min(95, real)));

    // reels load one at a time: reel k+1 starts once reels 0..k are in
    let contiguous = 0;
    while (loaded.has(contiguous)) contiguous++;
    setReelsToLoad((n) => Math.max(n, Math.min(REEL_COUNT, contiguous + 1)));

    // first reel in -> the loader can finish
    if (loaded.has(0) && bgLoadedRef.current) finishInitialLoad();

    // all reels in -> banners
    if (loaded.size >= REEL_COUNT) startBanners();
  }, [finishInitialLoad, startBanners]);

  const markBgLoaded = useCallback(() => {
    bgLoadedRef.current = true;
    evaluate();
  }, [evaluate]);

  const markReelLoaded = useCallback(
    (index: number) => {
      loadedReelsRef.current.add(index);
      lastProgressRef.current = Date.now();
      evaluate();
    },
    [evaluate],
  );

  const unlockReels = useCallback((count: number) => {
    setReelsToLoad((n) => Math.max(n, Math.min(REEL_COUNT, count)));
  }, []);

  const isReelLoaded = useCallback(
    (index: number) => loadedReelsRef.current.has(index),
    [],
  );

  useEffect(() => {
    // 1. Background: use the cached copy if we have one, else preload it
    const storedBg = getStoredItem(STORAGE_KEYS.BG_IMAGE);
    if (storedBg) {
      setBgDataUrl(storedBg);
      markBgLoaded();
    }

    CRITICAL_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
      const onDone = () => {
        if (src === "/background.webp") markBgLoaded();
      };
      if (img.complete) onDone();
      else {
        img.onload = onDone;
        img.onerror = onDone;
      }
    });

    // 2. Progress bar creeps toward 90% over the loader window
    const start = Date.now();
    const tick = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / LOADER_MAX_MS);
      setProgress((p) => Math.max(p, Math.round(t * 90)));
    }, 120);

    // 3. If a reel stalls, move on to the next one so nothing waits forever
    const stallTimer = setInterval(() => {
      // while the loader is up, only reel 1 loads
      if (!initialReadyRef.current) return;
      if (Date.now() - lastProgressRef.current < STALL_MS) return;
      lastProgressRef.current = Date.now();
      setReelsToLoad((n) => Math.min(REEL_COUNT, n + 1));
    }, 1000);

    // 4. Hard cap: loader always completes
    const hardLimit = setTimeout(finishInitialLoad, LOADER_MAX_MS);

    // 5. Banners fallback if a reel never reports as loaded
    const bannerFallback = setTimeout(startBanners, BANNERS_FALLBACK_MS);

    return () => {
      clearInterval(tick);
      clearInterval(stallTimer);
      clearTimeout(hardLimit);
      clearTimeout(bannerFallback);
    };
  }, [finishInitialLoad, markBgLoaded, startBanners]);

  return (
    <LoadingContext.Provider
      value={{
        initialReady,
        loaderGone,
        markLoaderGone,
        backgroundLoad,
        reelsToLoad,
        unlockReels,
        progress,
        bgDataUrl,
        isReelLoaded,
        markReelLoaded,
        markBgLoaded,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}
