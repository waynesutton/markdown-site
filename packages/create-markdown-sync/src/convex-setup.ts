import { execa } from 'execa';
import ora from 'ora';
import { log } from './utils.js';

export async function setupConvex(
  projectDir: string,
  projectName: string
): Promise<boolean> {
  const spinner = ora('Setting up Convex...').start();

  try {
    // Check if user is logged in to Convex
    spinner.text = 'Checking Convex authentication...';

    const { stdout: whoami } = await execa('npx', ['convex', 'whoami'], {
      cwd: projectDir,
      reject: false,
    });

    // If not logged in, prompt for login
    if (!whoami || whoami.includes('Not logged in')) {
      spinner.text = 'Opening browser for Convex login...';

      await execa('npx', ['convex', 'login'], {
        cwd: projectDir,
        stdio: 'inherit', // Show login flow
      });
    }

    // Initialize Convex project
    // Stop spinner to allow interactive prompts from Convex CLI
    spinner.stop();
    console.log('');
    log.step('Initializing Convex project...');
    console.log('');

    // Use convex dev --once to set up project without running in watch mode
    // This creates .env.local with CONVEX_URL
    // stdio: 'inherit' allows user to respond to Convex prompts (new project vs existing)
    await execa('npx', ['convex', 'dev', '--once'], {
      cwd: projectDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        // Set project name if needed
        CONVEX_PROJECT_NAME: projectName,
      },
    });

    console.log('');
    log.success('Convex project initialized');
    return true;
  } catch (error) {
    // Spinner may already be stopped, so use log.error instead
    spinner.stop();

    // Check if .env.local was created despite the error
    // This happens when Convex project is created but auth config has missing env vars
    const fs = await import('fs');
    const path = await import('path');
    const envLocalPath = path.join(projectDir, '.env.local');

    if (fs.existsSync(envLocalPath)) {
      const envContent = fs.readFileSync(envLocalPath, 'utf-8');
      if (envContent.includes('CONVEX_DEPLOYMENT') || envContent.includes('VITE_CONVEX_URL')) {
        // Convex was set up, just auth config had issues (missing WORKOS_CLIENT_ID etc)
        console.log('');
        log.success('Convex project created');
        log.warn('Auth config has missing environment variables (optional)');
        log.info('Set them up later in the Convex dashboard if you want authentication');
        return true;
      }
    }

    log.error('Convex setup failed');

    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        log.error('Convex CLI not found. Install with: npm install -g convex');
      } else {
        log.error(error.message);
      }
    }

    log.warn('You can set up Convex later with: npx convex dev');
    return false;
  }
}

export async function deployConvexFunctions(projectDir: string): Promise<void> {
  const spinner = ora('Deploying Convex functions...').start();

  try {
    await execa('npx', ['convex', 'deploy'], {
      cwd: projectDir,
      stdio: 'pipe',
    });

    spinner.succeed('Convex functions deployed');
  } catch (error) {
    spinner.fail('Convex deployment failed');

    if (error instanceof Error) {
      log.warn('You can deploy later with: npx convex deploy');
    }
  }
}
