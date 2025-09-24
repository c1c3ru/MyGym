/**
 * RefreshTokenUseCase - Domain Layer
 * Implementa a lógica de negócio para refresh de token e custom claims
 */
export class RefreshTokenUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  /**
   * Executa o refresh do token
   * @returns {Promise<string>}
   */
  async execute() {
    try {
      const token = await this.authRepository.refreshToken();
      console.log('✅ RefreshTokenUseCase: Token atualizado com sucesso');
      return token;
    } catch (error) {
      console.error('❌ RefreshTokenUseCase.execute:', error);
      throw error;
    }
  }

  /**
   * Aguarda até que os custom claims sejam atualizados
   * @param {string} expectedAcademiaId 
   * @param {number} maxAttempts 
   * @param {number} delayMs 
   * @returns {Promise<Object>}
   */
  async waitForClaimsUpdate(expectedAcademiaId, maxAttempts = 10, delayMs = 1000) {
    console.log('⏳ RefreshTokenUseCase.waitForClaimsUpdate: Aguardando atualização dos claims...', {
      expectedAcademiaId,
      maxAttempts,
      delayMs
    });
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔄 RefreshTokenUseCase: Tentativa ${attempt}/${maxAttempts}`);
        
        // Forçar refresh do token
        await this.execute();
        
        // Verificar se os claims foram atualizados
        const claims = await this.authRepository.getCustomClaims();
        
        if (claims && claims.academiaId === expectedAcademiaId) {
          console.log('✅ RefreshTokenUseCase: Claims atualizados com sucesso!');
          return claims;
        }
        
        if (attempt < maxAttempts) {
          console.log(`⏳ RefreshTokenUseCase: Claims ainda não atualizados, aguardando ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error(`❌ RefreshTokenUseCase: Erro na tentativa ${attempt}:`, error);
        
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }
    
    console.log('⚠️ RefreshTokenUseCase: Timeout - claims não foram atualizados no tempo esperado');
    return null;
  }
}