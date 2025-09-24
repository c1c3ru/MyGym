import { useState, useEffect } from 'react';

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
  const [timeoutId, setTimeoutId] = useState(null);

  const debouncedCallback = (...args) => {
    // Limpar timeout anterior se existir
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Criar novo timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  // Limpar timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
};

export default useDebounce;
