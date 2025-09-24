/**
 * UserRepository Interface - Domain Layer
 * Define o contrato para operações com usuários
 */
export class UserRepository {
  /**
   * Busca um usuário por ID
   * @param {string} userId 
   * @returns {Promise<User|null>}
   */
  async getUserById(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Cria ou atualiza um usuário
   * @param {User} user 
   * @returns {Promise<User>}
   */
  async saveUser(user) {
    throw new Error('Method not implemented');
  }

  /**
   * Atualiza parcialmente um usuário
   * @param {string} userId 
   * @param {Object} updates 
   * @returns {Promise<User>}
   */
  async updateUser(userId, updates) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove um usuário
   * @param {string} userId 
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    throw new Error('Method not implemented');
  }
}