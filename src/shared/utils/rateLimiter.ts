/**
 * Sistema de Rate Limiting para ações críticas
 * Previne spam e abuso de funcionalidades sensíveis
 */

type LimitConfig = {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  message: string;
  skipSuccessfulAttempts?: boolean;
  progressive?: boolean;
};

type Attempt = { timestamp: number; success: boolean };
type BlockInfo = { blockedAt: number; unblockAt: number; blockCount: number };

type CanExecuteAllowed = { allowed: true; remainingAttempts: number; windowMs: number };
type CanExecuteBlocked = { allowed: false; reason: 'blocked'; message: string; retryAfter: number; unblockAt: string };
type CanExecuteExceeded = { allowed: false; reason: 'rate_limit_exceeded'; message: string; retryAfter: number; attempts: number; maxAttempts: number };
type CanExecuteResult = CanExecuteAllowed | CanExecuteBlocked | CanExecuteExceeded | { allowed: true };

class RateLimiter {
  private limits: Map<string, LimitConfig>;
  private attempts: Map<string, Attempt[]>;
  private blockedUsers: Map<string, BlockInfo>;
  private cleanupInterval: ReturnType<typeof setInterval> | null;

  constructor() {
    this.limits = new Map();
    this.attempts = new Map();
    this.blockedUsers = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Define limite para uma ação específica
   * @param {string} action - Nome da ação
   * @param {Object} config - Configuração do limite
   */
  setLimit(action: string, config: Partial<LimitConfig>) {
    const defaultConfig: LimitConfig = {
      maxAttempts: 5,
      windowMs: 60000, // 1 minuto
      blockDurationMs: 300000, // 5 minutos
      message: 'Muitas tentativas. Tente novamente mais tarde.',
      skipSuccessfulAttempts: true,
      progressive: false // Aumentar tempo de bloqueio progressivamente
    };

    this.limits.set(action, { ...defaultConfig, ...config });
  }

  /**
   * Verifica se uma ação pode ser executada
   * @param {string} action - Nome da ação
   * @param {string} identifier - Identificador único (userId, IP, etc.)
   * @returns {Object} Resultado da verificação
   */
  canExecute(action: string, identifier: string): CanExecuteResult {
    const key = `${action}:${identifier}`;
    const limit = this.limits.get(action);

    if (!limit) {
      // Se não há limite definido, permitir
      return { allowed: true };
    }

    // Verificar se está bloqueado
    const blockInfo = this.blockedUsers.get(key);
    if (blockInfo && Date.now() < blockInfo.unblockAt) {
      return {
        allowed: false,
        reason: 'blocked',
        message: limit.message,
        retryAfter: blockInfo.unblockAt - Date.now(),
        unblockAt: new Date(blockInfo.unblockAt).toLocaleTimeString()
      };
    }

    // Se estava bloqueado mas o tempo passou, remover bloqueio
    if (blockInfo && Date.now() >= blockInfo.unblockAt) {
      this.blockedUsers.delete(key);
    }

    // Verificar tentativas na janela atual
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filtrar tentativas dentro da janela de tempo
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < limit.windowMs
    );

    // Verificar se excedeu o limite
    if (recentAttempts.length >= limit.maxAttempts) {
      this.blockUser(key, limit);
      return {
        allowed: false,
        reason: 'rate_limit_exceeded',
        message: limit.message,
        retryAfter: limit.blockDurationMs,
        attempts: recentAttempts.length,
        maxAttempts: limit.maxAttempts
      };
    }

    return {
      allowed: true,
      remainingAttempts: limit.maxAttempts - recentAttempts.length,
      windowMs: limit.windowMs
    };
  }

  /**
   * Registra uma tentativa de execução
   * @param {string} action - Nome da ação
   * @param {string} identifier - Identificador único
   * @param {boolean} success - Se a tentativa foi bem-sucedida
   */
  recordAttempt(action: string, identifier: string, success: boolean = false) {
    const key = `${action}:${identifier}`;
    const limit = this.limits.get(action);

    if (!limit) return;

    // Se configurado para pular tentativas bem-sucedidas
    if (success && limit.skipSuccessfulAttempts) {
      this.clearAttempts(key);
      return;
    }

    const attempts = this.attempts.get(key) || [];
    attempts.push({ timestamp: Date.now(), success });

    this.attempts.set(key, attempts);
  }

  /**
   * Bloqueia um usuário
   * @param {string} key - Chave única
   * @param {Object} limit - Configuração do limite
   */
  blockUser(key: string, limit: LimitConfig) {
    const blockDuration = limit.progressive 
      ? this.calculateProgressiveBlock(key, limit.blockDurationMs)
      : limit.blockDurationMs;

    this.blockedUsers.set(key, {
      blockedAt: Date.now(),
      unblockAt: Date.now() + blockDuration,
      blockCount: (this.blockedUsers.get(key)?.blockCount || 0) + 1
    });

    console.warn(`🚫 Usuário bloqueado: ${key} por ${blockDuration}ms`);
  }

  /**
   * Calcula bloqueio progressivo
   * @param {string} key - Chave única
   * @param {number} baseDuration - Duração base
   * @returns {number} Duração calculada
   */
  calculateProgressiveBlock(key: string, baseDuration: number): number {
    const blockInfo = this.blockedUsers.get(key);
    const blockCount = blockInfo?.blockCount || 0;
    
    // Aumentar exponencialmente: 1x, 2x, 4x, 8x...
    const multiplier = Math.pow(2, blockCount);
    const maxMultiplier = 16; // Máximo 16x
    
    return baseDuration * Math.min(multiplier, maxMultiplier);
  }

  /**
   * Limpa tentativas para uma chave
   * @param {string} key - Chave única
   */
  clearAttempts(key: string) {
    this.attempts.delete(key);
  }

  /**
   * Remove bloqueio de um usuário
   * @param {string} action - Nome da ação
   * @param {string} identifier - Identificador único
   */
  unblock(action: string, identifier: string) {
    const key = `${action}:${identifier}`;
    this.blockedUsers.delete(key);
    this.clearAttempts(key);
  }

  /**
   * Obtém informações sobre o status de rate limiting
   * @param {string} action - Nome da ação
   * @param {string} identifier - Identificador único
   * @returns {Object} Informações de status
   */
  getStatus(action: string, identifier: string) {
    const key = `${action}:${identifier}`;
    const limit = this.limits.get(action);
    
    if (!limit) {
      return { hasLimit: false };
    }

    const blockInfo = this.blockedUsers.get(key);
    const attempts = this.attempts.get(key) || [];
    const now = Date.now();
    
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < limit.windowMs
    );

    return {
      hasLimit: true,
      isBlocked: !!(blockInfo && now < blockInfo.unblockAt),
      attempts: recentAttempts.length,
      maxAttempts: limit.maxAttempts,
      remainingAttempts: Math.max(0, limit.maxAttempts - recentAttempts.length),
      windowMs: limit.windowMs,
      blockInfo: blockInfo ? {
        unblockAt: blockInfo.unblockAt,
        timeRemaining: Math.max(0, blockInfo.unblockAt - now),
        blockCount: blockInfo.blockCount
      } : null
    };
  }

  /**
   * Inicia limpeza automática de dados expirados
   */
  startCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Limpar a cada minuto
  }

  /**
   * Remove dados expirados
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    // Limpar bloqueios expirados
    for (const [key, blockInfo] of this.blockedUsers.entries()) {
      if (now >= blockInfo.unblockAt) {
        this.blockedUsers.delete(key);
        cleanedCount++;
      }
    }

    // Limpar tentativas antigas
    for (const [key, attempts] of this.attempts.entries()) {
      const action = key.split(':')[0];
      const limit = this.limits.get(action);
      
      if (limit) {
        const recentAttempts = attempts.filter(
          attempt => now - attempt.timestamp < limit.windowMs * 2 // Manter por 2x a janela
        );
        
        if (recentAttempts.length !== attempts.length) {
          if (recentAttempts.length === 0) {
            this.attempts.delete(key);
          } else {
            this.attempts.set(key, recentAttempts);
          }
          cleanedCount++;
        }
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Rate limiter cleanup: ${cleanedCount} itens removidos`);
    }
  }

  /**
   * Obtém estatísticas gerais
   */
  getStats() {
    return {
      totalLimits: this.limits.size,
      activeAttempts: this.attempts.size,
      blockedUsers: this.blockedUsers.size,
      limits: Array.from(this.limits.keys())
    };
  }

  /**
   * Para o rate limiter
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.limits.clear();
    this.attempts.clear();
    this.blockedUsers.clear();
  }
}

// Instância singleton
const rateLimiter = new RateLimiter();

// Configurar limites padrão para ações críticas
rateLimiter.setLimit('login', {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutos
  blockDurationMs: 30 * 60 * 1000, // 30 minutos
  message: 'Muitas tentativas de login. Tente novamente em 30 minutos.',
  progressive: true
});

rateLimiter.setLimit('password_reset', {
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hora
  blockDurationMs: 60 * 60 * 1000, // 1 hora
  message: 'Muitas solicitações de redefinição de senha. Tente novamente em 1 hora.'
});

rateLimiter.setLimit('create_student', {
  maxAttempts: 10,
  windowMs: 60 * 1000, // 1 minuto
  blockDurationMs: 5 * 60 * 1000, // 5 minutos
  message: 'Muitas criações de alunos. Aguarde 5 minutos.',
  skipSuccessfulAttempts: true
});

rateLimiter.setLimit('send_notification', {
  maxAttempts: 20,
  windowMs: 60 * 1000, // 1 minuto
  blockDurationMs: 10 * 60 * 1000, // 10 minutos
  message: 'Muitas notificações enviadas. Aguarde 10 minutos.'
});

rateLimiter.setLimit('payment_creation', {
  maxAttempts: 5,
  windowMs: 60 * 1000, // 1 minuto
  blockDurationMs: 5 * 60 * 1000, // 5 minutos
  message: 'Muitas criações de pagamento. Aguarde 5 minutos.',
  skipSuccessfulAttempts: true
});

rateLimiter.setLimit('class_creation', {
  maxAttempts: 15,
  windowMs: 60 * 1000, // 1 minuto
  blockDurationMs: 5 * 60 * 1000, // 5 minutos
  message: 'Muitas criações de turma. Aguarde 5 minutos.',
  skipSuccessfulAttempts: true
});

rateLimiter.setLimit('api_request', {
  maxAttempts: 100,
  windowMs: 60 * 1000, // 1 minuto
  blockDurationMs: 2 * 60 * 1000, // 2 minutos
  message: 'Muitas requisições. Aguarde 2 minutos.'
});

export default rateLimiter;
