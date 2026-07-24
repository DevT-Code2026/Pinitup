import React from "react";
import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

/**
 * Analytics integration.
 *
 * <Analytics /> injects the Vercel Web Analytics script.  It is placed
 * OUTSIDE <BrowserRouter> so it does not depend on React Router context.
 *
 * IMPORTANT: <Analytics /> is rendered WITHOUT `route`/`path` props.
 * This means Vercel's built-in auto-tracking is ENABLED and will track
 * the initial page load + browser back/forward via the `popstate` event.
 *
 * <PageViewTracker /> (inside App.jsx, within BrowserRouter) handles
 * ALL React Router navigations (including programmatic navigate() calls
 * which popstate does NOT fire for).
 *
 * Deduplication strategy:
 * - Vercel script: tracks initial load + popstate (back/forward)
 * - PageViewTracker: skips the initial render (dedup with Vercel),
 *   then tracks all subsequent client-side navigations.
 * - This ensures no page is tracked twice.
 *
 * Provider swap:
 * To switch from Vercel Analytics to another provider, replace the
 * import and component below with the new provider's equivalent.
 * No changes to PageViewTracker or analytics.js are needed.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Analytics />
  </React.StrictMode>
);
