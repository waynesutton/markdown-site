/// <reference types="vite/client" />
import type { TestConvex } from "convex-test";
import type { GenericSchema, SchemaDefinition } from "convex/server";
import schema from "./component/schema.js";
const modules = import.meta.glob("./component/**/*.ts");

/**
 * Register the Virtual FS component with a test convex instance.
 *
 * Usage:
 * ```typescript
 * import { convexTest } from "convex-test";
 * import { register } from "@convex-dev/virtual-fs/test";
 * import schema from "./schema.js";
 *
 * const modules = import.meta.glob("./**\/*.ts");
 *
 * test("my test", async () => {
 *   const t = convexTest(schema, modules);
 *   register(t, "virtualFs");
 *   // ... your test code
 * });
 * ```
 *
 * @param t - The test convex instance from `convexTest()`.
 * @param name - The component name as registered in your convex.config.ts.
 *               Defaults to "virtualFs".
 */
export function register(
  t: TestConvex<SchemaDefinition<GenericSchema, boolean>>,
  name: string = "virtualFs",
) {
  t.registerComponent(name, schema, modules);
}

export default { register, schema, modules };
