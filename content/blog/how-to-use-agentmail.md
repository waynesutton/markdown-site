---
title: "How to use AgentMail with Markdown Sync"
description: "Complete guide to setting up AgentMail for newsletters and contact forms in your markdown blog"
date: "2025-12-27"
slug: "how-to-use-agentmail"
published: true
featured: true
featuredOrder: 5
layout: "sidebar"
blogFeatured: true
image: /images/agentmail-blog.png
tags: ["agentmail", "newsletter", "email", "setup"]
docsSection: true
docsSectionOrder: 2
docsSectionGroup: "Components"
docsLanding: true
---

AgentMail provides email infrastructure for your markdown blog, enabling newsletter subscriptions, contact forms, and automated email notifications. This guide covers setup, configuration, and usage.

## What is AgentMail

AgentMail is an email service designed for AI agents and developers. It handles email sending and receiving without OAuth or MFA requirements, making it ideal for automated workflows.

For this markdown blog framework, AgentMail powers:

- Newsletter subscriptions and sending
- Contact forms on posts and pages
- Developer notifications for new subscribers
- Weekly digest emails
- Weekly stats summaries

## Setup

### 1. Create an AgentMail account

Sign up at [agentmail.to](https://agentmail.to) and create an inbox. Your inbox address will look like `yourname@agentmail.to`.

### 2. Get your API key

In the AgentMail dashboard, navigate to API settings and copy your API key. You'll need this for Convex environment variables.

### 3. Configure Convex environment variables

In your Convex dashboard, go to Settings > Environment Variables and add:

| Variable                  | Description                                           | Required |
| ------------------------- | ----------------------------------------------------- | -------- |
| `AGENTMAIL_API_KEY`       | Your AgentMail API key                                | Yes      |
| `AGENTMAIL_INBOX`         | Your inbox address (e.g., `markdown@agentmail.to`)    | Yes      |
| `AGENTMAIL_CONTACT_EMAIL` | Contact form recipient (defaults to inbox if not set) | No       |

**Important:** Never hardcode email addresses in your code. Always use environment variables.

### 4. Enable features in siteConfig

Edit `src/config/siteConfig.ts` to enable newsletter and contact form features:

```typescript
newsletter: {
  enabled: true,
  showOnHomepage: true,
  showOnBlogPage: true,
  showOnPosts: true,
  title: "Subscribe to the newsletter",
  description: "Get updates delivered to your inbox",
},

contactForm: {
  enabled: true,
  title: "Get in touch",
  description: "Send us a message",
},
```

## Newsletter features

### Subscriber management

The Newsletter Admin page at `/newsletter-admin` provides:

<img src="/images/newsletter-dashboard.png" alt="Newsletter Dashboard" />

- View all subscribers with search and filters
- Delete subscribers
- Send blog posts as newsletters
- Write and send custom emails with markdown support
- View email statistics dashboard
- Track recent sends (last 10)

### Sending newsletters

**Via CLI:**

```bash
# Send a specific post to all subscribers
npm run newsletter:send setup-guide

# Send weekly stats summary to your inbox
npm run newsletter:send:stats
```

**Via Admin UI:**

1. Navigate to `/newsletter-admin`
2. Select "Send Post" or "Write Email" from the sidebar
3. Choose a post or compose a custom email
4. Click "Send Newsletter"

### Customizing email footers

All newsletter emails include a footer with unsubscribe information. Edit the footer text in `convex/newsletterActions.ts`.

The footer appears in three functions:

**1. Post newsletter (`sendPostNewsletter`)**

HTML footer (lines 138-141):

```typescript
<p style="font-size: 12px; color: #888;">
  You received this email because you subscribed to ${escapeHtml(siteName)}.<br />
  <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
</p>
```

Plain text footer (line 146):

```typescript
const text = `${post.title}\n\n${post.description}\n\nRead more: ${postUrl}\n\n---\nUnsubscribe: ${unsubscribeUrl}`;
```

**2. Weekly digest (`sendWeeklyDigest`)**

HTML footer (lines 295-298):

```typescript
<p style="font-size: 12px; color: #888;">
  You received this email because you subscribed to ${escapeHtml(siteName)}.<br />
  <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
</p>
```

Plain text footer (line 302):

```typescript
const text = `Weekly Digest - ${recentPosts.length} new post${recentPosts.length > 1 ? "s" : ""}\n\n${postsText}\n\n---\nUnsubscribe: ${unsubscribeUrl}`;
```

**3. Custom newsletter (`sendCustomNewsletter`)**

HTML footer (lines 512-515):

```typescript
<p style="font-size: 12px; color: #888;">
  You received this email because you subscribed to ${escapeHtml(siteName)}.<br />
  <a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a>
</p>
```

Plain text footer (line 519):

```typescript
const text = `${contentText}\n\n---\nUnsubscribe: ${unsubscribeUrl}`;
```

**Customization options:**

- Change the message text ("You received this email because...")
- Modify the unsubscribe link text ("Unsubscribe")
- Adjust styling (font size, color, spacing)
- Add additional footer content

Edit all three locations to keep footers consistent across email types. The unsubscribe URL is automatically generated and must remain in the footer for compliance.

### Weekly digest

Automated weekly digest emails are sent every Sunday at 9:00 AM UTC. They include all posts published in the last 7 days.

Configure in `siteConfig.ts`:

```typescript
weeklyDigest: {
  enabled: true,
},
```

### Developer notifications

Receive email notifications when:

- A new subscriber signs up
- Weekly stats summary (every Monday at 9:00 AM UTC)

Configure in `siteConfig.ts`:

```typescript
newsletterNotifications: {
  enabled: true,
},
```

Notifications are sent to `AGENTMAIL_CONTACT_EMAIL` or `AGENTMAIL_INBOX` if contact email is not set.

## Contact forms

### Enable on posts and pages

Add `contactForm: true` to any post or page frontmatter:

```markdown
---
title: "Contact Us"
slug: "contact"
published: true
contactForm: true
---

Your page content here...
```

The contact form includes:

- Name field
- Email field
- Message field

Submissions are stored in Convex and sent via AgentMail to your configured recipient.

### Frontmatter options

| Field         | Type    | Description                           |
| ------------- | ------- | ------------------------------------- |
| `contactForm` | boolean | Enable contact form on this post/page |

## Frontmatter options

### Newsletter signup

Control newsletter signup display per post/page:

```markdown
---
title: "My Post"
newsletter: true # Show signup (default: follows siteConfig)
---
```

Or hide it:

```markdown
---
title: "My Post"
newsletter: false # Hide signup even if enabled globally
---
```

## Environment variables

All AgentMail features require these Convex environment variables:

**Required:**

- `AGENTMAIL_API_KEY` - Your AgentMail API key
- `AGENTMAIL_INBOX` - Your inbox address

**Optional:**

- `AGENTMAIL_CONTACT_EMAIL` - Contact form recipient (defaults to inbox)

**Note:** If environment variables are not configured, users will see: "AgentMail Environment Variables are not configured in production. Please set AGENTMAIL_API_KEY and AGENTMAIL_INBOX."

## CLI commands

| Command                          | Description                             |
| -------------------------------- | --------------------------------------- |
| `npm run newsletter:send <slug>` | Send a blog post to all subscribers     |
| `npm run newsletter:send:stats`  | Send weekly stats summary to your inbox |

## Troubleshooting

**Emails not sending:**

1. Verify `AGENTMAIL_API_KEY` and `AGENTMAIL_INBOX` are set in Convex dashboard
2. Check Convex function logs for error messages
3. Ensure your inbox is active in AgentMail dashboard

**Contact form not appearing:**

1. Verify `contactForm: true` is in frontmatter
2. Check `siteConfig.contactForm.enabled` is `true`
3. Run `npm run sync` to sync frontmatter changes

**Newsletter Admin not accessible:**

1. Verify `siteConfig.newsletterAdmin.enabled` is `true`
2. Navigate to `/newsletter-admin` directly (hidden from nav by default)

## Resources

- [AgentMail Documentation](https://docs.agentmail.to)
- [AgentMail Quickstart](https://docs.agentmail.to/quickstart)
- [AgentMail Sending & Receiving Email](https://docs.agentmail.to/sending-receiving-email)
- [AgentMail Inboxes](https://docs.agentmail.to/inboxes)

## Summary

AgentMail integration provides:

- Newsletter subscriptions and sending
- Contact forms on any post or page
- Automated weekly digests
- Developer notifications
- Admin UI for subscriber management
- CLI tools for sending newsletters and stats

All features use Convex environment variables for configuration. No hardcoded emails in your codebase.
