import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { pageView } from "../utils/analytics";

/**
 * Fires a page view event on every React Router navigation.
 *
 * Must be rendered inside <BrowserRouter>.
 *
 * Deduplication:
 * - On mount, the first location is recorded WITHOUT firing an event
 *   because Vercel Analytics auto-tracks the initial page load via its
 *   injected script.  Firing a duplicate here would count the landing
 *   page twice.
 * - Subsequent navigations (client-side) are tracked normally.
 * - A ref guard prevents the same path+search from being tracked twice
 *   in rapid succession (e.g. React StrictMode double-invoke in dev).
 *
 * Why this is the single source of truth:
 * - Vercel's auto-track uses the browser `popstate` event, which only
 *   fires on browser back/forward — NOT on React Router's navigate().
 *   This component tracks ALL navigations, including programmatic ones.
 * - In main.jsx, <Analytics /> is rendered with no route/path props, so
 *   Vercel's built-in auto-tracking is disabled to avoid duplicates.
 */
export default function PageViewTracker() {
  const location = useLocation();
  const lastTrackedRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Mark component as mounted after the first render
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const fullPath = location.pathname + location.search;

    // Skip the very first render — Vercel Analytics already tracks the
    // initial page load via its injected script.
    if (lastTrackedRef.current === null) {
      lastTrackedRef.current = fullPath;
      return;
    }

    // Dedup: don't fire if path+search hasn't changed
    if (lastTrackedRef.current === fullPath) return;

    lastTrackedRef.current = fullPath;
    pageView(fullPath);
  }, [location.pathname, location.search]);

  return null;
}
