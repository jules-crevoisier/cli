import { describe, it, expect } from 'vitest';
import {
  getModuleConfig,
  getAllModuleConfigs,
  getModulesForStack,
  resolveModuleDependencies,
  resolveModuleServices,
} from '../src/modules/registry';
import type { ModuleType, StackType, ServiceType } from '../src/types';

describe('Module Registry', () => {
  describe('getModuleConfig', () => {
    it('returns config for auth module', () => {
      const config = getModuleConfig('auth');
      expect(config).toBeDefined();
      expect(config!.name).toBe('auth');
      expect(config!.label).toBe('Authentication');
      expect(config!.supportedStacks.length).toBe(7);
    });

    it('returns config for crud module', () => {
      const config = getModuleConfig('crud');
      expect(config).toBeDefined();
      expect(config!.name).toBe('crud');
      expect(config!.supportedStacks).toContain('express');
      expect(config!.supportedStacks).toContain('nextjs');
      expect(config!.supportedStacks).toContain('nuxt');
      expect(config!.supportedStacks).toContain('vite-react-express');
      expect(config!.supportedStacks).toContain('symfony');
      expect(config!.supportedStacks).toContain('laravel');
    });

    it('returns config for dark-mode module', () => {
      const config = getModuleConfig('dark-mode');
      expect(config).toBeDefined();
      expect(config!.supportedStacks).toContain('nextjs');
      expect(config!.supportedStacks).toContain('vite-react');
      expect(config!.supportedStacks).toContain('nuxt');
      expect(config!.supportedStacks).toContain('vite-react-express');
      expect(config!.supportedStacks).not.toContain('express');
      expect(config!.supportedStacks).not.toContain('symfony');
      expect(config!.supportedStacks).not.toContain('laravel');
    });

    it('returns undefined for unknown module', () => {
      const config = getModuleConfig('unknown' as ModuleType);
      expect(config).toBeUndefined();
    });
  });

  describe('getAllModuleConfigs', () => {
    it('returns all 9 modules', () => {
      const configs = getAllModuleConfigs();
      expect(configs).toHaveLength(9);
    });

    it('includes all expected module names', () => {
      const names = getAllModuleConfigs().map((c) => c.name);
      expect(names).toContain('auth');
      expect(names).toContain('crud');
      expect(names).toContain('admin');
      expect(names).toContain('file-upload');
      expect(names).toContain('email');
      expect(names).toContain('api-docs');
      expect(names).toContain('i18n');
      expect(names).toContain('dark-mode');
      expect(names).toContain('ci-cd');
    });
  });

  describe('getModulesForStack', () => {
    it('returns all modules for nextjs', () => {
      const modules = getModulesForStack('nextjs');
      expect(modules.length).toBeGreaterThanOrEqual(8);
      expect(modules.map((m) => m.name)).toContain('auth');
      expect(modules.map((m) => m.name)).toContain('dark-mode');
    });

    it('returns backend-only modules for express', () => {
      const modules = getModulesForStack('express');
      const names = modules.map((m) => m.name);
      expect(names).toContain('auth');
      expect(names).toContain('crud');
      expect(names).toContain('api-docs');
      expect(names).not.toContain('dark-mode');
    });

    it('returns correct modules for symfony', () => {
      const modules = getModulesForStack('symfony');
      const names = modules.map((m) => m.name);
      expect(names).toContain('auth');
      expect(names).toContain('crud');
      expect(names).not.toContain('dark-mode');
    });

    it('returns frontend modules for vite-react', () => {
      const modules = getModulesForStack('vite-react');
      const names = modules.map((m) => m.name);
      expect(names).toContain('auth');
      expect(names).toContain('dark-mode');
      expect(names).toContain('admin');
    });
  });

  describe('resolveModuleDependencies', () => {
    it('auto-adds auth when admin is selected', () => {
      const resolved = resolveModuleDependencies(['admin']);
      expect(resolved).toContain('auth');
      expect(resolved).toContain('admin');
    });

    it('does not duplicate auth if already selected', () => {
      const resolved = resolveModuleDependencies(['auth', 'admin']);
      const authCount = resolved.filter((m) => m === 'auth').length;
      expect(authCount).toBe(1);
    });

    it('returns same modules if no dependencies needed', () => {
      const resolved = resolveModuleDependencies(['crud', 'i18n']);
      expect(resolved).toContain('crud');
      expect(resolved).toContain('i18n');
      expect(resolved).not.toContain('auth');
    });

    it('returns empty array for empty input', () => {
      const resolved = resolveModuleDependencies([]);
      expect(resolved).toHaveLength(0);
    });
  });

  describe('resolveModuleServices', () => {
    it('adds minio when file-upload is selected', () => {
      const services = resolveModuleServices(['file-upload'], []);
      expect(services).toContain('minio');
    });

    it('adds mailpit when email is selected', () => {
      const services = resolveModuleServices(['email'], []);
      expect(services).toContain('mailpit');
    });

    it('does not duplicate services already present', () => {
      const services = resolveModuleServices(['file-upload'], ['minio' as ServiceType]);
      const minioCount = services.filter((s) => s === 'minio').length;
      expect(minioCount).toBe(1);
    });

    it('returns existing services if no modules need additional services', () => {
      const services = resolveModuleServices(['auth', 'crud'], ['rabbitmq' as ServiceType]);
      expect(services).toContain('rabbitmq');
      expect(services).not.toContain('minio');
      expect(services).not.toContain('mailpit');
    });

    it('adds multiple services for multiple modules', () => {
      const services = resolveModuleServices(['file-upload', 'email'], []);
      expect(services).toContain('minio');
      expect(services).toContain('mailpit');
    });
  });
});
