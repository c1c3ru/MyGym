// Validation schemas for use cases using Zod

import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

export const signUpSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  phone: z.string().optional(),
  userType: z.enum(['student', 'instructor', 'admin'], {
    errorMap: () => ({ message: 'Tipo de usuário inválido' })
  })
});

export const emailSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório')
});

export const userIdSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório')
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo').optional(),
  phone: z.string().optional(),
  userType: z.enum(['student', 'instructor', 'admin']).optional(),
  currentGraduation: z.string().optional(),
  academiaId: z.string().optional(),
  isActive: z.boolean().optional()
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;