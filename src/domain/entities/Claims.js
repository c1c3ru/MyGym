/**
 * Claims Entity for user authentication and authorization
 */
export class Claims {
  constructor({
    role = 'student',
    academiaId = null,
    permissions = [],
    isActive = true,
    lastLogin = null,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.role = role;
    this.academiaId = academiaId;
    this.permissions = permissions;
    this.isActive = isActive;
    this.lastLogin = lastLogin;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Checks if user has a specific permission
   */
  hasPermission(permission) {
    return this.permissions.includes(permission);
  }

  /**
   * Checks if user has any of the specified permissions
   */
  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Checks if user has all of the specified permissions
   */
  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Adds a permission to the user
   */
  addPermission(permission) {
    if (!this.hasPermission(permission)) {
      this.permissions.push(permission);
      this.updatedAt = new Date();
    }
  }

  /**
   * Removes a permission from the user
   */
  removePermission(permission) {
    const index = this.permissions.indexOf(permission);
    if (index > -1) {
      this.permissions.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * Checks if user is admin
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Checks if user is instructor
   */
  isInstructor() {
    return this.role === 'instructor';
  }

  /**
   * Checks if user is student
   */
  isStudent() {
    return this.role === 'student';
  }

  /**
   * Updates last login timestamp
   */
  updateLastLogin() {
    this.lastLogin = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Validates claims data
   */
  validate() {
    const validRoles = ['admin', 'instructor', 'student'];
    if (!validRoles.includes(this.role)) {
      throw new Error(`Invalid role: ${this.role}`);
    }
    
    if (!Array.isArray(this.permissions)) {
      throw new Error('Permissions must be an array');
    }
    
    return true;
  }

  /**
   * Converts to plain object
   */
  toObject() {
    return {
      role: this.role,
      academiaId: this.academiaId,
      permissions: [...this.permissions],
      isActive: this.isActive,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Creates Claims from Firebase custom claims
   */
  static fromFirebaseClaims(claims) {
    return new Claims({
      role: claims.role || 'student',
      academiaId: claims.academiaId || null,
      permissions: claims.permissions || [],
      isActive: claims.isActive !== false,
      lastLogin: claims.lastLogin ? new Date(claims.lastLogin) : null,
      createdAt: claims.createdAt ? new Date(claims.createdAt) : new Date(),
      updatedAt: claims.updatedAt ? new Date(claims.updatedAt) : new Date()
    });
  }
}
