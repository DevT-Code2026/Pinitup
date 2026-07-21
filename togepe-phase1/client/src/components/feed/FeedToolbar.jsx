import { motion } from "framer-motion";
import {
  Search,
  X,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most Liked" },
];

export default function FeedToolbar({
  searchQuery = "",
  onSearchChange,
  categories = [],
  activeCategory = "All",
  onCategoryChange,
  sortBy = "newest",
  onSortChange,
  resultCount = 0,
  isFiltering = false,
  isRefreshing = false,
  onRefresh,
}) {
  return (
    <motion.div
      className="feed-toolbar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="feed-toolbar__top">
        <div className="feed-toolbar__search">
          <Search size={18} className="feed-toolbar__search-icon" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              onSearchChange?.(e.target.value)
            }
            placeholder="Search prompts, tags, or descriptions..."
            className="feed-toolbar__search-input"
            aria-label="Search prompts"
          />

          {searchQuery && (
            <button
              type="button"
              className="feed-toolbar__search-clear"
              onClick={() => onSearchChange?.("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="feed-toolbar__sort">
          <ArrowUpDown
            size={16}
            className="feed-toolbar__sort-icon"
          />

          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange?.(e.target.value)
            }
            className="feed-toolbar__sort-select"
            aria-label="Sort prompts"
          >
            {SORT_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {typeof onRefresh === "function" && (
          <button
            type="button"
            className="feed-toolbar__refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh feed"
          >
            <RefreshCw
              size={18}
              className={
                isRefreshing ? "feed-toolbar__spin" : ""
              }
            />
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div
          className="feed-toolbar__chips"
          role="group"
          aria-label="Filter by category"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange?.(category)}
              className={`feed-toolbar__chip ${
                activeCategory === category
                  ? "feed-toolbar__chip--active"
                  : ""
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="feed-toolbar__meta">
        <span className="feed-toolbar__count">
          {resultCount}{" "}
          {resultCount === 1 ? "prompt" : "prompts"}
          {isFiltering ? " found" : ""}
        </span>
      </div>
    </motion.div>
  );
}