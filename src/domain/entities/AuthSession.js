/**
 * AuthSession Entity
 */
export class AuthSession {
  constructor({
    user,
    token,
    refreshToken,
    expiresAt,
    claims = {},
    academia = null,
    createdAt = new Date()
  }) {
    this.user = user;
    this.token = token;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
    this.claims = claims;
    this.academia = academia;
    this.createdAt = createdAt;
  }

  /**
   * Checks if the session is valid (not expired)
   */
  isValid() {
    return this.expiresAt && new Date() < new Date(this.expiresAt);
  }

  /**
   * Checks if the session needs refresh
   */
  needsRefresh() {
    if (!this.expiresAt) return false;
    const now = new Date();
    const expiresAt = new Date(this.expiresAt);
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return timeUntilExpiry < fiveMinutes;
  }

  /**
   * Gets user role from claims
   */
  getUserRole() {
    return this.claims?.role || 'student';
  }

  /**
   * Checks if user has specific role
   */
  hasRole(role) {
    return this.getUserRole() === role;
  }

  /**
   * Converts to plain object
   */
  toObject() {
    return {
      user: this.user?.toObject ? this.user.toObject() : this.user,
      token: this.token,
      refreshToken: this.refreshToken,
      expiresAt: this.expiresAt,
      claims: this.claims,
      academia: this.academia?.toObject ? this.academia.toObject() : this.academia,
      createdAt: this.createdAt
    };
  }
}
