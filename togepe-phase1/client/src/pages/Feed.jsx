import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import Navbar from "../components/layout/Navbar.jsx";
import PromptGrid from "../components/feed/PromptGrid.jsx";
import GuestFeedCTA from "../components/feed/GuestFeedCTA.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import {
  CATEGORIES,
  CATEGORY_IMAGES,
  CATEGORY_COUNTS,
  DEMO_PROMPTS,
} from "../data/demoPrompts.js";

import "./Feed.css";

const GUEST_PROMPT_LIMIT = 5;
const DEBOUNCE_MS = 400;
const FEED_TARGET_COUNT = 40;

export default function Feed() {
  const { user, isAuthenticated } = useAuth();
  const isGuest = !isAuthenticated;

  const [searchParams, setSearchParams] = useSearchParams();

  const [serverPrompts, setServerPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || ""
  );
  const [sortBy, setSortBy] = useState(
    () => searchParams.get("sort") || "newest"
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("category") || "All"
  );

  const debounceRef = useRef(null);

  /* ── Fetch prompts from API ── */
  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (selectedCategory && selectedCategory !== "All")
        params.set("category", selectedCategory);
      params.set("sort", sortBy);

      const { data } = await api.get(`/content?${params.toString()}`);
      setServerPrompts(Array.isArray(data) ? data : data.content ?? []);
    } catch (err) {
      console.error("Failed to load prompts:", err);
      setError("Could not reach the server. Some prompts may be missing.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  /* ── URL sync ── */
  useEffect(() => {
    const next = new URLSearchParams();
    if (searchQuery.trim()) next.set("q", searchQuery.trim());
    if (selectedCategory !== "All") next.set("category", selectedCategory);
    if (sortBy !== "newest") next.set("sort", sortBy);
    setSearchParams(next, { replace: true });
  }, [searchQuery, selectedCategory, sortBy, setSearchParams]);

  /* ── Search debounce ── */
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {}, DEBOUNCE_MS);
  }, []);

  /* ── Category select ── */
  const handleCategoryChange = useCallback((cat) => {
    setSelectedCategory(cat);
  }, []);

  /* ── Merged prompt list: real prompts always first, demo fills the rest ── */
  const displayPrompts = useMemo(() => {
    const realPrompts = Array.isArray(serverPrompts) ? serverPrompts : [];

    /* When the user is actively searching, don't pad with demo content */
    const isFiltering =
      Boolean(searchQuery.trim()) || (selectedCategory && selectedCategory !== "All");

    if (isFiltering || realPrompts.length >= FEED_TARGET_COUNT) {
      return realPrompts;
    }

    /* Build a set of real prompt titles (lowercased) for dedup */
    const realTitles = new Set(
      realPrompts.map((p) => (p.title || "").toLowerCase())
    );

    /* Filter demo prompts to match the active category (if any) and skip
       any whose title already exists in the real results. */
    const safeDemo = Array.isArray(DEMO_PROMPTS) ? DEMO_PROMPTS : [];
    let fillers = safeDemo.filter(
      (d) => !realTitles.has((d.title || "").toLowerCase())
    );

    if (selectedCategory && selectedCategory !== "All") {
      fillers = fillers.filter((d) => d.category === selectedCategory);
    }

    /* Sort fillers by popularity so the best demo content fills first */
    fillers.sort((a, b) => (b.likes || 0) - (a.likes || 0));

    const needed = FEED_TARGET_COUNT - realPrompts.length;
    const appended = fillers.slice(0, Math.max(0, needed));

    return [...realPrompts, ...appended];
  }, [serverPrompts, selectedCategory, searchQuery]);

  /* ── Guest limit ── */
  const visiblePrompts = useMemo(() => {
    if (!isGuest) return displayPrompts;
    return displayPrompts.slice(0, GUEST_PROMPT_LIMIT);
  }, [displayPrompts, isGuest]);

  const showGuestCTA = isGuest && displayPrompts.length >= GUEST_PROMPT_LIMIT;

  /* ── Like/Save handlers (no-ops for demo content) ── */
  const handleToggleLike = useCallback(() => {}, []);
  const handleSave = useCallback(() => {}, []);
  const handleShare = useCallback(() => {}, []);

  return (
    <div className="feed-page">
      <Navbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <div className="feed-main">
        {/* Header */}
        <div className="feed-container">
          <div className="feed-header">
            <h1 className="feed-header__title">Prompt Board</h1>
            <p className="feed-header__subtitle">
              All prompts are unlocked. Scroll forever, like, pin, and share.
            </p>
          </div>
        </div>

        {/* Category strip — image thumbnails */}
        <div className="feed-category-strip">
          <div className="feed-category-strip__scroll">
            {/* All */}
            <button
              type="button"
              className={`feed-category-strip__thumb ${
                selectedCategory === "All"
                  ? "feed-category-strip__thumb--active"
                  : ""
              }`}
              onClick={() => handleCategoryChange("All")}
              aria-pressed={selectedCategory === "All"}
            >
              <img
                src={CATEGORY_IMAGES.All}
                alt=""
                className="feed-category-strip__thumb-bg"
                loading="lazy"
              />
              <span className="feed-category-strip__thumb-label">
                All ({CATEGORY_COUNTS.All})
              </span>
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`feed-category-strip__thumb ${
                  selectedCategory === cat
                    ? "feed-category-strip__thumb--active"
                    : ""
                }`}
                onClick={() => handleCategoryChange(cat)}
                aria-pressed={selectedCategory === cat}
              >
                <img
                  src={CATEGORY_IMAGES[cat]}
                  alt=""
                  className="feed-category-strip__thumb-bg"
                  loading="lazy"
                />
                <span className="feed-category-strip__thumb-label">
                  {cat} ({CATEGORY_COUNTS[cat]})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="feed-container">
          {loading && !(Array.isArray(serverPrompts) && serverPrompts.length) ? (
            <div className="feed-loading">
              <div className="feed-loading__chips">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="feed-loading__chip shimmer" />
                ))}
              </div>
              <div className="feed-loading__grid">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="feed-loading__card">
                    <div
                      className="feed-loading__image shimmer"
                      style={{
                        height: [300, 400, 350, 500, 280, 450][i % 6],
                      }}
                    />
                    <div className="feed-loading__content">
                      <div className="feed-loading__title shimmer" />
                      <div className="feed-loading__text shimmer" />
                      <div className="feed-loading__text feed-loading__text--short shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error && !(Array.isArray(serverPrompts) && serverPrompts.length) ? (
            <div className="feed-error">
              <div className="feed-error__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 className="feed-error__title">Oops! Something went wrong</h2>
              <p className="feed-error__message">{error}</p>
              <button
                className="feed-error__button"
                onClick={fetchPrompts}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <PromptGrid
                prompts={visiblePrompts}
                likedIds={new Set()}
                savedIds={new Set()}
                onToggleLike={handleToggleLike}
                onSave={handleSave}
                onShare={handleShare}
              />

              {showGuestCTA && <GuestFeedCTA />}

              {!loading && !error && displayPrompts.length === 0 && (
                <div className="feed-empty">
                  <div className="feed-empty__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </div>
                  <h2 className="feed-empty__title">No prompts found</h2>
                  <p className="feed-empty__description">
                    Try adjusting your search or category filter.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
