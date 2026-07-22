import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2, FolderOpen } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import BoardCard from "../components/board/BoardCard";
import Toast from "../components/Toast";
import api from "../services/api";

import "./Boards.css";

export default function Boards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const [editBoard, setEditBoard] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [updating, setUpdating] = useState(false);

  const [deleteBoard, setDeleteBoard] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key !== "Escape") return;
      if (deleteBoard && !deleting) setDeleteBoard(null);
      else if (editBoard) setEditBoard(null);
      else if (showCreate) setShowCreate(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showCreate, editBoard, deleteBoard, deleting]);

  const fetchBoards = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await api.get("/boards");
      setBoards(res.data.boards || []);
    } catch {
      setError("Failed to load boards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    try {
      await api.post("/boards", {
        name: createName.trim(),
        description: createDesc.trim(),
      });
      setToast({ message: "Board created", type: "success" });
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      fetchBoards();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to create board",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (board) => {
    setEditBoard(board);
    setEditName(board.name);
    setEditDesc(board.description || "");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editBoard) return;
    setUpdating(true);
    try {
      await api.put(`/boards/${editBoard._id}`, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setToast({ message: "Board updated", type: "success" });
      setEditBoard(null);
      fetchBoards();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to update board",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBoard) return;
    setDeleting(true);
    try {
      await api.delete(`/boards/${deleteBoard._id}`);
      setToast({ message: "Board deleted", type: "success" });
      setDeleteBoard(null);
      fetchBoards();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to delete board",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

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
          <div className="boards-header">
            <div>
              <h1 className="boards-title">My Boards</h1>
              <p className="boards-subtitle">Organize your favorite prompts into collections</p>
            </div>
            <button
              className="boards-create-btn"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={18} />
              New Board
            </button>
          </div>

          {loading ? (
            <div className="boards-loading">
              <Loader2 size={28} className="boards-spinner" />
            </div>
          ) : error ? (
            <div className="boards-error-state">
              <p>{error}</p>
              <button className="boards-retry-btn" onClick={fetchBoards}>
                Retry
              </button>
            </div>
          ) : boards.length === 0 ? (
            <div className="boards-empty">
              <FolderOpen size={48} />
              <h3>No boards yet</h3>
              <p>Create a board to start saving and organizing prompts.</p>
              <button
                className="boards-create-btn"
                onClick={() => setShowCreate(true)}
              >
                <Plus size={18} />
                Create your first board
              </button>
            </div>
          ) : (
            <div className="boards-grid">
              {boards.map((board, i) => (
                <BoardCard
                  key={board._id}
                  board={board}
                  index={i}
                  onEdit={handleEdit}
                  onDelete={setDeleteBoard}
                />
              ))}
            </div>
          )}
        </div>
      </motion.main>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="stm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Create board"
          >
            <motion.div
              className="stm-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stm-header">
                <h2 className="stm-title">Create Board</h2>
                <button className="stm-close" onClick={() => setShowCreate(false)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              <form className="stm-create-form" onSubmit={handleCreate}>
                <input
                  type="text"
                  className="stm-input"
                  placeholder="Board name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  autoFocus
                  required
                  aria-label="Board name"
                />
                <input
                  type="text"
                  className="stm-input"
                  placeholder="Description (optional)"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  aria-label="Board description"
                />
                <div className="stm-create-actions">
                  <button
                    type="button"
                    className="stm-btn stm-btn--ghost"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="stm-btn stm-btn--primary"
                    disabled={creating || !createName.trim()}
                  >
                    {creating ? <Loader2 size={16} className="stm-spinner" /> : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editBoard && (
          <motion.div
            className="stm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditBoard(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Edit board"
          >
            <motion.div
              className="stm-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stm-header">
                <h2 className="stm-title">Edit Board</h2>
                <button className="stm-close" onClick={() => setEditBoard(null)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              <form className="stm-create-form" onSubmit={handleUpdate}>
                <input
                  type="text"
                  className="stm-input"
                  placeholder="Board name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  required
                  aria-label="Board name"
                />
                <input
                  type="text"
                  className="stm-input"
                  placeholder="Description (optional)"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  aria-label="Board description"
                />
                <div className="stm-create-actions">
                  <button
                    type="button"
                    className="stm-btn stm-btn--ghost"
                    onClick={() => setEditBoard(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="stm-btn stm-btn--primary"
                    disabled={updating || !editName.trim()}
                  >
                    {updating ? <Loader2 size={16} className="stm-spinner" /> : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteBoard && (
          <motion.div
            className="stm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm delete board"
          >
            <motion.div
              className="stm-modal stm-modal--sm"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="stm-header">
                <h2 className="stm-title">Delete Board</h2>
                <button className="stm-close" onClick={() => !deleting && setDeleteBoard(null)} disabled={deleting} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              <p className="stm-confirm-text">
                Are you sure you want to delete &ldquo;{deleteBoard.name}&rdquo;? This cannot be undone.
              </p>
              <div className="stm-create-actions">
                <button
                  className="stm-btn stm-btn--ghost"
                  onClick={() => setDeleteBoard(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="stm-btn stm-btn--danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 size={16} className="stm-spinner" /> : "Delete"}
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
