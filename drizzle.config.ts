import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema',
  out: './src/drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});
