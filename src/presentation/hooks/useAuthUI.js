import { useCallback } from 'react';
import useAuthUIStore from '@presentation/stores/AuthUIStore';
import useAppUIStore from '@presentation/stores/AppUIStore';

/**
 * useAuthUI - Presentation Layer
 * Hook para gerenciar estado de UI relacionado à autenticação
 */
export const useAuthUI = () => {
  const {
    isLoading,
    isSigningIn,
    isSigningUp,
    isSigningOut,
    showPassword,
    showConfirmPassword,
    formErrors,
    fieldErrors,
    showForgotPassword,
    showUserTypeSelection,
    showAcademySelection,
    rememberMe,
    biometricEnabled,
    lastEmail,
    setLoading,
    setSigningIn,
    setSigningUp,
    setSigningOut,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    setFormErrors,
    clearFormErrors,
    setFieldError,
    clearFieldError,
    setShowForgotPassword,
    setShowUserTypeSelection,
    setShowAcademySelection,
    setRememberMe,
    setBiometricEnabled,
    setLastEmail,
    resetUIState,
    hasErrors,
    isAnyActionInProgress,
    getFieldError
  } = useAuthUIStore();

  const { 
    showToastMessage, 
    setErrorDialog,
    setSuccessDialog 
  } = useAppUIStore();

  // Handlers otimizados
  const handlePasswordToggle = useCallback(() => {
    togglePasswordVisibility();
  }, [togglePasswordVisibility]);

  const handleConfirmPasswordToggle = useCallback(() => {
    toggleConfirmPasswordVisibility();
  }, [toggleConfirmPasswordVisibility]);

  const handleFieldErrorSet = useCallback((field, error) => {
    setFieldError(field, error);
  }, [setFieldError]);

  const handleFieldErrorClear = useCallback((field) => {
    clearFieldError(field);
  }, [clearFieldError]);

  const handleFormReset = useCallback(() => {
    clearFormErrors();
  }, [clearFormErrors]);

  const handleRememberMeToggle = useCallback(() => {
    setRememberMe(!rememberMe);
  }, [rememberMe, setRememberMe]);

  const handleBiometricToggle = useCallback(() => {
    setBiometricEnabled(!biometricEnabled);
  }, [biometricEnabled, setBiometricEnabled]);

  // Feedback helpers
  const showSuccessToast = useCallback((message) => {
    showToastMessage(message, 'success');
  }, [showToastMessage]);

  const showErrorToast = useCallback((message) => {
    showToastMessage(message, 'error');
  }, [showToastMessage]);

  const showWarningToast = useCallback((message) => {
    showToastMessage(message, 'warning');
  }, [showToastMessage]);

  const showInfoToast = useCallback((message) => {
    showToastMessage(message, 'info');
  }, [showToastMessage]);

  const showSuccessDialog = useCallback((message) => {
    setSuccessDialog(true, message);
  }, [setSuccessDialog]);

  const showErrorDialog = useCallback((error) => {
    setErrorDialog(true, error);
  }, [setErrorDialog]);

  // Validation helpers
  const validateField = useCallback((field, value, rules = {}) => {
    let error = null;

    if (rules.required && (!value || value.trim() === '')) {
      error = 'Este campo é obrigatório';
    } else if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
      error = 'Email inválido';
    } else if (rules.minLength && value && value.length < rules.minLength) {
      error = `Mínimo ${rules.minLength} caracteres`;
    } else if (rules.maxLength && value && value.length > rules.maxLength) {
      error = `Máximo ${rules.maxLength} caracteres`;
    } else if (rules.pattern && value && !rules.pattern.test(value)) {
      error = rules.message || 'Formato inválido';
    }

    if (error) {
      handleFieldErrorSet(field, error);
    } else {
      handleFieldErrorClear(field);
    }

    return !error;
  }, [handleFieldErrorSet, handleFieldErrorClear]);

  // Status helpers
  const canSubmit = useCallback(() => {
    return !isAnyActionInProgress() && !hasErrors();
  }, [isAnyActionInProgress, hasErrors]);

  const getLoadingText = useCallback(() => {
    if (isSigningIn) return 'Fazendo login...';
    if (isSigningUp) return 'Criando conta...';
    if (isSigningOut) return 'Saindo...';
    if (isLoading) return getString('loadingState');
    return '';
  }, [isSigningIn, isSigningUp, isSigningOut, isLoading]);

  return {
    // Estado
    isLoading,
    isSigningIn,
    isSigningUp,
    isSigningOut,
    showPassword,
    showConfirmPassword,
    formErrors,
    fieldErrors,
    showForgotPassword,
    showUserTypeSelection,
    showAcademySelection,
    rememberMe,
    biometricEnabled,
    lastEmail,

    // Actions básicas
    setLoading,
    setSigningIn,
    setSigningUp,
    setSigningOut,
    setFormErrors,
    clearFormErrors,
    setShowForgotPassword,
    setShowUserTypeSelection,
    setShowAcademySelection,
    setLastEmail,
    resetUIState,

    // Handlers otimizados
    handlePasswordToggle,
    handleConfirmPasswordToggle,
    handleFieldErrorSet,
    handleFieldErrorClear,
    handleFormReset,
    handleRememberMeToggle,
    handleBiometricToggle,

    // Feedback
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    showSuccessDialog,
    showErrorDialog,

    // Validation
    validateField,
    getFieldError,

    // Status
    hasErrors,
    isAnyActionInProgress,
    canSubmit,
    getLoadingText
  };
};