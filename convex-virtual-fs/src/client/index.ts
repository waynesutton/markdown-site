import type {
  GenericActionCtx,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import type { ComponentApi } from "../component/_generated/component.js";

type MutationCtx = Pick<
  GenericMutationCtx<GenericDataModel>,
  "runMutation" | "runQuery"
>;
type QueryCtx = Pick<GenericQueryCtx<GenericDataModel>, "runQuery">;
type ActionCtx = Pick<
  GenericActionCtx<GenericDataModel>,
  "runQuery" | "runMutation" | "runAction"
>;
type AnyCtx = MutationCtx | QueryCtx | ActionCtx;

export type VirtualFsFile = {
  path: string;
  title: string;
  content: string;
  contentType?: string;
  metadata?: unknown;
};

export type CommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

/**
 * Client wrapper for the Virtual FS component.
 *
 * Usage:
 * ```typescript
 * import { VirtualFs } from "@convex-dev/virtual-fs";
 * import { components } from "./_generated/api.js";
 *
 * const vfs = new VirtualFs(components.virtualFs);
 *
 * // In a mutation:
 * await vfs.upsert(ctx, {
 *   path: "/blog/my-post.md",
 *   title: "My Post",
 *   content: "# Hello world",
 * });
 *
 * // In a query:
 * const result = await vfs.exec(ctx, "ls /blog");
 * ```
 */
export class VirtualFs {
  constructor(public component: ComponentApi) {}

  /**
   * Upsert a file at the given path. Creates if new, replaces if exists.
   */
  async upsert(
    ctx: MutationCtx | ActionCtx,
    file: VirtualFsFile,
  ): Promise<void> {
    await ctx.runMutation(this.component.files.upsert, {
      path: file.path,
      title: file.title,
      content: file.content,
      contentType: file.contentType,
      metadata: file.metadata,
    });
  }

  /**
   * Batch upsert multiple files in a single transaction.
   * Returns the number of files upserted.
   */
  async batchUpsert(
    ctx: MutationCtx | ActionCtx,
    files: Array<VirtualFsFile>,
  ): Promise<number> {
    const result: number = await ctx.runMutation(
      this.component.files.batchUpsert,
      {
        files: files.map((f) => ({
          path: f.path,
          title: f.title,
          content: f.content,
          contentType: f.contentType,
          metadata: f.metadata,
        })),
      },
    );
    return result;
  }

  /**
   * Remove a file by path. Returns true if the file existed.
   */
  async remove(ctx: MutationCtx | ActionCtx, path: string): Promise<boolean> {
    const result: boolean = await ctx.runMutation(this.component.files.remove, {
      path,
    });
    return result;
  }

  /**
   * Remove all files under a directory prefix.
   * Returns the number of files removed.
   */
  async removeDir(
    ctx: MutationCtx | ActionCtx,
    prefix: string,
  ): Promise<number> {
    const result: number = await ctx.runMutation(
      this.component.files.removeDir,
      { prefix },
    );
    return result;
  }

  /**
   * Get a file by exact path. Returns null if not found.
   */
  async get(
    ctx: AnyCtx,
    path: string,
  ): Promise<VirtualFsFile | null> {
    const result = await ctx.runQuery(this.component.files.get, { path });
    if (!result) return null;
    return result as VirtualFsFile;
  }

  /**
   * Count the total number of files.
   */
  async count(ctx: AnyCtx): Promise<number> {
    const result: number = await ctx.runQuery(this.component.files.count, {});
    return result;
  }

  /**
   * Execute a shell command against the virtual filesystem.
   *
   * Supported commands: ls, cat, head, tail, grep, find, tree, wc, stat, pwd, cd, echo, help
   */
  async exec(
    ctx: AnyCtx,
    command: string,
    cwd?: string,
  ): Promise<CommandResult> {
    const result: CommandResult = await ctx.runQuery(
      this.component.shell.executeCommand,
      { command, cwd },
    );
    return result;
  }

  /**
   * Get the full directory tree as structured data.
   */
  async tree(
    ctx: AnyCtx,
  ): Promise<
    Array<{
      name: string;
      path: string;
      type: "file" | "dir";
      size?: number;
      title?: string;
    }>
  > {
    const result = await ctx.runQuery(
      this.component.shell.buildPathTree,
      {},
    );
    return result as Array<{
      name: string;
      path: string;
      type: "file" | "dir";
      size?: number;
      title?: string;
    }>;
  }
}
