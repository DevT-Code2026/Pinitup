import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Gem, ArrowUpRight, ArrowDownLeft, Clock, ChevronLeft, ChevronRight } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import LoadingSkeleton from "../components/dashboard/LoadingSkeleton";
import ErrorState from "../components/dashboard/ErrorState";
import EmptyState from "../components/dashboard/EmptyState";

import { getWalletTransactions } from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./Wallet.css";

const ITEMS_PER_PAGE = 10;

const TYPE_LABELS = {
  signup_bonus: "Signup Bonus",
  purchase: "Purchase",
  promotion: "Promotion",
  workflow_generation: "Execution",
  refund: "Refund",
  admin_adjustment: "Admin Adjustment",
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Wallet() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { credits, loadingWallet } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setError("");
      setLoading(true);
      const res = await getWalletTransactions(page, ITEMS_PER_PAGE);
      if (!mountedRef.current) return;
      setTransactions(res.data.transactions || []);
      setPagination(res.data.pagination || { page: 1, total: 0, pages: 0 });
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.response?.data?.message || "Failed to load transaction history.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchTransactions(1);
    return () => { mountedRef.current = false; };
  }, [fetchTransactions]);

  const handlePageChange = (newPage) => {
    fetchTransactions(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  let content;

  if (loading && !transactions.length) {
    content = <LoadingSkeleton />;
  } else if (error && !transactions.length) {
    content = <ErrorState message={error} onRetry={() => fetchTransactions(pagination.page)} />;
  } else {
    content = (
      <>
        {/* ── Balance Card ── */}
        <motion.section
          className="wallet-balance"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="wallet-balance__icon">
            <Gem size={28} />
          </div>
          <div className="wallet-balance__content">
            <p className="wallet-balance__label">Available Credits</p>
            {loadingWallet && credits === null ? (
              <div className="wallet-balance__skeleton" />
            ) : (
              <p className="wallet-balance__value">{credits ?? 0}</p>
            )}
          </div>
        </motion.section>

        {/* ── Transaction History ── */}
        <motion.section
          className="wallet-section"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <div className="wallet-section__header">
            <div>
              <h2 className="wallet-section__title">Transaction History</h2>
              <p className="wallet-section__subtitle">
                {pagination.total > 0
                  ? `${pagination.total} transaction${pagination.total !== 1 ? "s" : ""}`
                  : "No transactions yet"}
              </p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Your credit history will appear here once you start earning or spending credits."
              actionLabel="Explore Prompts"
              actionTo="/"
            />
          ) : (
            <>
              <div className="wallet-transactions">
                {transactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <div key={tx._id} className="wallet-tx">
                      <div className={`wallet-tx__icon ${isCredit ? "wallet-tx__icon--credit" : "wallet-tx__icon--debit"}`}>
                        {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div className="wallet-tx__content">
                        <p className="wallet-tx__type">
                          {TYPE_LABELS[tx.type] || tx.type}
                        </p>
                        {tx.description && (
                          <p className="wallet-tx__description">{tx.description}</p>
                        )}
                      </div>
                      <div className="wallet-tx__right">
                        <p className={`wallet-tx__amount ${isCredit ? "wallet-tx__amount--credit" : "wallet-tx__amount--debit"}`}>
                          {isCredit ? "+" : ""}{tx.amount}
                        </p>
                        <p className="wallet-tx__date">
                          <Clock size={12} />
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Pagination ── */}
              {pagination.pages > 1 && (
                <div className="wallet-pagination">
                  <button
                    type="button"
                    className="wallet-pagination__btn"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <span className="wallet-pagination__info">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    type="button"
                    className="wallet-pagination__btn"
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
        </motion.section>
      </>
    );
  }

  return (
    <div className="wallet-page">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <motion.main
        className="wallet-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="wallet-container">
          {content}
        </div>
      </motion.main>
    </div>
  );
}
