import { AuthCredentials } from '../entities/AuthCredentials.js';

/**
 * SignInUseCase - Domain Layer
 * Implementa a lógica de negócio para login
 */
export class SignInUseCase {
  constructor(authRepository, userRepository) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
  }

  /**
   * Executa o login com email e senha
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<AuthResult>}
   */
  async executeWithEmailAndPassword(email, password) {
    try {
      // Validar credenciais
      const credentials = new AuthCredentials({ email, password });
      if (!credentials.isValid()) {
        throw new Error('Credenciais inválidas');
      }

      // Realizar autenticação
      const authResult = await this.authRepository.signInWithEmailAndPassword(credentials);
      
      if (!authResult.isSuccess()) {
        return authResult;
      }

      // Buscar perfil do usuário
      const userProfile = await this.userRepository.getUserById(authResult.user.uid);
      
      return {
        ...authResult,
        userProfile
      };
    } catch (error) {
      console.error('❌ SignInUseCase.executeWithEmailAndPassword:', error);
      throw error;
    }
  }

  /**
   * Executa o login com Google
   * @returns {Promise<AuthResult>}
   */
  async executeWithGoogle() {
    try {
      const authResult = await this.authRepository.signInWithGoogle();
      
      if (!authResult.isSuccess()) {
        return authResult;
      }

      // Buscar ou criar perfil do usuário
      let userProfile = await this.userRepository.getUserById(authResult.user.uid);
      
      if (!userProfile) {
        // Criar perfil básico se não existir
        userProfile = await this._createBasicProfile(authResult.user);
      }

      return {
        ...authResult,
        userProfile
      };
    } catch (error) {
      console.error('❌ SignInUseCase.executeWithGoogle:', error);
      throw error;
    }
  }

  /**
   * Executa o login com Facebook
   * @returns {Promise<AuthResult>}
   */
  async executeWithFacebook() {
    try {
      const authResult = await this.authRepository.signInWithFacebook();
      
      if (!authResult.isSuccess()) {
        return authResult;
      }

      let userProfile = await this.userRepository.getUserById(authResult.user.uid);
      
      if (!userProfile) {
        userProfile = await this._createBasicProfile(authResult.user);
      }

      return {
        ...authResult,
        userProfile
      };
    } catch (error) {
      console.error('❌ SignInUseCase.executeWithFacebook:', error);
      throw error;
    }
  }

  /**
   * Executa o login com Microsoft
   * @returns {Promise<AuthResult>}
   */
  async executeWithMicrosoft() {
    try {
      const authResult = await this.authRepository.signInWithMicrosoft();
      
      if (!authResult.isSuccess()) {
        return authResult;
      }

      let userProfile = await this.userRepository.getUserById(authResult.user.uid);
      
      if (!userProfile) {
        userProfile = await this._createBasicProfile(authResult.user);
      }

      return {
        ...authResult,
        userProfile
      };
    } catch (error) {
      console.error('❌ SignInUseCase.executeWithMicrosoft:', error);
      throw error;
    }
  }

  /**
   * Executa o login com Apple
   * @returns {Promise<AuthResult>}
   */
  async executeWithApple() {
    try {
      const authResult = await this.authRepository.signInWithApple();
      
      if (!authResult.isSuccess()) {
        return authResult;
      }

      let userProfile = await this.userRepository.getUserById(authResult.user.uid);
      
      if (!userProfile) {
        userProfile = await this._createBasicProfile(authResult.user);
      }

      return {
        ...authResult,
        userProfile
      };
    } catch (error) {
      console.error('❌ SignInUseCase.executeWithApple:', error);
      throw error;
    }
  }

  /**
   * Cria um perfil básico para usuários de login social
   * @private
   */
  async _createBasicProfile(firebaseUser) {
    const basicProfile = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || null,
      userType: null, // Será definido na tela de seleção
      academiaId: null,
      profileCompleted: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.userRepository.saveUser(basicProfile);
  }
}