import { useEffect } from 'react';
import useAuthStore from '@presentation/stores/AuthUIStore';
import { AuthState, AuthSelectors } from './selectors';
import { useNotification } from '@presentation/contexts/NotificationContext';
import { 
  SignInWithEmailUseCase,
  SignUpWithEmailUseCase,
  SignOutUseCase,
  GetUserSessionUseCase,
  SendPasswordResetEmailUseCase
} from '@domain/auth/usecases';
import { SignUpData, AuthSession } from '@domain/auth/entities';
import { FirebaseAuthRepository } from '@data/auth';
import { initializeFirebaseServices } from '@infrastructure/firebase';
import crashlyticsService from '@infrastructure/services/crashlyticsService';

// Helper function para verificar se um erro é uma instância de Error
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Helper function para extrair nome do erro de forma segura
function getErrorName(error: unknown): string {
  if (isError(error)) {
    return error.name;
  }
  return 'UnknownError';
}

// Helper function para extrair mensagem do erro de forma segura
function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido';
}

let authListenerInitialized = false;
let authUnsubscribe: (() => void) | null = null;
let repository: FirebaseAuthRepository | null = null;
let signInUseCase: SignInWithEmailUseCase;
let signUpUseCase: SignUpWithEmailUseCase;
let signOutUseCase: SignOutUseCase;
let getUserSessionUseCase: GetUserSessionUseCase;
let sendPasswordResetUseCase: SendPasswordResetEmailUseCase;

const USE_CLEAN_ARCHITECTURE = true;

function initializeCleanArchitecture() {
  if (repository) return repository;

  try {
    const { auth, db } = initializeFirebaseServices();
    repository = new FirebaseAuthRepository(auth, db);
    
    signInUseCase = new SignInWithEmailUseCase(repository);
    signUpUseCase = new SignUpWithEmailUseCase(repository);
    signOutUseCase = new SignOutUseCase(repository);
    getUserSessionUseCase = new GetUserSessionUseCase(repository);
    sendPasswordResetUseCase = new SendPasswordResetEmailUseCase(repository);
    
    return repository;
  } catch (error) {
    console.error('Error initializing Clean Architecture:', error);
    throw error;
  }
}

export function useAuthFacade() {
  const { showError } = useNotification();
  
  const {
    setUser,
    setUserProfile,
    setGym,
    setCustomClaims,
    setLoading,
    logout,
    user,
    userProfile,
    gym: academia,
    customClaims,
    loading,
    isAuthenticated
  } = useAuthStore();
  const authState: AuthState = {
    user,
    userProfile,
    academia,
    customClaims,
    loading,
    isAuthenticated
  };

  useEffect(() => {
    try {
      initializeCleanArchitecture();
    } catch (error) {
      console.error('Failed to initialize Clean Architecture:', error);
    }
  }, []);


  const signIn = async (email: string, password: string) => {
    try {
      const session = await signInUseCase.execute({ email, password });
      
      setUser(session.user);
      setUserProfile(session.userProfile);
      setCustomClaims(session.claims);
      if (session.academia) {
        setGym(session.academia);
      }

      crashlyticsService.logAuthEvent(
        session.user.id,
        session.userProfile.userType,
        session.academia?.id
      );
      
      return session.user;
    } catch (error) {
      const errorName = getErrorName(error);
      const errorMessage = getErrorMessage(error);
      
      // Tratamento especial para UserProfileNotFoundError
      if (errorName === 'UserProfileNotFoundError') {
        console.log('👤 Login realizado mas perfil não encontrado. Usuário precisa criar perfil.');
        
        // Não manter o usuário autenticado automaticamente
        // Apenas informar sobre a necessidade de criar perfil
        showError('Suas credenciais estão corretas, mas você ainda não possui um perfil cadastrado. Deseja criar seu perfil agora?');
        
        // Criar um erro customizado que a interface pode capturar
        // A interface pode capturar este erro e mostrar um modal/dialog
        // oferecendo a opção de ir para a página de cadastro
        const profileError = new Error('PROFILE_CREATION_NEEDED');
        profileError.name = 'ProfileCreationNeededError';
        (profileError as any).email = email; // Anexar email para uso posterior
        (profileError as any).password = password; // Anexar password para uso posterior
        throw profileError;
      }
      
      // Para outros erros, fazer log e tratamento normal
      crashlyticsService.logAuthError(error, { method: 'signIn' });
      console.error('🔐 Erro no login:', { errorName, errorMessage });
      
      switch (errorName) {
        case 'UnauthorizedError':
          showError('Acesso não autorizado. Verifique se seu email e senha estão corretos.');
          break;
        case 'InvalidCredentialsError':
          showError('Email ou senha incorretos. Tente novamente.');
          break;
        case 'UserNotFoundError':
          showError('Usuário não encontrado. Verifique o email ou crie uma conta.');
          break;
        case 'TooManyRequestsError':
          showError('Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.');
          break;
        case 'NetworkError':
          showError(getString('networkError'));
          break;
        case 'UserProfileNotFoundError':
          showError('Perfil não encontrado. Vamos configurá-lo.');
          break;
        case 'SessionExpiredError':
          showError('Sua sessão expirou. Faça login novamente.');
          break;
        default:
          showError(`Erro no login: ${errorMessage || 'Tente novamente ou entre em contato com o suporte.'}`);
          break;
      }
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<SignUpData>) => {
    try {
      const session = await signUpUseCase.execute({
        email,
        password,
        name: userData.name || '',
        phone: userData.phone || '',
        userType: userData.userType || 'student',
        acceptTerms: userData.acceptTerms ?? false,
        acceptPrivacyPolicy: userData.acceptPrivacyPolicy ?? false
      });
      
      setUser(session.user);
      setUserProfile(session.userProfile);
      setCustomClaims(session.claims);
      
      return session.user;
    } catch (error) {
      crashlyticsService.logAuthError(error, { method: 'signUp' });
      
      // Mostrar feedback visual para erros de registro
      const errorName = getErrorName(error);
      const errorMessage = getErrorMessage(error);
      
      console.error('📝 Erro no registro:', { errorName, errorMessage });
      
      switch (errorName) {
        case 'EmailAlreadyInUseError':
          showError('Este email já está sendo usado. Tente fazer login ou use outro email.');
          break;
        case 'WeakPasswordError':
          showError('Senha muito fraca. Use pelo menos 6 caracteres com letras e números.');
          break;
        case 'InvalidEmailError':
          showError('Email inválido. Verifique o formato do email.');
          break;
        case 'NetworkError':
          showError(getString('networkError'));
          break;
        case 'ValidationError':
          showError('Dados inválidos. Verifique as informações e tente novamente.');
          break;
        default:
          showError(`Erro no registro: ${errorMessage || 'Tente novamente ou entre em contato com o suporte.'}`);
          break;
      }
      
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOutUseCase.execute();
      logout();
    } catch (error) {
      console.error('Sign out failed:', error);
      logout();
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      await sendPasswordResetUseCase.execute({ email });
      showError('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      crashlyticsService.logAuthError(error, { method: 'sendPasswordResetEmail' });
      
      const errorName = getErrorName(error);
      const errorMessage = getErrorMessage(error);
      
      console.error('📧 Erro ao enviar email de recuperação:', { errorName, errorMessage });
      
      switch (errorName) {
        case 'UserNotFoundError':
          showError('Email não encontrado. Verifique o endereço ou crie uma conta.');
          break;
        case 'InvalidEmailError':
          showError('Email inválido. Verifique o formato do email.');
          break;
        case 'NetworkError':
          showError(getString('networkError'));
          break;
        case 'TooManyRequestsError':
          showError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
          break;
        default:
          showError(`Erro ao enviar email: ${errorMessage || 'Tente novamente.'}`);
          break;
      }
      
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const user = await repository!.signInWithGoogle();
      
      try {
        const session = await getUserSessionUseCase.execute(user);
        
        setUser(session.user);
        setUserProfile(session.userProfile);
        setCustomClaims(session.claims);
        if (session.academia) {
          setGym(session.academia);
        }
      } catch (sessionError) {
        console.log('👤 Usuário autenticado via Google mas sem perfil. Direcionando para criação...');
        
        // Mantém o usuário autenticado mas sem perfil completo
        setUser(user);
        setUserProfile(null);
        setCustomClaims({
          role: 'student', // Papel padrão temporário
          academiaId: undefined,
          permissions: []
        });
        setGym(null);
        
        // Notificação amigável para usuários do Google
        const errorName = getErrorName(sessionError);
        if (errorName === 'UserProfileNotFoundError') {
          showError('Bem-vindo! Como é seu primeiro acesso, precisamos configurar seu perfil. Por favor, complete suas informações.');
        }
      }
      
      return user;
    } catch (error) {
      crashlyticsService.logAuthError(error, { method: 'signInWithGoogle' });
      
      const errorName = getErrorName(error);
      const errorMessage = getErrorMessage(error);
      
      console.error('🔍 Erro no login com Google:', { errorName, errorMessage });
      
      switch (errorName) {
        case 'NetworkError':
          showError(getString('networkError'));
          break;
        case 'UnauthorizedError':
          showError('Erro na autenticação com Google. Tente novamente.');
          break;
        default:
          showError(`Erro no login com Google: ${errorMessage || 'Tente novamente.'}`);
          break;
      }
      
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const user = await repository!.signInWithFacebook();
      
      try {
        const session = await getUserSessionUseCase.execute(user);
        
        setUser(session.user);
        setUserProfile(session.userProfile);
        setCustomClaims(session.claims);
        if (session.academia) {
          setGym(session.academia);
        }
      } catch (sessionError) {
        console.log('👤 Usuário autenticado via Facebook mas sem perfil. Direcionando para criação...');
        
        // Mantém o usuário autenticado mas sem perfil completo
        setUser(user);
        setUserProfile(null);
        setCustomClaims({
          role: 'student', // Papel padrão temporário
          academiaId: undefined,
          permissions: []
        });
        setGym(null);
        
        // Notificação amigável para usuários do Facebook
        const errorName = getErrorName(sessionError);
        if (errorName === 'UserProfileNotFoundError') {
          showError('Bem-vindo! Como é seu primeiro acesso, precisamos configurar seu perfil. Por favor, complete suas informações.');
        }
      }
      
      return user;
    } catch (error) {
      crashlyticsService.logAuthError(error, { method: 'signInWithFacebook' });
      
      const errorName = getErrorName(error);
      const errorMessage = getErrorMessage(error);
      
      console.error('📘 Erro no login com Facebook:', { errorName, errorMessage });
      
      switch (errorName) {
        case 'NetworkError':
          showError(getString('networkError'));
          break;
        case 'UnauthorizedError':
          showError('Erro na autenticação com Facebook. Tente novamente.');
          break;
        default:
          showError(`Erro no login com Facebook: ${errorMessage || 'Tente novamente.'}`);
          break;
      }
      
      throw error;
    }
  };

  const signInWithMicrosoft = async () => {
    try {
      const user = await repository!.signInWithMicrosoft();
      
      try {
        const session = await getUserSessionUseCase.execute(user);
        
        setUser(session.user);
        setUserProfile(session.userProfile);
        setCustomClaims(session.claims);
        if (session.academia) {
          setGym(session.academia);
        }
      } catch (sessionError) {
        console.log('👤 Usuário autenticado via Microsoft mas sem perfil. Direcionando para criação...');
        
        // Mantém o usuário autenticado mas sem perfil completo
        setUser(user);
        setUserProfile(null);
        setCustomClaims({
          role: 'student', // Papel padrão temporário
          academiaId: undefined,
          permissions: []
        });
        setGym(null);
        
        // Notificação amigável para usuários do Microsoft
        const errorName = getErrorName(sessionError);
        if (errorName === 'UserProfileNotFoundError') {
          showError('Bem-vindo! Como é seu primeiro acesso, precisamos configurar seu perfil. Por favor, complete suas informações.');
        }
      }
      
      return user;
    } catch (error) {
      crashlyticsService.logAuthError(error, { method: 'signInWithMicrosoft' });
      
      const errorName = getErrorName(error);
      const errorMessage = getErrorMessage(error);
      
      console.error('🔷 Erro no login com Microsoft:', { errorName, errorMessage });
      
      switch (errorName) {
        case 'NetworkError':
          showError(getString('networkError'));
          break;
        case 'UnauthorizedError':
          showError('Erro na autenticação com Microsoft. Tente novamente.');
          break;
        default:
          showError(`Erro no login com Microsoft: ${errorMessage || 'Tente novamente.'}`);
          break;
      }
      
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const user = await repository!.signInWithApple();
      
      try {
        const session = await getUserSessionUseCase.execute(user);
        
        setUser(session.user);
        setUserProfile(session.userProfile);
        setCustomClaims(session.claims);
        if (session.academia) {
          setGym(session.academia);
        }
      } catch (sessionError) {
        console.log('👤 Usuário autenticado via Apple mas sem perfil. Direcionando para criação...');
        
        // Mantém o usuário autenticado mas sem perfil completo
        setUser(user);
        setUserProfile(null);
        setCustomClaims({
          role: 'student', // Papel padrão temporário
          academiaId: undefined,
          permissions: []
        });
        setGym(null);
        
        // Notificação amigável para usuários do Apple
        const errorName = getErrorName(sessionError);
        if (errorName === 'UserProfileNotFoundError') {
          showError('Bem-vindo! Como é seu primeiro acesso, precisamos configurar seu perfil. Por favor, complete suas informações.');
        }
      }
      
      return user;
    } catch (error) {
      crashlyticsService.logAuthError(error, { method: 'signInWithApple' });
      
      const errorName = getErrorName(error);
      const errorMessage = getErrorMessage(error);
      
      console.error('🍎 Erro no login com Apple:', { errorName, errorMessage });
      
      switch (errorName) {
        case 'NetworkError':
          showError(getString('networkError'));
          break;
        case 'UnauthorizedError':
          showError('Erro na autenticação com Apple. Tente novamente.');
          break;
        default:
          showError(`Erro no login com Apple: ${errorMessage || 'Tente novamente.'}`);
          break;
      }
      
      throw error;
    }
  };

  useEffect(() => {
    if (authListenerInitialized) return;

    authListenerInitialized = true;
    
    let loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    const setupAuthListener = async () => {
      try {
        if (repository) {
          authUnsubscribe = repository.onAuthStateChanged(async (user) => {
            if (user) {
              try {
                const session = await getUserSessionUseCase.execute(user);
                setUser(session.user);
                setUserProfile(session.userProfile);
                setCustomClaims(session.claims);
                if (session.academia) {
                  setGym(session.academia);
                }
              } catch (error) {
                // Verificar o tipo de erro antes de logar
                const errorName = getErrorName(error);
                const errorMessage = getErrorMessage(error);
                
                if (errorName === 'UserProfileNotFoundError') {
                  // Este é um cenário esperado, não um erro crítico
                  console.log('👤 Usuário autenticado mas sem perfil. Direcionando para criação de perfil...');
                  
                  // Mantém o usuário autenticado mas sem perfil completo
                  setUser(user);
                  setUserProfile(null);
                  setCustomClaims({
                    role: 'student', // Papel padrão temporário
                    academiaId: undefined,
                    permissions: []
                  });
                  setGym(null);
                  
                  // Notificação amigável direcionando para criação de perfil
                  showError('Bem-vindo! Precisamos configurar seu perfil para continuar. Por favor, complete suas informações.');
                  
                } else {
                  // Para outros erros críticos, logar como erro e fazer logout
                  console.error('🚨 Erro crítico ao carregar sessão do usuário:', { errorName, errorMessage, error });
                  crashlyticsService.logAuthError(error, { method: 'authStateListener' });
                  
                  showError('Erro crítico na sessão. Fazendo logout por segurança.');
                  logout();
                }
              }
            } else {
              logout();
            }
            
            clearTimeout(loadingTimeout);
            setLoading(false);
          });
        }
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    };

    setupAuthListener();

    return () => {
      clearTimeout(loadingTimeout);
      if (authUnsubscribe) {
        authUnsubscribe();
        authUnsubscribe = null;
      }
      authListenerInitialized = false;
    };
  }, []);

  return {
    user: AuthSelectors.getUser(authState),
    userProfile: AuthSelectors.getUserProfile(authState),
    academia: AuthSelectors.getAcademia(authState),
    customClaims: AuthSelectors.getClaims(authState),
    loading: AuthSelectors.isLoading(authState),
    isAuthenticated: AuthSelectors.isAuthenticated(authState),
    
    signIn,
    signUp,
    signOut: signOutUser,
    signInWithGoogle,
    signInWithFacebook,
    signInWithMicrosoft,
    signInWithApple,
    sendPasswordResetEmail,
    
    getUserType: () => AuthSelectors.getUserType(authState),
    isComplete: () => AuthSelectors.isComplete(authState),
    hasValidClaims: () => AuthSelectors.hasValidClaims(authState),
    needsOnboarding: () => AuthSelectors.needsOnboarding(authState),
    getDisplayName: () => AuthSelectors.getDisplayName(authState),
    getEmail: () => AuthSelectors.getEmail(authState),
    getAcademiaId: () => AuthSelectors.getAcademiaId(authState),
    getAcademiaName: () => AuthSelectors.getAcademiaName(authState),
    getAuthSession: () => AuthSelectors.getAuthSession(authState),
    
    // Novos métodos para verificar estado do perfil
    needsProfileCreation: () => {
      return AuthSelectors.isAuthenticated(authState) && !AuthSelectors.getUserProfile(authState);
    },
    isProfileIncomplete: () => {
      const profile = AuthSelectors.getUserProfile(authState);
      return AuthSelectors.isAuthenticated(authState) && (!profile || !AuthSelectors.isComplete(authState));
    },
    
    // Método para iniciar processo de criação de perfil após login
    startProfileCreation: async (email: string, password: string) => {
      try {
        console.log('🚀 Iniciando processo de criação de perfil...');
        
        // Fazer login novamente para obter o usuário autenticado
        const user = await repository!.signInWithEmail({ email, password });
        
        // Configurar estado temporário para criação de perfil
        setUser(user);
        setUserProfile(null);
        setCustomClaims({
          role: 'student',
          academiaId: undefined,
          permissions: []
        });
        setGym(null);
        
        console.log('✅ Usuário preparado para criação de perfil');
        return user;
        
      } catch (error) {
        console.error('❌ Erro ao iniciar criação de perfil:', error);
        throw error;
      }
    }
  };
}