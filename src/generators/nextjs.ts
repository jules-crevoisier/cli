import path from 'path';
import fs from 'fs-extra';
import type { StackGenerator } from './base';
import type { GeneratorContext } from '../types';
import { renderTemplateToFile } from '../utils/template';

export class NextjsGenerator implements StackGenerator {
  getPort(): number {
    return 3000;
  }

  async generate(ctx: GeneratorContext): Promise<void> {
    const { outputDir, options, versions } = ctx;
    const data = { ...options, versions, port: this.getPort() };

    await Promise.all([
      fs.ensureDir(path.join(outputDir, 'src', 'app')),
      fs.ensureDir(path.join(outputDir, 'src', 'lib')),
      fs.ensureDir(path.join(outputDir, 'public')),
    ]);

    const tasks: Promise<void>[] = [
      renderTemplateToFile('nextjs/package.json.ejs', path.join(outputDir, 'package.json'), data),
      renderTemplateToFile('nextjs/tsconfig.json.ejs', path.join(outputDir, 'tsconfig.json'), data),
      renderTemplateToFile('nextjs/next.config.js.ejs', path.join(outputDir, 'next.config.js'), data),
      renderTemplateToFile('nextjs/postcss.config.js.ejs', path.join(outputDir, 'postcss.config.js'), data),
      renderTemplateToFile('nextjs/src/app/layout.tsx.ejs', path.join(outputDir, 'src', 'app', 'layout.tsx'), data),
      renderTemplateToFile('nextjs/src/app/page.tsx.ejs', path.join(outputDir, 'src', 'app', 'page.tsx'), data),
      renderTemplateToFile('nextjs/src/app/globals.css.ejs', path.join(outputDir, 'src', 'app', 'globals.css'), data),
    ];

    if (options.databases.length > 0) {
      tasks.push(
        renderTemplateToFile('nextjs/src/lib/db.ts.ejs', path.join(outputDir, 'src', 'lib', 'db.ts'), data)
      );
    }

    await Promise.all(tasks);
  }
}
