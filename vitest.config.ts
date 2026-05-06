// Unit tests (test/*.test.tsx). E2e/puppeteer tests use vitest.config.e2e.ts.
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true, // exposes it/expect/describe without imports, matching jest API
    setupFiles: ['./test/setupTests.ts'],
    include: ['test/**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
})
