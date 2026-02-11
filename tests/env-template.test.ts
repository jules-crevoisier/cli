import { describe, it, expect } from 'vitest';
import { renderTemplate } from '../src/utils/template';
import type { ServiceType } from '../src/types';

function makeTemplateData(overrides: Record<string, unknown> = {}) {
  return {
    projectName: 'test-app',
    stack: 'express',
    databases: [] as string[],
    port: 4000,
    dbHost: {} as Record<string, string>,
    services: [] as ServiceType[],
    serviceHosts: {} as Record<string, string>,
    modules: [] as string[],
    ...overrides,
  };
}

describe('.env template — mailer variables', () => {
  it('includes mail variables when services=[mailpit] (JS stack)', async () => {
    const data = makeTemplateData({
      services: ['mailpit'],
      serviceHosts: { mailpit: 'localhost' },
    });
    const content = await renderTemplate('shared/.env.ejs', data);

    expect(content).toContain('MAIL_HOST=localhost');
    expect(content).toContain('MAIL_PORT=1025');
    expect(content).toContain('MAIL_FROM=noreply@test-app.local');
    expect(content).toContain('MAILPIT_URL=http://localhost:8025');
  });

  it('uses mailpit host when PHP stack', async () => {
    const data = makeTemplateData({
      stack: 'symfony',
      services: ['mailpit'],
      serviceHosts: { mailpit: 'mailpit' },
    });
    const content = await renderTemplate('shared/.env.ejs', data);

    expect(content).toContain('MAIL_HOST=mailpit');
    expect(content).toContain('MAILPIT_URL=http://mailpit:8025');
  });

  it('does not include mail variables when services=[]', async () => {
    const data = makeTemplateData({ services: [] });
    const content = await renderTemplate('shared/.env.ejs', data);

    expect(content).not.toContain('MAIL_HOST');
    expect(content).not.toContain('MAIL_PORT');
    expect(content).not.toContain('MAILPIT_URL');
  });

  it('includes both DB and mail variables when both are enabled', async () => {
    const data = makeTemplateData({
      databases: ['postgresql'],
      dbHost: { postgresql: 'localhost' },
      services: ['mailpit'],
      serviceHosts: { mailpit: 'localhost' },
    });
    const content = await renderTemplate('shared/.env.ejs', data);

    expect(content).toContain('DATABASE_URL=postgresql://');
    expect(content).toContain('POSTGRES_USER=postgres');
    expect(content).toContain('MAIL_HOST=localhost');
    expect(content).toContain('MAIL_PORT=1025');
  });
});

describe('.env template — MinIO variables', () => {
  it('includes S3 variables when services=[minio]', async () => {
    const data = makeTemplateData({
      services: ['minio'],
      serviceHosts: { minio: 'localhost' },
    });
    const content = await renderTemplate('shared/.env.ejs', data);

    expect(content).toContain('S3_ENDPOINT=http://localhost:9000');
    expect(content).toContain('S3_ACCESS_KEY=minioadmin');
    expect(content).toContain('S3_SECRET_KEY=minioadmin');
    expect(content).toContain('S3_BUCKET=test_app');
    expect(content).toContain('MINIO_CONSOLE_URL=http://localhost:9001');
  });

  it('uses Docker service name for PHP stack', async () => {
    const data = makeTemplateData({
      stack: 'symfony',
      services: ['minio'],
      serviceHosts: { minio: 'minio' },
    });
    const content = await renderTemplate('shared/.env.ejs', data);

    expect(content).toContain('S3_ENDPOINT=http://minio:9000');
    expect(content).toContain('MINIO_CONSOLE_URL=http://minio:9001');
  });

  it('does not include S3 variables when minio not in services', async () => {
    const data = makeTemplateData({ services: ['mailpit'], serviceHosts: { mailpit: 'localhost' } });
    const content = await renderTemplate('shared/.env.ejs', data);

    expect(content).not.toContain('S3_ENDPOINT');
    expect(content).not.toContain('MINIO_CONSOLE_URL');
  });
});

describe('.env template — RabbitMQ variables', () => {
  it('includes RabbitMQ variables when services=[rabbitmq]', async () => {
    const data = makeTemplateData({
      services: ['rabbitmq'],
      serviceHosts: { rabbitmq: 'localhost' },
    });
    const content = await renderTemplate('shared/.env.ejs', data);

    expect(content).toContain('RABBITMQ_URL=amqp://localhost:5672');
    expect(content).toContain('RABBITMQ_MANAGEMENT_URL=http://localhost:15672');
  });

  it('uses Docker service name for PHP stack', async () => {
    const data = makeTemplateData({
      stack: 'laravel',
      services: ['rabbitmq'],
      serviceHosts: { rabbitmq: 'rabbitmq' },
    });
    const content = await renderTemplate('shared/.env.ejs', data);

    expect(content).toContain('RABBITMQ_URL=amqp://rabbitmq:5672');
    expect(content).toContain('RABBITMQ_MANAGEMENT_URL=http://rabbitmq:15672');
  });

  it('does not include RabbitMQ variables when not selected', async () => {
    const data = makeTemplateData({ services: [] });
    const content = await renderTemplate('shared/.env.ejs', data);

    expect(content).not.toContain('RABBITMQ_URL');
  });
});

describe('.env.example template — services variables', () => {
  it('includes mail variables when services=[mailpit]', async () => {
    const data = makeTemplateData({
      services: ['mailpit'],
      serviceHosts: { mailpit: 'localhost' },
    });
    const content = await renderTemplate('shared/.env.example.ejs', data);

    expect(content).toContain('MAIL_HOST=localhost');
    expect(content).toContain('MAIL_PORT=1025');
  });

  it('includes S3 variables when services=[minio]', async () => {
    const data = makeTemplateData({
      services: ['minio'],
      serviceHosts: { minio: 'localhost' },
    });
    const content = await renderTemplate('shared/.env.example.ejs', data);

    expect(content).toContain('S3_ENDPOINT=http://localhost:9000');
  });

  it('does not include mail variables when services=[]', async () => {
    const data = makeTemplateData({ services: [] });
    const content = await renderTemplate('shared/.env.example.ejs', data);

    expect(content).not.toContain('MAIL_HOST');
  });
});
