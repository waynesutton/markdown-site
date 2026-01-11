import kleur from 'kleur';

// Sleep helper for async delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return '';
  }
}

// Validate GitHub username (alphanumeric and hyphens)
export function isValidGitHubUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
  return usernameRegex.test(username);
}

// Extract GitHub username from URL
export function extractGitHubUsername(url: string): string {
  const match = url.match(/github\.com\/([^\/]+)/);
  return match ? match[1] : '';
}

// Extract Twitter handle from URL
export function extractTwitterHandle(url: string): string {
  const match = url.match(/(?:twitter\.com|x\.com)\/([^\/]+)/);
  return match ? `@${match[1]}` : '';
}

// Logging helpers with colors
export const log = {
  info: (msg: string) => console.log(kleur.blue('i') + ' ' + msg),
  success: (msg: string) => console.log(kleur.green('✓') + ' ' + msg),
  warn: (msg: string) => console.log(kleur.yellow('!') + ' ' + msg),
  error: (msg: string) => console.log(kleur.red('✗') + ' ' + msg),
  step: (msg: string) => console.log(kleur.cyan('→') + ' ' + msg),
  dim: (msg: string) => console.log(kleur.dim(msg)),
};

// Print a section header
export function printSection(title: string, current: number, total: number): void {
  console.log('');
  console.log(kleur.bold().cyan(`[${current}/${total}] ${title}`));
  console.log(kleur.dim('─'.repeat(40)));
}

// Print welcome banner
export function printBanner(version: string): void {
  console.log('');
  console.log(kleur.bold().cyan('create-markdown-sync') + kleur.dim(` v${version}`));
  console.log('');
}

// Print success message with next steps
export function printSuccess(projectName: string): void {
  console.log('');
  console.log(kleur.bold().green('Success!') + ' Your site is ready.');
  console.log('');
  console.log('Next steps:');
  console.log(kleur.cyan(`  cd ${projectName}`));
  console.log(kleur.cyan('  npx convex dev') + kleur.dim('    # Start Convex (required first time)'));
  console.log(kleur.cyan('  npm run sync') + kleur.dim('     # Sync content (in another terminal)'));
  console.log(kleur.cyan('  npm run dev') + kleur.dim('      # Start dev server'));
  console.log('');
  console.log('Resources:');
  console.log(kleur.dim('  Docs:       https://www.markdown.fast/docs'));
  console.log(kleur.dim('  Deployment: https://www.markdown.fast/docs-deployment'));
  console.log(kleur.dim('  WorkOS:     https://www.markdown.fast/how-to-setup-workos'));
  console.log('');
  console.log(kleur.dim('To remove and start over:'));
  console.log(kleur.dim(`  rm -rf ${projectName}`));
  console.log(kleur.dim(`  npx create-markdown-sync ${projectName}`));
  console.log('');
}

// Detect available package manager
export function detectPackageManager(): 'npm' | 'yarn' | 'pnpm' | 'bun' {
  const userAgent = process.env.npm_config_user_agent || '';
  if (userAgent.includes('yarn')) return 'yarn';
  if (userAgent.includes('pnpm')) return 'pnpm';
  if (userAgent.includes('bun')) return 'bun';
  return 'npm';
}

// Get install command for package manager
export function getInstallCommand(pm: string): string[] {
  switch (pm) {
    case 'yarn':
      return ['yarn'];
    case 'pnpm':
      return ['pnpm', 'install'];
    case 'bun':
      return ['bun', 'install'];
    default:
      return ['npm', 'install'];
  }
}

// Get run command for package manager
export function getRunCommand(pm: string, script: string): string[] {
  switch (pm) {
    case 'yarn':
      return ['yarn', script];
    case 'pnpm':
      return ['pnpm', script];
    case 'bun':
      return ['bun', 'run', script];
    default:
      return ['npm', 'run', script];
  }
}
