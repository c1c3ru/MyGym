// Get students use case

import { BaseUseCase } from '../../auth/usecases/base';
import { StudentsRepository } from '@domain/repositories';
import { Student } from '@domain/students/entities';
import { z } from 'zod';

const getStudentsSchema = z.object({
  academiaId: z.string().min(1, 'Academia ID é obrigatório'),
  filters: z.object({
    active: z.boolean().optional(),
    modalityId: z.string().optional(),
    classId: z.string().optional(),
    instructorId: z.string().optional(),
    paymentStatus: z.string().optional(),
    graduation: z.string().optional(),
    search: z.string().optional()
  }).optional()
});

export type GetStudentsInput = z.infer<typeof getStudentsSchema>;

export class GetStudentsUseCase extends BaseUseCase<GetStudentsInput, Student[]> {
  constructor(private studentsRepository: StudentsRepository) {
    super();
  }

  async execute(input: GetStudentsInput): Promise<Student[]> {
    // Validate input
    const validatedInput = this.validateInput(input, getStudentsSchema);
    
    try {
      const { academiaId, filters } = validatedInput;
      
      // Apply filters based on input
      if (filters?.search) {
        return await this.studentsRepository.search(academiaId, filters.search) as Student[];
      }
      
      if (filters?.modalityId) {
        return await this.studentsRepository.getByModality(academiaId, filters.modalityId) as Student[];
      }
      
      if (filters?.classId) {
        return await this.studentsRepository.getByClass(academiaId, filters.classId) as Student[];
      }
      
      if (filters?.instructorId) {
        return await this.studentsRepository.getByInstructor(academiaId, filters.instructorId) as Student[];
      }
      
      if (filters?.paymentStatus) {
        return await this.studentsRepository.getByPaymentStatus(academiaId, filters.paymentStatus) as Student[];
      }
      
      if (filters?.graduation) {
        return await this.studentsRepository.getByGraduation(academiaId, filters.graduation) as Student[];
      }
      
      if (filters?.active === true) {
        return await this.studentsRepository.getActiveStudents(academiaId) as Student[];
      }
      
      if (filters?.active === false) {
        return await this.studentsRepository.getInactiveStudents(academiaId) as Student[];
      }
      
      // No filters, return all students
      return await this.studentsRepository.getAll(academiaId) as Student[];
      
    } catch (error: any) {
      console.error('Error in GetStudentsUseCase:', error);
      throw new Error(`Failed to get students: ${error.message}`);
    }
  }
}
