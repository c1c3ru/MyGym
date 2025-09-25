// Firebase implementation of AuthRepository

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

import { AuthRepository } from '@domain/auth/repositories';
import { 
  User, 
  UserProfile, 
  Claims, 
  Academia, 
  SignInCredentials,
  SignUpData
} from '@domain/auth/entities';
import { 
  mapFirebaseError
} from '@domain/auth/errors';

import { AuthMappers } from './mappers';
import { AuthValidators } from './validators';
import { getUserClaims, refreshUserToken } from '@utils/customClaimsHelper';

export class FirebaseAuthRepository implements AuthRepository {
  constructor(
    private auth: any,
    private db: any
  ) {}

  async signInWithEmail(credentials: SignInCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth, 
        credentials.email, 
        credentials.password
      );
      
      const validatedUser = AuthValidators.validateFirebaseUser(userCredential.user);
      return AuthMappers.toDomainUser(validatedUser);
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  async signUpWithEmail(data: SignUpData): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );
      
      const validatedUser = AuthValidators.validateFirebaseUser(userCredential.user);
      return AuthMappers.toDomainUser(validatedUser);
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        return null;
      }
      
      const validatedUser = AuthValidators.validateFirebaseUser(currentUser);
      return AuthMappers.toDomainUser(validatedUser);
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  async createUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const profileData = {
        ...AuthMappers.toFirestoreUserProfile(data),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(this.db, 'users', userId), profileData);
      
      const validatedProfile = AuthValidators.validateFirestoreUserProfile({
        id: userId,
        ...profileData
      });
      
      return AuthMappers.toDomainUserProfile(validatedProfile);
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = { id: userId, ...userDoc.data() };
      const validatedProfile = AuthValidators.validateFirestoreUserProfile(userData);
      
      return AuthMappers.toDomainUserProfile(validatedProfile);
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const updateData = {
        ...AuthMappers.toFirestoreUserProfile(data),
        updatedAt: new Date()
      };

      await updateDoc(doc(this.db, 'users', userId), updateData);
      
      // Get the updated profile
      const updatedProfile = await this.getUserProfile(userId);
      if (!updatedProfile) {
        throw new Error('User profile not found after update');
      }
      
      return updatedProfile;
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  async getUserClaims(_user: User): Promise<Claims | null> {
    try {
      // Use existing claims helper
      const claims = await getUserClaims();
      if (!claims) {
        return null;
      }
      
      const validatedClaims = AuthValidators.validateFirebaseClaims(claims);
      return AuthMappers.toDomainClaims(validatedClaims);
    } catch (error: any) {
      console.error('Error getting user claims:', error);
      return null;
    }
  }

  async refreshUserToken(_user: User): Promise<void> {
    try {
      // Use existing token refresh helper
      await refreshUserToken();
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  async getAcademia(academiaId: string): Promise<Academia | null> {
    try {
      // Try 'gyms' collection first
      let academiaDoc = await getDoc(doc(this.db, 'gyms', academiaId));
      
      if (!academiaDoc.exists()) {
        // Try 'academias' collection as fallback
        academiaDoc = await getDoc(doc(this.db, 'academias', academiaId));
      }
      
      if (!academiaDoc.exists()) {
        return null;
      }
      
      const academiaData = { id: academiaId, ...academiaDoc.data() };
      const validatedAcademia = AuthValidators.validateFirestoreAcademia(academiaData);
      
      return AuthMappers.toDomainAcademia(validatedAcademia);
    } catch (error: any) {
      console.error('Error getting academia:', error);
      return null;
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      
      const validatedUser = AuthValidators.validateFirebaseUser(result.user);
      return AuthMappers.toDomainUser(validatedUser);
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  async signInWithFacebook(): Promise<User> {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      
      const validatedUser = AuthValidators.validateFirebaseUser(result.user);
      return AuthMappers.toDomainUser(validatedUser);
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  async signInWithMicrosoft(): Promise<User> {
    try {
      const provider = new OAuthProvider('microsoft.com');
      const result = await signInWithPopup(this.auth, provider);
      
      const validatedUser = AuthValidators.validateFirebaseUser(result.user);
      return AuthMappers.toDomainUser(validatedUser);
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  async signInWithApple(): Promise<User> {
    try {
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(this.auth, provider);
      
      const validatedUser = AuthValidators.validateFirebaseUser(result.user);
      return AuthMappers.toDomainUser(validatedUser);
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const validatedUser = AuthValidators.validateFirebaseUser(firebaseUser);
          const domainUser = AuthMappers.toDomainUser(validatedUser);
          callback(domainUser);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        callback(null);
      }
    });
  }
}