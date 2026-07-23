import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Gem, Sparkles, Brain, PenTool, Globe } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import LoadingSkeleton from "../components/dashboard/LoadingSkeleton";
import ErrorState from "../components/dashboard/ErrorState";

import { getWorkflows } from "../services/api";

import "./Workflows.css";

const PROVIDER_ICONS = {
  gemini: Sparkles,
  openai: Brain,
  claude: PenTool,
};

const PROVIDER_COLORS = {
  gemini: { bg: "#eef2ff", color: "#4f46e5" },
  openai: { bg: "#ecfdf5", color: "#16a34a" },
  claude: { bg: "#fef3c7", color: "#d97706" },
};

export default function Workflows() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  const fetchWorkflows = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await getWorkflows();
      if (!mountedRef.current) return;
      setWorkflows(res.data.workflows || []);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.response?.data?.message || "Failed to load workflows.");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchWorkflows();
    return () => { mountedRef.current = false; };
  }, [fetchWorkflows]);

  let content;

  if (loading) {
    content = <LoadingSkeleton />;
  } else if (error) {
    content = <ErrorState message={error} onRetry={fetchWorkflows} />;
  } else if (workflows.length === 0) {
    content = (
      <motion.div
        className="wf-empty"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="wf-empty__icon">
          <Zap size={40} />
        </div>
        <h2 className="wf-empty__title">No workflows available</h2>
        <p className="wf-empty__description">
          AI workflows will appear here once they are configured by the admin.
        </p>
      </motion.div>
    );
  } else {
    content = (
      <>
        <motion.div
          className="wf-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="wf-header__title">AI Workflows</h1>
          <p className="wf-header__subtitle">
            Choose from powerful AI tools to enhance your content creation.
          </p>
        </motion.div>

        <div className="wf-grid">
          {workflows.map((wf, index) => {
            const Icon = PROVIDER_ICONS[wf.provider] || Globe;
            const providerStyle = PROVIDER_COLORS[wf.provider] || { bg: "#f3f4f6", color: "#6b7280" };

            return (
              <motion.div
                key={wf.id}
                className="wf-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <div className="wf-card__top">
                  <div
                    className="wf-card__icon"
                    style={{ background: providerStyle.bg, color: providerStyle.color }}
                  >
                    <Icon size={22} />
                  </div>
                  <div className="wf-card__cost">
                    <Gem size={14} />
                    <span>{wf.creditCost} Credits</span>
                  </div>
                </div>

                <h3 className="wf-card__name">{wf.name}</h3>

                {wf.description && (
                  <p className="wf-card__description">{wf.description}</p>
                )}

                <div className="wf-card__footer">
                  <span
                    className="wf-card__provider"
                    style={{ background: providerStyle.bg, color: providerStyle.color }}
                  >
                    {wf.provider}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div className="wf-page">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <motion.main
        className="wf-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="wf-container">
          {content}
        </div>
      </motion.main>
    </div>
  );
}
