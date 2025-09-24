/**
 * SignOutUseCase - Domain Layer
 * Implementa a lógica de negócio para logout
 */
export class SignOutUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  /**
   * Executa o logout
   * @returns {Promise<void>}
   */
  async execute() {
    try {
      await this.authRepository.signOut();
      console.log('✅ SignOutUseCase: Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ SignOutUseCase.execute:', error);
      throw error;
    }
  }
}