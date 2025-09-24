import { z } from 'zod';

/**
 * AuthSchemas - Validation Layer
 * Schemas Zod para validação de formulários de autenticação
 */

// Schema para email
const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email deve ter um formato válido')
  .max(254, 'Email muito longo');

// Schema para senha
const passwordSchema = z
  .string()
  .min(1, 'Senha é obrigatória')
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(128, 'Senha muito longa');

// Schema para senha forte (cadastro)
const strongPasswordSchema = z
  .string()
  .min(1, 'Senha é obrigatória')
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

// Schema para nome
const nameSchema = z
  .string()
  .min(1, 'Nome é obrigatório')
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZàáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝŸ\s]+$/, 
         'Nome deve conter apenas letras e espaços');

// Schema para tipo de usuário
const userTypeSchema = z.enum(['student', 'instructor', 'admin', 'aluno', 'instrutor', 'administrador'], {
  errorMap: () => ({ message: 'Tipo de usuário inválido' })
});

/**
 * Schema para login com email e senha
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

/**
 * Schema base para cadastro (sem validação de confirmação)
 */
const signUpBaseSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  userType: userTypeSchema.optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos de uso'
  })
});

/**
 * Schema para cadastro básico (com validação de confirmação de senha)
 */
export const signUpSchema = signUpBaseSchema.refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

/**
 * Schema para cadastro completo (com dados adicionais)
 */
export const signUpCompleteSchema = signUpBaseSchema.extend({
  userType: userTypeSchema,
  academiaId: z.string().min(1, 'Academia é obrigatória').optional(),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Telefone deve conter apenas números, espaços, hífens e parênteses')
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(20, 'Telefone muito longo')
    .optional(),
  dateOfBirth: z.date().max(new Date(), 'Data de nascimento não pode ser no futuro').optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

/**
 * Schema para reset de senha
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

/**
 * Schema para redefinir senha
 */
export const resetPasswordSchema = z.object({
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

/**
 * Schema para mudança de senha
 */
export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: strongPasswordSchema,
  confirmNewPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmNewPassword']
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'A nova senha deve ser diferente da senha atual',
  path: ['newPassword']
});

/**
 * Schema para atualização de perfil
 */
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Telefone deve conter apenas números, espaços, hífens e parênteses')
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(20, 'Telefone muito longo')
    .optional(),
  dateOfBirth: z.date().max(new Date(), 'Data de nascimento não pode ser no futuro').optional(),
  userType: userTypeSchema.optional(),
  academiaId: z.string().min(1, 'Academia inválida').optional()
});

// Exportar schemas individuais para reutilização
export const schemas = {
  email: emailSchema,
  password: passwordSchema,
  strongPassword: strongPasswordSchema,
  name: nameSchema,
  userType: userTypeSchema
};