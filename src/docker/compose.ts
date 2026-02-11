import type { GeneratorContext } from '../types';
import { getDatabaseConfig } from './databases';
import { getServiceConfig } from './services';
import { isJsStack } from '../utils/stacks';

export function getPortForStack(stack: string): number {
  switch (stack) {
    case 'nextjs': return 3000;
    case 'vite-react': return 5173;
    case 'nuxt': return 3000;
    case 'vite-react-express': return 4000;
    case 'express': return 4000;
    case 'symfony': return 8000;
    case 'laravel': return 8000;
    default: return 3000;
  }
}

/**
 * Generate Docker Compose lines for an optional service (Mailpit, MinIO, RabbitMQ, Adminer)
 */
function getServiceLines(service: import('../types').ServiceType): string[] {
  const config = getServiceConfig(service);
  const lines: string[] = ['', `  ${config.serviceName}:`, `    image: ${config.image}`];

  if (config.command) {
    lines.push(`    command: ${config.command}`);
  }

  if (config.ports.length > 0) {
    lines.push('    ports:');
    for (const port of config.ports) {
      lines.push(`      - "${port}"`);
    }
  }

  if (Object.keys(config.environment).length > 0) {
    lines.push('    environment:');
    for (const [key, value] of Object.entries(config.environment)) {
      lines.push(`      ${key}: "${value}"`);
    }
  }

  if (config.volumes && config.volumes.length > 0) {
    lines.push('    volumes:');
    for (const vol of config.volumes) {
      lines.push(`      - ${vol}`);
    }
  }

  return lines;
}

/**
 * Generate Docker Compose YAML
 * - JS stacks: DB/mail services only (app runs locally)
 * - PHP stacks: app + DB/mail services
 */
export function generateDockerCompose(ctx: GeneratorContext): string {
  const { options, versions } = ctx;

  if (isJsStack(options.stack)) {
    return generateJsDockerCompose(ctx);
  }

  return generatePhpDockerCompose(ctx);
}

/**
 * JS stacks: Docker Compose with only database services
 * The app runs locally (npm run dev), only DBs are dockerized
 */
function generateJsDockerCompose(ctx: GeneratorContext): string {
  const { options, versions } = ctx;
  const lines: string[] = [];

  // Get Docker-based DB configs (excludes sqlite)
  const dockerDbs = options.databases
    .map((db) => getDatabaseConfig(db, options.projectName, versions))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (dockerDbs.length === 0 && options.services.length === 0) return '';

  lines.push('# Docker services — app runs locally with `npm run dev`');
  lines.push('services:');

  // Database services
  for (const config of dockerDbs) {
    lines.push('');
    lines.push(`  ${config.serviceName}:`);
    lines.push(`    image: ${config.image}`);
    lines.push('    ports:');
    lines.push(`      - "${config.ports}"`);

    if (Object.keys(config.environment).length > 0) {
      lines.push('    environment:');
      for (const [key, value] of Object.entries(config.environment)) {
        lines.push(`      ${key}: "${value}"`);
      }
    }

    lines.push('    volumes:');
    for (const vol of config.volumes) {
      lines.push(`      - ${vol}`);
    }

    if (config.healthcheck) {
      lines.push('    healthcheck:');
      lines.push(`      test: ["CMD-SHELL", "${config.healthcheck.test}"]`);
      lines.push(`      interval: ${config.healthcheck.interval}`);
      lines.push(`      timeout: ${config.healthcheck.timeout}`);
      lines.push(`      retries: ${config.healthcheck.retries}`);
    }
  }

  // Optional services (Mailpit, MinIO, RabbitMQ, Adminer)
  for (const service of options.services) {
    lines.push(...getServiceLines(service));
  }

  // Named volumes (databases + services)
  const allVolumes: string[] = [];
  for (const config of dockerDbs) {
    for (const vol of config.volumes) {
      allVolumes.push(vol.split(':')[0]);
    }
  }
  for (const service of options.services) {
    const svcConfig = getServiceConfig(service);
    if (svcConfig.volumes) {
      for (const vol of svcConfig.volumes) {
        allVolumes.push(vol.split(':')[0]);
      }
    }
  }

  if (allVolumes.length > 0) {
    lines.push('');
    lines.push('volumes:');
    for (const volName of allVolumes) {
      lines.push(`  ${volName}:`);
    }
  }

  return lines.join('\n') + '\n';
}

/**
 * PHP stacks: Docker Compose with app service + database services
 * Full Docker Compose Watch for hot-reload
 */
function generatePhpDockerCompose(ctx: GeneratorContext): string {
  const { options, versions } = ctx;
  const port = getPortForStack(options.stack);
  const lines: string[] = [];

  lines.push('services:');
  lines.push('');

  // App service
  lines.push('  app:');
  lines.push('    build:');
  lines.push('      context: .');
  lines.push('      dockerfile: Dockerfile');
  lines.push('    ports:');
  lines.push(`      - "${port}:80"`);
  lines.push('    env_file:');
  lines.push('      - .env');

  // Dependencies on databases
  const dockerDbs = options.databases
    .map((db) => getDatabaseConfig(db, options.projectName, versions))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (dockerDbs.length > 0) {
    lines.push('    depends_on:');
    for (const config of dockerDbs) {
      lines.push(`      ${config.serviceName}:`);
      lines.push('        condition: service_healthy');
    }
  }

  // Compose Watch for hot-reload
  lines.push('    develop:');
  lines.push('      watch:');

  if (options.stack === 'symfony') {
    lines.push('        - action: sync');
    lines.push('          path: ./src');
    lines.push('          target: /app/src');
    lines.push('        - action: sync');
    lines.push('          path: ./config');
    lines.push('          target: /app/config');
    lines.push('        - action: sync');
    lines.push('          path: ./templates');
    lines.push('          target: /app/templates');
    lines.push('        - action: rebuild');
    lines.push('          path: ./composer.json');
  } else if (options.stack === 'laravel') {
    lines.push('        - action: sync');
    lines.push('          path: ./app');
    lines.push('          target: /app/app');
    lines.push('        - action: sync');
    lines.push('          path: ./resources');
    lines.push('          target: /app/resources');
    lines.push('        - action: sync');
    lines.push('          path: ./routes');
    lines.push('          target: /app/routes');
    lines.push('        - action: sync');
    lines.push('          path: ./config');
    lines.push('          target: /app/config');
    lines.push('        - action: rebuild');
    lines.push('          path: ./composer.json');
  }

  // Database services
  for (const config of dockerDbs) {
    lines.push('');
    lines.push(`  ${config.serviceName}:`);
    lines.push(`    image: ${config.image}`);
    lines.push('    ports:');
    lines.push(`      - "${config.ports}"`);

    if (Object.keys(config.environment).length > 0) {
      lines.push('    environment:');
      for (const [key, value] of Object.entries(config.environment)) {
        lines.push(`      ${key}: "${value}"`);
      }
    }

    lines.push('    volumes:');
    for (const vol of config.volumes) {
      lines.push(`      - ${vol}`);
    }

    if (config.healthcheck) {
      lines.push('    healthcheck:');
      lines.push(`      test: ["CMD-SHELL", "${config.healthcheck.test}"]`);
      lines.push(`      interval: ${config.healthcheck.interval}`);
      lines.push(`      timeout: ${config.healthcheck.timeout}`);
      lines.push(`      retries: ${config.healthcheck.retries}`);
    }
  }

  // Optional services (Mailpit, MinIO, RabbitMQ, Adminer)
  for (const service of options.services) {
    lines.push(...getServiceLines(service));
  }

  // Named volumes (databases + services)
  const allVolumes: string[] = [];
  for (const config of dockerDbs) {
    for (const vol of config.volumes) {
      allVolumes.push(vol.split(':')[0]);
    }
  }
  for (const service of options.services) {
    const svcConfig = getServiceConfig(service);
    if (svcConfig.volumes) {
      for (const vol of svcConfig.volumes) {
        allVolumes.push(vol.split(':')[0]);
      }
    }
  }

  if (allVolumes.length > 0) {
    lines.push('');
    lines.push('volumes:');
    for (const volName of allVolumes) {
      lines.push(`  ${volName}:`);
    }
  }

  return lines.join('\n') + '\n';
}
