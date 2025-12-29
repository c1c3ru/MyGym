import { cacheService } from '../cacheService';

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cacheService.clear(); // Limpar cache antes de cada teste
  });

  describe('set', () => {
    it('deve armazenar um valor no cache', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };

      await cacheService.set(key, value);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `cache_${key}`,
        JSON.stringify({
          data: value,
          timestamp: expect.any(Number),
        })
      );
    });

    it('deve armazenar string diretamente', async () => {
      const key = 'test-key';
      const value = 'simple-string';

      await cacheService.set(key, value);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('deve recuperar um valor do cache quando existe e não expirou', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      const cacheData = {
        data: value,
        timestamp: Date.now() - 1000, // 1 segundo atrás
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheData));

      const result = await cacheService.get(key, 5000); // TTL de 5 segundos

      expect(result).toEqual(value);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(`cache_${key}`);
    });

    it('deve retornar null quando o cache expirou', async () => {
      const key = 'test-key';
      const cacheData = {
        data: { test: 'data' },
        timestamp: Date.now() - 10000, // 10 segundos atrás
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheData));

      const result = await cacheService.get(key, 5000); // TTL de 5 segundos

      expect(result).toBeNull();
    });

    it('deve retornar null quando a chave não existe', async () => {
      const key = 'non-existent-key';

      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await cacheService.get(key);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('deve remover uma chave do cache', async () => {
      const key = 'test-key';

      await cacheService.remove(key);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`cache_${key}`);
    });
  });

  describe('clear', () => {
    it('deve limpar todo o cache', async () => {
      await cacheService.clear();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });
  });

  describe('has', () => {
    it('deve retornar true quando a chave existe e não expirou', async () => {
      const key = 'test-key';
      const cacheData = {
        data: { test: 'data' },
        timestamp: Date.now() - 1000,
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheData));

      const result = await cacheService.has(key, 5000);

      expect(result).toBe(true);
    });

    it('deve retornar false quando a chave não existe', async () => {
      const key = 'non-existent-key';

      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await cacheService.has(key);

      expect(result).toBe(false);
    });

    it('deve retornar false quando o cache expirou', async () => {
      const key = 'test-key';
      const cacheData = {
        data: { test: 'data' },
        timestamp: Date.now() - 10000,
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cacheData));

      const result = await cacheService.has(key, 5000);

      expect(result).toBe(false);
    });
  });
});

