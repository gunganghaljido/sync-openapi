import { DB } from './types';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: Number(process.env.DATABASE_PORT),
    max: Number(process.env.DATABASE_MAX),
    ssl: {
      rejectUnauthorized: false,
    },
  }),
});

export const db = new Kysely<DB>({
  dialect,
});

export type Database = typeof db;
