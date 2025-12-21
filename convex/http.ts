import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { rssFeed, rssFullFeed } from "./rss";

const http = httpRouter();

// Site configuration
const SITE_URL = process.env.SITE_URL || "https://markdowncms.netlify.app";
const SITE_NAME = "markdown sync framework";

// RSS feed endpoint (descriptions only)
http.route({
  path: "/rss.xml",
  method: "GET",
  handler: rssFeed,
});

// Full RSS feed endpoint (with complete content for LLMs)
http.route({
  path: "/rss-full.xml",
  method: "GET",
  handler: rssFullFeed,
});

// Sitemap.xml endpoint for search engines
http.route({
  path: "/sitemap.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const posts = await ctx.runQuery(api.posts.getAllPosts);

    const urls = [
      // Homepage
      `  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
      // All posts
      ...posts.map(
        (post) => `  <url>
    <loc>${SITE_URL}/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
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

// API endpoint: List all posts (JSON for LLMs/agents)
http.route({
  path: "/api/posts",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const posts = await ctx.runQuery(api.posts.getAllPosts);

    const response = {
      site: SITE_NAME,
      url: SITE_URL,
      description: "An open-source publishing framework for AI agents and developers. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.",
      posts: posts.map((post) => ({
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

// API endpoint: Get single post as markdown (for LLMs/agents)
http.route({
  path: "/api/post",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");
    const format = url.searchParams.get("format") || "json";

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const post = await ctx.runQuery(api.posts.getPostBySlug, { slug });

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

// API endpoint: Export all posts with full content (batch for LLMs)
http.route({
  path: "/api/export",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const posts = await ctx.runQuery(api.posts.getAllPosts);

    // Fetch full content for each post
    const fullPosts = await Promise.all(
      posts.map(async (post) => {
        const fullPost = await ctx.runQuery(api.posts.getPostBySlug, {
          slug: post.slug,
        });
        return {
          title: post.title,
          slug: post.slug,
          description: post.description,
          date: post.date,
          readTime: post.readTime,
          tags: post.tags,
          url: `${SITE_URL}/${post.slug}`,
          content: fullPost?.content || "",
        };
      }),
    );

    const response = {
      site: SITE_NAME,
      url: SITE_URL,
      description: "An open-source publishing framework for AI agents and developers. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.",
      exportedAt: new Date().toISOString(),
      totalPosts: fullPosts.length,
      posts: fullPosts,
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
  const siteUrl = process.env.SITE_URL || "https://markdowncms.netlify.app";
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
  <meta property="og:site_name" content="${siteName}">${content.date ? `
  <meta property="article:published_time" content="${content.date}">` : ""}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- Redirect to actual page after a brief delay for crawlers -->
  <script>
    setTimeout(() => {
      window.location.href = "${canonicalUrl}";
    }, 100);
  </script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 680px; margin: 50px auto; padding: 20px; color: #111;">
  <h1 style="font-size: 32px; margin-bottom: 16px;">${safeTitle}</h1>
  <p style="color: #666; margin-bottom: 24px;">${safeDescription}</p>${content.date ? `
  <p style="font-size: 14px; color: #999;">${content.date}${content.readTime ? ` · ${content.readTime}` : ""}</p>` : ""}
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
      const post = await ctx.runQuery(api.posts.getPostBySlug, { slug });

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
      const page = await ctx.runQuery(api.pages.getPageBySlug, { slug });

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

export default http;
