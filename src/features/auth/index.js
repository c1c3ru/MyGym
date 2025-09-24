// Feature: Authentication
// Exportações centralizadas para o módulo de autenticação

// Screens
export { default as LoginScreen } from '../presentation/screens/LoginScreen';
export { default as RegisterScreen } from '../presentation/screens/RegisterScreen';
export { default as ForgotPasswordScreen } from '../presentation/screens/ForgotPasswordScreen';
export { default as UserTypeSelectionScreen } from '../presentation/screens/UserTypeSelectionScreen';
export { default as AcademiaSelectionScreen } from '../presentation/screens/AcademiaSelectionScreen';

// Components
export { default as ForgotPasswordButton } from '../presentation/components/ForgotPasswordButton';
export { default as LoginDebugger } from '../presentation/components/LoginDebugger';

// Services
export { default as authService } from '../infrastructure/services/authService';

// Hooks
export { useAuthMigration } from '../presentation/hooks/useAuthMigration';

// Store
export { default as useAuthStore } from '../../presentation/stores/AuthUIStore';
