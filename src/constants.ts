import type { StackType, ServiceType, ModuleType } from './types';

/**
 * Human-readable labels for stacks
 */
export const STACK_LABELS: Record<StackType, string> = {
  nextjs: 'Next.js',
  'vite-react': 'Vite + React',
  nuxt: 'Nuxt',
  'vite-react-express': 'Vite + React + Express',
  express: 'Express',
  symfony: 'Symfony',
  laravel: 'Laravel',
};

/**
 * Detailed stack descriptions (for agent.md generation)
 */
export const STACK_DESCRIPTIONS: Record<StackType, string> = {
  nextjs: 'Full-stack web application (Next.js + React)',
  'vite-react': 'Single-page application (Vite + React)',
  nuxt: 'Full-stack web application (Nuxt + Vue)',
  'vite-react-express': 'Full-stack web application (Vite + React + Express)',
  express: 'Backend API (Express.js)',
  symfony: 'Full-stack PHP application (Symfony)',
  laravel: 'Full-stack PHP application (Laravel)',
};

/**
 * Human-readable labels for services
 */
export const SERVICE_LABELS: Record<ServiceType, string> = {
  mailpit: 'Mailpit',
  minio: 'MinIO',
  rabbitmq: 'RabbitMQ',
  adminer: 'Adminer',
};

/**
 * Human-readable labels for modules
 */
export const MODULE_LABELS: Record<ModuleType, string> = {
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

/**
 * Default ports for each stack
 */
export const STACK_PORTS: Record<StackType, number> = {
  nextjs: 3000,
  'vite-react': 5173,
  nuxt: 3000,
  'vite-react-express': 4000,
  express: 4000,
  symfony: 8000,
  laravel: 8000,
};
