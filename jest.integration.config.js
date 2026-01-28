// Jest configuration for Integration Tests with Firebase Emulator
const baseConfig = require('./jest.config');

module.exports = {
    ...baseConfig,
    testEnvironment: 'node', // Use node environment for integration tests
    testMatch: ['**/tests/integration/**/*.test.js'],
    setupFilesAfterEnv: [
        '@testing-library/jest-native/extend-expect',
        '<rootDir>/tests/integration/setup.js'
    ],
    // Disable coverage thresholds for integration tests
    coverageThreshold: undefined,
    // Longer timeout for integration tests
    testTimeout: 30000
};
