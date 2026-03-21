import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Submit contact form message
// Stores the message and schedules email sending via AgentMail
export const submitContact = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    source: v.string(), // "page:slug" or "post:slug"
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    await ctx.auth.getUserIdentity();

    // Validate required fields
    const name = args.name.trim();
    const email = args.email.toLowerCase().trim();
    const message = args.message.trim();

    if (!name) {
      return { success: false, message: "Please enter your name." };
    }

    if (!email || !email.includes("@") || !email.includes(".")) {
      return { success: false, message: "Please enter a valid email address." };
    }

    if (!message) {
      return { success: false, message: "Please enter a message." };
    }

    // Check environment variables before proceeding
    // Note: We can't access process.env in mutations, so we check in the action
    // But we can still store the message and let the action handle the error
    // For now, we'll store the message and let the action fail silently
    // The user will see a success message but email won't send if env vars are missing

    // Store the message
    const messageId = await ctx.db.insert("contactMessages", {
      name,
      email,
      message,
      source: args.source,
      createdAt: Date.now(),
    });

    // Schedule email sending via Node.js action
    // The action will check env vars and fail silently if not configured
    await ctx.scheduler.runAfter(0, internal.contactActions.sendContactEmail, {
      messageId,
      name,
      email,
      message,
      source: args.source,
    });

    return {
      success: true,
      message: "Thanks for your message! We'll get back to you soon.",
    };
  },
});

// Mark contact message as email sent
// Internal mutation to update emailSentAt timestamp
export const markEmailSent = internalMutation({
  args: {
    messageId: v.id("contactMessages"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      emailSentAt: Date.now(),
    });
    return null;
  },
});
