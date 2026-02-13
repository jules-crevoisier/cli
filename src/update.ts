import { execSync } from 'child_process';
import chalk from 'chalk';
import { CLI_VERSION } from './version';

/**
 * Check the latest version on npm and update if needed
 */
export async function updateCli(): Promise<void> {
  const currentVersion = CLI_VERSION;

  console.log('');
  console.log(chalk.bold.cyan('  letscraft — Update'));
  console.log('');
  console.log(`  Current version: ${chalk.gray(currentVersion)}`);

  // Fetch latest version from npm
  let latestVersion: string;
  try {
    latestVersion = execSync('npm view letscraft version', {
      encoding: 'utf-8',
      timeout: 10000,
    }).trim();
  } catch {
    console.log(chalk.yellow('  Could not check for updates. Are you connected to the internet?'));
    console.log('');
    return;
  }

  console.log(`  Latest version:  ${chalk.green(latestVersion)}`);
  console.log('');

  if (currentVersion === latestVersion) {
    console.log(chalk.green('  ✔ You are already on the latest version!'));
    console.log('');
    return;
  }

  console.log(chalk.blue('  Updating letscraft...'));
  console.log('');

  try {
    execSync('npm install -g letscraft@latest', {
      encoding: 'utf-8',
      stdio: 'inherit',
      timeout: 60000,
    });

    console.log('');
    console.log(chalk.green.bold('  ✔ Updated successfully!') + ` ${currentVersion} → ${latestVersion}`);
    console.log('');
  } catch (error) {
    console.log('');
    console.log(chalk.yellow('  Could not update automatically.'));
    if (error instanceof Error && error.message) {
      console.log(chalk.gray(`  Reason: ${error.message}`));
    }
    console.log(chalk.yellow('  Try running manually:'));
    console.log(chalk.cyan('    npm install -g letscraft@latest'));
    console.log('');
  }
}
