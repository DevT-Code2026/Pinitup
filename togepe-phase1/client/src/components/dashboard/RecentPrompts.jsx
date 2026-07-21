import { motion } from "framer-motion";
import { CalendarDays, Tag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function RecentPrompts({
  prompts = [],
  limit = 6,
}) {
  const recentPrompts = [...prompts]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, limit);

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section
      className="dashboard-section"
      aria-labelledby="recent-prompts-heading"
    >
      <div className="dashboard-section__header">
        <div>
          <h2
            id="recent-prompts-heading"
            className="dashboard-section__title"
          >
            Recent Prompts
          </h2>

          <p className="dashboard-section__subtitle">
            Newly uploaded prompts from your workspace.
          </p>
        </div>

        <Link
          to="/feed"
          className="dashboard-section__link"
        >
          View All
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="dashboard-prompts-grid">
        {recentPrompts.map((prompt, index) => (
          <motion.article
            key={prompt._id}
            className="prompt-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
          >
            <div className="prompt-card__image-wrapper">
              {prompt.mediaUrl ? (
                <img
                  src={prompt.mediaUrl}
                  alt={prompt.title || "Prompt"}
                  className="prompt-card__image"
                  loading="lazy"
                />
              ) : (
                <div className="prompt-card__placeholder">
                  <Tag size={28} />
                </div>
              )}
            </div>

            <div className="prompt-card__body">
              <div className="prompt-card__top">
                <span className="prompt-card__category">
                  {prompt.category || "General"}
                </span>

                <span className="prompt-card__date">
                  <CalendarDays size={14} />
                  {formatDate(prompt.createdAt)}
                </span>
              </div>

              <h3 className="prompt-card__title">
                {prompt.title || "Untitled Prompt"}
              </h3>

              <p className="prompt-card__description">
                {prompt.description ||
                  "No description available."}
              </p>

              {Array.isArray(prompt.tags) &&
                prompt.tags.length > 0 && (
                  <div className="prompt-card__tags">
                    {prompt.tags
                      .slice(0, 3)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="prompt-card__tag"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                )}

              <div className="prompt-card__footer">
                <Link
                  to={`/prompt/${prompt._id}`}
                  className="prompt-card__action"
                >
                  View Details
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}