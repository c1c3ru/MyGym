// Domain errors for authentication

export abstract class AuthError extends Error {
  abstract readonly code: string;
  abstract readonly userMessage: string;
  
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidCredentialsError extends AuthError {
  readonly code = 'INVALID_CREDENTIALS';
  readonly userMessage = 'Email ou senha incorretos';
  
  constructor(originalError?: Error) {
    super('Invalid email or password', originalError);
  }
}

export class UserNotFoundError extends AuthError {
  readonly code = 'USER_NOT_FOUND';
  readonly userMessage = 'Usuário não encontrado';
  
  constructor(originalError?: Error) {
    super('User not found', originalError);
  }
}

export class EmailAlreadyInUseError extends AuthError {
  readonly code = 'EMAIL_ALREADY_IN_USE';
  readonly userMessage = 'Este email já está sendo usado';
  
  constructor(originalError?: Error) {
    super('Email already in use', originalError);
  }
}

export class WeakPasswordError extends AuthError {
  readonly code = 'WEAK_PASSWORD';
  readonly userMessage = 'Senha muito fraca. Use pelo menos 6 caracteres';
  
  constructor(originalError?: Error) {
    super('Weak password', originalError);
  }
}

export class NetworkError extends AuthError {
  readonly code = 'NETWORK_ERROR';
  readonly userMessage = 'Erro de conexão. Verifique sua internet';
  
  constructor(originalError?: Error) {
    super('Network error', originalError);
  }
}

export class TooManyRequestsError extends AuthError {
  readonly code = 'TOO_MANY_REQUESTS';
  readonly userMessage = 'Muitas tentativas. Tente novamente mais tarde';
  
  constructor(originalError?: Error) {
    super('Too many requests', originalError);
  }
}

export class InvalidEmailError extends AuthError {
  readonly code = 'INVALID_EMAIL';
  readonly userMessage = 'Email inválido';
  
  constructor(originalError?: Error) {
    super('Invalid email format', originalError);
  }
}

export class UserProfileNotFoundError extends AuthError {
  readonly code = 'USER_PROFILE_NOT_FOUND';
  readonly userMessage = 'Perfil do usuário não encontrado';
  
  constructor(originalError?: Error) {
    super('User profile not found', originalError);
  }
}

export class AcademiaNotFoundError extends AuthError {
  readonly code = 'ACADEMIA_NOT_FOUND';
  readonly userMessage = 'Academia não encontrada';
  
  constructor(originalError?: Error) {
    super('Academia not found', originalError);
  }
}

export class ValidationError extends AuthError {
  readonly code = 'VALIDATION_ERROR';
  readonly userMessage = 'Dados inválidos';
  
  constructor(public readonly validationErrors: string[], originalError?: Error) {
    super(`Validation failed: ${validationErrors.join(', ')}`, originalError);
  }
}

export class UnauthorizedError extends AuthError {
  readonly code = 'UNAUTHORIZED';
  readonly userMessage = 'Acesso não autorizado';
  
  constructor(originalError?: Error) {
    super('Unauthorized access', originalError);
  }
}

export class SessionExpiredError extends AuthError {
  readonly code = 'SESSION_EXPIRED';
  readonly userMessage = 'Sessão expirada. Faça login novamente';
  
  constructor(originalError?: Error) {
    super('Session expired', originalError);
  }
}

// Helper function to map Firebase errors to domain errors
export function mapFirebaseError(error: any): AuthError {
  switch (error.code) {
    case 'auth/user-not-found':
      return new UserNotFoundError(error);
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return new InvalidCredentialsError(error);
    case 'auth/email-already-in-use':
      return new EmailAlreadyInUseError(error);
    case 'auth/weak-password':
      return new WeakPasswordError(error);
    case 'auth/invalid-email':
      return new InvalidEmailError(error);
    case 'auth/too-many-requests':
      return new TooManyRequestsError(error);
    case 'auth/network-request-failed':
      return new NetworkError(error);
    default:
      // Since AuthError is abstract, return a concrete UnauthorizedError for unknown cases
      return new UnauthorizedError(error);
  }
}