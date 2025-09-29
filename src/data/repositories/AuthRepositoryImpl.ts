// AuthRepositoryImpl - Data Layer (TypeScript)
// Implementação concreta do AuthRepository usando Firebase

import { AuthRepository } from '@domain/auth/repositories';
import { 
  User, 
  UserProfile, 
  Claims, 
  Academia, 
  SignInCredentials,
  SignUpData
} from '@domain/auth/entities';
import { FirebaseAuthDataSource } from '@data/datasources/FirebaseAuthDataSource';

export class AuthRepositoryImpl implements AuthRepository {
  private authDataSource: FirebaseAuthDataSource;

  constructor() {
    this.authDataSource = new FirebaseAuthDataSource();
  }

  // Authentication methods
  async signInWithEmail(credentials: SignInCredentials): Promise<User> {
    const result = await this.authDataSource.signInWithEmailAndPassword(
      credentials.email, 
      credentials.password
    );
    return this.mapToUser(result.user);
  }

  async signInWithEmailAndPassword(credentials: SignInCredentials): Promise<User> {
    return this.signInWithEmail(credentials);
  }

  async signUpWithEmail(data: SignUpData): Promise<User> {
    const result = await this.authDataSource.createUserWithEmailAndPassword(
      data.email, 
      data.password
    );
    return this.mapToUser(result.user);
  }

  async signUpWithEmailAndPassword(data: SignUpData): Promise<User> {
    return this.signUpWithEmail(data);
  }

  async signOut(): Promise<void> {
    return await this.authDataSource.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const user = this.authDataSource.getCurrentUser();
    return user ? this.mapToUser(user) : null;
  }

  // User profile methods
  async createUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    // Implementation would depend on your data source
    throw new Error('Method not implemented in legacy AuthRepositoryImpl');
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // Implementation would depend on your data source
    throw new Error('Method not implemented in legacy AuthRepositoryImpl');
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    // Implementation would depend on your data source
    throw new Error('Method not implemented in legacy AuthRepositoryImpl');
  }

  // Claims methods
  async getUserClaims(_user: User): Promise<Claims | null> {
    const claims = await this.authDataSource.getCustomClaims();
    return claims ? this.mapToClaims(claims) : null;
  }

  async getCustomClaims(): Promise<Claims | null> {
    const claims = await this.authDataSource.getCustomClaims();
    return claims ? this.mapToClaims(claims) : null;
  }

  async refreshUserToken(_user: User): Promise<void> {
    return await this.authDataSource.refreshToken();
  }

  async refreshToken(): Promise<void> {
    return await this.authDataSource.refreshToken();
  }

  // Academia methods
  async getAcademia(academiaId: string): Promise<Academia | null> {
    // Implementation would depend on your data source
    throw new Error('Method not implemented in legacy AuthRepositoryImpl');
  }

  // Social authentication
  async signInWithGoogle(): Promise<User> {
    const result = await this.authDataSource.signInWithGoogle();
    return this.mapToUser(result.user);
  }

  async signInWithFacebook(): Promise<User> {
    const result = await this.authDataSource.signInWithFacebook();
    return this.mapToUser(result.user);
  }

  async signInWithMicrosoft(): Promise<User> {
    const result = await this.authDataSource.signInWithMicrosoft();
    return this.mapToUser(result.user);
  }

  async signInWithApple(): Promise<User> {
    const result = await this.authDataSource.signInWithApple();
    return this.mapToUser(result.user);
  }

  // Password recovery
  async sendPasswordResetEmail(email: string): Promise<void> {
    return await this.authDataSource.sendPasswordResetEmail(email);
  }

  // Auth state monitoring
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.authDataSource.onAuthStateChanged((firebaseUser: any) => {
      const user = firebaseUser ? this.mapToUser(firebaseUser) : null;
      callback(user);
    });
  }

  // Helper methods to map Firebase objects to domain entities
  private mapToUser(firebaseUser: any): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      emailVerified: firebaseUser.emailVerified || false,
      createdAt: firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
      lastSignInAt: firebaseUser.metadata?.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : undefined
    };
  }

  private mapToClaims(firebaseClaims: any): Claims {
    return {
      role: firebaseClaims.role || 'student',
      academiaId: firebaseClaims.academiaId,
      permissions: firebaseClaims.permissions || []
    };
  }
}
