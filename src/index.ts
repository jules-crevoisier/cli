import { Command } from 'commander';
import { runInteractivePrompts } from './prompts';
import { createProject } from './generators/base';
import { checkVersions } from './versions/checker';
import { logger } from './utils/logger';
import { isJsStack } from './utils/stacks';

const packageJson = require('../package.json');

const program = new Command();

program
  .name('letscraft')
  .description('Scaffold modern web development projects with Docker')
  .version(packageJson.version);

// Default command: create a project
program
  .argument('[project-name]', 'Name for the new project')
  .option('--check-updates', 'Check for latest versions of frameworks and tools')
  .option('--stack <type>', 'Project stack: nextjs, vite-react, nuxt, vite-react-express, express, symfony, or laravel')
  .option('--db <databases>', 'Databases (comma-separated): postgresql,mysql,mongodb,redis,sqlite')
  .option('--orm <type>', 'ORM: prisma, doctrine, eloquent, none')
  .option('--services <list>', 'Services (comma-separated): mailpit,minio,rabbitmq,adminer')
  .option('--no-docker', 'Skip Docker configuration')
  .option('--no-typescript', 'Skip TypeScript (JS stacks only)')
  .option('--no-eslint', 'Skip ESLint + Prettier (JS stacks only)')
  .option('--modules <list>', 'Modules (comma-separated): auth,crud,admin,file-upload,email,api-docs,i18n,dark-mode,ci-cd')
  .option('--auth-strategy <type>', 'Auth strategy: jwt, session')
  .option('-y, --yes', 'Accept all defaults without prompts')
  .action(async (projectName: string | undefined, options: Record<string, unknown>) => {
    try {
      logger.banner();

      if (options.checkUpdates) {
        await checkVersions();
        return;
      }

      const answers = await runInteractivePrompts(projectName, options);
      await createProject(answers);

      logger.success(answers.projectName, isJsStack(answers.stack));
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_CANCELLED') {
        logger.info('Project creation cancelled.');
        process.exit(0);
      }
      logger.error(error instanceof Error ? error.message : 'An unexpected error occurred');
      process.exit(1);
    }
  });

// List command: show created projects
program
  .command('list')
  .description('List all projects created with letscraft')
  .action(async () => {
    try {
      const { listProjects } = await import('./registry');
      listProjects();
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'An unexpected error occurred');
      process.exit(1);
    }
  });

// Update command: self-update CLI
program
  .command('update')
  .description('Update letscraft to the latest version')
  .action(async () => {
    try {
      const { updateCli } = await import('./update');
      await updateCli();
    } catch (error) {
      logger.error(error instanceof Error ? error.message : 'An unexpected error occurred');
      process.exit(1);
    }
  });

program.parse();
