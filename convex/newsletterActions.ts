"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { AgentMailClient } from "agentmail";

// Simple markdown to HTML converter for email content
// Supports: headers, bold, italic, links, lists, paragraphs
function markdownToHtml(markdown: string): string {
  let html = markdown
    // Escape HTML entities first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers (must be at start of line)
    .replace(/^### (.+)$/gm, '<h3 style="font-size: 18px; color: #1a1a1a; margin: 16px 0 8px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size: 20px; color: #1a1a1a; margin: 20px 0 10px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size: 24px; color: #1a1a1a; margin: 24px 0 12px;">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #1a73e8; text-decoration: none;">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li style="margin: 4px 0;">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left: 20px; margin: 12px 0;">$&</ul>')
    // Line breaks (double newline = paragraph)
    .replace(/\n\n/g, '</p><p style="margin: 12px 0; line-height: 1.6;">')
    // Single line breaks
    .replace(/\n/g, '<br />');
  
  // Wrap in paragraph if not starting with a block element
  if (!html.startsWith('<h') && !html.startsWith('<ul')) {
    html = `<p style="margin: 12px 0; line-height: 1.6;">${html}</p>`;
  }
  
  return html;
}

// Convert markdown to plain text for email fallback
function markdownToText(markdown: string): string {
  return markdown
    // Remove markdown formatting
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^#{1,3} /gm, '')
    .replace(/^- /gm, '* ');
}

// Environment variable error message for production
const ENV_VAR_ERROR_MESSAGE = "AgentMail Environment Variables are not configured in production. Please set AGENTMAIL_API_KEY and AGENTMAIL_INBOX.";

// Send newsletter for a specific post to all active subscribers
// Uses AgentMail SDK to send emails
// https://docs.agentmail.to/sending-receiving-email
export const sendPostNewsletter = internalAction({
  args: {
    postSlug: v.string(),
    siteUrl: v.string(),
    siteName: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    sentCount: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const context = await ctx.runQuery(
      internal.newsletter.getPostNewsletterSendContextInternal,
      { postSlug: args.postSlug },
    );

    if (context.alreadySent) {
      return {
        success: false,
        sentCount: 0,
        message: "This post has already been sent as a newsletter.",
      };
    }

    if (context.subscribers.length === 0) {
      return { success: false, sentCount: 0, message: "No subscribers." };
    }

    if (!context.post) {
      return { success: false, sentCount: 0, message: "Post not found." };
    }

    const post = context.post;
    const subscribers = context.subscribers;

    // Get API key and inbox from environment
    const apiKey = process.env.AGENTMAIL_API_KEY;
    const inbox = process.env.AGENTMAIL_INBOX;

    if (!apiKey || !inbox) {
      return {
        success: false,
        sentCount: 0,
        message: ENV_VAR_ERROR_MESSAGE,
      };
    }

    const siteName = args.siteName || "Newsletter";
    let sentCount = 0;
    const errors: Array<string> = [];

    // Initialize AgentMail client once
    const client = new AgentMailClient({ apiKey });

    // Send to each subscriber
    for (const subscriber of subscribers) {
      const unsubscribeUrl = `${args.siteUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${subscriber.unsubscribeToken}`;
      const postUrl = `${args.siteUrl}/${post.slug}`;

      // Build email HTML
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">${escapeHtml(post.title)}</h1>
          <p style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 24px;">${escapeHtml(post.description)}</p>
          ${post.excerpt ? `<p style="font-size: 14px; color: #666; line-height: 1.5; margin-bottom: 24px;">${escapeHtml(post.excerpt)}</p>` : ""}
          <p style="margin-bottom: 32px;">
            <a href="${postUrl}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500;">Read more</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="font-size: 12px; color: #888;">
            You received this email because you subscribed to ${escapeHtml(siteName)}.<br />
            <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
          </p>
        </div>
      `;

      // Plain text version
      const text = `${post.title}\n\n${post.description}\n\nRead more: ${postUrl}\n\n---\nUnsubscribe: ${unsubscribeUrl}`;

      // Send email using AgentMail SDK
      try {
        await client.inboxes.messages.send(inbox, {
          to: subscriber.email,
          subject: `New: ${post.title}`,
          html,
          text,
        });
        sentCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`${subscriber.email}: ${errorMessage}`);
      }
    }

    // Record sent if at least one email was sent
    if (sentCount > 0) {
      await ctx.runMutation(internal.newsletter.recordPostSent, {
        postSlug: args.postSlug,
        sentCount,
      });
    }

    // Build result message
    let resultMessage: string = `Sent to ${sentCount} of ${subscribers.length} subscribers.`;
    if (errors.length > 0) {
      resultMessage += ` ${errors.length} failed.`;
    }

    return { success: sentCount > 0, sentCount, message: resultMessage };
  },
});

// Helper function to escape HTML entities
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Send weekly digest email to all active subscribers
// Includes all posts published in the last 7 days
export const sendWeeklyDigest = internalAction({
  args: {
    siteUrl: v.string(),
    siteName: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    sentCount: v.number(),
    postCount: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get subscribers
    const subscribers: Array<{ email: string; unsubscribeToken: string }> =
      await ctx.runQuery(internal.newsletter.getActiveSubscribers);

    if (subscribers.length === 0) {
      return {
        success: false,
        sentCount: 0,
        postCount: 0,
        message: "No subscribers.",
      };
    }

    // Get posts from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = sevenDaysAgo.toISOString().split("T")[0];

    const recentPosts: Array<{
      slug: string;
      title: string;
      description: string;
      date: string;
      excerpt?: string;
    }> = await ctx.runQuery(internal.posts.getRecentPostsInternal, {
      since: cutoffDate,
    });

    if (recentPosts.length === 0) {
      return {
        success: true,
        sentCount: 0,
        postCount: 0,
        message: "No new posts in the last 7 days.",
      };
    }

    // Get API key and inbox from environment
    const apiKey = process.env.AGENTMAIL_API_KEY;
    const inbox = process.env.AGENTMAIL_INBOX;

    if (!apiKey || !inbox) {
      return {
        success: false,
        sentCount: 0,
        postCount: 0,
        message: ENV_VAR_ERROR_MESSAGE,
      };
    }

    const siteName = args.siteName || "Newsletter";
    let sentCount = 0;
    const errors: Array<string> = [];

    // Initialize AgentMail client
    const client = new AgentMailClient({ apiKey });

    // Build email content
    const postsHtml = recentPosts
      .map(
        (post) => `
        <div style="margin-bottom: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
          <h3 style="font-size: 18px; color: #1a1a1a; margin: 0 0 8px 0;">
            <a href="${args.siteUrl}/${post.slug}" style="color: #1a1a1a; text-decoration: none;">${escapeHtml(post.title)}</a>
          </h3>
          <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">${escapeHtml(post.description)}</p>
          <p style="font-size: 12px; color: #888; margin: 0;">${post.date}</p>
        </div>
      `
      )
      .join("");

    const postsText = recentPosts
      .map(
        (post) =>
          `${post.title}\n${post.description}\n${args.siteUrl}/${post.slug}\n${post.date}`
      )
      .join("\n\n");

    // Send to each subscriber
    for (const subscriber of subscribers) {
      const unsubscribeUrl = `${args.siteUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${subscriber.unsubscribeToken}`;

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 8px;">Weekly Digest</h1>
          <p style="font-size: 14px; color: #666; margin-bottom: 24px;">${recentPosts.length} new post${recentPosts.length > 1 ? "s" : ""} from ${escapeHtml(siteName)}</p>
          ${postsHtml}
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="font-size: 12px; color: #888;">
            You received this email because you subscribed to ${escapeHtml(siteName)}.<br />
            <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
          </p>
        </div>
      `;

      const text = `Weekly Digest - ${recentPosts.length} new post${recentPosts.length > 1 ? "s" : ""}\n\n${postsText}\n\n---\nUnsubscribe: ${unsubscribeUrl}`;

      try {
        await client.inboxes.messages.send(inbox, {
          to: subscriber.email,
          subject: `Weekly Digest: ${recentPosts.length} new post${recentPosts.length > 1 ? "s" : ""}`,
          html,
          text,
        });
        sentCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`${subscriber.email}: ${errorMessage}`);
      }
    }

    let resultMessage: string = `Sent ${recentPosts.length} post${recentPosts.length > 1 ? "s" : ""} to ${sentCount} of ${subscribers.length} subscribers.`;
    if (errors.length > 0) {
      resultMessage += ` ${errors.length} failed.`;
    }

    return {
      success: sentCount > 0,
      sentCount,
      postCount: recentPosts.length,
      message: resultMessage,
    };
  },
});

// Send new subscriber notification to developer
// Called when a new subscriber signs up
export const notifyNewSubscriber = internalAction({
  args: {
    email: v.string(),
    source: v.string(),
    siteName: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (_ctx, args) => {
    // Get API key and inbox from environment
    const apiKey = process.env.AGENTMAIL_API_KEY;
    const inbox = process.env.AGENTMAIL_INBOX;
    const contactEmail = process.env.AGENTMAIL_CONTACT_EMAIL || inbox;

    if (!apiKey || !contactEmail) {
      return {
        success: false,
        message: ENV_VAR_ERROR_MESSAGE,
      };
    }

    const siteName = args.siteName || "Your Site";
    const timestamp = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const client = new AgentMailClient({ apiKey });

    try {
      await client.inboxes.messages.send(inbox!, {
        to: contactEmail,
        subject: `New subscriber: ${args.email}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="font-size: 20px; color: #1a1a1a; margin-bottom: 16px;">New Newsletter Subscriber</h2>
            <p style="font-size: 14px; color: #444; line-height: 1.6;">
              <strong>Email:</strong> ${escapeHtml(args.email)}<br />
              <strong>Source:</strong> ${escapeHtml(args.source)}<br />
              <strong>Time:</strong> ${timestamp}
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #888;">
              This is an automated notification from ${escapeHtml(siteName)}.
            </p>
          </div>
        `,
        text: `New Newsletter Subscriber\n\nEmail: ${args.email}\nSource: ${args.source}\nTime: ${timestamp}`,
      });

      return { success: true, message: "Notification sent." };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { success: false, message: errorMessage };
    }
  },
});

// Send weekly stats summary to developer
// Includes subscriber count, new subscribers, newsletters sent
export const sendWeeklyStatsSummary = internalAction({
  args: {
    siteName: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get API key and inbox from environment
    const apiKey = process.env.AGENTMAIL_API_KEY;
    const inbox = process.env.AGENTMAIL_INBOX;
    const contactEmail = process.env.AGENTMAIL_CONTACT_EMAIL || inbox;

    if (!apiKey || !contactEmail) {
      return { success: false, message: ENV_VAR_ERROR_MESSAGE };
    }

    const siteName = args.siteName || "Your Site";

    // Get stats from database
    const stats = await ctx.runQuery(internal.newsletter.getStatsForSummary, {
      now: Date.now(),
    });

    const client = new AgentMailClient({ apiKey });

    try {
      await client.inboxes.messages.send(inbox!, {
        to: contactEmail,
        subject: `Weekly Stats: ${stats.activeSubscribers} subscribers`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="font-size: 20px; color: #1a1a1a; margin-bottom: 16px;">Weekly Newsletter Stats</h2>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <p style="font-size: 14px; color: #444; line-height: 1.8; margin: 0;">
                <strong>Active Subscribers:</strong> ${stats.activeSubscribers}<br />
                <strong>Total Subscribers:</strong> ${stats.totalSubscribers}<br />
                <strong>New This Week:</strong> ${stats.newThisWeek}<br />
                <strong>Unsubscribed:</strong> ${stats.unsubscribedCount}<br />
                <strong>Newsletters Sent:</strong> ${stats.totalNewslettersSent}
              </p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #888;">
              This is an automated weekly summary from ${escapeHtml(siteName)}.
            </p>
          </div>
        `,
        text: `Weekly Newsletter Stats\n\nActive Subscribers: ${stats.activeSubscribers}\nTotal Subscribers: ${stats.totalSubscribers}\nNew This Week: ${stats.newThisWeek}\nUnsubscribed: ${stats.unsubscribedCount}\nNewsletters Sent: ${stats.totalNewslettersSent}`,
      });

      return { success: true, message: "Stats summary sent." };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { success: false, message: errorMessage };
    }
  },
});

// Send custom newsletter email to all active subscribers
// Supports markdown content that gets converted to HTML
export const sendCustomNewsletter = internalAction({
  args: {
    subject: v.string(),
    content: v.string(), // Markdown content
    siteUrl: v.string(),
    siteName: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    sentCount: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get subscribers
    const subscribers: Array<{ email: string; unsubscribeToken: string }> =
      await ctx.runQuery(internal.newsletter.getActiveSubscribers);

    if (subscribers.length === 0) {
      return { success: false, sentCount: 0, message: "No subscribers." };
    }

    // Get API key and inbox from environment
    const apiKey = process.env.AGENTMAIL_API_KEY;
    const inbox = process.env.AGENTMAIL_INBOX;

    if (!apiKey || !inbox) {
      return {
        success: false,
        sentCount: 0,
        message: ENV_VAR_ERROR_MESSAGE,
      };
    }

    const siteName = args.siteName || "Newsletter";
    let sentCount = 0;
    const errors: Array<string> = [];

    // Convert markdown to HTML and plain text
    const contentHtml = markdownToHtml(args.content);
    const contentText = markdownToText(args.content);

    // Initialize AgentMail client
    const client = new AgentMailClient({ apiKey });

    // Send to each subscriber
    for (const subscriber of subscribers) {
      const unsubscribeUrl = `${args.siteUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${subscriber.unsubscribeToken}`;

      // Build email HTML with styling
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          ${contentHtml}
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="font-size: 12px; color: #888;">
            You received this email because you subscribed to ${escapeHtml(siteName)}.<br />
            <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
          </p>
        </div>
      `;

      const text = `${contentText}\n\n---\nUnsubscribe: ${unsubscribeUrl}`;

      try {
        await client.inboxes.messages.send(inbox, {
          to: subscriber.email,
          subject: args.subject,
          html,
          text,
        });
        sentCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`${subscriber.email}: ${errorMessage}`);
      }
    }

    // Record custom email send if at least one email was sent
    if (sentCount > 0) {
      await ctx.runMutation(internal.newsletter.recordCustomSent, {
        subject: args.subject,
        sentCount,
      });
    }

    let resultMessage: string = `Sent to ${sentCount} of ${subscribers.length} subscribers.`;
    if (errors.length > 0) {
      resultMessage += ` ${errors.length} failed.`;
    }

    return { success: sentCount > 0, sentCount, message: resultMessage };
  },
});

