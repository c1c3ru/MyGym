// AuthFacade - Maintains compatibility with existing API while using Clean Architecture

import { useEffect } from 'react';
import useAuthStore from '@/presentation/stores/AuthUIStore';
import { AuthState, AuthSelectors } from './selectors';

// Import Clean Architecture components
import { 
  SignInWithEmailUseCase,
  SignUpWithEmailUseCase,
  SignOutUseCase,
  GetCurrentUserUseCase,
  GetUserSessionUseCase,
  SendPasswordResetEmailUseCase,
  RefreshUserTokenUseCase
} from '@/domain/auth/usecases';

import { FirebaseAuthRepository } from '@/data/auth';
import { initializeFirebaseServices } from '@/infrastructure/firebase';
// import { AuthError } from '@/domain/auth/errors'; // Unused for now
import crashlyticsService from '@/infrastructure/services/crashlyticsService';

// Global variables to control initialization
let authListenerInitialized = false;
let authUnsubscribe: (() => void) | null = null;
let repository: FirebaseAuthRepository | null = null;

// Initialize use cases
let signInUseCase: SignInWithEmailUseCase;
let signUpUseCase: SignUpWithEmailUseCase;
let signOutUseCase: SignOutUseCase;
// let getCurrentUserUseCaseInstance: GetCurrentUserUseCase; // Unused for now
let getUserSessionUseCase: GetUserSessionUseCase;
let sendPasswordResetUseCase: SendPasswordResetEmailUseCase;
// let refreshTokenUseCase: RefreshUserTokenUseCase; // Unused for now

// Feature flag for Clean Architecture (can be enabled gradually)
const USE_CLEAN_ARCHITECTURE = process.env.EXPO_PUBLIC_USE_CLEAN_ARCH === 'true' || true;

// Initialize Clean Architecture components
function initializeCleanArchitecture() {
  if (repository) return repository;

  try {
    // Initialize Firebase services
    const { auth, db } = initializeFirebaseServices();
    
    // Create repository
    repository = new FirebaseAuthRepository(auth, db);
    
    // Create use cases
    signInUseCase = new SignInWithEmailUseCase(repository);
    signUpUseCase = new SignUpWithEmailUseCase(repository);
    signOutUseCase = new SignOutUseCase(repository);
    // getCurrentUserUseCase = new GetCurrentUserUseCase(repository); // Unused
    getUserSessionUseCase = new GetUserSessionUseCase(repository);
    sendPasswordResetUseCase = new SendPasswordResetEmailUseCase(repository);
    // refreshUserTokenUseCase = new RefreshUserTokenUseCase(repository); // Unused
    
    console.log('✅ Clean Architecture initialized successfully');
    return repository;
  } catch (error) {
    console.error('❌ Error initializing Clean Architecture:', error);
    throw error;
  }
}

export function useAuthFacade() {
  const {
    setUser,
    setUserProfile,
    setAcademia,
    setCustomClaims,
    setLoading,
    // login, // Unused for now
    logout,
    user,
    userProfile,
    academia,
    customClaims,
    loading,
    isAuthenticated,
    // getUserType, // Unused for now
    // isComplete, // Unused for now
    // hasValidClaims // Unused for now
  } = useAuthStore();

  // const loadingTimeout = useRef<NodeJS.Timeout | null>(null); // Unused for now

  // Create auth state for selectors
  const authState: AuthState = {
    user,
    userProfile,
    academia,
    customClaims,
    loading,
    isAuthenticated
  };

  // Initialize Clean Architecture (if enabled)
  useEffect(() => {
    if (USE_CLEAN_ARCHITECTURE) {
      try {
        initializeCleanArchitecture();
      } catch (error) {
        console.error('Failed to initialize Clean Architecture:', error);
      }
    }
  }, []);

  // Legacy authentication methods (fallback to existing logic)
  const legacySignIn = async (email: string, password: string) => {
    // Import and use existing auth logic
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { auth }: { auth: any } = await import('../../infrastructure/services/firebase');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const legacySignUp = async (email: string, password: string, userData: any) => {
    // Import and use existing auth logic
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const { setDoc, doc } = await import('firebase/firestore');
    const { auth, db }: { auth: any; db: any } = await import('../../infrastructure/services/firebase');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    return userCredential.user;
  };

  // Enhanced authentication methods using Clean Architecture when enabled
  const signIn = async (email: string, password: string) => {
    if (USE_CLEAN_ARCHITECTURE && signInUseCase) {
      try {
        console.log('🔐 Using Clean Architecture for sign in');
        const session = await signInUseCase.execute({ email, password });
        
        // Update store with domain entities
        setUser(session.user);
        setUserProfile(session.userProfile);
        setCustomClaims(session.claims);
        if (session.academia) {
          setAcademia(session.academia);
        }

        // Log successful authentication to Crashlytics
        crashlyticsService.logAuthEvent(
          session.user.id,
          session.userProfile.userType,
          session.academia?.id
        );
        
        return session.user;
      } catch (error) {
        console.error('Clean Architecture sign in failed, falling back to legacy:', error);
        crashlyticsService.logAuthError(error, { method: 'signIn', architecture: 'clean' });
        // Fall back to legacy implementation
      }
    }
    
    // Legacy implementation
    console.log('🔐 Using legacy sign in');
    return await legacySignIn(email, password);
  };

  const signUp = async (email: string, password: string, userData: any) => {
    if (USE_CLEAN_ARCHITECTURE && signUpUseCase) {
      try {
        console.log('👤 Using Clean Architecture for sign up');
        const session = await signUpUseCase.execute({
          email,
          password,
          name: userData.name,
          phone: userData.phone,
          userType: userData.userType
        });
        
        // Update store with domain entities
        setUser(session.user);
        setUserProfile(session.userProfile);
        setCustomClaims(session.claims);
        
        return session.user;
      } catch (error) {
        console.error('Clean Architecture sign up failed, falling back to legacy:', error);
        // Fall back to legacy implementation
      }
    }
    
    // Legacy implementation
    console.log('👤 Using legacy sign up');
    return await legacySignUp(email, password, userData);
  };

  const signOutUser = async () => {
    if (USE_CLEAN_ARCHITECTURE && signOutUseCase) {
      try {
        console.log('🚪 Using Clean Architecture for sign out');
        await signOutUseCase.execute();
        logout();
        return;
      } catch (error) {
        console.error('Clean Architecture sign out failed, falling back to legacy:', error);
      }
    }
    
    // Legacy implementation
    console.log('🚪 Using legacy sign out');
    const { signOut } = await import('firebase/auth');
    const { auth }: { auth: any } = await import('../../infrastructure/services/firebase');
    await signOut(auth);
    logout();
  };

  const sendPasswordResetEmail = async (email: string) => {
    if (USE_CLEAN_ARCHITECTURE && sendPasswordResetUseCase) {
      try {
        console.log('📧 Using Clean Architecture for password reset');
        await sendPasswordResetUseCase.execute({ email });
        return;
      } catch (error) {
        console.error('Clean Architecture password reset failed, falling back to legacy:', error);
      }
    }
    
    // Legacy implementation
    console.log('📧 Using legacy password reset');
    const { sendPasswordResetEmail: firebaseSendPasswordReset } = await import('firebase/auth');
    const { auth }: { auth: any } = await import('../../infrastructure/services/firebase');
    await firebaseSendPasswordReset(auth, email);
  };

  // Social auth methods (legacy for now)
  const signInWithGoogle = async () => {
    if (USE_CLEAN_ARCHITECTURE && repository) {
      try {
        const user = await repository.signInWithGoogle();
        
        try {
          const session = await getUserSessionUseCase.execute(user);
          
          setUser(session.user);
          setUserProfile(session.userProfile);
          setCustomClaims(session.claims);
          if (session.academia) {
            setAcademia(session.academia);
          }
        } catch (sessionError: any) {
          // Se o perfil não existe, apenas definir o usuário
          // O usuário será redirecionado para completar o perfil
          console.log('🔍 Perfil não encontrado para login social, criando sessão básica');
          setUser(user);
          setUserProfile(null);
          setCustomClaims(null);
          setAcademia(null);
        }
        
        return user;
      } catch (error) {
        console.error('Clean Architecture Google sign in failed:', error);
        throw error;
      }
    }
    
    // Legacy implementation would go here
    throw new Error('Social authentication not implemented in legacy mode');
  };

  const signInWithFacebook = async () => {
    if (USE_CLEAN_ARCHITECTURE && repository) {
      try {
        const user = await repository.signInWithFacebook();
        const session = await getUserSessionUseCase.execute(user);
        
        setUser(session.user);
        setUserProfile(session.userProfile);
        setCustomClaims(session.claims);
        if (session.academia) {
          setAcademia(session.academia);
        }
        
        return user;
      } catch (error) {
        console.error('Clean Architecture Facebook sign in failed:', error);
        throw error;
      }
    }
    
    throw new Error('Social authentication not implemented in legacy mode');
  };

  const signInWithMicrosoft = async () => {
    if (USE_CLEAN_ARCHITECTURE && repository) {
      return await repository.signInWithMicrosoft();
    }
    throw new Error('Social authentication not implemented in legacy mode');
  };

  const signInWithApple = async () => {
    if (USE_CLEAN_ARCHITECTURE && repository) {
      return await repository.signInWithApple();
    }
    throw new Error('Social authentication not implemented in legacy mode');
  };

  // Auth state listener setup
  useEffect(() => {
    if (authListenerInitialized) return;

    console.log('🔍 Setting up auth state listener...');
    authListenerInitialized = true;
    
    let loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    const setupAuthListener = async () => {
      try {
        if (USE_CLEAN_ARCHITECTURE && repository) {
          // Use Clean Architecture auth listener
          authUnsubscribe = repository.onAuthStateChanged(async (user) => {
            console.log('🔐 Clean Architecture auth state changed:', user?.email || 'null');
            
            if (user) {
              try {
                const session = await getUserSessionUseCase.execute(user);
                setUser(session.user);
                setUserProfile(session.userProfile);
                setCustomClaims(session.claims);
                if (session.academia) {
                  setAcademia(session.academia);
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
        } else {
          // Legacy auth listener
          const { onAuthStateChanged } = await import('firebase/auth');
          const { auth }: { auth: any } = await import('../../infrastructure/services/firebase');
          
          authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('🔐 Legacy auth state changed:', firebaseUser?.email || 'null');
            
            if (firebaseUser) {
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                emailVerified: firebaseUser.emailVerified,
                createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
                lastSignInAt: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : undefined
              });

              // Load user profile using legacy logic
              try {
                // Legacy user profile loading would go here if needed
                console.log('User profile loading skipped in legacy mode');
              } catch (error) {
                console.error('Error loading user profile:', error);
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
      console.log('🔄 Removing auth listener');
      clearTimeout(loadingTimeout);
      if (authUnsubscribe) {
        authUnsubscribe();
        authUnsubscribe = null;
      }
      authListenerInitialized = false;
    };
  }, []);

  // Return the same interface as the current useAuth hook
  return {
    // State
    user: AuthSelectors.getUser(authState),
    userProfile: AuthSelectors.getUserProfile(authState),
    academia: AuthSelectors.getAcademia(authState),
    customClaims: AuthSelectors.getClaims(authState),
    loading: AuthSelectors.isLoading(authState),
    isAuthenticated: AuthSelectors.isAuthenticated(authState),
    
    // Methods
    signIn,
    signUp,
    signOut: signOutUser,
    signInWithGoogle,
    signInWithFacebook,
    signInWithMicrosoft,
    signInWithApple,
    sendPasswordResetEmail,
    
    // Computed properties
    getUserType: () => AuthSelectors.getUserType(authState),
    isComplete: () => AuthSelectors.isComplete(authState),
    hasValidClaims: () => AuthSelectors.hasValidClaims(authState),
    needsOnboarding: () => AuthSelectors.needsOnboarding(authState),
    
    // Additional helpers
    getDisplayName: () => AuthSelectors.getDisplayName(authState),
    getEmail: () => AuthSelectors.getEmail(authState),
    getAcademiaId: () => AuthSelectors.getAcademiaId(authState),
    getAcademiaName: () => AuthSelectors.getAcademiaName(authState),
    
    // Clean Architecture specific
    isUsingCleanArchitecture: USE_CLEAN_ARCHITECTURE,
    getAuthSession: () => AuthSelectors.getAuthSession(authState)
  };
}