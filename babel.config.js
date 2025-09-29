module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Module resolver for import aliases
      ['module-resolver', {
        root: ['./src'],
        alias: {
          '@': './src',
          '@presentation': './src/presentation',
          '@data': './src/data',
          '@infrastructure': './src/infrastructure',
          '@components': './src/presentation/components',
          '@screens': './src/presentation/screens',
          '@hooks': './src/presentation/hooks',
          '@contexts': './src/presentation/contexts',
          '@navigation': './src/presentation/navigation',
          '@services': './src/services',
          '@utils': './src/shared/utils',
          '@assets': './assets',
          '@domain': './src/domain',
          '@features': './src/features',
          '@auth': './src/presentation/auth'
        }
      }],
      // Transform import.meta to prevent syntax errors
      ['babel-plugin-transform-define', {
        'import.meta.url': 'typeof window !== "undefined" ? window.location.href : "file:///"',
        'import.meta.env': 'typeof process !== "undefined" ? process.env : {}',
        'import.meta': '{ url: typeof window !== "undefined" ? window.location.href : "file:///", env: typeof process !== "undefined" ? process.env : {} }'
      }]
    ],
    env: {
      web: {
        plugins: [
          ['babel-plugin-transform-define', {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'typeof process': JSON.stringify('undefined'),
            '__DEV__': process.env.NODE_ENV !== 'production',
            'import.meta.url': 'typeof window !== "undefined" ? window.location.href : "file:///"',
            'import.meta.env': 'typeof process !== "undefined" ? process.env : {}',
            'import.meta': '{ url: typeof window !== "undefined" ? window.location.href : "file:///", env: typeof process !== "undefined" ? process.env : {} }'
          }]
        ]
      }
    }
  };
};
