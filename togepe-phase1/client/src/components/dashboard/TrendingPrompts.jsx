import { motion } from "framer-motion";
import {
  Flame,
  Heart,
  Share2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TrendingPrompts({
  prompts = [],
  limit = 5,
}) {
  const trendingPrompts = [...prompts]
    .sort(
      (a, b) =>
        (b.likesCount || 0) - (a.likesCount || 0)
    )
    .slice(0, limit);

  return (
    <section
      className="dashboard-section"
      aria-labelledby="trending-prompts-heading"
    >
      <div className="dashboard-section__header">
        <div>
          <h2
            id="trending-prompts-heading"
            className="dashboard-section__title"
          >
            Trending Prompts
          </h2>

          <p className="dashboard-section__subtitle">
            Most popular prompts based on community engagement.
          </p>
        </div>

        <Link
          to="/feed"
          className="dashboard-section__link"
        >
          Explore Feed
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="dashboard-trending">
        {trendingPrompts.map((prompt, index) => (
          <motion.article
            key={prompt._id}
            className="trending-card"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.35,
              delay: index * 0.06,
            }}
          >
            <div className="trending-card__rank">
              <Flame size={18} />
              <span>#{index + 1}</span>
            </div>

            <div className="trending-card__content">
              <h3 className="trending-card__title">
                {prompt.title || "Untitled Prompt"}
              </h3>

              <p className="trending-card__description">
                {prompt.description ||
                  "No description available."}
              </p>

              <div className="trending-card__meta">
                <span className="trending-card__category">
                  {prompt.category || "General"}
                </span>

                <div className="trending-card__stats">
                  <span className="trending-card__stat">
                    <Heart size={14} />
                    {prompt.likesCount || 0}
                  </span>

                  <span className="trending-card__stat">
                    <Share2 size={14} />
                    {prompt.sharesCount || 0}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to={`/prompt/${prompt._id}`}
              className="trending-card__action"
              aria-label={`Open ${prompt.title}`}
            >
              <ArrowRight size={18} />
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}