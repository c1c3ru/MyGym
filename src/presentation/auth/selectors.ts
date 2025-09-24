// Selectors for auth presentation layer

import { AuthSession, User, UserProfile, Claims, Academia, UserType } from '../../domain/auth/entities';

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  academia: Academia | null;
  customClaims: Claims | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export class AuthSelectors {
  static getUser(state: AuthState): User | null {
    return state.user;
  }

  static getUserProfile(state: AuthState): UserProfile | null {
    return state.userProfile;
  }

  static getAcademia(state: AuthState): Academia | null {
    return state.academia;
  }

  static getClaims(state: AuthState): Claims | null {
    return state.customClaims;
  }

  static isLoading(state: AuthState): boolean {
    return state.loading;
  }

  static isAuthenticated(state: AuthState): boolean {
    return state.isAuthenticated && !!state.user;
  }

  static getUserType(state: AuthState): UserType {
    if (!state.userProfile) return 'student';
    
    return state.userProfile.userType || 'student';
  }

  static isComplete(state: AuthState): boolean {
    const hasUser = !!state.user;
    const hasProfile = !!state.userProfile;
    const hasAcademiaAssociation = !!state.academia || !!state.customClaims?.academiaId;
    
    return hasUser && hasProfile && hasAcademiaAssociation;
  }

  static hasValidClaims(state: AuthState): boolean {
    return !!(state.customClaims?.role && state.customClaims?.academiaId);
  }

  static needsOnboarding(state: AuthState): boolean {
    return state.isAuthenticated && !!state.user && !state.userProfile?.academiaId;
  }

  static getAuthSession(state: AuthState): AuthSession | null {
    if (!state.user || !state.userProfile || !state.customClaims) {
      return null;
    }

    return {
      user: state.user,
      userProfile: state.userProfile,
      claims: state.customClaims,
      academia: state.academia || undefined
    };
  }

  static getDisplayName(state: AuthState): string {
    return state.userProfile?.name || state.user?.email || 'Usuário';
  }

  static getEmail(state: AuthState): string {
    return state.user?.email || '';
  }

  static getAcademiaId(state: AuthState): string | null {
    return state.userProfile?.academiaId || state.customClaims?.academiaId || null;
  }

  static getAcademiaName(state: AuthState): string {
    return state.academia?.name || 'Academia';
  }
}