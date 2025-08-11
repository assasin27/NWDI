module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'routes/**/*.js',
    '!**/node_modules/**',
  ],
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 10000,
};
