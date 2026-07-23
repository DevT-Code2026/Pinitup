import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  Gem,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Brain,
  PenTool,
  Globe,
  Zap,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
  Search,
  X,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";

import LoadingSkeleton from "../components/dashboard/LoadingSkeleton";
import ErrorState from "../components/dashboard/ErrorState";
import EmptyState from "../components/dashboard/EmptyState";

import { getExecutions } from "../services/api";
import ExecutionDetailModal from "../components/ExecutionDetailModal";

import "./ExecutionHistory.css";

const ITEMS_PER_PAGE = 15;

const STATUS_CONFIG = {
  queued: { label: "Queued", icon: Clock, bg: "#f3f4f6", color: "#6b7280" },
  running: { label: "Running", icon: Loader2, bg: "#eff6ff", color: "#2563eb" },
  completed: { label: "Completed", icon: CheckCircle, bg: "#ecfdf5", color: "#16a34a" },
  failed: { label: "Failed", icon: XCircle, bg: "#fef2f2", color: "#dc2626" },
  refunded: { label: "Refunded", icon: RotateCcw, bg: "#fffbeb", color: "#d97706" },
};

const PROVIDERS = {
  gemini: { icon: Sparkles, bg: "#eef2ff", color: "#4f46e5", label: "Gemini" },
  openai: { icon: Brain, bg: "#ecfdf5", color: "#16a34a", label: "OpenAI" },
  claude: { icon: PenTool, bg: "#fef3c7", color: "#d97706", label: "Claude" },
  pruna: { icon: Zap, bg: "#fce7f3", color: "#db2777", label: "Pruna" },
  segmind: { icon: Globe, bg: "#f0fdf4", color: "#15803d", label: "Segmind" },
};

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

function getProviderMeta(provider) {
  return PROVIDERS[provider] || { icon: Globe, bg: "#f3f4f6", color: "#6b7280", label: provider };
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(start, end) {
  if (!start || !end) return "—";
  const ms = new Date(end) - new Date(start);
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function ExecutionHistory() {
  const [allExecutions, setAllExecutions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExecution, setSelectedExecution] = useState(null);
  const mountedRef = useRef(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchExecutions = useCallback(async (page = 1) => {
    try {
      setError("");
      setLoading(true);
      const res = await getExecutions(page, ITEMS_PER_PAGE);
      if (!mountedRef.current) return;
      setAllExecutions(res.data.executions || []);
      setPagination(res.data.pagination || { page: 1, total: 0, pages: 0 });
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.response?.data?.message || "Failed to load execution history.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchExecutions(1);
    return () => { mountedRef.current = false; };
  }, [fetchExecutions]);

  const filteredExecutions = useMemo(() => {
    return allExecutions.filter((ex) => {
      if (statusFilter !== "all" && ex.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ex.workflowName.toLowerCase().includes(q) ||
          ex.provider.toLowerCase().includes(q) ||
          (ex.executionReference && ex.executionReference.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allExecutions, statusFilter, searchQuery]);

  const handlePageChange = (newPage) => {
    fetchExecutions(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  let content;

  if (loading && !allExecutions.length) {
    content = <LoadingSkeleton />;
  } else if (error && !allExecutions.length) {
    content = <ErrorState message={error} onRetry={() => fetchExecutions(pagination.page)} />;
  } else {
    content = (
      <>
        <motion.div
          className="exec-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="exec-header__title">Execution History</h1>
          <p className="exec-header__subtitle">
            Track every workflow execution, credit deduction, and refund.
          </p>
        </motion.div>

        {allExecutions.length > 0 && (
          <motion.div
            className="exec-toolbar"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <div className="exec-toolbar__search">
              <Search size={16} color="#9ca3af" />
              <input
                type="text"
                placeholder="Search by workflow, provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="exec-toolbar__search-input"
                aria-label="Search executions"
              />
              {searchQuery && (
                <button
                  className="exec-toolbar__search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="exec-toolbar__tabs">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  className={`exec-toolbar__tab ${statusFilter === tab.value ? "exec-toolbar__tab--active" : ""}`}
                  onClick={() => setStatusFilter(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {allExecutions.length === 0 ? (
          <EmptyState
            title="No executions yet"
            description="Run a workflow to see your execution history here."
            actionLabel="Explore Workflows"
            actionTo="/workflows"
          />
        ) : filteredExecutions.length === 0 ? (
          <motion.div
            className="exec-empty-filter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Search size={28} color="#9ca3af" />
            <p>No executions match your search or filters.</p>
          </motion.div>
        ) : (
          <>
            <div className="exec-list">
              {filteredExecutions.map((ex, index) => {
                const statusCfg = STATUS_CONFIG[ex.status] || STATUS_CONFIG.queued;
                const StatusIcon = statusCfg.icon;
                const providerMeta = getProviderMeta(ex.provider);
                const ProviderIcon = providerMeta.icon;

                return (
                  <motion.div
                    key={ex.id}
                    className="exec-row"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    onClick={() => setSelectedExecution(ex)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedExecution(ex);
                      }
                    }}
                  >
                    <div
                      className="exec-row__provider"
                      style={{ background: providerMeta.bg, color: providerMeta.color }}
                    >
                      <ProviderIcon size={18} />
                    </div>

                    <div className="exec-row__info">
                      <p className="exec-row__name">{ex.workflowName}</p>
                      <p className="exec-row__meta">
                        <span
                          className="exec-row__provider-label"
                          style={{ background: providerMeta.bg, color: providerMeta.color }}
                        >
                          {providerMeta.label}
                        </span>
                        &middot; {formatDateTime(ex.createdAt)}
                      </p>
                    </div>

                    <div className="exec-row__credits">
                      <Gem size={13} />
                      <span>{ex.creditsSpent}</span>
                    </div>

                    <div
                      className="exec-row__status"
                      style={{ background: statusCfg.bg, color: statusCfg.color }}
                    >
                      <StatusIcon
                        size={13}
                        className={ex.status === "running" ? "exec-row__spinner" : ""}
                      />
                      <span>{statusCfg.label}</span>
                    </div>

                    <div className="exec-row__duration">
                      {formatDuration(ex.startedAt, ex.completedAt)}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {pagination.pages > 1 && (
              <div className="exec-pagination">
                <button
                  type="button"
                  className="exec-pagination__btn"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span className="exec-pagination__info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  type="button"
                  className="exec-pagination__btn"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <div className="exec-page">
      <Navbar />

      <motion.main
        className="exec-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="exec-container">
          {content}
        </div>
      </motion.main>

      {selectedExecution && (
        <ExecutionDetailModal
          execution={selectedExecution}
          onClose={() => setSelectedExecution(null)}
        />
      )}
    </div>
  );
}
