/**
 * Student Entity
 */
export class Student {
  constructor({
    id,
    name,
    email,
    phone,
    birthDate,
    academiaId,
    modality,
    belt,
    graduationDate,
    isActive = true,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.birthDate = birthDate;
    this.academiaId = academiaId;
    this.modality = modality;
    this.belt = belt;
    this.graduationDate = graduationDate;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Validates student data
   */
  validate() {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Student name is required');
    }
    if (!this.email || !this.email.includes('@')) {
      throw new Error('Valid email is required');
    }
    if (!this.academiaId) {
      throw new Error('Academia ID is required');
    }
    return true;
  }

  /**
   * Converts to plain object
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      birthDate: this.birthDate,
      academiaId: this.academiaId,
      modality: this.modality,
      belt: this.belt,
      graduationDate: this.graduationDate,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Data structure for creating a new student
 */
export class CreateStudentData {
  constructor({
    name,
    email,
    phone,
    birthDate,
    academiaId,
    modality,
    belt = 'Branca',
    isActive = true
  }) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.birthDate = birthDate;
    this.academiaId = academiaId;
    this.modality = modality;
    this.belt = belt;
    this.isActive = isActive;
  }
}
