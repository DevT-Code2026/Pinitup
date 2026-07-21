import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  delay = 0,
}) {
  const renderTrendIcon = () => {
    if (trend === "up") {
      return <TrendingUp size={14} />;
    }

    if (trend === "down") {
      return <TrendingDown size={14} />;
    }

    return <Minus size={14} />;
  };

  return (
    <motion.article
      className="stat-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay,
      }}
    >
      <div className="stat-card__header">
        <div className="stat-card__icon">
          {Icon && <Icon size={22} strokeWidth={1.8} />}
        </div>

        {trendLabel && (
          <div
            className={`stat-card__trend stat-card__trend--${
              trend || "neutral"
            }`}
          >
            {renderTrendIcon()}
            <span>{trendLabel}</span>
          </div>
        )}
      </div>

      <div className="stat-card__body">
        <p className="stat-card__title">
          {title}
        </p>

        <h3 className="stat-card__value">
          {value}
        </h3>

        {subtitle && (
          <p className="stat-card__subtitle">
            {subtitle}
          </p>
        )}
      </div>
    </motion.article>
  );
}