import { execa } from 'execa';
import ora from 'ora';
import open from 'open';
import { log, sleep, getInstallCommand, getRunCommand } from './utils.js';

export async function installDependencies(
  projectDir: string,
  packageManager: string
): Promise<void> {
  const spinner = ora('Installing dependencies...').start();

  try {
    const [cmd, ...args] = getInstallCommand(packageManager);

    await execa(cmd, args, {
      cwd: projectDir,
      stdio: 'pipe', // Suppress output
    });

    spinner.succeed('Dependencies installed');
  } catch (error) {
    spinner.fail('Failed to install dependencies');

    if (error instanceof Error) {
      log.error(error.message);
    }

    throw error;
  }
}

export async function runInitialSync(
  projectDir: string,
  packageManager: string
): Promise<void> {
  const spinner = ora('Running initial content sync...').start();

  try {
    const [cmd, ...args] = getRunCommand(packageManager, 'sync');

    await execa(cmd, args, {
      cwd: projectDir,
      stdio: 'pipe',
    });

    spinner.succeed('Initial sync completed');
  } catch {
    // Sync often fails on first run because Convex functions need to be deployed first
    // This is expected and not an error - just inform the user what to do
    spinner.stop();
    log.warn('Sync requires Convex functions to be deployed first');
    log.info('After setup completes, run: npx convex dev');
    log.info('Then in another terminal: npm run sync');
  }
}

export async function startDevServer(
  projectDir: string,
  packageManager: string
): Promise<void> {
  const spinner = ora('Starting development server...').start();

  try {
    const [cmd, ...args] = getRunCommand(packageManager, 'dev');

    // Start dev server in detached mode (won't block)
    const devProcess = execa(cmd, args, {
      cwd: projectDir,
      detached: true,
      stdio: 'ignore',
    });

    // Unref to allow parent process to exit
    devProcess.unref();

    spinner.succeed('Development server starting');

    // Wait for server to be ready
    log.info('Waiting for server to start...');
    await sleep(3000);

    // Open browser
    await open('http://localhost:5173');
    log.success('Opened browser at http://localhost:5173');
  } catch (error) {
    spinner.fail('Failed to start development server');

    if (error instanceof Error) {
      log.warn('You can start the server manually with: npm run dev');
    }
  }
}
