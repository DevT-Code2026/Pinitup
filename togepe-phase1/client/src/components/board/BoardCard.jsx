import { motion } from "framer-motion";
import { FolderOpen, Trash2, Edit3, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function BoardCard({
  board,
  index = 0,
  onEdit,
  onDelete,
}) {
  const count = board.savedContent?.length || 0;

  return (
    <motion.div
      className="board-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/boards/${board._id}`} className="board-card__link">
        <div className="board-card__header">
          <div className="board-card__icon">
            <FolderOpen size={22} />
          </div>
          <ChevronRight size={18} className="board-card__chevron" />
        </div>
        <h3 className="board-card__name">{board.name}</h3>
        {board.description && (
          <p className="board-card__desc">{board.description}</p>
        )}
        <p className="board-card__count">
          {count} {count === 1 ? "prompt" : "prompts"}
        </p>
      </Link>

      <div className="board-card__actions">
        <button
          className="board-card__action"
          onClick={(e) => {
            e.preventDefault();
            onEdit?.(board);
          }}
          aria-label={`Edit ${board.name}`}
        >
          <Edit3 size={15} />
        </button>
        <button
          className="board-card__action board-card__action--danger"
          onClick={(e) => {
            e.preventDefault();
            onDelete?.(board);
          }}
          aria-label={`Delete ${board.name}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}
