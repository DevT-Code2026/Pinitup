import { motion } from "framer-motion";
import { Sparkles, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyFeed({
  title = "No prompts found",
  description = "Upload your first AI prompt and start building the feed.",
  actionLabel = "Upload Prompt",
  actionTo = "/add-prompt",
  onAction,
}) {
  return (
    <motion.section
      className="feed-empty"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      role="status"
      aria-live="polite"
    >
      <div className="feed-empty__icon">
        <Sparkles size={40} strokeWidth={1.75} />
      </div>

      <h2 className="feed-empty__title">{title}</h2>

      <p className="feed-empty__description">
        {description}
      </p>

      {typeof onAction === "function" ? (
        <button
          type="button"
          className="feed-empty__button"
          onClick={onAction}
        >
          <X size={18} />
          <span>{actionLabel}</span>
        </button>
      ) : (
        <Link
          to={actionTo}
          className="feed-empty__button"
        >
          <Plus size={18} />
          <span>{actionLabel}</span>
        </Link>
      )}
    </motion.section>
  );
}