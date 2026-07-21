import { motion } from "framer-motion";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function ErrorFeed({
  title = "Something went wrong",
  message = "We couldn't load the feed right now. Please try again.",
  onRetry,
}) {
  return (
    <motion.section
      className="feed-error"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      role="alert"
      aria-live="assertive"
    >
      <div className="feed-error__icon">
        <AlertTriangle size={42} strokeWidth={1.75} />
      </div>

      <div className="feed-error__content">
        <h2 className="feed-error__title">
          {title}
        </h2>

        <p className="feed-error__message">
          {message}
        </p>
      </div>

      {typeof onRetry === "function" && (
        <button
          type="button"
          className="feed-error__button"
          onClick={onRetry}
        >
          <RotateCw size={18} />
          <span>Retry</span>
        </button>
      )}
    </motion.section>
  );
}