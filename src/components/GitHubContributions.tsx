// GitHub contributions graph component
// Fetches and displays contribution data with theme-aware colors

import { useState, useEffect, useCallback } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { GitHubContributionsConfig } from "../config/siteConfig";

// Contribution data structure from the API
interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionWeek {
  days: ContributionDay[];
}

interface APIResponse {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

interface GitHubContributionsProps {
  config: GitHubContributionsConfig;
}

// Month labels for the graph header
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Day labels for the left side
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function GitHubContributions({
  config,
}: GitHubContributionsProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contributions from the API
  const fetchContributions = useCallback(async () => {
    if (!config.enabled || !config.username) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${config.username}?y=${year}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch contributions");
      }

      const data: APIResponse = await response.json();
      setContributions(data.contributions || []);
      setTotalContributions(data.total?.[year.toString()] || 0);
    } catch {
      setError("Unable to load GitHub contributions");
      setContributions([]);
      setTotalContributions(0);
    } finally {
      setLoading(false);
    }
  }, [config.enabled, config.username, year]);

  // Fetch on mount and when year changes
  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  // Don't render if disabled
  if (!config.enabled) return null;

  // Navigate to previous year
  const goToPreviousYear = () => {
    if (year > currentYear - 10) {
      setYear((y) => y - 1);
    }
  };

  // Navigate to next year
  const goToNextYear = () => {
    if (year < currentYear) {
      setYear((y) => y + 1);
    }
  };

  // Group contributions into weeks for grid display
  const getWeeks = (): ContributionWeek[] => {
    if (contributions.length === 0) return [];

    const weeks: ContributionWeek[] = [];
    let currentWeek: ContributionDay[] = [];

    // Get the first day of the year to determine padding
    const firstDay = new Date(year, 0, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Add empty days for alignment
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ date: "", count: 0, level: 0 });
    }

    // Add all contribution days
    for (const day of contributions) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push({ days: currentWeek });
        currentWeek = [];
      }
    }

    // Add remaining days to last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "", count: 0, level: 0 });
      }
      weeks.push({ days: currentWeek });
    }

    return weeks;
  };

  // Calculate month label positions
  const getMonthLabels = () => {
    const weeks = getWeeks();
    const labels: { month: string; position: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.days.find((d) => d.date);
      if (firstValidDay) {
        const date = new Date(firstValidDay.date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({ month: MONTHS[month], position: weekIndex });
          lastMonth = month;
        }
      }
    });

    return labels;
  };

  const weeks = getWeeks();
  const monthLabels = getMonthLabels();
  const profileUrl = `https://github.com/${config.username}`;

  // Render the contribution grid
  const renderGrid = () => (
    <div className="github-contributions-graph">
      {/* Month labels */}
      <div className="github-contributions-months">
        <div className="github-contributions-day-spacer" />
        <div className="github-contributions-month-labels">
          {monthLabels.map(({ month, position }, index) => (
            <span
              key={`${month}-${index}`}
              className="github-contributions-month"
              style={{
                gridColumnStart: position + 1,
              }}
            >
              {month}
            </span>
          ))}
        </div>
      </div>

      {/* Grid with day labels */}
      <div className="github-contributions-body">
        {/* Day labels column */}
        <div className="github-contributions-days">
          {DAYS.map((day, index) => (
            <span key={index} className="github-contributions-day-label">
              {day}
            </span>
          ))}
        </div>

        {/* Contribution cells grid */}
        <div
          className="github-contributions-grid"
          style={{
            gridTemplateColumns: `repeat(${weeks.length}, 1fr)`,
          }}
        >
          {weeks.map((week, weekIndex) =>
            week.days.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className="github-contribution-cell"
                data-level={day.date ? day.level : "empty"}
                title={
                  day.date
                    ? `${day.count} contribution${day.count !== 1 ? "s" : ""} on ${day.date}`
                    : ""
                }
              />
            )),
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="github-contributions-legend">
        <span className="github-contributions-legend-label">Less</span>
        <div className="github-contribution-cell" data-level="0" />
        <div className="github-contribution-cell" data-level="1" />
        <div className="github-contribution-cell" data-level="2" />
        <div className="github-contribution-cell" data-level="3" />
        <div className="github-contribution-cell" data-level="4" />
        <span className="github-contributions-legend-label">More</span>
      </div>
    </div>
  );

  return (
    <div className="github-contributions-container">
      {/* Header with title and year navigation */}
      <div className="github-contributions-header">
        <div className="github-contributions-header-left">
          {config.title && (
            <span className="github-contributions-title">{config.title}</span>
          )}
          <span className="github-contributions-count">
            {loading
              ? "Loading..."
              : error
                ? ""
                : `${totalContributions.toLocaleString()} contributions in ${year}`}
          </span>
        </div>

        {config.showYearNavigation && (
          <div className="github-contributions-nav">
            <button
              onClick={goToPreviousYear}
              disabled={year <= currentYear - 10}
              className="github-nav-button"
              aria-label="Previous year"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            <span className="github-year">{year}</span>
            <button
              onClick={goToNextYear}
              disabled={year >= currentYear}
              className="github-nav-button"
              aria-label="Next year"
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {/* Contribution grid - optionally wrapped in a link */}
      {error ? (
        <div className="github-contributions-error">{error}</div>
      ) : config.linkToProfile ? (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="github-contributions-link"
          aria-label={`View ${config.username}'s GitHub profile`}
        >
          {renderGrid()}
        </a>
      ) : (
        renderGrid()
      )}
    </div>
  );
}

