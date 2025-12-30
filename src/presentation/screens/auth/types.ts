/**
 * Auth Types
 * Interfaces e tipos TypeScript para telas de autenticação
 * Garante tipagem forte em formulários, estados e validações
 */

import { NavigationProp } from '@react-navigation/native';

// ============================================
// NAVIGATION TYPES
// ============================================

/**
 * Tipo de parâmetros para o stack de autenticação
 */
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    TermsOfService: undefined;
    PrivacyPolicy: undefined;
    AcademiaSelection: undefined;
};

/**
 * Props de navegação para telas de autenticação
 */
export interface AuthScreenProps {
    navigation: NavigationProp<AuthStackParamList>;
}

// ============================================
// FORM DATA TYPES
// ============================================

/**
 * Dados do formulário de login
 */
export interface LoginFormData {
    email: string;
    password: string;
}

/**
 * Dados do formulário de cadastro
 */
export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    userType: 'student' | 'instructor' | 'admin';
    acceptTerms: boolean;
    acceptPrivacyPolicy: boolean;
}

/**
 * Dados do formulário de recuperação de senha
 */
export interface ForgotPasswordFormData {
    email: string;
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * Erros de validação do formulário de login
 */
export interface LoginFormErrors {
    email?: string;
    password?: string;
    general?: string;
}

/**
 * Erros de validação do formulário de cadastro
 */
export interface RegisterFormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    acceptTerms?: string;
    acceptPrivacyPolicy?: string;
    general?: string;
}

/**
 * Erros de validação do formulário de recuperação de senha
 */
export interface ForgotPasswordFormErrors {
    email?: string;
    general?: string;
}

// ============================================
// SNACKBAR TYPES
// ============================================

/**
 * Tipo de mensagem do snackbar
 */
export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

/**
 * Estado do snackbar
 */
export interface SnackbarState {
    visible: boolean;
    message: string;
    type: SnackbarType;
}

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Resultado de validação de formulário
 */
export interface ValidationResult<T> {
    isValid: boolean;
    errors: T;
}

/**
 * Função de validação genérica
 */
export type ValidationFunction<TData, TErrors> = (
    data: TData
) => ValidationResult<TErrors>;

// ============================================
// USER DATA TYPES
// ============================================

/**
 * Dados do usuário para cadastro
 */
export interface UserRegistrationData {
    name: string;
    phone: string;
    userType: 'student' | 'instructor' | 'admin';
    acceptTerms: boolean;
    acceptPrivacyPolicy: boolean;
}

// ============================================
// SOCIAL LOGIN TYPES
// ============================================

/**
 * Provedores de login social
 */
export type SocialLoginProvider = 'google' | 'facebook' | 'apple' | 'microsoft';

/**
 * Resultado de login social
 */
export interface SocialLoginResult {
    success: boolean;
    error?: string;
    provider: SocialLoginProvider;
}
