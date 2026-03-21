"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { AgentMailClient } from "agentmail";

// Send contact form email via AgentMail SDK
// Internal action that sends email to configured recipient
// Uses official AgentMail SDK: https://docs.agentmail.to/quickstart
export const sendContactEmail = internalAction({
  args: {
    messageId: v.id("contactMessages"),
    name: v.string(),
    email: v.string(),
    message: v.string(),
    source: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const apiKey = process.env.AGENTMAIL_API_KEY;
    const inbox = process.env.AGENTMAIL_INBOX;
    const recipientEmail = process.env.AGENTMAIL_CONTACT_EMAIL || inbox;

    if (!apiKey || !inbox || !recipientEmail) {
      return null;
    }

    try {
      const client = new AgentMailClient({ apiKey });
      await client.inboxes.messages.send(inbox, {
        to: recipientEmail,
        subject: `Contact: ${args.name} via ${args.source}`,
        text: buildContactText(args),
        html: buildContactHtml(args),
      });
      await ctx.runMutation(internal.contact.markEmailSent, {
        messageId: args.messageId,
      });
    } catch {
      // Silently fail on send error
    }

    return null;
  },
});

type ContactFields = { name: string; email: string; message: string; source: string };

function buildContactHtml(f: ContactFields): string {
  const n = escapeHtml(f.name);
  const e = escapeHtml(f.email);
  const s = escapeHtml(f.source);
  const m = escapeHtml(f.message);
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto">
<h2 style="font-size:20px;color:#1a1a1a;margin-bottom:16px">New Contact Form Submission</h2>
<table style="width:100%;border-collapse:collapse">
<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600;width:100px">From:</td><td style="padding:8px 0;border-bottom:1px solid #eee">${n}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">Email:</td><td style="padding:8px 0;border-bottom:1px solid #eee"><a href="mailto:${e}">${e}</a></td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-weight:600">Source:</td><td style="padding:8px 0;border-bottom:1px solid #eee">${s}</td></tr>
</table>
<h3 style="font-size:16px;color:#1a1a1a;margin:24px 0 8px 0">Message:</h3>
<div style="background:#f9f9f9;padding:16px;border-radius:6px;white-space:pre-wrap">${m}</div>
</div>`;
}

function buildContactText(f: ContactFields): string {
  return `New Contact Form Submission\n\nFrom: ${f.name}\nEmail: ${f.email}\nSource: ${f.source}\n\nMessage:\n${f.message}`;
}

// Helper function to escape HTML entities
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
