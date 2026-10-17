"use client";

import { useEffect, useState } from "react";
import { useLoading } from "./LoadingContext";

export default function Loader() {
  const { initialReady, progress, markLoaderGone } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!initialReady) return;
    // Quick fade once bg + the first reel are in (or the safety cap hits)
    const t1 = setTimeout(() => setLoaded(true), 100);
    const t2 = setTimeout(() => {
      setHidden(true);
      markLoaderGone(); // lets the "Coming Soon" animation start
    }, 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [initialReady, markLoaderGone]);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FAF5EC]/95 backdrop-blur-md transition-opacity duration-300 ease-out ${
        loaded ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Top progress line */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-[100000] h-[3.5px] bg-[#BF7B25]/20">
        <div
          className="h-full bg-gradient-to-r from-[#BF7B25] to-[#E0983A] shadow-[0_0_12px_rgba(191,123,37,0.7)] transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Center pulsing logo */}
      <div className="relative flex flex-col items-center justify-center px-6">
        <div className="animate-pulse duration-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.webp"
            alt="Urban Haat"
            className="h-28 w-auto object-contain drop-shadow-md md:h-36"
          />
        </div>
      </div>
    </div>
  );
}
