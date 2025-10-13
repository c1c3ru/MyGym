import { useAuthClean } from './useAuthClean';

/**
 * useAuthMigrationV2 - Compatibility Layer
 * 
 * Hook de compatibilidade que mantém a interface do useAuthMigration original
 * mas usa a nova Clean Architecture por baixo.
 * 
 * Este hook permite migração gradual sem quebrar o código existente.
 */
export const useAuthMigrationV2 = () => {
  const authClean = useAuthClean();

  // Mapear interface antiga para nova implementação
  return {
    // Estado (mantém compatibilidade)
    user: authClean.user,
    userProfile: authClean.userProfile,
    gym: authClean.gym,
    customClaims: authClean.customClaims,
    loading: authClean.loading,
    isAuthenticated: authClean.isAuthenticated,
    getUserType: authClean.getUserType,
    isComplete: authClean.isComplete,
    hasValidClaims: authClean.hasValidClaims,

    // Actions principais (interface adaptada para compatibilidade)
    signInWithGoogle: authClean.signInWithGoogle,
    signInWithFacebook: authClean.signInWithFacebook,
    signInWithMicrosoft: authClean.signInWithMicrosoft,
    signInWithApple: authClean.signInWithApple,

    // Helpers para compatibilidade (interface antiga)
    loadCustomClaims: authClean.loadCustomClaims,
    fetchAcademiaData: authClean.fetchAcademiaData,
    fetchUserProfile: authClean.fetchUserProfile,
    refreshUserToken: authClean.refreshUserToken,
    waitForClaimsUpdate: authClean.waitForClaimsUpdate,

    // Métodos com interface original do useAuthMigration (compatibilidade total)
    signInWithEmailAndPassword: async (email, password) => {
      const result = await authClean.signInWithEmailAndPassword(email, password);
      if (result.success) {
        return result.result?.user;
      }
      throw new Error(result.error?.message || 'Erro no login');
    },

    createUserWithEmailAndPassword: async (email, password, userData = {}) => {
      const result = await authClean.signUpWithEmailAndPassword(email, password, userData);
      if (result.success) {
        return result.result?.user;
      }
      throw new Error(result.error?.message || 'Erro no cadastro');
    },

    // Métodos de compatibilidade com o hook original
    signIn: async (email, password) => {
      const result = await authClean.signInWithEmailAndPassword(email, password);
      if (result.success) {
        return result.result?.user;
      }
      throw new Error(result.error?.message || 'Erro no login');
    },

    signUp: async (email, password, userData = {}) => {
      const result = await authClean.signUpWithEmailAndPassword(email, password, userData);
      if (result.success) {
        return result.result?.user;
      }
      throw new Error(result.error?.message || 'Erro no cadastro');
    },

    // Usar método de logout com interface original
    signOut: async () => {
      const result = await authClean.signOut();
      if (!result?.success) {
        throw new Error(result?.error?.message || 'Erro no logout');
      }
      return result;
    },
    logout: async () => {
      const result = await authClean.signOut();
      if (!result?.success) {
        throw new Error(result?.error?.message || 'Erro no logout');
      }
      return result;
    },

    logoutUser: async () => {
      const result = await authClean.signOut();
      if (!result?.success) {
        throw new Error(result?.error?.message || 'Erro no logout');
      }
      return result;
    },

    // Atualização de perfil e associação de academia
    updateUserProfile: authClean.updateUserProfile,
    updateAcademiaAssociation: async (academiaId, academiaData) => {
      const updates = { academiaId, updatedAt: new Date() };
      return await authClean.updateUserProfile(updates);
    },

    // Refresh de claims e perfil
    refreshClaimsAndProfile: async () => {
      return await authClean.refreshUserToken();
    }
  };
};

// Exportar como default para compatibilidade
export default useAuthMigrationV2;