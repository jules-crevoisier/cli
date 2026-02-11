import { describe, it, expect } from 'vitest';
import { getMailHost, getServiceHost, isJsStack, isPhpStack } from '../src/utils/stacks';
import type { StackType } from '../src/types';

describe('getMailHost', () => {
  const JS_STACKS: StackType[] = ['nextjs', 'vite-react', 'nuxt', 'vite-react-express', 'express'];
  const PHP_STACKS: StackType[] = ['symfony', 'laravel'];

  it.each(JS_STACKS)('returns "localhost" for JS stack: %s', (stack) => {
    expect(getMailHost(stack)).toBe('localhost');
  });

  it.each(PHP_STACKS)('returns "mailpit" for PHP stack: %s', (stack) => {
    expect(getMailHost(stack)).toBe('mailpit');
  });
});

describe('getServiceHost', () => {
  const JS_STACKS: StackType[] = ['nextjs', 'vite-react', 'nuxt', 'vite-react-express', 'express'];
  const PHP_STACKS: StackType[] = ['symfony', 'laravel'];

  it.each(JS_STACKS)('returns "localhost" for JS stack: %s (mailpit)', (stack) => {
    expect(getServiceHost(stack, 'mailpit')).toBe('localhost');
  });

  it.each(JS_STACKS)('returns "localhost" for JS stack: %s (minio)', (stack) => {
    expect(getServiceHost(stack, 'minio')).toBe('localhost');
  });

  it.each(JS_STACKS)('returns "localhost" for JS stack: %s (rabbitmq)', (stack) => {
    expect(getServiceHost(stack, 'rabbitmq')).toBe('localhost');
  });

  it.each(PHP_STACKS)('returns service name for PHP stack: %s (mailpit)', (stack) => {
    expect(getServiceHost(stack, 'mailpit')).toBe('mailpit');
  });

  it.each(PHP_STACKS)('returns service name for PHP stack: %s (minio)', (stack) => {
    expect(getServiceHost(stack, 'minio')).toBe('minio');
  });

  it.each(PHP_STACKS)('returns service name for PHP stack: %s (rabbitmq)', (stack) => {
    expect(getServiceHost(stack, 'rabbitmq')).toBe('rabbitmq');
  });
});
