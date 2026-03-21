import { query } from "./_generated/server";
import { v } from "convex/values";

// Search result type for both posts and pages
const searchResultValidator = v.object({
  _id: v.string(),
  type: v.union(v.literal("post"), v.literal("page")),
  slug: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  snippet: v.string(),
  anchor: v.optional(v.string()), // Anchor ID for scrolling to exact match location
});

// Search across posts and pages
export const search = query({
  args: {
    query: v.string(),
  },
  returns: v.array(searchResultValidator),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();
    // Return empty results for empty queries
    if (!args.query.trim()) {
      return [];
    }

    const results: Array<{
      _id: string;
      type: "post" | "page";
      slug: string;
      title: string;
      description?: string;
      snippet: string;
      anchor?: string;
    }> = [];

    // Search posts by title
    const postsByTitle = await ctx.db
      .query("posts")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.query).eq("published", true)
      )
      .take(10);

    // Search posts by content
    const postsByContent = await ctx.db
      .query("posts")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.query).eq("published", true)
      )
      .take(10);

    // Search pages by title
    const pagesByTitle = await ctx.db
      .query("pages")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.query).eq("published", true)
      )
      .take(10);

    // Search pages by content
    const pagesByContent = await ctx.db
      .query("pages")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.query).eq("published", true)
      )
      .take(10);

    // Deduplicate and process post results
    const seenPostIds = new Set<string>();
    for (const post of [...postsByTitle, ...postsByContent]) {
      if (seenPostIds.has(post._id)) continue;
      seenPostIds.add(post._id);

      // Skip unlisted posts
      if (post.unlisted) continue;

      // Create snippet from content and find anchor
      const { snippet, anchor } = createSnippet(post.content, args.query, 120);

      results.push({
        _id: post._id,
        type: "post" as const,
        slug: post.slug,
        title: post.title,
        description: post.description,
        snippet,
        anchor: anchor || undefined,
      });
    }

    // Deduplicate and process page results
    const seenPageIds = new Set<string>();
    for (const page of [...pagesByTitle, ...pagesByContent]) {
      if (seenPageIds.has(page._id)) continue;
      seenPageIds.add(page._id);

      // Create snippet from content and find anchor
      const { snippet, anchor } = createSnippet(page.content, args.query, 120);

      results.push({
        _id: page._id,
        type: "page" as const,
        slug: page.slug,
        title: page.title,
        snippet,
        anchor: anchor || undefined,
      });
    }

    // Sort results: title matches first, then by relevance
    const queryLower = args.query.toLowerCase();
    results.sort((a, b) => {
      const aInTitle = a.title.toLowerCase().includes(queryLower);
      const bInTitle = b.title.toLowerCase().includes(queryLower);
      if (aInTitle && !bInTitle) return -1;
      if (!aInTitle && bInTitle) return 1;
      return 0;
    });

    // Limit to top 15 results
    return results.slice(0, 15);
  },
});

// Generate slug from heading text (same as frontend)
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Find the nearest heading before a match position in the original content
function findNearestHeading(content: string, matchPosition: number): string | null {
  const lines = content.split("\n");
  const headings: Array<{ text: string; position: number; id: string }> = [];
  let currentPosition = 0;

  // Find all headings with their positions
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      const text = headingMatch[2].trim();
      const id = generateSlug(text);
      headings.push({ text, position: currentPosition, id });
    }

    // Add line length + newline to position
    currentPosition += line.length + 1;
  }

  // Find the last heading before the match position
  let nearestHeading: typeof headings[0] | null = null;
  for (const heading of headings) {
    if (heading.position <= matchPosition) {
      nearestHeading = heading;
    } else {
      break;
    }
  }

  return nearestHeading?.id || null;
}

// Helper to create a snippet around the search term and find anchor
function createSnippet(
  content: string,
  searchTerm: string,
  maxLength: number
): { snippet: string; anchor: string | null } {
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  // Find the first occurrence in the original content for anchor lookup
  // This finds the match position before we clean the content
  const originalIndex = content.toLowerCase().indexOf(lowerSearchTerm);
  const anchor = originalIndex !== -1 ? findNearestHeading(content, originalIndex) : null;

  // Remove markdown syntax for cleaner snippets
  const cleanContent = content
    .replace(/#{1,6}\s/g, "") // Headers
    .replace(/\*\*([^*]+)\*\*/g, "$1") // Bold
    .replace(/\*([^*]+)\*/g, "$1") // Italic
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/```[\s\S]*?```/g, "") // Code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // Images
    .replace(/\n+/g, " ") // Newlines to spaces
    .replace(/\s+/g, " ") // Multiple spaces to single
    .trim();

  const lowerContent = cleanContent.toLowerCase();
  const index = lowerContent.indexOf(lowerSearchTerm);

  if (index === -1) {
    // Term not found, return beginning of content
    return {
      snippet: cleanContent.slice(0, maxLength) + (cleanContent.length > maxLength ? "..." : ""),
      anchor: null,
    };
  }

  // Calculate start position to center the search term
  const start = Math.max(0, index - Math.floor(maxLength / 3));
  const end = Math.min(cleanContent.length, start + maxLength);

  let snippet = cleanContent.slice(start, end);

  // Add ellipsis if needed
  if (start > 0) snippet = "..." + snippet;
  if (end < cleanContent.length) snippet = snippet + "...";

  return { snippet, anchor };
}

