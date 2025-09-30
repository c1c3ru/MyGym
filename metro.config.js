const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  server: {
    port: 5000,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return middleware(req, res, next);
      };
    },
  },
  resolver: {
    ...config.resolver,
    sourceExts: [...config.resolver.sourceExts, 'cjs'],
  },
};
