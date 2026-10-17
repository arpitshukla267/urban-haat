"use client";

import { useEffect, useState } from "react";

export default function Loader() {
  const [progress, setProgress] = useState(15);
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // List of crucial static assets that must finish loading
    const criticalImages = [
      "/background.webp",
      "/logo.webp",
      "/banners/1.webp",
      "/banners/2.webp",
      "/banners/3.webp",
      "/banners/4.webp",
      "/banners/5.webp",
      "/banners/6.png",
    ];

    let completedCount = 0;
    const totalCount = criticalImages.length + 1; // + 1 for DOM / Window load

    const updateProgress = () => {
      completedCount++;
      const pct = Math.min(90, Math.round((completedCount / totalCount) * 85) + 15);
      setProgress((prev) => Math.max(prev, pct));
    };

    // Preload critical banner & logo images
    criticalImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (img.complete) {
        updateProgress();
      } else {
        img.onload = updateProgress;
        img.onerror = updateProgress;
      }
    });

    // Check window & document load
    const handleWindowLoad = () => {
      updateProgress();
    };

    if (document.readyState === "complete") {
      updateProgress();
    } else {
      window.addEventListener("load", handleWindowLoad);
    }

    // Check iframe reels ready or timeout fallback so user isn't stuck
    const checkReady = setInterval(() => {
      const iframes = Array.from(document.querySelectorAll("iframe"));
      const allLoaded =
        iframes.length > 0
          ? iframes.every((f) => {
              try {
                return f.contentDocument?.readyState === "complete";
              } catch {
                return true; // Cross-origin Instagram iframes throw, which means loaded
              }
            })
          : true;

      if (completedCount >= totalCount && allLoaded) {
        clearInterval(checkReady);
        setProgress(100);
        setTimeout(() => setLoaded(true), 400);
        setTimeout(() => setHidden(true), 900);
      }
    }, 200);

    // Fallback maximum timeout of 3.5 seconds
    const fallbackTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setLoaded(true), 300);
      setTimeout(() => setHidden(true), 800);
    }, 3500);

    return () => {
      window.removeEventListener("load", handleWindowLoad);
      clearInterval(checkReady);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FAF5EC]/95 backdrop-blur-md transition-opacity duration-500 ease-out ${
        loaded ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Top Progressive Indicator Line */}
      <div className="fixed top-0 left-0 right-0 z-[100000] h-[3.5px] bg-[#BF7B25]/20 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#BF7B25] to-[#E0983A] shadow-[0_0_12px_rgba(191,123,37,0.7)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Center Blinking Vertical Logo */}
      <div className="relative flex flex-col items-center justify-center px-6">
        <div className="animate-pulse duration-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.webp"
            alt="Urban Haat"
            className="h-28 w-auto object-contain md:h-36 drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
