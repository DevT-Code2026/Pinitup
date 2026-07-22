import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, Sparkles } from "lucide-react";

export default function WelcomeSection({
  userName = "Creator",
  totalPrompts = 0,
}) {
  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <motion.section
      className="dashboard-welcome"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="dashboard-welcome__content">
        <div className="dashboard-welcome__badge">
          <Sparkles size={16} />
          <span>Pinitup Workspace</span>
        </div>

        <h1 className="dashboard-welcome__title">
          {greeting()}, {userName} 👋
        </h1>

        <p className="dashboard-welcome__description">
          Discover, organize and share AI prompts from one modern workspace.
          Your library currently contains{" "}
          <strong>{totalPrompts}</strong>{" "}
          prompt{totalPrompts !== 1 ? "s" : ""}.
        </p>

        <div className="dashboard-welcome__actions">
          <Link
            to="/add-prompt"
            className="dashboard-button dashboard-button--primary"
          >
            <Plus size={18} />
            <span>Upload Prompt</span>
          </Link>

          <Link
            to="/"
            className="dashboard-button dashboard-button--secondary"
          >
            <span>Explore Feed</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div
        className="dashboard-welcome__visual"
        aria-hidden="true"
      >
        <div className="dashboard-orb dashboard-orb--primary" />
        <div className="dashboard-orb dashboard-orb--secondary" />
        <div className="dashboard-grid-glow" />
      </div>
    </motion.section>
  );
}