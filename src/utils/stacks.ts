import type { StackType, DatabaseType, ServiceType } from '../types.js';

/**
 * Stack categories
 */
const JS_STACKS: StackType[] = ['nextjs', 'vite-react', 'nuxt', 'vite-react-express', 'express'];
const PHP_STACKS: StackType[] = ['symfony', 'laravel'];

/**
 * Frontend JS stacks (have Tailwind CSS, browser UI)
 */
const FRONTEND_STACKS: StackType[] = ['nextjs', 'vite-react', 'nuxt', 'vite-react-express'];

/**
 * Databases compatible with Prisma ORM
 * (MongoDB is supported by Prisma but with limitations, we exclude it for simplicity)
 */
export const PRISMA_COMPATIBLE_DBS: DatabaseType[] = ['postgresql', 'mysql', 'sqlite'];

/**
 * Check if a stack is a JavaScript/TypeScript stack
 */
export function isJsStack(stack: StackType): boolean {
  return JS_STACKS.includes(stack);
}

/**
 * Check if a stack is a PHP stack
 */
export function isPhpStack(stack: StackType): boolean {
  return PHP_STACKS.includes(stack);
}

/**
 * Check if a stack is a frontend stack (has UI/Tailwind)
 */
export function isFrontendStack(stack: StackType): boolean {
  return FRONTEND_STACKS.includes(stack);
}

/**
 * Get the stack category label
 */
export function getStackCategory(stack: StackType): 'js' | 'php' {
  if (isPhpStack(stack)) return 'php';
  return 'js';
}

/**
 * Check if a database selection has at least one Prisma-compatible DB
 */
export function hasPrismaCompatibleDb(databases: DatabaseType[]): boolean {
  return databases.some((db) => PRISMA_COMPATIBLE_DBS.includes(db));
}

/**
 * Get the Prisma provider for a database type
 * Priority: postgresql > mysql > sqlite
 */
export function getPrismaProvider(databases: DatabaseType[]): 'postgresql' | 'mysql' | 'sqlite' | null {
  if (databases.includes('postgresql')) return 'postgresql';
  if (databases.includes('mysql')) return 'mysql';
  if (databases.includes('sqlite')) return 'sqlite';
  return null;
}

/**
 * Get the service host based on stack type
 * JS stacks: app runs locally → localhost
 * PHP stacks: app runs in Docker → Docker service name
 */
export function getServiceHost(stack: StackType, service: ServiceType): string {
  if (isJsStack(stack)) return 'localhost';
  // PHP stacks use Docker service names
  return service;
}

/**
 * Get the mail host based on stack type (convenience alias)
 * JS stacks: app runs locally → localhost
 * PHP stacks: app runs in Docker → Docker service name (mailpit)
 */
export function getMailHost(stack: StackType): string {
  return getServiceHost(stack, 'mailpit');
}

/**
 * Get the DB host based on stack type
 * JS stacks: app runs locally → localhost
 * PHP stacks: app runs in Docker → Docker service name
 */
export function getDbHost(stack: StackType, db: DatabaseType): string {
  if (isJsStack(stack)) return 'localhost';

  // PHP stacks use Docker service names
  const serviceNames: Record<string, string> = {
    postgresql: 'db-postgres',
    mongodb: 'db-mongo',
    mysql: 'db-mysql',
    redis: 'redis',
  };
  return serviceNames[db] || 'localhost';
}
