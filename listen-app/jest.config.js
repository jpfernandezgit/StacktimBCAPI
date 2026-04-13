/**
 * Jest config — pure-TypeScript tests only.
 *
 * We intentionally do NOT use jest-expo here. The signal processing core
 * (utils/fft.ts, utils/anomalyScore.ts, utils/constellationGen.ts) is pure
 * TypeScript with zero React / Expo imports, so we can run it with ts-jest
 * alone. This keeps CI fast and avoids having to install the entire RN
 * toolchain just to run unit tests.
 *
 * UI component tests, when added, will live in a second project under
 * `components/__tests__/` with jest-expo preset.
 */
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/utils/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        target: 'es2020',
        module: 'commonjs',
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  verbose: true,
};
