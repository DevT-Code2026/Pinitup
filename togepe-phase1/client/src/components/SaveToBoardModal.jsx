import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check, FolderOpen, Loader2 } from "lucide-react";
import api from "../services/api";

export default function SaveToBoardModal({ open, contentId, onClose, onSaved }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open || !contentId) return;
    setError("");
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
    setLoading(true);
    api
      .get("/boards", { params: { contentId } })
      .then((res) => setBoards(res.data.boards || []))
      .catch(() => setError("Failed to load boards"))
      .finally(() => setLoading(false));
  }, [open, contentId]);

  const handleToggle = async (board) => {
    setSaving(board._id);
    setError("");
    try {
      if (board.isSaved) {
        await api.delete(`/boards/${board._id}/save/${contentId}`);
        setBoards((prev) =>
          prev.map((b) =>
            b._id === board._id ? { ...b, isSaved: false } : b
          )
        );
        onSaved?.(contentId, false);
      } else {
        await api.post(`/boards/${board._id}/save/${contentId}`);
        setBoards((prev) =>
          prev.map((b) =>
            b._id === board._id ? { ...b, isSaved: true } : b
          )
        );
        onSaved?.(contentId, true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update board");
    } finally {
      setSaving(null);
    }
  };

  const handleCreateAndSave = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await api.post("/boards", {
        name: newName.trim(),
        description: newDesc.trim(),
      });
      const board = res.data.board;
      await api.post(`/boards/${board._id}/save/${contentId}`);
      onSaved?.(contentId, true);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create board");
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="stm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="stm-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="stm-header">
              <h2 className="stm-title">Save to Board</h2>
              <button className="stm-close" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {error && <div className="stm-error">{error}</div>}

            {loading ? (
              <div className="stm-loading">
                <Loader2 size={24} className="stm-spinner" />
                <span>Loading boards...</span>
              </div>
            ) : (
              <div className="stm-body">
                {boards.length > 0 && (
                  <div className="stm-list">
                    {boards.map((board) => (
                      <button
                        key={board._id}
                        className={`stm-board-item${board.isSaved ? " stm-board-item--saved" : ""}`}
                        onClick={() => handleToggle(board)}
                        disabled={saving !== null}
                      >
                        <div
                          className={`stm-board-icon${board.isSaved ? " stm-board-icon--saved" : ""}`}
                        >
                          {board.isSaved ? (
                            <Check size={18} />
                          ) : (
                            <FolderOpen size={18} />
                          )}
                        </div>
                        <div className="stm-board-info">
                          <span className="stm-board-name">{board.name}</span>
                          <span className="stm-board-count">
                            {board.savedContent?.length || 0} prompts
                          </span>
                        </div>
                        {saving === board._id ? (
                          <Loader2 size={16} className="stm-spinner" />
                        ) : (
                          <span
                            className={`stm-board-save-label${board.isSaved ? " stm-board-save-label--saved" : ""}`}
                          >
                            {board.isSaved ? "Saved" : "Save"}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {boards.length === 0 && !showCreate && (
                  <div className="stm-empty">
                    <FolderOpen size={36} />
                    <p>No boards yet. Create one to start saving prompts.</p>
                  </div>
                )}

                {showCreate ? (
                  <form className="stm-create-form" onSubmit={handleCreateAndSave}>
                    <input
                      type="text"
                      className="stm-input"
                      placeholder="Board name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                      required
                    />
                    <input
                      type="text"
                      className="stm-input"
                      placeholder="Description (optional)"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                    <div className="stm-create-actions">
                      <button
                        type="button"
                        className="stm-btn stm-btn--ghost"
                        onClick={() => {
                          setShowCreate(false);
                          setNewName("");
                          setNewDesc("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="stm-btn stm-btn--primary"
                        disabled={creating || !newName.trim()}
                      >
                        {creating ? (
                          <Loader2 size={16} className="stm-spinner" />
                        ) : (
                          "Create & Save"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="stm-create-btn"
                    onClick={() => setShowCreate(true)}
                  >
                    <Plus size={18} />
                    Create new board
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
