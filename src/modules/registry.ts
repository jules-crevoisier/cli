import type { ModuleType, StackType, ServiceType } from '../types';

export interface ModuleConfig {
  name: ModuleType;
  label: string;
  description: string;
  supportedStacks: StackType[];
  requiresDatabase?: boolean;
  requiresService?: ServiceType[];
  dependsOn?: ModuleType[];
}

const MODULE_CONFIGS: Record<ModuleType, ModuleConfig> = {
  auth: {
    name: 'auth',
    label: 'Authentication',
    description: 'Login, register, logout with JWT or session',
    supportedStacks: ['nextjs', 'vite-react', 'nuxt', 'vite-react-express', 'express', 'symfony', 'laravel'],
    requiresDatabase: true,
  },
  crud: {
    name: 'crud',
    label: 'CRUD API',
    description: 'Model + endpoints example (items)',
    supportedStacks: ['express', 'nextjs', 'nuxt', 'vite-react-express', 'symfony', 'laravel'],
    requiresDatabase: true,
  },
  admin: {
    name: 'admin',
    label: 'Admin Dashboard',
    description: 'Sidebar, stats, user management',
    supportedStacks: ['nextjs', 'vite-react', 'nuxt', 'vite-react-express', 'symfony', 'laravel'],
    dependsOn: ['auth'],
  },
  'file-upload': {
    name: 'file-upload',
    label: 'File Upload',
    description: 'S3/MinIO file upload integration',
    supportedStacks: ['express', 'nextjs', 'nuxt', 'vite-react-express', 'symfony', 'laravel'],
    requiresService: ['minio'],
  },
  email: {
    name: 'email',
    label: 'Transactional Email',
    description: 'Email sending with templates (Mailpit)',
    supportedStacks: ['express', 'nextjs', 'nuxt', 'vite-react-express', 'symfony', 'laravel'],
    requiresService: ['mailpit'],
  },
  'api-docs': {
    name: 'api-docs',
    label: 'API Documentation',
    description: 'Swagger/OpenAPI auto-generated docs',
    supportedStacks: ['express', 'nextjs', 'nuxt', 'vite-react-express', 'symfony', 'laravel'],
  },
  i18n: {
    name: 'i18n',
    label: 'Internationalization',
    description: 'Multi-language support (en + fr)',
    supportedStacks: ['nextjs', 'vite-react', 'nuxt', 'vite-react-express', 'express', 'symfony', 'laravel'],
  },
  'dark-mode': {
    name: 'dark-mode',
    label: 'Dark Mode',
    description: 'Theme toggle with system preference',
    supportedStacks: ['nextjs', 'vite-react', 'nuxt', 'vite-react-express'],
  },
  'ci-cd': {
    name: 'ci-cd',
    label: 'CI/CD',
    description: 'GitHub Actions workflows (lint, test, build)',
    supportedStacks: ['nextjs', 'vite-react', 'nuxt', 'vite-react-express', 'express', 'symfony', 'laravel'],
  },
};

export function getModuleConfig(module: ModuleType): ModuleConfig {
  return MODULE_CONFIGS[module];
}

export function getAllModuleConfigs(): ModuleConfig[] {
  return Object.values(MODULE_CONFIGS);
}

export function getModulesForStack(stack: StackType): ModuleConfig[] {
  return Object.values(MODULE_CONFIGS).filter((config) =>
    config.supportedStacks.includes(stack)
  );
}

/**
 * Resolve module dependencies: auto-add required modules.
 * e.g., if 'admin' is selected, 'auth' is auto-added.
 */
export function resolveModuleDependencies(modules: ModuleType[]): ModuleType[] {
  const resolved = new Set(modules);

  for (const mod of modules) {
    const config = MODULE_CONFIGS[mod];
    if (config.dependsOn) {
      for (const dep of config.dependsOn) {
        resolved.add(dep);
      }
    }
  }

  return Array.from(resolved);
}

/**
 * Resolve services required by selected modules.
 * e.g., if 'file-upload' is selected, 'minio' is auto-added to services.
 */
export function resolveModuleServices(
  modules: ModuleType[],
  currentServices: ServiceType[]
): ServiceType[] {
  const services = new Set(currentServices);

  for (const mod of modules) {
    const config = MODULE_CONFIGS[mod];
    if (config.requiresService) {
      for (const svc of config.requiresService) {
        services.add(svc);
      }
    }
  }

  return Array.from(services);
}
