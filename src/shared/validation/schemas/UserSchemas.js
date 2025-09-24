import { z } from 'zod';
import { schemas } from './AuthSchemas';

/**
 * UserSchemas - Validation Layer
 * Schemas Zod para validação de dados do usuário
 */

/**
 * Schema base para usuário
 */
export const userBaseSchema = z.object({
  id: z.string().min(1, 'ID do usuário é obrigatório'),
  email: schemas.email,
  name: schemas.name,
  userType: schemas.userType,
  isActive: z.boolean().default(true),
  profileCompleted: z.boolean().default(false)
});

/**
 * Schema para criação de usuário
 */
export const createUserSchema = z.object({
  email: schemas.email,
  name: schemas.name,
  photoURL: z.string().url('URL da foto inválida').optional().nullable(),
  userType: schemas.userType.optional(),
  academiaId: z.string().min(1, 'ID da academia inválido').optional().nullable(),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Telefone deve conter apenas números, espaços, hífens e parênteses')
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(20, 'Telefone muito longo')
    .optional()
    .nullable(),
  dateOfBirth: z.date().max(new Date(), 'Data de nascimento não pode ser no futuro').optional().nullable(),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória').optional(),
    number: z.string().min(1, 'Número é obrigatório').optional(),
    complement: z.string().optional().nullable(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório').optional(),
    city: z.string().min(1, 'Cidade é obrigatória').optional(),
    state: z.string().min(2, 'Estado deve ter 2 caracteres').max(2, 'Estado deve ter 2 caracteres').optional(),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP deve ter o formato 00000-000').optional(),
    country: z.string().min(1, 'País é obrigatório').default('Brasil').optional()
  }).optional().nullable(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Nome do contato de emergência é obrigatório'),
    phone: z.string().min(10, 'Telefone do contato de emergência é obrigatório'),
    relationship: z.string().min(1, 'Relacionamento é obrigatório')
  }).optional().nullable(),
  isActive: z.boolean().default(true),
  profileCompleted: z.boolean().default(false)
});

/**
 * Schema para atualização de usuário
 */
export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().min(1, 'ID do usuário é obrigatório').optional()
});

/**
 * Schema para usuário estudante
 */
export const studentUserSchema = createUserSchema.extend({
  userType: z.literal('student').or(z.literal('aluno')),
  academiaId: z.string().min(1, 'Academia é obrigatória para estudantes'),
  studentData: z.object({
    belt: z.string().min(1, 'Graduação é obrigatória').optional(),
    beltLevel: z.number().min(0).max(10).optional(),
    startDate: z.date().max(new Date(), 'Data de início não pode ser no futuro').optional(),
    plan: z.string().min(1, 'Plano é obrigatório').optional(),
    paymentDay: z.number().min(1, 'Dia de pagamento deve ser entre 1 e 31').max(31, 'Dia de pagamento deve ser entre 1 e 31').optional(),
    injuries: z.array(z.object({
      type: z.string().min(1, 'Tipo da lesão é obrigatório'),
      description: z.string().min(1, 'Descrição da lesão é obrigatória'),
      date: z.date().max(new Date(), 'Data da lesão não pode ser no futuro'),
      isActive: z.boolean().default(true)
    })).optional(),
    medicalRestrictions: z.array(z.string()).optional()
  }).optional()
});

/**
 * Schema para usuário instrutor
 */
export const instructorUserSchema = createUserSchema.extend({
  userType: z.literal('instructor').or(z.literal('instrutor')),
  academiaId: z.string().min(1, 'Academia é obrigatória para instrutores'),
  instructorData: z.object({
    specializations: z.array(z.string().min(1, 'Especialização não pode estar vazia')).optional(),
    certifications: z.array(z.object({
      name: z.string().min(1, 'Nome da certificação é obrigatório'),
      institution: z.string().min(1, 'Instituição é obrigatória'),
      date: z.date().max(new Date(), 'Data da certificação não pode ser no futuro'),
      expiryDate: z.date().optional()
    })).optional(),
    yearsOfExperience: z.number().min(0, 'Anos de experiência não pode ser negativo').optional(),
    bio: z.string().max(500, 'Bio não pode ter mais que 500 caracteres').optional(),
    hourlyRate: z.number().min(0, 'Taxa por hora não pode ser negativa').optional()
  }).optional()
});

/**
 * Schema para usuário administrador
 */
export const adminUserSchema = createUserSchema.extend({
  userType: z.literal('admin').or(z.literal('administrador')),
  academiaId: z.string().min(1, 'Academia é obrigatória para administradores'),
  adminData: z.object({
    permissions: z.array(z.string()).optional(),
    role: z.string().min(1, 'Cargo é obrigatório').optional(),
    accessLevel: z.number().min(1, 'Nível de acesso deve ser maior que 0').max(10, 'Nível de acesso deve ser menor que 10').optional()
  }).optional()
});

/**
 * Schema para validação de tipo de usuário específico
 */
export const validateUserByType = (userType) => {
  switch (userType) {
    case 'student':
    case 'aluno':
      return studentUserSchema;
    case 'instructor':
    case 'instrutor':
      return instructorUserSchema;
    case 'admin':
    case 'administrador':
      return adminUserSchema;
    default:
      return createUserSchema;
  }
};

/**
 * Schema para busca/filtro de usuários
 */
export const userFiltersSchema = z.object({
  userType: schemas.userType.optional(),
  academiaId: z.string().min(1, 'ID da academia inválido').optional(),
  isActive: z.boolean().optional(),
  profileCompleted: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
});