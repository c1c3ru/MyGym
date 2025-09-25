import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para debounce de valores
 * Útil para otimizar buscas e evitar muitas chamadas de API
 * 
 * @param {any} value - Valor a ser debounced
 * @param {number} delay - Delay em millisegundos (padrão: 300ms)
 * @returns {any} - Valor debounced
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Criar timer para atualizar o valor após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpar timer se o valor mudar antes do delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para debounce de callbacks
 * Útil para otimizar funções que são chamadas frequentemente
 * 
 * @param {Function} callback - Função a ser debounced
 * @param {number} delay - Delay em millisegundos (padrão: 300ms)
 * @param {Array} deps - Dependências do useCallback
 * @returns {Function} - Função debounced
 */
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return debouncedCallback;
};

export default useDebounce;
