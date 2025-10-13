import { useEffect, useCallback, useRef } from 'react';
import { useAuthActions } from './useAuthActions';
import { useAuthUI } from './useAuthUI';
import useAuthStore from '@presentation/stores/AuthUIStore';
import { loginSchema, signUpSchema } from '@domain/auth/usecases/schemas';

/**
 * useAuthClean - Presentation Layer
 * Hook principal que integra Clean Architecture com o sistema existente
 * Mantém compatibilidade com useAuthMigration mas usa a nova estrutura
 */
export const useAuthClean = () => {
  const authActions = useAuthActions();
  const authUI = useAuthUI();
  
  // Compatibilidade com o store existente
  const {
    user,
    userProfile,
    gym: academia,
    customClaims,
    loading,
    isAuthenticated,
    setUser,
    setUserProfile,
    setGym,
    setCustomClaims,
    setLoading,
    login,
    logout,
    updateProfile,
    getUserType,
    isComplete,
    hasValidClaims
  } = useAuthStore();

  // Nota: O listener de auth state é gerenciado pelo AuthProvider
  // Não precisamos duplicar essa lógica aqui

  // Login com email e senha (com validação Zod)
  const signInWithEmailAndPassword = useCallback(async (email, password) => {
    try {
      // Validar dados com Zod
      try {
        loginSchema.parse({ email, password });
      } catch (validationError) {
        const errors = validationError.errors?.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {}) || {};
        authUI.setFormErrors(errors);
        return { success: false, errors };
      }

      const result = await authActions.signInWithEmailAndPassword(email, password);
      return { success: result.isSuccess(), result };
    } catch (error) {
      console.error('❌ useAuthClean.signInWithEmailAndPassword:', error);
      return { success: false, error };
    }
  }, [authActions, authUI]);

  // Cadastro com email e senha (com validação Zod)
  const signUpWithEmailAndPassword = useCallback(async (email, password, userData = {}) => {
    try {
      // Validar dados com Zod - incluir campos obrigatórios do schema
      const signUpData = { 
        email, 
        password, 
        confirmPassword: password,
        name: userData.name || userData.displayName || email.split('@')[0] || 'Usuário',
        acceptTerms: userData.acceptTerms !== undefined ? userData.acceptTerms : true,
        acceptPrivacyPolicy: userData.acceptPrivacyPolicy !== undefined ? userData.acceptPrivacyPolicy : true,
        ...userData 
      };
      
      try {
        signUpSchema.parse(signUpData);
      } catch (validationError) {
        const errors = validationError.errors?.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {}) || {};
        authUI.setFormErrors(errors);
        return { success: false, errors };
      }

      const result = await authActions.signUp(email, password, signUpData);
      return { success: result.isSuccess(), result };
    } catch (error) {
      console.error('❌ useAuthClean.signUpWithEmailAndPassword:', error);
      return { success: false, error };
    }
  }, [authActions, authUI]);

  // Login social (Google, Facebook, etc.)
  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await authActions.signInWithGoogle();
      return { success: result.isSuccess(), result };
    } catch (error) {
      console.error('❌ useAuthClean.signInWithGoogle:', error);
      return { success: false, error };
    }
  }, [authActions]);

  const signInWithFacebook = useCallback(async () => {
    try {
      const result = await authActions.signInWithFacebook();
      return { success: result.isSuccess(), result };
    } catch (error) {
      console.error('❌ useAuthClean.signInWithFacebook:', error);
      return { success: false, error };
    }
  }, [authActions]);

  const signInWithMicrosoft = useCallback(async () => {
    try {
      const result = await authActions.signInWithMicrosoft();
      return { success: result.isSuccess(), result };
    } catch (error) {
      console.error('❌ useAuthClean.signInWithMicrosoft:', error);
      return { success: false, error };
    }
  }, [authActions]);

  const signInWithApple = useCallback(async () => {
    try {
      const result = await authActions.signInWithApple();
      return { success: result.isSuccess(), result };
    } catch (error) {
      console.error('❌ useAuthClean.signInWithApple:', error);
      return { success: false, error };
    }
  }, [authActions]);

  // Logout
  const signOut = useCallback(async () => {
    try {
      await authActions.signOut();
      return { success: true };
    } catch (error) {
      console.error('❌ useAuthClean.signOut:', error);
      return { success: false, error };
    }
  }, [authActions]);

  // Atualizar perfil do usuário
  const updateUserProfile = useCallback(async (updates) => {
    try {
      if (!user?.uid) {
        throw new Error('Usuário não autenticado');
      }

      // Atualizar via use case (através do repository)
      // Para simplificar, por enquanto vamos usar o método existente
      // TODO: Implementar UpdateUserUseCase
      const updatedProfile = { ...userProfile, ...updates, updatedAt: new Date() };
      updateProfile(updates);
      setUserProfile(updatedProfile);

      return { success: true, userProfile: updatedProfile };
    } catch (error) {
      console.error('❌ useAuthClean.updateUserProfile:', error);
      return { success: false, error };
    }
  }, [user, userProfile, updateProfile, setUserProfile]);

  // Refresh token e custom claims
  const refreshUserToken = useCallback(async () => {
    try {
      await authActions.refreshToken();
      return { success: true };
    } catch (error) {
      console.error('❌ useAuthClean.refreshUserToken:', error);
      return { success: false, error };
    }
  }, [authActions]);

  const waitForClaimsUpdate = useCallback(async (expectedAcademiaId, maxAttempts = 10, delayMs = 1000) => {
    try {
      const claims = await authActions.waitForClaimsUpdate(expectedAcademiaId, maxAttempts, delayMs);
      return { success: !!claims, claims };
    } catch (error) {
      console.error('❌ useAuthClean.waitForClaimsUpdate:', error);
      return { success: false, error };
    }
  }, [authActions]);

  // Helpers para compatibilidade
  const loadCustomClaims = useCallback(async (firebaseUser) => {
    try {
      const result = await authActions.getCurrentUser();
      setCustomClaims(result.customClaims);
      return result.customClaims;
    } catch (error) {
      console.error('❌ useAuthClean.loadCustomClaims:', error);
      setCustomClaims(null);
      return null;
    }
  }, [authActions, setCustomClaims]);

  const fetchAcademiaData = useCallback(async (academiaId) => {
    try {
      // TODO: Implementar GetAcademyUseCase
      // Por enquanto, vamos usar a lógica existente através do getCurrentUser
      const result = await authActions.getCurrentUser();
      if (result.academy) {
        setGym(result.academy);
      }
      return result.academy;
    } catch (error) {
      console.error('❌ useAuthClean.fetchAcademiaData:', error);
      setGym(null);
      return null;
    }
  }, [authActions, setGym]);

  const fetchUserProfile = useCallback(async (userId, firebaseUser) => {
    try {
      const result = await authActions.getCurrentUser();
      if (result.userProfile) {
        setUserProfile(result.userProfile);
      }
      return result.userProfile;
    } catch (error) {
      console.error('❌ useAuthClean.fetchUserProfile:', error);
      setUserProfile(null);
      return null;
    }
  }, [authActions, setUserProfile]);

  return {
    // Estado (compatibilidade com useAuthMigration)
    user,
    userProfile,
    academia,
    customClaims,
    loading: loading || authUI.isAnyActionInProgress(),
    isAuthenticated,
    getUserType,
    isComplete,
    hasValidClaims,

    // Actions principais (Clean Architecture)
    signInWithEmailAndPassword,
    signUpWithEmailAndPassword,
    signInWithGoogle,
    signInWithFacebook,
    signInWithMicrosoft,
    signInWithApple,
    signOut,
    updateUserProfile,
    refreshUserToken,
    waitForClaimsUpdate,

    // Helpers para compatibilidade
    loadCustomClaims,
    fetchAcademiaData,
    fetchUserProfile,

    // Estado de UI (re-exportado)
    ...authUI,

    // Actions de UI específicas
    ...authActions
  };
};