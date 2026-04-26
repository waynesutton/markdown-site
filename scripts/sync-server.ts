#!/usr/bin/env npx tsx
/**
 * Sync Server
 * 
 * Local HTTP server for executing sync commands from the Dashboard UI.
 * Runs on localhost:3001 with optional token authentication.
 * 
 * Usage:
 *   npm run sync-server
 * 
 * Security:
 *   - Binds to localhost only (not accessible from network)
 *   - Optional token auth via SYNC_TOKEN env var
 *   - Whitelisted commands only
 */

import { spawn } from "child_process";
import http from "http";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

const PORT = 3001;
const HOST = "127.0.0.1"; // Localhost only for security

// Optional token for authentication (set in .env.local)
const SYNC_TOKEN = process.env.SYNC_TOKEN || "";

// Whitelist of allowed sync commands
const ALLOWED_COMMANDS: Record<string, { script: string; env?: Record<string, string> }> = {
  "sync": { script: "sync" },
  "sync:prod": { script: "sync:prod" },
  "sync:discovery": { script: "sync:discovery" },
  "sync:discovery:prod": { script: "sync:discovery:prod" },
  "sync:wiki": { script: "sync:wiki" },
  "sync:wiki:prod": { script: "sync:wiki:prod" },
  "sync:all": { script: "sync:all" },
  "sync:all:prod": { script: "sync:all:prod" },
};

// CORS headers for local development
function setCorsHeaders(res: http.ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Sync-Token");
}

// Verify authentication token
function verifyAuth(req: http.IncomingMessage): boolean {
  // If no token configured, allow all requests (dev mode)
  if (!SYNC_TOKEN) {
    return true;
  }
  
  const token = req.headers["x-sync-token"];
  return token === SYNC_TOKEN;
}

// Parse JSON body from request
async function parseBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

// Execute npm script and stream output
function executeScript(
  scriptName: string,
  res: http.ServerResponse,
): void {
  const config = ALLOWED_COMMANDS[scriptName];
  if (!config) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: `Unknown command: ${scriptName}` }));
    return;
  }

  // Set headers for streaming response
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  // Write initial message
  res.write(`> npm run ${config.script}\n\n`);

  // Spawn the npm process
  const child = spawn("npm", ["run", config.script], {
    cwd: process.cwd(),
    env: { ...process.env, ...config.env },
    shell: true,
  });

  // Stream stdout
  child.stdout.on("data", (data: Buffer) => {
    res.write(data.toString());
  });

  // Stream stderr
  child.stderr.on("data", (data: Buffer) => {
    res.write(data.toString());
  });

  // Handle process completion
  child.on("close", (code) => {
    if (code === 0) {
      res.write(`\n[Done] Command completed successfully.\n`);
    } else {
      res.write(`\n[Error] Command exited with code ${code}.\n`);
    }
    res.end();
  });

  // Handle process errors
  child.on("error", (err) => {
    res.write(`\n[Error] Failed to execute command: ${err.message}\n`);
    res.end();
  });
}

// Main request handler
async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): Promise<void> {
  setCorsHeaders(res);

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);
  const path = url.pathname;

  // Health check endpoint
  if (path === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", commands: Object.keys(ALLOWED_COMMANDS) }));
    return;
  }

  // Execute sync command
  if (path === "/api/sync" && req.method === "POST") {
    // Verify authentication
    if (!verifyAuth(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    try {
      const body = await parseBody(req);
      const command = body.command as string;

      if (!command || !ALLOWED_COMMANDS[command]) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 
          error: "Invalid command", 
          allowed: Object.keys(ALLOWED_COMMANDS) 
        }));
        return;
      }

      executeScript(command, res);
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid request body" }));
    }
    return;
  }

  // 404 for other routes
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
}

// Create and start server
const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error("Request error:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n  Sync Server running at http://${HOST}:${PORT}`);
  console.log(`\n  Available commands:`);
  Object.keys(ALLOWED_COMMANDS).forEach((cmd) => {
    console.log(`    - ${cmd}`);
  });
  if (SYNC_TOKEN) {
    console.log(`\n  Token authentication: enabled`);
  } else {
    console.log(`\n  Token authentication: disabled (set SYNC_TOKEN in .env.local to enable)`);
  }
  console.log(`\n  Use with Dashboard at http://localhost:5173/dashboard\n`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n  Shutting down sync server...");
  server.close(() => {
    process.exit(0);
  });
});
