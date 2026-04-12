import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@ipc': resolve(__dirname, 'src/ipc'),
      '@config': resolve(__dirname, 'src/config'),
    },
  },
});
