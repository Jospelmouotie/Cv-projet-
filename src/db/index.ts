import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
  var _postgresAvailability: 'ready' | 'unavailable' | undefined;
}

const defaultPgConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.SQL_HOST || 'localhost',
      port: parseInt(process.env.SQL_PORT || '5432', 10),
      user: process.env.SQL_USER || 'postgres',
      password: process.env.SQL_PASSWORD || 'postgres',
      database: process.env.SQL_DB_NAME || 'cv_builder_db',
    };

export const isPostgresAvailable = (): boolean => global._postgresAvailability === 'ready';

export const refreshPostgresAvailability = async (): Promise<boolean> => {
  const hasConfiguredSql = !!(process.env.DATABASE_URL || process.env.SQL_HOST);

  if (!hasConfiguredSql) {
    global._postgresAvailability = 'unavailable';
    return false;
  }

  if (global._postgresAvailability === 'ready') return true;
  if (global._postgresAvailability === 'unavailable') return false;

  const pool = createPool();

  try {
    await pool.query('SELECT 1');
    global._postgresAvailability = 'ready';
    return true;
  } catch (err) {
    global._postgresAvailability = 'unavailable';
    console.warn('[PostgreSQL] Connection unavailable; falling back to SQLite.', err instanceof Error ? err.message : err);
    return false;
  }
};

// Function to create or retrieve the connection pool using the Object Method
export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      ...defaultPgConfig,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      global._postgresAvailability = 'unavailable';
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });

void refreshPostgresAvailability();
