export type StackType = 'nextjs' | 'vite-react' | 'nuxt' | 'vite-react-express' | 'express' | 'symfony' | 'laravel';

export type DatabaseType = 'postgresql' | 'mongodb' | 'mysql' | 'redis' | 'sqlite';

export type OrmType = 'prisma' | 'doctrine' | 'eloquent' | 'none';

export type ServiceType = 'mailpit' | 'minio' | 'rabbitmq' | 'adminer';

export type ModuleType =
  | 'auth'
  | 'crud'
  | 'admin'
  | 'file-upload'
  | 'email'
  | 'api-docs'
  | 'i18n'
  | 'dark-mode'
  | 'ci-cd';

export type AuthStrategy = 'jwt' | 'session';

export interface ProjectOptions {
  projectName: string;
  stack: StackType;
  typescript: boolean;
  databases: DatabaseType[];
  eslintPrettier: boolean;
  docker: boolean;
  orm: OrmType;
  services: ServiceType[];
  modules: ModuleType[];
  authStrategy?: AuthStrategy;
}

export interface VersionConfig {
  node: string;
  typescript: string;
  nextjs: string;
  react: string;
  vite: string;
  nuxt: string;
  express: string;
  tailwind: string;
  eslint: string;
  prettier: string;
  php: string;
  composer: string;
  symfony: string;
  laravel: string;
  databases: {
    postgresql: string;
    mongodb: string;
    mysql: string;
    redis: string;
  };
}

export interface GeneratorContext {
  options: ProjectOptions;
  versions: VersionConfig;
  outputDir: string;
}

export interface ProjectRegistryEntry {
  name: string;
  stack: StackType;
  path: string;
  createdAt: string;
  databases: DatabaseType[];
  orm: OrmType;
  services: ServiceType[];
  modules: ModuleType[];
}

export interface ProjectRegistry {
  projects: ProjectRegistryEntry[];
}
