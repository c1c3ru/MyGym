/**
 * Serviço de Rate Limiting para controlar tentativas de operações
 * Previne spam e ataques de força bruta
 */
class RateLimitService {
  constructor() {
    this.attempts = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Verifica se uma operação pode ser executada baseado no rate limit
   * @param {string} key - Chave única para identificar a operação
   * @param {number} maxAttempts - Número máximo de tentativas permitidas
   * @param {number} windowMs - Janela de tempo em milissegundos
   * @returns {boolean} - true se a operação pode ser executada
   */
  checkLimit(key, maxAttempts = 5, windowMs = 300000) { // 5 tentativas por 5 minutos por padrão
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filtrar tentativas dentro da janela de tempo
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    // Verificar se excedeu o limite
    if (validAttempts.length >= maxAttempts) {
      console.warn(`Rate limit excedido para ${key}: ${validAttempts.length}/${maxAttempts} tentativas`);
      return false;
    }
    
    // Adicionar nova tentativa
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }

  /**
   * Reseta o rate limit para uma chave específica
   * @param {string} key - Chave para resetar
   */
  resetLimit(key) {
    this.attempts.delete(key);
    console.log(`Rate limit resetado para ${key}`);
  }

  /**
   * Obtém o número de tentativas restantes
   * @param {string} key - Chave para verificar
   * @param {number} maxAttempts - Número máximo de tentativas
   * @param {number} windowMs - Janela de tempo em milissegundos
   * @returns {number} - Número de tentativas restantes
   */
  getRemainingAttempts(key, maxAttempts = 5, windowMs = 300000) {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    return Math.max(0, maxAttempts - validAttempts.length);
  }

  /**
   * Obtém o tempo até a próxima tentativa disponível
   * @param {string} key - Chave para verificar
   * @param {number} windowMs - Janela de tempo em milissegundos
   * @returns {number} - Tempo em milissegundos até a próxima tentativa
   */
  getTimeUntilReset(key, windowMs = 300000) {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const timeUntilReset = windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, timeUntilReset);
  }

  /**
   * Limpa tentativas antigas automaticamente
   */
  startCleanup() {
    // Limpar a cada 10 minutos
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const maxAge = 600000; // 10 minutos
      
      for (const [key, attempts] of this.attempts.entries()) {
        const validAttempts = attempts.filter(timestamp => now - timestamp < maxAge);
        
        if (validAttempts.length === 0) {
          this.attempts.delete(key);
        } else {
          this.attempts.set(key, validAttempts);
        }
      }
    }, 600000); // 10 minutos
  }

  /**
   * Para o cleanup automático
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Limpa todos os rate limits
   */
  clearAll() {
    this.attempts.clear();
    console.log('Todos os rate limits foram limpos');
  }

  /**
   * Obtém estatísticas do rate limiting
   * @returns {Object} - Estatísticas
   */
  getStats() {
    const totalKeys = this.attempts.size;
    let totalAttempts = 0;
    
    for (const attempts of this.attempts.values()) {
      totalAttempts += attempts.length;
    }
    
    return {
      totalKeys,
      totalAttempts,
      averageAttemptsPerKey: totalKeys > 0 ? totalAttempts / totalKeys : 0
    };
  }
}

// Instância singleton
const rateLimitService = new RateLimitService();

export { rateLimitService };
export default rateLimitService;
