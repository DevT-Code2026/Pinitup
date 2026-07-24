/**
 * Analytics abstraction layer for Pinitup.
 *
 * Why abstract analytics?
 * - All tracking calls go through this module so switching to another
 *   provider (Mixpanel, GA4, PostHog, Amplitude) requires changes ONLY
 *   here — no component, page, or utility needs modification.
 * - Every public function is wrapped in a try/catch so analytics failures
 *   never crash the application.  Analytics is best-effort, not critical
 *   path.
 * - UTM attribution is merged into every event automatically via withUtm().
 *
 * Current provider: Vercel Analytics (@vercel/analytics/react)
 *
 * Plan limitations (verified 2026-07):
 * - Hobby plan: page views ONLY.  No custom events, no UTM params.
 * - Pro plan: page views + custom events (2 properties each).  No UTM.
 * - Pro + Web Analytics Plus: page views + custom events (8 props) + UTM.
 * - Enterprise: same as Pro+Plus.
 * - User identification (identify/reset): NOT supported on ANY plan.
 *   Vercel Analytics uses anonymous daily-hashed visitor IDs.  If user
 *   identification is needed in the future, switch to Mixpanel, GA4, or
 *   Amplitude (see the identify/reset stubs below).
 *
 * Provider swap instructions:
 * 1. Replace the import of `track` from "@vercel/analytics/react" with
 *    the new provider's SDK.
 * 2. Update the `sendEvent` function to call the new provider's track.
 * 3. Update `sendPageView` for the new provider's page view API.
 * 4. Implement `identify` and `reset` with the new provider's methods.
 * 5. Remove "@vercel/analytics" from package.json.
 * No other files need to change.
 */

import { track } from "@vercel/analytics/react";
import { getStoredUtmParams } from "./utm";

/* ── Internal helpers ── */

/**
 * Merge any stored UTM params into event properties so every tracked
 * event carries the attribution context for the current session.
 *
 * @param {Record<string, any>} [props={}]
 * @returns {Record<string, any>}
 */
function withUtm(props = {}) {
  try {
    const utm = getStoredUtmParams();
    if (!utm || Object.keys(utm).length === 0) return props;
    // UTM values go first so caller props can override if needed
    return { ...utm, ...props };
  } catch {
    return props;
  }
}

/**
 * Safely send an event to the analytics provider.
 * Wraps the provider call in try/catch so analytics never crashes the app.
 *
 * @param {string} name — event name (snake_case)
 * @param {Record<string, any>} [properties] — flat key-value pairs
 */
function sendEvent(name, properties) {
  try {
    track(name, properties);
    // Future: Mixpanel — mixpanel.track(name, properties)
    // Future: GA4 — gtag("event", name, properties)
    // Future: PostHog — posthog.capture(name, properties)
  } catch {
    // Analytics failure must never propagate to application code
  }
}

/* ── Public API ── */

/**
 * Track a page view.
 *
 * Page views are also automatically tracked by Vercel Analytics when the
 * <Analytics /> component is mounted.  This function exists for manual /
 * programmatic tracking (e.g. virtual page views, filter changes that
 * update the URL).
 *
 * @param {string} [path] — defaults to current pathname
 */
export function pageView(path) {
  const pathname = path || window.location.pathname;
  sendEvent("pageview", { path: pathname });
}

/**
 * Generic event tracking.  The primary API for all custom events.
 *
 * @param {string} eventName — snake_case event name
 * @param {Record<string, any>} [properties={}] — flat properties (no nested objects)
 */
export function trackEvent(eventName, properties = {}) {
  sendEvent(eventName, withUtm(properties));
}

/**
 * Identify the current user with the analytics provider.
 *
 * IMPORTANT: Vercel Analytics does NOT support user identification on any
 * plan.  This function is a no-op for Vercel and exists as a placeholder
 * for future Mixpanel / GA4 / Amplitude integration.
 *
 * When switching providers, implement:
 *   mixpanel.identify(userId)
 *   mixpanel.people.set(traits)
 *   gtag("set", { user_id: userId, ...traits })
 *
 * @param {string} userId
 * @param {Record<string, any>} [traits={}]
 */
export function identify(userId, traits = {}) {
  // Vercel Analytics: no-op (anonymous visitors only)
  // Future: Mixpanel — mixpanel.identify(userId); mixpanel.people.set(traits)
  // Future: GA4 — gtag("set", "user_id", userId); gtag("set", traits)
  void userId;
  void traits;
}

/**
 * Reset the current user identity (e.g. on logout).
 *
 * IMPORTANT: Vercel Analytics does NOT support user identification, so
 * this is a no-op.  Exists for future provider integration.
 *
 * When switching providers, implement:
 *   mixpanel.reset()
 *   ga("set", "userId", null)
 *
 * @returns {void}
 */
export function reset() {
  // Vercel Analytics: no-op
  // Future: Mixpanel — mixpanel.reset()
  // Future: GA4 — gtag("set", "user_id", undefined)
}

/* ── Domain-specific event helpers ── */
/* Each wraps trackEvent() so components import semantic functions instead
   of raw event names.  Adding a new event here keeps the public API
   stable even if event naming conventions change. */

/**
 * Track user login.
 * @param {string} [method="email"] — "email" | "google"
 */
export function trackLogin(method = "email") {
  trackEvent("login", { method });
}

/**
 * Track new user signup.
 * @param {string} [method="email"] — "email" | "google"
 */
export function trackSignup(method = "email") {
  trackEvent("signup", { method });
}

/**
 * Track when a user views a prompt detail page.
 * @param {string} promptId
 * @param {string} [category]
 */
export function trackPromptViewed(promptId, category) {
  trackEvent("prompt_viewed", { promptId, category: category || "" });
}

/**
 * Track when a user clicks the "Generate" button on a workflow card.
 * @param {string} workflowSlug
 */
export function trackGenerateClicked(workflowSlug) {
  trackEvent("generate_clicked", { workflowSlug });
}

/**
 * Track when a workflow generation request is sent to the backend.
 * @param {string} workflowSlug
 */
export function trackGenerationStarted(workflowSlug) {
  trackEvent("generation_started", { workflowSlug });
}

/**
 * Track successful workflow generation.
 * @param {string} workflowSlug
 * @param {number} [durationMs] — generation time in milliseconds
 */
export function trackGenerationCompleted(workflowSlug, durationMs) {
  trackEvent("generation_completed", {
    workflowSlug,
    durationMs: durationMs || 0,
  });
}

/**
 * Track failed workflow generation.
 * @param {string} workflowSlug
 * @param {string|Error} error
 */
export function trackGenerationFailed(workflowSlug, error) {
  trackEvent("generation_failed", {
    workflowSlug,
    error: String(error?.message || error || "unknown"),
  });
}
