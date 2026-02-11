/**
 * test-local.ts — Script de test E2E pour letscraft
 *
 * Pour chaque stack, ce script :
 * 1. Génère un projet dans un dossier temporaire
 * 2. Vérifie que les fichiers clés existent
 * 3. Exécute `npm install` (JS stacks only)
 * 4. Lance `npm run dev` en arrière-plan (JS stacks only)
 * 5. Attend que le serveur réponde (HTTP health check)
 * 6. Kill le serveur + nettoie
 *
 * Usage : npx tsx scripts/test-local.ts
 * Usage : npx tsx scripts/test-local.ts --stack nextjs   (tester une seule stack)
 */

import path from 'path';
import fs from 'fs-extra';
import { execSync, spawn, ChildProcess } from 'child_process';
import { createProject } from '../src/generators/base';
import type { ProjectOptions, StackType, OrmType, ServiceType, ModuleType, AuthStrategy } from '../src/types';

const TEST_DIR = path.join(process.cwd(), '.test-output');
const TIMEOUT_INSTALL = 120_000; // 2 min pour npm install
const TIMEOUT_SERVER = 60_000;   // 1 min pour que le serveur démarre
const RETRY_INTERVAL = 2_000;    // 2s entre chaque tentative HTTP

interface TestConfig {
  name: string;
  stack: StackType;
  port: number;
  healthUrl: string;
  databases: ProjectOptions['databases'];
  orm: OrmType;
  services?: ServiceType[];
  modules?: ModuleType[];
  authStrategy?: AuthStrategy;
  requiredFiles: string[];
  skipDevServer?: boolean; // PHP stacks can't run dev server without Docker
}

const ALL_TESTS: TestConfig[] = [
  {
    name: 'Next.js',
    stack: 'nextjs',
    port: 3000,
    healthUrl: 'http://localhost:3000',
    databases: ['postgresql'],
    orm: 'none',
    requiredFiles: ['package.json', 'tsconfig.json', '.gitignore', '.env', 'README.md', 'agent.md', 'docker-compose.yml', 'Dockerfile', 'eslint.config.js', '.prettierrc'],
  },
  {
    name: 'Next.js + Prisma',
    stack: 'nextjs',
    port: 3000,
    healthUrl: 'http://localhost:3000',
    databases: ['postgresql'],
    orm: 'prisma',
    requiredFiles: ['package.json', 'tsconfig.json', '.gitignore', '.env', 'README.md', 'agent.md', 'docker-compose.yml', 'Dockerfile', 'prisma/schema.prisma', 'prisma/seed.ts', 'eslint.config.js', '.prettierrc'],
  },
  {
    name: 'Vite + React',
    stack: 'vite-react',
    port: 5173,
    healthUrl: 'http://localhost:5173',
    databases: [],
    orm: 'none',
    requiredFiles: ['package.json', 'tsconfig.json', '.gitignore', '.env', 'README.md', 'agent.md', 'eslint.config.js', '.prettierrc'],
  },
  {
    name: 'Nuxt',
    stack: 'nuxt',
    port: 3000,
    healthUrl: 'http://localhost:3000',
    databases: [],
    orm: 'none',
    requiredFiles: ['package.json', 'nuxt.config.ts', 'tsconfig.json', 'app.vue', '.gitignore', '.env', 'README.md', 'agent.md', 'eslint.config.js', '.prettierrc'],
  },
  {
    name: 'Vite + React + Express',
    stack: 'vite-react-express',
    port: 4000,
    healthUrl: 'http://localhost:4000/api/health',
    databases: [],
    orm: 'none',
    requiredFiles: ['package.json', 'client/package.json', 'server/package.json', '.gitignore', '.env', 'README.md', 'agent.md', 'eslint.config.js', '.prettierrc'],
  },
  {
    name: 'Express',
    stack: 'express',
    port: 4000,
    healthUrl: 'http://localhost:4000/api/health',
    databases: ['redis'],
    orm: 'none',
    requiredFiles: ['package.json', 'tsconfig.json', '.gitignore', '.env', 'README.md', 'agent.md', 'docker-compose.yml', 'Dockerfile', 'eslint.config.js', '.prettierrc'],
  },
  {
    name: 'Symfony',
    stack: 'symfony',
    port: 8000,
    healthUrl: 'http://localhost:8000',
    databases: ['postgresql'],
    orm: 'doctrine',
    requiredFiles: ['composer.json', 'Caddyfile', '.gitignore', '.env', 'README.md', 'agent.md', 'docker-compose.yml', 'Dockerfile', 'public/index.php', 'src/Kernel.php'],
    skipDevServer: true,
  },
  {
    name: 'Laravel',
    stack: 'laravel',
    port: 8000,
    healthUrl: 'http://localhost:8000',
    databases: ['mysql'],
    orm: 'eloquent',
    requiredFiles: ['composer.json', 'nginx.conf', '.gitignore', '.env', 'README.md', 'agent.md', 'docker-compose.yml', 'Dockerfile', 'public/index.php', 'routes/web.php'],
    skipDevServer: true,
  },
  {
    name: 'Express + Mailpit (no DB)',
    stack: 'express',
    port: 4000,
    healthUrl: 'http://localhost:4000/api/health',
    databases: [],
    orm: 'none',
    services: ['mailpit'],
    requiredFiles: ['package.json', 'tsconfig.json', '.gitignore', '.env', 'README.md', 'agent.md', 'docker-compose.yml', 'Dockerfile', 'eslint.config.js', '.prettierrc'],
  },
  {
    name: 'Laravel + Mailpit',
    stack: 'laravel',
    port: 8000,
    healthUrl: 'http://localhost:8000',
    databases: ['mysql'],
    orm: 'eloquent',
    services: ['mailpit'],
    requiredFiles: ['composer.json', 'nginx.conf', '.gitignore', '.env', 'README.md', 'agent.md', 'docker-compose.yml', 'Dockerfile', 'public/index.php', 'routes/web.php'],
    skipDevServer: true,
  },
  {
    name: 'Express + Modules (auth, crud, api-docs)',
    stack: 'express',
    port: 4000,
    healthUrl: 'http://localhost:4000/api/health',
    databases: ['postgresql'],
    orm: 'prisma',
    modules: ['auth', 'crud', 'api-docs'],
    authStrategy: 'jwt',
    requiredFiles: [
      'package.json', 'tsconfig.json', '.gitignore', '.env', 'README.md', 'agent.md',
      'docker-compose.yml', 'Dockerfile', 'prisma/schema.prisma',
      'src/routes/auth.ts', 'src/middleware/auth.ts', 'src/lib/auth.ts',
      'src/routes/items.ts', 'src/lib/swagger.ts',
    ],
  },
  {
    name: 'Next.js + Modules (auth, admin, dark-mode, i18n)',
    stack: 'nextjs',
    port: 3000,
    healthUrl: 'http://localhost:3000',
    databases: ['postgresql'],
    orm: 'prisma',
    modules: ['auth', 'admin', 'dark-mode', 'i18n'],
    authStrategy: 'jwt',
    requiredFiles: [
      'package.json', 'tsconfig.json', '.gitignore', '.env', 'README.md', 'agent.md',
      'docker-compose.yml', 'Dockerfile', 'prisma/schema.prisma',
      'src/app/login/page.tsx', 'src/app/register/page.tsx',
      'src/app/api/auth/login/route.ts', 'src/lib/auth.ts',
      'src/app/admin/layout.tsx', 'src/app/admin/page.tsx',
      'src/components/ThemeProvider.tsx', 'src/components/ThemeToggle.tsx',
      'src/lib/i18n.ts', 'src/locales/en.json', 'src/locales/fr.json',
    ],
  },
  {
    name: 'Symfony + Modules (auth, crud, email)',
    stack: 'symfony',
    port: 8000,
    healthUrl: 'http://localhost:8000',
    databases: ['postgresql'],
    orm: 'doctrine',
    modules: ['auth', 'crud', 'email'],
    authStrategy: 'jwt',
    services: ['mailpit'],
    requiredFiles: [
      'composer.json', 'Caddyfile', '.gitignore', '.env', 'README.md', 'agent.md',
      'docker-compose.yml', 'Dockerfile',
      'src/Controller/AuthController.php', 'src/Security/JwtAuthenticator.php',
      'config/packages/security.yaml',
      'src/Controller/ItemController.php', 'src/Entity/Item.php',
      'src/Service/MailerService.php', 'templates/emails/welcome.html.twig',
    ],
    skipDevServer: true,
  },
];

// ────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────

function log(emoji: string, msg: string) {
  console.log(`${emoji}  ${msg}`);
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url: string, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return true;
    } catch {
      // Server not ready yet
    }
    await sleep(RETRY_INTERVAL);
  }
  return false;
}

function killProcess(proc: ChildProcess) {
  try {
    // On Windows, we need to kill the process tree
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
    } else {
      proc.kill('SIGTERM');
    }
  } catch {
    // Process may already be dead
  }
}

// ────────────────────────────────────────────────────────
// Test runner
// ────────────────────────────────────────────────────────

async function testStack(config: TestConfig): Promise<{ name: string; success: boolean; error?: string }> {
  const services = config.services ?? [];
  const mods = config.modules ?? [];
  const projectName = `test-${config.stack}${config.orm !== 'none' ? `-${config.orm}` : ''}${services.length > 0 ? `-${services.join('-')}` : ''}${mods.length > 0 ? `-mods` : ''}`;
  const projectDir = path.join(TEST_DIR, projectName);
  let devServer: ChildProcess | null = null;

  try {
    // 1. Generate project
    log('📦', `[${config.name}] Generating project...`);
    const modules = config.modules ?? [];
    const options: ProjectOptions = {
      projectName,
      stack: config.stack,
      typescript: true,
      databases: config.databases,
      eslintPrettier: true,
      docker: true,
      orm: config.orm,
      services,
      modules,
      authStrategy: config.authStrategy,
    };

    const originalCwd = process.cwd();
    process.chdir(TEST_DIR);
    await createProject(options);
    process.chdir(originalCwd);

    // 2. Verify key files
    log('🔍', `[${config.name}] Verifying files...`);
    for (const file of config.requiredFiles) {
      if (!(await fs.pathExists(path.join(projectDir, file)))) {
        return { name: config.name, success: false, error: `Missing file: ${file}` };
      }
    }

    // 2b. Verify services content in generated files
    if (services.includes('mailpit')) {
      log('🔍', `[${config.name}] Verifying mailer configuration...`);

      const composeContent = await fs.readFile(path.join(projectDir, 'docker-compose.yml'), 'utf-8');
      if (!composeContent.includes('mailpit')) {
        return { name: config.name, success: false, error: 'docker-compose.yml missing mailpit service' };
      }
      if (!composeContent.includes('8025:8025')) {
        return { name: config.name, success: false, error: 'docker-compose.yml missing mailpit web UI port 8025' };
      }
      if (!composeContent.includes('1025:1025')) {
        return { name: config.name, success: false, error: 'docker-compose.yml missing mailpit SMTP port 1025' };
      }

      const envContent = await fs.readFile(path.join(projectDir, '.env'), 'utf-8');
      if (!envContent.includes('MAIL_HOST=')) {
        return { name: config.name, success: false, error: '.env missing MAIL_HOST variable' };
      }
      if (!envContent.includes('MAIL_PORT=1025')) {
        return { name: config.name, success: false, error: '.env missing MAIL_PORT=1025 variable' };
      }
      if (!envContent.includes('MAILPIT_URL=')) {
        return { name: config.name, success: false, error: '.env missing MAILPIT_URL variable' };
      }

      log('✅', `[${config.name}] Mailer configuration verified`);
    }

    // PHP stacks: skip dev server test (needs Docker)
    if (config.skipDevServer) {
      log('✅', `[${config.name}] Project generated and files verified (Docker needed for dev server)`);
      return { name: config.name, success: true };
    }

    // 3. npm install
    log('📥', `[${config.name}] Running npm install...`);
    execSync('npm install', {
      cwd: projectDir,
      stdio: 'pipe',
      timeout: TIMEOUT_INSTALL,
    });

    // 4. Start dev server
    log('🚀', `[${config.name}] Starting dev server on port ${config.port}...`);
    devServer = spawn('npm', ['run', 'dev'], {
      cwd: projectDir,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, PORT: String(config.port) },
    });

    // Capture stderr for debugging
    let serverStderr = '';
    devServer.stderr?.on('data', (data) => {
      serverStderr += data.toString();
    });

    // 5. Wait for server
    log('⏳', `[${config.name}] Waiting for server at ${config.healthUrl}...`);
    const serverReady = await waitForServer(config.healthUrl, TIMEOUT_SERVER);

    if (!serverReady) {
      const errorDetail = serverStderr ? `\n    stderr: ${serverStderr.slice(0, 500)}` : '';
      return { name: config.name, success: false, error: `Server did not respond within ${TIMEOUT_SERVER / 1000}s${errorDetail}` };
    }

    // 6. Verify response
    const res = await fetch(config.healthUrl);
    log('✅', `[${config.name}] Server responded with status ${res.status}`);

    return { name: config.name, success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { name: config.name, success: false, error: msg.slice(0, 300) };
  } finally {
    // Cleanup: kill dev server
    if (devServer) {
      killProcess(devServer);
    }
  }
}

async function main() {
  // Parse --stack argument
  const stackArg = process.argv.find((a) => a.startsWith('--stack='))?.split('=')[1]
    || (process.argv.indexOf('--stack') !== -1 ? process.argv[process.argv.indexOf('--stack') + 1] : null);

  const testsToRun = stackArg
    ? ALL_TESTS.filter((t) => t.stack === stackArg)
    : ALL_TESTS;

  if (testsToRun.length === 0) {
    console.error(`Unknown stack: ${stackArg}. Available: nextjs, vite-react, nuxt, vite-react-express, express, symfony, laravel`);
    process.exit(1);
  }

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║     letscraft — Local E2E Test Suite     ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // Clean + create test dir
  await fs.remove(TEST_DIR);
  await fs.ensureDir(TEST_DIR);

  const results: Array<{ name: string; success: boolean; error?: string }> = [];

  // Run tests sequentially (they share ports)
  for (const config of testsToRun) {
    console.log(`\n${'─'.repeat(50)}`);
    const result = await testStack(config);
    results.push(result);
    console.log('');
  }

  // Summary
  console.log(`\n${'═'.repeat(50)}`);
  console.log('SUMMARY\n');
  for (const r of results) {
    if (r.success) {
      console.log(`  ✅ ${r.name}`);
    } else {
      console.log(`  ❌ ${r.name} — ${r.error}`);
    }
  }
  console.log(`\n${'═'.repeat(50)}`);

  const allPassed = results.every((r) => r.success);
  console.log(allPassed ? '\n🎉 All tests passed!\n' : '\n⚠️  Some tests failed.\n');

  // Cleanup
  await fs.remove(TEST_DIR);

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
