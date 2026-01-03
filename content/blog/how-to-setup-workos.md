---
title: "How to setup WorkOS with Markdown Sync"
description: "Step-by-step guide to configure WorkOS AuthKit authentication for your markdown blog dashboard. WorkOS is optional and can be enabled in siteConfig.ts."
date: "2025-12-29"
slug: "how-to-setup-workos"
published: true
tags: ["workos", "authentication", "tutorial", "dashboard"]
readTime: "10 min read"
featured: true
featuredOrder: 4
layout: "sidebar"
image: /images/workos.png
excerpt: "Complete guide to setting up WorkOS AuthKit authentication for your dashboard. WorkOS is optional and can be configured in siteConfig.ts."
docsSection: true
docsSectionOrder: 2
docsSectionGroup: "Components"
docsSectionGroupIcon: "PuzzlePiece"
docsLanding: true
---

# How to setup WorkOS

WorkOS AuthKit adds authentication to your markdown blog dashboard. It's optional—you can use the dashboard without WorkOS, or enable authentication for production sites.

## Overview

WorkOS AuthKit provides:

- Password authentication
- Social login (Google, GitHub, etc.)
- SSO support
- User management
- Session handling

The dashboard at `/dashboard` can work with or without WorkOS. Configure it in `siteConfig.ts`:

```typescript
dashboard: {
  enabled: true,
  requireAuth: false, // Set to true to require WorkOS authentication
},
```

When `requireAuth` is `false`, the dashboard is open access. When `requireAuth` is `true` and WorkOS is configured, users must log in to access the dashboard.

## Prerequisites

Before starting, make sure you have:

- Node.js 18 or higher
- A working markdown blog project
- A Convex account and project set up
- Your Convex development server running (`npx convex dev`)

## Step 1: Create a WorkOS account

### Sign up

1. Go to [workos.com/sign-up](https://signin.workos.com/sign-up)
2. Create a free account with your email
3. Verify your email address

### Set up AuthKit

1. Log into the [WorkOS Dashboard](https://dashboard.workos.com)
2. Navigate to **Authentication** → **AuthKit**
3. Click the **Set up AuthKit** button
4. Select **"Use AuthKit's customizable hosted UI"**
5. Click **Begin setup**

### Configure redirect URI

During the AuthKit setup wizard, you'll reach step 4: **"Add default redirect endpoint URI"**

Enter this for local development:

```
http://localhost:5173/callback
```

After a user logs in, WorkOS redirects them back to this URL with an authorization code. Your app exchanges this code for user information.

### Copy your credentials

1. Go to [dashboard.workos.com/get-started](https://dashboard.workos.com/get-started)
2. Under **Quick start**, find and copy:
   - **Client ID** (looks like `client_01XXXXXXXXXXXXXXXXX`)

Save this somewhere safe—you'll need it shortly.

## Step 2: Configure WorkOS dashboard

### Enable CORS

For the React SDK to work, you need to allow your app's domain:

1. Go to **Authentication** → **Sessions** in the WorkOS Dashboard
2. Find **Cross-Origin Resource Sharing (CORS)**
3. Click **Manage**
4. Add your development URL: `http://localhost:5173`
5. Click **Save**

When you deploy to production (e.g., Netlify), add your production domain here too (e.g., `https://yoursite.netlify.app`).

### Verify redirect URI

1. Go to **Redirects** in the WorkOS Dashboard
2. Confirm `http://localhost:5173/callback` is listed
3. If not, add it by clicking **Add redirect**

## Step 3: Install dependencies

Open your terminal in the project folder and install the required packages:

```bash
npm install @workos-inc/authkit-react @convex-dev/workos
```

**What these packages do:**

| Package                     | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| `@workos-inc/authkit-react` | WorkOS React SDK for handling login/logout |
| `@convex-dev/workos`        | Bridges WorkOS auth with Convex backend    |

## Step 4: Add environment variables

### Update `.env.local`

Open your `.env.local` file (in the project root) and add these lines:

```env
# Existing Convex URL (should already be here)
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# WorkOS AuthKit Configuration (add these)
VITE_WORKOS_CLIENT_ID=client_01XXXXXXXXXXXXXXXXX
VITE_WORKOS_REDIRECT_URI=http://localhost:5173/callback
```

Replace `client_01XXXXXXXXXXXXXXXXX` with your actual Client ID from the WorkOS Dashboard.

Vite only exposes environment variables that start with `VITE_` to the browser.

### Add to `.gitignore`

Make sure `.env.local` is in your `.gitignore` to avoid committing secrets:

```
.env.local
.env.production.local
```

## Step 5: Configure Convex auth

Create a new file to tell Convex how to validate WorkOS tokens.

### Create `convex/auth.config.ts`

Create a new file at `convex/auth.config.ts`:

```typescript
// convex/auth.config.ts
const clientId = process.env.WORKOS_CLIENT_ID;

const authConfig = {
  providers: [
    {
      type: "customJwt",
      issuer: "https://api.workos.com/",
      algorithm: "RS256",
      applicationID: clientId,
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
    },
    {
      type: "customJwt",
      issuer: `https://api.workos.com/user_management/${clientId}`,
      algorithm: "RS256",
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
    },
  ],
};

export default authConfig;
```

### Add environment variable to Convex

The Convex backend needs the Client ID too:

1. Run `npx convex dev` if not already running
2. You'll see an error with a link—click it
3. It takes you to the Convex Dashboard environment variables page
4. Add a new variable:
   - **Name**: `WORKOS_CLIENT_ID`
   - **Value**: Your WorkOS Client ID (e.g., `client_01XXXXXXXXXXXXXXXXX`)
5. Save

After saving, `npx convex dev` should show "Convex functions ready."

## Step 6: Update site configuration

Enable authentication in your site config:

```typescript
// src/config/siteConfig.ts
dashboard: {
  enabled: true,
  requireAuth: true, // Set to true to require WorkOS authentication
},
```

When `requireAuth` is `true` and WorkOS is configured, the dashboard requires login. When `requireAuth` is `false`, the dashboard is open access.

## Step 7: Test locally

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/dashboard`

3. You should see a login prompt (if `requireAuth: true`) or the dashboard (if `requireAuth: false`)

4. If authentication is enabled, click "Sign in" to test the WorkOS login flow

5. After logging in, you should be redirected back to the dashboard

## Step 8: Deploy to production

### Add production environment variables

In your Netlify dashboard (or hosting provider), add these environment variables:

- `VITE_WORKOS_CLIENT_ID` - Your WorkOS Client ID
- `VITE_WORKOS_REDIRECT_URI` - Your production callback URL (e.g., `https://yoursite.netlify.app/callback`)

### Update WorkOS redirect URI

1. Go to **Redirects** in the WorkOS Dashboard
2. Add your production callback URL: `https://yoursite.netlify.app/callback`
3. Click **Save**

### Update CORS settings

1. Go to **Authentication** → **Sessions** in the WorkOS Dashboard
2. Find **Cross-Origin Resource Sharing (CORS)**
3. Click **Manage**
4. Add your production domain: `https://yoursite.netlify.app`
5. Click **Save**

### Add Convex environment variable

In your Convex Dashboard, add the `WORKOS_CLIENT_ID` environment variable for your production deployment:

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your production project
3. Navigate to Settings → Environment Variables
4. Add `WORKOS_CLIENT_ID` with your Client ID value
5. Save

## How it works

When WorkOS is configured and `requireAuth: true`:

1. User navigates to `/dashboard`
2. Dashboard checks authentication status
3. If not authenticated, shows login prompt
4. User clicks "Sign in" and is redirected to WorkOS
5. User logs in with WorkOS (password, social, or SSO)
6. WorkOS redirects back to `/callback` with authorization code
7. App exchanges code for user information
8. User is redirected to `/dashboard` as authenticated user

When WorkOS is not configured or `requireAuth: false`:

1. User navigates to `/dashboard`
2. Dashboard shows content directly (no authentication required)

## Troubleshooting

**Dashboard shows "Authentication Required" message:**

- Verify `VITE_WORKOS_CLIENT_ID` and `VITE_WORKOS_REDIRECT_URI` are set in `.env.local`
- Check that `WORKOS_CLIENT_ID` is set in Convex environment variables
- Ensure `requireAuth: true` in `siteConfig.ts`

**Login redirect not working:**

- Verify redirect URI matches exactly in WorkOS Dashboard
- Check CORS settings include your domain
- Ensure callback route is configured in `App.tsx`

**"WorkOS is not configured" message:**

- Check that both `VITE_WORKOS_CLIENT_ID` and `VITE_WORKOS_REDIRECT_URI` are set
- Verify environment variables are loaded (check browser console)
- Restart development server after adding environment variables

**Convex auth errors:**

- Verify `WORKOS_CLIENT_ID` is set in Convex environment variables
- Check that `convex/auth.config.ts` exists and is correct
- Ensure Convex functions are deployed (`npx convex deploy`)

## Optional configuration

WorkOS is optional. You can:

- Use the dashboard without WorkOS (`requireAuth: false`)
- Enable WorkOS later when you need authentication
- Configure WorkOS for production only

The dashboard works with or without WorkOS. Configure it based on your needs.

## Next steps

After setting up WorkOS:

1. Test the authentication flow locally
2. Deploy to production with production environment variables
3. Add additional redirect URIs if needed
4. Configure social login providers in WorkOS Dashboard
5. Set up SSO if needed for your organization

See [How to use the Markdown sync dashboard](https://www.markdown.fast/how-to-use-the-markdown-sync-dashboard) for dashboard usage.
