import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: [
    './src/entities/*/model.ts',
    './src/shared/model/schema/*.ts',
  ],
  out: './src/drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});
