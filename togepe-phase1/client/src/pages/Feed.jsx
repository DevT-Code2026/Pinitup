import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import FeedToolbar from "../components/feed/FeedToolbar";
import PromptGrid from "../components/feed/PromptGrid";
import FeedSkeleton from "../components/feed/FeedSkeleton";
import EmptyFeed from "../components/feed/EmptyFeed";
import ErrorFeed from "../components/feed/ErrorFeed";
import SaveToBoardModal from "../components/SaveToBoardModal";
import Toast from "../components/Toast";

import api from "../services/api";

import "./Feed.css";

export default function Feed() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || ""
  );
  const debouncedSearchRef = useRef(searchParams.get("q") || "");
  const debounceTimer = useRef(null);

  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get("category") || "All"
  );
  const [sortBy, setSortBy] = useState(
    () => searchParams.get("sort") || "newest"
  );

  const [categories, setCategories] = useState([]);

  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [likedIds, setLikedIds] = useState(() => new Set());
  const [savedIds, setSavedIds] = useState(() => new Set());

  const [saveToBoardContentId, setSaveToBoardContentId] = useState(null);
  const [toast, setToast] = useState(null);

  const isInitialLoad = useRef(true);

  // Sync URL → local state on mount / back-nav
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "All";
    const sort = searchParams.get("sort") || "newest";

    setSearchQuery(q);
    setActiveCategory(cat);
    setSortBy(sort);
    debouncedSearchRef.current = q;
  }, [searchParams]);

  // Debounce search input (400ms)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      debouncedSearchRef.current = searchQuery;
      const trimmed = searchQuery.trim();
      const next = new URLSearchParams(searchParams);
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      setSearchParams(next, { replace: true });
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, searchParams, setSearchParams]);

  // Fetch categories on mount
  useEffect(() => {
    api
      .get("/content/categories")
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => {});
  }, []);

  // Fetch feed when server-side params change
  const fetchFeed = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");
        if (isInitialLoad.current) setLoading(true);
        else if (showRefresh) setRefreshing(true);
        else setSearching(true);

        const q = debouncedSearchRef.current;
        const params = { limit: 200 };
        if (q) params.search = q;
        if (activeCategory && activeCategory !== "All") params.category = activeCategory;
        if (sortBy) params.sort = sortBy;

        const res = await api.get("/content", { params });

        const content = Array.isArray(res.data.content) ? res.data.content : [];
        setPrompts(content);

        setLikedIds(() => {
          const ids = new Set();
          content.forEach((item) => {
            if (item.isLiked) ids.add(item._id);
          });
          return ids;
        });

        isInitialLoad.current = false;
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Unable to load the feed.");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setSearching(false);
      }
    },
    [activeCategory, sortBy]
  );

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Fetch saved IDs on mount
  useEffect(() => {
    api
      .get("/boards/saved-ids")
      .then((res) => setSavedIds(new Set(res.data.savedIds || [])))
      .catch(() => {});
  }, []);

  const handleToggleLike = useCallback((contentId, nextLiked, nextCount) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (nextLiked) next.add(contentId);
      else next.delete(contentId);
      return next;
    });

    setPrompts((prev) =>
      prev.map((p) =>
        p._id === contentId
          ? { ...p, likesCount: nextCount, isLiked: nextLiked }
          : p
      )
    );
  }, []);

  const categoryNames = ["All", ...categories.map((c) => c.name)];

  const handleCategoryChange = useCallback(
    (cat) => {
      setActiveCategory(cat);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (cat && cat !== "All") next.set("category", cat);
        else next.delete("category");
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const handleSortChange = useCallback(
    (sort) => {
      setSortBy(sort);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (sort && sort !== "newest") next.set("sort", sort);
        else next.delete("sort");
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setActiveCategory("All");
    setSortBy("newest");
    debouncedSearchRef.current = "";
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const isFiltering =
    searchParams.get("q")?.trim().length > 0 ||
    (activeCategory && activeCategory !== "All") ||
    (sortBy && sortBy !== "newest");

  let feedContent;

  if (loading) {
    feedContent = <FeedSkeleton />;
  } else if (error) {
    feedContent = <ErrorFeed message={error} onRetry={() => fetchFeed()} />;
  } else if (!prompts.length) {
    feedContent = isFiltering ? (
      <EmptyFeed
        title="No matching prompts"
        description="Try a different search term or category."
        actionLabel="Clear Filters"
        onAction={handleClearFilters}
      />
    ) : (
      <EmptyFeed
        title="No prompts yet"
        description="Be the first to upload a prompt to the Pinitup feed."
      />
    );
  } else {
    feedContent = (
      <PromptGrid
        prompts={prompts}
        likedIds={likedIds}
        savedIds={savedIds}
        onToggleLike={handleToggleLike}
        onSave={setSaveToBoardContentId}
        onShare={(msg) => setToast({ message: msg, type: "success" })}
      />
    );
  }

  return (
    <div className="feed-page">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <motion.main
        className="feed-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="feed-container">
          <FeedToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categoryNames}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            resultCount={prompts.length}
            isFiltering={isFiltering}
            isRefreshing={refreshing}
            isSearching={searching}
            onRefresh={() => fetchFeed(true)}
            onClearFilters={handleClearFilters}
          />

          {feedContent}
        </div>
      </motion.main>

      <SaveToBoardModal
        open={Boolean(saveToBoardContentId)}
        contentId={saveToBoardContentId}
        onClose={() => setSaveToBoardContentId(null)}
        onSaved={(id, isSaved) => {
          setSavedIds((prev) => {
            const next = new Set(prev);
            if (isSaved) next.add(id);
            else next.delete(id);
            return next;
          });
          setToast({
            message: isSaved ? "Prompt saved to board" : "Prompt removed from board",
            type: "success",
          });
        }}
      />

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
