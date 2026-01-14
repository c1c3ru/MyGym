// Repository interfaces for authentication domain

import { User, UserProfile, Claims, Academia, SignInCredentials, SignUpData, AuthSession } from './entities';

export interface AuthRepository {
  // Authentication methods
  signInWithEmail(credentials: SignInCredentials): Promise<User>;
  signInWithEmailAndPassword(credentials: SignInCredentials): Promise<User>;
  signUpWithEmail(data: SignUpData): Promise<User>;
  signUpWithEmailAndPassword(data: SignUpData): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;

  // User profile methods
  createUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  getUserProfile(userId: string): Promise<UserProfile | null>;
  updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;

  // Claims methods
  getUserClaims(user: User): Promise<Claims | null>;
  getCustomClaims(): Promise<Claims | null>;
  refreshUserToken(user: User): Promise<void>;
  refreshToken(): Promise<void>;

  // Academia methods
  getAcademia(academiaId: string): Promise<Academia | null>;

  // Social authentication
  signInWithGoogle(): Promise<User>;
  signInWithFacebook(): Promise<User>;
  signInWithMicrosoft(): Promise<User>;
  signInWithApple(): Promise<User>;

  // Password recovery
  sendPasswordResetEmail(email: string): Promise<void>;

  // Auth state monitoring
  onAuthStateChanged(callback: (user: User | null) => void): () => void;

  // Helper methods for unified login flow
  getSignInMethodsForEmail(email: string): Promise<string[]>;
  getUserProfileByEmail(email: string): Promise<UserProfile | null>;
}

export interface UserRepository {
  findById(id: string): Promise<UserProfile | null>;
  findByEmail(email: string): Promise<UserProfile | null>;
  create(data: UserProfile): Promise<UserProfile>;
  update(id: string, data: Partial<UserProfile>): Promise<UserProfile>;
  delete(id: string): Promise<void>;
}

export interface AcademiaRepository {
  findById(id: string): Promise<Academia | null>;
  findAll(): Promise<Academia[]>;
  findByUserId(userId: string): Promise<Academia[]>;
}

export interface TokenRepository {
  getCurrentToken(): Promise<string | null>;
  refreshToken(): Promise<string>;
  validateToken(token: string): Promise<boolean>;
  clearToken(): Promise<void>;
}