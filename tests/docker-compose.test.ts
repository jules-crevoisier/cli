import { describe, it, expect } from 'vitest';
import { generateDockerCompose } from '../src/docker/compose';
import { getDefaultVersions } from '../src/versions/checker';
import type { GeneratorContext, ProjectOptions } from '../src/types';

function makeCtx(overrides: Partial<ProjectOptions> = {}): GeneratorContext {
  const options: ProjectOptions = {
    projectName: 'test-app',
    stack: 'express',
    typescript: true,
    databases: [],
    eslintPrettier: true,
    docker: true,
    orm: 'none',
    services: [],
    modules: [],
    ...overrides,
  };
  return { options, versions: getDefaultVersions(), outputDir: '/tmp/test-app' };
}

describe('generateDockerCompose — JS stacks', () => {
  it('returns empty string when no DB and no services', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: [] });
    expect(generateDockerCompose(ctx)).toBe('');
  });

  it('generates only mailpit service when services=[mailpit] and no DB', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['mailpit'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('services:');
    expect(yaml).toContain('mailpit:');
    expect(yaml).toContain('axllent/mailpit:latest');
    expect(yaml).toContain('"1025:1025"');
    expect(yaml).toContain('"8025:8025"');
    expect(yaml).toContain('MP_SMTP_AUTH_ACCEPT_ANY');
    expect(yaml).toContain('MP_SMTP_AUTH_ALLOW_INSECURE');
    // Should NOT contain any DB service
    expect(yaml).not.toContain('db-postgres');
    expect(yaml).not.toContain('db-mysql');
  });

  it('generates DB + mailpit when both are enabled', () => {
    const ctx = makeCtx({ stack: 'express', databases: ['postgresql'], services: ['mailpit'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('db-postgres:');
    expect(yaml).toContain('mailpit:');
    expect(yaml).toContain('"1025:1025"');
    expect(yaml).toContain('"8025:8025"');
  });

  it('generates DB without services when services=[]', () => {
    const ctx = makeCtx({ stack: 'nextjs', databases: ['postgresql'], services: [] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('db-postgres:');
    expect(yaml).not.toContain('mailpit');
  });
});

describe('generateDockerCompose — PHP stacks', () => {
  it('generates app + mailpit when services=[mailpit] and no DB', () => {
    const ctx = makeCtx({ stack: 'symfony', databases: [], services: ['mailpit'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('app:');
    expect(yaml).toContain('mailpit:');
    expect(yaml).toContain('"1025:1025"');
    expect(yaml).toContain('"8025:8025"');
    expect(yaml).not.toContain('db-postgres');
  });

  it('generates app + DB + mailpit when both are enabled', () => {
    const ctx = makeCtx({ stack: 'laravel', databases: ['mysql'], services: ['mailpit'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('app:');
    expect(yaml).toContain('db-mysql:');
    expect(yaml).toContain('mailpit:');
    expect(yaml).toContain('"1025:1025"');
  });

  it('does not include mailpit when services=[]', () => {
    const ctx = makeCtx({ stack: 'symfony', databases: ['postgresql'], services: [] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('app:');
    expect(yaml).toContain('db-postgres:');
    expect(yaml).not.toContain('mailpit');
  });
});

describe('Mailpit service configuration', () => {
  it('has correct ports', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['mailpit'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('"1025:1025"');
    expect(yaml).toContain('"8025:8025"');
  });

  it('has correct environment variables', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['mailpit'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('MP_SMTP_AUTH_ACCEPT_ANY: "1"');
    expect(yaml).toContain('MP_SMTP_AUTH_ALLOW_INSECURE: "1"');
  });

  it('uses axllent/mailpit:latest image', () => {
    const ctx = makeCtx({ stack: 'laravel', databases: [], services: ['mailpit'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('image: axllent/mailpit:latest');
  });
});

describe('MinIO service', () => {
  it('generates minio service with correct image', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['minio'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('minio:');
    expect(yaml).toContain('image: minio/minio:latest');
  });

  it('has correct ports (API 9000, Console 9001)', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['minio'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('"9000:9000"');
    expect(yaml).toContain('"9001:9001"');
  });

  it('has correct credentials', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['minio'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('MINIO_ROOT_USER:');
    expect(yaml).toContain('minioadmin');
    expect(yaml).toContain('MINIO_ROOT_PASSWORD:');
  });

  it('has volume and command', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['minio'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('minio-data:/data');
    expect(yaml).toContain('server /data --console-address ":9001"');
  });

  it('declares named volume', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['minio'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toMatch(/volumes:\n\s+minio-data:/);
  });
});

describe('RabbitMQ service', () => {
  it('generates rabbitmq service with management image', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['rabbitmq'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('rabbitmq:');
    expect(yaml).toContain('image: rabbitmq:4-management-alpine');
  });

  it('has correct ports (AMQP 5672, Management 15672)', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['rabbitmq'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('"5672:5672"');
    expect(yaml).toContain('"15672:15672"');
  });

  it('has correct default credentials', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['rabbitmq'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('RABBITMQ_DEFAULT_USER:');
    expect(yaml).toContain('guest');
    expect(yaml).toContain('RABBITMQ_DEFAULT_PASSWORD:');
  });

  it('has volume', () => {
    const ctx = makeCtx({ stack: 'express', databases: [], services: ['rabbitmq'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('rabbitmq-data:/var/lib/rabbitmq');
  });
});

describe('Adminer service', () => {
  it('generates adminer service', () => {
    const ctx = makeCtx({ stack: 'express', databases: ['postgresql'], services: ['adminer'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('adminer:');
    expect(yaml).toContain('image: adminer:latest');
  });

  it('has correct port (8080)', () => {
    const ctx = makeCtx({ stack: 'express', databases: ['postgresql'], services: ['adminer'] });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('"8080:8080"');
  });
});

describe('Multiple services', () => {
  it('generates all services together', () => {
    const ctx = makeCtx({
      stack: 'express',
      databases: ['postgresql'],
      services: ['mailpit', 'minio', 'rabbitmq', 'adminer'],
    });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('db-postgres:');
    expect(yaml).toContain('mailpit:');
    expect(yaml).toContain('minio:');
    expect(yaml).toContain('rabbitmq:');
    expect(yaml).toContain('adminer:');
  });

  it('generates correct named volumes for all services', () => {
    const ctx = makeCtx({
      stack: 'express',
      databases: [],
      services: ['minio', 'rabbitmq'],
    });
    const yaml = generateDockerCompose(ctx);

    expect(yaml).toContain('minio-data:');
    expect(yaml).toContain('rabbitmq-data:');
  });
});
