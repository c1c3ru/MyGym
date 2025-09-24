// 🎯 Tipos principais da aplicação
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt?: Date;
  lastLogin?: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  userType: UserType;
  academiaId?: string;
  phone?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Academia {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  ownerId: string;
  createdAt: Date;
  isActive: boolean;
  settings: AcademiaSettings;
}

export interface AcademiaSettings {
  allowRegistrations: boolean;
  requireApproval: boolean;
  maxStudents?: number;
  timezone: string;
  currency: string;
}

export type UserType = 'admin' | 'instructor' | 'student';

export interface CustomClaims {
  role: UserType;
  academiaId: string;
  permissions?: string[];
}

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  academia: Academia | null;
  customClaims: CustomClaims | null;
  loading: boolean;
  isAuthenticated: boolean;
}

// Tipos para navegação
export type RootStackParamList = {
  Auth: undefined;
  Main: { userType: UserType };
  Loading: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  AcademiaSelection: undefined;
};

// Tipos para formulários
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
  phone?: string;
}

// Tipos para API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para erros
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
}