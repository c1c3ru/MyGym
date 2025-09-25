// Validators for Firebase data

import { 
  FirebaseUserModel, 
  FirestoreUserProfileModel, 
  FirebaseClaimsModel, 
  FirestoreAcademiaModel 
} from './models';
import { ValidationError } from '@domain/auth/errors';

export class AuthValidators {
  static validateFirebaseUser(data: any) {
    const result = FirebaseUserModel.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `Firebase User ${err.path.join('.')}: ${err.message}`
      );
      throw new ValidationError(errors);
    }
    return result.data;
  }

  static validateFirestoreUserProfile(data: any) {
    const result = FirestoreUserProfileModel.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `User Profile ${err.path.join('.')}: ${err.message}`
      );
      throw new ValidationError(errors);
    }
    return result.data;
  }

  static validateFirebaseClaims(data: any) {
    const result = FirebaseClaimsModel.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `Claims ${err.path.join('.')}: ${err.message}`
      );
      throw new ValidationError(errors);
    }
    return result.data;
  }

  static validateFirestoreAcademia(data: any) {
    const result = FirestoreAcademiaModel.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `Academia ${err.path.join('.')}: ${err.message}`
      );
      throw new ValidationError(errors);
    }
    return result.data;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }
}