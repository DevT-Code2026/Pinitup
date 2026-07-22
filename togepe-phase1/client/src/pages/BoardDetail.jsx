import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  SearchX,
  FolderOpen,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import PromptCard from "../components/feed/PromptCard";
import Toast from "../components/Toast";
import api from "../services/api";

import "./Boards.css";

export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/boards/${id}`);
      setBoard(res.data.board || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Board not found");
      } else if (err.response?.status === 403) {
        setError("You don't have access to this board");
      } else {
        setError(err.response?.data?.message || "Failed to load board");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleRemovePrompt = async (contentId) => {
    try {
      await api.delete(`/boards/${id}/save/${contentId}`);
      setBoard((prev) => ({
        ...prev,
        savedContent: prev.savedContent.filter((c) => c._id !== contentId),
      }));
      setToast({ message: "Prompt removed from board", type: "success" });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to remove prompt",
        type: "error",
      });
    }
  };

  let bodyContent;

  if (loading) {
    bodyContent = (
      <div className="boards-loading">
        <Loader2 size={28} className="boards-spinner" />
      </div>
    );
  } else if (error) {
    bodyContent = (
      <div className="boards-error-detail">
        <AlertTriangle size={36} />
        <h3>{error}</h3>
        <button className="boards-retry-btn" onClick={() => navigate("/boards")}>
          Back to Boards
        </button>
      </div>
    );
  } else if (!board) {
    bodyContent = (
      <div className="boards-error-detail">
        <SearchX size={36} />
        <h3>Board not found</h3>
        <button className="boards-retry-btn" onClick={() => navigate("/boards")}>
          Back to Boards
        </button>
      </div>
    );
  } else {
    const prompts = board.savedContent || [];
    bodyContent = (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="board-detail-header">
          <div className="board-detail-info">
            <h1 className="board-detail-name">{board.name}</h1>
            {board.description && (
              <p className="board-detail-desc">{board.description}</p>
            )}
            <p className="board-detail-count">
              {prompts.length} {prompts.length === 1 ? "prompt" : "prompts"} saved
            </p>
          </div>
        </div>

        {prompts.length === 0 ? (
          <div className="boards-empty boards-empty--inline">
            <FolderOpen size={40} />
            <h3>No prompts saved yet</h3>
            <p>Explore the feed and save prompts to this board.</p>
          </div>
        ) : (
          <div className="feed-prompt-grid">
            {prompts.map((prompt, index) => (
              <div key={prompt._id} className="board-detail-card-wrapper">
                <PromptCard
                  prompt={prompt}
                  index={index}
                  href={`/prompt/${prompt._id}`}
                />
                <button
                  className="board-detail-remove-btn"
                  onClick={() => handleRemovePrompt(prompt._id)}
                  aria-label="Remove from board"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="boards-page">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <motion.main
        className="boards-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="boards-container">
          <button
            type="button"
            className="prompt-detail-back"
            onClick={() => navigate("/boards")}
          >
            <ArrowLeft size={18} />
            Back to Boards
          </button>

          {bodyContent}
        </div>
      </motion.main>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
