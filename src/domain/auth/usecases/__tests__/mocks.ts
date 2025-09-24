// Mock implementations for testing

import { AuthRepository } from '../../repositories';
import { User, UserProfile, Claims, Academia } from '../../entities';

export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  emailVerified: true,
  createdAt: new Date('2024-01-01'),
  lastSignInAt: new Date('2024-01-01')
};

export const mockUserProfile: UserProfile = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  phone: '123456789',
  userType: 'student',
  academiaId: 'test-academia-id',
  isActive: true,
  currentGraduation: 'Iniciante',
  graduations: ['Iniciante'],
  classIds: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockClaims: Claims = {
  role: 'student',
  academiaId: 'test-academia-id',
  permissions: []
};

export const mockAcademia: Academia = {
  id: 'test-academia-id',
  name: 'Test Academia',
  isActive: true,
  settings: {}
};

export const createMockAuthRepository = (): jest.Mocked<AuthRepository> => {
  return {
    signInWithEmail: jest.fn(),
    signUpWithEmail: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    createUserProfile: jest.fn(),
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    getUserClaims: jest.fn(),
    refreshUserToken: jest.fn(),
    getAcademia: jest.fn(),
    signInWithGoogle: jest.fn(),
    signInWithFacebook: jest.fn(),
    signInWithMicrosoft: jest.fn(),
    signInWithApple: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    onAuthStateChanged: jest.fn()
  };
};