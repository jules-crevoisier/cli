import defaults from './defaults.json';
import type { VersionConfig } from '../types';
import { logger } from '../utils/logger';

async function fetchLatestNpmVersion(packageName: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { version: string };
    return data.version;
  } catch {
    return null;
  }
}

async function fetchLatestDockerTag(image: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://hub.docker.com/v2/repositories/library/${image}/tags/?page_size=10&ordering=last_updated`
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      results: Array<{ name: string }>;
    };
    const versionTags = data.results
      .map((r) => r.name)
      .filter((tag) => /^\d+(\.\d+)*$/.test(tag));
    return versionTags[0] || null;
  } catch {
    return null;
  }
}

export function getDefaultVersions(): VersionConfig {
  return defaults as VersionConfig;
}

export async function checkVersions(): Promise<void> {
  logger.info('Checking for latest versions...\n');

  const npmChecks = [
    { name: 'Next.js', pkg: 'next' },
    { name: 'React', pkg: 'react' },
    { name: 'Vite', pkg: 'vite' },
    { name: 'Nuxt', pkg: 'nuxt' },
    { name: 'Express', pkg: 'express' },
    { name: 'TypeScript', pkg: 'typescript' },
    { name: 'Tailwind CSS', pkg: 'tailwindcss' },
  ];

  const defaultsMap: Record<string, string> = {
    'Next.js': defaults.nextjs,
    'React': defaults.react,
    'Vite': defaults.vite,
    'Nuxt': defaults.nuxt,
    'Express': defaults.express,
    'TypeScript': defaults.typescript,
    'Tailwind CSS': defaults.tailwind,
  };

  console.log('  npm packages:');
  for (const check of npmChecks) {
    const latest = await fetchLatestNpmVersion(check.pkg);
    logger.versionRow(check.name, defaultsMap[check.name], latest);
  }

  console.log('\n  Docker images:');
  const dbChecks = [
    { name: 'PostgreSQL', image: 'postgres', version: defaults.databases.postgresql },
    { name: 'MongoDB', image: 'mongo', version: defaults.databases.mongodb },
    { name: 'MySQL', image: 'mysql', version: defaults.databases.mysql },
    { name: 'Redis', image: 'redis', version: defaults.databases.redis },
  ];

  for (const check of dbChecks) {
    const latest = await fetchLatestDockerTag(check.image);
    logger.versionRow(check.name, check.version, latest);
  }

  console.log('');
}
