"use client";

import { useEffect } from "react";
import { SIGNUP_STORAGE_KEY, readAttribution } from "@/lib/attribution";

/**
 * Records where a visitor arrived from, once per session, on the first public
 * page they land on. First touch wins — a visitor who arrives from a partner
 * link and later navigates to /login is still credited to the partner.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SIGNUP_STORAGE_KEY)) return;
      const attribution = readAttribution(window.location.href, document.referrer);
      if (Object.keys(attribution).length === 0) return;
      sessionStorage.setItem(SIGNUP_STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      // Private mode or storage disabled — attribution is best-effort.
    }
  }, []);

  return null;
}

/** Reads what AttributionCapture stored, for posting with a registration. */
export function storedAttribution(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(SIGNUP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
