import { motion } from "framer-motion";

const skeletonCards = Array.from({ length: 8 });

const skeletonChips = Array.from({ length: 5 });

export default function FeedSkeleton() {
  return (
    <section
      className="feed-loading"
      aria-label="Loading feed"
      aria-busy="true"
    >
      <div className="feed-loading__toolbar">
        <div className="feed-loading__search shimmer" />

        <div className="feed-loading__chips">
          {skeletonChips.map((_, index) => (
            <motion.div
              key={index}
              className="feed-loading__chip shimmer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.35,
                delay: index * 0.05,
              }}
            />
          ))}
        </div>
      </div>

      <div className="feed-loading__grid">
        {skeletonCards.map((_, index) => (
          <motion.article
            key={index}
            className="feed-loading__card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: index * 0.05,
            }}
          >
            <div className="feed-loading__image shimmer" />

            <div className="feed-loading__content">
              <div className="feed-loading__title shimmer" />
              <div className="feed-loading__text shimmer" />
              <div className="feed-loading__text feed-loading__text--short shimmer" />
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}