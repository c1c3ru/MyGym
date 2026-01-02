import { auth, db } from '@infrastructure/services/firebase';

/**
 * FirebaseAdapter - Infrastructure Layer
 * Adaptador para Firebase, fornecendo uma interface unificada
 */
export class FirebaseAdapter {
  constructor() {
    this.auth = auth;
    this.db = db;
  }

  /**
   * Obtém a instância do Firebase Auth
   */
  getAuth() {
    return this.auth;
  }

  /**
   * Obtém a instância do Firestore
   */
  getFirestore() {
    return this.db;
  }

  /**
   * Verifica se o Firebase está inicializado
   */
  isInitialized() {
    return !!(this.auth && this.db);
  }

  /**
   * Obtém informações de configuração do Firebase
   */
  getConfig() {
    return {
      projectId: this.auth.app.options.projectId,
      authDomain: this.auth.app.options.authDomain,
      apiKey: this.auth.app.options.apiKey ? 'Presente' : 'Ausente'
    };
  }

  /**
   * Obtém o usuário atualmente autenticado
   */
  getCurrentUser() {
    return this.auth.currentUser;
  }

  /**
   * Verifica se há um usuário autenticado
   */
  isAuthenticated() {
    return !!this.auth.currentUser;
  }

  /**
   * Obtém o UID do usuário atual
   */
  getCurrentUserId() {
    return this.auth.currentUser?.uid || null;
  }

  /**
   * Obtém o email do usuário atual
   */
  getCurrentUserEmail() {
    return this.auth.currentUser?.email || null;
  }

  /**
   * Verifica se o email do usuário está verificado
   */
  isEmailVerified() {
    return this.auth.currentUser?.emailVerified || false;
  }

  /**
   * Log para debug do estado do Firebase
   */
  debugState() {
    console.log('🔥 FirebaseAdapter Debug:', {
      initialized: this.isInitialized(),
      authenticated: this.isAuthenticated(),
      currentUser: this.getCurrentUser()?.email || 'Nenhum',
      config: this.getConfig()
    });
  }
}