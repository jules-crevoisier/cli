import type { ServiceType } from '../types';

export interface ServiceConfig {
  serviceName: string;
  image: string;
  ports: string[];
  environment: Record<string, string>;
  volumes?: string[];
  command?: string;
}

const SERVICE_CONFIGS: Record<ServiceType, ServiceConfig> = {
  mailpit: {
    serviceName: 'mailpit',
    image: 'axllent/mailpit:latest',
    ports: ['1025:1025', '8025:8025'],
    environment: {
      MP_SMTP_AUTH_ACCEPT_ANY: '1',
      MP_SMTP_AUTH_ALLOW_INSECURE: '1',
    },
  },
  minio: {
    serviceName: 'minio',
    image: 'minio/minio:latest',
    ports: ['9000:9000', '9001:9001'],
    environment: {
      MINIO_ROOT_USER: 'minioadmin',
      MINIO_ROOT_PASSWORD: 'minioadmin',
    },
    volumes: ['minio-data:/data'],
    command: 'server /data --console-address ":9001"',
  },
  rabbitmq: {
    serviceName: 'rabbitmq',
    image: 'rabbitmq:4-management-alpine',
    ports: ['5672:5672', '15672:15672'],
    environment: {
      RABBITMQ_DEFAULT_USER: 'guest',
      RABBITMQ_DEFAULT_PASSWORD: 'guest',
    },
    volumes: ['rabbitmq-data:/var/lib/rabbitmq'],
  },
  adminer: {
    serviceName: 'adminer',
    image: 'adminer:latest',
    ports: ['8080:8080'],
    environment: {},
  },
};

export function getServiceConfig(service: ServiceType): ServiceConfig {
  return SERVICE_CONFIGS[service];
}
