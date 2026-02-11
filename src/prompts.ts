import { input, select, confirm, checkbox } from '@inquirer/prompts';
import type { ProjectOptions, StackType, DatabaseType, OrmType, ServiceType, ModuleType, AuthStrategy } from './types';
import { validateProjectName } from './utils/validation';
import { isJsStack, hasPrismaCompatibleDb } from './utils/stacks';
import { getModulesForStack, resolveModuleDependencies, resolveModuleServices } from './modules/registry';

export async function runInteractivePrompts(
  projectNameArg?: string,
  cliOptions?: Record<string, unknown>
): Promise<ProjectOptions> {
  const yes = cliOptions?.yes === true;

  // Project name
  const projectName = projectNameArg || (yes ? 'my-app' : await input({
    message: 'What is your project name?',
    default: 'my-app',
    validate: validateProjectName,
  }));

  // Stack
  const stack: StackType = (cliOptions?.stack as StackType) || (yes ? 'nextjs' : await select({
    message: 'What type of project do you want to create?',
    choices: [
      {
        name: 'Next.js + React (full-stack with SSR)',
        value: 'nextjs' as const,
        description: 'Server-rendered React app with API routes',
      },
      {
        name: 'Vite + React (SPA)',
        value: 'vite-react' as const,
        description: 'Fast client-side React application',
      },
      {
        name: 'Nuxt (full-stack Vue)',
        value: 'nuxt' as const,
        description: 'Server-rendered Vue with API routes and file-based routing (Nuxt 3)',
      },
      {
        name: 'Vite + React + Express (full-stack)',
        value: 'vite-react-express' as const,
        description: 'React SPA frontend + Express API backend (monorepo)',
      },
      {
        name: 'Express.js (backend API)',
        value: 'express' as const,
        description: 'RESTful API server with Express',
      },
      {
        name: 'Symfony (PHP full-stack)',
        value: 'symfony' as const,
        description: 'PHP framework with Doctrine ORM (Docker)',
      },
      {
        name: 'Laravel (PHP full-stack)',
        value: 'laravel' as const,
        description: 'PHP framework with Eloquent ORM (Docker)',
      },
    ],
  }));

  // Databases
  let databases: DatabaseType[] = [];
  if (cliOptions?.db) {
    // --db postgresql,redis
    databases = (cliOptions.db as string).split(',').map((s) => s.trim()) as DatabaseType[];
  } else if (!yes) {
    const needsDatabase = await confirm({
      message: 'Do you need a database?',
      default: false,
    });

    if (needsDatabase) {
      databases = await checkbox({
        message: 'Select databases (space to toggle, enter to confirm):',
        choices: [
          { name: 'PostgreSQL', value: 'postgresql' as const },
          { name: 'MongoDB', value: 'mongodb' as const },
          { name: 'MySQL', value: 'mysql' as const },
          { name: 'Redis', value: 'redis' as const },
          { name: 'SQLite', value: 'sqlite' as const },
        ],
        required: true,
      });
    }
  }
  // else: --yes with no --db → databases = []

  // ORM selection
  let orm: OrmType = 'none';

  if (cliOptions?.orm) {
    orm = cliOptions.orm as OrmType;
  } else if (stack === 'symfony') {
    orm = 'doctrine';
  } else if (stack === 'laravel') {
    orm = 'eloquent';
  } else if (!yes && isJsStack(stack) && databases.length > 0 && hasPrismaCompatibleDb(databases)) {
    const usePrisma = await confirm({
      message: 'Use Prisma ORM? (auto-generates types, migrations, and a ready-to-use client)',
      default: true,
    });
    if (usePrisma) {
      orm = 'prisma';
    }
  }
  // else: --yes → orm = 'none' (for JS stacks)

  // Additional services
  let services: ServiceType[] = [];
  if (cliOptions?.services) {
    // --services mailpit,minio
    services = (cliOptions.services as string).split(',').map((s) => s.trim()) as ServiceType[];
  } else if (!yes) {
    const needsServices = await confirm({
      message: 'Do you want additional services? (mailer, S3 storage, queues...)',
      default: false,
    });

    if (needsServices) {
      const serviceChoices: Array<{ name: string; value: ServiceType }> = [
        { name: 'Mailpit (email testing)', value: 'mailpit' },
        { name: 'MinIO (S3-compatible storage)', value: 'minio' },
        { name: 'RabbitMQ (message queue)', value: 'rabbitmq' },
      ];
      // Adminer only makes sense if at least one SQL database is selected
      if (databases.some((db) => ['postgresql', 'mysql', 'sqlite'].includes(db))) {
        serviceChoices.push({ name: 'Adminer (database admin UI)', value: 'adminer' });
      }
      services = await checkbox({
        message: 'Select services (space to toggle):',
        choices: serviceChoices,
        required: true,
      });
    }
  }
  // else: --yes with no --services → services = []

  // TypeScript — JS stacks only
  let typescript = true;
  if (cliOptions?.typescript === false) {
    typescript = false;
  } else if (!yes && isJsStack(stack)) {
    typescript = await confirm({
      message: 'Use TypeScript?',
      default: true,
    });
  }
  // else: --yes → typescript = true (default)

  // ESLint + Prettier — JS stacks only
  let eslintPrettier = true;
  if (cliOptions?.eslint === false) {
    eslintPrettier = false;
  } else if (!yes && isJsStack(stack)) {
    eslintPrettier = await confirm({
      message: 'Include ESLint and Prettier?',
      default: true,
    });
  } else if (!isJsStack(stack)) {
    eslintPrettier = false;
  }
  // else: --yes → eslintPrettier = true (default)

  // Application modules
  let modules: ModuleType[] = [];
  let authStrategy: AuthStrategy | undefined;

  if (cliOptions?.modules) {
    // --modules auth,crud,admin
    modules = (cliOptions.modules as string).split(',').map((s) => s.trim()) as ModuleType[];
  } else if (!yes) {
    const needsModules = await confirm({
      message: 'Do you want to add application modules? (auth, admin, API docs...)',
      default: false,
    });

    if (needsModules) {
      const availableModules = getModulesForStack(stack);
      // Filter modules that require a database if none selected
      const filteredModules = availableModules.filter((mod) => {
        if (mod.requiresDatabase && databases.length === 0) return false;
        return true;
      });

      if (filteredModules.length > 0) {
        modules = await checkbox({
          message: 'Select modules (space to toggle):',
          choices: filteredModules.map((mod) => ({
            name: `${mod.label} — ${mod.description}`,
            value: mod.name,
          })),
          required: true,
        });
      }
    }
  }
  // else: --yes with no --modules → modules = []

  // Resolve module dependencies (e.g., admin → auth)
  if (modules.length > 0) {
    modules = resolveModuleDependencies(modules);
  }

  // Auto-add services required by modules (e.g., file-upload → minio)
  if (modules.length > 0) {
    services = resolveModuleServices(modules, services);
  }

  // Auth strategy prompt (if auth module selected)
  if (modules.includes('auth')) {
    if (cliOptions?.authStrategy) {
      authStrategy = cliOptions.authStrategy as AuthStrategy;
    } else if (yes) {
      authStrategy = 'jwt';
    } else {
      authStrategy = await select({
        message: 'Authentication strategy:',
        choices: [
          {
            name: 'JWT (stateless API)',
            value: 'jwt' as const,
            description: 'JSON Web Tokens — ideal for SPA + API architectures',
          },
          {
            name: 'Session (server-side)',
            value: 'session' as const,
            description: 'Cookie-based sessions — traditional server-rendered apps',
          },
        ],
      });
    }
  }

  return {
    projectName: projectName as string,
    stack,
    typescript,
    databases,
    eslintPrettier,
    docker: cliOptions?.docker !== false,
    orm,
    services,
    modules,
    authStrategy,
  };
}
