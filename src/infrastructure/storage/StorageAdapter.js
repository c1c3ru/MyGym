import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * StorageAdapter - Infrastructure Layer
 * Adaptador para AsyncStorage, fornecendo uma interface unificada
 */
export class StorageAdapter {
  constructor() {
    this.storage = AsyncStorage;
  }

  /**
   * Armazena um valor
   */
  async setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.storage.setItem(key, stringValue);
      console.log('💾 StorageAdapter.setItem:', key, 'saved');
    } catch (error) {
      console.error('❌ StorageAdapter.setItem:', key, error);
      throw error;
    }
  }

  /**
   * Recupera um valor
   */
  async getItem(key) {
    try {
      const value = await this.storage.getItem(key);
      if (value === null) {
        return null;
      }
      
      // Tentar fazer parse do JSON
      try {
        return JSON.parse(value);
      } catch {
        // Se não for JSON válido, retornar como string
        return value;
      }
    } catch (error) {
      console.error('❌ StorageAdapter.getItem:', key, error);
      return null;
    }
  }

  /**
   * Remove um valor
   */
  async removeItem(key) {
    try {
      await this.storage.removeItem(key);
      console.log('🗑️ StorageAdapter.removeItem:', key, 'removed');
    } catch (error) {
      console.error('❌ StorageAdapter.removeItem:', key, error);
      throw error;
    }
  }

  /**
   * Limpa todo o storage
   */
  async clear() {
    try {
      await this.storage.clear();
      console.log('🧹 StorageAdapter.clear: Storage limpo');
    } catch (error) {
      console.error('❌ StorageAdapter.clear:', error);
      throw error;
    }
  }

  /**
   * Obtém todas as chaves
   */
  async getAllKeys() {
    try {
      const keys = await this.storage.getAllKeys();
      return keys;
    } catch (error) {
      console.error('❌ StorageAdapter.getAllKeys:', error);
      return [];
    }
  }

  /**
   * Obtém múltiplos itens
   */
  async getMultiple(keys) {
    try {
      const items = await this.storage.multiGet(keys);
      const result = {};
      
      items.forEach(([key, value]) => {
        if (value !== null) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('❌ StorageAdapter.getMultiple:', error);
      return {};
    }
  }

  /**
   * Define múltiplos itens
   */
  async setMultiple(keyValuePairs) {
    try {
      const formattedPairs = keyValuePairs.map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      ]);
      
      await this.storage.multiSet(formattedPairs);
      console.log('💾 StorageAdapter.setMultiple: Múltiplos itens salvos');
    } catch (error) {
      console.error('❌ StorageAdapter.setMultiple:', error);
      throw error;
    }
  }

  /**
   * Remove múltiplos itens
   */
  async removeMultiple(keys) {
    try {
      await this.storage.multiRemove(keys);
      console.log('🗑️ StorageAdapter.removeMultiple: Múltiplos itens removidos');
    } catch (error) {
      console.error('❌ StorageAdapter.removeMultiple:', error);
      throw error;
    }
  }

  /**
   * Verifica se uma chave existe
   */
  async hasKey(key) {
    try {
      const value = await this.storage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error('❌ StorageAdapter.hasKey:', key, error);
      return false;
    }
  }

  /**
   * Debug do storage - lista todas as chaves e valores
   */
  async debugStorage() {
    try {
      const keys = await this.getAllKeys();
      const items = await this.getMultiple(keys);
      
      console.log('💾 StorageAdapter Debug:', {
        totalKeys: keys.length,
        keys,
        items
      });
      
      return { keys, items };
    } catch (error) {
      console.error('❌ StorageAdapter.debugStorage:', error);
      return { keys: [], items: {} };
    }
  }
}