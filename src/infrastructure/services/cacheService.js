import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Serviço de cache inteligente para dados frequentemente acessados
 * Suporta TTL, invalidação automática e estratégias de cache
 */
class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
    this.maxMemoryItems = 100;
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos
    this.cleanupInterval = null;
    this.startCleanupTimer();
  }

  /**
   * Gera chave de cache baseada nos parâmetros
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Obtém dados do cache (memória primeiro, depois AsyncStorage)
   */
  async get(key) {
    try {
      // Verificar cache em memória primeiro
      const memoryItem = this.memoryCache.get(key);
      if (memoryItem && !this.isExpired(memoryItem)) {
        this.cacheStats.hits++;
        return memoryItem.data;
      }

      // Se não encontrou na memória, verificar AsyncStorage
      const storageItem = await AsyncStorage.getItem(key);
      if (storageItem) {
        const parsed = JSON.parse(storageItem);
        if (!this.isExpired(parsed)) {
          // Promover para cache em memória
          this.setMemoryCache(key, parsed.data, parsed.expiresAt);
          this.cacheStats.hits++;
          return parsed.data;
        } else {
          // Item expirado, remover
          await this.remove(key);
        }
      }

      this.cacheStats.misses++;
      return null;
    } catch (error) {
      console.error('Erro ao obter do cache:', error);
      this.cacheStats.misses++;
      return null;
    }
  }

  /**
   * Armazena dados no cache
   */
  async set(key, data, ttl = this.defaultTTL, strategy = 'memory-first') {
    try {
      const expiresAt = Date.now() + ttl;
      const cacheItem = {
        data,
        expiresAt,
        createdAt: Date.now(),
        accessCount: 0
      };

      this.cacheStats.sets++;

      switch (strategy) {
        case 'memory-only':
          this.setMemoryCache(key, data, expiresAt);
          break;
        
        case 'storage-only':
          await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
          break;
        
        case 'memory-first':
        default:
          // Armazenar em memória e AsyncStorage
          this.setMemoryCache(key, data, expiresAt);
          await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
          break;
      }

      return true;
    } catch (error) {
      console.error('Erro ao armazenar no cache:', error);
      return false;
    }
  }

  /**
   * Remove item do cache
   */
  async remove(key) {
    try {
      this.memoryCache.delete(key);
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erro ao remover do cache:', error);
      return false;
    }
  }

  /**
   * Limpa todo o cache
   */
  async clear() {
    try {
      this.memoryCache.clear();
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.includes(':'));
      await AsyncStorage.multiRemove(cacheKeys);
      this.resetStats();
      return true;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  }

  /**
   * Invalida cache por padrão de chave
   */
  async invalidatePattern(pattern) {
    try {
      // Invalidar cache em memória
      const memoryKeys = Array.from(this.memoryCache.keys());
      memoryKeys.forEach(key => {
        if (key.includes(pattern)) {
          this.memoryCache.delete(key);
        }
      });

      // Invalidar AsyncStorage
      const storageKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = storageKeys.filter(key => key.includes(pattern));
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }

      console.log(`🗑️ Cache invalidado para padrão: ${pattern} (${keysToRemove.length} itens)`);
      return keysToRemove.length;
    } catch (error) {
      console.error('Erro ao invalidar cache por padrão:', error);
      return 0;
    }
  }

  /**
   * Cache com fallback para função de busca
   */
  async getOrSet(key, fetchFunction, ttl = this.defaultTTL, strategy = 'memory-first') {
    try {
      // Tentar obter do cache primeiro
      const cachedData = await this.get(key);
      if (cachedData !== null) {
        return cachedData;
      }

      // Se não encontrou no cache, executar função de busca
      console.log(`🔄 Cache miss para ${key}, buscando dados...`);
      const freshData = await fetchFunction();
      
      if (freshData !== null && freshData !== undefined) {
        await this.set(key, freshData, ttl, strategy);
      }

      return freshData;
    } catch (error) {
      console.error('Erro no getOrSet:', error);
      // Em caso de erro, tentar executar a função de busca diretamente
      try {
        return await fetchFunction();
      } catch (fetchError) {
        console.error('Erro na função de busca:', fetchError);
        return null;
      }
    }
  }

  /**
   * Cache com refresh em background
   */
  async getWithBackgroundRefresh(key, fetchFunction, ttl = this.defaultTTL, refreshThreshold = 0.8) {
    try {
      const cachedData = await this.get(key);
      
      if (cachedData !== null) {
        // Verificar se precisa de refresh em background
        const memoryItem = this.memoryCache.get(key);
        if (memoryItem) {
          const age = Date.now() - memoryItem.createdAt;
          const refreshTime = ttl * refreshThreshold;
          
          if (age > refreshTime) {
            // Refresh em background sem bloquear
            setTimeout(async () => {
              try {
                const freshData = await fetchFunction();
                if (freshData !== null) {
                  await this.set(key, freshData, ttl);
                  console.log(`🔄 Background refresh concluído para ${key}`);
                }
              } catch (error) {
                console.error('Erro no background refresh:', error);
              }
            }, 0);
          }
        }
        
        return cachedData;
      }

      // Cache miss, buscar dados
      return await this.getOrSet(key, fetchFunction, ttl);
    } catch (error) {
      console.error('Erro no getWithBackgroundRefresh:', error);
      return await fetchFunction();
    }
  }

  /**
   * Armazena em cache de memória com controle de tamanho
   */
  setMemoryCache(key, data, expiresAt) {
    // Se atingiu o limite, remover item mais antigo
    if (this.memoryCache.size >= this.maxMemoryItems) {
      const oldestKey = this.findOldestKey();
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
        this.cacheStats.evictions++;
      }
    }

    this.memoryCache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now(),
      accessCount: 0
    });
  }

  /**
   * Encontra a chave mais antiga no cache de memória
   */
  findOldestKey() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, item] of this.memoryCache.entries()) {
      if (item.createdAt < oldestTime) {
        oldestTime = item.createdAt;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Verifica se um item do cache expirou
   */
  isExpired(item) {
    return Date.now() > item.expiresAt;
  }

  /**
   * Inicia timer de limpeza automática
   */
  startCleanupTimer() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredItems();
    }, 60000); // Limpar a cada minuto
  }

  /**
   * Remove itens expirados do cache
   */
  async cleanupExpiredItems() {
    try {
      let cleanedCount = 0;

      // Limpar cache em memória
      for (const [key, item] of this.memoryCache.entries()) {
        if (this.isExpired(item)) {
          this.memoryCache.delete(key);
          cleanedCount++;
        }
      }

      // Limpar AsyncStorage (amostragem para performance)
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.includes(':')).slice(0, 50); // Limitar a 50 itens por vez
      
      for (const key of cacheKeys) {
        try {
          const item = await AsyncStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (this.isExpired(parsed)) {
              await AsyncStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          // Item corrompido, remover
          await AsyncStorage.removeItem(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Limpeza de cache: ${cleanedCount} itens expirados removidos`);
      }
    } catch (error) {
      console.error('Erro na limpeza de cache:', error);
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const hitRate = this.cacheStats.hits + this.cacheStats.misses > 0 
      ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      memorySize: this.memoryCache.size,
      maxMemorySize: this.maxMemoryItems
    };
  }

  /**
   * Reseta estatísticas
   */
  resetStats() {
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
  }

  /**
   * Para o serviço de cache
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.memoryCache.clear();
  }
}

// Instância singleton
const cacheService = new CacheService();

// Chaves de cache pré-definidas para dados comuns
export const CACHE_KEYS = {
  STUDENTS: (academiaId) => `students:${academiaId}`,
  CLASSES: (academiaId) => `classes:${academiaId}`,
  INSTRUCTORS: (academiaId) => `instructors:${academiaId}`,
  PAYMENTS: (academiaId, studentId) => `payments:${academiaId}:${studentId}`,
  MODALITIES: (academiaId) => `modalities:${academiaId}`,
  PLANS: (academiaId) => `plans:${academiaId}`,
  USER_PROFILE: (userId) => `user:${userId}`,
  ACADEMY_DATA: (academiaId) => `academy:${academiaId}`,
  NOTIFICATIONS: (userId) => `notifications:${userId}`,
  GRADUATIONS: (academiaId) => `graduations:${academiaId}`,
  DASHBOARD: (academiaId) => `dashboard:${academiaId}`,
  CHECKIN_DATA: (academiaId, instructorId) => `checkin_data:${academiaId}:${instructorId}`,
  ANNOUNCEMENTS: (academiaId, userType) => `announcements:${academiaId}:${userType}`,
  CALENDAR_CLASSES: (academiaId, role) => `calendar_classes:${academiaId}:${role}`,
  STUDENT_DASHBOARD: (academiaId, studentId) => `student_dashboard:${academiaId}:${studentId}`,
  REPORTS: (academiaId) => `reports:${academiaId}`,
  STUDENT_DETAILS: (academiaId, studentId) => `student_details:${academiaId}:${studentId}`,
  INSTRUCTOR_CLASSES: (academiaId, instructorId) => `instructor_classes:${academiaId}:${instructorId}`,
  CLASS_STUDENT_COUNTS: (academiaId, instructorId) => `class_student_counts:${academiaId}:${instructorId}`,
  INSTRUCTOR_STUDENTS: (academiaId, instructorId) => `instructor_students:${academiaId}:${instructorId}`,
  INSTRUCTOR_REPORTS: (academiaId, instructorId, period) => `instructor_reports:${academiaId}:${instructorId}:${period}`
};

// TTLs recomendados para diferentes tipos de dados
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,      // 2 minutos
  MEDIUM: 5 * 60 * 1000,     // 5 minutos
  LONG: 15 * 60 * 1000,      // 15 minutos
  VERY_LONG: 60 * 60 * 1000, // 1 hora
  STATIC: 24 * 60 * 60 * 1000 // 24 horas
};

export default cacheService;
