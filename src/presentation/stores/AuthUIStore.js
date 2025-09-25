import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * AuthUIStore - Presentation Layer
 * Complete authentication store with UI state and auth data
 * All properties and methods in English for consistency
 */
const useAuthUIStore = create(
  persist(
    (set, get) => ({
      // Authentication state
      user: null,
      userProfile: null,
      gym: null,
      customClaims: null,
      isAuthenticated: false,
      
      // UI state
      isLoading: false,
      isSigningIn: false,
      isSigningUp: false,
      isSigningOut: false,
      showPassword: false,
      showConfirmPassword: false,
      
      // Form state
      formErrors: {},
      fieldErrors: {},
      
      // Modal/screen state
      showForgotPassword: false,
      showUserTypeSelection: false,
      showAcademySelection: false,
      
      // UI preferences
      rememberMe: false,
      biometricEnabled: false,
      
      // Last used email for convenience
      lastEmail: '',

      // Authentication actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setUserProfile: (userProfile) => set({ userProfile }),

      setGym: (gym) => set({ gym }),

      setCustomClaims: (customClaims) => set({ customClaims }),

      login: (user, userProfile = null) => set({
        user,
        userProfile,
        isAuthenticated: true,
        isLoading: false
      }),

      logout: () => set({
        user: null,
        userProfile: null,
        gym: null,
        customClaims: null,
        isAuthenticated: false,
        isLoading: false
      }),

      updateProfile: (updates) => set((state) => ({
        userProfile: state.userProfile ? { ...state.userProfile, ...updates } : updates
      })),

      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      
      setSigningIn: (isSigningIn) => set({ isSigningIn }),
      
      setSigningUp: (isSigningUp) => set({ isSigningUp }),
      
      setSigningOut: (isSigningOut) => set({ isSigningOut }),
      
      togglePasswordVisibility: () => set((state) => ({ 
        showPassword: !state.showPassword 
      })),
      
      toggleConfirmPasswordVisibility: () => set((state) => ({ 
        showConfirmPassword: !state.showConfirmPassword 
      })),
      
      setFormErrors: (formErrors) => set({ formErrors }),
      
      clearFormErrors: () => set({ formErrors: {}, fieldErrors: {} }),
      
      setFieldError: (field, error) => set((state) => ({
        fieldErrors: { ...state.fieldErrors, [field]: error }
      })),
      
      clearFieldError: (field) => set((state) => {
        const newFieldErrors = { ...state.fieldErrors };
        delete newFieldErrors[field];
        return { fieldErrors: newFieldErrors };
      }),
      
      setShowForgotPassword: (show) => set({ showForgotPassword: show }),
      
      setShowUserTypeSelection: (show) => set({ showUserTypeSelection: show }),
      
      setShowAcademySelection: (show) => set({ showAcademySelection: show }),
      
      setRememberMe: (remember) => set({ rememberMe: remember }),
      
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      
      setLastEmail: (email) => set({ lastEmail: email }),
      
      // Complete UI state reset
      resetUIState: () => set({
        isLoading: false,
        isSigningIn: false,
        isSigningUp: false,
        isSigningOut: false,
        showPassword: false,
        showConfirmPassword: false,
        formErrors: {},
        fieldErrors: {},
        showForgotPassword: false,
        showUserTypeSelection: false,
        showAcademySelection: false
      }),

      // Complete state reset
      reset: () => set({
        user: null,
        userProfile: null,
        gym: null,
        customClaims: null,
        isAuthenticated: false,
        isLoading: false,
        isSigningIn: false,
        isSigningUp: false,
        isSigningOut: false,
        showPassword: false,
        showConfirmPassword: false,
        formErrors: {},
        fieldErrors: {},
        showForgotPassword: false,
        showUserTypeSelection: false,
        showAcademySelection: false
      }),

      // Computed getters
      hasErrors: () => {
        const { formErrors, fieldErrors } = get();
        return Object.keys(formErrors).length > 0 || Object.keys(fieldErrors).length > 0;
      },
      
      isAnyActionInProgress: () => {
        const { isLoading, isSigningIn, isSigningUp, isSigningOut } = get();
        return isLoading || isSigningIn || isSigningUp || isSigningOut;
      },
      
      getFieldError: (field) => {
        const { fieldErrors } = get();
        return fieldErrors[field] || null;
      },

      // Compatibility getters for existing hooks
      getUserType: () => {
        const { userProfile, customClaims } = get();
        return customClaims?.role || userProfile?.userType || userProfile?.tipo || null;
      },

      isComplete: () => {
        const { userProfile } = get();
        return !!(userProfile?.name && userProfile?.email);
      },

      hasValidClaims: () => {
        const { customClaims } = get();
        return !!(customClaims?.role && customClaims?.academiaId);
      }
    }),
    {
      name: 'auth-ui-storage',
      storage: createJSONStorage(() => 
        Platform.OS === 'web' ? localStorage : AsyncStorage
      ),
      partialize: (state) => ({
        user: state.user,
        userProfile: state.userProfile,
        gym: state.gym,
        customClaims: state.customClaims,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
        biometricEnabled: state.biometricEnabled,
        lastEmail: state.lastEmail,
        profileCompleted: state.userProfile?.profileCompleted
      })
    }
  )
);

export default useAuthUIStore;