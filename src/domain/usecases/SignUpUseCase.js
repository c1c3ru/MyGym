import { AuthCredentials } from '@components/entities/AuthCredentials.js';
import { User } from '@components/entities/User.js';

/**
 * SignUpUseCase - Domain Layer
 * Implementa a lógica de negócio para cadastro
 */
export class SignUpUseCase {
  constructor(authRepository, userRepository) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
  }

  /**
   * Executa o cadastro com email e senha
   * @param {string} email 
   * @param {string} password 
   * @param {Object} userData 
   * @returns {Promise<AuthResult>}
   */
  async execute(email, password, userData = {}) {
    try {
      // Validar credenciais
      const credentials = new AuthCredentials({ email, password });
      if (!credentials.isValid()) {
        throw new Error('Credenciais inválidas');
      }

      // Validar dados do usuário
      this._validateUserData(userData);

      // Realizar cadastro
      const authResult = await this.authRepository.signUpWithEmailAndPassword(credentials, userData);
      
      if (!authResult.isSuccess()) {
        return authResult;
      }

      // Criar perfil completo do usuário
      const userProfile = await this._createUserProfile(authResult.user, userData);

      return {
        ...authResult,
        userProfile
      };
    } catch (error) {
      console.error('❌ SignUpUseCase.execute:', error);
      throw error;
    }
  }

  /**
   * Valida os dados do usuário
   * @private
   */
  _validateUserData(userData) {
    if (!userData.name || userData.name.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }

    if (userData.userType && !['student', 'instructor', 'admin', 'aluno', 'instrutor', 'administrador'].includes(userData.userType)) {
      throw new Error('Tipo de usuário inválido');
    }
  }

  /**
   * Cria o perfil do usuário
   * @private
   */
  async _createUserProfile(firebaseUser, userData) {
    const user = new User({
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: userData.name,
      photoURL: userData.photoURL || firebaseUser.photoURL || null,
      userType: userData.userType || null,
      academiaId: userData.academiaId || null,
      profileCompleted: !!(userData.userType && userData.academiaId),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return await this.userRepository.saveUser(user);
  }
}