export interface StudentProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string | Date;
  academiaId: string;
  modality?: string;
  belt?: string;
  graduationDate?: string | Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Student Entity
 */
export class Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string | Date;
  academiaId: string;
  modality?: string;
  belt?: string;
  graduationDate?: string | Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

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
  }: StudentProps) {
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
  validate(): boolean {
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
  toObject(): StudentProps {
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
  name: string;
  email: string;
  phone?: string;
  birthDate?: string | Date;
  academiaId: string;
  modality?: string;
  belt: string;
  isActive: boolean;

  constructor({
    name,
    email,
    phone,
    birthDate,
    academiaId,
    modality,
    belt = 'Branca',
    isActive = true
  }: Omit<StudentProps, 'id' | 'createdAt' | 'updatedAt'> & { belt?: string }) {
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
