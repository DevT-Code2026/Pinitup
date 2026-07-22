import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  User,
  Tag,
  AlertTriangle,
  SearchX,
  RotateCw,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import api from "../services/api";

import "./PromptDetail.css";

export default function PromptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [prompt, setPrompt] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [notFound, setNotFound] = useState(false);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      setError("");
      setNotFound(false);

      const res = await api.get(`/content/${id}`);

      setPrompt(res.data.content || null);
    } catch (err) {
      const status = err.response?.status;

      if (status === 404 || status === 400) {
        setNotFound(true);
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load this prompt."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  let bodyContent;

  if (loading) {
    bodyContent = (
      <div
        className="prompt-detail-loading"
        aria-busy="true"
        aria-label="Loading prompt"
      >
        <div className="prompt-detail-loading__image shimmer" />

        <div className="prompt-detail-loading__info">
          <div className="prompt-detail-loading__badge shimmer" />
          <div className="prompt-detail-loading__title shimmer" />
          <div className="prompt-detail-loading__line shimmer" />
          <div className="prompt-detail-loading__line prompt-detail-loading__line--short shimmer" />
          <div className="prompt-detail-loading__box shimmer" />
        </div>
      </div>
    );
  } else if (notFound) {
    bodyContent = (
      <motion.div
        className="prompt-detail-state"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        role="status"
      >
        <div className="prompt-detail-state__icon prompt-detail-state__icon--muted">
          <SearchX size={40} strokeWidth={1.75} />
        </div>

        <h2 className="prompt-detail-state__title">
          Prompt not found
        </h2>

        <p className="prompt-detail-state__message">
          This prompt may have been removed, or the link is
          incorrect.
        </p>

        <Link to="/feed" className="prompt-detail-state__button">
          Back to Feed
        </Link>
      </motion.div>
    );
  } else if (error) {
    bodyContent = (
      <motion.div
        className="prompt-detail-state"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        role="alert"
      >
        <div className="prompt-detail-state__icon prompt-detail-state__icon--error">
          <AlertTriangle size={40} strokeWidth={1.75} />
        </div>

        <h2 className="prompt-detail-state__title">
          Something went wrong
        </h2>

        <p className="prompt-detail-state__message">{error}</p>

        <button
          type="button"
          className="prompt-detail-state__button"
          onClick={fetchPrompt}
        >
          <RotateCw size={16} />
          Retry
        </button>
      </motion.div>
    );
  } else if (prompt) {
    const creatorName = prompt.uploadedBy?.name || "Unknown creator";

    bodyContent = (
      <motion.div
        className="prompt-detail"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="prompt-detail__image-wrapper">
          {prompt.mediaUrl ? (
            <img
              src={prompt.mediaUrl}
              alt={prompt.title || "Prompt"}
              className="prompt-detail__image"
            />
          ) : (
            <div className="prompt-detail__placeholder">
              <Tag size={40} />
            </div>
          )}
        </div>

        <div className="prompt-detail__info">
          <span className="prompt-detail__category">
            {prompt.category || "General"}
          </span>

          <h1 className="prompt-detail__title">
            {prompt.title || "Untitled Prompt"}
          </h1>

          <p className="prompt-detail__description">
            {prompt.description || "No description available."}
          </p>

          <div className="prompt-detail__meta">
            <span className="prompt-detail__meta-item">
              <User size={16} />
              {creatorName}
            </span>

            <span className="prompt-detail__meta-item">
              <CalendarDays size={16} />
              {formatDate(prompt.createdAt)}
            </span>
          </div>

          <div className="prompt-detail__prompt-box">
            <span className="prompt-detail__prompt-label">
              Full Prompt
            </span>

            <p className="prompt-detail__prompt-text">
              {prompt.prompt}
            </p>
          </div>

          {Array.isArray(prompt.tags) && prompt.tags.length > 0 && (
            <div className="prompt-detail__tags">
              {prompt.tags.map((tag) => (
                <span key={tag} className="prompt-detail__tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="prompt-detail-page">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <motion.main
        className="prompt-detail-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="prompt-detail-container">
          <button
            type="button"
            className="prompt-detail-back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {bodyContent}
        </div>
      </motion.main>
    </div>
  );
}