import path from 'path';
import fs from 'fs-extra';
import type { StackGenerator } from './base';
import type { GeneratorContext } from '../types';
import { renderTemplateToFile } from '../utils/template';

export class LaravelGenerator implements StackGenerator {
  getPort(): number {
    return 8000;
  }

  async generate(ctx: GeneratorContext): Promise<void> {
    const { options, versions, outputDir } = ctx;
    const data = { ...options, versions, orm: 'eloquent' };

    // Create directories
    const dirs = [
      'app/Models',
      'app/Providers',
      'bootstrap',
      'config',
      'database/migrations',
      'database/seeders',
      'database/factories',
      'public',
      'routes',
      'storage/app',
      'storage/framework/cache',
      'storage/framework/sessions',
      'storage/framework/views',
      'storage/logs',
    ];
    await Promise.all(dirs.map((dir) => fs.ensureDir(path.join(outputDir, dir))));

    // Render templates
    await Promise.all([
      renderTemplateToFile('laravel/Dockerfile.ejs', path.join(outputDir, 'Dockerfile.dev'), data),
      renderTemplateToFile('laravel/nginx.conf.ejs', path.join(outputDir, 'nginx.conf'), data),
      renderTemplateToFile('laravel/composer.json.ejs', path.join(outputDir, 'composer.json'), data),
      renderTemplateToFile('laravel/config/app.php.ejs', path.join(outputDir, 'config/app.php'), data),
      renderTemplateToFile('laravel/config/database.php.ejs', path.join(outputDir, 'config/database.php'), data),
      renderTemplateToFile('laravel/routes/web.php.ejs', path.join(outputDir, 'routes/web.php'), data),
      renderTemplateToFile('laravel/app/Providers/AppServiceProvider.php.ejs', path.join(outputDir, 'app/Providers/AppServiceProvider.php'), data),
      renderTemplateToFile('laravel/app/Models/User.php.ejs', path.join(outputDir, 'app/Models/User.php'), data),
      renderTemplateToFile('laravel/database/migrations/create_users_table.php.ejs', path.join(outputDir, 'database/migrations/2024_01_01_000000_create_users_table.php'), data),
      renderTemplateToFile('laravel/database/seeders/DatabaseSeeder.php.ejs', path.join(outputDir, 'database/seeders/DatabaseSeeder.php'), data),
      renderTemplateToFile('laravel/bootstrap/app.php.ejs', path.join(outputDir, 'bootstrap/app.php'), data),
      renderTemplateToFile('laravel/public/index.php.ejs', path.join(outputDir, 'public/index.php'), data),
    ]);
  }
}
