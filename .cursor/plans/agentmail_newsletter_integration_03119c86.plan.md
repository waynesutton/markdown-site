---
name: AgentMail Newsletter Integration
overview: |
  Integrate AgentMail for newsletter subscriptions with email-only signup. 
  All features are optional and configurable via siteConfig.ts and frontmatter.
  Phase 1 focuses on the signup form and subscriber management.
  Future phases add email sending, contact form, and advanced features.
todos:
  - id: p1a-site-config
    content: Add NewsletterConfig interface and defaults to siteConfig.ts (email-only signup)
    status: completed
  - id: p1a-schema-subscribers
    content: Add newsletterSubscribers table to convex/schema.ts
    status: completed
  - id: p1b-subscribe-mutation
    content: Create convex/newsletter.ts with subscribe mutation
    status: completed
    dependencies:
      - p1a-schema-subscribers
  - id: p1b-unsubscribe-mutation
    content: Add unsubscribe mutation with token verification to newsletter.ts
    status: completed
    dependencies:
      - p1a-schema-subscribers
  - id: p1b-subscriber-queries
    content: Add getSubscriberCount and getActiveSubscribers queries
    status: completed
    dependencies:
      - p1a-schema-subscribers
  - id: p1c-newsletter-component
    content: Create NewsletterSignup.tsx component (email-only input)
    status: completed
    dependencies:
      - p1a-site-config
  - id: p1c-css-styling
    content: Add newsletter component styles to global.css (all themes)
    status: completed
    dependencies:
      - p1c-newsletter-component
  - id: p1d-home-integration
    content: Add NewsletterSignup to Home.tsx (configurable position)
    status: completed
    dependencies:
      - p1c-newsletter-component
      - p1b-subscribe-mutation
  - id: p1d-blog-page-integration
    content: Add NewsletterSignup to Blog.tsx page
    status: completed
    dependencies:
      - p1c-newsletter-component
      - p1b-subscribe-mutation
  - id: p1d-post-integration
    content: Add NewsletterSignup to Post.tsx with frontmatter support
    status: completed
    dependencies:
      - p1c-newsletter-component
      - p1b-subscribe-mutation
  - id: p1e-unsubscribe-page
    content: Create Unsubscribe.tsx page component
    status: completed
    dependencies:
      - p1b-unsubscribe-mutation
  - id: p1e-unsubscribe-route
    content: Add /unsubscribe route to App.tsx
    status: completed
    dependencies:
      - p1e-unsubscribe-page
  - id: p2-schema-sent-posts
    content: Add newsletterSentPosts table to track sent newsletters
    status: completed
    dependencies:
      - p1a-schema-subscribers
  - id: p2-send-action
    content: Create sendPostNewsletter internalAction using AgentMail API
    status: completed
    dependencies:
      - p2-schema-sent-posts
      - p1b-subscriber-queries
  - id: p2-send-script
    content: Create scripts/send-newsletter.ts CLI tool
    status: completed
    dependencies:
      - p2-send-action
  - id: p2-package-scripts
    content: Add newsletter:send script to package.json
    status: completed
    dependencies:
      - p2-send-script
  - id: p3-fork-config
    content: Update fork-config.json.example with newsletter settings
    status: completed
    dependencies:
      - p1a-site-config
  - id: p3-fork-docs
    content: Update FORK_CONFIG.md with newsletter configuration docs
    status: completed
    dependencies:
      - p3-fork-config
  - id: p3-save-prd
    content: Save final plan as prds/agentmail-newsletter-v1.md
    status: completed
isProject: false
---

# AgentMail Newsletter Integration Plan (Phased)

## Overview

Integrate AgentMail as an optional newsletter system with email-only subscriptions. All features are optional and controlled via `siteConfig.ts` and frontmatter.

**Current Status:** AGENTMAIL_API_KEY is configured in Convex environment variables.

---

## How AgentMail Works

### Sending Emails to Your Inbox

AgentMail uses a REST API to send emails. Each inbox has a unique address:

```
{username}@{domain}
```

For example: `newsletter@mail.agentmail.to` or `newsletter@yourdomain.com`

### API Endpoint for Sending

```typescript
// AgentMail API to send an email
const response = await fetch("https://api.agentmail.to/v1/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.AGENTMAIL_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: {
      email: "newsletter@mail.agentmail.to", // Your AgentMail inbox
      name: "Your Site Name",
    },
    to: [{ email: "subscriber@example.com" }],
    subject: "New Post: Title Here",
    html: "<h1>New post published!</h1><p>Read more...</p>",
    text: "New post published! Read more...", // Plain text fallback
  }),
});
```

### Key Configuration

| Environment Variable | Description |

|---------------------|-------------|

| `AGENTMAIL_API_KEY` | Your AgentMail API key (already in Convex) |

| `AGENTMAIL_INBOX` | Your inbox address (e.g., `newsletter@mail.agentmail.to`) |

---

## Phase 1: Newsletter Signup (Current Focus)

This phase implements the subscriber collection system.

### Phase 1A: Configuration (Foundation)

**Sequential - Do First**

#### 1A.1: Site Config Updates

**File:** `src/config/siteConfig.ts`

```typescript
// Newsletter configuration (email-only signup)
export interface NewsletterConfig {
  enabled: boolean; // Master switch

  // AgentMail settings
  agentmail: {
    inbox: string; // Full inbox address (e.g., "newsletter@mail.agentmail.to")
  };

  // Signup form placement
  signup: {
    // Homepage signup
    home: {
      enabled: boolean;
      position: "above-footer" | "below-intro";
      title: string;
      description: string;
    };

    // Blog page (/blog) signup
    blogPage: {
      enabled: boolean;
      position: "above-footer" | "below-posts";
      title: string;
      description: string;
    };

    // Individual blog posts (can override via frontmatter)
    posts: {
      enabled: boolean; // Default for all posts
      position: "below-content";
      title: string;
      description: string;
    };
  };
}

// Add to SiteConfig interface
newsletter: NewsletterConfig;

// Default configuration (disabled)
newsletter: {
  enabled: false,
  agentmail: {
    inbox: "newsletter@mail.agentmail.to",
  },
  signup: {
    home: {
      enabled: false,
      position: "above-footer",
      title: "Stay Updated",
      description: "Get new posts delivered to your inbox.",
    },
    blogPage: {
      enabled: false,
      position: "above-footer",
      title: "Subscribe",
      description: "Get notified when new posts are published.",
    },
    posts: {
      enabled: false,
      position: "below-content",
      title: "Enjoyed this post?",
      description: "Subscribe for more updates.",
    },
  },
},
```

#### 1A.2: Schema Updates

**File:** `convex/schema.ts`

```typescript
// Newsletter subscribers table
newsletterSubscribers: defineTable({
  email: v.string(),
  subscribed: v.boolean(),
  subscribedAt: v.number(),
  unsubscribedAt: v.optional(v.number()),
  source: v.string(), // "home", "blog-page", "post", "post:slug-name"
  unsubscribeToken: v.string(),
})
  .index("by_email", ["email"])
  .index("by_subscribed", ["subscribed"]),
```

---

### Phase 1B: Backend Functions

**Can start after schema is deployed**

#### 1B.1: Subscribe Mutation

**File:** `convex/newsletter.ts`

```typescript
import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Generate secure unsubscribe token
function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// Subscribe to newsletter (email only)
export const subscribe = mutation({
  args: {
    email: v.string(),
    source: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Validate email format
    if (!email || !email.includes("@") || !email.includes(".")) {
      return { success: false, message: "Please enter a valid email address." };
    }

    // Check if already subscribed
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing && existing.subscribed) {
      return { success: false, message: "You're already subscribed!" };
    }

    const token = generateToken();

    if (existing) {
      // Re-subscribe
      await ctx.db.patch(existing._id, {
        subscribed: true,
        subscribedAt: Date.now(),
        source: args.source,
        unsubscribeToken: token,
        unsubscribedAt: undefined,
      });
    } else {
      // New subscriber
      await ctx.db.insert("newsletterSubscribers", {
        email,
        subscribed: true,
        subscribedAt: Date.now(),
        source: args.source,
        unsubscribeToken: token,
      });
    }

    return { success: true, message: "Thanks for subscribing!" };
  },
});
```

#### 1B.2: Unsubscribe Mutation

```typescript
// Unsubscribe from newsletter
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
    const email = args.email.toLowerCase().trim();

    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!subscriber) {
      return { success: false, message: "Email not found." };
    }

    if (subscriber.unsubscribeToken !== args.token) {
      return { success: false, message: "Invalid unsubscribe link." };
    }

    if (!subscriber.subscribed) {
      return { success: true, message: "You're already unsubscribed." };
    }

    await ctx.db.patch(subscriber._id, {
      subscribed: false,
      unsubscribedAt: Date.now(),
    });

    return { success: true, message: "You've been unsubscribed." };
  },
});
```

#### 1B.3: Subscriber Queries

```typescript
// Get subscriber count (for stats page)
export const getSubscriberCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const subscribers = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_subscribed", (q) => q.eq("subscribed", true))
      .collect();
    return subscribers.length;
  },
});

// Get active subscribers (internal, for sending)
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
      .collect();

    return subscribers.map((s) => ({
      email: s.email,
      unsubscribeToken: s.unsubscribeToken,
    }));
  },
});
```

---

### Phase 1C: Frontend Component

**Can work in parallel with Phase 1B**

#### 1C.1: NewsletterSignup Component

**File:** `src/components/NewsletterSignup.tsx`

```typescript
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import siteConfig from "../config/siteConfig";

interface NewsletterSignupProps {
  source: "home" | "blog-page" | "post";
  postSlug?: string; // For tracking which post they subscribed from
  title?: string;
  description?: string;
}

export default function NewsletterSignup({
  source,
  postSlug,
  title,
  description,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const subscribe = useMutation(api.newsletter.subscribe);

  // Check if newsletter is enabled
  if (!siteConfig.newsletter?.enabled) return null;

  // Get config for this placement
  const config = source === "home"
    ? siteConfig.newsletter.signup.home
    : source === "blog-page"
    ? siteConfig.newsletter.signup.blogPage
    : siteConfig.newsletter.signup.posts;

  if (!config.enabled) return null;

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email.");
      return;
    }

    setStatus("loading");

    try {
      const sourceValue = postSlug ? `post:${postSlug}` : source;
      const result = await subscribe({ email, source: sourceValue });

      if (result.success) {
        setStatus("success");
        setMessage(result.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(result.message);
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="newsletter-signup">
      <div className="newsletter-signup__content">
        <h3 className="newsletter-signup__title">{displayTitle}</h3>
        {displayDescription && (
          <p className="newsletter-signup__description">{displayDescription}</p>
        )}

        {status === "success" ? (
          <p className="newsletter-signup__success">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="newsletter-signup__form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="newsletter-signup__input"
              disabled={status === "loading"}
              aria-label="Email address"
            />
            <button
              type="submit"
              className="newsletter-signup__button"
              disabled={status === "loading"}
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="newsletter-signup__error">{message}</p>
        )}
      </div>
    </section>
  );
}
```

#### 1C.2: CSS Styling

**File:** `src/styles/global.css` (add to existing file)

```css
/* ═══════════════════════════════════════════════════════════════════════════
   Newsletter Signup Component
   ═══════════════════════════════════════════════════════════════════════════ */

.newsletter-signup {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
}

.newsletter-signup__content {
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
}

.newsletter-signup__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.newsletter-signup__description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
}

.newsletter-signup__form {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.newsletter-signup__input {
  flex: 1;
  max-width: 280px;
  padding: 0.625rem 0.875rem;
  font-size: 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
}

.newsletter-signup__input:focus {
  border-color: var(--accent-color, var(--text-primary));
}

.newsletter-signup__input::placeholder {
  color: var(--text-tertiary);
}

.newsletter-signup__button {
  padding: 0.625rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  background: var(--text-primary);
  color: var(--bg-primary);
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.newsletter-signup__button:hover:not(:disabled) {
  opacity: 0.85;
}

.newsletter-signup__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.newsletter-signup__success {
  padding: 0.75rem;
  background: var(--success-bg, rgba(34, 197, 94, 0.1));
  color: var(--success-text, #22c55e);
  border-radius: 6px;
  font-size: 0.9rem;
}

.newsletter-signup__error {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--error-color, #ef4444);
}

/* Mobile responsive */
@media (max-width: 480px) {
  .newsletter-signup__form {
    flex-direction: column;
  }

  .newsletter-signup__input {
    max-width: 100%;
  }

  .newsletter-signup__button {
    width: 100%;
  }
}
```

---

### Phase 1D: Integration Points

**After component and mutations are ready**

#### 1D.1: Home Page Integration

**File:** `src/pages/Home.tsx`

```typescript
// Import at top
import NewsletterSignup from "../components/NewsletterSignup";

// Add before footer section (find the footer JSX)
{siteConfig.newsletter?.enabled &&
 siteConfig.newsletter.signup.home.enabled && (
  <NewsletterSignup source="home" />
)}
```

#### 1D.2: Blog Page Integration

**File:** `src/pages/Blog.tsx`

```typescript
// Import at top
import NewsletterSignup from "../components/NewsletterSignup";

// Add before footer or after posts list
{siteConfig.newsletter?.enabled &&
 siteConfig.newsletter.signup.blogPage.enabled && (
  <NewsletterSignup source="blog-page" />
)}
```

#### 1D.3: Post Integration with Frontmatter

**File:** `src/pages/Post.tsx`

Posts can override the newsletter signup via frontmatter:

- `newsletter: false` - Hide newsletter on this post
- `newsletter: true` - Show newsletter (even if posts default is false)
- No frontmatter - Use siteConfig default

```typescript
// Import at top
import NewsletterSignup from "../components/NewsletterSignup";

// After post content, check frontmatter
const showNewsletter = post.newsletter !== undefined
  ? post.newsletter
  : siteConfig.newsletter?.signup.posts.enabled;

{siteConfig.newsletter?.enabled && showNewsletter && (
  <NewsletterSignup source="post" postSlug={post.slug} />
)}
```

**Schema update for posts table:**

```typescript
// Add to posts table in schema.ts
newsletter: v.optional(v.boolean()), // Override newsletter signup display
```

---

### Phase 1E: Unsubscribe Flow

**After mutations are ready**

#### 1E.1: Unsubscribe Page

**File:** `src/pages/Unsubscribe.tsx`

```typescript
import { useSearchParams, Link } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const unsubscribeMutation = useMutation(api.newsletter.unsubscribe);

  useEffect(() => {
    if (email && token) {
      handleUnsubscribe();
    }
  }, []);

  const handleUnsubscribe = async () => {
    if (!email || !token) {
      setStatus("error");
      setMessage("Invalid unsubscribe link.");
      return;
    }

    setStatus("loading");

    try {
      const result = await unsubscribeMutation({ email, token });
      setStatus(result.success ? "success" : "error");
      setMessage(result.message);
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="unsubscribe-page">
      <h1>Unsubscribe</h1>

      {status === "loading" && <p>Processing...</p>}

      {status === "success" && (
        <>
          <p className="unsubscribe-success">{message}</p>
          <Link to="/" className="unsubscribe-home-link">Back to home</Link>
        </>
      )}

      {status === "error" && (
        <p className="unsubscribe-error">{message}</p>
      )}

      {status === "idle" && !email && !token && (
        <p>Use the unsubscribe link from your email.</p>
      )}
    </div>
  );
}
```

#### 1E.2: Add Route

**File:** `src/App.tsx`

```typescript
import Unsubscribe from "./pages/Unsubscribe";

// Add route
<Route path="/unsubscribe" element={<Unsubscribe />} />
```

---

## Phase 2: Newsletter Sending (Future)

After Phase 1 is complete and subscribers are collecting.

### 2.1: Sent Posts Tracking

**Schema addition:**

```typescript
newsletterSentPosts: defineTable({
  postSlug: v.string(),
  sentAt: v.number(),
  sentCount: v.number(),
})
  .index("by_postSlug", ["postSlug"]),
```

### 2.2: Send Newsletter Action

**File:** `convex/newsletter.ts` (addition)

```typescript
import { internalAction } from "./_generated/server";

export const sendPostNewsletter = internalAction({
  args: {
    postSlug: v.string(),
    siteUrl: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    sentCount: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get subscribers
    const subscribers = await ctx.runQuery(internal.newsletter.getActiveSubscribers);

    if (subscribers.length === 0) {
      return { success: false, sentCount: 0, message: "No subscribers." };
    }

    // Get post details
    const post = await ctx.runQuery(internal.posts.getPostBySlugInternal, {
      slug: args.postSlug,
    });

    if (!post) {
      return { success: false, sentCount: 0, message: "Post not found." };
    }

    const apiKey = process.env.AGENTMAIL_API_KEY;
    const inbox = process.env.AGENTMAIL_INBOX;

    if (!apiKey || !inbox) {
      throw new Error("AGENTMAIL_API_KEY or AGENTMAIL_INBOX not configured");
    }

    let sentCount = 0;

    for (const subscriber of subscribers) {
      const unsubscribeUrl = `${args.siteUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${subscriber.unsubscribeToken}`;

      const html = `
        <h1>${post.title}</h1>
        <p>${post.description}</p>
        <p><a href="${args.siteUrl}/${post.slug}">Read more</a></p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          <a href="${unsubscribeUrl}">Unsubscribe</a>
        </p>
      `;

      try {
        await fetch("https://api.agentmail.to/v1/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: { email: inbox },
            to: [{ email: subscriber.email }],
            subject: `New: ${post.title}`,
            html,
          }),
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
      }
    }

    // Record sent
    await ctx.runMutation(internal.newsletter.recordPostSent, {
      postSlug: args.postSlug,
      sentCount,
    });

    return {
      success: true,
      sentCount,
      message: `Sent to ${sentCount} subscribers.`,
    };
  },
});
```

### 2.3: CLI Send Script

**File:** `scripts/send-newsletter.ts`

```typescript
import { ConvexHttpClient } from "convex/browser";
import { internal } from "../convex/_generated/api";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

const postSlug = process.argv[2];
const siteUrl = process.env.SITE_URL || "https://markdown.fast";

if (!postSlug) {
  console.error("Usage: npm run newsletter:send <post-slug>");
  process.exit(1);
}

async function send() {
  const result = await client.action(internal.newsletter.sendPostNewsletter, {
    postSlug,
    siteUrl,
  });

  console.log(result.message);
}

send();
```

---

## Future Features (Not in Phase 1 or 2)

These features are planned for later phases:

| Feature | Description | Priority |

|---------|-------------|----------|

| Contact Form | Name, email, message form using AgentMail | Medium |

| Email-to-Post | Send email to inbox, creates draft post | Low |

| Weekly Digest | Automated weekly email with new posts | Low |

| Developer Notifications | New subscriber alerts, stats summaries | Low |

| Double Opt-in | Confirmation email before subscribing | Medium |

| Subscriber Admin | View/manage subscribers in admin UI | Medium |

### Contact Form (Phase 3)

Will use a separate inbox and include:

- Name field (required)
- Email field (required)
- Message textarea (required)
- Sends to: `contact@mail.agentmail.to`

---

## Phase Dependencies Diagram

```
Phase 1A (Config + Schema) ─┬─► Phase 1B (Backend) ─┬─► Phase 1D (Integration)
                            │                       │
                            └─► Phase 1C (Frontend) ┘
                                                    │
                                                    └─► Phase 1E (Unsubscribe)
                                                              │
                                                              ▼
                                                        Phase 2 (Sending)
                                                              │
                                                              ▼
                                                        Phase 3 (Contact)
```

---

## Environment Variables

| Variable | Location | Description |

|----------|----------|-------------|

| `AGENTMAIL_API_KEY` | Convex Dashboard | Your AgentMail API key |

| `AGENTMAIL_INBOX` | Convex Dashboard | Your inbox (e.g., `newsletter@mail.agentmail.to`) |

| `SITE_URL` | .env.local | Your site URL for unsubscribe links |

---

## Testing Checklist

### Phase 1

- [x] Newsletter signup appears on homepage when enabled
- [ x Newsletter signup appears on /blog page when enabled
- [x] Newsletter signup appears on posts when enabled
- [x] Frontmatter `newsletter: false` hides signup on specific post
- [ x] Email saves to Convex database
- [ x] Duplicate email shows "already subscribed" message
- [ ] Unsubscribe link works with token verification
- [x] All color themes display correctly

### Phase 2

- [ ] `npm run newsletter:send <slug>` sends to all subscribers
- [ ] Sent posts are tracked to prevent duplicates
- [ ] Unsubscribe link in email works
