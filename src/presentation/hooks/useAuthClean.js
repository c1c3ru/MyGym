import { useAuthFacade } from '@presentation/auth/AuthFacade';

/**
 * useAuthClean - Presentation Layer
 * Hook principal que integra Clean Architecture com o sistema existente
 * Wrapper fino sobre AuthFacade para manter compatibilidade com interfaces existentes
 */
export const useAuthClean = () => {
  const authFacade = useAuthFacade();

  return {
    // Estado
    user: authFacade.user,
    userProfile: authFacade.userProfile,
    gym: authFacade.academia, // Alias para compatibilidade
    customClaims: authFacade.customClaims,
    loading: authFacade.loading,
    isAuthenticated: authFacade.isAuthenticated,

    // Getters de estado
    getUserType: authFacade.getUserType,
    isComplete: authFacade.isComplete,
    hasValidClaims: authFacade.hasValidClaims,

    // Actions principais
    signInWithEmailAndPassword: async (email, password) => {
      try {
        const user = await authFacade.signIn(email, password);
        return { success: true, result: { user } };
      } catch (error) {
        return { success: false, error };
      }
    },

    signUpWithEmailAndPassword: async (email, password, userData) => {
      try {
        const user = await authFacade.signUp(email, password, userData);
        return { success: true, result: { user } };
      } catch (error) {
        return { success: false, error };
      }
    },

    signInWithGoogle: async () => {
      try {
        const user = await authFacade.signInWithGoogle();
        return { success: true, result: { user } };
      } catch (error) {
        return { success: false, error };
      }
    },

    signInWithFacebook: async () => {
      try {
        const user = await authFacade.signInWithFacebook();
        return { success: true, result: { user } };
      } catch (error) {
        return { success: false, error };
      }
    },

    signInWithMicrosoft: async () => {
      try {
        const user = await authFacade.signInWithMicrosoft();
        return { success: true, result: { user } };
      } catch (error) {
        return { success: false, error };
      }
    },

    signInWithApple: async () => {
      try {
        const user = await authFacade.signInWithApple();
        return { success: true, result: { user } };
      } catch (error) {
        return { success: false, error };
      }
    },

    signOut: async () => {
      try {
        await authFacade.signOut();
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },

    // Métodos de perfil
    updateUserProfile: async (updates) => {
      try {
        const profile = await authFacade.updateUserProfile(updates);
        return { success: true, userProfile: profile };
      } catch (error) {
        return { success: false, error };
      }
    },

    updateAcademiaAssociation: async (academiaId) => {
      try {
        await authFacade.updateAcademiaAssociation(academiaId);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },

    refreshUserToken: async () => {
      try {
        await authFacade.refreshClaimsAndProfile();
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },

    waitForClaimsUpdate: async (expectedAcademiaId, maxAttempts = 10, delayMs = 1000) => {
      // Implementação simplificada usando refresh
      let attempts = 0;
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        await authFacade.refreshClaimsAndProfile();

        const claims = authFacade.customClaims;
        if (claims && claims.academiaId === expectedAcademiaId) {
          return { success: true, claims };
        }
        attempts++;
      }
      return { success: false, error: new Error('Timeout esperando validação de claims') };
    },

    // Helpers
    loadCustomClaims: authFacade.loadCustomClaims,
    fetchAcademiaData: authFacade.fetchAcademiaData,
    fetchUserProfile: authFacade.fetchUserProfile,

    // Métodos extras do Facade
    sendPasswordResetEmail: authFacade.sendPasswordResetEmail,
    needsProfileCreation: authFacade.needsProfileCreation,
    isProfileIncomplete: authFacade.isProfileIncomplete,
    startProfileCreation: authFacade.startProfileCreation
  };
};