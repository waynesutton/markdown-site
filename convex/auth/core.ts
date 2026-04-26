import { createAuthContext } from "@robelest/convex-auth/core";
import { components } from "../_generated/api";

export const auth = createAuthContext(components.auth);
