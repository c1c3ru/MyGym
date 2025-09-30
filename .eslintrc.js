module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@babel/eslint-parser',
  plugins: ['react', 'react-native', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  env: {
    'react-native/react-native': true,
    jest: true,
    node: true,
  },
  rules: {
    // Regras gerais
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // ⚠️ REGRAS PARA PREVENIR VALORES HARDCODED
    // Previne cores hexadecimais hardcoded
    'no-restricted-syntax': [
      'warn',
      {
        selector: "Literal[value=/#[0-9A-Fa-f]{3,6}/]",
        message: '🎨 Evite cores hardcoded. Use COLORS do @presentation/theme/designTokens',
      },
      {
        selector: "TemplateLiteral[quasis.0.value.raw=/#[0-9A-Fa-f]{3,6}/]",
        message: '🎨 Evite cores hardcoded. Use COLORS do @presentation/theme/designTokens',
      },
      {
        selector: "Literal[value=/^COLORS\\./]",
        message: '⚠️ COLORS deve ser usado sem aspas. Use {COLORS.xxx} em JSX ou COLORS.xxx em código',
      },
    ],
    
    // Previne valores de fontSize hardcoded
    'no-magic-numbers': [
      'warn',
      {
        ignore: [0, 1, -1, 2],
        ignoreArrayIndexes: true,
        enforceConst: true,
        detectObjects: false,
        ignoreDefaultValues: true,
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      // Regras específicas para arquivos de estilo
      files: ['**/styles.js', '**/*.styles.js', '**/theme/**/*.js'],
      rules: {
        'no-magic-numbers': 'off', // Permitir em arquivos de tema
      },
    },
    {
      // Regras específicas para testes
      files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-magic-numbers': 'off',
        'react-native/no-inline-styles': 'off',
      },
    },
  ],
};
