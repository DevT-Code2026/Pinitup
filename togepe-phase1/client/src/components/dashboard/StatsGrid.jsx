import {
  FileText,
  FolderKanban,
  TrendingUp,
  Clock3,
} from "lucide-react";

import StatCard from "./StatCard";

export default function StatsGrid({
  totalPrompts = 0,
  totalCategories = 0,
  trendingCount = 0,
  latestUpload = "—",
}) {
  const stats = [
    {
      title: "Total Prompts",
      value: totalPrompts,
      subtitle: "Available in your workspace",
      icon: FileText,
      trend: "up",
      trendLabel: "Growing",
    },
    {
      title: "Categories",
      value: totalCategories,
      subtitle: "Prompt collections",
      icon: FolderKanban,
      trend: "neutral",
      trendLabel: "Organized",
    },
    {
      title: "Trending",
      value: trendingCount,
      subtitle: "Popular prompts",
      icon: TrendingUp,
      trend: "up",
      trendLabel: "Active",
    },
    {
      title: "Latest Upload",
      value: latestUpload,
      subtitle: "Most recent contribution",
      icon: Clock3,
      trend: "neutral",
      trendLabel: "Updated",
    },
  ];

  return (
    <section
      className="dashboard-stats"
      aria-labelledby="dashboard-stats-heading"
    >
      <div className="dashboard-section__header">
        <div>
          <h2
            id="dashboard-stats-heading"
            className="dashboard-section__title"
          >
            Workspace Overview
          </h2>

          <p className="dashboard-section__subtitle">
            A quick summary of your prompt library.
          </p>
        </div>
      </div>

      <div className="dashboard-stats__grid">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            trend={stat.trend}
            trendLabel={stat.trendLabel}
            delay={index * 0.08}
          />
        ))}
      </div>
    </section>
  );
}