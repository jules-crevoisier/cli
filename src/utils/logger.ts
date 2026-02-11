import chalk from 'chalk';

export const logger = {
  banner(): void {
    console.log('');
    console.log(chalk.bold.cyan('  letscraft'));
    console.log(chalk.gray('  Scaffold modern web projects with Docker'));
    console.log('');
  },

  info(message: string): void {
    console.log(chalk.blue('i ') + message);
  },

  success(projectName: string, isJs: boolean = true): void {
    console.log('');
    console.log(chalk.green.bold('✔ Success!') + ` Project "${projectName}" created.`);
    console.log('');
    console.log('  Next steps:');
    console.log('');
    console.log(chalk.cyan(`    cd ${projectName}`));

    if (isJs) {
      console.log(chalk.cyan('    npm install'));
      console.log(chalk.cyan('    docker compose up -d        # Start databases'));
      console.log(chalk.cyan('    npm run dev                 # Start app'));
    } else {
      console.log(chalk.cyan('    docker compose up --watch   # Start app + databases'));
    }

    console.log('');
  },

  error(message: string): void {
    console.error(chalk.red.bold('Error: ') + message);
  },

  warn(message: string): void {
    console.warn(chalk.yellow('Warning: ') + message);
  },

  versionRow(name: string, current: string, latest: string | null): void {
    const nameCol = name.padEnd(16);
    const currentCol = `(default: ${current})`.padEnd(20);
    const latestCol = latest ? chalk.green(latest) : chalk.yellow('unavailable');
    console.log(`  ${nameCol} ${chalk.gray(currentCol)} latest: ${latestCol}`);
  },
};
