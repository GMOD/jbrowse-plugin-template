import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/js-with-ts',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/cypress/'],
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
}
export default config
