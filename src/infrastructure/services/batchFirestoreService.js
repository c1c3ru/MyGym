import { 
  writeBatch, 
  doc, 
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from '@infrastructure/services/firebase';

class BatchFirestoreService {
  constructor() {
    this.maxBatchSize = 500; // Limite do Firestore para batch operations
    this.maxConcurrentBatches = 10; // Limite de batches simultâneos
  }

  /**
   * Cria múltiplos documentos em batch
   * @param {string} collectionName - Nome da coleção
   * @param {Array} documents - Array de documentos para criar
   * @param {string} academiaId - ID da academia (opcional, para subcoleções)
   * @returns {Promise<Array>} Array com IDs dos documentos criados
   */
  async createMultiple(collectionName, documents, academiaId = null) {
    if (!documents || documents.length === 0) {
      return [];
    }

    const batches = this.createBatches(documents);
    const results = [];

    try {
      // Processar batches em paralelo (com limite de concorrência)
      const batchPromises = batches.map(async (batchDocs, batchIndex) => {
        const batch = writeBatch(db);
        const batchResults = [];

        for (const document of batchDocs) {
          const collectionPath = academiaId 
            ? `gyms/${academiaId}/${collectionName}`
            : collectionName;
          
          const docRef = doc(collection(db, collectionPath));
          const docData = {
            ...document,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          batch.set(docRef, docData);
          batchResults.push(docRef.id);
        }

        await batch.commit();
        console.log(`✅ Batch ${batchIndex + 1}/${batches.length} criado com sucesso`);
        return batchResults;
      });

      // Aguardar todos os batches com controle de concorrência
      const batchResults = await this.executeConcurrentBatches(batchPromises);
      results.push(...batchResults.flat());

      console.log(`🎉 ${results.length} documentos criados com sucesso em ${batches.length} batches`);
      return results;

    } catch (error) {
      console.error('❌ Erro ao criar documentos em batch:', error);
      throw new Error(`Falha ao criar documentos: ${error.message}`);
    }
  }

  /**
   * Atualiza múltiplos documentos em batch
   * @param {string} collectionName - Nome da coleção
   * @param {Array} updates - Array de objetos {id, data} para atualizar
   * @param {string} academiaId - ID da academia (opcional, para subcoleções)
   * @returns {Promise<number>} Número de documentos atualizados
   */
  async updateMultiple(collectionName, updates, academiaId = null) {
    if (!updates || updates.length === 0) {
      return 0;
    }

    const batches = this.createBatches(updates);
    let totalUpdated = 0;

    try {
      const batchPromises = batches.map(async (batchUpdates, batchIndex) => {
        const batch = writeBatch(db);

        for (const update of batchUpdates) {
          const collectionPath = academiaId 
            ? `gyms/${academiaId}/${collectionName}`
            : collectionName;
          
          const docRef = doc(db, collectionPath, update.id);
          const updateData = {
            ...update.data,
            updatedAt: new Date()
          };

          batch.update(docRef, updateData);
        }

        await batch.commit();
        console.log(`✅ Batch ${batchIndex + 1}/${batches.length} atualizado com sucesso`);
        return batchUpdates.length;
      });

      const results = await this.executeConcurrentBatches(batchPromises);
      totalUpdated = results.reduce((sum, count) => sum + count, 0);

      console.log(`🎉 ${totalUpdated} documentos atualizados com sucesso`);
      return totalUpdated;

    } catch (error) {
      console.error('❌ Erro ao atualizar documentos em batch:', error);
      throw new Error(`Falha ao atualizar documentos: ${error.message}`);
    }
  }

  /**
   * Deleta múltiplos documentos em batch
   * @param {string} collectionName - Nome da coleção
   * @param {Array} documentIds - Array de IDs dos documentos para deletar
   * @param {string} academiaId - ID da academia (opcional, para subcoleções)
   * @returns {Promise<number>} Número de documentos deletados
   */
  async deleteMultiple(collectionName, documentIds, academiaId = null) {
    if (!documentIds || documentIds.length === 0) {
      return 0;
    }

    const batches = this.createBatches(documentIds);
    let totalDeleted = 0;

    try {
      const batchPromises = batches.map(async (batchIds, batchIndex) => {
        const batch = writeBatch(db);

        for (const docId of batchIds) {
          const collectionPath = academiaId 
            ? `gyms/${academiaId}/${collectionName}`
            : collectionName;
          
          const docRef = doc(db, collectionPath, docId);
          batch.delete(docRef);
        }

        await batch.commit();
        console.log(`✅ Batch ${batchIndex + 1}/${batches.length} deletado com sucesso`);
        return batchIds.length;
      });

      const results = await this.executeConcurrentBatches(batchPromises);
      totalDeleted = results.reduce((sum, count) => sum + count, 0);

      console.log(`🎉 ${totalDeleted} documentos deletados com sucesso`);
      return totalDeleted;

    } catch (error) {
      console.error('❌ Erro ao deletar documentos em batch:', error);
      throw new Error(`Falha ao deletar documentos: ${error.message}`);
    }
  }

  /**
   * Operação mista em batch (criar, atualizar, deletar)
   * @param {Object} operations - Objeto com arrays de operações
   * @param {string} academiaId - ID da academia (opcional, para subcoleções)
   * @returns {Promise<Object>} Resultado das operações
   */
  async mixedBatchOperation(operations, academiaId = null) {
    const { 
      create = [], 
      update = [], 
      delete: deleteOps = [] 
    } = operations;

    // Calcular total de operações
    const totalOps = create.length + update.length + deleteOps.length;
    if (totalOps === 0) {
      return { created: 0, updated: 0, deleted: 0 };
    }

    // Dividir operações em batches
    const allOperations = [
      ...create.map(op => ({ type: 'create', ...op })),
      ...update.map(op => ({ type: 'update', ...op })),
      ...deleteOps.map(op => ({ type: 'delete', ...op }))
    ];

    const batches = this.createBatches(allOperations);
    const results = { created: 0, updated: 0, deleted: 0 };

    try {
      const batchPromises = batches.map(async (batchOps, batchIndex) => {
        const batch = writeBatch(db);
        const batchResults = { created: 0, updated: 0, deleted: 0 };

        for (const operation of batchOps) {
          const collectionPath = academiaId 
            ? `gyms/${academiaId}/${operation.collectionName}`
            : operation.collectionName;

          switch (operation.type) {
            case 'create': {
              const docRef = doc(collection(db, collectionPath));
              const docData = {
                ...operation.data,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              batch.set(docRef, docData);
              batchResults.created++;
              break;
            }
            case 'update': {
              const docRef = doc(db, collectionPath, operation.id);
              const updateData = {
                ...operation.data,
                updatedAt: new Date()
              };
              batch.update(docRef, updateData);
              batchResults.updated++;
              break;
            }
            case 'delete': {
              const docRef = doc(db, collectionPath, operation.id);
              batch.delete(docRef);
              batchResults.deleted++;
              break;
            }
          }
        }

        await batch.commit();
        console.log(`✅ Batch misto ${batchIndex + 1}/${batches.length} executado com sucesso`);
        return batchResults;
      });

      const batchResults = await this.executeConcurrentBatches(batchPromises);
      
      // Somar resultados de todos os batches
      batchResults.forEach(batchResult => {
        results.created += batchResult.created;
        results.updated += batchResult.updated;
        results.deleted += batchResult.deleted;
      });

      console.log(`🎉 Operação mista concluída:`, results);
      return results;

    } catch (error) {
      console.error('❌ Erro na operação mista em batch:', error);
      throw new Error(`Falha na operação mista: ${error.message}`);
    }
  }

  /**
   * Busca e processa documentos em lotes para operações em massa
   * @param {string} collectionName - Nome da coleção
   * @param {Function} processor - Função para processar cada lote
   * @param {Object} queryOptions - Opções de query
   * @param {string} academiaId - ID da academia (opcional, para subcoleções)
   * @returns {Promise<Array>} Resultados processados
   */
  async batchProcessQuery(collectionName, processor, queryOptions = {}, academiaId = null) {
    const {
      whereClause = null,
      orderByField = null,
      orderDirection = 'asc',
      batchSize = 100
    } = queryOptions;

    const collectionPath = academiaId 
      ? `gyms/${academiaId}/${collectionName}`
      : collectionName;

    let queryRef = collection(db, collectionPath);

    // Aplicar filtros
    if (whereClause) {
      queryRef = query(queryRef, where(...whereClause));
    }

    if (orderByField) {
      queryRef = query(queryRef, orderBy(orderByField, orderDirection));
    }

    const results = [];
    let hasMore = true;
    let lastDoc = null;

    try {
      while (hasMore) {
        let batchQuery = query(queryRef, limit(batchSize));
        
        if (lastDoc) {
          batchQuery = query(batchQuery, startAfter(lastDoc));
        }

        const snapshot = await getDocs(batchQuery);
        
        if (snapshot.empty) {
          hasMore = false;
          break;
        }

        const batchData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Processar lote
        const batchResult = await processor(batchData);
        results.push(...(Array.isArray(batchResult) ? batchResult : [batchResult]));

        // Preparar para próximo lote
        lastDoc = snapshot.docs[snapshot.docs.length - 1];
        hasMore = snapshot.docs.length === batchSize;

        console.log(`📦 Processado lote de ${batchData.length} documentos`);
      }

      console.log(`🎉 Processamento concluído: ${results.length} resultados`);
      return results;

    } catch (error) {
      console.error('❌ Erro no processamento em lotes:', error);
      throw new Error(`Falha no processamento: ${error.message}`);
    }
  }

  /**
   * Divide array em batches menores
   * @param {Array} items - Items para dividir
   * @returns {Array} Array de batches
   */
  createBatches(items) {
    const batches = [];
    for (let i = 0; i < items.length; i += this.maxBatchSize) {
      batches.push(items.slice(i, i + this.maxBatchSize));
    }
    return batches;
  }

  /**
   * Executa batches com controle de concorrência
   * @param {Array} batchPromises - Array de promises de batch
   * @returns {Promise<Array>} Resultados dos batches
   */
  async executeConcurrentBatches(batchPromises) {
    const results = [];
    
    // Processar em grupos para controlar concorrência
    for (let i = 0; i < batchPromises.length; i += this.maxConcurrentBatches) {
      const concurrentBatch = batchPromises.slice(i, i + this.maxConcurrentBatches);
      const batchResults = await Promise.all(concurrentBatch);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Estatísticas de performance para operações em batch
   * @param {Function} operation - Operação para medir
   * @returns {Promise<Object>} Resultado com estatísticas
   */
  async measureBatchPerformance(operation) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage ? process.memoryUsage() : null;

    try {
      const result = await operation();
      const endTime = Date.now();
      const endMemory = process.memoryUsage ? process.memoryUsage() : null;

      const stats = {
        duration: endTime - startTime,
        result,
        memoryUsage: startMemory && endMemory ? {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal
        } : null
      };

      console.log('📊 Performance Stats:', {
        duration: `${stats.duration}ms`,
        memoryDelta: stats.memoryUsage ? `${Math.round(stats.memoryUsage.heapUsed / 1024 / 1024)}MB` : 'N/A'
      });

      return stats;

    } catch (error) {
      const endTime = Date.now();
      console.error('❌ Operação falhou após', endTime - startTime, 'ms:', error);
      throw error;
    }
  }
}

// Instância singleton
const batchFirestoreService = new BatchFirestoreService();

export default batchFirestoreService;
