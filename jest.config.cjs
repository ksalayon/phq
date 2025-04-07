module.exports = {
  preset: 'jest-preset-angular', // REQUIRED for Angular testing!
  testEnvironment: 'jsdom', // Simulates browser-like behavior
  testMatch: ['**/+(*.)+(spec).+(ts)'], // Match files ending with .spec.ts
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'], // Points to setup file
  transform: {
    '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular', // Use jest-preset-angular to process source files
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'], // Ensure ES Modules work in Jest
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageReporters: ['html', 'lcov'],
  coverageDirectory: 'coverage/jest',
  silent: false,
};
