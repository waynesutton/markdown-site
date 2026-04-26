import { v } from "convex/values";
import { query } from "./_generated/server.js";

const MAX_RESULTS = 100;
const MAX_FILES = 1000;

// --- Types ---

type FileEntry = {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  title?: string;
};

type CommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

const commandResultValidator = v.object({
  stdout: v.string(),
  stderr: v.string(),
  exitCode: v.number(),
});

const fileEntryValidator = v.object({
  name: v.string(),
  path: v.string(),
  type: v.union(v.literal("file"), v.literal("dir")),
  size: v.optional(v.number()),
  title: v.optional(v.string()),
});

// --- Result helpers ---

function ok(stdout: string): CommandResult {
  return { stdout, stderr: "", exitCode: 0 };
}

function err(stderr: string, exitCode = 1): CommandResult {
  return { stdout: "", stderr, exitCode };
}

// --- Build a directory tree from flat file paths ---

function buildTree(
  files: Array<{ path: string; title: string; size: number }>,
): Array<FileEntry> {
  const entries: Array<FileEntry> = [];
  const dirs = new Set<string>();

  for (const file of files) {
    const segments = file.path.split("/").filter(Boolean);

    // Ensure all parent directories exist
    let current = "";
    for (let i = 0; i < segments.length - 1; i++) {
      current += "/" + segments[i];
      if (!dirs.has(current)) {
        dirs.add(current);
        entries.push({
          name: segments[i],
          path: current,
          type: "dir" as const,
        });
      }
    }

    // Add the file itself
    entries.push({
      name: segments[segments.length - 1],
      path: file.path,
      type: "file" as const,
      size: file.size,
      title: file.title,
    });
  }

  return entries;
}

// --- Shell command: execute ---

export const executeCommand = query({
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

    // Load all files once for the transaction
    const allFiles = await ctx.db
      .query("files")
      .withIndex("by_path")
      .take(MAX_FILES);

    const fileList = allFiles.map((f) => ({
      path: f.path,
      title: f.title,
      size: f.content.length,
    }));

    const tree = buildTree(fileList);

    switch (cmd) {
      case "ls": {
        const target = resolvePath(cwd, cmdArgs[0] || ".");
        const entries = listDirectory(tree, target);
        if (entries === null)
          return err(`ls: ${target}: No such file or directory`);

        const longFormat = cmdArgs.includes("-l");
        if (longFormat) {
          const lines = entries.map((e) => {
            const sizeStr = e.size !== undefined ? String(e.size).padStart(8) : "       -";
            const typeStr = e.type === "dir" ? "d" : "-";
            const titleStr = e.title ? `  ${e.title}` : "";
            return `${typeStr} ${sizeStr} ${e.name}${titleStr}`;
          });
          return ok(lines.join("\n"));
        }
        return ok(entries.map((e) => e.name).join("\n"));
      }

      case "cat": {
        if (cmdArgs.length === 0) return err("cat: missing operand");
        const filePath = resolvePath(cwd, cmdArgs[0]);
        const file = allFiles.find((f) => f.path === filePath);
        if (!file)
          return err(`cat: ${filePath}: No such file or directory`);
        return ok(file.content);
      }

      case "grep": {
        if (cmdArgs.length === 0) return err("grep: missing pattern");

        // Parse flags
        let caseInsensitive = false;
        let countOnly = false;
        const filteredArgs: Array<string> = [];
        for (const arg of cmdArgs) {
          if (arg === "-i") caseInsensitive = true;
          else if (arg === "-c") countOnly = true;
          else if (arg === "-ic" || arg === "-ci") {
            caseInsensitive = true;
            countOnly = true;
          } else filteredArgs.push(arg);
        }

        const pattern = filteredArgs[0];
        if (!pattern) return err("grep: missing pattern");
        const grepDir = filteredArgs[1]
          ? resolvePath(cwd, filteredArgs[1])
          : cwd;

        let regex: RegExp;
        const flags = caseInsensitive ? "gi" : "g";
        try {
          regex = new RegExp(pattern, flags);
        } catch {
          regex = new RegExp(
            pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            flags,
          );
        }

        const grepPrefix = grepDir === "/" ? "" : grepDir;
        const matchingFiles = allFiles.filter(
          (f) => f.path.startsWith(grepPrefix + "/") || grepPrefix === "",
        );

        const results: Array<string> = [];
        let totalCount = 0;

        for (const file of matchingFiles) {
          const lines = file.content.split("\n");
          const matchLines: Array<string> = [];
          for (const line of lines) {
            regex.lastIndex = 0;
            if (regex.test(line)) {
              matchLines.push(line.trim());
            }
          }
          if (matchLines.length > 0) {
            if (countOnly) {
              totalCount += matchLines.length;
            } else {
              for (const m of matchLines.slice(0, 5)) {
                results.push(`${file.path}:${m}`);
              }
            }
          }
          if (results.length >= MAX_RESULTS) break;
        }

        if (countOnly) return ok(String(totalCount));
        if (results.length === 0) return err("", 1);
        return ok(results.join("\n"));
      }

      case "find": {
        const findDir = cmdArgs[0] ? resolvePath(cwd, cmdArgs[0]) : cwd;
        const namePattern = extractFlag(cmdArgs, "-name");
        const typeFilter = extractFlag(cmdArgs, "-type");

        let matches = tree.filter((e) =>
          e.path.startsWith(findDir === "/" ? "" : findDir),
        );

        if (namePattern) {
          const nameRegex = globToRegex(namePattern);
          matches = matches.filter((e) => nameRegex.test(e.name));
        }
        if (typeFilter === "f") {
          matches = matches.filter((e) => e.type === "file");
        } else if (typeFilter === "d") {
          matches = matches.filter((e) => e.type === "dir");
        }

        if (matches.length === 0) return ok("");
        return ok(matches.map((e) => e.path).join("\n"));
      }

      case "tree": {
        const treeDir = cmdArgs[0] ? resolvePath(cwd, cmdArgs[0]) : cwd;
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
        const headFile = allFiles.find((f) => f.path === headPath);
        if (!headFile)
          return err(`head: ${headPath}: No such file or directory`);
        return ok(
          headFile.content.split("\n").slice(0, lineCount).join("\n"),
        );
      }

      case "tail": {
        if (cmdArgs.length === 0) return err("tail: missing operand");
        const tailPath = resolvePath(cwd, cmdArgs[cmdArgs.length - 1]);
        const tailN = extractFlag(cmdArgs, "-n");
        const tailCount = tailN ? parseInt(tailN, 10) : 10;
        const tailFile = allFiles.find((f) => f.path === tailPath);
        if (!tailFile)
          return err(`tail: ${tailPath}: No such file or directory`);
        const allLines = tailFile.content.split("\n");
        return ok(allLines.slice(-tailCount).join("\n"));
      }

      case "wc": {
        if (cmdArgs.length === 0) return err("wc: missing operand");
        const wcPath = resolvePath(cwd, cmdArgs[0]);
        const wcFile = allFiles.find((f) => f.path === wcPath);
        if (!wcFile)
          return err(`wc: ${wcPath}: No such file or directory`);
        const wcLines = wcFile.content.split("\n").length;
        const wcWords = wcFile.content.split(/\s+/).filter(Boolean).length;
        const wcChars = wcFile.content.length;
        return ok(`  ${wcLines}  ${wcWords} ${wcChars} ${wcPath}`);
      }

      case "stat": {
        if (cmdArgs.length === 0) return err("stat: missing operand");
        const statPath = resolvePath(cwd, cmdArgs[0]);
        const statFile = allFiles.find((f) => f.path === statPath);
        if (!statFile)
          return err(`stat: ${statPath}: No such file or directory`);
        const lines = [
          `  File: ${statFile.path}`,
          `  Title: ${statFile.title}`,
          `  Size: ${statFile.content.length}`,
          `  Type: ${statFile.contentType || "text/markdown"}`,
          `  Lines: ${statFile.content.split("\n").length}`,
          `  Words: ${statFile.content.split(/\s+/).filter(Boolean).length}`,
        ];
        return ok(lines.join("\n"));
      }

      case "echo":
        return ok(cmdArgs.join(" "));

      case "help":
        return ok(
          [
            "Available commands:",
            "  ls [path]           List directory contents",
            "  ls -l [path]        Long listing with sizes and titles",
            "  cat <file>          Print file contents",
            "  head [-n N] <file>  Print first N lines (default 10)",
            "  tail [-n N] <file>  Print last N lines (default 10)",
            "  grep <pattern> [dir]  Search file contents",
            "  grep -i <pattern>   Case-insensitive search",
            "  grep -c <pattern>   Count matches only",
            "  find [dir] [-name pattern] [-type f|d]",
            "  tree [dir]          Display directory tree",
            "  wc <file>           Word, line, and character counts",
            "  stat <file>         File metadata",
            "  pwd                 Print working directory",
            "  cd <dir>            Change directory",
            "  echo <text>         Print text",
            "  help                Show this help message",
          ].join("\n"),
        );

      default:
        return err(
          `${cmd}: command not found. Type 'help' for available commands.`,
        );
    }
  },
});

/**
 * Build the full directory tree for the /vfs/tree endpoint.
 */
export const buildPathTree = query({
  args: {},
  returns: v.array(fileEntryValidator),
  handler: async (ctx): Promise<Array<FileEntry>> => {
    const allFiles = await ctx.db
      .query("files")
      .withIndex("by_path")
      .take(MAX_FILES);

    return buildTree(
      allFiles.map((f) => ({
        path: f.path,
        title: f.title,
        size: f.content.length,
      })),
    );
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

function listDirectory(
  tree: Array<FileEntry>,
  dir: string,
): Array<FileEntry> | null {
  const normalized = dir === "/" ? "" : dir;

  if (
    normalized !== "" &&
    !tree.some((e) => e.path === normalized && e.type === "dir")
  ) {
    return null;
  }

  const children: Array<FileEntry> = [];
  const seen = new Set<string>();

  for (const entry of tree) {
    if (normalized === "") {
      const relative = entry.path.replace(/^\//, "");
      const firstSegment = relative.split("/")[0];
      if (!seen.has(firstSegment)) {
        seen.add(firstSegment);
        if (
          entry.path === `/${firstSegment}` ||
          entry.path.startsWith(`/${firstSegment}/`)
        ) {
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

function extractFlag(
  args: Array<string>,
  flag: string,
): string | undefined {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return undefined;
}

function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
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
    const display = entry.title
      ? `${entry.name} (${entry.title})`
      : entry.name;
    lines.push(`${prefix}${display}`);
  }

  return lines.join("\n");
}
