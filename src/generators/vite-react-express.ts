import path from 'path';
import fs from 'fs-extra';
import type { StackGenerator } from './base';
import type { GeneratorContext } from '../types';
import { renderTemplateToFile } from '../utils/template';
import { ViteReactGenerator } from './vite-react';
import { ExpressGenerator } from './express';

export class ViteReactExpressGenerator implements StackGenerator {
  getPort(): number {
    return 4000;
  }

  async generate(ctx: GeneratorContext): Promise<void> {
    const { outputDir, options, versions } = ctx;
    const data = { ...options, versions, port: this.getPort() };

    // 1. Generate client/ (Vite + React) with stack override
    const clientDir = path.join(outputDir, 'client');
    const clientCtx: GeneratorContext = {
      ...ctx,
      outputDir: clientDir,
      options: { ...options, stack: 'vite-react' },
    };
    const viteReactGen = new ViteReactGenerator();
    await viteReactGen.generate(clientCtx);

    // Overwrite client/vite.config.ts with proxy-enabled version
    await renderTemplateToFile(
      'vite-react-express/client-vite.config.ts.ejs',
      path.join(clientDir, 'vite.config.ts'),
      data
    );

    // 2. Generate server/ (Express) with stack override
    const serverDir = path.join(outputDir, 'server');
    const serverCtx: GeneratorContext = {
      ...ctx,
      outputDir: serverDir,
      options: { ...options, stack: 'express' },
    };
    const expressGen = new ExpressGenerator();
    await expressGen.generate(serverCtx);

    // 3. Generate root files
    await renderTemplateToFile(
      'vite-react-express/package.json.ejs',
      path.join(outputDir, 'package.json'),
      data
    );
  }
}
