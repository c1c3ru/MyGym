import { Academy } from '../../domain/entities/Academy';

/**
 * AcademyModel - Data Layer
 * Responsável pela conversão entre dados do Firebase e entidades de domínio
 */
export class AcademyModel {
  /**
   * Converte dados do Firestore para entidade Academy
   */
  static fromFirestore(doc) {
    if (!doc.exists()) {
      return null;
    }
    
    const data = doc.data();
    return new Academy({
      id: doc.id,
      name: data.name,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website,
      logoURL: data.logoURL,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
    });
  }

  /**
   * Converte dados raw do Firebase para entidade Academy
   */
  static fromFirebaseData(id, data) {
    return new Academy({
      id,
      name: data.name,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website,
      logoURL: data.logoURL,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
    });
  }

  /**
   * Converte entidade Academy para dados do Firestore
   */
  static toFirestore(academy) {
    const academyData = academy instanceof Academy ? academy.toJSON() : academy;
    
    // Remover o ID (será usado como document ID)
    const { id, ...firestoreData } = academyData;
    
    return {
      ...firestoreData,
      // Garantir que datas sejam objetos Date
      createdAt: firestoreData.createdAt instanceof Date ? firestoreData.createdAt : new Date(firestoreData.createdAt),
      updatedAt: firestoreData.updatedAt instanceof Date ? firestoreData.updatedAt : new Date(firestoreData.updatedAt)
    };
  }

  /**
   * Valida dados da academia
   */
  static validate(academyData) {
    const errors = [];
    
    if (!academyData.name || academyData.name.trim().length < 2) {
      errors.push('Nome da academia deve ter pelo menos 2 caracteres');
    }
    
    if (academyData.email && !academyData.email.includes('@')) {
      errors.push('Email inválido');
    }
    
    if (academyData.website && !academyData.website.match(/^https?:\/\//)) {
      errors.push('Website deve começar com http:// ou https://');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Normaliza dados da academia
   */
  static normalize(academyData) {
    return {
      ...academyData,
      name: academyData.name?.trim(),
      email: academyData.email?.toLowerCase()?.trim(),
      website: academyData.website?.trim(),
      phone: academyData.phone?.replace(/\D/g, '') // Remove caracteres não numéricos
    };
  }
}