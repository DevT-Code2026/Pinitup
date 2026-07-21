import { motion } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({
  title = "No prompts found",
  description = "Upload your first AI prompt and start building your collection.",
  actionLabel = "Upload Prompt",
  actionTo = "/add-prompt",
}) {
  return (
    <motion.section
      className="dashboard-empty"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      role="status"
      aria-live="polite"
    >
      <div className="dashboard-empty__icon">
        <Sparkles size={40} strokeWidth={1.75} />
      </div>

      <h2 className="dashboard-empty__title">{title}</h2>

      <p className="dashboard-empty__description">
        {description}
      </p>

      <Link
        to={actionTo}
        className="dashboard-empty__button"
      >
        <Plus size={18} />
        <span>{actionLabel}</span>
      </Link>
    </motion.section>
  );
}