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
import { SignUpData, UserProfile } from '@domain/auth/entities';
import { FirebaseAuthRepository } from '@data/auth';
import { initializeFirebaseServices } from '@infrastructure/firebase';
import crashlyticsService from '@infrastructure/services/crashlyticsService';
import { useTheme } from '@contexts/ThemeContext';

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
  const { getString } = useTheme();
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
      if (errorName === getString('userProfileNotFoundError')) {
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

      // Verificar se é erro de credenciais inválidas
      if (errorName === 'InvalidCredentialsError' || errorName === 'auth/wrong-password' || errorName === 'auth/invalid-credential') {
        // Tentar verificar se a conta existe com outro provedor
        try {
          const signInMethods = await repository!.getSignInMethodsForEmail(email);

          if (signInMethods && signInMethods.length > 0) {
            // Conta existe mas com outro provedor
            const providerMap: Record<string, string> = {
              'google.com': 'Google',
              'facebook.com': 'Facebook',
              'apple.com': 'Apple',
              'microsoft.com': 'Microsoft',
              'password': 'email e senha'
            };

            const providers = signInMethods.map(method => providerMap[method] || method).join(', ');
            showError(`Esta conta foi criada com ${providers}. Use o método de login correto.`);
            throw error;
          }
        } catch (checkError) {
          console.error('Erro ao verificar métodos de login:', checkError);
        }
      }

      // Para outros erros, fazer log e tratamento normal
      crashlyticsService.logAuthError(error, { method: 'signIn' });
      console.error('🔐 Erro no login:', { errorName, errorMessage });

      switch (errorName) {
        case 'unauthorizedError':
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
        case getString('networkError'):
          showError(getString('networkError'));
          break;
        case getString('userProfileNotFoundError'):
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

      // Tratamento especial para email já em uso
      if (errorName === 'EmailAlreadyInUseError' || errorMessage?.includes('email-already-in-use')) {
        try {
          // Verificar se existe perfil para este email
          const existingProfile = await repository!.getUserProfileByEmail(email);

          if (existingProfile) {
            // Perfil já existe - usuário deve fazer login
            showError('Este email já está cadastrado com um perfil completo. Por favor, faça login.');
          } else {
            // Email existe mas sem perfil - permitir completar cadastro
            console.log('📝 Email existe no Auth mas sem perfil. Permitindo completar cadastro...');

            try {
              // Fazer login com as credenciais fornecidas para obter o usuário
              const user = await repository!.signInWithEmail({ email, password });

              // Criar perfil com os dados fornecidos
              const userProfile = await repository!.createUserProfile(user.id, {
                id: user.id,
                name: userData.name || '',
                email: email,
                phone: userData.phone || '',
                userType: userData.userType || 'student',
                isActive: true,
                currentGraduation: userData.userType === 'student' ? 'Iniciante' : undefined,
                graduations: [],
                classIds: [],
                createdAt: new Date(),
                updatedAt: new Date()
              });

              // Criar claims padrão
              const claims = {
                role: userData.userType || 'student',
                academiaId: undefined,
                permissions: []
              };

              // Atualizar estado
              setUser(user);
              setUserProfile(userProfile);
              setCustomClaims(claims);

              showError('Perfil criado com sucesso! Bem-vindo!');
              return user;
            } catch (completeError) {
              console.error('Erro ao completar cadastro:', completeError);
              showError('Não foi possível completar o cadastro. Tente fazer login com o provedor social usado anteriormente.');
            }
          }
        } catch (checkError) {
          console.error('Erro ao verificar perfil existente:', checkError);
          showError('Este email já está sendo usado. Tente fazer login ou use outro email.');
        }
      } else {
        // Outros erros
        switch (errorName) {
          case 'WeakPasswordError':
            showError('Senha muito fraca. Use pelo menos 6 caracteres com letras e números.');
            break;
          case 'InvalidEmailError':
            showError('Email inválido. Verifique o formato do email.');
            break;
          case 'networkError':
            showError(getString('networkError'));
            break;
          case 'ValidationError':
            showError('Dados inválidos. Verifique as informações e tente novamente.');
            break;
          default:
            showError(`Erro no registro: ${errorMessage || 'Tente novamente ou entre em contato com o suporte.'}`);
            break;
        }
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
        case 'networkError':
          showError(getString('networkError'));
          break;
        case 'TooManyRequestsError':
          showError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
          break;
        default:
          showError(`Erro ao enviar email: ${errorMessage || getString('tryAgainPeriod')}`);
          break;
      }

      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔍 [AuthFacade] Iniciando signInWithGoogle...');
      const user = await repository!.signInWithGoogle();

      console.log('✅ [AuthFacade] Autenticado com sucesso via Google. UID:', user.id);

      try {
        console.log('🔍 [AuthFacade] Carregando sessão para o usuário do Google...');
        const session = await getUserSessionUseCase.execute(user);

        console.log('✅ [AuthFacade] Sessão carregada com sucesso para usuário Google');
        setUser(session.user);
        setUserProfile(session.userProfile);
        setCustomClaims(session.claims);
        if (session.academia) {
          setGym(session.academia);
        }
      } catch (sessionError) {
        console.log('👤 [AuthFacade] Usuário autenticado via Google mas sem perfil. Direcionando para criação...');
        // ... (rest of the logic remains same but with logs)
        setUser(user);
        setUserProfile(null);
        setCustomClaims({
          role: 'student',
          academiaId: undefined,
          permissions: []
        });
        setGym(null);

        const errorName = getErrorName(sessionError);
        if (errorName === getString('userProfileNotFoundError')) {
          showError(getString('welcomeFirstAccess'));
        }
      }

      return user;
    } catch (error) {
      console.error('❌ [AuthFacade] Erro no fluxo de login com Google:', error);
      crashlyticsService.logAuthError(error, { method: 'signInWithGoogle' });
      // ... rest of the error handling
      const errorName = getErrorName(error);
      const errorMessage = getErrorMessage(error);

      switch (errorName) {
        case 'networkError':
          showError(getString('networkError'));
          break;
        case getString('unauthorizedError'):
          showError('Erro na autenticação com Google. Tente novamente.');
          break;
        default:
          showError(`Erro no login com Google: ${errorMessage || getString('tryAgainPeriod')}`);
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
        if (errorName === getString('userProfileNotFoundError')) {
          showError(getString('welcomeFirstAccess'));
        }
      }

      return user;
    } catch (error) {
      crashlyticsService.logAuthError(error, { method: 'signInWithFacebook' });

      const errorName = getErrorName(error);
      const errorMessage = getErrorMessage(error);

      console.error('📘 Erro no login com Facebook:', { errorName, errorMessage });

      switch (errorName) {
        case 'networkError':
          showError(getString('networkError'));
          break;
        case getString('unauthorizedError'):
          showError('Erro na autenticação com Facebook. Tente novamente.');
          break;
        default:
          showError(`Erro no login com Facebook: ${errorMessage || getString('tryAgainPeriod')}`);
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
        if (errorName === getString('userProfileNotFoundError')) {
          showError(getString('welcomeFirstAccess'));
        }
      }

      return user;
    } catch (error) {
      crashlyticsService.logAuthError(error, { method: 'signInWithMicrosoft' });

      const errorName = getErrorName(error);
      const errorMessage = getErrorMessage(error);

      console.error('🔷 Erro no login com Microsoft:', { errorName, errorMessage });

      switch (errorName) {
        case 'networkError':
          showError(getString('networkError'));
          break;
        case getString('unauthorizedError'):
          showError('Erro na autenticação com Microsoft. Tente novamente.');
          break;
        default:
          showError(`Erro no login com Microsoft: ${errorMessage || getString('tryAgainPeriod')}`);
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
        if (errorName === getString('userProfileNotFoundError')) {
          showError(getString('welcomeFirstAccess'));
        }
      }

      return user;
    } catch (error) {
      crashlyticsService.logAuthError(error, { method: 'signInWithApple' });

      const errorName = getErrorName(error);
      const errorMessage = getErrorMessage(error);

      console.error('🍎 Erro no login com Apple:', { errorName, errorMessage });

      switch (errorName) {
        case 'networkError':
          showError(getString('networkError'));
          break;
        case getString('unauthorizedError'):
          showError('Erro na autenticação com Apple. Tente novamente.');
          break;
        default:
          showError(`Erro no login com Apple: ${errorMessage || getString('tryAgainPeriod')}`);
          break;
      }

      throw error;
    }
  };

  useEffect(() => {
    if (authListenerInitialized) return;

    authListenerInitialized = true;

    const loadingTimeout = setTimeout(() => {
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

                console.log(`🔍 [AuthFacade] Catch no listener - Name: "${errorName}", Message: "${errorMessage}"`);

                // Verificar se o erro é de perfil não encontrado
                const isProfileNotFound =
                  errorName === 'UserProfileNotFoundError' ||
                  errorName === 'userProfileNotFoundError' ||
                  errorMessage.toLowerCase().includes('profile not found') ||
                  errorMessage.toLowerCase().includes('perfil não encontrado') ||
                  errorMessage.toLowerCase().includes('perfil não encontrado') ||
                  (errorName === getString('userProfileNotFoundError'));

                if (isProfileNotFound) {
                  console.log('👤 [AuthFacade] Perfil não encontrado confirmado. Mantendo usuário para cadastro.');

                  // Mantém o usuário autenticado para que possa criar o perfil
                  setUser(user);
                  setUserProfile(null);
                  setCustomClaims({
                    role: 'student',
                    academiaId: undefined,
                    permissions: []
                  });
                  setGym(null);
                } else {
                  // Para outros erros realmente críticos
                  console.error('🚨 [AuthFacade] Erro crítico real:', { errorName, errorMessage });
                  crashlyticsService.logAuthError(error, { method: 'authStateListener' });
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
    },

    // Métodos de compatibilidade com AuthContext legado
    updateUserProfile: async (updates: Partial<UserProfile>) => {
      try {
        console.log('📝 updateUserProfile: Iniciando atualização do perfil');

        if (!user) {
          console.error('❌ updateUserProfile: Usuário não está logado');
          throw new Error('Usuário não está logado');
        }

        const updatedProfile = await repository!.updateUserProfile(user.id, updates);
        setUserProfile(updatedProfile);

        // Se atualizou academiaId, buscar dados da academia
        if (updates.academiaId) {
          const academiaData = await repository!.getAcademia(updates.academiaId);
          if (academiaData) {
            setGym(academiaData);
          }
        }

        console.log('✅ updateUserProfile: Perfil atualizado com sucesso');
        return updatedProfile;
      } catch (error) {
        console.error('❌ updateUserProfile: Erro na atualização:', error);
        throw error;
      }
    },

    updateAcademiaAssociation: async (academiaId: string) => {
      try {
        console.log('🔗 updateAcademiaAssociation: Iniciando associação com academia:', academiaId);

        if (!user) {
          console.error('❌ updateAcademiaAssociation: Usuário não está logado');
          throw new Error('Usuário não está logado');
        }

        // Atualizar perfil com academiaId
        await repository!.updateUserProfile(user.id, { academiaId });

        // Buscar dados da academia
        const academiaData = await repository!.getAcademia(academiaId);
        if (academiaData) {
          setGym(academiaData);
        }

        // Recarregar perfil completo
        const updatedProfile = await repository!.getUserProfile(user.id);
        if (updatedProfile) {
          setUserProfile(updatedProfile);
        }

        console.log('✅ updateAcademiaAssociation: Associação completa!');
      } catch (error) {
        console.error('❌ updateAcademiaAssociation: Erro na associação:', error);
        throw error;
      }
    },

    fetchUserProfile: async (userId?: string) => {
      try {
        const targetUserId = userId || user?.id;
        if (!targetUserId) {
          console.error('❌ fetchUserProfile: Nenhum userId fornecido');
          return null;
        }

        console.log('🔍 fetchUserProfile: Buscando perfil para userId:', targetUserId);

        const profile = await repository!.getUserProfile(targetUserId);
        if (profile) {
          setUserProfile(profile);

          // Se o usuário tem academiaId, buscar dados da academia
          if (profile.academiaId) {
            console.log('🏢 fetchUserProfile: Usuário tem academiaId, buscando dados da academia...');
            const academiaData = await repository!.getAcademia(profile.academiaId);
            if (academiaData) {
              setGym(academiaData);
            }
          } else {
            console.log('⚠️ fetchUserProfile: Usuário SEM academiaId');
            setGym(null);
          }

          console.log('✅ fetchUserProfile: Perfil carregado com sucesso');
          return profile;
        } else {
          console.log('❌ fetchUserProfile: Perfil não encontrado');
          setUserProfile(null);
          setGym(null);
          return null;
        }
      } catch (error) {
        console.error('❌ fetchUserProfile: Erro ao buscar perfil:', error);
        return null;
      }
    },

    fetchAcademiaData: async (academiaId: string) => {
      try {
        console.log('🏢 fetchAcademiaData: Buscando dados da academia:', academiaId);

        const academiaData = await repository!.getAcademia(academiaId);
        if (academiaData) {
          console.log('✅ fetchAcademiaData: Academia encontrada');
          setGym(academiaData);
          return academiaData;
        } else {
          console.log('❌ fetchAcademiaData: Academia não encontrada');
          setGym(null);
          return null;
        }
      } catch (error) {
        console.error('❌ fetchAcademiaData: Erro ao buscar dados da academia:', error);
        return null;
      }
    },

    refreshClaimsAndProfile: async () => {
      try {
        console.log('🔄 refreshClaimsAndProfile: Atualizando claims e perfil...');

        if (!user) {
          console.log('⚠️ refreshClaimsAndProfile: Nenhum usuário logado');
          return;
        }

        // Forçar refresh do token para obter claims atualizados
        await repository!.refreshUserToken(user);

        // Recarregar claims
        const claims = await repository!.getUserClaims(user);
        if (claims) {
          setCustomClaims(claims);
        }

        // Recarregar perfil do usuário
        const profile = await repository!.getUserProfile(user.id);
        if (profile) {
          setUserProfile(profile);

          // Se tem academiaId, recarregar academia também
          if (profile.academiaId) {
            const academiaData = await repository!.getAcademia(profile.academiaId);
            if (academiaData) {
              setGym(academiaData);
            }
          }
        }

        console.log('✅ refreshClaimsAndProfile: Claims e perfil atualizados');
      } catch (error) {
        console.error('❌ refreshClaimsAndProfile: Erro na atualização:', error);
        throw error;
      }
    },

    loadCustomClaims: async () => {
      try {
        console.log('🔍 loadCustomClaims: Carregando claims...');

        if (!user) {
          console.log('⚠️ loadCustomClaims: Nenhum usuário logado');
          return null;
        }

        const claims = await repository!.getUserClaims(user);
        if (claims) {
          setCustomClaims(claims);
          console.log('📋 loadCustomClaims: Claims carregados:', {
            role: claims.role,
            academiaId: claims.academiaId
          });
          return claims;
        }

        return null;
      } catch (error) {
        console.error('❌ loadCustomClaims: Erro ao carregar claims:', error);
        setCustomClaims(null);
        return null;
      }
    },

    // Alias para logout (compatibilidade)
    logout: signOutUser
  };
}