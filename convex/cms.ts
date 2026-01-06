import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Shared validator for post data
const postDataValidator = v.object({
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  content: v.string(),
  date: v.string(),
  published: v.boolean(),
  tags: v.array(v.string()),
  readTime: v.optional(v.string()),
  image: v.optional(v.string()),
  showImageAtTop: v.optional(v.boolean()),
  excerpt: v.optional(v.string()),
  featured: v.optional(v.boolean()),
  featuredOrder: v.optional(v.number()),
  authorName: v.optional(v.string()),
  authorImage: v.optional(v.string()),
  layout: v.optional(v.string()),
  rightSidebar: v.optional(v.boolean()),
  showFooter: v.optional(v.boolean()),
  footer: v.optional(v.string()),
  showSocialFooter: v.optional(v.boolean()),
  aiChat: v.optional(v.boolean()),
  blogFeatured: v.optional(v.boolean()),
  newsletter: v.optional(v.boolean()),
  contactForm: v.optional(v.boolean()),
  unlisted: v.optional(v.boolean()),
  docsSection: v.optional(v.boolean()),
  docsSectionGroup: v.optional(v.string()),
  docsSectionOrder: v.optional(v.number()),
  docsSectionGroupOrder: v.optional(v.number()),
  docsSectionGroupIcon: v.optional(v.string()),
  docsLanding: v.optional(v.boolean()),
});

// Shared validator for page data
const pageDataValidator = v.object({
  slug: v.string(),
  title: v.string(),
  content: v.string(),
  published: v.boolean(),
  order: v.optional(v.number()),
  showInNav: v.optional(v.boolean()),
  excerpt: v.optional(v.string()),
  image: v.optional(v.string()),
  showImageAtTop: v.optional(v.boolean()),
  featured: v.optional(v.boolean()),
  featuredOrder: v.optional(v.number()),
  authorName: v.optional(v.string()),
  authorImage: v.optional(v.string()),
  layout: v.optional(v.string()),
  rightSidebar: v.optional(v.boolean()),
  showFooter: v.optional(v.boolean()),
  footer: v.optional(v.string()),
  showSocialFooter: v.optional(v.boolean()),
  aiChat: v.optional(v.boolean()),
  contactForm: v.optional(v.boolean()),
  newsletter: v.optional(v.boolean()),
  textAlign: v.optional(v.string()),
  docsSection: v.optional(v.boolean()),
  docsSectionGroup: v.optional(v.string()),
  docsSectionOrder: v.optional(v.number()),
  docsSectionGroupOrder: v.optional(v.number()),
  docsSectionGroupIcon: v.optional(v.string()),
  docsLanding: v.optional(v.boolean()),
});

// Create a new post via dashboard
export const createPost = mutation({
  args: { post: postDataValidator },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.post.slug))
      .first();

    if (existing) {
      throw new Error(`Post with slug "${args.post.slug}" already exists`);
    }

    const postId = await ctx.db.insert("posts", {
      ...args.post,
      source: "dashboard",
      lastSyncedAt: Date.now(),
    });

    return postId;
  },
});

// Update any post (dashboard or synced)
export const updatePost = mutation({
  args: {
    id: v.id("posts"),
    post: v.object({
      slug: v.optional(v.string()),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      content: v.optional(v.string()),
      date: v.optional(v.string()),
      published: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
      readTime: v.optional(v.string()),
      image: v.optional(v.string()),
      showImageAtTop: v.optional(v.boolean()),
      excerpt: v.optional(v.string()),
      featured: v.optional(v.boolean()),
      featuredOrder: v.optional(v.number()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      layout: v.optional(v.string()),
      rightSidebar: v.optional(v.boolean()),
      showFooter: v.optional(v.boolean()),
      footer: v.optional(v.string()),
      showSocialFooter: v.optional(v.boolean()),
      aiChat: v.optional(v.boolean()),
      blogFeatured: v.optional(v.boolean()),
      newsletter: v.optional(v.boolean()),
      contactForm: v.optional(v.boolean()),
      unlisted: v.optional(v.boolean()),
      docsSection: v.optional(v.boolean()),
      docsSectionGroup: v.optional(v.string()),
      docsSectionOrder: v.optional(v.number()),
      docsSectionGroupOrder: v.optional(v.number()),
      docsSectionGroupIcon: v.optional(v.string()),
      docsLanding: v.optional(v.boolean()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Post not found");
    }

    // If slug is being changed, check for conflicts
    const newSlug = args.post.slug;
    if (newSlug && newSlug !== existing.slug) {
      const slugConflict = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .first();
      if (slugConflict) {
        throw new Error(`Post with slug "${newSlug}" already exists`);
      }
    }

    await ctx.db.patch(args.id, {
      ...args.post,
      lastSyncedAt: Date.now(),
    });

    return null;
  },
});

// Delete a post
export const deletePost = mutation({
  args: { id: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Post not found");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

// Create a new page via dashboard
export const createPage = mutation({
  args: { page: pageDataValidator },
  returns: v.id("pages"),
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query("pages")
      .withIndex("by_slug", (q) => q.eq("slug", args.page.slug))
      .first();

    if (existing) {
      throw new Error(`Page with slug "${args.page.slug}" already exists`);
    }

    const pageId = await ctx.db.insert("pages", {
      ...args.page,
      source: "dashboard",
      lastSyncedAt: Date.now(),
    });

    return pageId;
  },
});

// Update any page (dashboard or synced)
export const updatePage = mutation({
  args: {
    id: v.id("pages"),
    page: v.object({
      slug: v.optional(v.string()),
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      published: v.optional(v.boolean()),
      order: v.optional(v.number()),
      showInNav: v.optional(v.boolean()),
      excerpt: v.optional(v.string()),
      image: v.optional(v.string()),
      showImageAtTop: v.optional(v.boolean()),
      featured: v.optional(v.boolean()),
      featuredOrder: v.optional(v.number()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      layout: v.optional(v.string()),
      rightSidebar: v.optional(v.boolean()),
      showFooter: v.optional(v.boolean()),
      footer: v.optional(v.string()),
      showSocialFooter: v.optional(v.boolean()),
      aiChat: v.optional(v.boolean()),
      contactForm: v.optional(v.boolean()),
      newsletter: v.optional(v.boolean()),
      textAlign: v.optional(v.string()),
      docsSection: v.optional(v.boolean()),
      docsSectionGroup: v.optional(v.string()),
      docsSectionOrder: v.optional(v.number()),
      docsSectionGroupOrder: v.optional(v.number()),
      docsSectionGroupIcon: v.optional(v.string()),
      docsLanding: v.optional(v.boolean()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Page not found");
    }

    // If slug is being changed, check for conflicts
    const newSlug = args.page.slug;
    if (newSlug && newSlug !== existing.slug) {
      const slugConflict = await ctx.db
        .query("pages")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .first();
      if (slugConflict) {
        throw new Error(`Page with slug "${newSlug}" already exists`);
      }
    }

    await ctx.db.patch(args.id, {
      ...args.page,
      lastSyncedAt: Date.now(),
    });

    return null;
  },
});

// Delete a page
export const deletePage = mutation({
  args: { id: v.id("pages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Page not found");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

// Export post as markdown with frontmatter
export const exportPostAsMarkdown = query({
  args: { id: v.id("posts") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }

    // Build frontmatter
    const frontmatter: string[] = ["---"];
    frontmatter.push(`title: "${post.title.replace(/"/g, '\\"')}"`);
    frontmatter.push(`description: "${post.description.replace(/"/g, '\\"')}"`);
    frontmatter.push(`date: "${post.date}"`);
    frontmatter.push(`slug: "${post.slug}"`);
    frontmatter.push(`published: ${post.published}`);
    frontmatter.push(`tags: [${post.tags.map((t) => `"${t}"`).join(", ")}]`);

    // Add optional fields
    if (post.readTime) frontmatter.push(`readTime: "${post.readTime}"`);
    if (post.image) frontmatter.push(`image: "${post.image}"`);
    if (post.showImageAtTop !== undefined)
      frontmatter.push(`showImageAtTop: ${post.showImageAtTop}`);
    if (post.excerpt)
      frontmatter.push(`excerpt: "${post.excerpt.replace(/"/g, '\\"')}"`);
    if (post.featured !== undefined)
      frontmatter.push(`featured: ${post.featured}`);
    if (post.featuredOrder !== undefined)
      frontmatter.push(`featuredOrder: ${post.featuredOrder}`);
    if (post.authorName) frontmatter.push(`authorName: "${post.authorName}"`);
    if (post.authorImage) frontmatter.push(`authorImage: "${post.authorImage}"`);
    if (post.layout) frontmatter.push(`layout: "${post.layout}"`);
    if (post.rightSidebar !== undefined)
      frontmatter.push(`rightSidebar: ${post.rightSidebar}`);
    if (post.showFooter !== undefined)
      frontmatter.push(`showFooter: ${post.showFooter}`);
    if (post.footer)
      frontmatter.push(`footer: "${post.footer.replace(/"/g, '\\"')}"`);
    if (post.showSocialFooter !== undefined)
      frontmatter.push(`showSocialFooter: ${post.showSocialFooter}`);
    if (post.aiChat !== undefined) frontmatter.push(`aiChat: ${post.aiChat}`);
    if (post.blogFeatured !== undefined)
      frontmatter.push(`blogFeatured: ${post.blogFeatured}`);
    if (post.newsletter !== undefined)
      frontmatter.push(`newsletter: ${post.newsletter}`);
    if (post.contactForm !== undefined)
      frontmatter.push(`contactForm: ${post.contactForm}`);
    if (post.unlisted !== undefined)
      frontmatter.push(`unlisted: ${post.unlisted}`);
    if (post.docsSection !== undefined)
      frontmatter.push(`docsSection: ${post.docsSection}`);
    if (post.docsSectionGroup)
      frontmatter.push(`docsSectionGroup: "${post.docsSectionGroup}"`);
    if (post.docsSectionOrder !== undefined)
      frontmatter.push(`docsSectionOrder: ${post.docsSectionOrder}`);
    if (post.docsSectionGroupOrder !== undefined)
      frontmatter.push(`docsSectionGroupOrder: ${post.docsSectionGroupOrder}`);
    if (post.docsSectionGroupIcon)
      frontmatter.push(`docsSectionGroupIcon: "${post.docsSectionGroupIcon}"`);
    if (post.docsLanding !== undefined)
      frontmatter.push(`docsLanding: ${post.docsLanding}`);

    frontmatter.push("---");

    return `${frontmatter.join("\n")}\n\n${post.content}`;
  },
});

// Export page as markdown with frontmatter
export const exportPageAsMarkdown = query({
  args: { id: v.id("pages") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.id);
    if (!page) {
      throw new Error("Page not found");
    }

    // Build frontmatter
    const frontmatter: string[] = ["---"];
    frontmatter.push(`title: "${page.title.replace(/"/g, '\\"')}"`);
    frontmatter.push(`slug: "${page.slug}"`);
    frontmatter.push(`published: ${page.published}`);

    // Add optional fields
    if (page.order !== undefined) frontmatter.push(`order: ${page.order}`);
    if (page.showInNav !== undefined)
      frontmatter.push(`showInNav: ${page.showInNav}`);
    if (page.excerpt)
      frontmatter.push(`excerpt: "${page.excerpt.replace(/"/g, '\\"')}"`);
    if (page.image) frontmatter.push(`image: "${page.image}"`);
    if (page.showImageAtTop !== undefined)
      frontmatter.push(`showImageAtTop: ${page.showImageAtTop}`);
    if (page.featured !== undefined)
      frontmatter.push(`featured: ${page.featured}`);
    if (page.featuredOrder !== undefined)
      frontmatter.push(`featuredOrder: ${page.featuredOrder}`);
    if (page.authorName) frontmatter.push(`authorName: "${page.authorName}"`);
    if (page.authorImage) frontmatter.push(`authorImage: "${page.authorImage}"`);
    if (page.layout) frontmatter.push(`layout: "${page.layout}"`);
    if (page.rightSidebar !== undefined)
      frontmatter.push(`rightSidebar: ${page.rightSidebar}`);
    if (page.showFooter !== undefined)
      frontmatter.push(`showFooter: ${page.showFooter}`);
    if (page.footer)
      frontmatter.push(`footer: "${page.footer.replace(/"/g, '\\"')}"`);
    if (page.showSocialFooter !== undefined)
      frontmatter.push(`showSocialFooter: ${page.showSocialFooter}`);
    if (page.aiChat !== undefined) frontmatter.push(`aiChat: ${page.aiChat}`);
    if (page.contactForm !== undefined)
      frontmatter.push(`contactForm: ${page.contactForm}`);
    if (page.newsletter !== undefined)
      frontmatter.push(`newsletter: ${page.newsletter}`);
    if (page.textAlign) frontmatter.push(`textAlign: "${page.textAlign}"`);
    if (page.docsSection !== undefined)
      frontmatter.push(`docsSection: ${page.docsSection}`);
    if (page.docsSectionGroup)
      frontmatter.push(`docsSectionGroup: "${page.docsSectionGroup}"`);
    if (page.docsSectionOrder !== undefined)
      frontmatter.push(`docsSectionOrder: ${page.docsSectionOrder}`);
    if (page.docsSectionGroupOrder !== undefined)
      frontmatter.push(`docsSectionGroupOrder: ${page.docsSectionGroupOrder}`);
    if (page.docsSectionGroupIcon)
      frontmatter.push(`docsSectionGroupIcon: "${page.docsSectionGroupIcon}"`);
    if (page.docsLanding !== undefined)
      frontmatter.push(`docsLanding: ${page.docsLanding}`);

    frontmatter.push("---");

    return `${frontmatter.join("\n")}\n\n${page.content}`;
  },
});
