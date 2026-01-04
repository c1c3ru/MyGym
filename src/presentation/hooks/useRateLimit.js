import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import rateLimiter from '@utils/rateLimiter';
import { useAuthFacade } from '@presentation/auth/AuthFacade';

/**
 * Hook para usar rate limiting em componentes
 */
export const useRateLimit = (action, options = {}) => {
  const { user } = useAuthFacade();
  const {
    showAlert = true,
    identifier = user?.uid || 'anonymous',
    onBlocked = null,
    onAllowed = null
  } = options;

  const [isBlocked, setIsBlocked] = useState(false);
  const [status, setStatus] = useState(null);

  // Atualizar status do rate limit
  const updateStatus = useCallback(() => {
    const currentStatus = rateLimiter.getStatus(action, identifier);
    setStatus(currentStatus);
    setIsBlocked(currentStatus.isBlocked || false);
  }, [action, identifier]);

  // Verificar se pode executar ação
  const canExecute = useCallback(() => {
    const result = rateLimiter.canExecute(action, identifier);
    updateStatus();

    if (!result.allowed) {
      if (showAlert) {
        Alert.alert(
          getString('actionBlocked'),
          result.message,
          [{ text: getString('ok') }]
        );
      }
      
      if (onBlocked) {
        onBlocked(result);
      }
    } else {
      if (onAllowed) {
        onAllowed(result);
      }
    }

    return result;
  }, [action, identifier, showAlert, onBlocked, onAllowed, updateStatus]);

  // Executar ação com rate limiting
  const executeWithLimit = useCallback(async (actionFunction, recordSuccess = true) => {
    const check = canExecute();
    
    if (!check.allowed) {
      return { success: false, blocked: true, reason: check.reason };
    }

    try {
      const result = await actionFunction();
      
      if (recordSuccess) {
        rateLimiter.recordAttempt(action, identifier, true);
      }
      
      updateStatus();
      return { success: true, result };
    } catch (error) {
      rateLimiter.recordAttempt(action, identifier, false);
      updateStatus();
      throw error;
    }
  }, [canExecute, action, identifier, updateStatus]);

  // Registrar tentativa manualmente
  const recordAttempt = useCallback((success = false) => {
    rateLimiter.recordAttempt(action, identifier, success);
    updateStatus();
  }, [action, identifier, updateStatus]);

  // Limpar tentativas
  const clearAttempts = useCallback(() => {
    rateLimiter.clearAttempts(`${action}:${identifier}`);
    updateStatus();
  }, [action, identifier, updateStatus]);

  // Remover bloqueio
  const unblock = useCallback(() => {
    rateLimiter.unblock(action, identifier);
    updateStatus();
  }, [action, identifier, updateStatus]);

  // Atualizar status na montagem
  useEffect(() => {
    updateStatus();
  }, [updateStatus]);

  return {
    isBlocked,
    status,
    canExecute,
    executeWithLimit,
    recordAttempt,
    clearAttempts,
    unblock,
    updateStatus
  };
};

/**
 * Hook específico para ações de login
 */
export const useLoginRateLimit = (options = {}) => {
  return useRateLimit('login', {
    identifier: options.email || 'anonymous',
    ...options
  });
};

/**
 * Hook específico para criação de estudantes
 */
export const useStudentCreationRateLimit = (options = {}) => {
  return useRateLimit('create_student', options);
};

/**
 * Hook específico para criação de pagamentos
 */
export const usePaymentCreationRateLimit = (options = {}) => {
  return useRateLimit('payment_creation', options);
};

/**
 * Hook específico para criação de turmas
 */
export const useClassCreationRateLimit = (options = {}) => {
  return useRateLimit('class_creation', options);
};

/**
 * Hook específico para envio de notificações
 */
export const useNotificationRateLimit = (options = {}) => {
  return useRateLimit('send_notification', options);
};

/**
 * Hook específico para reset de senha
 */
export const usePasswordResetRateLimit = (options = {}) => {
  return useRateLimit('password_reset', {
    identifier: options.email || 'anonymous',
    ...options
  });
};

/**
 * Hook específico para requisições de API
 */
export const useApiRateLimit = (options = {}) => {
  return useRateLimit('api_request', options);
};

export default useRateLimit;
