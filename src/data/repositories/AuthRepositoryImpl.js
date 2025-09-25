import { AuthRepository } from '@domain/repositories/AuthRepository';
import { FirebaseAuthDataSource } from '@data/datasources/FirebaseAuthDataSource';

/**
 * AuthRepositoryImpl - Data Layer
 * Implementação concreta do AuthRepository usando Firebase
 */
export class AuthRepositoryImpl extends AuthRepository {
  constructor() {
    super();
    this.authDataSource = new FirebaseAuthDataSource();
  }

  /**
   * Realiza login com email e senha
   */
  async signInWithEmailAndPassword(credentials) {
    return await this.authDataSource.signInWithEmailAndPassword(
      credentials.email, 
      credentials.password
    );
  }

  /**
   * Realiza cadastro com email e senha
   */
  async signUpWithEmailAndPassword(credentials, userData) {
    return await this.authDataSource.createUserWithEmailAndPassword(
      credentials.email, 
      credentials.password
    );
  }

  /**
   * Realiza login com Google
   */
  async signInWithGoogle() {
    return await this.authDataSource.signInWithGoogle();
  }

  /**
   * Realiza login com Facebook
   */
  async signInWithFacebook() {
    return await this.authDataSource.signInWithFacebook();
  }

  /**
   * Realiza login com Microsoft
   */
  async signInWithMicrosoft() {
    return await this.authDataSource.signInWithMicrosoft();
  }

  /**
   * Realiza login com Apple
   */
  async signInWithApple() {
    return await this.authDataSource.signInWithApple();
  }

  /**
   * Realiza logout
   */
  async signOut() {
    return await this.authDataSource.signOut();
  }

  /**
   * Envia email de reset de senha
   */
  async sendPasswordResetEmail(email) {
    return await this.authDataSource.sendPasswordResetEmail(email);
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser() {
    return this.authDataSource.getCurrentUser();
  }

  /**
   * Observa mudanças no estado de autenticação
   */
  onAuthStateChanged(callback) {
    return this.authDataSource.onAuthStateChanged(callback);
  }

  /**
   * Obtém custom claims do usuário
   */
  async getCustomClaims() {
    return await this.authDataSource.getCustomClaims();
  }

  /**
   * Força refresh do token para obter claims atualizados
   */
  async refreshToken() {
    return await this.authDataSource.refreshToken();
  }
}