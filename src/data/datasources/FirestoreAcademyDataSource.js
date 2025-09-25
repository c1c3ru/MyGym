import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@services/firebase';
import { Academy } from '@/domain/entities/Academy';

/**
 * FirestoreAcademyDataSource - Data Layer
 * Implementa operações de academia usando Firestore
 */
export class FirestoreAcademyDataSource {
  constructor() {
    this.collection = 'gyms'; // Usar 'gyms' como definido na estrutura existente
    this.fallbackCollection = 'academias'; // Fallback para compatibilidade
  }

  /**
   * Buscar academia por ID
   */
  async getAcademyById(academyId) {
    try {
      console.log('🔍 FirestoreAcademyDataSource.getAcademyById:', academyId);
      
      // Tentar buscar na coleção principal
      let academyDoc = await getDoc(doc(db, this.collection, academyId));
      
      if (academyDoc.exists()) {
        const academyData = { id: academyId, ...academyDoc.data() };
        console.log('✅ FirestoreAcademyDataSource: Academia encontrada em', this.collection);
        
        return new Academy(academyData);
      }
      
      // Tentar buscar na coleção fallback
      console.log('🔍 FirestoreAcademyDataSource: Tentando fallback collection:', this.fallbackCollection);
      academyDoc = await getDoc(doc(db, this.fallbackCollection, academyId));
      
      if (academyDoc.exists()) {
        const academyData = { id: academyId, ...academyDoc.data() };
        console.log('✅ FirestoreAcademyDataSource: Academia encontrada em', this.fallbackCollection);
        
        return new Academy(academyData);
      }
      
      console.log('❌ FirestoreAcademyDataSource: Academia não encontrada em nenhuma coleção');
      return null;
    } catch (error) {
      console.error('❌ FirestoreAcademyDataSource.getAcademyById:', error);
      throw error;
    }
  }

  /**
   * Buscar academias com filtros
   */
  async getAcademies(filters = {}) {
    try {
      console.log('🔍 FirestoreAcademyDataSource.getAcademies:', filters);
      
      let q = collection(db, this.collection);
      
      // Aplicar filtros
      if (filters.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }
      
      if (filters.name) {
        q = query(q, where('name', '>=', filters.name), where('name', '<=', filters.name + '\uf8ff'));
      }
      
      const querySnapshot = await getDocs(q);
      const academies = [];
      
      querySnapshot.forEach((doc) => {
        const academyData = { id: doc.id, ...doc.data() };
        academies.push(new Academy(academyData));
      });
      
      console.log('✅ FirestoreAcademyDataSource: Encontradas', academies.length, 'academias');
      
      return academies;
    } catch (error) {
      console.error('❌ FirestoreAcademyDataSource.getAcademies:', error);
      throw error;
    }
  }

  /**
   * Salvar academia (criar ou atualizar)
   */
  async saveAcademy(academyData) {
    try {
      console.log('💾 FirestoreAcademyDataSource.saveAcademy:', academyData.id);
      
      // Converter Academy entity para objeto plain se necessário
      const dataToSave = academyData instanceof Academy ? academyData.toJSON() : academyData;
      
      // Remover o ID do objeto de dados (usado apenas como chave do documento)
      const { id, ...academyDataWithoutId } = dataToSave;
      
      // Adicionar timestamp de atualização
      academyDataWithoutId.updatedAt = new Date();
      
      await setDoc(doc(db, this.collection, id), academyDataWithoutId);
      
      console.log('✅ FirestoreAcademyDataSource: Academia salva com sucesso');
      
      return new Academy({ id, ...academyDataWithoutId });
    } catch (error) {
      console.error('❌ FirestoreAcademyDataSource.saveAcademy:', error);
      throw error;
    }
  }

  /**
   * Atualizar academia parcialmente
   */
  async updateAcademy(academyId, updates) {
    try {
      console.log('🔄 FirestoreAcademyDataSource.updateAcademy:', academyId, updates);
      
      // Adicionar timestamp de atualização
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, this.collection, academyId), updatesWithTimestamp);
      
      console.log('✅ FirestoreAcademyDataSource: Academia atualizada com sucesso');
      
      // Buscar e retornar a academia atualizada
      return await this.getAcademyById(academyId);
    } catch (error) {
      console.error('❌ FirestoreAcademyDataSource.updateAcademy:', error);
      throw error;
    }
  }

  /**
   * Deletar academia
   */
  async deleteAcademy(academyId) {
    try {
      console.log('🗑️ FirestoreAcademyDataSource.deleteAcademy:', academyId);
      
      await deleteDoc(doc(db, this.collection, academyId));
      
      console.log('✅ FirestoreAcademyDataSource: Academia deletada com sucesso');
    } catch (error) {
      console.error('❌ FirestoreAcademyDataSource.deleteAcademy:', error);
      throw error;
    }
  }

  /**
   * Verificar se academia existe
   */
  async academyExists(academyId) {
    try {
      const academyDoc = await getDoc(doc(db, this.collection, academyId));
      if (academyDoc.exists()) {
        return true;
      }
      
      // Verificar também na coleção fallback
      const fallbackDoc = await getDoc(doc(db, this.fallbackCollection, academyId));
      return fallbackDoc.exists();
    } catch (error) {
      console.error('❌ FirestoreAcademyDataSource.academyExists:', error);
      return false;
    }
  }
}