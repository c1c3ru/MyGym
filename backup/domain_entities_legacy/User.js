/**
 * User Entity - Domain Model
 * Representa um usuário no sistema
 */
export class User {
  constructor(uid, email, name, photoURL, academiaId, isActive = true, profileCompleted = false, createdAt, updatedAt) {
    this.uid = uid;
    this.email = email;
    this.name = name;
    this.photoURL = photoURL;
    this.academiaId = academiaId;
    this.isActive = isActive;
    this.profileCompleted = profileCompleted;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  /**
   * Verifica se o usuário é um administrador
   * Nota: Agora deve usar custom claims em vez desta função
   */
  isAdmin() {
    // Deprecated: Use custom claims em vez desta função
    console.warn('User.isAdmin() is deprecated. Use custom claims instead.');
    return false; // Fallback - assumir que não é admin se não tiver claims
  }

  /**
   * Verifica se o usuário é um instrutor
   * Nota: Agora deve usar custom claims em vez desta função
   */
  isInstructor() {
    // Deprecated: Use custom claims em vez desta função
    console.warn('User.isInstructor() is deprecated. Use custom claims instead.');
    return false; // Fallback - assumir que não é instrutor se não tiver claims
  }

  /**
   * Verifica se o usuário é um aluno
   * Nota: Agora deve usar custom claims em vez desta função
   */
  isStudent() {
    // Deprecated: Use custom claims em vez desta função
    console.warn('User.isStudent() is deprecated. Use custom claims instead.');
    return true; // Fallback - assumir que é estudante se não tiver claims
  }

  /**
   * Verifica se o perfil está completo
   */
  hasCompleteProfile() {
    return this.profileCompleted && this.academiaId;
  }

  /**
   * Atualiza os dados do usuário
   */
  update(data) {
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        this[key] = data[key];
      }
    });
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Converte para objeto plain JavaScript
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      photoURL: this.photoURL,
      userType: this.userType,
      academiaId: this.academiaId,
      isActive: this.isActive,
      profileCompleted: this.profileCompleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}