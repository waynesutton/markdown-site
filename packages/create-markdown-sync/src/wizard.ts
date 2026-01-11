import prompts from 'prompts';
import {
  printSection,
  isValidEmail,
  isValidUrl,
  extractDomain,
  extractGitHubUsername,
  extractTwitterHandle,
  detectPackageManager,
} from './utils.js';

// Wizard answers interface matching fork-config.json structure
export interface WizardAnswers {
  // Section 1: Project Setup
  projectName: string;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';

  // Section 2: Site Identity
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;

  // Section 3: Creator Info
  creatorName: string;
  twitter: string;
  linkedin: string;
  github: string;

  // Section 4: GitHub Repository
  githubUsername: string;
  githubRepo: string;
  branch: string;
  contentPath: string;

  // Section 5: Appearance
  theme: 'dark' | 'light' | 'tan' | 'cloud';
  fontFamily: 'serif' | 'sans' | 'monospace';
  bio: string;

  // Section 6: Homepage & Featured
  homepageType: 'default' | 'page' | 'post';
  featuredViewMode: 'cards' | 'list';
  featuredTitle: string;
  showViewToggle: boolean;

  // Section 7: Blog & Posts
  blogPageEnabled: boolean;
  blogPageTitle: string;
  showPostsOnHome: boolean;
  homePostsLimit: number;
  homePostsReadMoreEnabled: boolean;
  homePostsReadMoreText: string;
  homePostsReadMoreLink: string;

  // Section 8: Features
  logoGalleryEnabled: boolean;
  logoGalleryScrolling: boolean;
  githubContributionsEnabled: boolean;
  githubContributionsUsername: string;
  visitorMapEnabled: boolean;
  statsPageEnabled: boolean;
  imageLightboxEnabled: boolean;

  // Section 9: Footer & Social
  footerEnabled: boolean;
  footerDefaultContent: string;
  socialFooterEnabled: boolean;
  socialFooterShowInHeader: boolean;
  copyrightSiteName: string;

  // Section 10: Newsletter & Contact
  newsletterEnabled: boolean;
  newsletterHomeEnabled: boolean;
  contactFormEnabled: boolean;
  contactFormTitle: string;

  // Section 11: Advanced Features
  mcpServerEnabled: boolean;
  semanticSearchEnabled: boolean;
  askAIEnabled: boolean;
  dashboardEnabled: boolean;
  dashboardRequireAuth: boolean;

  // Section 12: Twitter/X Config
  twitterSite: string;
  twitterCreator: string;

  // Section 13: Convex Setup
  initConvex: boolean;
  convexProjectName: string;
}

const TOTAL_SECTIONS = 13;

export async function runWizard(initialProjectName?: string): Promise<WizardAnswers | null> {
  const answers: Partial<WizardAnswers> = {};

  // Handle cancellation
  const onCancel = () => {
    console.log('\nSetup cancelled.');
    process.exit(0);
  };

  // SECTION 1: Project Setup
  printSection('Project Setup', 1, TOTAL_SECTIONS);

  const section1 = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name (directory)',
      initial: initialProjectName || 'my-markdown-site',
      validate: (value: string) => {
        if (!value.trim()) return 'Project name is required';
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) return 'Only letters, numbers, hyphens, and underscores';
        return true;
      },
    },
    {
      type: 'select',
      name: 'packageManager',
      message: 'Package manager',
      choices: [
        { title: 'npm', value: 'npm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'pnpm', value: 'pnpm' },
        { title: 'bun', value: 'bun' },
      ],
      initial: ['npm', 'yarn', 'pnpm', 'bun'].indexOf(detectPackageManager()),
    },
  ], { onCancel });

  Object.assign(answers, section1);

  // SECTION 2: Site Identity
  printSection('Site Identity', 2, TOTAL_SECTIONS);

  const section2 = await prompts([
    {
      type: 'text',
      name: 'siteName',
      message: 'Site name',
      initial: 'My Site',
    },
    {
      type: 'text',
      name: 'siteTitle',
      message: 'Tagline',
      initial: 'A markdown-powered site',
    },
    {
      type: 'text',
      name: 'siteDescription',
      message: 'Description (one sentence)',
      initial: 'A site built with markdown-sync framework.',
    },
    {
      type: 'text',
      name: 'siteUrl',
      message: 'Site URL',
      initial: `https://${answers.projectName}.netlify.app`,
      validate: (value: string) => isValidUrl(value) || 'Enter a valid URL',
    },
    {
      type: 'text',
      name: 'contactEmail',
      message: 'Contact email',
      validate: (value: string) => !value || isValidEmail(value) || 'Enter a valid email',
    },
  ], { onCancel });

  Object.assign(answers, section2);

  // SECTION 3: Creator Info
  printSection('Creator Info', 3, TOTAL_SECTIONS);

  const section3 = await prompts([
    {
      type: 'text',
      name: 'creatorName',
      message: 'Your name',
    },
    {
      type: 'text',
      name: 'twitter',
      message: 'Twitter/X URL',
      initial: 'https://x.com/',
    },
    {
      type: 'text',
      name: 'linkedin',
      message: 'LinkedIn URL',
      initial: 'https://linkedin.com/in/',
    },
    {
      type: 'text',
      name: 'github',
      message: 'GitHub URL',
      initial: 'https://github.com/',
    },
  ], { onCancel });

  Object.assign(answers, section3);

  // SECTION 4: GitHub Repository
  printSection('GitHub Repository', 4, TOTAL_SECTIONS);

  const section4 = await prompts([
    {
      type: 'text',
      name: 'githubUsername',
      message: 'GitHub username',
      initial: extractGitHubUsername(answers.github || ''),
    },
    {
      type: 'text',
      name: 'githubRepo',
      message: 'Repository name',
      initial: answers.projectName,
    },
    {
      type: 'text',
      name: 'branch',
      message: 'Default branch',
      initial: 'main',
    },
    {
      type: 'text',
      name: 'contentPath',
      message: 'Content path',
      initial: 'public/raw',
    },
  ], { onCancel });

  Object.assign(answers, section4);

  // SECTION 5: Appearance
  printSection('Appearance', 5, TOTAL_SECTIONS);

  const section5 = await prompts([
    {
      type: 'select',
      name: 'theme',
      message: 'Default theme',
      choices: [
        { title: 'Tan (warm)', value: 'tan' },
        { title: 'Light', value: 'light' },
        { title: 'Dark', value: 'dark' },
        { title: 'Cloud (blue-gray)', value: 'cloud' },
      ],
      initial: 0,
    },
    {
      type: 'select',
      name: 'fontFamily',
      message: 'Font family',
      choices: [
        { title: 'Sans-serif (system fonts)', value: 'sans' },
        { title: 'Serif (New York)', value: 'serif' },
        { title: 'Monospace (IBM Plex Mono)', value: 'monospace' },
      ],
      initial: 0,
    },
    {
      type: 'text',
      name: 'bio',
      message: 'Bio text',
      initial: 'Your content is instantly available to browsers, LLMs, and AI agents.',
    },
  ], { onCancel });

  Object.assign(answers, section5);

  // SECTION 6: Homepage & Featured
  printSection('Homepage & Featured', 6, TOTAL_SECTIONS);

  const section6 = await prompts([
    {
      type: 'select',
      name: 'homepageType',
      message: 'Homepage type',
      choices: [
        { title: 'Default (standard homepage)', value: 'default' },
        { title: 'Page (use a static page)', value: 'page' },
        { title: 'Post (use a blog post)', value: 'post' },
      ],
      initial: 0,
    },
    {
      type: 'select',
      name: 'featuredViewMode',
      message: 'Featured section view',
      choices: [
        { title: 'Cards (grid with excerpts)', value: 'cards' },
        { title: 'List (bullet list)', value: 'list' },
      ],
      initial: 0,
    },
    {
      type: 'text',
      name: 'featuredTitle',
      message: 'Featured section title',
      initial: 'Get started:',
    },
    {
      type: 'confirm',
      name: 'showViewToggle',
      message: 'Show view toggle button?',
      initial: true,
    },
  ], { onCancel });

  Object.assign(answers, section6);

  // SECTION 7: Blog & Posts
  printSection('Blog & Posts', 7, TOTAL_SECTIONS);

  const section7 = await prompts([
    {
      type: 'confirm',
      name: 'blogPageEnabled',
      message: 'Enable dedicated /blog page?',
      initial: true,
    },
    {
      type: (prev: boolean) => prev ? 'text' : null,
      name: 'blogPageTitle',
      message: 'Blog page title',
      initial: 'Blog',
    },
    {
      type: 'confirm',
      name: 'showPostsOnHome',
      message: 'Show posts on homepage?',
      initial: true,
    },
    {
      type: (prev: boolean) => prev ? 'number' : null,
      name: 'homePostsLimit',
      message: 'Posts limit on homepage (0 for all)',
      initial: 5,
      min: 0,
      max: 100,
    },
    {
      type: (prev: number, values: { showPostsOnHome: boolean }) =>
        values.showPostsOnHome && prev > 0 ? 'confirm' : null,
      name: 'homePostsReadMoreEnabled',
      message: 'Show "read more" link?',
      initial: true,
    },
    {
      type: (prev: boolean) => prev ? 'text' : null,
      name: 'homePostsReadMoreText',
      message: 'Read more text',
      initial: 'Read more blog posts',
    },
    {
      type: (prev: string) => prev ? 'text' : null,
      name: 'homePostsReadMoreLink',
      message: 'Read more link URL',
      initial: '/blog',
    },
  ], { onCancel });

  // Set defaults for skipped questions (spread first, then defaults)
  Object.assign(answers, {
    ...section7,
    blogPageTitle: section7.blogPageTitle || 'Blog',
    homePostsLimit: section7.homePostsLimit ?? 5,
    homePostsReadMoreEnabled: section7.homePostsReadMoreEnabled ?? true,
    homePostsReadMoreText: section7.homePostsReadMoreText || 'Read more blog posts',
    homePostsReadMoreLink: section7.homePostsReadMoreLink || '/blog',
  });

  // SECTION 8: Features
  printSection('Features', 8, TOTAL_SECTIONS);

  const section8 = await prompts([
    {
      type: 'confirm',
      name: 'logoGalleryEnabled',
      message: 'Enable logo gallery?',
      initial: true,
    },
    {
      type: (prev: boolean) => prev ? 'confirm' : null,
      name: 'logoGalleryScrolling',
      message: 'Scrolling marquee?',
      initial: false,
    },
    {
      type: 'confirm',
      name: 'githubContributionsEnabled',
      message: 'Enable GitHub contributions graph?',
      initial: true,
    },
    {
      type: (prev: boolean) => prev ? 'text' : null,
      name: 'githubContributionsUsername',
      message: 'GitHub username for contributions',
      initial: answers.githubUsername,
    },
    {
      type: 'confirm',
      name: 'visitorMapEnabled',
      message: 'Enable visitor map on stats page?',
      initial: false,
    },
    {
      type: 'confirm',
      name: 'statsPageEnabled',
      message: 'Enable public stats page?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'imageLightboxEnabled',
      message: 'Enable image lightbox (click to magnify)?',
      initial: true,
    },
  ], { onCancel });

  Object.assign(answers, {
    ...section8,
    logoGalleryScrolling: section8.logoGalleryScrolling ?? false,
    githubContributionsUsername: section8.githubContributionsUsername || answers.githubUsername,
  });

  // SECTION 9: Footer & Social
  printSection('Footer & Social', 9, TOTAL_SECTIONS);

  const section9 = await prompts([
    {
      type: 'confirm',
      name: 'footerEnabled',
      message: 'Enable footer?',
      initial: true,
    },
    {
      type: (prev: boolean) => prev ? 'text' : null,
      name: 'footerDefaultContent',
      message: 'Footer content (markdown)',
      initial: 'Built with [Convex](https://convex.dev) for real-time sync.',
    },
    {
      type: 'confirm',
      name: 'socialFooterEnabled',
      message: 'Enable social footer (icons + copyright)?',
      initial: true,
    },
    {
      type: (prev: boolean) => prev ? 'confirm' : null,
      name: 'socialFooterShowInHeader',
      message: 'Show social icons in header?',
      initial: true,
    },
    {
      type: (prev: boolean, values: { socialFooterEnabled: boolean }) =>
        values.socialFooterEnabled ? 'text' : null,
      name: 'copyrightSiteName',
      message: 'Copyright site name',
      initial: answers.siteName,
    },
  ], { onCancel });

  Object.assign(answers, {
    ...section9,
    footerDefaultContent: section9.footerDefaultContent || '',
    socialFooterShowInHeader: section9.socialFooterShowInHeader ?? true,
    copyrightSiteName: section9.copyrightSiteName || answers.siteName,
  });

  // SECTION 10: Newsletter & Contact
  printSection('Newsletter & Contact', 10, TOTAL_SECTIONS);

  const section10 = await prompts([
    {
      type: 'confirm',
      name: 'newsletterEnabled',
      message: 'Enable newsletter signups?',
      initial: false,
      hint: 'Requires AgentMail setup',
    },
    {
      type: (prev: boolean) => prev ? 'confirm' : null,
      name: 'newsletterHomeEnabled',
      message: 'Show signup on homepage?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'contactFormEnabled',
      message: 'Enable contact form?',
      initial: false,
      hint: 'Requires AgentMail setup',
    },
    {
      type: (prev: boolean) => prev ? 'text' : null,
      name: 'contactFormTitle',
      message: 'Contact form title',
      initial: 'Get in Touch',
    },
  ], { onCancel });

  Object.assign(answers, {
    ...section10,
    newsletterHomeEnabled: section10.newsletterHomeEnabled ?? false,
    contactFormTitle: section10.contactFormTitle || 'Get in Touch',
  });

  // SECTION 11: Advanced Features
  printSection('Advanced Features', 11, TOTAL_SECTIONS);

  const section11 = await prompts([
    {
      type: 'confirm',
      name: 'mcpServerEnabled',
      message: 'Enable MCP server for AI tools?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'semanticSearchEnabled',
      message: 'Enable semantic search?',
      initial: false,
      hint: 'Requires OpenAI API key',
    },
    {
      type: 'confirm',
      name: 'askAIEnabled',
      message: 'Enable Ask AI header button?',
      initial: false,
      hint: 'Requires semantic search + LLM API key',
    },
    {
      type: 'confirm',
      name: 'dashboardEnabled',
      message: 'Enable admin dashboard?',
      initial: true,
    },
    {
      type: (prev: boolean) => prev ? 'confirm' : null,
      name: 'dashboardRequireAuth',
      message: 'Require authentication for dashboard?',
      initial: false,
      hint: 'Requires WorkOS setup',
    },
  ], { onCancel });

  Object.assign(answers, {
    ...section11,
    dashboardRequireAuth: section11.dashboardRequireAuth ?? false,
  });

  // SECTION 12: Twitter/X Config
  printSection('Twitter/X Config', 12, TOTAL_SECTIONS);

  const section12 = await prompts([
    {
      type: 'text',
      name: 'twitterSite',
      message: 'Twitter site handle',
      initial: extractTwitterHandle(answers.twitter || ''),
      hint: 'For Twitter Cards',
    },
    {
      type: 'text',
      name: 'twitterCreator',
      message: 'Twitter creator handle',
      initial: extractTwitterHandle(answers.twitter || ''),
    },
  ], { onCancel });

  Object.assign(answers, section12);

  // SECTION 13: Convex Setup
  printSection('Convex Setup', 13, TOTAL_SECTIONS);

  const section13 = await prompts([
    {
      type: 'confirm',
      name: 'initConvex',
      message: 'Initialize Convex project now?',
      initial: true,
      hint: 'Opens browser for login',
    },
    {
      type: (prev: boolean) => prev ? 'text' : null,
      name: 'convexProjectName',
      message: 'Convex project name',
      initial: answers.projectName,
    },
  ], { onCancel });

  Object.assign(answers, {
    ...section13,
    convexProjectName: section13.convexProjectName || answers.projectName,
  });

  return answers as WizardAnswers;
}
