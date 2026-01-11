#!/usr/bin/env node

import { printBanner, printSuccess, log } from './utils.js';
import { runWizard } from './wizard.js';
import { cloneTemplate, cleanupClonedFiles } from './clone.js';
import { configureProject } from './configure.js';
import { installDependencies, runInitialSync, startDevServer } from './install.js';
import { setupConvex } from './convex-setup.js';

const VERSION = '0.1.0';

async function main(): Promise<void> {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const projectName = args.find(arg => !arg.startsWith('-'));
  const force = args.includes('--force') || args.includes('-f');
  const skipConvex = args.includes('--skip-convex');
  const skipOpen = args.includes('--skip-open');
  const showHelp = args.includes('--help') || args.includes('-h');
  const showVersion = args.includes('--version') || args.includes('-v');

  // Handle --version
  if (showVersion) {
    console.log(`create-markdown-sync v${VERSION}`);
    process.exit(0);
  }

  // Handle --help
  if (showHelp) {
    console.log(`
create-markdown-sync v${VERSION}

Create a markdown-sync site with a single command.

Usage:
  npx create-markdown-sync [project-name] [options]

Options:
  -f, --force       Overwrite existing directory
  --skip-convex     Skip Convex setup
  --skip-open       Don't open browser after setup
  -h, --help        Show this help message
  -v, --version     Show version number

Examples:
  npx create-markdown-sync my-blog
  npx create-markdown-sync my-site --force
  npx create-markdown-sync my-app --skip-convex

Documentation: https://www.markdown.fast/docs
`);
    process.exit(0);
  }

  // Print welcome banner
  printBanner(VERSION);

  try {
    // Run interactive wizard
    const answers = await runWizard(projectName);

    if (!answers) {
      log.error('Setup cancelled');
      process.exit(1);
    }

    console.log('');
    log.step(`Creating project in ./${answers.projectName}`);
    console.log('');

    // Step 1: Clone template
    const projectDir = await cloneTemplate({
      projectName: answers.projectName,
      force,
    });

    // Step 2: Clean up cloned files
    await cleanupClonedFiles(projectDir);

    // Step 3: Configure project
    await configureProject(projectDir, answers);

    // Step 4: Install dependencies
    await installDependencies(projectDir, answers.packageManager);

    // Step 5: Setup Convex (if not skipped)
    let convexSetup = false;
    if (answers.initConvex && !skipConvex) {
      convexSetup = await setupConvex(projectDir, answers.convexProjectName);
    }

    // Step 6: Run initial sync (only if Convex is set up)
    if (convexSetup) {
      await runInitialSync(projectDir, answers.packageManager);
    }

    // Step 7: Start dev server and open browser
    if (!skipOpen) {
      await startDevServer(projectDir, answers.packageManager);
    }

    // Print success message
    printSuccess(answers.projectName);
  } catch (error) {
    console.log('');

    if (error instanceof Error) {
      log.error(error.message);
    } else {
      log.error('An unexpected error occurred');
    }

    process.exit(1);
  }
}

main();
