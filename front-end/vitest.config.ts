/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      // C2 Coverage - Condition Coverage
      // Reports all branches and conditions
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/types/',
        'src/constants/enum-labels.ts',
      ],
      branches: 80, // C2: All branch conditions coverage target
      lines: 80,
      functions: 80,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@redux': fileURLToPath(new URL('./src/redux', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
    },
  },
});
