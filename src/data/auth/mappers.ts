// Mappers between Firebase data and domain entities

import { User, UserProfile, Claims, Academia, UserType } from '@domain/auth/entities';
import { 
  FirebaseUserData, 
  FirestoreUserProfileData, 
  FirebaseClaimsData, 
  FirestoreAcademiaData 
} from './models';

export class AuthMappers {
  static toDomainUser(firebaseUser: FirebaseUserData): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      emailVerified: firebaseUser.emailVerified,
      createdAt: firebaseUser.metadata?.creationTime 
        ? new Date(firebaseUser.metadata.creationTime)
        : new Date(),
      lastSignInAt: firebaseUser.metadata?.lastSignInTime 
        ? new Date(firebaseUser.metadata.lastSignInTime)
        : undefined
    };
  }

  static toDomainUserProfile(firestoreData: FirestoreUserProfileData): UserProfile {
    // Normalize user type (handle legacy Portuguese types)
    let userType: UserType = 'student';
    if (firestoreData.userType) {
      userType = firestoreData.userType;
    } else if (firestoreData.tipo) {
      switch (firestoreData.tipo) {
        case 'aluno':
          userType = 'student';
          break;
        case 'instrutor':
          userType = 'instructor';
          break;
        case 'administrador':
          userType = 'admin';
          break;
        default:
          userType = 'student';
      }
    }

    return {
      id: firestoreData.id,
      name: firestoreData.name,
      email: firestoreData.email,
      phone: firestoreData.phone,
      userType,
      academiaId: firestoreData.academiaId,
      isActive: firestoreData.isActive,
      currentGraduation: firestoreData.currentGraduation ?? undefined,
      graduations: firestoreData.graduations,
      classIds: firestoreData.classIds,
      createdAt: this.toDate(firestoreData.createdAt),
      updatedAt: this.toDate(firestoreData.updatedAt)
    };
  }

  static toDomainClaims(firebaseClaims: FirebaseClaimsData): Claims {
    return {
      role: firebaseClaims.role || 'student',
      academiaId: firebaseClaims.academiaId,
      permissions: firebaseClaims.permissions || []
    };
  }

  static toDomainAcademia(firestoreData: FirestoreAcademiaData): Academia {
    return {
      id: firestoreData.id,
      name: firestoreData.name,
      isActive: firestoreData.isActive,
      settings: firestoreData.settings
    };
  }

  static toFirestoreUserProfile(userProfile: Partial<UserProfile>): Partial<FirestoreUserProfileData> {
    const data: Partial<FirestoreUserProfileData> = {};
    
    if (userProfile.id) data.id = userProfile.id;
    if (userProfile.name) data.name = userProfile.name;
    if (userProfile.email) data.email = userProfile.email;
    if (userProfile.phone !== undefined) data.phone = userProfile.phone;
    if (userProfile.userType) data.userType = userProfile.userType;
    if (userProfile.academiaId !== undefined) data.academiaId = userProfile.academiaId;
    if (userProfile.isActive !== undefined) data.isActive = userProfile.isActive;
    if (userProfile.currentGraduation !== undefined) data.currentGraduation = userProfile.currentGraduation;
    if (userProfile.graduations) data.graduations = userProfile.graduations;
    if (userProfile.classIds) data.classIds = userProfile.classIds;
    if (userProfile.createdAt) data.createdAt = userProfile.createdAt;
    if (userProfile.updatedAt) data.updatedAt = userProfile.updatedAt;

    return data;
  }

  private static toDate(timestamp: any): Date {
    if (!timestamp) return new Date();
    
    // Handle Firestore Timestamp
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // Handle Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // Handle timestamp in seconds (Firestore format)
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    
    // Handle string or number
    return new Date(timestamp);
  }
}