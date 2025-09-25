import { User } from '@/domain/entities/User';

/**
 * UserModel - Data Layer
 * Responsável pela conversão entre dados do Firebase e entidades de domínio
 */
export class UserModel {
  /**
   * Converte dados do Firestore para entidade User
   */
  static fromFirestore(doc) {
    if (!doc.exists()) {
      return null;
    }
    
    const data = doc.data();
    return new User({
      id: doc.id,
      email: data.email,
      name: data.name,
      photoURL: data.photoURL,
      userType: data.userType || data.tipo, // Suporte a ambos os campos
      academiaId: data.academiaId,
      isActive: data.isActive !== undefined ? data.isActive : true,
      profileCompleted: data.profileCompleted !== undefined ? data.profileCompleted : false,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
    });
  }

  /**
   * Converte dados raw do Firebase para entidade User
   */
  static fromFirebaseData(id, data) {
    return new User({
      id,
      email: data.email,
      name: data.name,
      photoURL: data.photoURL,
      userType: data.userType || data.tipo,
      academiaId: data.academiaId,
      isActive: data.isActive !== undefined ? data.isActive : true,
      profileCompleted: data.profileCompleted !== undefined ? data.profileCompleted : false,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
    });
  }

  /**
   * Converte entidade User para dados do Firestore
   */
  static toFirestore(user) {
    const userData = user instanceof User ? user.toJSON() : user;
    
    // Remover o ID (será usado como document ID)
    const { id, ...firestoreData } = userData;
    
    return {
      ...firestoreData,
      // Garantir que datas sejam objetos Date
      createdAt: firestoreData.createdAt instanceof Date ? firestoreData.createdAt : new Date(firestoreData.createdAt),
      updatedAt: firestoreData.updatedAt instanceof Date ? firestoreData.updatedAt : new Date(firestoreData.updatedAt)
    };
  }

  /**
   * Converte Firebase User para dados básicos
   */
  static fromFirebaseAuth(firebaseUser) {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      isAnonymous: firebaseUser.isAnonymous
    };
  }

  /**
   * Normaliza tipo de usuário (compatibilidade)
   */
  static normalizeUserType(userType) {
    if (!userType) return null;
    
    const typeMap = {
      'instrutor': 'instructor',
      'aluno': 'student',
      'administrador': 'admin'
    };
    
    return typeMap[userType] || userType;
  }

  /**
   * Valida dados do usuário
   */
  static validate(userData) {
    const errors = [];
    
    if (!userData.email) {
      errors.push('Email é obrigatório');
    }
    
    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (userData.userType && !['student', 'instructor', 'admin'].includes(userData.userType)) {
      errors.push('Tipo de usuário inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}