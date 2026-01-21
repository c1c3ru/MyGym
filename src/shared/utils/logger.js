import { logger, consoleTransport } from 'react-native-logs';

const defaultConfig = {
  severity: __DEV__ ? 'debug' : 'error',
  transport: __DEV__ ? consoleTransport : undefined,
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
  },
};

const log = logger.createLogger(defaultConfig);

// Wrapper para facilitar o uso
export const Logger = {
  debug: (message, ...args) => log.debug(message, ...args),
  info: (message, ...args) => log.info(message, ...args),
  warn: (message, ...args) => log.warn(message, ...args),
  error: (message, ...args) => log.error(message, ...args),
  
  // Métodos específicos para diferentes contextos
  auth: (message, ...args) => log.info(`[AUTH] ${message}`, ...args),
  api: (message, ...args) => log.info(`[API] ${message}`, ...args),
  navigation: (message, ...args) => log.debug(`[NAV] ${message}`, ...args),
  firebase: (message, ...args) => log.info(`[FIREBASE] ${message}`, ...args),
  
  // Log de performance
  performance: (operation, duration) => {
    log.info(`[PERFORMANCE] ${operation} took ${duration}ms`);
  },
  
  // Log de erros com contexto
  errorWithContext: (error, context = {}) => {
    log.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      context,
    });
  },
};

export default Logger;
