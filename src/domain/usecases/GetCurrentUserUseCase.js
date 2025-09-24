/**
 * GetCurrentUserUseCase - Domain Layer
 * Implementa a lógica de negócio para obter o usuário atual
 */
export class GetCurrentUserUseCase {
  constructor(authRepository, userRepository, academyRepository) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
    this.academyRepository = academyRepository;
  }

  /**
   * Executa a obtenção do usuário atual completo
   * @returns {Promise<Object>}
   */
  async execute() {
    try {
      // Obter usuário do Firebase Auth
      const firebaseUser = this.authRepository.getCurrentUser();
      
      if (!firebaseUser) {
        return {
          user: null,
          userProfile: null,
          academy: null,
          customClaims: null
        };
      }

      // Buscar perfil completo do usuário
      const userProfile = await this.userRepository.getUserById(firebaseUser.uid);
      
      // Buscar custom claims
      const customClaims = await this.authRepository.getCustomClaims();

      // Buscar dados da academia se existir
      let academy = null;
      const academiaId = userProfile?.academiaId || customClaims?.academiaId;
      
      if (academiaId) {
        academy = await this.academyRepository.getAcademyById(academiaId);
      }

      return {
        user: firebaseUser,
        userProfile,
        academy,
        customClaims
      };
    } catch (error) {
      console.error('❌ GetCurrentUserUseCase.execute:', error);
      throw error;
    }
  }

  /**
   * Observa mudanças no estado de autenticação
   * @param {Function} callback 
   * @returns {Function} unsubscribe function
   */
  onAuthStateChanged(callback) {
    return this.authRepository.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const result = await this.execute();
          callback(result);
        } else {
          callback({
            user: null,
            userProfile: null,
            academy: null,
            customClaims: null
          });
        }
      } catch (error) {
        console.error('❌ GetCurrentUserUseCase.onAuthStateChanged:', error);
        callback({
          user: firebaseUser,
          userProfile: null,
          academy: null,
          customClaims: null
        });
      }
    });
  }
}