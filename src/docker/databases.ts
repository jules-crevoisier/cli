import type { DatabaseType, VersionConfig } from '../types';

export interface DatabaseServiceConfig {
  serviceName: string;
  image: string;
  ports: string;
  environment: Record<string, string>;
  volumes: string[];
  healthcheck?: {
    test: string;
    interval: string;
    timeout: string;
    retries: number;
  };
}

export function getDatabaseConfig(
  db: DatabaseType,
  projectName: string,
  versions: VersionConfig
): DatabaseServiceConfig | null {
  const dbName = projectName.replace(/-/g, '_');

  const configs: Record<string, DatabaseServiceConfig> = {
    postgresql: {
      serviceName: 'db-postgres',
      image: `postgres:${versions.databases.postgresql}-alpine`,
      ports: '5432:5432',
      environment: {
        POSTGRES_USER: 'postgres',
        POSTGRES_PASSWORD: 'postgres',
        POSTGRES_DB: dbName,
      },
      volumes: ['postgres-data:/var/lib/postgresql/data'],
      healthcheck: {
        test: 'pg_isready -U postgres',
        interval: '10s',
        timeout: '5s',
        retries: 5,
      },
    },
    mongodb: {
      serviceName: 'db-mongo',
      image: `mongo:${versions.databases.mongodb}`,
      ports: '27017:27017',
      environment: {},
      volumes: ['mongo-data:/data/db'],
      healthcheck: {
        test: "mongosh --eval \"db.adminCommand('ping')\"",
        interval: '10s',
        timeout: '5s',
        retries: 5,
      },
    },
    mysql: {
      serviceName: 'db-mysql',
      image: `mysql:${versions.databases.mysql}`,
      ports: '3306:3306',
      environment: {
        MYSQL_ROOT_PASSWORD: 'root',
        MYSQL_DATABASE: dbName,
      },
      volumes: ['mysql-data:/var/lib/mysql'],
      healthcheck: {
        test: 'mysqladmin ping -h localhost',
        interval: '10s',
        timeout: '5s',
        retries: 5,
      },
    },
    redis: {
      serviceName: 'redis',
      image: `redis:${versions.databases.redis}-alpine`,
      ports: '6379:6379',
      environment: {},
      volumes: ['redis-data:/data'],
      healthcheck: {
        test: 'redis-cli ping',
        interval: '10s',
        timeout: '5s',
        retries: 5,
      },
    },
  };

  // SQLite has no Docker service — it's a local file
  if (db === 'sqlite') return null;

  return configs[db] || null;
}
