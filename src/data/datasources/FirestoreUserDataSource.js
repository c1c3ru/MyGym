import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@services/firebase';
import { User } from '@/domain/entities/User';

/**
 * FirestoreUserDataSource - Data Layer
 * Implementa operações de usuário usando Firestore
 */
export class FirestoreUserDataSource {
  constructor() {
    this.collection = 'users';
  }

  /**
   * Buscar usuário por ID
   */
  async getUserById(userId) {
    try {
      console.log('🔍 FirestoreUserDataSource.getUserById:', userId);
      
      const userDoc = await getDoc(doc(db, this.collection, userId));
      
      if (userDoc.exists()) {
        const userData = { id: userId, ...userDoc.data() };
        console.log('✅ FirestoreUserDataSource: Usuário encontrado');
        
        return new User(userData);
      }
      
      console.log('❌ FirestoreUserDataSource: Usuário não encontrado');
      return null;
    } catch (error) {
      console.error('❌ FirestoreUserDataSource.getUserById:', error);
      throw error;
    }
  }

  /**
   * Salvar usuário (criar ou atualizar)
   */
  async saveUser(userData) {
    try {
      console.log('💾 FirestoreUserDataSource.saveUser:', userData.id);
      
      // Converter User entity para objeto plain se necessário
      const dataToSave = userData instanceof User ? userData.toJSON() : userData;
      
      // Remover o ID do objeto de dados (usado apenas como chave do documento)
      const { id, ...userDataWithoutId } = dataToSave;
      
      // Adicionar timestamp de atualização
      userDataWithoutId.updatedAt = new Date();
      
      await setDoc(doc(db, this.collection, id), userDataWithoutId);
      
      console.log('✅ FirestoreUserDataSource: Usuário salvo com sucesso');
      
      return new User({ id, ...userDataWithoutId });
    } catch (error) {
      console.error('❌ FirestoreUserDataSource.saveUser:', error);
      throw error;
    }
  }

  /**
   * Atualizar usuário parcialmente
   */
  async updateUser(userId, updates) {
    try {
      console.log('🔄 FirestoreUserDataSource.updateUser:', userId, updates);
      
      // Adicionar timestamp de atualização
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, this.collection, userId), updatesWithTimestamp);
      
      console.log('✅ FirestoreUserDataSource: Usuário atualizado com sucesso');
      
      // Buscar e retornar o usuário atualizado
      return await this.getUserById(userId);
    } catch (error) {
      console.error('❌ FirestoreUserDataSource.updateUser:', error);
      throw error;
    }
  }

  /**
   * Deletar usuário
   */
  async deleteUser(userId) {
    try {
      console.log('🗑️ FirestoreUserDataSource.deleteUser:', userId);
      
      await deleteDoc(doc(db, this.collection, userId));
      
      console.log('✅ FirestoreUserDataSource: Usuário deletado com sucesso');
    } catch (error) {
      console.error('❌ FirestoreUserDataSource.deleteUser:', error);
      throw error;
    }
  }

  /**
   * Verificar se usuário existe
   */
  async userExists(userId) {
    try {
      const userDoc = await getDoc(doc(db, this.collection, userId));
      return userDoc.exists();
    } catch (error) {
      console.error('❌ FirestoreUserDataSource.userExists:', error);
      return false;
    }
  }
}