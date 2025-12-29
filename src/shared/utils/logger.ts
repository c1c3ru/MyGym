import { logger, configLoggerType, consoleTransport } from 'react-native-logs';
import { Platform } from 'react-native';

/**
 * Níveis de log disponíveis
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Contexto adicional para logs
 */
export interface LogContext {
  userId?: string;
  academiaId?: string;
  screen?: string;
  action?: string;
  [key: string]: any;
}

/**
 * Configuração do logger
 */
const defaultConfig: configLoggerType<typeof consoleTransport, 'error' | 'info' | 'debug' | 'warn'> = {
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

/**
 * Sistema centralizado de logging
 * 
 * Funcionalidades:
 * - Logs contextuais com informações do usuário
 * - Integração com serviços de monitoramento
 * - Filtros por nível e contexto
 * - Performance tracking
 * - Error tracking com stack traces
 */
class LoggerService {
  private logHistory: Array<{ level: LogLevel; message: string; context?: LogContext; timestamp: Date }> = [];
  private maxHistorySize = 100;
  private enabled = true;

  /**
   * Habilitar/desabilitar logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Log de debug
   */
  debug(message: string, context?: LogContext): void {
    if (!this.enabled) return;
    this.addToHistory(LogLevel.DEBUG, message, context);
    log.debug(this.formatMessage(message, context), context);
  }

  /**
   * Log de informação
   */
  info(message: string, context?: LogContext): void {
    if (!this.enabled) return;
    this.addToHistory(LogLevel.INFO, message, context);
    log.info(this.formatMessage(message, context), context);
  }

  /**
   * Log de aviso
   */
  warn(message: string, context?: LogContext): void {
    if (!this.enabled) return;
    this.addToHistory(LogLevel.WARN, message, context);
    log.warn(this.formatMessage(message, context), context);
  }

  /**
   * Log de erro
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.enabled) return;
    
    const errorContext: LogContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    };

    this.addToHistory(LogLevel.ERROR, message, errorContext);
    log.error(this.formatMessage(message, errorContext), errorContext);
    
    // Em produção, enviar para serviço de monitoramento
    if (!__DEV__) {
      this.reportError(message, error, errorContext);
    }
  }

  /**
   * Logs contextuais por módulo
   */
  auth(message: string, context?: LogContext): void {
    this.info(`[AUTH] ${message}`, context);
  }

  api(message: string, context?: LogContext): void {
    this.info(`[API] ${message}`, context);
  }

  navigation(message: string, context?: LogContext): void {
    this.debug(`[NAV] ${message}`, context);
  }

  firebase(message: string, context?: LogContext): void {
    this.info(`[FIREBASE] ${message}`, context);
  }

  firestore(operation: string, collection: string, context?: LogContext): void {
    this.debug(`[FIRESTORE] ${operation} on ${collection}`, context);
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, context?: LogContext): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO;
    const message = `[PERFORMANCE] ${operation} took ${duration}ms`;
    
    if (level === LogLevel.WARN) {
      this.warn(message, context);
    } else {
      this.info(message, context);
    }
  }

  /**
   * Log de erro com contexto completo
   */
  errorWithContext(error: Error, context: LogContext = {}): void {
    this.error(error.message, error, {
      ...context,
      componentStack: (context as any).componentStack,
      errorBoundary: (context as any).errorBoundary,
    });
  }

  /**
   * Log de evento de negócio
   */
  businessEvent(event: string, data: Record<string, any>, context?: LogContext): void {
    this.info(`[BUSINESS] ${event}`, {
      ...context,
      eventData: data,
    });
  }

  /**
   * Obter histórico de logs
   */
  getHistory(level?: LogLevel, limit?: number): Array<{ level: LogLevel; message: string; context?: LogContext; timestamp: Date }> {
    let history = this.logHistory;
    
    if (level) {
      history = history.filter(log => log.level === level);
    }
    
    if (limit) {
      history = history.slice(-limit);
    }
    
    return history;
  }

  /**
   * Limpar histórico
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Exportar logs para análise
   */
  exportLogs(): string {
    return JSON.stringify({
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
      logs: this.logHistory,
    }, null, 2);
  }

  /**
   * Formatar mensagem com contexto
   */
  private formatMessage(message: string, context?: LogContext): string {
    if (!context) return message;
    
    const contextParts: string[] = [];
    if (context.userId) contextParts.push(`user:${context.userId}`);
    if (context.academiaId) contextParts.push(`academia:${context.academiaId}`);
    if (context.screen) contextParts.push(`screen:${context.screen}`);
    if (context.action) contextParts.push(`action:${context.action}`);
    
    return contextParts.length > 0 
      ? `${message} [${contextParts.join(', ')}]`
      : message;
  }

  /**
   * Adicionar ao histórico
   */
  private addToHistory(level: LogLevel, message: string, context?: LogContext): void {
    this.logHistory.push({
      level,
      message,
      context,
      timestamp: new Date(),
    });

    // Limitar tamanho do histórico
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Reportar erro para serviço de monitoramento
   */
  private reportError(message: string, error: Error | unknown, context?: LogContext): void {
    // TODO: Integrar com Sentry, Firebase Crashlytics, etc.
    // Por enquanto, apenas log estruturado
    if (error instanceof Error) {
      console.error('[ERROR_REPORT]', {
        message,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Exportar instância singleton
export const Logger = new LoggerService();

// Exportar métodos para compatibilidade com código existente
export default {
  debug: (message: string, ...args: any[]) => Logger.debug(message, args[0]),
  info: (message: string, ...args: any[]) => Logger.info(message, args[0]),
  warn: (message: string, ...args: any[]) => Logger.warn(message, args[0]),
  error: (message: string, ...args: any[]) => Logger.error(message, args[0]),
  auth: (message: string, ...args: any[]) => Logger.auth(message, args[0]),
  api: (message: string, ...args: any[]) => Logger.api(message, args[0]),
  navigation: (message: string, ...args: any[]) => Logger.navigation(message, args[0]),
  firebase: (message: string, ...args: any[]) => Logger.firebase(message, args[0]),
  performance: (operation: string, duration: number) => Logger.performance(operation, duration),
  errorWithContext: (error: Error, context?: LogContext) => Logger.errorWithContext(error, context),
};

