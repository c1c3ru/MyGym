/**
 * AuthCredentials Entity - Domain Model
 * Representa as credenciais de autenticação
 */
export class AuthCredentials {
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }

  /**
   * Valida se as credenciais são válidas
   */
  isValid() {
    return this.email && this.password && this.email.includes('@');
  }

  /**
   * Converte para objeto plain JavaScript
   */
  toJSON() {
    return {
      email: this.email,
      password: this.password
    };
  }
}

/**
 * AuthResult Entity - Domain Model
 * Representa o resultado de uma operação de autenticação
 */
export class AuthResult {
  constructor({ user, success, error, customClaims }) {
    this.user = user;
    this.success = success;
    this.error = error;
    this.customClaims = customClaims;
  }

  /**
   * Verifica se a autenticação foi bem-sucedida
   */
  isSuccess() {
    return this.success && this.user && !this.error;
  }

  /**
   * Converte para objeto plain JavaScript
   */
  toJSON() {
    return {
      user: this.user,
      success: this.success,
      error: this.error,
      customClaims: this.customClaims
    };
  }
}