import { container } from './DIContainer';
import { 
  AuthRepositoryImpl, 
  UserRepositoryImpl, 
  AcademyRepositoryImpl 
} from '@data';
import { 
  SignInUseCase, 
  SignUpUseCase, 
  SignOutUseCase,
  GetCurrentUserUseCase,
  RefreshTokenUseCase 
} from '@domain';
import { FirebaseAdapter, StorageAdapter, NetworkAdapter } from '@infrastructure/index';

/**
 * AuthDIContainer - Infrastructure Layer
 * Configuração de injeção de dependências para autenticação
 */

/**
 * Configura todas as dependências de autenticação
 */
export const setupAuthDependencies = () => {
  console.log('🔧 AuthDIContainer: Configurando dependências de autenticação...');

  // Adapters de infraestrutura
  container.register('firebaseAdapter', () => new FirebaseAdapter());
  container.register('storageAdapter', () => new StorageAdapter());
  container.register('networkAdapter', () => new NetworkAdapter());

  // Repositories
  container.register('authRepository', () => new AuthRepositoryImpl());
  container.register('userRepository', () => new UserRepositoryImpl());
  container.register('academyRepository', () => new AcademyRepositoryImpl());

  // Use Cases
  container.register('signInUseCase', () => new SignInUseCase(
    container.resolve('authRepository'),
    container.resolve('userRepository')
  ), { dependencies: ['authRepository', 'userRepository'] });

  container.register('signUpUseCase', () => new SignUpUseCase(
    container.resolve('authRepository'),
    container.resolve('userRepository')
  ), { dependencies: ['authRepository', 'userRepository'] });

  container.register('signOutUseCase', () => new SignOutUseCase(
    container.resolve('authRepository')
  ), { dependencies: ['authRepository'] });

  container.register('getCurrentUserUseCase', () => new GetCurrentUserUseCase(
    container.resolve('authRepository'),
    container.resolve('userRepository'),
    container.resolve('academyRepository')
  ), { dependencies: ['authRepository', 'userRepository', 'academyRepository'] });

  container.register('refreshTokenUseCase', () => new RefreshTokenUseCase(
    container.resolve('authRepository')
  ), { dependencies: ['authRepository'] });

  console.log('✅ AuthDIContainer: Dependências configuradas com sucesso');
};

/**
 * Resolve use cases específicos
 */
export const getAuthUseCases = () => {
  if (!container.has('signInUseCase')) {
    setupAuthDependencies();
  }

  return {
    signInUseCase: container.resolve('signInUseCase'),
    signUpUseCase: container.resolve('signUpUseCase'),
    signOutUseCase: container.resolve('signOutUseCase'),
    getCurrentUserUseCase: container.resolve('getCurrentUserUseCase'),
    refreshTokenUseCase: container.resolve('refreshTokenUseCase')
  };
};

/**
 * Resolve repositories específicos
 */
export const getAuthRepositories = () => {
  if (!container.has('authRepository')) {
    setupAuthDependencies();
  }

  return {
    authRepository: container.resolve('authRepository'),
    userRepository: container.resolve('userRepository'),
    academyRepository: container.resolve('academyRepository')
  };
};

/**
 * Resolve adapters específicos
 */
export const getAuthAdapters = () => {
  if (!container.has('firebaseAdapter')) {
    setupAuthDependencies();
  }

  return {
    firebaseAdapter: container.resolve('firebaseAdapter'),
    storageAdapter: container.resolve('storageAdapter'),
    networkAdapter: container.resolve('networkAdapter')
  };
};

/**
 * Debug das dependências configuradas
 */
export const debugAuthDependencies = () => {
  console.log('🔧 AuthDIContainer Debug:');
  
  try {
    const useCases = getAuthUseCases();
    const repositories = getAuthRepositories();
    const adapters = getAuthAdapters();

    console.log('✅ Use Cases:', Object.keys(useCases));
    console.log('✅ Repositories:', Object.keys(repositories));
    console.log('✅ Adapters:', Object.keys(adapters));

    return { useCases, repositories, adapters };
  } catch (error) {
    console.error('❌ AuthDIContainer Debug Error:', error);
    return null;
  }
};