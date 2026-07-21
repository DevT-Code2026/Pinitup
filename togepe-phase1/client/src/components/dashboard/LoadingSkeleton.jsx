import { motion } from "framer-motion";

const skeletonItems = Array.from({ length: 6 });

export default function LoadingSkeleton() {
  return (
    <section
      className="dashboard-loading"
      aria-label="Loading dashboard content"
      aria-busy="true"
    >
      <div className="dashboard-loading__hero shimmer" />

      <div className="dashboard-loading__stats">
        {[1, 2, 3, 4].map((item) => (
          <motion.div
            key={item}
            className="dashboard-loading__stat shimmer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: item * 0.08,
            }}
          />
        ))}
      </div>

      <div className="dashboard-loading__section">
        <div className="dashboard-loading__heading shimmer" />

        <div className="dashboard-loading__grid">
          {skeletonItems.map((item) => (
            <motion.article
              key={item}
              className="dashboard-loading__card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: item * 0.05,
              }}
            >
              <div className="dashboard-loading__image shimmer" />

              <div className="dashboard-loading__content">
                <div className="dashboard-loading__title shimmer" />
                <div className="dashboard-loading__text shimmer" />
                <div className="dashboard-loading__text dashboard-loading__text--short shimmer" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}