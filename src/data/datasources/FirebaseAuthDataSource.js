import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider
} from 'firebase/auth';
import { auth } from '@infrastructure/services/firebase';
import { AuthResult } from '@domain/entities/AuthCredentials';

/**
 * FirebaseAuthDataSource - Data Layer
 * Implementa operações de autenticação usando Firebase Auth
 */
export class FirebaseAuthDataSource {
  /**
   * Login com email e senha
   */
  async signInWithEmailAndPassword(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      return new AuthResult({
        user: userCredential.user,
        success: true,
        error: null
      });
    } catch (error) {
      console.error('❌ FirebaseAuthDataSource.signInWithEmailAndPassword:', error);
      
      return new AuthResult({
        user: null,
        success: false,
        error: this._mapAuthError(error)
      });
    }
  }

  /**
   * Cadastro com email e senha
   */
  async createUserWithEmailAndPassword(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      return new AuthResult({
        user: userCredential.user,
        success: true,
        error: null
      });
    } catch (error) {
      console.error('❌ FirebaseAuthDataSource.createUserWithEmailAndPassword:', error);
      
      return new AuthResult({
        user: null,
        success: false,
        error: this._mapAuthError(error)
      });
    }
  }

  /**
   * Login com Google
   */
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      
      return new AuthResult({
        user: result.user,
        success: true,
        error: null
      });
    } catch (error) {
      console.error('❌ FirebaseAuthDataSource.signInWithGoogle:', error);
      
      return new AuthResult({
        user: null,
        success: false,
        error: this._mapAuthError(error)
      });
    }
  }

  /**
   * Login com Facebook
   */
  async signInWithFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.addScope('public_profile');
      
      const result = await signInWithPopup(auth, provider);
      
      return new AuthResult({
        user: result.user,
        success: true,
        error: null
      });
    } catch (error) {
      console.error('❌ FirebaseAuthDataSource.signInWithFacebook:', error);
      
      return new AuthResult({
        user: null,
        success: false,
        error: this._mapAuthError(error)
      });
    }
  }

  /**
   * Login com Microsoft
   */
  async signInWithMicrosoft() {
    try {
      const provider = new OAuthProvider('microsoft.com');
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      
      return new AuthResult({
        user: result.user,
        success: true,
        error: null
      });
    } catch (error) {
      console.error('❌ FirebaseAuthDataSource.signInWithMicrosoft:', error);
      
      return new AuthResult({
        user: null,
        success: false,
        error: this._mapAuthError(error)
      });
    }
  }

  /**
   * Login com Apple
   */
  async signInWithApple() {
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      
      const result = await signInWithPopup(auth, provider);
      
      return new AuthResult({
        user: result.user,
        success: true,
        error: null
      });
    } catch (error) {
      console.error('❌ FirebaseAuthDataSource.signInWithApple:', error);
      
      return new AuthResult({
        user: null,
        success: false,
        error: this._mapAuthError(error)
      });
    }
  }

  /**
   * Logout
   */
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('❌ FirebaseAuthDataSource.signOut:', error);
      throw error;
    }
  }

  /**
   * Enviar email de reset de senha
   */
  async sendPasswordResetEmail(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('❌ FirebaseAuthDataSource.sendPasswordResetEmail:', error);
      throw this._mapAuthError(error);
    }
  }

  /**
   * Obter usuário atual
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Observar mudanças no estado de autenticação
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Obter custom claims do usuário
   */
  async getCustomClaims() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }
      
      const idTokenResult = await currentUser.getIdTokenResult();
      const claims = idTokenResult.claims;
      
      return {
        role: claims.role || null,
        academiaId: claims.academiaId || null,
        customClaims: claims
      };
    } catch (error) {
      console.error('❌ FirebaseAuthDataSource.getCustomClaims:', error);
      throw error;
    }
  }

  /**
   * Forçar refresh do token
   */
  async refreshToken() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Nenhum usuário logado');
      }
      
      const idToken = await currentUser.getIdToken(true);
      return idToken;
    } catch (error) {
      console.error('❌ FirebaseAuthDataSource.refreshToken:', error);
      throw error;
    }
  }

  /**
   * Mapear erros do Firebase Auth para mensagens amigáveis
   * @private
   */
  _mapAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Email já está em uso',
      'auth/weak-password': 'Senha muito fraca',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/network-request-failed': 'Erro de conexão',
      'auth/popup-closed-by-user': 'Login cancelado pelo usuário',
      'auth/cancelled-popup-request': 'Login cancelado'
    };

    const message = errorMessages[error.code] || error.message || 'Erro desconhecido';
    
    return {
      code: error.code,
      message,
      originalError: error
    };
  }
}