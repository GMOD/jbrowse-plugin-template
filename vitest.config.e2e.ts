// Puppeteer e2e tests (test/). Long timeouts: beforeAll builds the bundle and starts a server.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 120_000,
    hookTimeout: 60_000,
    include: ['test/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
})
