import type { GenericActionCtx } from "convex/server";
import { internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

// Site configuration for RSS feed - update these for your site (or run npm run configure)
const SITE_URL = process.env.SITE_URL || "https://www.markdown.fast";
const SITE_TITLE = "markdown sync framework";
const SITE_DESCRIPTION =
  "An open-source publishing framework built for AI agents and developers to ship websites, docs, or blogs. Write markdown, sync from the terminal. Your content is instantly available to browsers, LLMs, and AI agents. Built on Convex and Netlify.";

// Escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Generate RSS XML from posts (description only)
function generateRssXml(
  posts: Array<{
    title: string;
    description: string;
    slug: string;
    date: string;
  }>,
  feedPath: string = "/rss.xml",
): string {
  const items = posts
    .map((post) => {
      const pubDate = new Date(post.date).toUTCString();
      const url = `${SITE_URL}/${post.slug}`;

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}${feedPath}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

// Generate RSS XML with full content (for LLMs and readers)
function generateFullRssXml(
  posts: Array<{
    title: string;
    description: string;
    slug: string;
    date: string;
    content: string;
    readTime?: string;
    tags: string[];
  }>,
): string {
  const items = posts
    .map((post) => {
      const pubDate = new Date(post.date).toUTCString();
      const url = `${SITE_URL}/${post.slug}`;

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.description)}</description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_TITLE)} - Full Content</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)} Full article content for readers and AI.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss-full.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}

// RSS feed handler (descriptions only)
export async function handleRssFeed(ctx: {
  auth: GenericActionCtx<DataModel>["auth"];
  runQuery: GenericActionCtx<DataModel>["runQuery"];
}): Promise<Response> {
  await ctx.auth.getUserIdentity();
  const posts = await ctx.runQuery(internal.posts.getAllPostsInternal);

  const xml = generateRssXml(
    posts.map((post: { title: string; description: string; slug: string; date: string }) => ({
      title: post.title,
      description: post.description,
      slug: post.slug,
      date: post.date,
    })),
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=7200",
    },
  });
}

// Full RSS feed handler (with complete content)
export async function handleRssFullFeed(ctx: {
  auth: GenericActionCtx<DataModel>["auth"];
  runQuery: GenericActionCtx<DataModel>["runQuery"];
}): Promise<Response> {
  await ctx.auth.getUserIdentity();
  // Single batch query instead of N+1 per-post fetches
  const fullPosts = await ctx.runQuery(internal.posts.getAllPostsWithContentInternal);

  const xml = generateFullRssXml(fullPosts);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=7200",
    },
  });
}
