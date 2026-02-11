import path from 'path';
import fs from 'fs-extra';
import type { StackGenerator } from './base';
import type { GeneratorContext } from '../types';
import { renderTemplateToFile } from '../utils/template';

export class SymfonyGenerator implements StackGenerator {
  getPort(): number {
    return 8000;
  }

  async generate(ctx: GeneratorContext): Promise<void> {
    const { options, versions, outputDir } = ctx;
    const data = { ...options, versions, orm: 'doctrine' as const };

    // Create directories
    await Promise.all([
      fs.ensureDir(path.join(outputDir, 'config', 'packages')),
      fs.ensureDir(path.join(outputDir, 'public')),
      fs.ensureDir(path.join(outputDir, 'src', 'Controller')),
      fs.ensureDir(path.join(outputDir, 'src', 'Entity')),
      fs.ensureDir(path.join(outputDir, 'var')),
    ]);

    // Render templates
    const tasks: Promise<void>[] = [
      renderTemplateToFile('symfony/Dockerfile.ejs', path.join(outputDir, 'Dockerfile.dev'), data),
      renderTemplateToFile('symfony/Caddyfile.ejs', path.join(outputDir, 'Caddyfile'), data),
      renderTemplateToFile('symfony/composer.json.ejs', path.join(outputDir, 'composer.json'), data),
      renderTemplateToFile('symfony/config/packages/doctrine.yaml.ejs', path.join(outputDir, 'config', 'packages', 'doctrine.yaml'), data),
      renderTemplateToFile('symfony/config/packages/framework.yaml.ejs', path.join(outputDir, 'config', 'packages', 'framework.yaml'), data),
      renderTemplateToFile('symfony/config/routes.yaml.ejs', path.join(outputDir, 'config', 'routes.yaml'), data),
      renderTemplateToFile('symfony/config/bundles.php.ejs', path.join(outputDir, 'config', 'bundles.php'), data),
      renderTemplateToFile('symfony/public/index.php.ejs', path.join(outputDir, 'public', 'index.php'), data),
      renderTemplateToFile('symfony/src/Kernel.php.ejs', path.join(outputDir, 'src', 'Kernel.php'), data),
      renderTemplateToFile('symfony/src/Controller/HomeController.php.ejs', path.join(outputDir, 'src', 'Controller', 'HomeController.php'), data),
      renderTemplateToFile('symfony/src/Entity/User.php.ejs', path.join(outputDir, 'src', 'Entity', 'User.php'), data),
    ];

    await Promise.all(tasks);
  }
}
