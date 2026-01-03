import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Blog posts table
  posts: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    date: v.string(),
    published: v.boolean(),
    tags: v.array(v.string()),
    readTime: v.optional(v.string()),
    image: v.optional(v.string()), // Header/OG image URL
    showImageAtTop: v.optional(v.boolean()), // Display image at top of post (default: false)
    excerpt: v.optional(v.string()), // Short excerpt for card view
    featured: v.optional(v.boolean()), // Show in featured section
    featuredOrder: v.optional(v.number()), // Order in featured section (lower = first)
    authorName: v.optional(v.string()), // Author display name
    authorImage: v.optional(v.string()), // Author avatar image URL (round)
    layout: v.optional(v.string()), // Layout type: "sidebar" for docs-style layout
    rightSidebar: v.optional(v.boolean()), // Enable right sidebar with CopyPageDropdown
    showFooter: v.optional(v.boolean()), // Show footer on this post (overrides siteConfig default)
    footer: v.optional(v.string()), // Footer markdown content (overrides siteConfig defaultContent)
    showSocialFooter: v.optional(v.boolean()), // Show social footer on this post (overrides siteConfig default)
    aiChat: v.optional(v.boolean()), // Enable AI chat in right sidebar
    blogFeatured: v.optional(v.boolean()), // Show as hero featured post on /blog page
    newsletter: v.optional(v.boolean()), // Override newsletter signup display (true/false)
    contactForm: v.optional(v.boolean()), // Enable contact form on this post
    unlisted: v.optional(v.boolean()), // Hide from listings but allow direct access via slug
    docsSection: v.optional(v.boolean()), // Include in docs navigation
    docsSectionGroup: v.optional(v.string()), // Sidebar group name in docs
    docsSectionOrder: v.optional(v.number()), // Order within group (lower = first)
    docsSectionGroupOrder: v.optional(v.number()), // Order of group itself (lower = first)
    docsSectionGroupIcon: v.optional(v.string()), // Phosphor icon name for sidebar group
    docsLanding: v.optional(v.boolean()), // Use as /docs landing page
    lastSyncedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_date", ["date"])
    .index("by_published", ["published"])
    .index("by_featured", ["featured"])
    .index("by_blogFeatured", ["blogFeatured"])
    .index("by_authorName", ["authorName"])
    .index("by_docsSection", ["docsSection"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["published"],
    })
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["published"],
    }),

  // Comparables table
  comparables: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    date: v.string(),
    published: v.boolean(),
    tags: v.array(v.string()),
    readTime: v.optional(v.string()),
    image: v.optional(v.string()), // Header/OG image URL
    showImageAtTop: v.optional(v.boolean()), // Display image at top of post (default: false)
    excerpt: v.optional(v.string()), // Short excerpt for card view
    featured: v.optional(v.boolean()), // Show in featured section
    featuredOrder: v.optional(v.number()), // Order in featured section (lower = first)
    authorName: v.optional(v.string()), // Author display name
    authorImage: v.optional(v.string()), // Author avatar image URL (round)
    layout: v.optional(v.string()), // Layout type: "sidebar" for docs-style layout
    rightSidebar: v.optional(v.boolean()), // Enable right sidebar with CopyPageDropdown
    showFooter: v.optional(v.boolean()), // Show footer on this post (overrides siteConfig default)
    footer: v.optional(v.string()), // Footer markdown content (overrides siteConfig defaultContent)
    showSocialFooter: v.optional(v.boolean()), // Show social footer on this post (overrides siteConfig default)
    aiChat: v.optional(v.boolean()), // Enable AI chat in right sidebar
    blogFeatured: v.optional(v.boolean()), // Show as hero featured post on /blog page
    newsletter: v.optional(v.boolean()), // Override newsletter signup display (true/false)
    contactForm: v.optional(v.boolean()), // Enable contact form on this post
    unlisted: v.optional(v.boolean()), // Hide from listings but allow direct access via slug
    lastSyncedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_date", ["date"])
    .index("by_published", ["published"])
    .index("by_featured", ["featured"])
    .index("by_blogFeatured", ["blogFeatured"])
    .index("by_authorName", ["authorName"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["published"],
    })
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["published"],
    }),

  // Static pages (about, projects, contact, etc.)
  pages: defineTable({
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    published: v.boolean(),
    order: v.optional(v.number()), // Display order in nav
    showInNav: v.optional(v.boolean()), // Show in navigation menu (default: true)
    excerpt: v.optional(v.string()), // Short excerpt for card view
    image: v.optional(v.string()), // Thumbnail/OG image URL for featured cards
    showImageAtTop: v.optional(v.boolean()), // Display image at top of page (default: false)
    featured: v.optional(v.boolean()), // Show in featured section
    featuredOrder: v.optional(v.number()), // Order in featured section (lower = first)
    authorName: v.optional(v.string()), // Author display name
    authorImage: v.optional(v.string()), // Author avatar image URL (round)
    layout: v.optional(v.string()), // Layout type: "sidebar" for docs-style layout
    rightSidebar: v.optional(v.boolean()), // Enable right sidebar with CopyPageDropdown
    showFooter: v.optional(v.boolean()), // Show footer on this page (overrides siteConfig default)
    footer: v.optional(v.string()), // Footer markdown content (overrides siteConfig defaultContent)
    showSocialFooter: v.optional(v.boolean()), // Show social footer on this page (overrides siteConfig default)
    aiChat: v.optional(v.boolean()), // Enable AI chat in right sidebar
    contactForm: v.optional(v.boolean()), // Enable contact form on this page
    newsletter: v.optional(v.boolean()), // Override newsletter signup display (true/false)
    textAlign: v.optional(v.string()), // Text alignment: "left", "center", "right" (default: "left")
    docsSection: v.optional(v.boolean()), // Include in docs navigation
    docsSectionGroup: v.optional(v.string()), // Sidebar group name in docs
    docsSectionOrder: v.optional(v.number()), // Order within group (lower = first)
    docsSectionGroupOrder: v.optional(v.number()), // Order of group itself (lower = first)
    docsSectionGroupIcon: v.optional(v.string()), // Phosphor icon name for sidebar group
    docsLanding: v.optional(v.boolean()), // Use as /docs landing page
    lastSyncedAt: v.number(),
  })
  .index("by_slug", ["slug"])
  .index("by_published", ["published"])
  .index("by_featured", ["featured"])
  .index("by_docsSection", ["docsSection"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["published"],
    })
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["published"],
    }),

  // View counts for analytics
  viewCounts: defineTable({
    slug: v.string(),
    count: v.number(),
  }).index("by_slug", ["slug"]),

  // Site configuration (about content, links, etc.)
  siteConfig: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  // Page view events for analytics (event records pattern)
  pageViews: defineTable({
    path: v.string(),
    pageType: v.string(), // "blog" | "page" | "home" | "stats"
    sessionId: v.string(),
    timestamp: v.number(),
  })
    .index("by_path", ["path"])
    .index("by_timestamp", ["timestamp"])
    .index("by_session_path", ["sessionId", "path"]),

  // Active sessions for real-time visitor tracking
  activeSessions: defineTable({
    sessionId: v.string(),
    currentPath: v.string(),
    lastSeen: v.number(),
    // Location data (optional, from Netlify geo headers)
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_lastSeen", ["lastSeen"]),

  // AI chat conversations for writing assistant
  aiChats: defineTable({
    sessionId: v.string(), // Anonymous session ID from localStorage
    contextId: v.string(), // Slug or "write-page" identifier
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        timestamp: v.number(),
        attachments: v.optional(
          v.array(
            v.object({
              type: v.union(v.literal("image"), v.literal("link")),
              storageId: v.optional(v.id("_storage")),
              url: v.optional(v.string()),
              scrapedContent: v.optional(v.string()),
              title: v.optional(v.string()),
            }),
          ),
        ),
      }),
    ),
    pageContext: v.optional(v.string()), // Loaded page markdown content
    lastMessageAt: v.optional(v.number()),
  })
    .index("by_session_and_context", ["sessionId", "contextId"])
    .index("by_session", ["sessionId"]),

  // AI generated images from Gemini image generation
  aiGeneratedImages: defineTable({
    sessionId: v.string(), // Anonymous session ID from localStorage
    prompt: v.string(), // User's image prompt
    model: v.string(), // Model used: "gemini-2.5-flash-image" or "gemini-3-pro-image-preview"
    storageId: v.id("_storage"), // Convex storage ID for the generated image
    mimeType: v.string(), // Image MIME type: "image/png" or "image/jpeg"
    createdAt: v.number(), // Timestamp when image was generated
  })
    .index("by_session", ["sessionId"])
    .index("by_createdAt", ["createdAt"]),

  // Newsletter subscribers table
  // Stores email subscriptions with unsubscribe tokens
  newsletterSubscribers: defineTable({
    email: v.string(), // Subscriber email address (lowercase, trimmed)
    subscribed: v.boolean(), // Current subscription status
    subscribedAt: v.number(), // Timestamp when subscribed
    unsubscribedAt: v.optional(v.number()), // Timestamp when unsubscribed (if applicable)
    source: v.string(), // Where they signed up: "home", "blog-page", "post", or "post:slug-name"
    unsubscribeToken: v.string(), // Secure token for unsubscribe links
  })
    .index("by_email", ["email"])
    .index("by_subscribed", ["subscribed"]),

  // Newsletter sent tracking (posts and custom emails)
  // Tracks what has been sent to prevent duplicate newsletters
  newsletterSentPosts: defineTable({
    postSlug: v.string(), // Slug of the post or custom email identifier
    sentAt: v.number(), // Timestamp when the newsletter was sent
    sentCount: v.number(), // Number of subscribers it was sent to
    type: v.optional(v.string()), // "post" or "custom" (default "post" for backwards compat)
    subject: v.optional(v.string()), // Subject line for custom emails
  })
    .index("by_postSlug", ["postSlug"])
    .index("by_sentAt", ["sentAt"]),

  // Contact form messages
  // Stores messages submitted via contact forms on posts/pages
  contactMessages: defineTable({
    name: v.string(), // Sender's name
    email: v.string(), // Sender's email address
    message: v.string(), // Message content
    source: v.string(), // Where submitted from: "page:slug" or "post:slug"
    createdAt: v.number(), // Timestamp when submitted
    emailSentAt: v.optional(v.number()), // Timestamp when email was sent (if applicable)
  }).index("by_createdAt", ["createdAt"]),
});
