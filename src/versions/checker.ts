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
    { name: 'Next.js', pkg: 'next', current: defaults.nextjs },
    { name: 'React', pkg: 'react', current: defaults.react },
    { name: 'Vite', pkg: 'vite', current: defaults.vite },
    { name: 'Nuxt', pkg: 'nuxt', current: defaults.nuxt },
    { name: 'Express', pkg: 'express', current: defaults.express },
    { name: 'TypeScript', pkg: 'typescript', current: defaults.typescript },
    { name: 'Tailwind CSS', pkg: 'tailwindcss', current: defaults.tailwind },
  ];

  const dbChecks = [
    { name: 'PostgreSQL', image: 'postgres', current: defaults.databases.postgresql },
    { name: 'MongoDB', image: 'mongo', current: defaults.databases.mongodb },
    { name: 'MySQL', image: 'mysql', current: defaults.databases.mysql },
    { name: 'Redis', image: 'redis', current: defaults.databases.redis },
  ];

  // Fetch all versions in parallel instead of sequentially
  const [npmResults, dbResults] = await Promise.all([
    Promise.allSettled(npmChecks.map((check) => fetchLatestNpmVersion(check.pkg))),
    Promise.allSettled(dbChecks.map((check) => fetchLatestDockerTag(check.image))),
  ]);

  console.log('  npm packages:');
  for (let i = 0; i < npmChecks.length; i++) {
    const result = npmResults[i];
    const latest = result.status === 'fulfilled' ? result.value : null;
    logger.versionRow(npmChecks[i].name, npmChecks[i].current, latest);
  }

  console.log('\n  Docker images:');
  for (let i = 0; i < dbChecks.length; i++) {
    const result = dbResults[i];
    const latest = result.status === 'fulfilled' ? result.value : null;
    logger.versionRow(dbChecks[i].name, dbChecks[i].current, latest);
  }

  console.log('');
}
