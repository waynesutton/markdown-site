import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server.js";
import { api } from "./_generated/api.js";

const http = httpRouter();

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// GET /tree - returns the full directory tree as JSON
http.route({
  path: "/tree",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const tree = await ctx.runQuery(api.shell.buildPathTree, {});
    return new Response(JSON.stringify(tree, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        ...CORS_HEADERS,
      },
    });
  }),
});

// POST /exec - execute a shell command
http.route({
  path: "/exec",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let body: { command?: string; cwd?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          stdout: "",
          stderr: "invalid JSON body",
          exitCode: 1,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        },
      );
    }

    if (!body.command || typeof body.command !== "string") {
      return new Response(
        JSON.stringify({
          stdout: "",
          stderr: "missing command field",
          exitCode: 1,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        },
      );
    }

    const result = await ctx.runQuery(api.shell.executeCommand, {
      command: body.command,
      cwd: body.cwd || "/",
    });

    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...CORS_HEADERS,
      },
    });
  }),
});

// GET /file?path=/blog/my-post.md - read a single file
http.route({
  path: "/file",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const filePath = url.searchParams.get("path");

    if (!filePath) {
      return new Response(
        JSON.stringify({ error: "missing path query parameter" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        },
      );
    }

    const file = await ctx.runQuery(api.files.get, { path: filePath });
    if (!file) {
      return new Response(
        JSON.stringify({ error: "file not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        },
      );
    }

    return new Response(JSON.stringify(file, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        ...CORS_HEADERS,
      },
    });
  }),
});

// CORS preflight for all routes
http.route({
  path: "/tree",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }),
});

http.route({
  path: "/exec",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }),
});

http.route({
  path: "/file",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }),
});

export default http;
