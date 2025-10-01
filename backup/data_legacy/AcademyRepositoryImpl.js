import { AcademyRepository } from '@domain/repositories/AcademyRepository';
import { FirestoreAcademyDataSource } from '@data/datasources/FirestoreAcademyDataSource';
import { AcademyModel } from '@data/models/AcademyModel';

/**
 * AcademyRepositoryImpl - Data Layer
 * Implementação concreta do AcademyRepository usando Firestore
 */
export class AcademyRepositoryImpl extends AcademyRepository {
  constructor() {
    super();
    this.academyDataSource = new FirestoreAcademyDataSource();
  }

  /**
   * Busca uma academia por ID
   */
  async getAcademyById(academyId) {
    try {
      const academy = await this.academyDataSource.getAcademyById(academyId);
      return academy;
    } catch (error) {
      console.error('❌ AcademyRepositoryImpl.getAcademyById:', error);
      throw error;
    }
  }

  /**
   * Busca academias por filtros
   */
  async getAcademies(filters = {}) {
    try {
      const academies = await this.academyDataSource.getAcademies(filters);
      return academies;
    } catch (error) {
      console.error('❌ AcademyRepositoryImpl.getAcademies:', error);
      throw error;
    }
  }

  /**
   * Cria ou atualiza uma academia
   */
  async saveAcademy(academy) {
    try {
      // Normalizar dados
      const normalizedData = AcademyModel.normalize(academy);
      
      // Validar dados da academia
      const validation = AcademyModel.validate(normalizedData);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
      }

      return await this.academyDataSource.saveAcademy(normalizedData);
    } catch (error) {
      console.error('❌ AcademyRepositoryImpl.saveAcademy:', error);
      throw error;
    }
  }

  /**
   * Atualiza parcialmente uma academia
   */
  async updateAcademy(academyId, updates) {
    try {
      // Verificar se a academia existe
      const existingAcademy = await this.academyDataSource.getAcademyById(academyId);
      if (!existingAcademy) {
        throw new Error('Academia não encontrada');
      }

      // Normalizar updates
      const normalizedUpdates = AcademyModel.normalize(updates);

      // Validar updates se houver dados críticos
      if (updates.name || updates.email || updates.website) {
        const mergedData = { ...existingAcademy.toJSON(), ...normalizedUpdates };
        const validation = AcademyModel.validate(mergedData);
        if (!validation.isValid) {
          throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }
      }

      return await this.academyDataSource.updateAcademy(academyId, normalizedUpdates);
    } catch (error) {
      console.error('❌ AcademyRepositoryImpl.updateAcademy:', error);
      throw error;
    }
  }

  /**
   * Remove uma academia
   */
  async deleteAcademy(academyId) {
    try {
      // Verificar se a academia existe antes de deletar
      const existingAcademy = await this.academyDataSource.getAcademyById(academyId);
      if (!existingAcademy) {
        throw new Error('Academia não encontrada');
      }

      await this.academyDataSource.deleteAcademy(academyId);
    } catch (error) {
      console.error('❌ AcademyRepositoryImpl.deleteAcademy:', error);
      throw error;
    }
  }

  /**
   * Verifica se uma academia existe
   */
  async academyExists(academyId) {
    try {
      return await this.academyDataSource.academyExists(academyId);
    } catch (error) {
      console.error('❌ AcademyRepositoryImpl.academyExists:', error);
      return false;
    }
  }
}