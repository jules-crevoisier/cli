import yaml from 'js-yaml';
import type { GeneratorContext, StackType, ServiceType } from '../types';
import { getDatabaseConfig, type DatabaseServiceConfig } from './databases';
import { getServiceConfig } from './services';
import { isJsStack } from '../utils/stacks';
import { STACK_PORTS } from '../constants';

export function getPortForStack(stack: string): number {
  return STACK_PORTS[stack as StackType] ?? 3000;
}

/**
 * Build a Docker Compose service object from a database config
 */
function buildDbService(config: DatabaseServiceConfig): Record<string, unknown> {
  const service: Record<string, unknown> = {
    image: config.image,
    ports: [config.ports],
  };

  if (Object.keys(config.environment).length > 0) {
    service.environment = { ...config.environment };
  }

  service.volumes = [...config.volumes];

  if (config.healthcheck) {
    service.healthcheck = {
      test: ['CMD-SHELL', config.healthcheck.test],
      interval: config.healthcheck.interval,
      timeout: config.healthcheck.timeout,
      retries: config.healthcheck.retries,
    };
  }

  return service;
}

/**
 * Build a Docker Compose service object from an optional service config
 */
function buildOptionalService(service: ServiceType): Record<string, unknown> {
  const config = getServiceConfig(service);
  const svc: Record<string, unknown> = {
    image: config.image,
  };

  if (config.command) {
    svc.command = config.command;
  }

  if (config.ports.length > 0) {
    svc.ports = [...config.ports];
  }

  if (Object.keys(config.environment).length > 0) {
    svc.environment = { ...config.environment };
  }

  if (config.volumes && config.volumes.length > 0) {
    svc.volumes = [...config.volumes];
  }

  return svc;
}

/**
 * Collect all named volumes from DB and service configs
 */
function collectNamedVolumes(
  dockerDbs: DatabaseServiceConfig[],
  services: ServiceType[]
): string[] {
  const volumes: string[] = [];

  for (const config of dockerDbs) {
    for (const vol of config.volumes) {
      volumes.push(vol.split(':')[0]);
    }
  }

  for (const service of services) {
    const svcConfig = getServiceConfig(service);
    if (svcConfig.volumes) {
      for (const vol of svcConfig.volumes) {
        volumes.push(vol.split(':')[0]);
      }
    }
  }

  return volumes;
}

/**
 * Get Compose Watch configuration based on PHP stack type
 */
function getWatchConfig(stack: StackType): Array<Record<string, string>> {
  if (stack === 'symfony') {
    return [
      { action: 'sync', path: './src', target: '/app/src' },
      { action: 'sync', path: './config', target: '/app/config' },
      { action: 'sync', path: './templates', target: '/app/templates' },
      { action: 'rebuild', path: './composer.json' },
    ];
  }

  if (stack === 'laravel') {
    return [
      { action: 'sync', path: './app', target: '/app/app' },
      { action: 'sync', path: './resources', target: '/app/resources' },
      { action: 'sync', path: './routes', target: '/app/routes' },
      { action: 'sync', path: './config', target: '/app/config' },
      { action: 'rebuild', path: './composer.json' },
    ];
  }

  return [];
}

/**
 * Generate Docker Compose YAML
 * - JS stacks: DB/mail services only (app runs locally)
 * - PHP stacks: app + DB/mail services
 */
export function generateDockerCompose(ctx: GeneratorContext): string {
  const { options, versions } = ctx;

  // Get Docker-based DB configs (excludes sqlite)
  const dockerDbs = options.databases
    .map((db) => getDatabaseConfig(db, options.projectName, versions))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  if (isJsStack(options.stack)) {
    return generateJsDockerCompose(options, dockerDbs);
  }

  return generatePhpDockerCompose(options, dockerDbs);
}

/**
 * JS stacks: Docker Compose with only database services
 * The app runs locally (npm run dev), only DBs are dockerized
 */
function generateJsDockerCompose(
  options: GeneratorContext['options'],
  dockerDbs: DatabaseServiceConfig[]
): string {
  if (dockerDbs.length === 0 && options.services.length === 0) return '';

  const compose: Record<string, unknown> = {};
  const services: Record<string, unknown> = {};

  // Database services
  for (const config of dockerDbs) {
    services[config.serviceName] = buildDbService(config);
  }

  // Optional services
  for (const service of options.services) {
    const config = getServiceConfig(service);
    services[config.serviceName] = buildOptionalService(service);
  }

  compose.services = services;

  // Named volumes
  const volumeNames = collectNamedVolumes(dockerDbs, options.services);
  if (volumeNames.length > 0) {
    const volumes: Record<string, null> = {};
    for (const name of volumeNames) {
      volumes[name] = null;
    }
    compose.volumes = volumes;
  }

  const header = '# Docker services — app runs locally with `npm run dev`\n';
  return header + yaml.dump(compose, { lineWidth: -1, noRefs: true, quotingType: '"' });
}

/**
 * PHP stacks: Docker Compose with app service + database services
 * Full Docker Compose Watch for hot-reload
 */
function generatePhpDockerCompose(
  options: GeneratorContext['options'],
  dockerDbs: DatabaseServiceConfig[]
): string {
  const compose: Record<string, unknown> = {};
  const services: Record<string, unknown> = {};
  const port = getPortForStack(options.stack);

  // App service
  const appService: Record<string, unknown> = {
    build: { context: '.', dockerfile: 'Dockerfile' },
    ports: [`${port}:80`],
    env_file: ['.env'],
  };

  // Dependencies on databases
  if (dockerDbs.length > 0) {
    const dependsOn: Record<string, { condition: string }> = {};
    for (const config of dockerDbs) {
      dependsOn[config.serviceName] = { condition: 'service_healthy' };
    }
    appService.depends_on = dependsOn;
  }

  // Compose Watch for hot-reload
  const watchConfig = getWatchConfig(options.stack);
  if (watchConfig.length > 0) {
    appService.develop = { watch: watchConfig };
  }

  services.app = appService;

  // Database services
  for (const config of dockerDbs) {
    services[config.serviceName] = buildDbService(config);
  }

  // Optional services
  for (const service of options.services) {
    const config = getServiceConfig(service);
    services[config.serviceName] = buildOptionalService(service);
  }

  compose.services = services;

  // Named volumes
  const volumeNames = collectNamedVolumes(dockerDbs, options.services);
  if (volumeNames.length > 0) {
    const volumes: Record<string, null> = {};
    for (const name of volumeNames) {
      volumes[name] = null;
    }
    compose.volumes = volumes;
  }

  return yaml.dump(compose, { lineWidth: -1, noRefs: true, quotingType: '"' });
}
