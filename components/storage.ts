"use client";

export const STORAGE_KEYS = {
  BG_IMAGE: "uh_cache_bg_image",
  BANNER_IMAGE_PREFIX: "uh_cache_img_",
  REELS_STATE: "uh_reels_state",
  INITIAL_READY: "uh_initial_ready",
  BACKGROUND_LOADED: "uh_background_loaded",
} as const;

export function getStoredItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[storage] Could not read ${key} from localStorage:`, err);
    return null;
  }
}

export function setStoredItem(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[storage] Could not write ${key} to localStorage:`, err);
    return false;
  }
}

/**
 * Downloads an image asset, converts it to base64 data URL, and saves it to localStorage.
 */
export async function cacheImageAsBase64(url: string, storageKey: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const cached = getStoredItem(storageKey);
    if (cached) return cached;

    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setStoredItem(storageKey, base64Data);
        resolve(base64Data);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`[storage] Failed caching image: ${url}`, err);
    return null;
  }
}
