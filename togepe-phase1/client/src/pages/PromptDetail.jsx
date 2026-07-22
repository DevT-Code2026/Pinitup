import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  User,
  Tag,
  AlertTriangle,
  SearchX,
  RotateCw,
  Bookmark,
  BookmarkCheck,
  Trash2,
  Loader2,
  X,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import LikeButton from "../components/LikeButton.jsx";
import SaveToBoardModal from "../components/SaveToBoardModal";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext.jsx";

import api from "../services/api";

import "./PromptDetail.css";

export default function PromptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [prompt, setPrompt] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [notFound, setNotFound] = useState(false);

  const [liked, setLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [saveToBoardOpen, setSaveToBoardOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      setError("");
      setNotFound(false);

      const res = await api.get(`/content/${id}`);

      setPrompt(res.data.content || null);
      setLiked(res.data.content?.isLiked || false);
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

  useEffect(() => {
    if (id) {
      api.get("/boards/saved-ids")
        .then((res) => setIsSaved((res.data.savedIds || []).includes(id)))
        .catch(() => {});
    }
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleToggleLike = useCallback(
    (contentId, nextLiked, nextCount) => {
      setLiked(nextLiked);
      setPrompt((prev) =>
        prev?._id === contentId
          ? { ...prev, likesCount: nextCount, isLiked: nextLiked }
          : prev
      );
    },
    []
  );

  const handleDelete = async () => {
    if (!prompt) return;
    setDeleting(true);
    try {
      await api.delete(`/content/${prompt._id}`);
      setConfirmDeleteOpen(false);
      setToast({ message: "Prompt deleted", type: "success" });
      setTimeout(() => navigate("/feed"), 800);
    } catch (err) {
      setConfirmDeleteOpen(false);
      setToast({
        message: err.response?.data?.message || "Failed to delete prompt",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const isOwner =
    prompt?.uploadedBy?._id && (user?._id || user?.id)
      ? String(prompt.uploadedBy._id) === String(user._id || user.id)
      : false;

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

          <div className="prompt-detail__actions">
            <LikeButton
              contentId={prompt._id}
              liked={liked}
              likesCount={prompt.likesCount || 0}
              onToggle={handleToggleLike}
            />
            <button
              type="button"
              className={`save-button${isSaved ? " save-button--active" : ""}`}
              onClick={() => setSaveToBoardOpen(true)}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              Save to Board
            </button>
            {isOwner && (
              <button
                type="button"
                className="prompt-detail__delete-btn"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
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

      <SaveToBoardModal
        open={saveToBoardOpen}
        contentId={prompt?._id}
        onClose={() => setSaveToBoardOpen(false)}
        onSaved={(id, saved) => {
          setIsSaved(saved);
          setToast({
            message: saved ? "Prompt saved to board" : "Prompt removed from board",
            type: "success",
          });
        }}
      />

      <AnimatePresence>
        {confirmDeleteOpen && (
          <motion.div
            className="stm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleting && setConfirmDeleteOpen(false)}
          >
            <motion.div
              className="stm-modal stm-modal--sm"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stm-header">
                <h2 className="stm-title">Delete Prompt</h2>
                <button
                  className="stm-close"
                  onClick={() => !deleting && setConfirmDeleteOpen(false)}
                  disabled={deleting}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="stm-confirm-text">
                Are you sure you want to delete &ldquo;{prompt?.title}&rdquo;? This cannot be undone.
              </p>
              <div className="stm-create-actions">
                <button
                  className="stm-btn stm-btn--ghost"
                  onClick={() => setConfirmDeleteOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="stm-btn stm-btn--danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 size={16} className="stm-spinner" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}