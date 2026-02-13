import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import type { ProjectOptions, GeneratorContext } from '../types';
import { getDefaultVersions } from '../versions/checker';
import { generateDockerCompose, getPortForStack } from '../docker/compose';
import { generateDockerfile } from '../docker/dockerfile';
import { generateAgentMd } from '../ai/generator';
import { renderTemplateToFile } from '../utils/template';
import { isJsStack, getDbHost, getServiceHost, getPrismaProvider } from '../utils/stacks';
import { registerProject } from '../registry';
import { generateModuleFiles } from '../modules/generator';
import { STACK_LABELS } from '../constants';
import { NextjsGenerator } from './nextjs';
import { ViteReactGenerator } from './vite-react';
import { NuxtGenerator } from './nuxt';
import { ViteReactExpressGenerator } from './vite-react-express';
import { ExpressGenerator } from './express';
import { SymfonyGenerator } from './symfony';
import { LaravelGenerator } from './laravel';

export interface StackGenerator {
  generate(ctx: GeneratorContext): Promise<void>;
  getPort(): number;
}

function getGenerator(stack: string): StackGenerator {
  switch (stack) {
    case 'nextjs': return new NextjsGenerator();
    case 'vite-react': return new ViteReactGenerator();
    case 'nuxt': return new NuxtGenerator();
    case 'vite-react-express': return new ViteReactExpressGenerator();
    case 'express': return new ExpressGenerator();
    case 'symfony': return new SymfonyGenerator();
    case 'laravel': return new LaravelGenerator();
    default: throw new Error(`Unknown stack: ${stack}`);
  }
}

export async function createProject(options: ProjectOptions): Promise<void> {
  const outputDir = path.resolve(process.cwd(), options.projectName);
  const versions = getDefaultVersions();

  if (await fs.pathExists(outputDir)) {
    throw new Error(
      `Directory "${options.projectName}" already exists. Choose a different name or delete the existing directory.`
    );
  }

  const ctx: GeneratorContext = { options, versions, outputDir };
  const generator = getGenerator(options.stack);
  const port = getPortForStack(options.stack);

  try {
    await generateProjectFiles(ctx, generator, port, options, versions, outputDir);
  } catch (error) {
    // Rollback: remove partially created directory on failure
    if (await fs.pathExists(outputDir)) {
      await fs.remove(outputDir);
    }
    throw error;
  }
}

async function generateProjectFiles(
  ctx: GeneratorContext,
  generator: StackGenerator,
  port: number,
  options: ProjectOptions,
  versions: import('../types').VersionConfig,
  outputDir: string
): Promise<void> {

  // Build dbHost map based on stack type (localhost for JS, Docker service names for PHP)
  const dbHost: Record<string, string> = {};
  for (const db of options.databases) {
    dbHost[db] = getDbHost(options.stack, db);
  }

  // Get Prisma provider if applicable
  const prismaProvider = options.orm === 'prisma' ? getPrismaProvider(options.databases) : null;

  // Build service hosts based on stack type
  const serviceHosts: Record<string, string> = {};
  for (const service of options.services) {
    serviceHosts[service] = getServiceHost(options.stack, service);
  }

  // Backward-compatible aliases for templates
  const mailer = options.services.includes('mailpit');
  const mailHost = mailer ? serviceHosts.mailpit : null;

  const templateData = {
    ...options,
    versions,
    port,
    dbHost,
    serviceHosts,
    mailer,
    mailHost,
    prismaProvider,
    orm: options.orm || 'none',
  };

  // Step 1: Create directory
  const spinner = ora('Creating project directory...').start();
  await fs.ensureDir(outputDir);
  if (options.databases.includes('sqlite')) {
    await fs.ensureDir(path.join(outputDir, 'data'));
  }
  spinner.succeed('Project directory created');

  // Step 2: Shared files
  spinner.start('Generating configuration files...');
  const sharedFiles = [
    renderTemplateToFile('shared/.gitignore.ejs', path.join(outputDir, '.gitignore'), templateData),
    renderTemplateToFile('shared/.env.ejs', path.join(outputDir, '.env'), templateData),
    renderTemplateToFile('shared/.env.example.ejs', path.join(outputDir, '.env.example'), templateData),
    renderTemplateToFile('shared/.dockerignore.ejs', path.join(outputDir, '.dockerignore'), templateData),
  ];

  // ESLint + Prettier config files
  if (options.eslintPrettier && isJsStack(options.stack)) {
    sharedFiles.push(
      renderTemplateToFile('shared/eslint.config.js.ejs', path.join(outputDir, 'eslint.config.js'), templateData),
      renderTemplateToFile('shared/.prettierrc.ejs', path.join(outputDir, '.prettierrc'), templateData),
    );
  }

  await Promise.all(sharedFiles);
  spinner.succeed('Configuration files generated');

  // Step 3: Docker files
  // JS stacks: Docker only for databases/mail (docker-compose.yml with services, + production Dockerfile)
  // PHP stacks: Docker for app + databases/mail
  const needsDocker = options.docker && (options.databases.length > 0 || options.services.length > 0);
  if (needsDocker) {
    spinner.start('Generating Docker configuration...');

    // Both JS and PHP stacks generate docker-compose.yml + Dockerfile
    // (the content differs internally via generateDockerCompose/generateDockerfile)
    const composeContent = generateDockerCompose(ctx);
    const dockerfileContent = await generateDockerfile(ctx);
    await Promise.all([
      fs.writeFile(path.join(outputDir, 'docker-compose.yml'), composeContent),
      fs.writeFile(path.join(outputDir, 'Dockerfile'), dockerfileContent),
    ]);

    spinner.succeed('Docker configuration generated');
  }

  // Step 4: Prisma files (JS stacks only)
  if (options.orm === 'prisma' && prismaProvider) {
    spinner.start('Generating Prisma ORM files...');
    // For vite-react-express, Prisma goes in server/ (backend manages DB)
    const prismaBase = options.stack === 'vite-react-express'
      ? path.join(outputDir, 'server', 'prisma')
      : path.join(outputDir, 'prisma');
    await fs.ensureDir(prismaBase);
    await Promise.all([
      renderTemplateToFile(
        'shared/prisma/schema.prisma.ejs',
        path.join(prismaBase, 'schema.prisma'),
        templateData
      ),
      renderTemplateToFile(
        'shared/prisma/seed.ts.ejs',
        path.join(prismaBase, 'seed.ts'),
        templateData
      ),
    ]);
    spinner.succeed('Prisma ORM files generated');
  }

  // Step 5: Stack-specific files
  const stackLabel = STACK_LABELS[options.stack] || options.stack;
  spinner.start(`Generating ${stackLabel} project files...`);
  await generator.generate(ctx);
  spinner.succeed(`${stackLabel} project files generated`);

  // Step 6: Module files
  if (options.modules.length > 0) {
    const moduleLabels = options.modules.map((m) => m).join(', ');
    spinner.start(`Generating module files (${moduleLabels})...`);
    await generateModuleFiles(ctx, templateData);
    spinner.succeed(`Module files generated (${moduleLabels})`);
  }

  // Step 7: README.md + agent.md
  spinner.start('Generating documentation files...');
  const agentMdContent = generateAgentMd(ctx, port);
  await Promise.all([
    renderTemplateToFile('shared/README.md.ejs', path.join(outputDir, 'README.md'), templateData),
    fs.writeFile(path.join(outputDir, 'agent.md'), agentMdContent),
  ]);
  spinner.succeed('Documentation files (README.md, agent.md) generated');

  // Step 8: Register project
  try {
    registerProject(options, outputDir);
  } catch (error) {
    // Non-critical: don't fail project creation if registry fails
    console.warn(
      `Warning: Could not register project: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
}
