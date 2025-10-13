import { useCallback } from 'react';
import { useAuthUI } from './useAuthUI';
import { 
  SignInWithEmailUseCase,
  SignUpWithEmailUseCase,
  SignOutUseCase,
  GetUserSessionUseCase,
  RefreshUserTokenUseCase
} from '@domain/auth/usecases';
import { FirebaseAuthRepository } from '@data/auth/FirebaseAuthRepository';
import { auth, db } from '@services/firebase';
import { getString } from '@utils/theme';

/**
 * useAuthActions - Presentation Layer
 * Hook que integra Use Cases de autenticação com a UI
 * Separação clara entre lógica de negócio (Use Cases) e estado de UI
 */
export const useAuthActions = () => {
  const authUI = useAuthUI();

  // Dependências (Clean Architecture)
  const authRepository = new FirebaseAuthRepository(auth, db);

  // Use Cases
  const signInUseCase = new SignInWithEmailUseCase(authRepository);
  const signUpUseCase = new SignUpWithEmailUseCase(authRepository);
  const signOutUseCase = new SignOutUseCase(authRepository);
  const getUserSessionUseCase = new GetUserSessionUseCase(authRepository);
  const refreshTokenUseCase = new RefreshUserTokenUseCase(authRepository);

  // Login com email e senha
  const signInWithEmailAndPassword = useCallback(async (email, password) => {
    try {
      authUI.setSigningIn(true);
      authUI.clearFormErrors();
      authUI.setLastEmail(email);

      const result = await signInUseCase.executeWithEmailAndPassword(email, password);

      if (result.isSuccess()) {
        authUI.showSuccessToast(getString('loginSuccess'));
        return result;
      } else {
        const errorMessage = result.error?.message || 'Erro ao fazer login';
        authUI.setFormErrors({ general: errorMessage });
        authUI.showErrorToast(errorMessage);
        return result;
      }
    } catch (error) {
      console.error('❌ useAuthActions.signInWithEmailAndPassword:', error);
      const errorMessage = error.message || 'Erro inesperado ao fazer login';
      authUI.setFormErrors({ general: errorMessage });
      authUI.showErrorToast(errorMessage);
      throw error;
    } finally {
      authUI.setSigningIn(false);
    }
  }, [signInUseCase, authUI]);

  // Login com Google
  const signInWithGoogle = useCallback(async () => {
    try {
      authUI.setSigningIn(true);
      authUI.clearFormErrors();

      const result = await signInUseCase.executeWithGoogle();

      if (result.isSuccess()) {
        authUI.showSuccessToast('Login com Google realizado com sucesso!');
        return result;
      } else {
        const errorMessage = result.error?.message || 'Erro ao fazer login com Google';
        authUI.showErrorToast(errorMessage);
        return result;
      }
    } catch (error) {
      console.error('❌ useAuthActions.signInWithGoogle:', error);
      const errorMessage = error.message || 'Erro inesperado ao fazer login com Google';
      authUI.showErrorToast(errorMessage);
      throw error;
    } finally {
      authUI.setSigningIn(false);
    }
  }, [signInUseCase, authUI]);

  // Login com Facebook
  const signInWithFacebook = useCallback(async () => {
    try {
      authUI.setSigningIn(true);
      authUI.clearFormErrors();

      const result = await signInUseCase.executeWithFacebook();

      if (result.isSuccess()) {
        authUI.showSuccessToast('Login com Facebook realizado com sucesso!');
        return result;
      } else {
        const errorMessage = result.error?.message || 'Erro ao fazer login com Facebook';
        authUI.showErrorToast(errorMessage);
        return result;
      }
    } catch (error) {
      console.error('❌ useAuthActions.signInWithFacebook:', error);
      const errorMessage = error.message || 'Erro inesperado ao fazer login com Facebook';
      authUI.showErrorToast(errorMessage);
      throw error;
    } finally {
      authUI.setSigningIn(false);
    }
  }, [signInUseCase, authUI]);

  // Login com Microsoft
  const signInWithMicrosoft = useCallback(async () => {
    try {
      authUI.setSigningIn(true);
      authUI.clearFormErrors();

      const result = await signInUseCase.executeWithMicrosoft();

      if (result.isSuccess()) {
        authUI.showSuccessToast('Login com Microsoft realizado com sucesso!');
        return result;
      } else {
        const errorMessage = result.error?.message || 'Erro ao fazer login com Microsoft';
        authUI.showErrorToast(errorMessage);
        return result;
      }
    } catch (error) {
      console.error('❌ useAuthActions.signInWithMicrosoft:', error);
      const errorMessage = error.message || 'Erro inesperado ao fazer login com Microsoft';
      authUI.showErrorToast(errorMessage);
      throw error;
    } finally {
      authUI.setSigningIn(false);
    }
  }, [signInUseCase, authUI]);

  // Login com Apple
  const signInWithApple = useCallback(async () => {
    try {
      authUI.setSigningIn(true);
      authUI.clearFormErrors();

      const result = await signInUseCase.executeWithApple();

      if (result.isSuccess()) {
        authUI.showSuccessToast('Login com Apple realizado com sucesso!');
        return result;
      } else {
        const errorMessage = result.error?.message || 'Erro ao fazer login com Apple';
        authUI.showErrorToast(errorMessage);
        return result;
      }
    } catch (error) {
      console.error('❌ useAuthActions.signInWithApple:', error);
      const errorMessage = error.message || 'Erro inesperado ao fazer login com Apple';
      authUI.showErrorToast(errorMessage);
      throw error;
    } finally {
      authUI.setSigningIn(false);
    }
  }, [signInUseCase, authUI]);

  // Cadastro
  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      authUI.setSigningUp(true);
      authUI.clearFormErrors();

      const result = await signUpUseCase.execute(email, password, userData);

      if (result.isSuccess()) {
        authUI.showSuccessToast('Conta criada com sucesso!');
        return result;
      } else {
        const errorMessage = result.error?.message || 'Erro ao criar conta';
        authUI.setFormErrors({ general: errorMessage });
        authUI.showErrorToast(errorMessage);
        return result;
      }
    } catch (error) {
      console.error('❌ useAuthActions.signUp:', error);
      const errorMessage = error.message || 'Erro inesperado ao criar conta';
      authUI.setFormErrors({ general: errorMessage });
      authUI.showErrorToast(errorMessage);
      throw error;
    } finally {
      authUI.setSigningUp(false);
    }
  }, [signUpUseCase, authUI]);

  // Logout
  const signOut = useCallback(async () => {
    try {
      authUI.setSigningOut(true);

      await signOutUseCase.execute();

      authUI.showSuccessToast('Logout realizado com sucesso!');
      authUI.resetUIState();
    } catch (error) {
      console.error('❌ useAuthActions.signOut:', error);
      const errorMessage = error.message || 'Erro ao fazer logout';
      authUI.showErrorToast(errorMessage);
      throw error;
    } finally {
      authUI.setSigningOut(false);
    }
  }, [signOutUseCase, authUI]);

  // Obter sessão do usuário (nova arquitetura)
  const getUserSession = useCallback(async (user) => {
    try {
      authUI.setLoading(true);

      const session = await getUserSessionUseCase.execute(user);
      return session;
    } catch (error) {
      console.error('❌ useAuthActions.getUserSession:', error);
      throw error;
    } finally {
      authUI.setLoading(false);
    }
  }, [getUserSessionUseCase, authUI]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      return await refreshTokenUseCase.execute();
    } catch (error) {
      console.error('❌ useAuthActions.refreshToken:', error);
      throw error;
    }
  }, [refreshTokenUseCase]);

  // Aguardar atualização de claims
  const waitForClaimsUpdate = useCallback(async (expectedAcademiaId, maxAttempts = 10, delayMs = 1000) => {
    try {
      authUI.setLoading(true);
      return await refreshTokenUseCase.waitForClaimsUpdate(expectedAcademiaId, maxAttempts, delayMs);
    } catch (error) {
      console.error('❌ useAuthActions.waitForClaimsUpdate:', error);
      throw error;
    } finally {
      authUI.setLoading(false);
    }
  }, [refreshTokenUseCase, authUI]);

  return {
    // Actions
    signInWithEmailAndPassword,
    signInWithGoogle,
    signInWithFacebook,
    signInWithMicrosoft,
    signInWithApple,
    signUp,
    signOut,
    getUserSession, // Nova arquitetura
    refreshToken,
    waitForClaimsUpdate,

    // UI State (re-exportado para conveniência)
    ...authUI
  };
};