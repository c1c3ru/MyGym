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
  setDoc
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
  ) { }

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

  async signInWithEmailAndPassword(credentials: SignInCredentials): Promise<User> {
    // Alias for signInWithEmail to maintain compatibility
    return this.signInWithEmail(credentials);
  }

  async signUpWithEmail(data: SignUpData): Promise<User> {
    try {
      console.log('🔥 FirebaseAuthRepository: Tentando criar usuário...', {
        email: data.email,
        hasPassword: !!data.password
      });

      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );

      console.log('✅ FirebaseAuthRepository: Usuário criado com sucesso!', userCredential.user.uid);

      const validatedUser = AuthValidators.validateFirebaseUser(userCredential.user);
      return AuthMappers.toDomainUser(validatedUser);
    } catch (error: any) {
      console.error('❌ FirebaseAuthRepository: Erro ao criar usuário:', {
        code: error.code,
        message: error.message,
        customData: error.customData
      });
      throw mapFirebaseError(error);
    }
  }

  async signUpWithEmailAndPassword(data: SignUpData): Promise<User> {
    // Alias for signUpWithEmail to maintain compatibility
    return this.signUpWithEmail(data);
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

      console.log('📝 [FirebaseAuthRepository] Atualizando perfil:', {
        userId,
        authUid: this.auth.currentUser?.uid,
        match: userId === this.auth.currentUser?.uid
      });

      await setDoc(doc(this.db, 'users', userId), updateData, { merge: true });

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

      // Se não houver claims (usuário recém-criado), retornar claims padrão
      if (!claims || !claims.role) {
        console.log('⚠️ Claims não encontrados ou incompletos, retornando padrão');
        return {
          role: 'student', // Padrão para novos usuários
          academiaId: undefined,
          permissions: []
        };
      }

      const validatedClaims = AuthValidators.validateFirebaseClaims(claims);
      return AuthMappers.toDomainClaims(validatedClaims);
    } catch (error: any) {
      console.error('Error getting user claims:', error);
      // Retornar claims padrão em caso de erro
      return {
        role: 'student',
        academiaId: undefined,
        permissions: []
      };
    }
  }

  async getCustomClaims(): Promise<Claims | null> {
    try {
      // Use existing claims helper without user parameter (legacy compatibility)
      const claims = await getUserClaims();
      if (!claims) {
        return null;
      }

      const validatedClaims = AuthValidators.validateFirebaseClaims(claims);
      return AuthMappers.toDomainClaims(validatedClaims);
    } catch (error: any) {
      console.error('Error getting custom claims:', error);
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

  async refreshToken(): Promise<void> {
    try {
      // Use existing token refresh helper without user parameter (legacy compatibility)
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
      console.log('🔍 [FirebaseAuthRepository] Iniciando signInWithGoogle (Popup)');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      console.log('✅ [FirebaseAuthRepository] signInWithGoogle bem-sucedido:', result.user.uid);
      const validatedUser = AuthValidators.validateFirebaseUser(result.user);
      return AuthMappers.toDomainUser(validatedUser);
    } catch (error: any) {
      console.error('❌ [FirebaseAuthRepository] Erro no signInWithGoogle:', error);
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

  async getSignInMethodsForEmail(email: string): Promise<string[]> {
    try {
      // Import fetchSignInMethodsForEmail dynamically
      const { fetchSignInMethodsForEmail } = await import('firebase/auth');
      const methods = await fetchSignInMethodsForEmail(this.auth, email);
      return methods;
    } catch (error: any) {
      console.error('Error getting sign-in methods:', error);
      throw mapFirebaseError(error);
    }
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | null> {
    try {
      // Import query functions
      const { collection, query, where, getDocs } = await import('firebase/firestore');

      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = { id: userDoc.id, ...userDoc.data() };
      const validatedProfile = AuthValidators.validateFirestoreUserProfile(userData);

      return AuthMappers.toDomainUserProfile(validatedProfile);
    } catch (error: any) {
      console.error('Error getting user profile by email:', error);
      return null;
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