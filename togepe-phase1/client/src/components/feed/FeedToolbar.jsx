import {
  Search,
  X,
  ArrowUpDown,
  RefreshCw,
  Loader2,
} from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most Liked" },
  { value: "most_saved", label: "Most Saved" },
];

export default function FeedToolbar({
  searchQuery = "",
  onSearchChange,
  sortBy = "newest",
  onSortChange,
  resultCount = 0,
  isRefreshing = false,
  isSearching = false,
  onRefresh,
  isFiltering = false,
  onClearFilters,
}) {
  return (
    <div className="feed-toolbar" role="search" aria-label="Search and filter prompts">
      <div className="feed-toolbar__left">
        <div className="feed-toolbar__search">
          {isSearching ? (
            <Loader2
              size={16}
              className="feed-toolbar__search-icon feed-toolbar__spin"
            />
          ) : (
            <Search size={16} className="feed-toolbar__search-icon" />
          )}

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search prompts..."
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
              <X size={14} />
            </button>
          )}
        </div>

        {isFiltering && typeof onClearFilters === "function" && (
          <div className="feed-toolbar__active-filters">
            <button
              type="button"
              className="feed-toolbar__clear-btn"
              onClick={onClearFilters}
            >
              <X size={12} />
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="feed-toolbar__right">
        <div className="feed-toolbar__sort">
          <ArrowUpDown size={14} className="feed-toolbar__sort-icon" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="feed-toolbar__sort-select"
            aria-label="Sort prompts"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
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
              size={16}
              className={isRefreshing ? "feed-toolbar__spin" : ""}
            />
          </button>
        )}

        <span className="feed-toolbar__meta">
          {resultCount} {resultCount === 1 ? "pin" : "pins"}
        </span>
      </div>
    </div>
  );
}
