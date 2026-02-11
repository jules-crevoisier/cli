import path from 'path';
import fs from 'fs-extra';
import type { GeneratorContext, ModuleType, StackType } from '../types';
import { renderTemplateToFile } from '../utils/template';

interface ModuleTemplateEntry {
  /** Template path relative to src/templates/ */
  template: string;
  /** Output path relative to project root */
  output: string;
  /** Subdirectories to ensure exist before rendering */
  dirs?: string[];
}

type ModuleTemplateMap = {
  [module in ModuleType]?: {
    [stack in StackType]?: ModuleTemplateEntry[];
  } & {
    /** Templates shared across all stacks */
    shared?: ModuleTemplateEntry[];
  };
};

function getModuleTemplates(): ModuleTemplateMap {
  return {
    auth: {
      express: [
        { template: 'modules/auth/express/src/routes/auth.ts.ejs', output: 'src/routes/auth.ts' },
        { template: 'modules/auth/express/src/middleware/auth.ts.ejs', output: 'src/middleware/auth.ts' },
        { template: 'modules/auth/express/src/lib/auth.ts.ejs', output: 'src/lib/auth.ts' },
      ],
      nextjs: [
        { template: 'modules/auth/nextjs/src/app/login/page.tsx.ejs', output: 'src/app/login/page.tsx', dirs: ['src/app/login'] },
        { template: 'modules/auth/nextjs/src/app/register/page.tsx.ejs', output: 'src/app/register/page.tsx', dirs: ['src/app/register'] },
        { template: 'modules/auth/nextjs/src/app/api/auth/login/route.ts.ejs', output: 'src/app/api/auth/login/route.ts', dirs: ['src/app/api/auth/login'] },
        { template: 'modules/auth/nextjs/src/app/api/auth/register/route.ts.ejs', output: 'src/app/api/auth/register/route.ts', dirs: ['src/app/api/auth/register'] },
        { template: 'modules/auth/nextjs/src/app/api/auth/me/route.ts.ejs', output: 'src/app/api/auth/me/route.ts', dirs: ['src/app/api/auth/me'] },
        { template: 'modules/auth/nextjs/src/lib/auth.ts.ejs', output: 'src/lib/auth.ts' },
      ],
      'vite-react': [
        { template: 'modules/auth/vite-react/src/pages/Login.tsx.ejs', output: 'src/pages/Login.tsx', dirs: ['src/pages'] },
        { template: 'modules/auth/vite-react/src/pages/Register.tsx.ejs', output: 'src/pages/Register.tsx' },
        { template: 'modules/auth/vite-react/src/hooks/useAuth.ts.ejs', output: 'src/hooks/useAuth.ts', dirs: ['src/hooks'] },
        { template: 'modules/auth/vite-react/src/lib/auth.ts.ejs', output: 'src/lib/auth.ts' },
      ],
      nuxt: [
        { template: 'modules/auth/nuxt/pages/login.vue.ejs', output: 'pages/login.vue', dirs: ['pages'] },
        { template: 'modules/auth/nuxt/pages/register.vue.ejs', output: 'pages/register.vue' },
        { template: 'modules/auth/nuxt/server/api/auth/login.post.ts.ejs', output: 'server/api/auth/login.post.ts', dirs: ['server/api/auth'] },
        { template: 'modules/auth/nuxt/server/api/auth/register.post.ts.ejs', output: 'server/api/auth/register.post.ts' },
        { template: 'modules/auth/nuxt/server/api/auth/me.get.ts.ejs', output: 'server/api/auth/me.get.ts' },
        { template: 'modules/auth/nuxt/composables/useAuth.ts.ejs', output: 'composables/useAuth.ts', dirs: ['composables'] },
        { template: 'modules/auth/nuxt/server/utils/auth.ts.ejs', output: 'server/utils/auth.ts', dirs: ['server/utils'] },
      ],
      symfony: [
        { template: 'modules/auth/symfony/src/Controller/AuthController.php.ejs', output: 'src/Controller/AuthController.php' },
        { template: 'modules/auth/symfony/src/Security/JwtAuthenticator.php.ejs', output: 'src/Security/JwtAuthenticator.php', dirs: ['src/Security'] },
        { template: 'modules/auth/symfony/config/packages/security.yaml.ejs', output: 'config/packages/security.yaml' },
      ],
      laravel: [
        { template: 'modules/auth/laravel/app/Http/Controllers/AuthController.php.ejs', output: 'app/Http/Controllers/AuthController.php', dirs: ['app/Http/Controllers'] },
        { template: 'modules/auth/laravel/app/Http/Middleware/Authenticate.php.ejs', output: 'app/Http/Middleware/Authenticate.php', dirs: ['app/Http/Middleware'] },
        { template: 'modules/auth/laravel/routes/auth.php.ejs', output: 'routes/auth.php' },
      ],
    },
    crud: {
      express: [
        { template: 'modules/crud/express/src/routes/items.ts.ejs', output: 'src/routes/items.ts' },
      ],
      nextjs: [
        { template: 'modules/crud/nextjs/src/app/api/items/route.ts.ejs', output: 'src/app/api/items/route.ts', dirs: ['src/app/api/items'] },
        { template: 'modules/crud/nextjs/src/app/api/items/[id]/route.ts.ejs', output: 'src/app/api/items/[id]/route.ts', dirs: ['src/app/api/items/[id]'] },
        { template: 'modules/crud/nextjs/src/app/items/page.tsx.ejs', output: 'src/app/items/page.tsx', dirs: ['src/app/items'] },
      ],
      nuxt: [
        { template: 'modules/crud/nuxt/server/api/items/index.get.ts.ejs', output: 'server/api/items/index.get.ts', dirs: ['server/api/items'] },
        { template: 'modules/crud/nuxt/server/api/items/index.post.ts.ejs', output: 'server/api/items/index.post.ts' },
        { template: 'modules/crud/nuxt/server/api/items/[id].get.ts.ejs', output: 'server/api/items/[id].get.ts' },
        { template: 'modules/crud/nuxt/server/api/items/[id].put.ts.ejs', output: 'server/api/items/[id].put.ts' },
        { template: 'modules/crud/nuxt/server/api/items/[id].delete.ts.ejs', output: 'server/api/items/[id].delete.ts' },
        { template: 'modules/crud/nuxt/pages/items/index.vue.ejs', output: 'pages/items/index.vue', dirs: ['pages/items'] },
      ],
      symfony: [
        { template: 'modules/crud/symfony/src/Controller/ItemController.php.ejs', output: 'src/Controller/ItemController.php' },
        { template: 'modules/crud/symfony/src/Entity/Item.php.ejs', output: 'src/Entity/Item.php' },
      ],
      laravel: [
        { template: 'modules/crud/laravel/app/Http/Controllers/ItemController.php.ejs', output: 'app/Http/Controllers/ItemController.php' },
        { template: 'modules/crud/laravel/app/Models/Item.php.ejs', output: 'app/Models/Item.php' },
        { template: 'modules/crud/laravel/database/migrations/create_items_table.php.ejs', output: 'database/migrations/2024_01_01_000001_create_items_table.php' },
        { template: 'modules/crud/laravel/routes/items.php.ejs', output: 'routes/items.php' },
      ],
    },
    admin: {
      nextjs: [
        { template: 'modules/admin/nextjs/src/app/admin/layout.tsx.ejs', output: 'src/app/admin/layout.tsx', dirs: ['src/app/admin'] },
        { template: 'modules/admin/nextjs/src/app/admin/page.tsx.ejs', output: 'src/app/admin/page.tsx' },
        { template: 'modules/admin/nextjs/src/app/admin/users/page.tsx.ejs', output: 'src/app/admin/users/page.tsx', dirs: ['src/app/admin/users'] },
        { template: 'modules/admin/nextjs/src/components/admin/Sidebar.tsx.ejs', output: 'src/components/admin/Sidebar.tsx', dirs: ['src/components/admin'] },
      ],
      'vite-react': [
        { template: 'modules/admin/vite-react/src/pages/admin/Dashboard.tsx.ejs', output: 'src/pages/admin/Dashboard.tsx', dirs: ['src/pages/admin'] },
        { template: 'modules/admin/vite-react/src/pages/admin/Users.tsx.ejs', output: 'src/pages/admin/Users.tsx' },
        { template: 'modules/admin/vite-react/src/components/admin/Sidebar.tsx.ejs', output: 'src/components/admin/Sidebar.tsx', dirs: ['src/components/admin'] },
      ],
      nuxt: [
        { template: 'modules/admin/nuxt/pages/admin/index.vue.ejs', output: 'pages/admin/index.vue', dirs: ['pages/admin'] },
        { template: 'modules/admin/nuxt/pages/admin/users.vue.ejs', output: 'pages/admin/users.vue' },
        { template: 'modules/admin/nuxt/components/admin/Sidebar.vue.ejs', output: 'components/admin/Sidebar.vue', dirs: ['components/admin'] },
      ],
      symfony: [
        { template: 'modules/admin/symfony/src/Controller/AdminController.php.ejs', output: 'src/Controller/AdminController.php' },
      ],
      laravel: [
        { template: 'modules/admin/laravel/app/Http/Controllers/AdminController.php.ejs', output: 'app/Http/Controllers/AdminController.php' },
        { template: 'modules/admin/laravel/routes/admin.php.ejs', output: 'routes/admin.php' },
      ],
    },
    'file-upload': {
      express: [
        { template: 'modules/file-upload/express/src/lib/storage.ts.ejs', output: 'src/lib/storage.ts' },
        { template: 'modules/file-upload/express/src/routes/upload.ts.ejs', output: 'src/routes/upload.ts' },
      ],
      nextjs: [
        { template: 'modules/file-upload/nextjs/src/lib/storage.ts.ejs', output: 'src/lib/storage.ts' },
        { template: 'modules/file-upload/nextjs/src/app/api/upload/route.ts.ejs', output: 'src/app/api/upload/route.ts', dirs: ['src/app/api/upload'] },
      ],
      nuxt: [
        { template: 'modules/file-upload/nuxt/server/api/upload.post.ts.ejs', output: 'server/api/upload.post.ts' },
        { template: 'modules/file-upload/nuxt/server/utils/storage.ts.ejs', output: 'server/utils/storage.ts', dirs: ['server/utils'] },
      ],
      symfony: [
        { template: 'modules/file-upload/symfony/src/Service/StorageService.php.ejs', output: 'src/Service/StorageService.php', dirs: ['src/Service'] },
        { template: 'modules/file-upload/symfony/src/Controller/UploadController.php.ejs', output: 'src/Controller/UploadController.php' },
      ],
      laravel: [
        { template: 'modules/file-upload/laravel/app/Http/Controllers/UploadController.php.ejs', output: 'app/Http/Controllers/UploadController.php' },
        { template: 'modules/file-upload/laravel/routes/upload.php.ejs', output: 'routes/upload.php' },
      ],
    },
    email: {
      express: [
        { template: 'modules/email/express/src/lib/mailer.ts.ejs', output: 'src/lib/mailer.ts' },
        { template: 'modules/email/express/src/templates/welcome.html.ejs', output: 'src/templates/welcome.html', dirs: ['src/templates'] },
      ],
      nextjs: [
        { template: 'modules/email/nextjs/src/lib/mailer.ts.ejs', output: 'src/lib/mailer.ts' },
        { template: 'modules/email/nextjs/src/templates/welcome.html.ejs', output: 'src/templates/welcome.html', dirs: ['src/templates'] },
      ],
      nuxt: [
        { template: 'modules/email/nuxt/server/utils/mailer.ts.ejs', output: 'server/utils/mailer.ts', dirs: ['server/utils'] },
        { template: 'modules/email/nuxt/server/templates/welcome.html.ejs', output: 'server/templates/welcome.html', dirs: ['server/templates'] },
      ],
      symfony: [
        { template: 'modules/email/symfony/src/Service/MailerService.php.ejs', output: 'src/Service/MailerService.php', dirs: ['src/Service'] },
        { template: 'modules/email/symfony/templates/emails/welcome.html.twig.ejs', output: 'templates/emails/welcome.html.twig', dirs: ['templates/emails'] },
      ],
      laravel: [
        { template: 'modules/email/laravel/app/Mail/WelcomeMail.php.ejs', output: 'app/Mail/WelcomeMail.php', dirs: ['app/Mail'] },
        { template: 'modules/email/laravel/resources/views/emails/welcome.blade.php.ejs', output: 'resources/views/emails/welcome.blade.php', dirs: ['resources/views/emails'] },
      ],
    },
    'api-docs': {
      express: [
        { template: 'modules/api-docs/express/src/lib/swagger.ts.ejs', output: 'src/lib/swagger.ts' },
      ],
      nextjs: [
        { template: 'modules/api-docs/nextjs/src/app/api-docs/page.tsx.ejs', output: 'src/app/api-docs/page.tsx', dirs: ['src/app/api-docs'] },
        { template: 'modules/api-docs/nextjs/src/lib/swagger.ts.ejs', output: 'src/lib/swagger.ts' },
      ],
      nuxt: [
        { template: 'modules/api-docs/nuxt/server/api/docs.get.ts.ejs', output: 'server/api/docs.get.ts' },
        { template: 'modules/api-docs/nuxt/server/utils/swagger.ts.ejs', output: 'server/utils/swagger.ts', dirs: ['server/utils'] },
      ],
      symfony: [
        { template: 'modules/api-docs/symfony/config/packages/nelmio_api_doc.yaml.ejs', output: 'config/packages/nelmio_api_doc.yaml' },
      ],
      laravel: [
        { template: 'modules/api-docs/laravel/config/l5-swagger.php.ejs', output: 'config/l5-swagger.php' },
      ],
    },
    i18n: {
      nextjs: [
        { template: 'modules/i18n/nextjs/src/lib/i18n.ts.ejs', output: 'src/lib/i18n.ts' },
        { template: 'modules/i18n/nextjs/src/locales/en.json.ejs', output: 'src/locales/en.json', dirs: ['src/locales'] },
        { template: 'modules/i18n/nextjs/src/locales/fr.json.ejs', output: 'src/locales/fr.json' },
      ],
      'vite-react': [
        { template: 'modules/i18n/vite-react/src/lib/i18n.ts.ejs', output: 'src/lib/i18n.ts' },
        { template: 'modules/i18n/vite-react/src/locales/en.json.ejs', output: 'src/locales/en.json', dirs: ['src/locales'] },
        { template: 'modules/i18n/vite-react/src/locales/fr.json.ejs', output: 'src/locales/fr.json' },
      ],
      nuxt: [
        { template: 'modules/i18n/nuxt/plugins/i18n.ts.ejs', output: 'plugins/i18n.ts', dirs: ['plugins'] },
        { template: 'modules/i18n/nuxt/locales/en.json.ejs', output: 'locales/en.json', dirs: ['locales'] },
        { template: 'modules/i18n/nuxt/locales/fr.json.ejs', output: 'locales/fr.json' },
      ],
      express: [
        { template: 'modules/i18n/express/src/lib/i18n.ts.ejs', output: 'src/lib/i18n.ts' },
        { template: 'modules/i18n/express/src/locales/en.json.ejs', output: 'src/locales/en.json', dirs: ['src/locales'] },
        { template: 'modules/i18n/express/src/locales/fr.json.ejs', output: 'src/locales/fr.json' },
      ],
      symfony: [
        { template: 'modules/i18n/symfony/translations/messages.en.yaml.ejs', output: 'translations/messages.en.yaml', dirs: ['translations'] },
        { template: 'modules/i18n/symfony/translations/messages.fr.yaml.ejs', output: 'translations/messages.fr.yaml' },
      ],
      laravel: [
        { template: 'modules/i18n/laravel/lang/en.json.ejs', output: 'lang/en.json', dirs: ['lang'] },
        { template: 'modules/i18n/laravel/lang/fr.json.ejs', output: 'lang/fr.json' },
      ],
    },
    'dark-mode': {
      nextjs: [
        { template: 'modules/dark-mode/nextjs/src/components/ThemeProvider.tsx.ejs', output: 'src/components/ThemeProvider.tsx', dirs: ['src/components'] },
        { template: 'modules/dark-mode/nextjs/src/components/ThemeToggle.tsx.ejs', output: 'src/components/ThemeToggle.tsx' },
      ],
      'vite-react': [
        { template: 'modules/dark-mode/vite-react/src/components/ThemeProvider.tsx.ejs', output: 'src/components/ThemeProvider.tsx', dirs: ['src/components'] },
        { template: 'modules/dark-mode/vite-react/src/components/ThemeToggle.tsx.ejs', output: 'src/components/ThemeToggle.tsx' },
      ],
      nuxt: [
        { template: 'modules/dark-mode/nuxt/composables/useTheme.ts.ejs', output: 'composables/useTheme.ts', dirs: ['composables'] },
        { template: 'modules/dark-mode/nuxt/components/ThemeToggle.vue.ejs', output: 'components/ThemeToggle.vue', dirs: ['components'] },
      ],
    },
    'ci-cd': {
      shared: [
        { template: 'modules/ci-cd/shared/.github/workflows/ci.yml.ejs', output: '.github/workflows/ci.yml', dirs: ['.github/workflows'] },
      ],
    },
  };
}

export async function generateModuleFiles(
  ctx: GeneratorContext,
  templateData: Record<string, unknown>
): Promise<void> {
  const { options, outputDir } = ctx;
  const templateMap = getModuleTemplates();

  for (const mod of options.modules) {
    const moduleTemplates = templateMap[mod];
    if (!moduleTemplates) continue;

    let entries: ModuleTemplateEntry[] = [];

    if (options.stack === 'vite-react-express') {
      // Composite stack: merge vite-react (→ client/) and express (→ server/) entries
      const viteReactEntries = (moduleTemplates['vite-react'] as ModuleTemplateEntry[] | undefined) || [];
      const expressEntries = (moduleTemplates['express'] as ModuleTemplateEntry[] | undefined) || [];
      const sharedTemplates = (moduleTemplates.shared as ModuleTemplateEntry[] | undefined) || [];

      entries = [
        ...viteReactEntries.map((e) => ({
          ...e,
          output: `client/${e.output}`,
          dirs: e.dirs?.map((d) => `client/${d}`),
        })),
        ...expressEntries.map((e) => ({
          ...e,
          output: `server/${e.output}`,
          dirs: e.dirs?.map((d) => `server/${d}`),
        })),
        ...sharedTemplates,
      ];
    } else {
      // Standard stack: get stack-specific + shared templates
      const stackTemplates = moduleTemplates[options.stack as keyof typeof moduleTemplates] as ModuleTemplateEntry[] | undefined;
      const sharedTemplates = moduleTemplates.shared as ModuleTemplateEntry[] | undefined;

      entries = [
        ...(stackTemplates || []),
        ...(sharedTemplates || []),
      ];
    }

    if (entries.length === 0) continue;

    // Ensure all required directories
    const dirsToCreate = new Set<string>();
    for (const entry of entries) {
      if (entry.dirs) {
        for (const dir of entry.dirs) {
          dirsToCreate.add(path.join(outputDir, dir));
        }
      }
      // Always ensure parent dir of output file
      dirsToCreate.add(path.dirname(path.join(outputDir, entry.output)));
    }
    await Promise.all(Array.from(dirsToCreate).map((dir) => fs.ensureDir(dir)));

    // Render all templates for this module
    await Promise.all(
      entries.map((entry) =>
        renderTemplateToFile(entry.template, path.join(outputDir, entry.output), templateData)
      )
    );
  }
}
