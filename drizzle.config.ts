import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const sqlHost = process.env.SQL_HOST || 'localhost';
const sqlPort = parseInt(process.env.SQL_PORT || '5432', 10);
const sqlDbName = process.env.SQL_DB_NAME || 'cv_builder_db';
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER || 'postgres';
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || 'postgres';

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: databaseUrl
    ? { url: databaseUrl }
    : {
        host: sqlHost,
        port: sqlPort,
        user: user,
        password: password,
        database: sqlDbName,
        ssl: false,
      },
  verbose: true,
});
