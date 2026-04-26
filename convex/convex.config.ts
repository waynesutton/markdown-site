import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config.js";
import persistentTextStreaming from "@convex-dev/persistent-text-streaming/convex.config";
import convexAuth from "@robelest/convex-auth/convex.config";
import selfHosting from "@convex-dev/self-hosting/convex.config";
import r2 from "@convex-dev/r2/convex.config";
import fs from "convex-fs/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp();

// Aggregate component for efficient page view counts (O(log n) instead of O(n))
app.use(aggregate, { name: "pageViewsByPath" });

// Aggregate component for total page views count
app.use(aggregate, { name: "totalPageViews" });

// Aggregate component for unique visitors count
app.use(aggregate, { name: "uniqueVisitors" });

// Aggregate component for unique paths (tracks distinct pages that have been viewed)
app.use(aggregate, { name: "uniquePaths" });

// Persistent text streaming for real-time AI responses in Ask AI feature
app.use(persistentTextStreaming);

// Robelest Convex Auth component (default auth mode)
app.use(convexAuth);

// Convex static self-hosting component (default hosting mode)
app.use(selfHosting);

// Optional Cloudflare R2 component for media uploads
app.use(r2);

// ConvexFS for file storage with Bunny CDN
app.use(fs);

// Rate limiter component for application-level rate limiting
app.use(rateLimiter);

export default app;

