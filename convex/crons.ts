import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up stale sessions every 5 minutes
crons.interval(
  "cleanup stale sessions",
  { minutes: 5 },
  internal.stats.cleanupStaleSessions,
  {}
);

// Weekly digest: Send every Sunday at 9:00 AM UTC
// Posts from the last 7 days are included
// To disable, set weeklyDigest.enabled: false in siteConfig.ts
crons.cron(
  "weekly newsletter digest",
  "0 9 * * 0", // 9:00 AM UTC on Sundays
  internal.newsletterActions.sendWeeklyDigest,
  {
    siteUrl: process.env.SITE_URL || "https://example.com",
    siteName: process.env.SITE_NAME || "Newsletter",
  }
);

// Weekly stats summary: Send every Monday at 9:00 AM UTC
// Includes subscriber count, new subscribers, newsletters sent
crons.cron(
  "weekly stats summary",
  "0 9 * * 1", // 9:00 AM UTC on Mondays
  internal.newsletterActions.sendWeeklyStatsSummary,
  {
    siteName: process.env.SITE_NAME || "Newsletter",
  }
);

// Clean up old content versions daily at 3:00 AM UTC
// Deletes versions older than 3 days to maintain storage efficiency
crons.cron(
  "cleanup old content versions",
  "0 3 * * *", // 3:00 AM UTC daily
  internal.versions.cleanupOldVersions,
  {}
);

// Wiki compilation: Run daily at 4:00 AM UTC
// Compiles content into wiki pages using LLM
// Requires OPENAI_API_KEY. Skips if a compilation is already running.
crons.cron(
  "wiki compilation",
  "0 4 * * *", // 4:00 AM UTC daily
  internal.wikiJobs.scheduledCompilation,
  {}
);

// Clean up anonymous demo content every 30 minutes
// Deletes all posts and pages with source="demo" created by anonymous dashboard visitors
crons.interval(
  "cleanup demo content",
  { minutes: 30 },
  internal.demo.cleanupDemoContent,
  {}
);

export default crons;

