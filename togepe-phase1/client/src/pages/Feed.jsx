import { useCallback, useEffect, useMemo, useState } from "react";
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

  const [prompts, setPrompts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");

  const [sortBy, setSortBy] = useState("newest");

  const [likedIds, setLikedIds] = useState(() => new Set());
  const [savedIds, setSavedIds] = useState(() => new Set());

  const [saveToBoardContentId, setSaveToBoardContentId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchFeed = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        // No dedicated feed endpoint — reuses the same GET /content the
        // Dashboard already calls, just with a higher limit so there's a
        // meaningful set of prompts to filter/search/sort client-side.
        const res = await api.get("/content", {
          params: { limit: 50 },
        });

        setPrompts(
          Array.isArray(res.data.content)
            ? res.data.content
            : []
        );

        setLikedIds(() => {
          const ids = new Set();
          (res.data.content || []).forEach((item) => {
            if (item.isLiked) ids.add(item._id);
          });
          return ids;
        });
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load the feed."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    api.get("/boards/saved-ids")
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

  const categories = useMemo(() => {
    const unique = new Set(
      prompts
        .map((p) => p.category)
        .filter(Boolean)
    );

    return ["All", ...unique];
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return prompts.filter((prompt) => {
      const matchesCategory =
        activeCategory === "All" ||
        prompt.category === activeCategory;

      if (!matchesCategory) return false;

      if (!query) return true;

      const haystack = [
        prompt.title,
        prompt.description,
        prompt.prompt,
        ...(Array.isArray(prompt.tags) ? prompt.tags : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [prompts, searchQuery, activeCategory]);

  const sortedPrompts = useMemo(() => {
    const list = [...filteredPrompts];

    if (sortBy === "oldest") {
      return list.sort(
        (a, b) =>
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0)
      );
    }

    if (sortBy === "popular") {
      return list.sort(
        (a, b) =>
          (b.likesCount || 0) - (a.likesCount || 0)
      );
    }

    // "newest" (default)
    return list.sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );
  }, [filteredPrompts, sortBy]);

  const hasAnyPrompts = prompts.length > 0;

  const hasResults = sortedPrompts.length > 0;

  const isFiltering =
    searchQuery.trim().length > 0 || activeCategory !== "All";

  let feedContent;

  if (loading) {
    feedContent = <FeedSkeleton />;
  } else if (error) {
    feedContent = (
      <ErrorFeed
        message={error}
        onRetry={() => fetchFeed()}
      />
    );
  } else if (!hasAnyPrompts) {
    feedContent = (
      <EmptyFeed
        title="No prompts yet"
        description="Be the first to upload a prompt to the Pinitup feed."
      />
    );
  } else if (!hasResults) {
    feedContent = (
      <EmptyFeed
        title="No matching prompts"
        description="Try a different search term or category."
        actionLabel="Clear Filters"
        onAction={() => {
          setSearchQuery("");
          setActiveCategory("All");
        }}
      />
    );
  } else {
    feedContent = (
      <PromptGrid
        prompts={sortedPrompts}
        likedIds={likedIds}
        savedIds={savedIds}
        onToggleLike={handleToggleLike}
        onSave={setSaveToBoardContentId}
      />
    );
  }

  return (
    <div className="feed-page">
      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <motion.main
        className="feed-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="feed-container">
          <FeedToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={sortedPrompts.length}
            isFiltering={isFiltering}
            isRefreshing={refreshing}
            onRefresh={() => fetchFeed(true)}
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