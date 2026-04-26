import { httpRouter } from "convex/server";
import { registerStaticRoutes } from "@convex-dev/self-hosting";
import { httpAction } from "./_generated/server";
import { internal, components } from "./_generated/api";
import { handleRssFeed, handleRssFullFeed } from "./rss";
import { handleStreamResponse, handleStreamResponseOptions } from "./askAI.node";
import { registerRoutes } from "convex-fs";
import { fs } from "./fs";
import { auth } from "./auth";

function rateLimitedResponse(retryAfter?: number): Response {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...(retryAfter ? { "Retry-After": String(Math.ceil(retryAfter / 1000)) } : {}),
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

const http = httpRouter();

// Register Convex Auth routes for default auth mode.
// Legacy WorkOS mode remains available through convex/auth.config.ts.
auth.http.add(http);

// Serve raw markdown files with text/plain so browsers and AI services
// (Claude, ChatGPT, Perplexity) can read them. Must be registered before
// registerStaticRoutes so this handler takes precedence over static assets.
http.route({
  pathPrefix: "/raw/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "rawMarkdown",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

    const url = new URL(request.url);
    const slug = url.pathname.replace(/^\/raw\//, "").replace(/\.md$/, "");

    if (!slug) {
      return new Response("Not found", { status: 404 });
    }

    const post = await ctx.runQuery(internal.posts.getPostBySlugWithContent, { slug });
    if (post) {
      const frontmatter = [
        "---",
        `Type: post`,
        `Date: ${post.date}`,
        post.readTime ? `Read time: ${post.readTime}` : null,
        post.tags?.length ? `Tags: ${post.tags.join(", ")}` : null,
        "---",
      ]
        .filter(Boolean)
        .join("\n");

      const markdown = `${frontmatter}\n\n# ${post.title}\n\n${post.description ? `> ${post.description}\n\n` : ""}${post.content}`;

      return new Response(markdown, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const page = await ctx.runQuery(internal.pages.getPageBySlugInternal, { slug });
    if (page) {
      const today = new Date().toISOString().split("T")[0];
      const frontmatter = `---\nType: page\nDate: ${today}\n---`;
      const markdown = `${frontmatter}\n\n# ${page.title}\n\n${page.content}`;

      return new Response(markdown, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("Not found", { status: 404 });
  }),
});

http.route({
  pathPrefix: "/raw/",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// Register static file serving for self-hosted deployments.
registerStaticRoutes(http, components.selfHosting);

// Site configuration - update these for your site (or run npm run configure)
const SITE_URL = process.env.SITE_URL || "https://www.markdown.fast";
const SITE_NAME = "markdown sync framework";

// RSS feed endpoint (descriptions only)
http.route({
  path: "/rss.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "rssFeed",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);
    return handleRssFeed(ctx);
  }),
});

http.route({
  path: "/rss.xml",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// Full RSS feed endpoint (with complete content for LLMs)
http.route({
  path: "/rss-full.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "rssFullFeed",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);
    return handleRssFullFeed(ctx);
  }),
});

http.route({
  path: "/rss-full.xml",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// Sitemap.xml endpoint for search engines (includes posts, pages, and tag pages)
http.route({
  path: "/sitemap.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "sitemap",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

    const posts = await ctx.runQuery(internal.posts.getAllPostsInternal);
    const pages = await ctx.runQuery(internal.pages.getAllPagesInternal);
    const tags = await ctx.runQuery(internal.posts.getAllTagsInternal);
    const authors = await ctx.runQuery(internal.posts.getAllAuthorsInternal);

    const urls = [
      // Homepage
      `  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
      // All posts
      ...posts.map(
        (post: { slug: string; date: string }) => `  <url>
    <loc>${SITE_URL}/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
      ),
      // All pages
      ...pages.map(
        (page: { slug: string }) => `  <url>
    <loc>${SITE_URL}/${page.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
      ),
      // All tag pages
      ...tags.map(
        (tagInfo: { tag: string }) => `  <url>
    <loc>${SITE_URL}/tags/${encodeURIComponent(tagInfo.tag.toLowerCase())}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
      ),
      // All author pages
      ...authors.map(
        (author: { slug: string }) => `  <url>
    <loc>${SITE_URL}/author/${encodeURIComponent(author.slug)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=7200",
      },
    });
  }),
});

http.route({
  path: "/sitemap.xml",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// API endpoint: List all posts (JSON for LLMs/agents)
http.route({
  path: "/api/posts",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "apiPosts",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

    const posts = await ctx.runQuery(internal.posts.getAllPostsInternal);

    const response = {
      site: SITE_NAME,
      url: SITE_URL,
      description:
        "An open-source publishing framework built for AI agents and developers to ship websites, docs, or blogs. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.",
      posts: posts.map((post: { title: string; slug: string; description: string; date: string; readTime?: string; tags: string[] }) => ({
        title: post.title,
        slug: post.slug,
        description: post.description,
        date: post.date,
        readTime: post.readTime,
        tags: post.tags,
        url: `${SITE_URL}/${post.slug}`,
        markdownUrl: `${SITE_URL}/api/post?slug=${post.slug}`,
      })),
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

http.route({
  path: "/api/posts",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// API endpoint: Get single post as markdown (for LLMs/agents)
http.route({
  path: "/api/post",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "apiPost",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");
    const format = url.searchParams.get("format") || "json";

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const post = await ctx.runQuery(internal.posts.getPostBySlugWithContent, { slug });

    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return raw markdown if requested
    if (format === "markdown" || format === "md") {
      const markdown = `# ${post.title}

> ${post.description}

**Published:** ${post.date}${post.readTime ? ` | **Read time:** ${post.readTime}` : ""}
**Tags:** ${post.tags.join(", ")}
**URL:** ${SITE_URL}/${post.slug}

---

${post.content}`;

      return new Response(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=300, s-maxage=600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Default: JSON response
    const response = {
      title: post.title,
      slug: post.slug,
      description: post.description,
      date: post.date,
      readTime: post.readTime,
      tags: post.tags,
      url: `${SITE_URL}/${post.slug}`,
      content: post.content,
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

http.route({
  path: "/api/post",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// API endpoint: Export all posts with full content (batch for LLMs)
http.route({
  path: "/api/export",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "apiExport",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

    const posts = await ctx.runQuery(internal.posts.getAllPostsWithContentInternal);

    const response = {
      site: SITE_NAME,
      url: SITE_URL,
      description:
        "An open-source publishing framework built for AI agents and developers to ship websites, docs, or blogs. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.",
      exportedAt: new Date().toISOString(),
      totalPosts: posts.length,
      posts: posts.map((post) => ({
        title: post.title,
        slug: post.slug,
        description: post.description,
        date: post.date,
        readTime: post.readTime,
        tags: post.tags,
        url: `${SITE_URL}/${post.slug}`,
        content: post.content,
      })),
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

http.route({
  path: "/api/export",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// Escape HTML characters to prevent XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Generate Open Graph HTML for a post or page
function generateMetaHtml(content: {
  title: string;
  description: string;
  slug: string;
  date?: string;
  readTime?: string;
  image?: string;
  type?: "post" | "page";
}): string {
  const siteUrl = process.env.SITE_URL || "https://markdown.fast";
  const siteName = "markdown sync framework";
  const defaultImage = `${siteUrl}/images/og-default.svg`;
  const canonicalUrl = `${siteUrl}/${content.slug}`;

  // Resolve image URL: use post image if available, otherwise default
  let ogImage = defaultImage;
  if (content.image) {
    // Handle both absolute URLs and relative paths
    ogImage = content.image.startsWith("http")
      ? content.image
      : `${siteUrl}${content.image}`;
  }

  const safeTitle = escapeHtml(content.title);
  const safeDescription = escapeHtml(content.description);
  const contentType = content.type || "post";
  const ogType = contentType === "post" ? "article" : "website";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Basic SEO -->
  <title>${safeTitle} | ${siteName}</title>
  <meta name="description" content="${safeDescription}">
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="${siteName}">${
    content.date
      ? `
  <meta property="article:published_time" content="${content.date}">`
      : ""
  }
  
  <!-- Hreflang for language/region targeting -->
  <link rel="alternate" hreflang="en" href="${canonicalUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${ogImage}">
  <meta name="twitter:site" content="">
  <meta name="twitter:creator" content="">

  <!-- Redirect to actual page after a brief delay for crawlers -->
  <script>
    setTimeout(() => {
      window.location.href = "${canonicalUrl}";
    }, 100);
  </script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 680px; margin: 50px auto; padding: 20px; color: #111;">
  <h1 style="font-size: 32px; margin-bottom: 16px;">${safeTitle}</h1>
  <p style="color: #666; margin-bottom: 24px;">${safeDescription}</p>${
    content.date
      ? `
  <p style="font-size: 14px; color: #999;">${content.date}${content.readTime ? ` · ${content.readTime}` : ""}</p>`
      : ""
  }
  <p style="margin-top: 24px;"><small>Redirecting to full ${contentType}...</small></p>
</body>
</html>`;
}

// HTTP endpoint for Open Graph metadata (supports both posts and pages)
http.route({
  path: "/meta/post",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response("Missing slug parameter", { status: 400 });
    }

    try {
      // First try to find a post
      const post = await ctx.runQuery(internal.posts.getPostBySlugWithContent, { slug });

      if (post) {
        const html = generateMetaHtml({
          title: post.title,
          description: post.description,
          slug: post.slug,
          date: post.date,
          readTime: post.readTime,
          image: post.image,
          type: "post",
        });

        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control":
              "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
          },
        });
      }

      // If no post found, try to find a page
      const page = await ctx.runQuery(internal.pages.getPageBySlugInternal, { slug });

      if (page) {
        const html = generateMetaHtml({
          title: page.title,
          description: page.excerpt || `${page.title} - ${SITE_NAME}`,
          slug: page.slug,
          image: page.image,
          type: "page",
        });

        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control":
              "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
          },
        });
      }

      // Neither post nor page found
      return new Response("Content not found", { status: 404 });
    } catch {
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

http.route({
  path: "/meta/post",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// Ask AI streaming endpoint for RAG-based Q&A
http.route({
  path: "/ask-ai-stream",
  method: "POST",
  handler: httpAction(handleStreamResponse),
});

// CORS preflight for Ask AI endpoint
http.route({
  path: "/ask-ai-stream",
  method: "OPTIONS",
  handler: httpAction(handleStreamResponseOptions),
});

// Knowledge Base API: list all public KBs
http.route({
  path: "/api/kb",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "kbApi",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

    const kbs = await ctx.runQuery(internal.knowledgeBases.listPublicKbsForApi, {});
    return new Response(JSON.stringify({ knowledgeBases: kbs }, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

http.route({
  path: "/api/kb",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// Knowledge Base API: per-KB pages and page detail
// /api/kb/pages?slug=my-kb  -> list all pages in a KB
// /api/kb/page?kb=my-kb&slug=page-slug -> get a single page
http.route({
  path: "/api/kb/pages",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "kbApi",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

    const url = new URL(request.url);
    const kbSlug = url.searchParams.get("slug");
    if (!kbSlug) {
      return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const kb = await ctx.runQuery(internal.knowledgeBases.getBySlugInternal, { slug: kbSlug });
    if (!kb || !kb.apiEnabled || kb.apiVisibility === "off") {
      return new Response(JSON.stringify({ error: "Knowledge base not found or API disabled" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Check visibility: private API requires auth header
    if (kb.apiVisibility === "private") {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return new Response(JSON.stringify({ error: "Authentication required" }), {
          status: 401,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    const pages = await ctx.runQuery(internal.knowledgeBases.listPagesForKb, { kbId: kb._id });
    return new Response(JSON.stringify({ knowledgeBase: kbSlug, pages }, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

http.route({
  path: "/api/kb/pages",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

http.route({
  path: "/api/kb/page",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "kbApi",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

    const url = new URL(request.url);
    const kbSlug = url.searchParams.get("kb");
    const pageSlug = url.searchParams.get("slug");

    if (!kbSlug || !pageSlug) {
      return new Response(JSON.stringify({ error: "Missing kb or slug parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const kb = await ctx.runQuery(internal.knowledgeBases.getBySlugInternal, { slug: kbSlug });
    if (!kb || !kb.apiEnabled || kb.apiVisibility === "off") {
      return new Response(JSON.stringify({ error: "Knowledge base not found or API disabled" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (kb.apiVisibility === "private") {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return new Response(JSON.stringify({ error: "Authentication required" }), {
          status: 401,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    const page = await ctx.runQuery(internal.knowledgeBases.getPageInKb, {
      kbId: kb._id,
      slug: pageSlug,
    });

    if (!page) {
      return new Response(JSON.stringify({ error: "Page not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify(page, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

http.route({
  path: "/api/kb/page",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// Virtual filesystem: directory tree
http.route({
  path: "/vfs/tree",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "vfsTree",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

    await ctx.auth.getUserIdentity();
    const tree = await ctx.runQuery(internal.virtualFs.buildPathTree, {});
    return new Response(JSON.stringify(tree, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// Virtual filesystem: execute shell commands
http.route({
  path: "/vfs/exec",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const rl = await ctx.runMutation(internal.rateLimits.checkHttpRateLimit, {
      name: "vfsExec",
    });
    if (!rl.ok) return rateLimitedResponse(rl.retryAfter);

    await ctx.auth.getUserIdentity();
    let body: { command?: string; cwd?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ stdout: "", stderr: "invalid JSON body", exitCode: 1 }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
      );
    }

    if (!body.command || typeof body.command !== "string") {
      return new Response(
        JSON.stringify({ stdout: "", stderr: "missing command field", exitCode: 1 }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
      );
    }

    const result = await ctx.runQuery(internal.virtualFs.executeCommand, {
      command: body.command,
      cwd: body.cwd || "/",
    });

    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

// CORS preflight for virtual filesystem endpoints
http.route({
  path: "/vfs/tree",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

http.route({
  path: "/vfs/exec",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

// ConvexFS routes for file uploads/downloads
// Only register routes when Bunny CDN is configured
// - POST /fs/upload - Upload files to Bunny.net storage
// - GET /fs/blobs/{blobId} - Returns 302 redirect to signed CDN URL
if (fs) {
  registerRoutes(http, components.fs, fs, {
    pathPrefix: "/fs",
    uploadAuth: async (ctx) => {
      return await ctx.runQuery(internal.authAdmin.isCurrentUserDashboardAdminInternal, {});
    },
    downloadAuth: async () => {
      // Public downloads - images should be accessible to all
      return true;
    },
  });
}

export default http;
