import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, FileText, FolderKanban, Clock } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import api from "../services/api";
import "./AdminPage.css";

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load admin stats"))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-page">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <motion.main
        className="admin-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="admin-container">
          <div className="admin-header">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Platform overview and management</p>
          </div>

          {loading ? (
            <div className="admin-stats-grid">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="admin-stat-card admin-stat-card--skeleton">
                  <div className="admin-stat-card__shimmer" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="admin-error">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="admin-stats-grid">
                <motion.div
                  className="admin-stat-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <div className="admin-stat-card__icon admin-stat-card__icon--users">
                    <Users size={22} />
                  </div>
                  <div className="admin-stat-card__info">
                    <span className="admin-stat-card__value">{stats.totalUsers}</span>
                    <span className="admin-stat-card__label">Total Users</span>
                  </div>
                </motion.div>

                <motion.div
                  className="admin-stat-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="admin-stat-card__icon admin-stat-card__icon--prompts">
                    <FileText size={22} />
                  </div>
                  <div className="admin-stat-card__info">
                    <span className="admin-stat-card__value">{stats.totalPrompts}</span>
                    <span className="admin-stat-card__label">Total Prompts</span>
                  </div>
                </motion.div>

                <motion.div
                  className="admin-stat-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="admin-stat-card__icon admin-stat-card__icon--boards">
                    <FolderKanban size={22} />
                  </div>
                  <div className="admin-stat-card__info">
                    <span className="admin-stat-card__value">{stats.totalBoards}</span>
                    <span className="admin-stat-card__label">Total Boards</span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="admin-recent"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="admin-recent__title">
                  <Clock size={18} />
                  Recent Activity
                </h2>

                {stats.recentActivity.length === 0 ? (
                  <p className="admin-recent__empty">No recent activity</p>
                ) : (
                  <div className="admin-recent__list">
                    {stats.recentActivity.map((item) => (
                      <div key={item.id} className="admin-recent__item">
                        <div className="admin-recent__item-dot" />
                        <div className="admin-recent__item-info">
                          <span className="admin-recent__item-title">{item.title}</span>
                          <span className="admin-recent__item-meta">
                            by {item.userName} · {item.category} · {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </motion.main>
    </div>
  );
}
