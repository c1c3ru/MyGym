import { useCallback, useRef } from 'react';
import { Logger } from '@utils/logger';

/**
 * Hook para medir performance de operações
 * Segue as melhores práticas de React Native
 */
export const usePerformance = () => {
  const timers = useRef(new Map());

  const startTimer = useCallback((operation) => {
    const startTime = Date.now();
    timers.current.set(operation, startTime);
    Logger.debug(`Performance timer started: ${operation}`);
  }, []);

  const endTimer = useCallback((operation) => {
    const startTime = timers.current.get(operation);
    if (!startTime) {
      Logger.warn(`No timer found for operation: ${operation}`);
      return null;
    }

    const duration = Date.now() - startTime;
    timers.current.delete(operation);
    
    Logger.performance(operation, duration);
    
    // Alertar sobre operações lentas
    if (duration > 1000) {
      Logger.warn(`Slow operation detected: ${operation} took ${duration}ms`);
    }

    return duration;
  }, []);

  const measureAsync = useCallback(async (operation, asyncFunction) => {
    startTimer(operation);
    try {
      const result = await asyncFunction();
      endTimer(operation);
      return result;
    } catch (error) {
      endTimer(operation);
      Logger.errorWithContext(error, { operation });
      throw error;
    }
  }, [startTimer, endTimer]);

  const measureSync = useCallback((operation, syncFunction) => {
    startTimer(operation);
    try {
      const result = syncFunction();
      endTimer(operation);
      return result;
    } catch (error) {
      endTimer(operation);
      Logger.errorWithContext(error, { operation });
      throw error;
    }
  }, [startTimer, endTimer]);

  return {
    startTimer,
    endTimer,
    measureAsync,
    measureSync,
  };
};

export default usePerformance;
