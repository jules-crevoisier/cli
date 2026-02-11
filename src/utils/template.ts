import path from 'path';
import ejs from 'ejs';
import fs from 'fs-extra';

function getTemplatesDir(): string {
  // When running from dist/index.js (__dirname = dist/), templates are at ../src/templates
  const fromDist = path.resolve(__dirname, '..', 'src', 'templates');
  // When running from src/utils/template.ts (__dirname = src/utils/), templates are at ../templates
  const fromSrc = path.resolve(__dirname, '..', 'templates');
  if (fs.existsSync(fromDist)) return fromDist;
  return fromSrc;
}

export async function renderTemplate(
  templatePath: string,
  data: Record<string, unknown>
): Promise<string> {
  const fullPath = path.join(getTemplatesDir(), templatePath);
  const template = await fs.readFile(fullPath, 'utf-8');
  return ejs.render(template, data, { filename: fullPath });
}

export async function renderTemplateToFile(
  templatePath: string,
  outputPath: string,
  data: Record<string, unknown>
): Promise<void> {
  const content = await renderTemplate(templatePath, data);
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, content, 'utf-8');
}
