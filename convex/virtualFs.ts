import { v } from "convex/values";
import { internalQuery, type QueryCtx } from "./_generated/server";

const MAX_GREP_RESULTS = 100;
const MAX_LS_ITEMS = 500;

const fileEntryValidator = v.object({
  name: v.string(),
  path: v.string(),
  type: v.union(v.literal("file"), v.literal("dir")),
  size: v.optional(v.number()),
  title: v.optional(v.string()),
});

type FileEntry = {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  title?: string;
};

const commandResultValidator = v.object({
  stdout: v.string(),
  stderr: v.string(),
  exitCode: v.number(),
});

export type CommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

function ok(stdout: string): CommandResult {
  return { stdout, stderr: "", exitCode: 0 };
}

function err(stderr: string, exitCode = 1): CommandResult {
  return { stdout: "", stderr, exitCode };
}

// --- Helper functions (shared transaction, no ctx.runQuery) ---

async function buildPathTreeHelper(ctx: QueryCtx): Promise<Array<FileEntry>> {
  const posts = await ctx.db
    .query("posts")
    .withIndex("by_published", (q) => q.eq("published", true))
    .take(MAX_LS_ITEMS);

  const pages = await ctx.db
    .query("pages")
    .withIndex("by_published", (q) => q.eq("published", true))
    .take(MAX_LS_ITEMS);

  const entries: Array<FileEntry> = [
    { name: "blog", path: "/blog", type: "dir" },
    { name: "pages", path: "/pages", type: "dir" },
    { name: "docs", path: "/docs", type: "dir" },
    { name: "index.md", path: "/index.md", type: "file", title: "Site index" },
  ];

  const sourceCheck = await ctx.db.query("sources").withIndex("by_ingestedat").take(1);
  if (sourceCheck.length > 0) {
    entries.push({ name: "sources", path: "/sources", type: "dir" });
  }

  const wikiCheck = await ctx.db.query("wikiPages").withIndex("by_lastcompiledat").take(1);
  if (wikiCheck.length > 0) {
    entries.push({ name: "wiki", path: "/wiki", type: "dir" });
  }

  for (const post of posts) {
    if (post.unlisted) continue;
    const dir = post.docsSection ? "/docs" : "/blog";
    entries.push({
      name: `${post.slug}.md`,
      path: `${dir}/${post.slug}.md`,
      type: "file",
      size: post.content.length,
      title: post.title,
    });
  }

  for (const page of pages) {
    entries.push({
      name: `${page.slug}.md`,
      path: `/pages/${page.slug}.md`,
      type: "file",
      size: page.content.length,
      title: page.title,
    });
  }

  return entries;
}

async function readFileHelper(
  ctx: QueryCtx,
  filePath: string,
): Promise<{ content: string; title: string; path: string } | null> {
  const p = filePath.replace(/^\/+/, "");

  if (p === "index.md" || p === "") {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(MAX_LS_ITEMS);
    const pages = await ctx.db
      .query("pages")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(MAX_LS_ITEMS);

    const lines: Array<string> = ["# Site index", ""];
    lines.push("## Blog posts", "");
    for (const post of posts) {
      if (post.unlisted) continue;
      lines.push(`- [${post.title}](/blog/${post.slug}.md)`);
    }
    lines.push("", "## Pages", "");
    for (const page of pages) {
      lines.push(`- [${page.title}](/pages/${page.slug}.md)`);
    }
    return { content: lines.join("\n"), title: "Site index", path: "/index.md" };
  }

  const segments = p.split("/");
  const dir = segments[0];
  const filename = segments.slice(1).join("/");
  const slug = filename.replace(/\.md$/, "");
  if (!slug) return null;

  if (dir === "blog" || dir === "docs") {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!post || !post.published) return null;

    const frontmatter = [
      "---",
      `title: "${post.title}"`,
      `date: ${post.date}`,
      `tags: [${post.tags.map((t: string) => `"${t}"`).join(", ")}]`,
      post.readTime ? `readTime: ${post.readTime}` : null,
      post.authorName ? `author: ${post.authorName}` : null,
      "---",
    ].filter(Boolean).join("\n");

    return {
      content: `${frontmatter}\n\n# ${post.title}\n\n${post.content}`,
      title: post.title,
      path: `/${dir}/${post.slug}.md`,
    };
  }

  if (dir === "pages") {
    const page = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!page || !page.published) return null;

    return {
      content: `---\ntitle: "${page.title}"\n---\n\n# ${page.title}\n\n${page.content}`,
      title: page.title,
      path: `/pages/${page.slug}.md`,
    };
  }

  if (dir === "sources") {
    const source = await ctx.db
      .query("sources")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!source) return null;
    return {
      content: `---\ntitle: "${source.title}"\ntype: ${source.sourceType}\n${source.url ? `url: ${source.url}\n` : ""}---\n\n# ${source.title}\n\n${source.content}`,
      title: source.title,
      path: `/sources/${source.slug}.md`,
    };
  }

  if (dir === "wiki") {
    const wikiPage = await ctx.db
      .query("wikiPages")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!wikiPage) return null;
    return {
      content: `---\ntitle: "${wikiPage.title}"\ntype: ${wikiPage.pageType}\n${wikiPage.category ? `category: ${wikiPage.category}\n` : ""}---\n\n# ${wikiPage.title}\n\n${wikiPage.content}`,
      title: wikiPage.title,
      path: `/wiki/${wikiPage.slug}.md`,
    };
  }

  return null;
}

async function grepContentHelper(
  ctx: QueryCtx,
  pattern: string,
  directory?: string,
): Promise<Array<{ path: string; title: string; matches: Array<string> }>> {
  const searchTerm = pattern.replace(/[.*+?^${}()|[\]\\]/g, " ").trim();
  if (!searchTerm) return [];

  const dir = directory?.replace(/^\/+/, "").replace(/\/+$/, "") || "";

  const results: Array<{ path: string; title: string; matches: Array<string> }> = [];
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, "gi");
  } catch {
    regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  }

  if (!dir || dir === "blog" || dir === "docs") {
    const postsByContent = await ctx.db
      .query("posts")
      .withSearchIndex("search_content", (q) =>
        q.search("content", searchTerm).eq("published", true),
      )
      .take(MAX_GREP_RESULTS);

    for (const post of postsByContent) {
      if (post.unlisted) continue;
      const matchLines = findMatchLines(post.content, regex);
      if (matchLines.length > 0) {
        const postDir = post.docsSection ? "docs" : "blog";
        results.push({
          path: `/${postDir}/${post.slug}.md`,
          title: post.title,
          matches: matchLines.slice(0, 5),
        });
      }
    }
  }

  if (!dir || dir === "pages") {
    const pagesByContent = await ctx.db
      .query("pages")
      .withSearchIndex("search_content", (q) =>
        q.search("content", searchTerm).eq("published", true),
      )
      .take(MAX_GREP_RESULTS);

    for (const page of pagesByContent) {
      const matchLines = findMatchLines(page.content, regex);
      if (matchLines.length > 0) {
        results.push({
          path: `/pages/${page.slug}.md`,
          title: page.title,
          matches: matchLines.slice(0, 5),
        });
      }
    }
  }

  return results.slice(0, MAX_GREP_RESULTS);
}

function findMatchLines(content: string, regex: RegExp): Array<string> {
  const lines = content.split("\n");
  const matches: Array<string> = [];
  for (const line of lines) {
    regex.lastIndex = 0;
    if (regex.test(line)) {
      matches.push(line.trim());
    }
  }
  return matches;
}

// --- Registered queries (thin wrappers around helpers) ---

export const buildPathTree = internalQuery({
  args: {},
  returns: v.array(fileEntryValidator),
  handler: async (ctx): Promise<Array<FileEntry>> => {
    return await buildPathTreeHelper(ctx);
  },
});

export const readFile = internalQuery({
  args: { path: v.string() },
  returns: v.union(
    v.object({
      content: v.string(),
      title: v.string(),
      path: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await readFileHelper(ctx, args.path);
  },
});

export const grepContent = internalQuery({
  args: {
    pattern: v.string(),
    directory: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      path: v.string(),
      title: v.string(),
      matches: v.array(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    return await grepContentHelper(ctx, args.pattern, args.directory);
  },
});

// Execute a virtual shell command using helper functions (shared transaction)
export const executeCommand = internalQuery({
  args: {
    command: v.string(),
    cwd: v.optional(v.string()),
  },
  returns: commandResultValidator,
  handler: async (ctx, args): Promise<CommandResult> => {
    const parts = parseCommand(args.command.trim());
    if (parts.length === 0) return err("empty command");

    const cmd = parts[0];
    const cmdArgs = parts.slice(1);
    const cwd = (args.cwd || "/").replace(/\/+$/, "") || "/";

    switch (cmd) {
      case "ls": {
        const target = resolvePath(cwd, cmdArgs[0] || ".");
        const tree = await buildPathTreeHelper(ctx);
        const entries = listDirectory(tree, target);
        if (entries === null) return err(`ls: ${target}: No such file or directory`);
        return ok(entries.map((e) => e.name).join("\n"));
      }

      case "cat": {
        if (cmdArgs.length === 0) return err("cat: missing operand");
        const filePath = resolvePath(cwd, cmdArgs[0]);
        const file = await readFileHelper(ctx, filePath);
        if (!file) return err(`cat: ${filePath}: No such file or directory`);
        return ok(file.content);
      }

      case "grep": {
        if (cmdArgs.length === 0) return err("grep: missing pattern");
        const pattern = cmdArgs[0];
        const grepDir = cmdArgs[1] || cwd;
        const results = await grepContentHelper(ctx, pattern, grepDir);
        if (results.length === 0) return err("", 1);
        const output = results
          .map((r) => r.matches.map((m) => `${r.path}:${m}`).join("\n"))
          .join("\n");
        return ok(output);
      }

      case "find": {
        const findDir = cmdArgs[0] || cwd;
        const namePattern = extractFlag(cmdArgs, "-name");
        const tree = await buildPathTreeHelper(ctx);
        let matches = tree.filter((e) => e.path.startsWith(findDir === "/" ? "" : findDir));
        if (namePattern) {
          const nameRegex = globToRegex(namePattern);
          matches = matches.filter((e) => nameRegex.test(e.name));
        }
        if (matches.length === 0) return ok("");
        return ok(matches.map((e) => e.path).join("\n"));
      }

      case "tree": {
        const treeDir = cmdArgs[0] || cwd;
        const tree = await buildPathTreeHelper(ctx);
        const output = renderTree(tree, treeDir);
        return ok(output);
      }

      case "pwd":
        return ok(cwd);

      case "cd": {
        const newDir = resolvePath(cwd, cmdArgs[0] || "/");
        return ok(newDir);
      }

      case "head": {
        if (cmdArgs.length === 0) return err("head: missing operand");
        const headPath = resolvePath(cwd, cmdArgs[cmdArgs.length - 1]);
        const nLines = extractFlag(cmdArgs, "-n");
        const lineCount = nLines ? parseInt(nLines, 10) : 10;
        const headFile = await readFileHelper(ctx, headPath);
        if (!headFile) return err(`head: ${headPath}: No such file or directory`);
        return ok(headFile.content.split("\n").slice(0, lineCount).join("\n"));
      }

      case "wc": {
        if (cmdArgs.length === 0) return err("wc: missing operand");
        const wcPath = resolvePath(cwd, cmdArgs[0]);
        const wcFile = await readFileHelper(ctx, wcPath);
        if (!wcFile) return err(`wc: ${wcPath}: No such file or directory`);
        const wcLines = wcFile.content.split("\n").length;
        const wcWords = wcFile.content.split(/\s+/).filter(Boolean).length;
        const wcChars = wcFile.content.length;
        return ok(`  ${wcLines}  ${wcWords} ${wcChars} ${wcPath}`);
      }

      default:
        return err(`${cmd}: command not found`);
    }
  },
});

// --- Utility functions ---

function parseCommand(input: string): Array<string> {
  const parts: Array<string> = [];
  let current = "";
  let inQuote: string | null = null;

  for (const ch of input) {
    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === " " || ch === "\t") {
      if (current) {
        parts.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function resolvePath(cwd: string, target: string): string {
  if (target.startsWith("/")) return normalizePath(target);
  const combined = cwd === "/" ? `/${target}` : `${cwd}/${target}`;
  return normalizePath(combined);
}

function normalizePath(p: string): string {
  const segments = p.split("/").filter(Boolean);
  const resolved: Array<string> = [];
  for (const seg of segments) {
    if (seg === "..") {
      resolved.pop();
    } else if (seg !== ".") {
      resolved.push(seg);
    }
  }
  return "/" + resolved.join("/");
}

function listDirectory(tree: Array<FileEntry>, dir: string): Array<FileEntry> | null {
  const normalized = dir === "/" ? "" : dir;

  if (normalized !== "" && !tree.some((e) => e.path === normalized && e.type === "dir")) {
    if (normalized !== "") return null;
  }

  const children: Array<FileEntry> = [];
  const seen = new Set<string>();

  for (const entry of tree) {
    if (normalized === "") {
      const relative = entry.path.replace(/^\//, "");
      const firstSegment = relative.split("/")[0];
      if (!seen.has(firstSegment)) {
        seen.add(firstSegment);
        if (entry.path === `/${firstSegment}` || entry.path.startsWith(`/${firstSegment}/`)) {
          children.push(
            entry.path === `/${firstSegment}`
              ? entry
              : { name: firstSegment, path: `/${firstSegment}`, type: "dir" },
          );
        }
      }
    } else {
      if (entry.path.startsWith(normalized + "/")) {
        const relative = entry.path.slice(normalized.length + 1);
        if (!relative.includes("/")) {
          children.push(entry);
        }
      }
    }
  }

  return children;
}

function extractFlag(args: Array<string>, flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return undefined;
}

function globToRegex(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`, "i");
}

function renderTree(entries: Array<FileEntry>, rootDir: string): string {
  const normalized = rootDir === "/" ? "" : rootDir;
  const lines: Array<string> = [rootDir];
  const children = entries.filter((e) => {
    if (normalized === "") {
      const relative = e.path.replace(/^\//, "");
      return !relative.includes("/");
    }
    const relative = e.path.slice(normalized.length + 1);
    return relative && !relative.includes("/");
  });

  for (let i = 0; i < children.length; i++) {
    const isLast = i === children.length - 1;
    const prefix = isLast ? "└── " : "├── ";
    const entry = children[i];
    const display = entry.title ? `${entry.name} (${entry.title})` : entry.name;
    lines.push(`${prefix}${display}`);
  }

  return lines.join("\n");
}
