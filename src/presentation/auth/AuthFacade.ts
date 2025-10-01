import { useEffect } from 'react';
import useAuthStore from '@presentation/stores/AuthUIStore';
import { AuthState, AuthSelectors } from './selectors';
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
      crashlyticsService.logAuthError(error, { method: 'signIn' });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<SignUpData>) => {
    try {
      const session = await signUpUseCase.execute({
        email,
        password,
        name: userData.name || '',
        phone: userData.phone,
        userType: userData.userType || 'student',
        acceptTerms: userData.acceptTerms === true,
        acceptPrivacyPolicy: userData.acceptPrivacyPolicy === true
      });
      
      setUser(session.user);
      setUserProfile(session.userProfile);
      setCustomClaims(session.claims);
      
      return session.user;
    } catch (error) {
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
    await sendPasswordResetUseCase.execute({ email });
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
        setUser(user);
        setUserProfile(null);
        setCustomClaims(null);
        setGym(null);
      }
      
      return user;
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    const user = await repository!.signInWithFacebook();
    const session = await getUserSessionUseCase.execute(user);
    
    setUser(session.user);
    setUserProfile(session.userProfile);
    setCustomClaims(session.claims);
    if (session.academia) {
      setGym(session.academia);
    }
    
    return user;
  };

  const signInWithMicrosoft = async () => {
    return await repository!.signInWithMicrosoft();
  };

  const signInWithApple = async () => {
    return await repository!.signInWithApple();
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
                console.error('Error loading user session:', error);
                setUser(user);
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
    getAuthSession: () => AuthSelectors.getAuthSession(authState)
  };
}