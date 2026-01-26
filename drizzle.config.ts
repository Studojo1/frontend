import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./auth-schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: "__drizzle_migrations",
    schema: "public",
  },
});
