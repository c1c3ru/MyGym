/**
 * AcademyRepository Interface - Domain Layer
 * Define o contrato para operações com academias
 */
export class AcademyRepository {
  /**
   * Busca uma academia por ID
   * @param {string} academyId 
   * @returns {Promise<Academy|null>}
   */
  async getAcademyById(academyId) {
    throw new Error('Method not implemented');
  }

  /**
   * Busca academias por filtros
   * @param {Object} filters 
   * @returns {Promise<Academy[]>}
   */
  async getAcademies(filters = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Cria ou atualiza uma academia
   * @param {Academy} academy 
   * @returns {Promise<Academy>}
   */
  async saveAcademy(academy) {
    throw new Error('Method not implemented');
  }

  /**
   * Atualiza parcialmente uma academia
   * @param {string} academyId 
   * @param {Object} updates 
   * @returns {Promise<Academy>}
   */
  async updateAcademy(academyId, updates) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove uma academia
   * @param {string} academyId 
   * @returns {Promise<void>}
   */
  async deleteAcademy(academyId) {
    throw new Error('Method not implemented');
  }
}