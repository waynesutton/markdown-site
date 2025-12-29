import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import {
  ArrowLeft,
  Users,
  Eye,
  FileText,
  BookOpen,
  Activity,
} from "lucide-react";
import { GithubLogo, Spinner } from "@phosphor-icons/react";
import VisitorMap from "../components/VisitorMap";
import siteConfig from "../config/siteConfig";

// Site launched Dec 14, 2025 at 1:00 PM (v1.0.0), stats added same day (v1.2.0)
const SITE_LAUNCH_DATE = "Dec 14, 2025 at 1:00 PM";

// Format tracking start date with time
function formatTrackingDate(timestamp: number | null): string {
  if (!timestamp) return "No data yet";
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dateStr} at ${timeStr}`;
}

export default function Stats() {
  const navigate = useNavigate();
  const stats = useQuery(api.stats.getStats);

  // Check if stats page is enabled
  if (!siteConfig.statsPage?.enabled) {
    return (
      <div className="stats-page-wide">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
            Site Statistics
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Stats page is disabled in site configuration.
          </p>
          <Link
            to="/"
            style={{
              color: "var(--link-color)",
              textDecoration: "underline",
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // GitHub stars state
  const [githubStars, setGithubStars] = useState<number | null>(null);

  // Fetch GitHub stars on mount
  useEffect(() => {
    fetch("https://api.github.com/repos/waynesutton/markdown-site")
      .then((res) => res.json())
      .then((data) => setGithubStars(data.stargazers_count))
      .catch(() => setGithubStars(null));
  }, []);

  // Show loading spinner while stats load
  if (stats === undefined) {
    return (
      <div className="stats-page-wide">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Spinner size={32} className="spinner-icon" />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Loading statistics...
          </p>
        </div>
      </div>
    );
  }

  // Stats card configuration with numbered sections
  const statsCards = [
    {
      number: "01",
      icon: Activity,
      title: "Active Now",
      value: stats.activeVisitors,
      description: "Visitors on site",
    },
    {
      number: "02",
      icon: Eye,
      title: "Total Views",
      value: stats.totalPageViews,
      description: `Since ${formatTrackingDate(stats.trackingSince)}`,
      note: `Site launched ${SITE_LAUNCH_DATE}`,
    },
    {
      number: "03",
      icon: Users,
      title: "Unique Visitors",
      value: stats.uniqueVisitors,
      description: "Unique sessions",
    },
    {
      number: "04",
      icon: GithubLogo,
      title: "GitHub Stars",
      value: githubStars ?? "...",
      description: "waynesutton/markdown-site",
    },
    {
      number: "05",
      icon: BookOpen,
      title: "Blog Posts",
      value: stats.publishedPosts,
      description: "Published posts",
    },
    {
      number: "06",
      icon: FileText,
      title: "Pages",
      value: stats.publishedPages,
      description: "Static pages",
    },
  ];

  return (
    <div className="stats-page-wide">
      {/* Header with back button */}
      <nav className="stats-nav-wide">
        <button onClick={() => navigate("/")} className="back-button">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </nav>

      {/* Page header */}
      <header className="stats-header-wide">
        <h1 className="stats-title-wide">Site Statistics</h1>
        <p className="stats-subtitle-wide">
          Real-time analytics for this site. All data updates automatically.
        </p>
      </header>

      {/* Modern horizontal stats cards */}
      <section className="stats-cards-modern">
        {statsCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div key={card.number} className="stat-card-modern">
              <div className="stat-card-modern-header">
                <div className="stat-card-modern-icon">
                  <IconComponent size={16} />
                </div>
                <span className="stat-card-modern-number">{card.number}</span>
              </div>
              <div className="stat-card-modern-content">
                <h3 className="stat-card-modern-title">{card.title}</h3>
                <p className="stat-card-modern-value">{card.value}</p>
                <p className="stat-card-modern-desc">{card.description}</p>
                {card.note && (
                  <p className="stat-card-modern-note">{card.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Visitor map showing real-time locations */}
      {siteConfig.visitorMap.enabled && stats.visitorLocations.length > 0 && (
        <VisitorMap
          locations={stats.visitorLocations}
          title={siteConfig.visitorMap.title}
        />
      )}

      {/* Active visitors by page */}
      {stats.activeByPath.length > 0 && (
        <section className="stats-section-wide">
          <h2 className="stats-section-title-wide">Currently Viewing</h2>
          <div className="stats-list-wide">
            {stats.activeByPath.map((item) => (
              <div key={item.path} className="stats-list-item-wide">
                <span className="stats-list-path-wide">
                  {item.path === "/" ? "Home" : item.path}
                </span>
                <span className="stats-list-count-wide">
                  {item.count} {item.count === 1 ? "visitor" : "visitors"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Page views by page */}
      {stats.pageStats.length > 0 && (
        <section className="stats-section-wide">
          <h2 className="stats-section-title-wide">Views by Page</h2>
          <div className="stats-list-wide">
            {stats.pageStats.map((item) => (
              <div key={item.path} className="stats-list-item-wide">
                <div className="stats-list-info-wide">
                  <span className="stats-list-title-wide">{item.title}</span>
                  <span className="stats-list-type-wide">{item.pageType}</span>
                </div>
                <span className="stats-list-count-wide">
                  {item.views} {item.views === 1 ? "view" : "views"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
