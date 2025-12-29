
/**
 * Utilitários para validação de email
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getEmailErrorMessage = (email: string | null | undefined): string | null => {
  if (!email || !email.trim()) {
    return 'Email é obrigatório';
  }
  
  if (!validateEmail(email.trim())) {
    return 'Email inválido';
  }
  
  return null;
};

export const getPasswordErrorMessage = (password: string | null | undefined, minLength: number = 6): string | null => {
  if (!password || !password.trim()) {
    return 'Senha é obrigatória';
  }
  
  if (password.length < minLength) {
    return `Senha deve ter pelo menos ${minLength} caracteres`;
  }
  
  return null;
};

export const formatEmailForDisplay = (email: string | null | undefined): string => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

export const getFirebaseAuthErrorMessage = (errorCode: string): string => {
  const errorMessages = {
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Conta desabilitada',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
    'auth/email-already-in-use': 'Este email já está em uso',
    'auth/weak-password': 'Senha muito fraca',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
    'auth/invalid-credential': 'Credenciais inválidas',
  } as Record<string, string>;
  
  return errorMessages[errorCode] || 'Erro de autenticação';
};
