module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
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

    // 🎨 REGRAS PARA DESIGN TOKENS - PREVENIR VALORES HARDCODED
    'no-restricted-syntax': [
      'error',
      // Cores hexadecimais hardcoded
      {
        selector: "Literal[value=/#[0-9A-Fa-f]{3,6}/]",
        message: '🎨 Evite cores hardcoded. Use COLORS do @presentation/theme/designTokens',
      },
      {
        selector: "TemplateLiteral[quasis.0.value.raw=/#[0-9A-Fa-f]{3,6}/]",
        message: '🎨 Evite cores hardcoded. Use COLORS do @presentation/theme/designTokens',
      },
      // Cores RGB/RGBA hardcoded
      {
        selector: "Literal[value=/rgba?\\(/]",
        message: '🎨 Evite cores RGB hardcoded. Use COLORS do @presentation/theme/designTokens',
      },
      // FontSize hardcoded em objetos de estilo
      {
        selector: "Property[key.name='fontSize'] > Literal[value=/^[0-9]+$/]",
        message: '📝 Use FONT_SIZE do @presentation/theme/designTokens em vez de números',
      },
      // FontWeight hardcoded
      {
        selector: "Property[key.name='fontWeight'] > Literal[value=/^[0-9]+$/]",
        message: '📝 Use FONT_WEIGHT do @presentation/theme/designTokens em vez de números',
      },
      // Spacing hardcoded (margin, padding, etc.)
      {
        selector: "Property[key.name=/^(margin|padding|gap|top|bottom|left|right)$/] > Literal[value=/^[0-9]+$/]",
        message: '📏 Use SPACING do @presentation/theme/designTokens em vez de números',
      },
      // BorderRadius hardcoded
      {
        selector: "Property[key.name='borderRadius'] > Literal[value=/^[0-9]+$/]",
        message: '🔲 Use BORDER_RADIUS do @presentation/theme/designTokens em vez de números',
      },
      // Elevation hardcoded
      {
        selector: "Property[key.name='elevation'] > Literal[value=/^[0-9]+$/]",
        message: '📦 Use ELEVATION do @presentation/theme/designTokens em vez de números',
      },
    ],

    // 🌍 REGRAS PARA INTERNACIONALIZAÇÃO (i18n)
    'no-restricted-globals': [
      'error',
      {
        name: 'alert',
        message: '🌍 Use Alert.alert() do React Native e getString() para mensagens',
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
      // TypeScript files
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      },
    },
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
