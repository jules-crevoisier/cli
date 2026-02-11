import path from 'path';
import fs from 'fs-extra';
import type { StackGenerator } from './base';
import type { GeneratorContext } from '../types';
import { renderTemplateToFile } from '../utils/template';

export class ExpressGenerator implements StackGenerator {
  getPort(): number {
    return 4000;
  }

  async generate(ctx: GeneratorContext): Promise<void> {
    const { outputDir, options, versions } = ctx;
    const data = { ...options, versions, port: this.getPort() };

    await Promise.all([
      fs.ensureDir(path.join(outputDir, 'src', 'routes')),
      fs.ensureDir(path.join(outputDir, 'src', 'middleware')),
      fs.ensureDir(path.join(outputDir, 'src', 'lib')),
      fs.ensureDir(path.join(outputDir, 'tests')),
    ]);

    const tasks: Promise<void>[] = [
      renderTemplateToFile('express/package.json.ejs', path.join(outputDir, 'package.json'), data),
      renderTemplateToFile('express/tsconfig.json.ejs', path.join(outputDir, 'tsconfig.json'), data),
      renderTemplateToFile('express/src/index.ts.ejs', path.join(outputDir, 'src', 'index.ts'), data),
      renderTemplateToFile('express/src/routes/index.ts.ejs', path.join(outputDir, 'src', 'routes', 'index.ts'), data),
      renderTemplateToFile('express/src/routes/health.ts.ejs', path.join(outputDir, 'src', 'routes', 'health.ts'), data),
      renderTemplateToFile('express/src/middleware/errorHandler.ts.ejs', path.join(outputDir, 'src', 'middleware', 'errorHandler.ts'), data),
      renderTemplateToFile('express/tests/health.test.ts.ejs', path.join(outputDir, 'tests', 'health.test.ts'), data),
    ];

    if (options.databases.length > 0) {
      tasks.push(
        renderTemplateToFile('express/src/lib/db.ts.ejs', path.join(outputDir, 'src', 'lib', 'db.ts'), data)
      );
    }

    await Promise.all(tasks);
  }
}
