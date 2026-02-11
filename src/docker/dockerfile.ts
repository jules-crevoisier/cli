import type { GeneratorContext } from '../types';
import { renderTemplate } from '../utils/template';
import { getPortForStack } from './compose';

export async function generateDockerfile(ctx: GeneratorContext): Promise<string> {
  const templatePath = `${ctx.options.stack}/Dockerfile.ejs`;
  const port = getPortForStack(ctx.options.stack);

  return renderTemplate(templatePath, {
    ...ctx.options,
    versions: ctx.versions,
    port,
  });
}
