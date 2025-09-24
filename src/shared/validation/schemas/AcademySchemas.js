import { z } from 'zod';

/**
 * AcademySchemas - Validation Layer
 * Schemas Zod para validação de dados da academia
 */

/**
 * Schema para endereço
 */
const addressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado deve ter 2 caracteres').max(2, 'Estado deve ter 2 caracteres'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP deve ter o formato 00000-000'),
  country: z.string().min(1, 'País é obrigatório').default('Brasil')
});

/**
 * Schema para contato
 */
const contactSchema = z.object({
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Telefone deve conter apenas números, espaços, hífens e parênteses')
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(20, 'Telefone muito longo'),
  whatsapp: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'WhatsApp deve conter apenas números, espaços, hífens e parênteses')
    .min(10, 'WhatsApp deve ter pelo menos 10 dígitos')
    .max(20, 'WhatsApp muito longo')
    .optional(),
  email: z.string().email('Email deve ter um formato válido').optional(),
  website: z.string().url('Website deve ter um formato válido').optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional()
});

/**
 * Schema para horário de funcionamento
 */
const scheduleSchema = z.object({
  monday: z.object({
    isOpen: z.boolean().default(false),
    openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional(),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional()
  }).optional(),
  tuesday: z.object({
    isOpen: z.boolean().default(false),
    openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional(),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional()
  }).optional(),
  wednesday: z.object({
    isOpen: z.boolean().default(false),
    openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional(),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional()
  }).optional(),
  thursday: z.object({
    isOpen: z.boolean().default(false),
    openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional(),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional()
  }).optional(),
  friday: z.object({
    isOpen: z.boolean().default(false),
    openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional(),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional()
  }).optional(),
  saturday: z.object({
    isOpen: z.boolean().default(false),
    openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional(),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional()
  }).optional(),
  sunday: z.object({
    isOpen: z.boolean().default(false),
    openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional(),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:MM').optional()
  }).optional()
});

/**
 * Schema base para academia
 */
export const academyBaseSchema = z.object({
  id: z.string().min(1, 'ID da academia é obrigatório'),
  name: z.string().min(1, 'Nome da academia é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição não pode ter mais que 500 caracteres').optional(),
  isActive: z.boolean().default(true)
});

/**
 * Schema para criação de academia
 */
export const createAcademySchema = z.object({
  name: z.string().min(1, 'Nome da academia é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição não pode ter mais que 500 caracteres').optional(),
  address: addressSchema,
  contact: contactSchema,
  logoURL: z.string().url('URL do logo deve ser válida').optional(),
  schedule: scheduleSchema.optional(),
  modalities: z.array(z.string().min(1, 'Modalidade não pode estar vazia')).min(1, 'Pelo menos uma modalidade é obrigatória'),
  maxStudents: z.number().min(1, 'Número máximo de alunos deve ser maior que 0').optional(),
  foundedDate: z.date().max(new Date(), 'Data de fundação não pode ser no futuro').optional(),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ deve ter o formato 00.000.000/0000-00').optional(),
  licenseNumber: z.string().min(1, 'Número da licença é obrigatório').optional(),
  isActive: z.boolean().default(true),
  settings: z.object({
    allowOnlinePayments: z.boolean().default(true),
    requireMedicalCertificate: z.boolean().default(false),
    allowGuestClasses: z.boolean().default(true),
    autoSendReminders: z.boolean().default(true),
    currency: z.string().default('BRL'),
    timezone: z.string().default('America/Sao_Paulo')
  }).optional()
});

/**
 * Schema para atualização de academia
 */
export const updateAcademySchema = createAcademySchema.partial().extend({
  id: z.string().min(1, 'ID da academia é obrigatório').optional()
});

/**
 * Schema para configurações da academia
 */
export const academySettingsSchema = z.object({
  allowOnlinePayments: z.boolean(),
  requireMedicalCertificate: z.boolean(),
  allowGuestClasses: z.boolean(),
  autoSendReminders: z.boolean(),
  currency: z.string().min(3, 'Moeda deve ter 3 caracteres').max(3, 'Moeda deve ter 3 caracteres'),
  timezone: z.string().min(1, 'Fuso horário é obrigatório'),
  paymentMethods: z.array(z.string()).optional(),
  defaultPaymentDay: z.number().min(1, 'Dia de pagamento deve ser entre 1 e 31').max(31, 'Dia de pagamento deve ser entre 1 e 31').optional(),
  gracePeriodDays: z.number().min(0, 'Período de carência não pode ser negativo').max(30, 'Período de carência máximo é 30 dias').optional(),
  lateFeePercentage: z.number().min(0, 'Taxa de atraso não pode ser negativa').max(100, 'Taxa de atraso não pode ser maior que 100%').optional()
});

/**
 * Schema para busca/filtro de academias
 */
export const academyFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  city: z.string().min(1, 'Cidade inválida').optional(),
  state: z.string().min(2, 'Estado inválido').max(2, 'Estado inválido').optional(),
  modality: z.string().min(1, 'Modalidade inválida').optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
});

/**
 * Schema para convite de academia
 */
export const academyInviteSchema = z.object({
  academyId: z.string().min(1, 'ID da academia é obrigatório'),
  email: z.string().email('Email deve ter um formato válido'),
  userType: z.enum(['student', 'instructor', 'admin', 'aluno', 'instrutor', 'administrador']),
  message: z.string().max(200, 'Mensagem não pode ter mais que 200 caracteres').optional(),
  expiresAt: z.date().min(new Date(), 'Data de expiração deve ser no futuro').optional()
});