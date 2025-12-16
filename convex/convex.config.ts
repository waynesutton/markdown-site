import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();

// Aggregate for total page views count
app.use(aggregate, { name: "pageViewsTotal" });

// Aggregate for page views grouped by path
app.use(aggregate, { name: "pageViewsByPath" });

// Aggregate for unique visitors (by sessionId)
app.use(aggregate, { name: "uniqueVisitors" });

export default app;

