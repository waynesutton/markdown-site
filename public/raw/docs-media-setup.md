# Media Upload Setup

---
Type: page
Date: 2026-01-11
---

Set up image uploads for the dashboard using ConvexFS and Bunny.net CDN.

## ConvexFS Documentation

This media library is powered by [ConvexFS](https://convexfs.dev/), a virtual filesystem for Convex with CDN integration.

**Resources:**
- [ConvexFS Documentation](https://convexfs.dev/) - Complete setup guides, API reference, and examples
- [ConvexFS GitHub](https://github.com/jamwt/convex-fs) - Source code and issues

For detailed setup instructions including app configuration, garbage collection, file expiration, and advanced features, follow the official ConvexFS documentation.

## Overview

The media library allows you to upload images directly from the dashboard and insert them into your content. Images are stored on Bunny.net Edge Storage and served via their global CDN for fast delivery.

## Prerequisites

- A Bunny.net account
- Convex project deployed
- Access to Convex Dashboard environment variables

## Create Bunny.net account

1. Go to [bunny.net](https://bunny.net) and sign up
2. Bunny offers a 14-day free trial with no credit card required
3. After trial, storage costs around $0.01/GB/month

## Create storage zone

1. In the Bunny Dashboard, go to **Storage** in the sidebar
2. Click **Add Storage Zone**
3. Configure your storage zone:
   - **Name**: Choose a unique name (e.g., `mysite-media`)
   - **Main Storage Region**: Select the region closest to your users
   - **Replication Regions**: Optional, select additional regions for redundancy
4. Click **Create Storage Zone**

## Set up Pull Zone (CDN)

1. After creating the storage zone, click **Connected Pull Zone**
2. Create a new pull zone or connect to an existing one
3. Note your **Pull Zone Hostname** (e.g., `mysite-media.b-cdn.net`)
4. Enable **Token Authentication** under Security settings for signed URLs

## Get API credentials

From your Bunny Dashboard, collect these values:

| Credential | Location |
|------------|----------|
| **API Key** | Account > API > API Key (password icon) |
| **Storage Zone Name** | Storage > [Your Zone] > Name |
| **CDN Hostname** | Storage > [Your Zone] > Connected Pull Zone hostname |
| **Token Key** | Pull Zone > Security > Token Authentication > Token Key |

## Add environment variables

### Local development (.env.local)

Create or edit `.env.local` in your project root:

```bash
BUNNY_API_KEY=your-api-key-here
BUNNY_STORAGE_ZONE=your-zone-name
BUNNY_CDN_HOSTNAME=your-zone.b-cdn.net
BUNNY_TOKEN_KEY=your-token-key
```

### Convex Dashboard

1. Go to your project in the [Convex Dashboard](https://dashboard.convex.dev)
2. Navigate to **Settings** > **Environment Variables**
3. Add each of these variables:
   - `BUNNY_API_KEY`
   - `BUNNY_STORAGE_ZONE`
   - `BUNNY_CDN_HOSTNAME`
   - `BUNNY_TOKEN_KEY` (optional, for signed URLs)

4. Click **Save**

## Deploy changes

After setting environment variables:

```bash
npx convex deploy
```

This pushes the ConvexFS configuration with your Bunny credentials.

## Test upload workflow

1. Go to Dashboard > Create > Media
2. Click the upload zone or drag an image
3. Verify the image appears in the grid
4. Click **MD** to copy markdown and paste in a post

## Using in content

### Media Library

Access the Media Library from Dashboard sidebar under **Create > Media**. From here you can:

- Upload multiple images via drag-and-drop
- Copy markdown, HTML, or direct URL
- Select multiple images for bulk delete
- View file sizes

### Bulk delete

To delete multiple images at once:

1. Click the **Select** button in the toolbar
2. Click images to select them (or use **Select All**)
3. Click **Delete (N)** to remove selected images
4. Confirm deletion in the dialog

### Insert in editor

When writing a post or page in the dashboard:

1. Click the **Image** button in the toolbar
2. Choose **Upload New** to upload a new image, or **Media Library** to select an existing image
3. After selecting/uploading, you'll see:
   - Image preview with original dimensions (e.g., 1920 x 1080px)
   - Alt text field for accessibility
   - Size presets: Original, Large (1200px), Medium (800px), Small (400px), Thumbnail (200px), or Custom
4. Choose a size - the display shows the calculated dimensions with aspect ratio preserved
5. Click **Insert** to add the image to your content

### Size options

| Preset | Max Width | Use Case |
|--------|-----------|----------|
| Original | Full size | High-resolution displays |
| Large | 1200px | Hero images, full-width content |
| Medium | 800px | Standard content images |
| Small | 400px | Thumbnails, sidebars |
| Thumbnail | 200px | Grids, galleries |
| Custom | Any | Specific dimensions needed |

When using a size other than Original, images are inserted with explicit width/height attributes to prevent layout shift.

### Frontmatter images

For post header images, upload via Media Library then copy the URL:

```yaml
---
title: "My Post"
image: https://your-zone.b-cdn.net/uploads/12345-image.png
---
```

## Configuration options

In `siteConfig.ts`:

```typescript
media: {
  enabled: true,           // Toggle media features
  maxFileSize: 10,         // Max file size in MB
  allowedTypes: [          // Allowed MIME types
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp"
  ],
}
```

## Troubleshooting

### "Upload failed" error

- Verify all four environment variables are set in Convex Dashboard
- Check that the API key has write permissions
- Ensure the storage zone name matches exactly

### Images not loading

- Verify the CDN hostname is correct
- Check the Pull Zone is connected to your Storage Zone
- Try accessing the image URL directly in browser

### 403 Forbidden errors

- Token authentication may be blocking unsigned requests
- Either disable token auth in Pull Zone settings
- Or ensure `BUNNY_TOKEN_KEY` is set correctly

### Files uploading but not visible

- Check browser console for errors
- Verify the `/fs/upload` route is registered in `http.ts`
- Run `npx convex deploy` to sync configuration

## File organization

Uploaded files are stored at `/uploads/{timestamp}-{filename}`:

```
/uploads/
  1704067200000-hero-image.png
  1704067201000-screenshot.jpg
  1704067202000-diagram.webp
```

Timestamps ensure unique filenames and provide chronological ordering.

## Cost estimate

Bunny.net pricing (as of 2024):

| Service | Cost |
|---------|------|
| Storage | $0.01/GB/month |
| Bandwidth (EU/US) | $0.01/GB |
| Bandwidth (APAC) | $0.03/GB |

For a typical blog with 1GB of images and 10GB monthly bandwidth: ~$0.11/month.