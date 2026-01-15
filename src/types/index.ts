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
  UserTypeSelection: undefined;
  AcademyOnboarding: undefined;
  SharedScreens: { userType: UserType };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  AcademiaSelection: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

export type SharedStackParamList = {
  Profile: undefined;
  ChangePassword: undefined;
  PhysicalEvaluation: undefined;
  PhysicalEvaluationHistory: undefined;
  Injury: undefined;
  InjuryHistory: undefined;
  PrivacyPolicy: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
};

export type StudentTabParamList = {
  Dashboard: undefined;
  Payments: undefined;
  Evolution: undefined;
  Calendar: undefined;
};

export type StudentStackParamList = {
  StudentTabs: undefined;
  CheckIn: undefined;
  Profile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  PhysicalEvaluation: undefined;
  PhysicalEvaluationHistory: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
};

export type InstructorTabParamList = {
  Dashboard: undefined;
  Classes: undefined;
  Students: undefined;
};

export type InstructorStackParamList = {
  InstructorTabs: undefined;
  NovaAula: undefined;
  ScheduleClasses: undefined;
  checkIn: undefined;
  Relatorios: undefined;
  classDetailsScreen: { classId: string };
  CheckIns: undefined;
  AddClass: undefined;
  AddStudent: undefined;
  StudentProfile: { studentId: string };
  AddGraduation: { studentId: string; studentName?: string };
  Profile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  PhysicalEvaluation: undefined;
  PhysicalEvaluationHistory: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Students: undefined;
  Classes: undefined;
  Modalities: undefined;
  Management: undefined;
  Invitations: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  AddClass: undefined;
  ClassStudents: { classId: string };
  CheckIns: undefined;
  EditClass: { classId: string; classData?: any };
  ClassDetails: { classId: string };
  AddStudent: undefined;
  EditStudent: { studentId: string; studentData?: any };
  StudentDetails: { studentId: string };
  StudentPayments: { studentId: string };
  Reports: undefined;
  Modalities: undefined;
  StudentProfile: { studentId: string };
  AddGraduation: { studentId: string; studentName?: string };
  Profile: undefined;
  ChangePassword: undefined;
  PhysicalEvaluation: undefined;
  PhysicalEvaluationHistory: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  Settings: undefined;
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