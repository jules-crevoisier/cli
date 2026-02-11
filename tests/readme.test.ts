import { describe, it, expect } from 'vitest';
import ejs from 'ejs';
import fs from 'fs-extra';
import path from 'path';

function getTemplatesDir(): string {
  return path.resolve(__dirname, '..', 'src', 'templates');
}

const defaultVersions = {
  node: '22',
  typescript: '5.7',
  nextjs: '15.1',
  react: '19',
  vite: '6',
  nuxt: '3.15',
  express: '5',
  tailwind: '4',
  eslint: '9',
  prettier: '3',
  php: '8.3',
  composer: '2',
  symfony: '7.2',
  laravel: '11',
  databases: {
    postgresql: '17',
    mongodb: '8',
    mysql: '9',
    redis: '7.4',
  },
};

interface ReadmeData {
  projectName: string;
  stack: string;
  typescript: boolean;
  databases: string[];
  eslintPrettier: boolean;
  docker: boolean;
  orm: string;
  mailer: boolean;
  versions: typeof defaultVersions;
  port: number;
  modules: string[];
  authStrategy?: string;
}

function makeData(overrides: Partial<ReadmeData> = {}): ReadmeData {
  return {
    projectName: 'test-app',
    stack: 'express',
    typescript: true,
    databases: [],
    eslintPrettier: true,
    docker: true,
    orm: 'none',
    mailer: false,
    versions: defaultVersions,
    port: 4000,
    modules: [],
    ...overrides,
  };
}

async function renderReadme(data: ReadmeData): Promise<string> {
  const fullPath = path.join(getTemplatesDir(), 'shared/README.md.ejs');
  const template = await fs.readFile(fullPath, 'utf-8');
  return ejs.render(template, data, { filename: fullPath });
}

// ────────────────────────────────────────────────────────
// Header & description
// ────────────────────────────────────────────────────────

describe('README — header', () => {
  it('starts with project name as H1', async () => {
    const result = await renderReadme(makeData({ projectName: 'my-awesome-app' }));
    expect(result).toMatch(/^# my-awesome-app/);
  });

  it('mentions letscraft', async () => {
    const result = await renderReadme(makeData());
    expect(result).toContain('letscraft');
  });
});

describe('README — stack descriptions', () => {
  it('describes Next.js correctly', async () => {
    const result = await renderReadme(makeData({ stack: 'nextjs', port: 3000 }));
    expect(result).toContain('Next.js');
    expect(result).toContain('React');
  });

  it('describes Vite + React correctly', async () => {
    const result = await renderReadme(makeData({ stack: 'vite-react', port: 5173 }));
    expect(result).toContain('Vite');
    expect(result).toContain('React');
  });

  it('describes Nuxt correctly', async () => {
    const result = await renderReadme(makeData({ stack: 'nuxt', port: 3000 }));
    expect(result).toContain('Nuxt');
  });

  it('describes Vite + React + Express correctly', async () => {
    const result = await renderReadme(makeData({ stack: 'vite-react-express', port: 4000 }));
    expect(result).toContain('Vite');
    expect(result).toContain('React');
    expect(result).toContain('Express');
  });

  it('describes Express correctly', async () => {
    const result = await renderReadme(makeData({ stack: 'express', port: 4000 }));
    expect(result).toContain('Express.js');
  });

  it('describes Symfony correctly', async () => {
    const result = await renderReadme(makeData({ stack: 'symfony', port: 8000 }));
    expect(result).toContain('Symfony');
  });

  it('describes Laravel correctly', async () => {
    const result = await renderReadme(makeData({ stack: 'laravel', port: 8000 }));
    expect(result).toContain('Laravel');
  });
});

// ────────────────────────────────────────────────────────
// Prerequisites
// ────────────────────────────────────────────────────────

describe('README — prerequisites', () => {
  it('mentions Node.js for JS stacks', async () => {
    const result = await renderReadme(makeData({ stack: 'express' }));
    expect(result).toContain('Node.js');
  });

  it('mentions Docker when databases are present', async () => {
    const result = await renderReadme(makeData({ stack: 'express', databases: ['postgresql'] }));
    expect(result).toContain('Docker');
  });

  it('mentions Docker for PHP stacks', async () => {
    const result = await renderReadme(makeData({ stack: 'symfony', port: 8000 }));
    expect(result).toContain('Docker');
  });

  it('mentions Docker when mailer is enabled', async () => {
    const result = await renderReadme(makeData({ stack: 'express', mailer: true }));
    expect(result).toContain('Docker');
  });
});

// ────────────────────────────────────────────────────────
// Getting Started
// ────────────────────────────────────────────────────────

describe('README — Getting Started (JS stacks)', () => {
  it('includes npm install for JS stacks', async () => {
    const result = await renderReadme(makeData({ stack: 'nextjs', port: 3000 }));
    expect(result).toContain('npm install');
  });

  it('includes docker compose up when databases present', async () => {
    const result = await renderReadme(makeData({ stack: 'express', databases: ['redis'] }));
    expect(result).toContain('docker compose up -d');
  });

  it('includes docker compose up when mailer present', async () => {
    const result = await renderReadme(makeData({ stack: 'express', mailer: true }));
    expect(result).toContain('docker compose up -d');
  });

  it('includes npm run dev', async () => {
    const result = await renderReadme(makeData({ stack: 'vite-react', port: 5173 }));
    expect(result).toContain('npm run dev');
  });

  it('includes Prisma commands when ORM is prisma', async () => {
    const result = await renderReadme(makeData({ stack: 'nextjs', port: 3000, orm: 'prisma', databases: ['postgresql'] }));
    expect(result).toContain('npx prisma generate');
    expect(result).toContain('npx prisma migrate dev');
    expect(result).toContain('npx prisma db seed');
  });

  it('shows localhost URL with correct port', async () => {
    const result = await renderReadme(makeData({ stack: 'vite-react', port: 5173 }));
    expect(result).toContain('http://localhost:5173');
  });

  it('shows health check for Express', async () => {
    const result = await renderReadme(makeData({ stack: 'express', port: 4000 }));
    expect(result).toContain('/api/health');
  });
});

describe('README — Getting Started (PHP stacks)', () => {
  it('includes docker compose up --watch for Symfony', async () => {
    const result = await renderReadme(makeData({ stack: 'symfony', port: 8000 }));
    expect(result).toContain('docker compose up --watch');
  });

  it('includes docker compose up --watch for Laravel', async () => {
    const result = await renderReadme(makeData({ stack: 'laravel', port: 8000 }));
    expect(result).toContain('docker compose up --watch');
  });

  it('includes Symfony commands', async () => {
    const result = await renderReadme(makeData({ stack: 'symfony', port: 8000 }));
    expect(result).toContain('php bin/console');
    expect(result).toContain('doctrine:migrations:migrate');
  });

  it('includes Laravel Artisan commands', async () => {
    const result = await renderReadme(makeData({ stack: 'laravel', port: 8000 }));
    expect(result).toContain('php artisan');
    expect(result).toContain('php artisan migrate');
    expect(result).toContain('php artisan db:seed');
  });
});

// ────────────────────────────────────────────────────────
// Available Scripts
// ────────────────────────────────────────────────────────

describe('README — Available Scripts', () => {
  it('lists dev, build for JS stacks', async () => {
    const result = await renderReadme(makeData({ stack: 'express' }));
    expect(result).toContain('`npm run dev`');
    expect(result).toContain('`npm run build`');
  });

  it('lists lint and format when eslintPrettier is true', async () => {
    const result = await renderReadme(makeData({ stack: 'express', eslintPrettier: true }));
    expect(result).toContain('`npm run lint`');
    expect(result).toContain('`npm run format`');
  });

  it('does NOT list lint/format when eslintPrettier is false', async () => {
    const result = await renderReadme(makeData({ stack: 'express', eslintPrettier: false }));
    expect(result).not.toContain('`npm run lint`');
    expect(result).not.toContain('`npm run format`');
  });

  it('lists test command for Express', async () => {
    const result = await renderReadme(makeData({ stack: 'express' }));
    expect(result).toContain('`npm run test`');
  });

  it('lists Prisma scripts when ORM is prisma', async () => {
    const result = await renderReadme(makeData({ stack: 'nextjs', port: 3000, orm: 'prisma', databases: ['postgresql'] }));
    expect(result).toContain('`npm run db:migrate`');
    expect(result).toContain('`npm run db:seed`');
    expect(result).toContain('`npm run db:studio`');
  });

  it('lists npm start for Next.js', async () => {
    const result = await renderReadme(makeData({ stack: 'nextjs', port: 3000 }));
    expect(result).toContain('`npm start`');
  });

  it('lists npm run preview for Vite React', async () => {
    const result = await renderReadme(makeData({ stack: 'vite-react', port: 5173 }));
    expect(result).toContain('`npm run preview`');
  });
});

// ────────────────────────────────────────────────────────
// Database section
// ────────────────────────────────────────────────────────

describe('README — Database section', () => {
  it('shows database table with ports when databases present', async () => {
    const result = await renderReadme(makeData({ stack: 'express', databases: ['postgresql', 'redis'] }));
    expect(result).toContain('PostgreSQL');
    expect(result).toContain('5432');
    expect(result).toContain('Redis');
    expect(result).toContain('6379');
  });

  it('does NOT show Database section when no databases', async () => {
    const result = await renderReadme(makeData({ stack: 'express', databases: [] }));
    expect(result).not.toContain('## Database');
  });

  it('mentions .env for connection details', async () => {
    const result = await renderReadme(makeData({ stack: 'express', databases: ['mysql'] }));
    expect(result).toContain('.env');
  });
});

// ────────────────────────────────────────────────────────
// Mailer section
// ────────────────────────────────────────────────────────

describe('README — Mailer section', () => {
  it('shows Mailpit section when mailer is enabled', async () => {
    const result = await renderReadme(makeData({ stack: 'express', mailer: true }));
    expect(result).toContain('Mailpit');
    expect(result).toContain('localhost:1025');
    expect(result).toContain('http://localhost:8025');
  });

  it('does NOT show Mailpit section when mailer is disabled', async () => {
    const result = await renderReadme(makeData({ stack: 'express', mailer: false }));
    expect(result).not.toContain('Mailpit');
  });
});

// ────────────────────────────────────────────────────────
// Project structure
// ────────────────────────────────────────────────────────

describe('README — Project Structure', () => {
  it('includes project name in structure', async () => {
    const result = await renderReadme(makeData({ projectName: 'my-project' }));
    expect(result).toContain('my-project/');
  });

  it('includes eslint.config.js for JS stack with eslintPrettier', async () => {
    const result = await renderReadme(makeData({ stack: 'express', eslintPrettier: true }));
    expect(result).toContain('eslint.config.js');
    expect(result).toContain('.prettierrc');
  });

  it('does NOT include eslint.config.js when eslintPrettier is false', async () => {
    const result = await renderReadme(makeData({ stack: 'express', eslintPrettier: false }));
    expect(result).not.toContain('eslint.config.js');
  });

  it('includes agent.md', async () => {
    const result = await renderReadme(makeData());
    expect(result).toContain('agent.md');
  });

  it('includes Prisma directory for prisma ORM', async () => {
    const result = await renderReadme(makeData({ stack: 'nextjs', port: 3000, orm: 'prisma', databases: ['postgresql'] }));
    expect(result).toContain('prisma/');
  });
});

// ────────────────────────────────────────────────────────
// Tech Stack table
// ────────────────────────────────────────────────────────

describe('README — Tech Stack table', () => {
  it('shows correct version for Next.js', async () => {
    const result = await renderReadme(makeData({ stack: 'nextjs', port: 3000 }));
    expect(result).toContain('| Next.js | 15.1 |');
  });

  it('shows correct version for Express', async () => {
    const result = await renderReadme(makeData({ stack: 'express' }));
    expect(result).toContain('| Express.js | 5 |');
  });

  it('shows TypeScript version when typescript=true', async () => {
    const result = await renderReadme(makeData({ stack: 'express', typescript: true }));
    expect(result).toContain('| TypeScript | 5.7 |');
  });

  it('does NOT show TypeScript when typescript=false', async () => {
    const result = await renderReadme(makeData({ stack: 'express', typescript: false }));
    expect(result).not.toContain('TypeScript');
  });

  it('shows database versions in tech stack', async () => {
    const result = await renderReadme(makeData({ stack: 'express', databases: ['postgresql'] }));
    expect(result).toContain('| PostgreSQL | 17 |');
  });

  it('shows Prisma in tech stack when ORM is prisma', async () => {
    const result = await renderReadme(makeData({ stack: 'nextjs', port: 3000, orm: 'prisma', databases: ['postgresql'] }));
    expect(result).toContain('| Prisma | 6 |');
  });
});
