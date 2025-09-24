// Data models for Firebase integration

import { z } from 'zod';

// Firebase User data model
export const FirebaseUserModel = z.object({
  uid: z.string(),
  email: z.string().nullable(),
  emailVerified: z.boolean(),
  metadata: z.object({
    creationTime: z.string().optional(),
    lastSignInTime: z.string().optional()
  }).optional()
});

// Firestore UserProfile data model
export const FirestoreUserProfileModel = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  userType: z.enum(['student', 'instructor', 'admin']).optional(),
  tipo: z.enum(['aluno', 'instrutor', 'administrador']).optional(), // Legacy support
  academiaId: z.string().optional(),
  isActive: z.boolean().default(true),
  currentGraduation: z.string().nullable().optional(),
  graduations: z.array(z.string()).default([]),
  classIds: z.array(z.string()).default([]),
  createdAt: z.union([z.date(), z.any()]).optional(), // Firestore Timestamp or Date
  updatedAt: z.union([z.date(), z.any()]).optional()
});

// Firebase Custom Claims model
export const FirebaseClaimsModel = z.object({
  role: z.string().optional(),
  academiaId: z.string().optional(),
  permissions: z.array(z.string()).optional()
});

// Firestore Academia model
export const FirestoreAcademiaModel = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean().default(true),
  settings: z.record(z.any()).optional(),
  createdAt: z.union([z.date(), z.any()]).optional(),
  updatedAt: z.union([z.date(), z.any()]).optional()
});

// Type exports
export type FirebaseUserData = z.infer<typeof FirebaseUserModel>;
export type FirestoreUserProfileData = z.infer<typeof FirestoreUserProfileModel>;
export type FirebaseClaimsData = z.infer<typeof FirebaseClaimsModel>;
export type FirestoreAcademiaData = z.infer<typeof FirestoreAcademiaModel>;