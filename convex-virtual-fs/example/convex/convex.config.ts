import { defineApp } from "convex/server";
import virtualFs from "../../src/component/convex.config.js";

const app = defineApp();
app.use(virtualFs, { httpPrefix: "/vfs/" });
export default app;
