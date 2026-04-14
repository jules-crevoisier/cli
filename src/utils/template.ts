import path from 'path';
import ejs from 'ejs';
import fs from 'fs-extra';

let cachedTemplatesDir: string | null = null;

function getTemplateCandidates(): string[] {
  const candidates: string[] = [];

  const envTemplatesDir = process.env.LETSCRAFT_TEMPLATES_DIR;
  if (envTemplatesDir) {
    candidates.push(path.resolve(envTemplatesDir));
  }

  // Development from TypeScript source (src/utils/template.ts -> src/templates)
  candidates.push(path.resolve(__dirname, '..', 'templates'));
  // Execution from compiled dist (dist/utils/template.js -> src/templates)
  candidates.push(path.resolve(__dirname, '..', 'src', 'templates'));

  // Packaged executable support: look next to the executable.
  // This avoids hard failures when bundled snapshot paths are unavailable.
  if (process.execPath) {
    const execDir = path.dirname(process.execPath);
    candidates.push(path.join(execDir, 'src', 'templates'));
    candidates.push(path.join(execDir, 'templates'));
  }

  return candidates;
}

function getTemplatesDir(): string {
  if (cachedTemplatesDir) return cachedTemplatesDir;

  const existingDir = getTemplateCandidates().find((candidate) => fs.existsSync(candidate));
  if (!existingDir) {
    throw new Error(
      `Templates directory not found. Checked: ${getTemplateCandidates().join(', ')}`
    );
  }

  cachedTemplatesDir = existingDir;
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
