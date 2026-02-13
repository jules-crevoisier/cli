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

interface DatabaseConfigFactory {
  serviceName: string;
  imagePrefix: string;
  imageSuffix?: string;
  versionKey: keyof VersionConfig['databases'];
  ports: string;
  getEnvironment: (dbName: string) => Record<string, string>;
  volumes: string[];
  healthcheck: {
    test: string;
    interval: string;
    timeout: string;
    retries: number;
  };
}

const DB_FACTORIES: Record<string, DatabaseConfigFactory> = {
  postgresql: {
    serviceName: 'db-postgres',
    imagePrefix: 'postgres:',
    imageSuffix: '-alpine',
    versionKey: 'postgresql',
    ports: '5432:5432',
    getEnvironment: (dbName) => ({
      POSTGRES_USER: 'postgres',
      POSTGRES_PASSWORD: 'postgres',
      POSTGRES_DB: dbName,
    }),
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
    imagePrefix: 'mongo:',
    versionKey: 'mongodb',
    ports: '27017:27017',
    getEnvironment: () => ({}),
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
    imagePrefix: 'mysql:',
    versionKey: 'mysql',
    ports: '3306:3306',
    getEnvironment: (dbName) => ({
      MYSQL_ROOT_PASSWORD: 'root',
      MYSQL_DATABASE: dbName,
    }),
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
    imagePrefix: 'redis:',
    imageSuffix: '-alpine',
    versionKey: 'redis',
    ports: '6379:6379',
    getEnvironment: () => ({}),
    volumes: ['redis-data:/data'],
    healthcheck: {
      test: 'redis-cli ping',
      interval: '10s',
      timeout: '5s',
      retries: 5,
    },
  },
};

export function getDatabaseConfig(
  db: DatabaseType,
  projectName: string,
  versions: VersionConfig
): DatabaseServiceConfig | null {
  // SQLite has no Docker service — it's a local file
  if (db === 'sqlite') return null;

  const factory = DB_FACTORIES[db];
  if (!factory) return null;

  const dbName = projectName.replace(/-/g, '_');
  const version = versions.databases[factory.versionKey];
  const image = `${factory.imagePrefix}${version}${factory.imageSuffix || ''}`;

  return {
    serviceName: factory.serviceName,
    image,
    ports: factory.ports,
    environment: factory.getEnvironment(dbName),
    volumes: [...factory.volumes],
    healthcheck: { ...factory.healthcheck },
  };
}
