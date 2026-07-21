import { motion } from "framer-motion";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load your dashboard right now. Please try again.",
  onRetry,
}) {
  return (
    <motion.section
      className="dashboard-error"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      role="alert"
      aria-live="assertive"
    >
      <div className="dashboard-error__icon">
        <AlertTriangle size={42} strokeWidth={1.75} />
      </div>

      <div className="dashboard-error__content">
        <h2 className="dashboard-error__title">
          {title}
        </h2>

        <p className="dashboard-error__message">
          {message}
        </p>
      </div>

      {typeof onRetry === "function" && (
        <button
          type="button"
          className="dashboard-error__button"
          onClick={onRetry}
        >
          <RotateCw size={18} />
          <span>Retry</span>
        </button>
      )}
    </motion.section>
  );
}