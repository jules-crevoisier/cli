import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import chalk from 'chalk';
import type { ProjectRegistry, ProjectRegistryEntry, ProjectOptions } from './types';

const REGISTRY_DIR = path.join(os.homedir(), '.letscraft');
const REGISTRY_FILE = path.join(REGISTRY_DIR, 'projects.json');

function getRegistry(): ProjectRegistry {
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      return fs.readJsonSync(REGISTRY_FILE) as ProjectRegistry;
    }
  } catch {
    // Corrupted file, start fresh
  }
  return { projects: [] };
}

function saveRegistry(registry: ProjectRegistry): void {
  fs.ensureDirSync(REGISTRY_DIR);
  fs.writeJsonSync(REGISTRY_FILE, registry, { spaces: 2 });
}

/**
 * Register a newly created project
 */
export function registerProject(options: ProjectOptions, projectPath: string): void {
  const registry = getRegistry();

  const entry: ProjectRegistryEntry = {
    name: options.projectName,
    stack: options.stack,
    path: projectPath,
    createdAt: new Date().toISOString(),
    databases: options.databases,
    orm: options.orm,
    services: options.services,
    modules: options.modules,
  };

  // Remove existing entry with same name if any
  registry.projects = registry.projects.filter((p) => p.name !== options.projectName);
  registry.projects.push(entry);

  saveRegistry(registry);
}

/**
 * List all registered projects
 */
export function listProjects(): void {
  const registry = getRegistry();

  if (registry.projects.length === 0) {
    console.log('');
    console.log(chalk.yellow('  No projects found.'));
    console.log(chalk.gray('  Create one with: npx letscraft my-app'));
    console.log('');
    return;
  }

  console.log('');
  console.log(chalk.bold.cyan('  letscraft — Projects'));
  console.log('');

  for (const project of registry.projects) {
    const exists = fs.existsSync(project.path);
    const statusIcon = exists ? chalk.green('●') : chalk.red('●');
    const date = new Date(project.createdAt).toLocaleDateString();

    console.log(`  ${statusIcon} ${chalk.bold(project.name)}`);
    console.log(`    ${chalk.gray('Stack:')} ${project.stack}`);
    console.log(`    ${chalk.gray('Path:')} ${project.path}`);
    console.log(`    ${chalk.gray('Created:')} ${date}`);

    if (project.databases.length > 0) {
      console.log(`    ${chalk.gray('Databases:')} ${project.databases.join(', ')}`);
    }

    if (project.orm !== 'none') {
      console.log(`    ${chalk.gray('ORM:')} ${project.orm}`);
    }

    if (project.services && project.services.length > 0) {
      const serviceLabels: Record<string, string> = {
        mailpit: 'Mailpit',
        minio: 'MinIO',
        rabbitmq: 'RabbitMQ',
        adminer: 'Adminer',
      };
      const labels = project.services.map((s) => serviceLabels[s] || s).join(', ');
      console.log(`    ${chalk.gray('Services:')} ${labels}`);
    }

    if (project.modules && project.modules.length > 0) {
      const moduleLabels: Record<string, string> = {
        auth: 'Auth',
        crud: 'CRUD',
        admin: 'Admin',
        'file-upload': 'File Upload',
        email: 'Email',
        'api-docs': 'API Docs',
        i18n: 'i18n',
        'dark-mode': 'Dark Mode',
        'ci-cd': 'CI/CD',
      };
      const labels = project.modules.map((m) => moduleLabels[m] || m).join(', ');
      console.log(`    ${chalk.gray('Modules:')} ${labels}`);
    }

    if (!exists) {
      console.log(`    ${chalk.red('(directory not found)')}`);
    }

    console.log('');
  }

  console.log(chalk.gray(`  Total: ${registry.projects.length} project(s)`));
  console.log('');
}
