import { describe, it, expect } from 'vitest';
import ejs from 'ejs';
import fs from 'fs-extra';
import path from 'path';

function getTemplatesDir(): string {
  const fromSrc = path.resolve(__dirname, '..', 'src', 'templates');
  return fromSrc;
}

async function renderEslintConfig(data: Record<string, unknown>): Promise<string> {
  const fullPath = path.join(getTemplatesDir(), 'shared/eslint.config.js.ejs');
  const template = await fs.readFile(fullPath, 'utf-8');
  return ejs.render(template, data, { filename: fullPath });
}

async function renderPrettierConfig(): Promise<string> {
  const fullPath = path.join(getTemplatesDir(), 'shared/.prettierrc.ejs');
  const template = await fs.readFile(fullPath, 'utf-8');
  return ejs.render(template, {}, { filename: fullPath });
}

// ────────────────────────────────────────────────────────
// ESLint config
// ────────────────────────────────────────────────────────

describe('ESLint config — shared', () => {
  it('always imports @eslint/js', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).toContain("import js from '@eslint/js'");
  });

  it('always imports eslint-config-prettier', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).toContain("import prettier from 'eslint-config-prettier'");
  });

  it('always includes js.configs.recommended', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).toContain('js.configs.recommended');
  });

  it('always includes prettier config', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).toMatch(/^\s+prettier,/m);
  });

  it('always includes ignores for node_modules', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).toContain("'node_modules/'");
  });
});

describe('ESLint config — TypeScript', () => {
  it('imports typescript-eslint when typescript=true', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).toContain("import tseslint from 'typescript-eslint'");
  });

  it('includes tseslint.configs.recommended when typescript=true', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).toContain('...tseslint.configs.recommended');
  });

  it('includes @typescript-eslint/no-unused-vars rule when typescript=true', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).toContain("'@typescript-eslint/no-unused-vars'");
  });

  it('does NOT import typescript-eslint when typescript=false', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: false });
    expect(result).not.toContain("import tseslint from 'typescript-eslint'");
  });

  it('does NOT include tseslint configs when typescript=false', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: false });
    expect(result).not.toContain('tseslint.configs.recommended');
  });
});

describe('ESLint config — Next.js', () => {
  it('imports @next/eslint-plugin-next', async () => {
    const result = await renderEslintConfig({ stack: 'nextjs', typescript: true });
    expect(result).toContain("import nextPlugin from '@next/eslint-plugin-next'");
  });

  it('imports eslint-plugin-react', async () => {
    const result = await renderEslintConfig({ stack: 'nextjs', typescript: true });
    expect(result).toContain("import reactPlugin from 'eslint-plugin-react'");
  });

  it('imports eslint-plugin-react-hooks', async () => {
    const result = await renderEslintConfig({ stack: 'nextjs', typescript: true });
    expect(result).toContain("import hooksPlugin from 'eslint-plugin-react-hooks'");
  });

  it('configures react-hooks/rules-of-hooks as error', async () => {
    const result = await renderEslintConfig({ stack: 'nextjs', typescript: true });
    expect(result).toContain("'react-hooks/rules-of-hooks': 'error'");
  });

  it('sets react version to detect', async () => {
    const result = await renderEslintConfig({ stack: 'nextjs', typescript: true });
    expect(result).toContain("react: { version: 'detect' }");
  });

  it('ignores .next/ directory', async () => {
    const result = await renderEslintConfig({ stack: 'nextjs', typescript: true });
    expect(result).toContain("'.next/'");
  });

  it('does NOT contain vue plugin', async () => {
    const result = await renderEslintConfig({ stack: 'nextjs', typescript: true });
    expect(result).not.toContain('eslint-plugin-vue');
  });
});

describe('ESLint config — Vite React', () => {
  it('imports eslint-plugin-react', async () => {
    const result = await renderEslintConfig({ stack: 'vite-react', typescript: true });
    expect(result).toContain("import reactPlugin from 'eslint-plugin-react'");
  });

  it('imports eslint-plugin-react-hooks', async () => {
    const result = await renderEslintConfig({ stack: 'vite-react', typescript: true });
    expect(result).toContain("import hooksPlugin from 'eslint-plugin-react-hooks'");
  });

  it('does NOT import @next/eslint-plugin-next', async () => {
    const result = await renderEslintConfig({ stack: 'vite-react', typescript: true });
    expect(result).not.toContain('@next/eslint-plugin-next');
  });

  it('ignores dist/ directory', async () => {
    const result = await renderEslintConfig({ stack: 'vite-react', typescript: true });
    expect(result).toContain("'dist/'");
  });
});

describe('ESLint config — Nuxt', () => {
  it('imports eslint-plugin-vue', async () => {
    const result = await renderEslintConfig({ stack: 'nuxt', typescript: true });
    expect(result).toContain("import vuePlugin from 'eslint-plugin-vue'");
  });

  it('imports vue-eslint-parser', async () => {
    const result = await renderEslintConfig({ stack: 'nuxt', typescript: true });
    expect(result).toContain("import vueParser from 'vue-eslint-parser'");
  });

  it('includes vue flat/recommended config', async () => {
    const result = await renderEslintConfig({ stack: 'nuxt', typescript: true });
    expect(result).toContain("...vuePlugin.configs['flat/recommended']");
  });

  it('configures vue-eslint-parser with tseslint parser when typescript=true', async () => {
    const result = await renderEslintConfig({ stack: 'nuxt', typescript: true });
    expect(result).toContain('parser: vueParser');
    expect(result).toContain('parser: tseslint.parser');
  });

  it('does NOT configure tseslint parser when typescript=false', async () => {
    const result = await renderEslintConfig({ stack: 'nuxt', typescript: false });
    expect(result).not.toContain('tseslint.parser');
  });

  it('does NOT import react plugins', async () => {
    const result = await renderEslintConfig({ stack: 'nuxt', typescript: true });
    expect(result).not.toContain('eslint-plugin-react');
  });

  it('ignores .nuxt/ and .output/ directories', async () => {
    const result = await renderEslintConfig({ stack: 'nuxt', typescript: true });
    expect(result).toContain("'.nuxt/'");
    expect(result).toContain("'.output/'");
  });
});

describe('ESLint config — Vite React Express', () => {
  it('imports eslint-plugin-react', async () => {
    const result = await renderEslintConfig({ stack: 'vite-react-express', typescript: true });
    expect(result).toContain("import reactPlugin from 'eslint-plugin-react'");
  });

  it('imports eslint-plugin-react-hooks', async () => {
    const result = await renderEslintConfig({ stack: 'vite-react-express', typescript: true });
    expect(result).toContain("import hooksPlugin from 'eslint-plugin-react-hooks'");
  });

  it('does NOT import vue plugins', async () => {
    const result = await renderEslintConfig({ stack: 'vite-react-express', typescript: true });
    expect(result).not.toContain('eslint-plugin-vue');
  });

  it('does NOT import @next/eslint-plugin-next', async () => {
    const result = await renderEslintConfig({ stack: 'vite-react-express', typescript: true });
    expect(result).not.toContain('@next/eslint-plugin-next');
  });

  it('ignores client/dist/ and server/dist/ directories', async () => {
    const result = await renderEslintConfig({ stack: 'vite-react-express', typescript: true });
    expect(result).toContain("'client/dist/'");
    expect(result).toContain("'server/dist/'");
  });
});

describe('ESLint config — Express', () => {
  it('does NOT import react plugins', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).not.toContain('eslint-plugin-react');
  });

  it('does NOT import vue plugins', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).not.toContain('eslint-plugin-vue');
  });

  it('does NOT import next plugin', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).not.toContain('@next/eslint-plugin-next');
  });

  it('ignores dist/ directory', async () => {
    const result = await renderEslintConfig({ stack: 'express', typescript: true });
    expect(result).toContain("'dist/'");
  });
});

// ────────────────────────────────────────────────────────
// Prettier config
// ────────────────────────────────────────────────────────

describe('Prettier config (.prettierrc)', () => {
  it('is valid JSON', async () => {
    const result = await renderPrettierConfig();
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('has semi: true', async () => {
    const result = await renderPrettierConfig();
    const config = JSON.parse(result);
    expect(config.semi).toBe(true);
  });

  it('has singleQuote: true', async () => {
    const result = await renderPrettierConfig();
    const config = JSON.parse(result);
    expect(config.singleQuote).toBe(true);
  });

  it('has tabWidth: 2', async () => {
    const result = await renderPrettierConfig();
    const config = JSON.parse(result);
    expect(config.tabWidth).toBe(2);
  });

  it('has trailingComma: "es5"', async () => {
    const result = await renderPrettierConfig();
    const config = JSON.parse(result);
    expect(config.trailingComma).toBe('es5');
  });

  it('has printWidth: 100', async () => {
    const result = await renderPrettierConfig();
    const config = JSON.parse(result);
    expect(config.printWidth).toBe(100);
  });
});
