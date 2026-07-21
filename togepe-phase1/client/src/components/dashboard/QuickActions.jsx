import { motion } from "framer-motion";
import {
  PlusCircle,
  Compass,
  RefreshCw,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickActions({
  onRefresh,
  isRefreshing = false,
}) {
  const actions = [
    {
      title: "Upload Prompt",
      description: "Add a new AI prompt to your workspace.",
      icon: PlusCircle,
      to: "/add-prompt",
      variant: "primary",
    },
    {
      title: "Explore Feed",
      description: "Browse prompts shared by the community.",
      icon: Compass,
      to: "/feed",
      variant: "secondary",
    },
    {
      title: "Dashboard",
      description: "Return to your workspace overview.",
      icon: LayoutDashboard,
      to: "/dashboard",
      variant: "secondary",
    },
  ];

  return (
    <section
      className="dashboard-section"
      aria-labelledby="quick-actions-heading"
    >
      <div className="dashboard-section__header">
        <div>
          <h2
            id="quick-actions-heading"
            className="dashboard-section__title"
          >
            Quick Actions
          </h2>

          <p className="dashboard-section__subtitle">
            Frequently used actions for managing your prompts.
          </p>
        </div>
      </div>

      <div className="dashboard-actions">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.div
              key={action.title}
              className="dashboard-action"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: index * 0.08,
              }}
            >
              <Link
                to={action.to}
                className={`dashboard-action__card dashboard-action__card--${action.variant}`}
              >
                <div className="dashboard-action__icon">
                  <Icon size={22} strokeWidth={1.8} />
                </div>

                <div className="dashboard-action__content">
                  <h3 className="dashboard-action__title">
                    {action.title}
                  </h3>

                  <p className="dashboard-action__description">
                    {action.description}
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  className="dashboard-action__arrow"
                />
              </Link>
            </motion.div>
          );
        })}

        <motion.button
          type="button"
          className="dashboard-action__card dashboard-action__card--refresh"
          onClick={onRefresh}
          disabled={isRefreshing}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: actions.length * 0.08,
          }}
        >
          <div className="dashboard-action__icon">
            <RefreshCw
              size={22}
              strokeWidth={1.8}
              className={
                isRefreshing
                  ? "dashboard-action__spin"
                  : ""
              }
            />
          </div>

          <div className="dashboard-action__content">
            <h3 className="dashboard-action__title">
              Refresh Dashboard
            </h3>

            <p className="dashboard-action__description">
              Reload the latest prompts and statistics.
            </p>
          </div>

          <ArrowRight
            size={18}
            className="dashboard-action__arrow"
          />
        </motion.button>
      </div>
    </section>
  );
}