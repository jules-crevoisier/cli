import type { GeneratorContext, ProjectOptions } from '../types';
import { isJsStack, isPhpStack } from '../utils/stacks';
import { STACK_DESCRIPTIONS } from '../constants';

function generateStructureTree(options: ProjectOptions): string {
  const lines: string[] = [`${options.projectName}/`];

  if (options.docker && (options.databases.length > 0 || options.services.length > 0)) {
    lines.push('├── docker-compose.yml');
    lines.push('├── Dockerfile');
    lines.push('├── .dockerignore');
  }
  lines.push('├── .env');
  lines.push('├── .env.example');
  lines.push('├── .gitignore');
  lines.push('├── README.md');
  lines.push('├── agent.md');
  if (options.eslintPrettier && isJsStack(options.stack)) {
    lines.push('├── eslint.config.js');
    lines.push('├── .prettierrc');
  }

  if (options.stack === 'nextjs') {
    lines.push('├── package.json');
    lines.push('├── tsconfig.json');
    lines.push('├── next.config.js');
    lines.push('├── postcss.config.js');
    if (options.orm === 'prisma') {
      lines.push('├── prisma/');
      lines.push('│   ├── schema.prisma');
      lines.push('│   └── seed.ts');
    }
    lines.push('├── src/');
    lines.push('│   ├── app/');
    lines.push('│   │   ├── layout.tsx');
    lines.push('│   │   ├── page.tsx');
    lines.push('│   │   └── globals.css');
    lines.push('│   └── lib/');
    if (options.databases.length > 0) lines.push('│       └── db.ts');
    lines.push('└── public/');
  } else if (options.stack === 'vite-react') {
    lines.push('├── package.json');
    lines.push('├── tsconfig.json');
    lines.push('├── vite.config.ts');
    lines.push('├── index.html');
    if (options.orm === 'prisma') {
      lines.push('├── prisma/');
      lines.push('│   ├── schema.prisma');
      lines.push('│   └── seed.ts');
    }
    lines.push('├── src/');
    lines.push('│   ├── main.tsx');
    lines.push('│   ├── App.tsx');
    lines.push('│   ├── index.css');
    lines.push('│   └── lib/');
    if (options.databases.length > 0) lines.push('│       └── db.ts');
    lines.push('└── public/');
  } else if (options.stack === 'nuxt') {
    lines.push('├── package.json');
    lines.push('├── nuxt.config.ts');
    lines.push('├── tsconfig.json');
    lines.push('├── app.vue');
    if (options.orm === 'prisma') {
      lines.push('├── prisma/');
      lines.push('│   ├── schema.prisma');
      lines.push('│   └── seed.ts');
    }
    lines.push('├── pages/');
    lines.push('│   └── index.vue');
    lines.push('├── server/');
    lines.push('│   ├── api/');
    lines.push('│   └── utils/');
    if (options.databases.length > 0) lines.push('│       └── db.ts');
    lines.push('├── composables/');
    lines.push('├── components/');
    lines.push('├── assets/');
    lines.push('│   └── css/');
    lines.push('│       └── main.css');
    lines.push('└── public/');
  } else if (options.stack === 'vite-react-express') {
    lines.push('├── package.json');
    lines.push('├── client/');
    lines.push('│   ├── package.json');
    lines.push('│   ├── tsconfig.json');
    lines.push('│   ├── vite.config.ts');
    lines.push('│   ├── index.html');
    lines.push('│   └── src/');
    lines.push('│       ├── main.tsx');
    lines.push('│       ├── App.tsx');
    lines.push('│       └── index.css');
    lines.push('├── server/');
    lines.push('│   ├── package.json');
    lines.push('│   ├── tsconfig.json');
    if (options.orm === 'prisma') {
      lines.push('│   ├── prisma/');
      lines.push('│   │   ├── schema.prisma');
      lines.push('│   │   └── seed.ts');
    }
    lines.push('│   └── src/');
    lines.push('│       ├── index.ts');
    lines.push('│       ├── routes/');
    lines.push('│       └── middleware/');
    lines.push('└── public/');
  } else if (options.stack === 'express') {
    lines.push('├── package.json');
    lines.push('├── tsconfig.json');
    if (options.orm === 'prisma') {
      lines.push('├── prisma/');
      lines.push('│   ├── schema.prisma');
      lines.push('│   └── seed.ts');
    }
    lines.push('├── src/');
    lines.push('│   ├── index.ts');
    lines.push('│   ├── routes/');
    lines.push('│   │   ├── index.ts');
    lines.push('│   │   └── health.ts');
    lines.push('│   ├── middleware/');
    lines.push('│   │   └── errorHandler.ts');
    lines.push('│   └── lib/');
    if (options.databases.length > 0) lines.push('│       └── db.ts');
    lines.push('└── tests/');
    lines.push('    └── health.test.ts');
  } else if (options.stack === 'symfony') {
    lines.push('├── composer.json');
    lines.push('├── Caddyfile');
    lines.push('├── config/');
    lines.push('│   ├── bundles.php');
    lines.push('│   ├── routes.yaml');
    lines.push('│   └── packages/');
    lines.push('│       ├── framework.yaml');
    lines.push('│       └── doctrine.yaml');
    lines.push('├── public/');
    lines.push('│   └── index.php');
    lines.push('├── src/');
    lines.push('│   ├── Kernel.php');
    lines.push('│   ├── Controller/');
    lines.push('│   │   └── HomeController.php');
    lines.push('│   └── Entity/');
    lines.push('│       └── User.php');
    lines.push('└── var/');
  } else if (options.stack === 'laravel') {
    lines.push('├── composer.json');
    lines.push('├── nginx.conf');
    lines.push('├── app/');
    lines.push('│   ├── Models/');
    lines.push('│   │   └── User.php');
    lines.push('│   └── Providers/');
    lines.push('│       └── AppServiceProvider.php');
    lines.push('├── bootstrap/');
    lines.push('│   └── app.php');
    lines.push('├── config/');
    lines.push('│   ├── app.php');
    lines.push('│   └── database.php');
    lines.push('├── database/');
    lines.push('│   ├── migrations/');
    lines.push('│   └── seeders/');
    lines.push('├── public/');
    lines.push('│   └── index.php');
    lines.push('├── routes/');
    lines.push('│   └── web.php');
    lines.push('└── storage/');
  }

  return lines.join('\n');
}

function getDatabaseConnectionSection(db: string, projectName: string, isJs: boolean): string {
  const dbName = projectName.replace(/-/g, '_');
  const sections: Record<string, string> = {
    postgresql: `### PostgreSQL
- **Host**: \`${isJs ? 'localhost' : 'db-postgres'}\`
- **Port**: \`5432\`
- **User**: \`postgres\`
- **Password**: \`postgres\`
- **Database**: \`${dbName}\`
- **Connection string**: \`postgresql://postgres:postgres@${isJs ? 'localhost' : 'db-postgres'}:5432/${dbName}\`
`,
    mongodb: `### MongoDB
- **Host**: \`${isJs ? 'localhost' : 'db-mongo'}\`
- **Port**: \`27017\`
- **Database**: \`${dbName}\`
- **Connection string**: \`mongodb://${isJs ? 'localhost' : 'db-mongo'}:27017/${dbName}\`
`,
    mysql: `### MySQL
- **Host**: \`${isJs ? 'localhost' : 'db-mysql'}\`
- **Port**: \`3306\`
- **User**: \`root\`
- **Password**: \`root\`
- **Database**: \`${dbName}\`
`,
    redis: `### Redis
- **Host**: \`${isJs ? 'localhost' : 'db-redis'}\`
- **Port**: \`6379\`
- **Connection string**: \`redis://${isJs ? 'localhost' : 'db-redis'}:6379\`
`,
    sqlite: `### SQLite
- **File path**: \`./data/database.sqlite\`
- No external service required — file-based database
`,
  };
  return sections[db] || '';
}

function getStackConventions(options: ProjectOptions): string {
  if (options.stack === 'nextjs') {
    return `- This project uses the **Next.js App Router** (not Pages Router)
- Server Components are the default. Use \`"use client"\` directive only when client-side interactivity is needed
- Place API routes in \`src/app/api/\`
- Use \`next/image\` for images, \`next/link\` for navigation
- Styles use **Tailwind CSS** via \`@import "tailwindcss"\` in globals.css
- The \`@/*\` path alias maps to \`./src/*\`
`;
  }
  if (options.stack === 'vite-react') {
    return `- This is a **Vite + React SPA** (Single Page Application)
- No server-side rendering — purely client-side
- Entry point is \`src/main.tsx\`, root component is \`src/App.tsx\`
- Styles use **Tailwind CSS** via \`@import "tailwindcss"\` in index.css, configured through the \`@tailwindcss/vite\` plugin
- Use React hooks and functional components
- Vite provides HMR (Hot Module Replacement) out of the box
`;
  }
  if (options.stack === 'nuxt') {
    return `- This is a **Nuxt 3** full-stack application (Vue + Nitro server)
- **File-based routing**: pages in \`pages/\` are auto-registered as routes
- **Server routes**: API endpoints go in \`server/api/\` (Nitro server)
- **Composables**: shared logic in \`composables/\` is auto-imported
- **Components**: Vue components in \`components/\` are auto-imported
- Use the **Composition API** with \`<script setup>\` syntax
- Styles use **Tailwind CSS** via \`@import "tailwindcss"\` in assets/css/main.css
- Root component is \`app.vue\` with \`<NuxtPage />\` for rendering routes
- Use \`<NuxtLink>\` for navigation, \`useFetch\` / \`$fetch\` for data fetching
`;
  }
  if (options.stack === 'vite-react-express') {
    return `- This is a **monorepo** with two sub-projects:
  - \`client/\` — Vite + React SPA (frontend)
  - \`server/\` — Express.js API (backend)
- The Vite dev server proxies \`/api\` requests to the Express server
- In production, Express serves the built React app as static files
- **Client**: React hooks, functional components, Tailwind CSS
- **Server**: Routes in \`server/src/routes/\`, middleware in \`server/src/middleware/\`
- Entry points: \`client/src/main.tsx\` (frontend), \`server/src/index.ts\` (backend)
- Use \`concurrently\` to run both dev servers: \`npm run dev\`
`;
  }
  if (options.stack === 'express') {
    return `- Routes are organized in \`src/routes/\`. Each file exports a Router
- Middleware goes in \`src/middleware/\`
- Use async/await with proper error handling in route handlers
- All errors flow through the centralized error handler in \`src/middleware/errorHandler.ts\`
- The API is mounted at \`/api\` prefix
- Health check endpoint: \`GET /api/health\`
- Tests are in the \`tests/\` directory using Vitest
`;
  }
  if (options.stack === 'symfony') {
    return `- This is a **Symfony** PHP application
- Controllers are in \`src/Controller/\` and use PHP 8 Attributes for routing
- Entities are in \`src/Entity/\` with Doctrine ORM annotations
- Configuration files are in \`config/\` using YAML format
- The web server is **Caddy** (reverse proxy to PHP-FPM)
- Use \`php bin/console\` for Symfony commands
- Doctrine CLI: \`php bin/console doctrine:migrations:migrate\`
`;
  }
  if (options.stack === 'laravel') {
    return `- This is a **Laravel** PHP application
- Controllers go in \`app/Http/Controllers/\`
- Models are in \`app/Models/\` using Eloquent ORM
- Routes are in \`routes/web.php\` (web) and \`routes/api.php\` (API)
- Configuration files are in \`config/\`
- The web server is **Nginx** (reverse proxy to PHP-FPM)
- Use \`php artisan\` for Laravel commands
- Migrations: \`php artisan migrate\`
- Seeders: \`php artisan db:seed\`
`;
  }
  return '';
}

function getAiInstructions(options: ProjectOptions): string {
  const lines: string[] = [];
  lines.push('When working on this project:\n');

  if (isJsStack(options.stack)) {
    if (options.stack === 'vite-react-express') {
      lines.push('- Frontend code is in `client/src/`, backend code is in `server/src/`');
    } else if (options.stack === 'nuxt') {
      lines.push('- Frontend code is in `pages/`, `components/`, `composables/`');
      lines.push('- Backend code is in `server/api/` and `server/utils/`');
    } else {
      lines.push('- All source code is in the `src/` directory');
    }

    if (options.typescript) {
      lines.push('- Use TypeScript with strict mode enabled. Avoid `any` types');
      lines.push('- Prefer interfaces over type aliases for object shapes');
    }

    if (options.stack === 'nextjs') {
      lines.push('- This project uses the Next.js App Router (not Pages Router)');
      lines.push('- Server Components are the default. Use `"use client"` only when needed for interactivity');
      lines.push('- Place API routes in `src/app/api/`');
    }

    if (options.stack === 'vite-react') {
      lines.push('- This is a client-side SPA with Vite + React');
      lines.push('- Use functional components and React hooks');
    }

    if (options.stack === 'nuxt') {
      lines.push('- This is a full-stack Nuxt 3 app with Nitro server');
      lines.push('- Use the Composition API with `<script setup>` syntax');
      lines.push('- Pages in `pages/` are auto-registered routes (file-based routing)');
      lines.push('- Server routes in `server/api/` handle API requests');
      lines.push('- Composables in `composables/` are auto-imported');
    }

    if (options.stack === 'vite-react-express') {
      lines.push('- This is a monorepo: `client/` (Vite + React) + `server/` (Express)');
      lines.push('- The Vite dev server proxies `/api` to Express (port 4000)');
      lines.push('- Use functional components and React hooks in `client/`');
      lines.push('- Routes are in `server/src/routes/`. Each route file exports a Router');
      lines.push('- Middleware goes in `server/src/middleware/`');
    }

    if (options.stack === 'express') {
      lines.push('- Routes are in `src/routes/`. Each route file exports a Router');
      lines.push('- Middleware goes in `src/middleware/`');
      lines.push('- Use async/await with proper error handling');
    }

    if (options.databases.length > 0) {
      if (options.stack === 'nuxt') {
        lines.push('- Database configuration is in `server/utils/db.ts`');
      } else if (options.stack === 'vite-react-express') {
        lines.push('- Database configuration is in `server/src/lib/db.ts`');
      } else {
        lines.push('- Database configuration is in `src/lib/db.ts`');
      }
      lines.push('- Connection strings come from environment variables (see `.env`)');
    }

    if (options.orm === 'prisma') {
      if (options.stack === 'vite-react-express') {
        lines.push('- **Prisma ORM** is configured. Schema is in `server/prisma/schema.prisma`');
        lines.push('- Use `cd server && npx prisma migrate dev` to create migrations');
        lines.push('- Use `cd server && npx prisma studio` for a visual database editor');
        lines.push('- Import the Prisma client from `server/src/lib/db.ts`');
        lines.push('- After changing the schema, run `cd server && npx prisma generate`');
      } else {
        lines.push('- **Prisma ORM** is configured. Schema is in `prisma/schema.prisma`');
        lines.push('- Use `npx prisma migrate dev` to create migrations');
        lines.push('- Use `npx prisma studio` for a visual database editor');
        if (options.stack === 'nuxt') {
          lines.push('- Import the Prisma client from `server/utils/db.ts`');
        } else {
          lines.push('- Import the Prisma client from `src/lib/db.ts`');
        }
        lines.push('- After changing the schema, run `npx prisma generate`');
      }
    }

    if (options.stack === 'vite-react-express') {
      lines.push('- Run `npm run dev` to start both client and server concurrently');
      lines.push('- Only databases/services are in Docker. Both client and server run locally');
    } else {
      lines.push('- The app runs locally with `npm run dev`. Only databases are in Docker');
    }

    if (options.services.includes('mailpit')) {
      lines.push('- Mailpit is configured for local email testing. Use `MAIL_HOST` and `MAIL_PORT` from `.env`');
      lines.push('- View captured emails at http://localhost:8025');
    }
    if (options.services.includes('minio')) {
      lines.push('- MinIO (S3-compatible) is configured. Use `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` from `.env`');
      lines.push('- MinIO Console: http://localhost:9001');
    }
    if (options.services.includes('rabbitmq')) {
      lines.push('- RabbitMQ is configured. Use `RABBITMQ_URL` from `.env`');
      lines.push('- RabbitMQ Management: http://localhost:15672');
    }

    if (options.eslintPrettier) {
      lines.push('- Code must pass ESLint and Prettier checks. Config files: `eslint.config.js` (ESLint 9 flat config) and `.prettierrc`');
      lines.push('- Run `npm run lint` to check, `npm run format` to auto-format');
    }

    lines.push('- Use Tailwind CSS utility classes for styling');

    // Module-specific instructions
    if (options.modules.includes('auth')) {
      lines.push('- Authentication is pre-configured. See the Modules section above for file locations');
      if (options.authStrategy === 'jwt') {
        lines.push('- JWT tokens are used for auth. Include `Authorization: Bearer <token>` header in API requests');
      } else {
        lines.push('- Session-based auth is used. Cookies are set automatically on login');
      }
    }
    if (options.modules.includes('crud')) {
      lines.push('- A CRUD example (`Item`) is provided. Use it as a pattern for new resources');
    }
    if (options.modules.includes('admin')) {
      lines.push('- Admin dashboard is at `/admin`. Only users with `role: "admin"` can access it');
    }
    if (options.modules.includes('dark-mode')) {
      lines.push('- Dark mode is configured with Tailwind `dark:` classes. Use `dark:bg-gray-900` etc.');
    }
  }

  if (options.stack === 'symfony') {
    lines.push('- Source code is in `src/`. Controllers in `src/Controller/`, Entities in `src/Entity/`');
    lines.push('- Use PHP 8 Attributes for routing (`#[Route(...)]`)');
    lines.push('- Doctrine ORM handles database access. Entities define the schema');
    lines.push('- Run `php bin/console doctrine:migrations:diff` to generate migrations');
    lines.push('- Run `php bin/console doctrine:migrations:migrate` to apply them');
    lines.push('- The app runs entirely in Docker: `docker compose up --watch`');
    lines.push('- Use `docker compose exec app php bin/console ...` for Symfony commands');
    if (options.services.includes('mailpit')) {
      lines.push('- Mailpit captures all outgoing emails. Web UI: http://localhost:8025');
      lines.push('- SMTP is configured via `MAIL_HOST` and `MAIL_PORT` in `.env`');
    }
  }

  if (options.stack === 'laravel') {
    lines.push('- Application logic is in `app/`. Models in `app/Models/`, Controllers in `app/Http/Controllers/`');
    lines.push('- Eloquent ORM handles database access. Models define relationships');
    lines.push('- Run `php artisan make:migration` to create migrations');
    lines.push('- Run `php artisan migrate` to apply them');
    lines.push('- Run `php artisan db:seed` to seed the database');
    lines.push('- The app runs entirely in Docker: `docker compose up --watch`');
    lines.push('- Use `docker compose exec app php artisan ...` for Laravel commands');
    if (options.services.includes('mailpit')) {
      lines.push('- Mailpit captures all outgoing emails. Web UI: http://localhost:8025');
      lines.push('- SMTP is configured via `MAIL_HOST` and `MAIL_PORT` in `.env`');
    }
  }

  return lines.join('\n');
}

export function generateAgentMd(ctx: GeneratorContext, port: number): string {
  const { options, versions } = ctx;
  const jsStack = isJsStack(options.stack);
  const phpStack = isPhpStack(options.stack);
  const sections: string[] = [];

  // Header
  sections.push(`# ${options.projectName}\n`);
  sections.push('> This file was auto-generated by letscraft. It provides context for AI coding assistants.\n');

  // Project overview
  sections.push('## Project Overview\n');
  sections.push(`- **Type**: ${STACK_DESCRIPTIONS[options.stack]}`);

  if (jsStack) {
    sections.push(`- **Language**: ${options.typescript ? 'TypeScript' : 'JavaScript'}`);
    sections.push(`- **Runtime**: Node.js ${versions.node}`);
    sections.push('- **Styling**: Tailwind CSS');
  } else if (phpStack) {
    sections.push(`- **Language**: PHP ${versions.php}`);
    sections.push(`- **Runtime**: PHP-FPM (Docker)`);
  }

  if (options.databases.length > 0) {
    sections.push(`- **Databases**: ${options.databases.join(', ')}`);
  }

  if (options.services.length > 0) {
    const serviceLabels: Record<string, string> = {
      mailpit: 'Mailpit (email testing)',
      minio: 'MinIO (S3 storage)',
      rabbitmq: 'RabbitMQ (message queue)',
      adminer: 'Adminer (DB admin)',
    };
    const labels = options.services.map((s) => serviceLabels[s] || s).join(', ');
    sections.push(`- **Services**: ${labels}`);
  }

  if (options.orm !== 'none') {
    const ormLabels: Record<string, string> = {
      prisma: 'Prisma',
      doctrine: 'Doctrine',
      eloquent: 'Eloquent',
    };
    sections.push(`- **ORM**: ${ormLabels[options.orm]}`);
  }

  if (options.modules.length > 0) {
    const modLabels: Record<string, string> = {
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
    sections.push(`- **Modules**: ${options.modules.map((m) => modLabels[m] || m).join(', ')}`);
    if (options.authStrategy) {
      sections.push(`- **Auth Strategy**: ${options.authStrategy === 'jwt' ? 'JWT (stateless)' : 'Session (cookie-based)'}`);
    }
  }

  if (jsStack) {
    sections.push(`- **Docker**: Databases only (app runs locally)`);
  } else {
    sections.push(`- **Docker**: Full stack (app + databases)`);
  }
  sections.push('');

  // Stack & versions
  sections.push('## Stack & Versions\n');
  sections.push('| Technology | Version |');
  sections.push('|---|---|');

  if (options.stack === 'nextjs') {
    sections.push(`| Next.js | ${versions.nextjs} |`);
    sections.push(`| React | ${versions.react} |`);
  } else if (options.stack === 'vite-react') {
    sections.push(`| Vite | ${versions.vite} |`);
    sections.push(`| React | ${versions.react} |`);
  } else if (options.stack === 'nuxt') {
    sections.push(`| Nuxt | ${versions.nuxt} |`);
  } else if (options.stack === 'vite-react-express') {
    sections.push(`| Vite | ${versions.vite} |`);
    sections.push(`| React | ${versions.react} |`);
    sections.push(`| Express.js | ${versions.express} |`);
  } else if (options.stack === 'express') {
    sections.push(`| Express.js | ${versions.express} |`);
  } else if (options.stack === 'symfony') {
    sections.push(`| Symfony | ${versions.symfony} |`);
    sections.push(`| PHP | ${versions.php} |`);
  } else if (options.stack === 'laravel') {
    sections.push(`| Laravel | ${versions.laravel} |`);
    sections.push(`| PHP | ${versions.php} |`);
  }

  if (jsStack) {
    sections.push(`| Node.js | ${versions.node} |`);
    if (options.typescript) sections.push(`| TypeScript | ${versions.typescript} |`);
    sections.push(`| Tailwind CSS | ${versions.tailwind} |`);
  }

  if (options.orm === 'prisma') sections.push('| Prisma | 6 |');
  if (options.orm === 'doctrine') sections.push('| Doctrine ORM | 3 |');
  if (options.orm === 'eloquent') sections.push('| Eloquent ORM | (built-in) |');

  for (const db of options.databases) {
    const dbLabels: Record<string, string> = {
      postgresql: 'PostgreSQL',
      mongodb: 'MongoDB',
      mysql: 'MySQL',
      redis: 'Redis',
      sqlite: 'SQLite',
    };
    const dbVersions: Record<string, string> = {
      postgresql: versions.databases.postgresql,
      mongodb: versions.databases.mongodb,
      mysql: versions.databases.mysql,
      redis: versions.databases.redis,
      sqlite: 'file-based',
    };
    sections.push(`| ${dbLabels[db]} | ${dbVersions[db]} |`);
  }

  if (options.services.includes('mailpit')) sections.push('| Mailpit | latest |');
  if (options.services.includes('minio')) sections.push('| MinIO | latest |');
  if (options.services.includes('rabbitmq')) sections.push('| RabbitMQ | 4 (management) |');
  if (options.services.includes('adminer')) sections.push('| Adminer | latest |');
  sections.push('');

  // Project structure
  sections.push('## Project Structure\n');
  sections.push('```');
  sections.push(generateStructureTree(options));
  sections.push('```\n');

  // Commands
  sections.push('## Commands\n');

  if (jsStack) {
    sections.push('### Development\n');
    sections.push('```bash');
    sections.push('# Install dependencies');
    if (options.stack === 'vite-react-express') {
      sections.push('npm run install:all');
    } else {
      sections.push('npm install');
    }
    sections.push('');
    if ((options.databases.length > 0 || options.services.length > 0) && options.docker) {
      sections.push('# Start Docker services');
      sections.push('docker compose up -d');
      sections.push('');
    }
    if (options.orm === 'prisma') {
      sections.push('# Generate Prisma client');
      if (options.stack === 'vite-react-express') {
        sections.push('npm --prefix server run db:generate');
      } else {
        sections.push('npx prisma generate');
      }
      sections.push('');
      sections.push('# Run database migrations');
      if (options.stack === 'vite-react-express') {
        sections.push('npm --prefix server run db:migrate');
      } else {
        sections.push('npx prisma migrate dev');
      }
      sections.push('');
      sections.push('# Seed the database');
      if (options.stack === 'vite-react-express') {
        sections.push('npm --prefix server run db:seed');
      } else {
        sections.push('npx prisma db seed');
      }
      sections.push('');
      sections.push('# Open Prisma Studio (visual DB editor)');
      if (options.stack === 'vite-react-express') {
        sections.push('npm --prefix server run db:studio');
      } else {
        sections.push('npx prisma studio');
      }
      sections.push('');
    }
    sections.push('# Start the app');
    sections.push('npm run dev');
    sections.push('```\n');

    sections.push('### Production\n');
    sections.push('```bash');
    sections.push('npm run build');
    if (options.stack === 'nextjs' || options.stack === 'express' || options.stack === 'vite-react-express') {
      sections.push('npm start');
    }
    sections.push('');
    sections.push('# Or build a Docker image');
    sections.push(`docker build -t ${options.projectName} .`);
    sections.push('```\n');
  }

  if (phpStack) {
    sections.push('### Development (Docker)\n');
    sections.push('```bash');
    sections.push('# Start all services with hot-reload');
    sections.push('docker compose up --watch');
    sections.push('');
    sections.push('# Start in detached mode');
    sections.push('docker compose up --watch -d');
    sections.push('');
    sections.push('# Stop all services');
    sections.push('docker compose down');
    sections.push('');
    sections.push('# Rebuild after dependency changes');
    sections.push('docker compose up --build');
    sections.push('');
    sections.push('# View logs');
    sections.push('docker compose logs -f app');
    sections.push('```\n');

    if (options.stack === 'symfony') {
      sections.push('### Symfony Commands\n');
      sections.push('```bash');
      sections.push('docker compose exec app php bin/console ...');
      sections.push('docker compose exec app php bin/console doctrine:migrations:migrate');
      sections.push('docker compose exec app composer require <package>');
      sections.push('```\n');
    }

    if (options.stack === 'laravel') {
      sections.push('### Laravel Commands\n');
      sections.push('```bash');
      sections.push('docker compose exec app php artisan ...');
      sections.push('docker compose exec app php artisan migrate');
      sections.push('docker compose exec app php artisan db:seed');
      sections.push('docker compose exec app composer require <package>');
      sections.push('```\n');
    }
  }

  // Database connections
  if (options.databases.length > 0) {
    sections.push('## Database Connections\n');
    if (jsStack) {
      sections.push('Databases run in Docker. The app connects via `localhost` (ports exposed to host).\n');
    } else {
      sections.push('Connection details are defined in `.env`. The app uses Docker service names as hostnames.\n');
    }
    for (const db of options.databases) {
      sections.push(getDatabaseConnectionSection(db, options.projectName, jsStack));
    }
  }

  // Services
  if (options.services.includes('mailpit')) {
    const mHost = jsStack ? 'localhost' : 'mailpit';
    sections.push('## Mailer (Mailpit)\n');
    sections.push('Mailpit captures all outgoing emails for local testing. No emails are actually sent.\n');
    sections.push(`- **SMTP Host**: \`${mHost}\``);
    sections.push('- **SMTP Port**: `1025`');
    sections.push('- **Web UI**: [http://localhost:8025](http://localhost:8025)');
    sections.push(`- **Mail From**: \`noreply@${options.projectName}.local\``);
    sections.push('');
  }

  if (options.services.includes('minio')) {
    const sHost = jsStack ? 'localhost' : 'minio';
    sections.push('## Object Storage (MinIO)\n');
    sections.push('MinIO provides S3-compatible object storage for local development.\n');
    sections.push(`- **API Endpoint**: \`http://${sHost}:9000\``);
    sections.push(`- **Console**: [http://localhost:9001](http://localhost:9001)`);
    sections.push('- **Access Key**: `minioadmin`');
    sections.push('- **Secret Key**: `minioadmin`');
    sections.push(`- **Default Bucket**: \`${options.projectName.replace(/-/g, '_')}\``);
    sections.push('');
  }

  if (options.services.includes('rabbitmq')) {
    const sHost = jsStack ? 'localhost' : 'rabbitmq';
    sections.push('## Message Queue (RabbitMQ)\n');
    sections.push('RabbitMQ provides a message broker for async job processing.\n');
    sections.push(`- **AMQP URL**: \`amqp://${sHost}:5672\``);
    sections.push('- **Management UI**: [http://localhost:15672](http://localhost:15672)');
    sections.push('- **User**: `guest`');
    sections.push('- **Password**: `guest`');
    sections.push('');
  }

  if (options.services.includes('adminer')) {
    sections.push('## Database Admin (Adminer)\n');
    sections.push('Adminer provides a web-based database management UI.\n');
    sections.push('- **URL**: [http://localhost:8080](http://localhost:8080)');
    sections.push('');
  }

  // Modules
  if (options.modules.length > 0) {
    sections.push('## Modules\n');
    const moduleLabels: Record<string, string> = {
      auth: 'Authentication',
      crud: 'CRUD API',
      admin: 'Admin Dashboard',
      'file-upload': 'File Upload',
      email: 'Email (Transactional)',
      'api-docs': 'API Documentation',
      i18n: 'Internationalization',
      'dark-mode': 'Dark Mode',
      'ci-cd': 'CI/CD',
    };
    sections.push(`Active modules: ${options.modules.map((m) => moduleLabels[m] || m).join(', ')}\n`);

    if (options.modules.includes('auth')) {
      sections.push('### Authentication\n');
      sections.push(`Strategy: **${options.authStrategy === 'session' ? 'Session (cookie-based)' : 'JWT (stateless)'}**\n`);

      if (options.stack === 'express') {
        sections.push('- Auth routes: `src/routes/auth.ts`');
        sections.push('  - `POST /api/auth/register` — Create account');
        sections.push('  - `POST /api/auth/login` — Login');
        sections.push('  - `POST /api/auth/logout` — Logout');
        sections.push('  - `GET /api/auth/me` — Current user');
        sections.push('- Middleware: `src/middleware/auth.ts` — `requireAuth`, `requireAdmin`');
        sections.push('- Helpers: `src/lib/auth.ts` — password hashing, token signing');
      } else if (options.stack === 'nextjs') {
        sections.push('- API routes: `src/app/api/auth/{login,register,me}/route.ts`');
        sections.push('- Pages: `src/app/login/page.tsx`, `src/app/register/page.tsx`');
        sections.push('- Auth lib: `src/lib/auth.ts` — helpers, cookie management');
      } else if (options.stack === 'vite-react') {
        sections.push('- Pages: `src/pages/Login.tsx`, `src/pages/Register.tsx`');
        sections.push('- Hook: `src/hooks/useAuth.ts` — login, register, logout, user state');
        sections.push('- Auth lib: `src/lib/auth.ts`');
      } else if (options.stack === 'nuxt') {
        sections.push('- API routes: `server/api/auth/login.post.ts`, `server/api/auth/register.post.ts`, `server/api/auth/me.get.ts`');
        sections.push('- Pages: `pages/login.vue`, `pages/register.vue`');
        sections.push('- Composable: `composables/useAuth.ts`');
        sections.push('- Helpers: `server/utils/auth.ts` — password hashing, token signing');
      } else if (options.stack === 'vite-react-express') {
        sections.push('- API routes (server): `server/src/routes/auth.ts`');
        sections.push('- Middleware (server): `server/src/middleware/auth.ts`');
        sections.push('- Helpers (server): `server/src/lib/auth.ts`');
        sections.push('- Pages (client): `client/src/pages/Login.tsx`, `client/src/pages/Register.tsx`');
        sections.push('- Hook (client): `client/src/hooks/useAuth.ts`');
      } else if (options.stack === 'symfony') {
        sections.push('- Controller: `src/Controller/AuthController.php`');
        sections.push('- Security: `src/Security/JwtAuthenticator.php`');
        sections.push('- Config: `config/packages/security.yaml`');
      } else if (options.stack === 'laravel') {
        sections.push('- Controller: `app/Http/Controllers/AuthController.php`');
        sections.push('- Middleware: `app/Http/Middleware/Authenticate.php`');
        sections.push('- Routes: `routes/auth.php`');
      }

      sections.push('');
      sections.push('Environment variables: `JWT_SECRET`, `JWT_EXPIRES_IN`');
      if (options.authStrategy === 'session') {
        sections.push(', `SESSION_SECRET`');
      }
      sections.push('');
    }

    if (options.modules.includes('crud')) {
      sections.push('### CRUD API\n');
      sections.push('Example CRUD for an `Item` resource.\n');

      if (options.stack === 'express') {
        sections.push('- Routes: `src/routes/items.ts` — GET, POST, PUT, DELETE `/api/items`');
      } else if (options.stack === 'nextjs') {
        sections.push('- API: `src/app/api/items/route.ts`, `src/app/api/items/[id]/route.ts`');
        sections.push('- Page: `src/app/items/page.tsx`');
      } else if (options.stack === 'nuxt') {
        sections.push('- API: `server/api/items/index.get.ts`, `server/api/items/index.post.ts`');
        sections.push('- API: `server/api/items/[id].get.ts`, `server/api/items/[id].put.ts`, `server/api/items/[id].delete.ts`');
        sections.push('- Page: `pages/items/index.vue`');
      } else if (options.stack === 'vite-react-express') {
        sections.push('- API (server): `server/src/routes/items.ts` — GET, POST, PUT, DELETE `/api/items`');
      } else if (options.stack === 'symfony') {
        sections.push('- Controller: `src/Controller/ItemController.php`');
        sections.push('- Entity: `src/Entity/Item.php`');
      } else if (options.stack === 'laravel') {
        sections.push('- Controller: `app/Http/Controllers/ItemController.php`');
        sections.push('- Model: `app/Models/Item.php`');
        sections.push('- Routes: `routes/items.php`');
      }
      sections.push('');
    }

    if (options.modules.includes('admin')) {
      sections.push('### Admin Dashboard\n');
      sections.push('Protected admin area (requires `role: "admin"`).\n');

      if (options.stack === 'nextjs') {
        sections.push('- Layout: `src/app/admin/layout.tsx`');
        sections.push('- Dashboard: `src/app/admin/page.tsx`');
        sections.push('- Users: `src/app/admin/users/page.tsx`');
      } else if (options.stack === 'vite-react') {
        sections.push('- Dashboard: `src/pages/admin/Dashboard.tsx`');
        sections.push('- Users: `src/pages/admin/Users.tsx`');
      } else if (options.stack === 'nuxt') {
        sections.push('- Dashboard: `pages/admin/index.vue`');
        sections.push('- Users: `pages/admin/users.vue`');
        sections.push('- Sidebar: `components/admin/Sidebar.vue`');
      } else if (options.stack === 'vite-react-express') {
        sections.push('- Dashboard (client): `client/src/pages/admin/Dashboard.tsx`');
        sections.push('- Users (client): `client/src/pages/admin/Users.tsx`');
      } else if (options.stack === 'symfony') {
        sections.push('- Controller: `src/Controller/AdminController.php`');
      } else if (options.stack === 'laravel') {
        sections.push('- Controller: `app/Http/Controllers/AdminController.php`');
        sections.push('- Routes: `routes/admin.php`');
      }
      sections.push('');
    }

    if (options.modules.includes('file-upload')) {
      sections.push('### File Upload\n');
      sections.push('S3-compatible file upload (MinIO in dev).\n');

      if (options.stack === 'express') {
        sections.push('- Storage: `src/lib/storage.ts`');
        sections.push('- Route: `src/routes/upload.ts` — `POST /api/upload`');
      } else if (options.stack === 'nextjs') {
        sections.push('- Storage: `src/lib/storage.ts`');
        sections.push('- API: `src/app/api/upload/route.ts`');
      } else if (options.stack === 'nuxt') {
        sections.push('- Storage: `server/utils/storage.ts`');
        sections.push('- API: `server/api/upload.post.ts`');
      } else if (options.stack === 'vite-react-express') {
        sections.push('- Storage (server): `server/src/lib/storage.ts`');
        sections.push('- Route (server): `server/src/routes/upload.ts` — `POST /api/upload`');
      } else if (options.stack === 'symfony') {
        sections.push('- Service: `src/Service/StorageService.php`');
        sections.push('- Controller: `src/Controller/UploadController.php`');
      } else if (options.stack === 'laravel') {
        sections.push('- Controller: `app/Http/Controllers/UploadController.php`');
        sections.push('- Routes: `routes/upload.php`');
      }
      sections.push('\nEnv: `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`\n');
    }

    if (options.modules.includes('email')) {
      sections.push('### Transactional Email\n');
      sections.push('Email with Mailpit for local testing.\n');

      if (options.stack === 'express' || options.stack === 'nextjs') {
        sections.push('- Mailer: `src/lib/mailer.ts`');
        sections.push('- Template: `src/templates/welcome.html`');
      } else if (options.stack === 'nuxt') {
        sections.push('- Mailer: `server/utils/mailer.ts`');
        sections.push('- Template: `server/templates/welcome.html`');
      } else if (options.stack === 'vite-react-express') {
        sections.push('- Mailer (server): `server/src/lib/mailer.ts`');
        sections.push('- Template (server): `server/src/templates/welcome.html`');
      } else if (options.stack === 'symfony') {
        sections.push('- Service: `src/Service/MailerService.php`');
        sections.push('- Template: `templates/emails/welcome.html.twig`');
      } else if (options.stack === 'laravel') {
        sections.push('- Mailable: `app/Mail/WelcomeMail.php`');
        sections.push('- Template: `resources/views/emails/welcome.blade.php`');
      }
      sections.push('\nEnv: `MAIL_HOST`, `MAIL_PORT`, `MAIL_FROM`\n');
    }

    if (options.modules.includes('api-docs')) {
      sections.push('### API Documentation\n');

      if (options.stack === 'express') {
        sections.push('- Swagger: `src/lib/swagger.ts`');
        sections.push(`- URL: [http://localhost:${port}/api/docs](http://localhost:${port}/api/docs)`);
      } else if (options.stack === 'nextjs') {
        sections.push('- Swagger lib: `src/lib/swagger.ts`');
        sections.push('- Docs page: `src/app/api-docs/page.tsx`');
      } else if (options.stack === 'nuxt') {
        sections.push('- Swagger: `server/utils/swagger.ts`');
        sections.push('- API endpoint: `server/api/docs.get.ts`');
      } else if (options.stack === 'vite-react-express') {
        sections.push('- Swagger (server): `server/src/lib/swagger.ts`');
        sections.push(`- URL: [http://localhost:${port}/api/docs](http://localhost:${port}/api/docs)`);
      } else if (options.stack === 'symfony') {
        sections.push('- Config: `config/packages/nelmio_api_doc.yaml`');
      } else if (options.stack === 'laravel') {
        sections.push('- Config: `config/l5-swagger.php`');
      }
      sections.push('');
    }

    if (options.modules.includes('i18n')) {
      sections.push('### Internationalization\n');
      sections.push('Multi-language support (en, fr).\n');

      if (options.stack === 'nextjs') {
        sections.push('- Config: `src/lib/i18n.ts` (next-intl)');
      } else if (options.stack === 'vite-react') {
        sections.push('- Config: `src/lib/i18n.ts` (react-i18next)');
      } else if (options.stack === 'nuxt') {
        sections.push('- Plugin: `plugins/i18n.ts`');
        sections.push('- Locales: `locales/en.json`, `locales/fr.json`');
      } else if (options.stack === 'vite-react-express') {
        sections.push('- Config (client): `client/src/lib/i18n.ts` (react-i18next)');
      } else if (options.stack === 'express') {
        sections.push('- Config: `src/lib/i18n.ts` (i18next)');
      } else if (options.stack === 'symfony') {
        sections.push('- Translations: `translations/messages.{en,fr}.yaml`');
      } else if (options.stack === 'laravel') {
        sections.push('- Translations: `lang/{en,fr}.json`');
      }
      sections.push('');
    }

    if (options.modules.includes('dark-mode')) {
      sections.push('### Dark Mode\n');
      sections.push('Theme toggle with system preference detection and localStorage.\n');

      if (options.stack === 'nextjs' || options.stack === 'vite-react') {
        sections.push('- ThemeProvider: `src/components/ThemeProvider.tsx`');
        sections.push('- Toggle: `src/components/ThemeToggle.tsx`');
      } else if (options.stack === 'nuxt') {
        sections.push('- Composable: `composables/useTheme.ts`');
        sections.push('- Toggle: `components/ThemeToggle.vue`');
      } else if (options.stack === 'vite-react-express') {
        sections.push('- ThemeProvider (client): `client/src/components/ThemeProvider.tsx`');
        sections.push('- Toggle (client): `client/src/components/ThemeToggle.tsx`');
      }
      sections.push('- Uses Tailwind CSS `dark:` variant');
      sections.push('');
    }

    if (options.modules.includes('ci-cd')) {
      sections.push('### CI/CD\n');
      sections.push('- Workflow: `.github/workflows/ci.yml`');
      sections.push('- Jobs: lint, typecheck, test, build');
      sections.push('');
    }
  }

  // Architecture & conventions
  sections.push('## Architecture & Conventions\n');
  sections.push(getStackConventions(options));

  // Development workflow
  sections.push('## Development Workflow\n');
  if (jsStack) {
    let step = 1;
    if (options.databases.length > 0 || options.services.length > 0) {
      sections.push(`${step}. Start Docker services: \`docker compose up -d\``);
      step++;
    }
    if (options.stack === 'vite-react-express') {
      sections.push(`${step}. Install all deps: \`npm run install:all\``);
      step++;
      sections.push(`${step}. Start both servers: \`npm run dev\` (uses concurrently)`);
      step++;
    } else {
      sections.push(`${step}. Start the app: \`npm run dev\``);
      step++;
    }
    sections.push(`${step}. Make changes to files — the dev server handles hot-reload`);
    step++;
    if (options.orm === 'prisma') {
      sections.push(`${step}. After schema changes: \`npx prisma migrate dev\``);
      step++;
    }
    if (options.services.includes('mailpit')) {
      sections.push(`${step}. Open Mailpit: [http://localhost:8025](http://localhost:8025)`);
      step++;
    }
    if (options.services.includes('minio')) {
      sections.push(`${step}. Open MinIO Console: [http://localhost:9001](http://localhost:9001)`);
      step++;
    }
    if (options.services.includes('rabbitmq')) {
      sections.push(`${step}. Open RabbitMQ Management: [http://localhost:15672](http://localhost:15672)`);
    }
  } else {
    sections.push('1. Start: `docker compose up --watch`');
    sections.push('2. Make changes to files in `src/` (or `app/` for Laravel)');
    sections.push('3. Docker Compose Watch automatically syncs changes');
    sections.push('4. If you change `composer.json`, the container rebuilds automatically');
  }
  sections.push('');

  // AI instructions
  sections.push('## Instructions for AI Assistants\n');
  sections.push(getAiInstructions(options));

  return sections.join('\n');
}
