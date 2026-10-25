import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: { alias: { $lib: fileURLToPath(new URL('./frontend/src/lib', import.meta.url)) } },
  test: { include: ['tests/**/*.test.ts'], testTimeout: 30000, hookTimeout: 30000, fileParallelism: false }
});
