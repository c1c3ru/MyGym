/**
 * Students Repository Interface
 * Defines the contract for student data operations
 */

import { Student, StudentProfile, CreateStudentData, UpdateStudentData, StudentStats } from '../students/entities';

export interface StudentsRepository {
  // CRUD operations
  create(academiaId: string, data: CreateStudentData): Promise<Student>;
  getById(academiaId: string, studentId: string): Promise<StudentProfile | null>;
  getAll(academiaId: string): Promise<Student[]>;
  update(academiaId: string, studentId: string, data: UpdateStudentData): Promise<Student>;
  delete(academiaId: string, studentId: string): Promise<void>;
  
  // Query operations
  getByEmail(academiaId: string, email: string): Promise<Student | null>;
  getByModality(academiaId: string, modalityId: string): Promise<Student[]>;
  getByClass(academiaId: string, classId: string): Promise<Student[]>;
  getByInstructor(academiaId: string, instructorId: string): Promise<Student[]>;
  
  // Filter operations
  getActiveStudents(academiaId: string): Promise<Student[]>;
  getInactiveStudents(academiaId: string): Promise<Student[]>;
  getByPaymentStatus(academiaId: string, status: string): Promise<Student[]>;
  getByGraduation(academiaId: string, graduation: string): Promise<Student[]>;
  
  // Search operations
  search(academiaId: string, query: string): Promise<Student[]>;
  searchByName(academiaId: string, name: string): Promise<Student[]>;
  
  // Statistics
  getStats(academiaId: string, studentId: string): Promise<StudentStats>;
  getAcademyStats(academiaId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byModality: Record<string, number>;
    byPaymentStatus: Record<string, number>;
  }>;
  
  // Real-time subscriptions
  subscribeToStudent(academiaId: string, studentId: string, callback: (student: StudentProfile | null) => void): () => void;
  subscribeToStudents(academiaId: string, callback: (students: Student[]) => void): () => void;
  subscribeToStudentsByClass(academiaId: string, classId: string, callback: (students: Student[]) => void): () => void;
}

export interface StudentGraduationsRepository {
  // Graduation operations
  addGraduation(academiaId: string, studentId: string, graduation: Omit<import('../students/entities').Graduation, 'id'>): Promise<import('../students/entities').Graduation>;
  getGraduations(academiaId: string, studentId: string): Promise<import('../students/entities').Graduation[]>;
  updateGraduation(academiaId: string, studentId: string, graduationId: string, data: Partial<import('../students/entities').Graduation>): Promise<import('../students/entities').Graduation>;
  deleteGraduation(academiaId: string, studentId: string, graduationId: string): Promise<void>;
  
  // Graduation queries
  getGraduationsByLevel(academiaId: string, level: string): Promise<import('../students/entities').Graduation[]>;
  getGraduationsByModality(academiaId: string, modality: string): Promise<import('../students/entities').Graduation[]>;
  getGraduationsByInstructor(academiaId: string, instructorId: string): Promise<import('../students/entities').Graduation[]>;
  getGraduationsByDateRange(academiaId: string, startDate: Date, endDate: Date): Promise<import('../students/entities').Graduation[]>;
}
