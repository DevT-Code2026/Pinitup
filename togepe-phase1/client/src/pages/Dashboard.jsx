import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import WelcomeSection from "../components/dashboard/WelcomeSection";
import StatsGrid from "../components/dashboard/StatsGrid";
import RecentPrompts from "../components/dashboard/RecentPrompts";
import TrendingPrompts from "../components/dashboard/TrendingPrompts";
import QuickActions from "../components/dashboard/QuickActions";
import LoadingSkeleton from "../components/dashboard/LoadingSkeleton";
import EmptyState from "../components/dashboard/EmptyState";
import ErrorState from "../components/dashboard/ErrorState";

import api from "../services/api";

import "./Dashboard.css";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [prompts, setPrompts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const userName =
    user.name ||
    user.username ||
    user.firstName ||
    "Creator";

  const fetchDashboard = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const res = await api.get("/content");

        setPrompts(
          Array.isArray(res.data.content)
            ? res.data.content
            : []
        );
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);
    const dashboardStats = useMemo(() => {
    const totalPrompts = prompts.length;

    const totalCategories = new Set(
      prompts
        .map((p) => p.category)
        .filter(Boolean)
    ).size;

    const trendingCount = prompts.filter(
      (prompt) => (prompt.likesCount || 0) >= 10
    ).length;

    const latestPrompt = [...prompts].sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )[0];

    return {
      totalPrompts,
      totalCategories,
      trendingCount,
      latestUpload:
        latestPrompt?.title || "No uploads",
    };
  }, [prompts]);
    let dashboardContent;

  if (loading) {
    dashboardContent = <LoadingSkeleton />;
  } else if (error) {
    dashboardContent = (
      <ErrorState
        message={error}
        onRetry={() => fetchDashboard()}
      />
    );
  } else if (!prompts.length) {
    dashboardContent = (
      <EmptyState
        title="No prompts yet"
        description="Upload your first AI prompt and start building your workspace."
      />
    );
  } else {
    dashboardContent = (
      <>
        <WelcomeSection
          userName={userName}
          totalPrompts={
            dashboardStats.totalPrompts
          }
        />

        <StatsGrid
          totalPrompts={
            dashboardStats.totalPrompts
          }
          totalCategories={
            dashboardStats.totalCategories
          }
          trendingCount={
            dashboardStats.trendingCount
          }
          latestUpload={
            dashboardStats.latestUpload
          }
        />

        <RecentPrompts prompts={prompts} />

        <TrendingPrompts prompts={prompts} />

        <QuickActions
          onRefresh={() =>
            fetchDashboard(true)
          }
          isRefreshing={refreshing}
        />
      </>
    );
  }
    return (
    <div className="dashboard-page">
      <Navbar
        onMenuClick={() =>
          setSidebarOpen(true)
        }
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <motion.main
        className="dashboard-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="dashboard-container">
          {dashboardContent}
        </div>
      </motion.main>
    </div>
  );
}