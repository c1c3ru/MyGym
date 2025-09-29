// Jest configuration for React Native + TypeScript + Expo
const path = require('path');

module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'babel-jest',
      { configFile: path.resolve(__dirname, 'babel.config.js') }
    ],
    '^.+\\.(js|jsx)$': [
      'babel-jest',
      { configFile: path.resolve(__dirname, 'babel.config.js') }
    ]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native' +
      '|@react-native' +
      '|react-clone-referenced-element' +
      '|@react-navigation' +
      '|@shopify/flash-list' +
      '|react-native-reanimated' +
      '|react-native-gesture-handler' +
      '|react-native-vector-icons' +
      '|react-native-safe-area-context' +
      '|react-native-screens' +
      '|react-native-svg' +
      '|expo' +
      '|expo-.*' +
      '|@expo' +
      '|expo-modules-core' +
      ')/)'
  ],
  moduleNameMapper: {
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@hooks/(.*)$': '<rootDir>/src/presentation/hooks/$1',
    '^@components/(.*)$': '<rootDir>/src/presentation/components/$1',
    '^@contexts/(.*)$': '<rootDir>/src/presentation/contexts/$1',
    '^@screens/(.*)$': '<rootDir>/src/presentation/screens/$1',
    '^@navigation/(.*)$': '<rootDir>/src/presentation/navigation/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/shared/utils/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^react-native-qrcode-svg$': '<rootDir>/tests/__mocks__/react-native-qrcode-svg.js',
    '^expo-linear-gradient$': '<rootDir>/tests/__mocks__/expo-linear-gradient.js'
  },
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect'
  ],
  setupFiles: [
    '<rootDir>/tests/setupJest.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/src/domain/auth/usecases/__tests__/mocks.ts',
    '/src/.*/.*\\.testsprite\\.js$'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};


