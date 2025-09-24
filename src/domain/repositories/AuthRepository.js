/**
 * AuthRepository Interface - Domain Layer
 * Define o contrato para operações de autenticação
 */
export class AuthRepository {
  /**
   * Realiza login com email e senha
   * @param {AuthCredentials} credentials 
   * @returns {Promise<AuthResult>}
   */
  async signInWithEmailAndPassword(credentials) {
    throw new Error('Method not implemented');
  }

  /**
   * Realiza cadastro com email e senha
   * @param {AuthCredentials} credentials 
   * @param {Object} userData
   * @returns {Promise<AuthResult>}
   */
  async signUpWithEmailAndPassword(credentials, userData) {
    throw new Error('Method not implemented');
  }

  /**
   * Realiza login com Google
   * @returns {Promise<AuthResult>}
   */
  async signInWithGoogle() {
    throw new Error('Method not implemented');
  }

  /**
   * Realiza login com Facebook
   * @returns {Promise<AuthResult>}
   */
  async signInWithFacebook() {
    throw new Error('Method not implemented');
  }

  /**
   * Realiza login com Microsoft
   * @returns {Promise<AuthResult>}
   */
  async signInWithMicrosoft() {
    throw new Error('Method not implemented');
  }

  /**
   * Realiza login com Apple
   * @returns {Promise<AuthResult>}
   */
  async signInWithApple() {
    throw new Error('Method not implemented');
  }

  /**
   * Realiza logout
   * @returns {Promise<void>}
   */
  async signOut() {
    throw new Error('Method not implemented');
  }

  /**
   * Envia email de reset de senha
   * @param {string} email 
   * @returns {Promise<void>}
   */
  async sendPasswordResetEmail(email) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtém o usuário atual
   * @returns {User|null}
   */
  getCurrentUser() {
    throw new Error('Method not implemented');
  }

  /**
   * Observa mudanças no estado de autenticação
   * @param {Function} callback 
   * @returns {Function} unsubscribe function
   */
  onAuthStateChanged(callback) {
    throw new Error('Method not implemented');
  }

  /**
   * Obtém custom claims do usuário
   * @returns {Promise<Object>}
   */
  async getCustomClaims() {
    throw new Error('Method not implemented');
  }

  /**
   * Força refresh do token para obter claims atualizados
   * @returns {Promise<string>}
   */
  async refreshToken() {
    throw new Error('Method not implemented');
  }
}