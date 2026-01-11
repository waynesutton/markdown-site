import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execa } from 'execa';
import ora from 'ora';
import type { WizardAnswers } from './wizard.js';
import { log, extractDomain } from './utils.js';

// Fix template siteConfig.ts to have clean values before running configure-fork.ts
// This is needed because the template may have values with embedded quotes that break regex
function fixTemplateSiteConfig(projectDir: string): void {
  const siteConfigPath = join(projectDir, 'src/config/siteConfig.ts');
  let content = readFileSync(siteConfigPath, 'utf-8');

  // Fix name field - replace any problematic value with a clean placeholder
  // Match: name: 'anything' or name: "anything" (properly handling escaped quotes)
  content = content.replace(
    /name: ['"].*?["'](?:.*?['"])?,/,
    'name: "markdown-sync",'
  );

  // Also try a more aggressive fix for malformed values
  content = content.replace(
    /name: '.*?framework',/,
    'name: "markdown-sync",'
  );

  writeFileSync(siteConfigPath, content, 'utf-8');
}

// Create empty auth config when user doesn't need authentication
// This prevents WorkOS env var errors from blocking Convex setup
function disableAuthConfig(projectDir: string): void {
  const authConfigPath = join(projectDir, 'convex/auth.config.ts');

  // Replace with empty auth config (no providers)
  const emptyAuthConfig = `// Auth configuration (WorkOS disabled)
// To enable WorkOS authentication, see: https://docs.convex.dev/auth/authkit/
//
// 1. Create a WorkOS account at https://workos.com
// 2. Set WORKOS_CLIENT_ID in your Convex dashboard environment variables
// 3. Replace this file with the WorkOS auth config

const authConfig = {
  providers: [],
};

export default authConfig;
`;

  writeFileSync(authConfigPath, emptyAuthConfig, 'utf-8');
}

// Convert wizard answers to fork-config.json structure
function buildForkConfig(answers: WizardAnswers): Record<string, unknown> {
  return {
    siteName: answers.siteName,
    siteTitle: answers.siteTitle,
    siteDescription: answers.siteDescription,
    siteUrl: answers.siteUrl,
    siteDomain: extractDomain(answers.siteUrl),
    githubUsername: answers.githubUsername,
    githubRepo: answers.githubRepo,
    contactEmail: answers.contactEmail,
    creator: {
      name: answers.creatorName,
      twitter: answers.twitter,
      linkedin: answers.linkedin,
      github: answers.github,
    },
    bio: answers.bio,
    gitHubRepoConfig: {
      owner: answers.githubUsername,
      repo: answers.githubRepo,
      branch: answers.branch,
      contentPath: answers.contentPath,
    },
    logoGallery: {
      enabled: answers.logoGalleryEnabled,
      title: 'Built with',
      scrolling: answers.logoGalleryScrolling,
      maxItems: 4,
    },
    gitHubContributions: {
      enabled: answers.githubContributionsEnabled,
      username: answers.githubContributionsUsername,
      showYearNavigation: true,
      linkToProfile: true,
      title: 'GitHub Activity',
    },
    visitorMap: {
      enabled: answers.visitorMapEnabled,
      title: 'Live Visitors',
    },
    blogPage: {
      enabled: answers.blogPageEnabled,
      showInNav: true,
      title: answers.blogPageTitle,
      description: 'All posts from the blog, sorted by date.',
      order: 2,
    },
    postsDisplay: {
      showOnHome: answers.showPostsOnHome,
      showOnBlogPage: true,
      homePostsLimit: answers.homePostsLimit || undefined,
      homePostsReadMore: answers.homePostsReadMoreEnabled
        ? {
            enabled: true,
            text: answers.homePostsReadMoreText,
            link: answers.homePostsReadMoreLink,
          }
        : {
            enabled: false,
            text: 'Read more blog posts',
            link: '/blog',
          },
    },
    featuredViewMode: answers.featuredViewMode,
    showViewToggle: answers.showViewToggle,
    theme: answers.theme,
    fontFamily: answers.fontFamily,
    homepage: {
      type: answers.homepageType,
      slug: null,
      originalHomeRoute: '/home',
    },
    rightSidebar: {
      enabled: true,
      minWidth: 1135,
    },
    footer: {
      enabled: answers.footerEnabled,
      showOnHomepage: true,
      showOnPosts: true,
      showOnPages: true,
      showOnBlogPage: true,
      defaultContent: answers.footerDefaultContent,
    },
    socialFooter: {
      enabled: answers.socialFooterEnabled,
      showOnHomepage: true,
      showOnPosts: true,
      showOnPages: true,
      showOnBlogPage: true,
      showInHeader: answers.socialFooterShowInHeader,
      socialLinks: [
        {
          platform: 'github',
          url: `https://github.com/${answers.githubUsername}/${answers.githubRepo}`,
        },
        {
          platform: 'twitter',
          url: answers.twitter,
        },
        {
          platform: 'linkedin',
          url: answers.linkedin,
        },
      ],
      copyright: {
        siteName: answers.copyrightSiteName,
        showYear: true,
      },
    },
    aiChat: {
      enabledOnWritePage: false,
      enabledOnContent: false,
    },
    aiDashboard: {
      enableImageGeneration: true,
      defaultTextModel: 'claude-sonnet-4-20250514',
      textModels: [
        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic' },
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google' },
      ],
      imageModels: [
        { id: 'gemini-2.0-flash-exp-image-generation', name: 'Nano Banana', provider: 'google' },
        { id: 'imagen-3.0-generate-002', name: 'Nano Banana Pro', provider: 'google' },
      ],
    },
    newsletter: {
      enabled: answers.newsletterEnabled,
      agentmail: {
        inbox: 'newsletter@mail.agentmail.to',
      },
      signup: {
        home: {
          enabled: answers.newsletterHomeEnabled,
          position: 'above-footer',
          title: 'Stay Updated',
          description: 'Get new posts delivered to your inbox.',
        },
        blogPage: {
          enabled: answers.newsletterEnabled,
          position: 'above-footer',
          title: 'Subscribe',
          description: 'Get notified when new posts are published.',
        },
        posts: {
          enabled: answers.newsletterEnabled,
          position: 'below-content',
          title: 'Enjoyed this post?',
          description: 'Subscribe for more updates.',
        },
      },
    },
    contactForm: {
      enabled: answers.contactFormEnabled,
      title: answers.contactFormTitle,
      description: 'Send us a message and we\'ll get back to you.',
    },
    newsletterAdmin: {
      enabled: false,
      showInNav: false,
    },
    newsletterNotifications: {
      enabled: false,
      newSubscriberAlert: false,
      weeklyStatsSummary: false,
    },
    weeklyDigest: {
      enabled: false,
      dayOfWeek: 0,
      subject: 'Weekly Digest',
    },
    statsPage: {
      enabled: answers.statsPageEnabled,
      showInNav: answers.statsPageEnabled,
    },
    mcpServer: {
      enabled: answers.mcpServerEnabled,
      endpoint: '/mcp',
      publicRateLimit: 50,
      authenticatedRateLimit: 1000,
      requireAuth: false,
    },
    imageLightbox: {
      enabled: answers.imageLightboxEnabled,
    },
    dashboard: {
      enabled: answers.dashboardEnabled,
      requireAuth: answers.dashboardRequireAuth,
    },
    semanticSearch: {
      enabled: answers.semanticSearchEnabled,
    },
    twitter: {
      site: answers.twitterSite,
      creator: answers.twitterCreator,
    },
    askAI: {
      enabled: answers.askAIEnabled,
      defaultModel: 'claude-sonnet-4-20250514',
      models: [
        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic' },
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
      ],
    },
  };
}

export async function configureProject(
  projectDir: string,
  answers: WizardAnswers
): Promise<void> {
  const spinner = ora('Generating configuration...').start();

  try {
    // 1. Fix template siteConfig.ts to have clean values (fixes embedded quote issues)
    fixTemplateSiteConfig(projectDir);

    // 2. Disable auth config if user doesn't need authentication
    // This prevents WorkOS env var errors from blocking Convex setup
    if (!answers.dashboardRequireAuth) {
      disableAuthConfig(projectDir);
    }

    // 3. Build fork-config.json content
    const forkConfig = buildForkConfig(answers);

    // 4. Write fork-config.json
    const configPath = join(projectDir, 'fork-config.json');
    writeFileSync(configPath, JSON.stringify(forkConfig, null, 2));
    spinner.text = 'Running configuration script...';

    // 5. Run existing configure-fork.ts script with --silent flag
    await execa('npx', ['tsx', 'scripts/configure-fork.ts', '--silent'], {
      cwd: projectDir,
      stdio: 'pipe', // Capture output
    });

    spinner.succeed('Site configured successfully');
  } catch (error) {
    spinner.fail('Configuration failed');

    if (error instanceof Error) {
      log.error(error.message);
    }

    throw error;
  }
}
