import { UserRepository } from '../../domain/repositories/UserRepository';
import { FirestoreUserDataSource } from '../datasources/FirestoreUserDataSource';
import { UserModel } from '../models/UserModel';

/**
 * UserRepositoryImpl - Data Layer
 * Implementação concreta do UserRepository usando Firestore
 */
export class UserRepositoryImpl extends UserRepository {
  constructor() {
    super();
    this.userDataSource = new FirestoreUserDataSource();
  }

  /**
   * Busca um usuário por ID
   */
  async getUserById(userId) {
    try {
      const user = await this.userDataSource.getUserById(userId);
      return user;
    } catch (error) {
      console.error('❌ UserRepositoryImpl.getUserById:', error);
      throw error;
    }
  }

  /**
   * Cria ou atualiza um usuário
   */
  async saveUser(user) {
    try {
      // Validar dados do usuário
      const validation = UserModel.validate(user);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
      }

      return await this.userDataSource.saveUser(user);
    } catch (error) {
      console.error('❌ UserRepositoryImpl.saveUser:', error);
      throw error;
    }
  }

  /**
   * Atualiza parcialmente um usuário
   */
  async updateUser(userId, updates) {
    try {
      // Validar se o usuário existe
      const existingUser = await this.userDataSource.getUserById(userId);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      // Validar updates se houver dados críticos
      if (updates.email || updates.name || updates.userType) {
        const mergedData = { ...existingUser.toJSON(), ...updates };
        const validation = UserModel.validate(mergedData);
        if (!validation.isValid) {
          throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }
      }

      return await this.userDataSource.updateUser(userId, updates);
    } catch (error) {
      console.error('❌ UserRepositoryImpl.updateUser:', error);
      throw error;
    }
  }

  /**
   * Remove um usuário
   */
  async deleteUser(userId) {
    try {
      // Verificar se o usuário existe antes de deletar
      const existingUser = await this.userDataSource.getUserById(userId);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      await this.userDataSource.deleteUser(userId);
    } catch (error) {
      console.error('❌ UserRepositoryImpl.deleteUser:', error);
      throw error;
    }
  }

  /**
   * Verifica se um usuário existe
   */
  async userExists(userId) {
    try {
      return await this.userDataSource.userExists(userId);
    } catch (error) {
      console.error('❌ UserRepositoryImpl.userExists:', error);
      return false;
    }
  }
}