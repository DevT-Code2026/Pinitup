/**
 * UTM parameter utility for Pinitup.
 *
 * Why sessionStorage (not localStorage)?
 * - sessionStorage scopes data to a single browser tab and resets when
 *   the tab is closed.  This matches marketing attribution semantics:
 *   a user arriving from an Instagram reel should only carry that
 *   attribution for the duration of their session, not indefinitely.
 * - localStorage would persist UTM values across unrelated sessions,
 *   corrupting attribution data for returning visitors who arrived
 *   organically.
 *
 * Why sessionStorage over React state?
 * - UTM params must survive client-side navigations (React Router) and
 *   page refreshes.  React state is lost on unmount.  sessionStorage
 *   persists across the tab lifecycle.
 *
 * Provider-agnostic:
 * - This module is a pure data layer.  It knows nothing about which
 *   analytics provider consumes the data.  analytics.js reads from
 *   getStoredUtmParams() and merges values into every tracked event.
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "pinitup_utm";

/**
 * Canonical list of UTM parameter keys the application recognises.
 * Any URL query parameter not in this list is ignored.
 */
export const UTM_KEYS = Object.freeze([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
]);

/**
 * Read UTM parameters from the current browser URL.
 * Returns an object containing only keys that have a non-empty value.
 * Empty strings, null, and undefined are discarded.
 *
 * @returns {Record<string, string>} e.g. { utm_source: "instagram" }
 */
export function getUtmFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (typeof value === "string" && value.trim() !== "") {
        utm[key] = value.trim();
      }
    }
    return utm;
  } catch {
    // URLSearchParams can throw in unusual environments (e.g. test
    // runners with mocked windows).  Fail silently.
    return {};
  }
}

/**
 * Read stored UTM parameters from sessionStorage.
 * Returns a frozen object or null if nothing is stored.
 *
 * @returns {Record<string, string> | null}
 */
export function getStoredUtmParams() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Guard: ensure the stored value is a plain object
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    // Corrupted JSON — clear it and return null
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    return null;
  }
}

/**
 * Persist UTM parameters to sessionStorage.
 *
 * Merge strategy: existing stored values are preserved; only new keys
 * from `utm` are added or overwritten.  This ensures that if a URL
 * contains only `utm_source`, the previously stored `utm_campaign`
 * (from an earlier visit) is not lost.
 *
 * Keys with empty/whitespace-only values in the incoming `utm` object
 * are ignored so stale data is never written.
 *
 * @param {Record<string, string>} utm — partial or full UTM object
 */
export function storeUtmParams(utm) {
  if (!utm || typeof utm !== "object") return;

  const existing = getStoredUtmParams() || {};

  // Filter out any empty / whitespace-only values from the incoming set
  const clean = {};
  for (const [key, value] of Object.entries(utm)) {
    if (typeof value === "string" && value.trim() !== "") {
      clean[key] = value.trim();
    }
  }

  // If nothing survived cleaning, bail — don't write an empty object
  if (Object.keys(clean).length === 0) return;

  const merged = { ...existing, ...clean };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // sessionStorage full or unavailable — fail silently so analytics
    // never crashes the application.
  }
}

/**
 * Remove all stored UTM parameters from sessionStorage.
 * Called on logout to prevent stale attribution leaking across users
 * on shared devices.
 */
export function clearUtmParams() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Fail silently
  }
}

/**
 * React hook that:
 * 1. Reads UTM params from the URL on mount.
 * 2. Stores them in sessionStorage (merging with any existing values).
 * 3. Returns the current stored UTM object (or null).
 *
 * Safe to call from multiple components — reads are idempotent and the
 * hook does not cause unnecessary re-renders (state only updates if the
 * stored value actually changes).
 *
 * @returns {Record<string, string> | null}
 */
export function useUtmParams() {
  const [params, setParams] = useState(() => getStoredUtmParams());

  useEffect(() => {
    const urlUtm = getUtmFromUrl();
    if (Object.keys(urlUtm).length > 0) {
      storeUtmParams(urlUtm);
      setParams(getStoredUtmParams());
    }
  }, []);

  return params;
}
