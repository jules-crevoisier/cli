import path from 'path';
import fs from 'fs-extra';
import type { StackGenerator } from './base';
import type { GeneratorContext } from '../types';
import { renderTemplateToFile } from '../utils/template';

export class ViteReactGenerator implements StackGenerator {
  getPort(): number {
    return 5173;
  }

  async generate(ctx: GeneratorContext): Promise<void> {
    const { outputDir, options, versions } = ctx;
    const data = { ...options, versions, port: this.getPort() };

    await Promise.all([
      fs.ensureDir(path.join(outputDir, 'src', 'lib')),
      fs.ensureDir(path.join(outputDir, 'public')),
    ]);

    // Note: No db.ts generated here — Vite+React is a client-side SPA,
    // database connections must be handled by a separate backend.
    await Promise.all([
      renderTemplateToFile('vite-react/package.json.ejs', path.join(outputDir, 'package.json'), data),
      renderTemplateToFile('vite-react/vite.config.ts.ejs', path.join(outputDir, 'vite.config.ts'), data),
      renderTemplateToFile('vite-react/tsconfig.json.ejs', path.join(outputDir, 'tsconfig.json'), data),
      renderTemplateToFile('vite-react/index.html.ejs', path.join(outputDir, 'index.html'), data),
      renderTemplateToFile('vite-react/src/main.tsx.ejs', path.join(outputDir, 'src', 'main.tsx'), data),
      renderTemplateToFile('vite-react/src/App.tsx.ejs', path.join(outputDir, 'src', 'App.tsx'), data),
      renderTemplateToFile('vite-react/src/index.css.ejs', path.join(outputDir, 'src', 'index.css'), data),
    ]);
  }
}
