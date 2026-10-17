"use client";

import { useEffect, useState } from "react";
import { useLoading } from "./LoadingContext";
import { getStoredItem, STORAGE_KEYS } from "./storage";

// Full-screen background that stays put while the phone's address bar slides in and out.
// It is a fixed layer sized to the LARGEST phone viewport (100lvh), so it always covers the
// screen and never shows white/black strips or re-draws with a jerk.
export default function PageBackground() {
  const { bgDataUrl } = useLoading();
  const [bgSrc, setBgSrc] = useState<string>("/background.webp");

  useEffect(() => {
    // Check if background image is already in memory or localStorage cache
    const cached = bgDataUrl || getStoredItem(STORAGE_KEYS.BG_IMAGE);
    if (cached) {
      setBgSrc(cached);
    }
  }, [bgDataUrl]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100lvh] bg-cover bg-center bg-no-repeat transition-opacity duration-300"
      style={{
        minHeight: "100vh", // fallback for old browsers that don't know lvh
        backgroundImage: `url('${bgSrc}')`,
        backgroundColor: "#1c1410", // shown only while the image loads
        willChange: "transform",
        transform: "translate3d(0, 0, 0)",
      }}
    />
  );
}
