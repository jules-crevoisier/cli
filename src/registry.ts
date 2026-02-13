import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import chalk from 'chalk';
import type { ProjectRegistry, ProjectRegistryEntry, ProjectOptions } from './types';
import { logger } from './utils/logger';
import { SERVICE_LABELS, MODULE_LABELS } from './constants';

const REGISTRY_DIR = path.join(os.homedir(), '.letscraft');
const REGISTRY_FILE = path.join(REGISTRY_DIR, 'projects.json');

function getRegistry(): ProjectRegistry {
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      return fs.readJsonSync(REGISTRY_FILE) as ProjectRegistry;
    }
  } catch (error) {
    logger.warn(
      `Could not read project registry at ${REGISTRY_FILE}: ${error instanceof Error ? error.message : 'unknown error'}. Starting with empty registry.`
    );
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
      const labels = project.services.map((s) => SERVICE_LABELS[s] || s).join(', ');
      console.log(`    ${chalk.gray('Services:')} ${labels}`);
    }

    if (project.modules && project.modules.length > 0) {
      const labels = project.modules.map((m) => MODULE_LABELS[m] || m).join(', ');
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
