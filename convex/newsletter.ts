import {
  mutation,
  query,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireDashboardAdmin } from "./dashboardAuth";

const NEWSLETTER_ADMIN_QUERY_LIMIT = 2000;

// Generate secure unsubscribe token
// Uses random alphanumeric characters for URL-safe tokens
function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// Subscribe to newsletter (email only)
// Creates new subscriber or re-subscribes existing unsubscribed user
// Sends developer notification when a new subscriber signs up
export const subscribe = mutation({
  args: {
    email: v.string(),
    source: v.string(), // "home", "blog-page", "post", or "post:slug-name"
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();

    // Normalize email: lowercase and trim whitespace
    const email = args.email.toLowerCase().trim();

    // Validate email format
    if (!email || !email.includes("@") || !email.includes(".")) {
      return { success: false, message: "Please enter a valid email address." };
    }

    // Check if already subscribed using index
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing && existing.subscribed) {
      return { success: false, message: "You're already subscribed!" };
    }

    const token = generateToken();
    const isNewSubscriber = !existing;

    if (existing) {
      // Re-subscribe existing user with new token
      await ctx.db.patch(existing._id, {
        subscribed: true,
        subscribedAt: Date.now(),
        source: args.source,
        unsubscribeToken: token,
        unsubscribedAt: undefined,
      });
    } else {
      // Create new subscriber
      await ctx.db.insert("newsletterSubscribers", {
        email,
        subscribed: true,
        subscribedAt: Date.now(),
        source: args.source,
        unsubscribeToken: token,
      });
    }

    // Send developer notification for new subscribers
    // Only for genuinely new subscribers, not re-subscriptions
    if (isNewSubscriber) {
      await ctx.scheduler.runAfter(0, internal.newsletterActions.notifyNewSubscriber, {
        email,
        source: args.source,
      });
    }

    return { success: true, message: "Thanks for subscribing!" };
  },
});

// Unsubscribe from newsletter
// Requires email and token for security (prevents unauthorized unsubscribes)
export const unsubscribe = mutation({
  args: {
    email: v.string(),
    token: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();

    // Normalize email
    const email = args.email.toLowerCase().trim();

    // Find subscriber by email using index
    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!subscriber) {
      return { success: false, message: "Email not found." };
    }

    // Verify token matches
    if (subscriber.unsubscribeToken !== args.token) {
      return { success: false, message: "Invalid unsubscribe link." };
    }

    // Check if already unsubscribed
    if (!subscriber.subscribed) {
      return { success: true, message: "You're already unsubscribed." };
    }

    // Mark as unsubscribed
    await ctx.db.patch(subscriber._id, {
      subscribed: false,
      unsubscribedAt: Date.now(),
    });

    return { success: true, message: "You've been unsubscribed." };
  },
});

// Get subscriber count (for stats page)
// Returns count of active subscribers
export const getSubscriberCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    await ctx.auth.getUserIdentity();
    const subscribers = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_subscribed", (q) => q.eq("subscribed", true))
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);
    return subscribers.length;
  },
});

// Get active subscribers (internal, for sending newsletters)
// Returns only email and token for each active subscriber
export const getActiveSubscribers = internalQuery({
  args: {},
  returns: v.array(
    v.object({
      email: v.string(),
      unsubscribeToken: v.string(),
    })
  ),
  handler: async (ctx) => {
    const subscribers = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_subscribed", (q) => q.eq("subscribed", true))
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);

    return subscribers.map((s) => ({
      email: s.email,
      unsubscribeToken: s.unsubscribeToken,
    }));
  },
});

// Batched read for sendPostNewsletter: one transaction instead of three separate internal queries from the action.
const postNewsletterSubscriberValidator = v.object({
  email: v.string(),
  unsubscribeToken: v.string(),
});

const postNewsletterPostValidator = v.object({
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  excerpt: v.optional(v.string()),
});

export const getPostNewsletterSendContextInternal = internalQuery({
  args: { postSlug: v.string() },
  returns: v.object({
    alreadySent: v.boolean(),
    subscribers: v.array(postNewsletterSubscriberValidator),
    post: v.union(postNewsletterPostValidator, v.null()),
  }),
  handler: async (ctx, args) => {
    const sent = await ctx.db
      .query("newsletterSentPosts")
      .withIndex("by_postslug", (q) => q.eq("postSlug", args.postSlug))
      .unique();

    const subscriberDocs = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_subscribed", (q) => q.eq("subscribed", true))
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);

    const subscribers = subscriberDocs.map((s) => ({
      email: s.email,
      unsubscribeToken: s.unsubscribeToken,
    }));

    const postDoc = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.postSlug))
      .unique();

    let post: {
      slug: string;
      title: string;
      description: string;
      excerpt?: string;
    } | null = null;
    if (postDoc && postDoc.published) {
      post = {
        slug: postDoc.slug,
        title: postDoc.title,
        description: postDoc.description,
        excerpt: postDoc.excerpt,
      };
    }

    return {
      alreadySent: sent !== null,
      subscribers,
      post,
    };
  },
});

// Record that a post was sent as newsletter
// Internal mutation called after sending newsletter
export const recordPostSent = internalMutation({
  args: {
    postSlug: v.string(),
    sentCount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("newsletterSentPosts", {
      postSlug: args.postSlug,
      sentAt: Date.now(),
      sentCount: args.sentCount,
      type: "post",
    });
    return null;
  },
});

// Record that a custom email was sent as newsletter
// Internal mutation called after sending custom newsletter
export const recordCustomSent = internalMutation({
  args: {
    subject: v.string(),
    sentCount: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Generate a unique identifier for the custom email
    const customId = `custom-${Date.now()}`;
    await ctx.db.insert("newsletterSentPosts", {
      postSlug: customId,
      sentAt: Date.now(),
      sentCount: args.sentCount,
      type: "custom",
      subject: args.subject,
    });
    return null;
  },
});

// Check if a post has already been sent as newsletter
export const wasPostSent = internalQuery({
  args: {
    postSlug: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const sent = await ctx.db
      .query("newsletterSentPosts")
      .withIndex("by_postslug", (q) => q.eq("postSlug", args.postSlug))
      .unique();
    return sent !== null;
  },
});

// ============================================================================
// Admin Queries and Mutations
// For use in the /newsletter-admin page
// ============================================================================

// Subscriber type for admin queries (excludes sensitive tokens for public queries)
const subscriberAdminValidator = v.object({
  _id: v.id("newsletterSubscribers"),
  email: v.string(),
  subscribed: v.boolean(),
  subscribedAt: v.number(),
  unsubscribedAt: v.optional(v.number()),
  source: v.string(),
});

// Get all subscribers for admin (paginated)
// Returns subscribers without sensitive unsubscribe tokens
export const getAllSubscribers = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    filter: v.optional(v.union(v.literal("all"), v.literal("subscribed"), v.literal("unsubscribed"))),
    search: v.optional(v.string()),
  },
  returns: v.object({
    subscribers: v.array(subscriberAdminValidator),
    nextCursor: v.union(v.string(), v.null()),
    totalCount: v.number(),
    subscribedCount: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    const limit = args.limit ?? 50;
    const filter = args.filter ?? "all";
    const search = args.search?.toLowerCase().trim();

    let filtered;
    if (filter === "subscribed") {
      filtered = await ctx.db
        .query("newsletterSubscribers")
        .withIndex("by_subscribed", (q) => q.eq("subscribed", true))
        .take(NEWSLETTER_ADMIN_QUERY_LIMIT);
    } else if (filter === "unsubscribed") {
      filtered = await ctx.db
        .query("newsletterSubscribers")
        .withIndex("by_subscribed", (q) => q.eq("subscribed", false))
        .take(NEWSLETTER_ADMIN_QUERY_LIMIT);
    } else {
      filtered = await ctx.db
        .query("newsletterSubscribers")
        .take(NEWSLETTER_ADMIN_QUERY_LIMIT);
    }

    // Search by email
    if (search) {
      filtered = filtered.filter((s) => s.email.includes(search));
    }

    // Sort by subscribedAt descending (newest first)
    filtered.sort((a, b) => b.subscribedAt - a.subscribedAt);

    // Pagination using cursor (subscribedAt timestamp)
    let startIndex = 0;
    if (args.cursor) {
      const cursorTime = parseInt(args.cursor, 10);
      startIndex = filtered.findIndex((s) => s.subscribedAt < cursorTime);
      if (startIndex === -1) startIndex = filtered.length;
    }

    const pageSubscribers = filtered.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < filtered.length;

    // Map to admin format (strip unsubscribeToken)
    const subscribers = pageSubscribers.map((s) => ({
      _id: s._id,
      email: s.email,
      subscribed: s.subscribed,
      subscribedAt: s.subscribedAt,
      unsubscribedAt: s.unsubscribedAt,
      source: s.source,
    }));

    const subscribedList = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_subscribed", (q) => q.eq("subscribed", true))
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);
    const subscribedCount = subscribedList.length;

    return {
      subscribers,
      nextCursor: hasMore ? String(pageSubscribers[pageSubscribers.length - 1].subscribedAt) : null,
      totalCount: filtered.length,
      subscribedCount,
    };
  },
});

// Delete subscriber (admin only)
// Permanently removes subscriber from database
export const deleteSubscriber = mutation({
  args: {
    subscriberId: v.id("newsletterSubscribers"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    // Check if subscriber exists using direct get
    const subscriber = await ctx.db.get(args.subscriberId);
    if (!subscriber) {
      return { success: false, message: "Subscriber not found." };
    }

    // Delete the subscriber
    await ctx.db.delete(args.subscriberId);

    return { success: true, message: "Subscriber deleted." };
  },
});

// Get newsletter stats for admin dashboard
export const getNewsletterStats = query({
  args: {},
  returns: v.object({
    totalSubscribers: v.number(),
    activeSubscribers: v.number(),
    unsubscribedCount: v.number(),
    totalNewslettersSent: v.number(),
    totalEmailsSent: v.number(), // Sum of all sentCount
    recentNewsletters: v.array(
      v.object({
        postSlug: v.string(),
        sentAt: v.number(),
        sentCount: v.number(),
        type: v.optional(v.string()),
        subject: v.optional(v.string()),
      })
    ),
  }),
  handler: async (ctx) => {
    await requireDashboardAdmin(ctx);

    const activeList = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_subscribed", (q) => q.eq("subscribed", true))
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);
    const activeSubscribers = activeList.length;

    const unsubscribedList = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_subscribed", (q) => q.eq("subscribed", false))
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);
    const unsubscribedCount = unsubscribedList.length;

    const sentPosts = await ctx.db
      .query("newsletterSentPosts")
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);
    
    // Calculate total emails sent (sum of all sentCount)
    const totalEmailsSent = sentPosts.reduce((sum, p) => sum + p.sentCount, 0);
    
    // Sort by sentAt descending and take last 10
    const recentNewsletters = sentPosts
      .sort((a, b) => b.sentAt - a.sentAt)
      .slice(0, 10)
      .map((p) => ({
        postSlug: p.postSlug,
        sentAt: p.sentAt,
        sentCount: p.sentCount,
        type: p.type,
        subject: p.subject,
      }));

    return {
      totalSubscribers: activeSubscribers + unsubscribedCount,
      activeSubscribers,
      unsubscribedCount,
      totalNewslettersSent: sentPosts.length,
      totalEmailsSent,
      recentNewsletters,
    };
  },
});

// Get list of posts available for newsletter sending
export const getPostsForNewsletter = query({
  args: {},
  returns: v.array(
    v.object({
      slug: v.string(),
      title: v.string(),
      date: v.string(),
      wasSent: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    await requireDashboardAdmin(ctx);

    // Get all published posts
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);

    // Get all sent post slugs
    const sentPosts = await ctx.db
      .query("newsletterSentPosts")
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);
    const sentSlugs = new Set(sentPosts.map((p) => p.postSlug));

    // Map posts with sent status, sorted by date descending
    return posts
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        date: p.date,
        wasSent: sentSlugs.has(p.slug),
      }));
  },
});

// Internal query to get stats for weekly summary email
export const getStatsForSummary = internalQuery({
  args: {
    now: v.number(),
  },
  returns: v.object({
    activeSubscribers: v.number(),
    totalSubscribers: v.number(),
    newThisWeek: v.number(),
    unsubscribedCount: v.number(),
    totalNewslettersSent: v.number(),
  }),
  handler: async (ctx, args) => {
    const activeList = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_subscribed", (q) => q.eq("subscribed", true))
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);
    const activeSubscribers = activeList.length;

    const unsubscribedList = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_subscribed", (q) => q.eq("subscribed", false))
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);
    const unsubscribedCount = unsubscribedList.length;
    const totalSubscribers = activeSubscribers + unsubscribedCount;

    const oneWeekAgo = args.now - 7 * 24 * 60 * 60 * 1000;
    let newThisWeek = 0;
    for (const s of activeList) {
      if (s.subscribedAt >= oneWeekAgo) newThisWeek++;
    }

    const sentPosts = await ctx.db
      .query("newsletterSentPosts")
      .take(NEWSLETTER_ADMIN_QUERY_LIMIT);

    return {
      activeSubscribers,
      totalSubscribers,
      newThisWeek,
      unsubscribedCount,
      totalNewslettersSent: sentPosts.length,
    };
  },
});

// ============================================================================
// Admin Mutations for Newsletter Sending
// These schedule internal actions to send newsletters
// ============================================================================

// Schedule sending a post as newsletter from admin UI
export const scheduleSendPostNewsletter = mutation({
  args: {
    postSlug: v.string(),
    siteUrl: v.string(),
    siteName: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    // Check if post was already sent
    const sent = await ctx.db
      .query("newsletterSentPosts")
      .withIndex("by_postslug", (q) => q.eq("postSlug", args.postSlug))
      .unique();

    if (sent) {
      return {
        success: false,
        message: "This post has already been sent as a newsletter.",
      };
    }

    // Schedule the action to run immediately
    await ctx.scheduler.runAfter(0, internal.newsletterActions.sendPostNewsletter, {
      postSlug: args.postSlug,
      siteUrl: args.siteUrl,
      siteName: args.siteName,
    });

    return {
      success: true,
      message: "Newsletter is being sent. Check back in a moment for results.",
    };
  },
});

// Schedule sending a custom newsletter from admin UI
export const scheduleSendCustomNewsletter = mutation({
  args: {
    subject: v.string(),
    content: v.string(),
    siteUrl: v.string(),
    siteName: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    // Validate inputs
    if (!args.subject.trim()) {
      return { success: false, message: "Subject is required." };
    }
    if (!args.content.trim()) {
      return { success: false, message: "Content is required." };
    }

    // Schedule the action to run immediately
    await ctx.scheduler.runAfter(0, internal.newsletterActions.sendCustomNewsletter, {
      subject: args.subject,
      content: args.content,
      siteUrl: args.siteUrl,
      siteName: args.siteName,
    });

    return {
      success: true,
      message: "Newsletter is being sent. Check back in a moment for results.",
    };
  },
});

// Schedule sending weekly stats summary from CLI
export const scheduleSendStatsSummary = mutation({
  args: {
    siteName: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireDashboardAdmin(ctx);

    // Schedule the action to run immediately
    await ctx.scheduler.runAfter(0, internal.newsletterActions.sendWeeklyStatsSummary, {
      siteName: args.siteName,
    });

    return {
      success: true,
      message: "Stats summary is being sent. Check your inbox in a moment.",
    };
  },
});
