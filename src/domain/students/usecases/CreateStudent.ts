// Create student use case

import { BaseUseCase } from '@auth/usecases/base';
import { StudentsRepository } from '@domain/repositories';
import { Student, CreateStudentData } from '@domain/entities';
import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  zipCode: z.string().min(8, 'CEP deve ter 8 dígitos')
});

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Nome do contato é obrigatório'),
  phone: z.string().min(10, 'Telefone do contato é obrigatório'),
  relationship: z.string().min(1, 'Parentesco é obrigatório')
});

const createStudentSchema = z.object({
  academiaId: z.string().min(1, 'Academia ID é obrigatório'),
  data: z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').optional(),
    dateOfBirth: z.date().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: addressSchema.optional(),
    emergencyContact: emergencyContactSchema.optional(),
    modalities: z.array(z.string()).min(1, 'Pelo menos uma modalidade é obrigatória'),
    planId: z.string().optional()
  })
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export class CreateStudentUseCase extends BaseUseCase<CreateStudentInput, Student> {
  constructor(private studentsRepository: StudentsRepository) {
    super();
  }

  async execute(input: CreateStudentInput): Promise<Student> {
    // Validate input
    const validatedInput = this.validateInput(input, createStudentSchema);
    
    try {
      const { academiaId, data } = validatedInput;
      
      // Check if student with same email already exists
      const existingStudent = await this.studentsRepository.getByEmail(academiaId, data.email);
      if (existingStudent) {
        throw new Error('Já existe um aluno com este email');
      }
      
      // Create student
      const student = await this.studentsRepository.create(academiaId, data);
      
      console.log('✅ Student created successfully:', student.id);
      return student;
      
    } catch (error: any) {
      console.error('Error in CreateStudentUseCase:', error);
      throw new Error(`Failed to create student: ${error.message}`);
    }
  }
}
