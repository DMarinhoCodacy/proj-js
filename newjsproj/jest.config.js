const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');
const {
  getDefaultJestConfigUnit,
  getDefaultJestConfigE2E
} = require('@polestar/test-configs-frontend');

require('dotenv').config();

const TEST_CASE = process.env.TEST || 'unit';

if (!['unit', 'e2e'].includes(TEST_CASE)) {
  throw new Error(`Undefined test case: "${TEST_CASE}". Expected "unit" or "e2e".`);
}

const baseConfig = {
  collectCoverageFrom: [
    'src/app/**/*.(js|jsx|ts|tsx)',
    '!**/style.(js|jsx)',
    '!**/context.(js|jsx)',
    '!**/node_modules/**',
    '!src/app/index.(js|jsx|ts|tsx)',
    '!src/app/apollo/**',
    '!src/app/assets/**'
  ],
  coverageReporters: ['lcov', 'text', 'text-summary', 'json-summary'],
  coverageDirectory: '<rootDir>/test-reports/coverage',
  moduleNameMapper: {
    '\\.(jpe?g|png|gif|webp|svg|woff2?)$': '<rootDir>/tests/mocks/file-loader.mock.ts',
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' })
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};

const jestConfig = {
  e2e: getDefaultJestConfigE2E({
    ...baseConfig,
    testMatch: ['<rootDir>/tests/end-to-end/**/*.test.+(js|jsx|ts|tsx)'],
    testURL: process.env.APP_BASE_URL
  }),
  unit: getDefaultJestConfigUnit({
    ...baseConfig,
    maxWorkers: 2,
    testMatch: [
      '<rootDir>/src/**/*.test.+(js|jsx|ts|tsx)',
      '<rootDir>/tests/unit/**/*.test.+(js|jsx|ts|tsx)'
    ],
    transformIgnorePatterns: ['/node_modules/(?!@polestar).+\\.js$', 'react-spring'],
    transform: {
      '\\.(gql|graphql)$': 'jest-transform-graphql',
      '^.+\\.tsx?$': 'ts-jest',
      '^.+\\.m?jsx?$': 'babel-jest'
    }
  }),
  jestCommandLine: 'yarn test:unit'
};

module.exports = jestConfig[TEST_CASE];