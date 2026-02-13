import path from 'path';
import ejs from 'ejs';
import fs from 'fs-extra';

let cachedTemplatesDir: string | null = null;

function getTemplatesDir(): string {
  if (cachedTemplatesDir) return cachedTemplatesDir;

  // When running from dist/index.js (__dirname = dist/), templates are at ../src/templates
  const fromDist = path.resolve(__dirname, '..', 'src', 'templates');
  // When running from src/utils/template.ts (__dirname = src/utils/), templates are at ../templates
  const fromSrc = path.resolve(__dirname, '..', 'templates');

  cachedTemplatesDir = fs.existsSync(fromDist) ? fromDist : fromSrc;
  return cachedTemplatesDir;
}

export async function renderTemplate(
  templatePath: string,
  data: Record<string, unknown>
): Promise<string> {
  const fullPath = path.join(getTemplatesDir(), templatePath);

  let template: string;
  try {
    template = await fs.readFile(fullPath, 'utf-8');
  } catch (error) {
    throw new Error(
      `Template file not found: "${templatePath}" (looked at ${fullPath})`
    );
  }

  try {
    return ejs.render(template, data, { filename: fullPath });
  } catch (error) {
    throw new Error(
      `Failed to render template "${templatePath}": ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }
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
