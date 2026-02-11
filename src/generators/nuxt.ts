import path from 'path';
import fs from 'fs-extra';
import type { StackGenerator } from './base';
import type { GeneratorContext } from '../types';
import { renderTemplateToFile } from '../utils/template';

export class NuxtGenerator implements StackGenerator {
  getPort(): number {
    return 3000;
  }

  async generate(ctx: GeneratorContext): Promise<void> {
    const { outputDir, options, versions } = ctx;
    const data = { ...options, versions, port: this.getPort() };

    await Promise.all([
      fs.ensureDir(path.join(outputDir, 'pages')),
      fs.ensureDir(path.join(outputDir, 'server', 'api')),
      fs.ensureDir(path.join(outputDir, 'server', 'utils')),
      fs.ensureDir(path.join(outputDir, 'composables')),
      fs.ensureDir(path.join(outputDir, 'components')),
      fs.ensureDir(path.join(outputDir, 'assets', 'css')),
      fs.ensureDir(path.join(outputDir, 'public')),
      fs.ensureDir(path.join(outputDir, 'plugins')),
    ]);

    const tasks: Promise<void>[] = [
      renderTemplateToFile('nuxt/package.json.ejs', path.join(outputDir, 'package.json'), data),
      renderTemplateToFile('nuxt/nuxt.config.ts.ejs', path.join(outputDir, 'nuxt.config.ts'), data),
      renderTemplateToFile('nuxt/tsconfig.json.ejs', path.join(outputDir, 'tsconfig.json'), data),
      renderTemplateToFile('nuxt/app.vue.ejs', path.join(outputDir, 'app.vue'), data),
      renderTemplateToFile('nuxt/pages/index.vue.ejs', path.join(outputDir, 'pages', 'index.vue'), data),
      renderTemplateToFile('nuxt/server/tsconfig.json.ejs', path.join(outputDir, 'server', 'tsconfig.json'), data),
      renderTemplateToFile('nuxt/assets/css/main.css.ejs', path.join(outputDir, 'assets', 'css', 'main.css'), data),
    ];

    if (options.databases.length > 0) {
      tasks.push(
        renderTemplateToFile('nuxt/server/utils/db.ts.ejs', path.join(outputDir, 'server', 'utils', 'db.ts'), data)
      );
    }

    await Promise.all(tasks);
  }
}
