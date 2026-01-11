import { downloadTemplate } from 'giget';
import { existsSync } from 'fs';
import { resolve } from 'path';
import ora from 'ora';
import { log } from './utils.js';

const TEMPLATE_REPO = 'github:waynesutton/markdown-site';

export interface CloneOptions {
  projectName: string;
  cwd?: string;
  force?: boolean;
}

export async function cloneTemplate(options: CloneOptions): Promise<string> {
  const { projectName, cwd = process.cwd(), force = false } = options;
  const targetDir = resolve(cwd, projectName);

  // Check if directory already exists
  if (existsSync(targetDir) && !force) {
    throw new Error(
      `Directory "${projectName}" already exists. Use --force to overwrite.`
    );
  }

  const spinner = ora('Cloning markdown-sync template...').start();

  try {
    await downloadTemplate(TEMPLATE_REPO, {
      dir: targetDir,
      force,
      preferOffline: false,
    });

    spinner.succeed('Template cloned successfully');
    return targetDir;
  } catch (error) {
    spinner.fail('Failed to clone template');

    if (error instanceof Error) {
      if (error.message.includes('404')) {
        log.error('Template repository not found. Please check the repository URL.');
      } else if (error.message.includes('network')) {
        log.error('Network error. Please check your internet connection.');
      } else {
        log.error(error.message);
      }
    }

    throw error;
  }
}

// Remove files that shouldn't be in the cloned project
export async function cleanupClonedFiles(projectDir: string): Promise<void> {
  const { rm } = await import('fs/promises');
  const { join } = await import('path');

  const filesToRemove = [
    // Remove CLI package from cloned repo (it's installed via npm)
    'packages',
    // Remove any existing fork-config.json (will be regenerated)
    'fork-config.json',
    // Remove git history for fresh start
    '.git',
  ];

  for (const file of filesToRemove) {
    const filePath = join(projectDir, file);
    try {
      await rm(filePath, { recursive: true, force: true });
    } catch {
      // Ignore if file doesn't exist
    }
  }
}
