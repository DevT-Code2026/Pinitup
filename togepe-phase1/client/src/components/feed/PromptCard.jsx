import { motion } from "framer-motion";
import { CalendarDays, Tag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PromptCard({ prompt, index = 0, href, onClick }) {
  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isInteractive = Boolean(href || onClick);

  const handleKeyDown = (e) => {
    if (!onClick) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(e);
    }
  };

  const cardBody = (
    <>
      <div className="feed-prompt-card__image-wrapper">
        {prompt.mediaUrl ? (
          <img
            src={prompt.mediaUrl}
            alt={prompt.title || "Prompt"}
            className="feed-prompt-card__image"
            loading="lazy"
          />
        ) : (
          <div className="feed-prompt-card__placeholder">
            <Tag size={28} />
          </div>
        )}
      </div>

      <div className="feed-prompt-card__body">
        <div className="feed-prompt-card__top">
          <span className="feed-prompt-card__category">
            {prompt.category || "General"}
          </span>

          <span className="feed-prompt-card__date">
            <CalendarDays size={14} />
            {formatDate(prompt.createdAt)}
          </span>
        </div>

        <h3 className="feed-prompt-card__title">
          {prompt.title || "Untitled Prompt"}
        </h3>

        <p className="feed-prompt-card__description">
          {prompt.description || "No description available."}
        </p>

        {Array.isArray(prompt.tags) && prompt.tags.length > 0 && (
          <div className="feed-prompt-card__tags">
            {prompt.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="feed-prompt-card__tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {isInteractive && (
          <div className="feed-prompt-card__footer">
            <span className="feed-prompt-card__action">
              View Details
              <ArrowRight size={16} />
            </span>
          </div>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <motion.article
        className="feed-prompt-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link to={href} className="feed-prompt-card__link">
          {cardBody}
        </Link>
      </motion.article>
    );
  }

  if (onClick) {
    return (
      <motion.article
        className="feed-prompt-card feed-prompt-card--clickable"
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        {cardBody}
      </motion.article>
    );
  }

  return (
    <motion.article
      className="feed-prompt-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {cardBody}
    </motion.article>
  );
}