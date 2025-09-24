// Domain entities for authentication

export interface User {
  readonly id: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly createdAt: Date;
  readonly lastSignInAt?: Date;
}

export interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly userType: UserType;
  readonly academiaId?: string;
  readonly isActive: boolean;
  readonly currentGraduation?: string;
  readonly graduations: string[];
  readonly classIds: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface Claims {
  readonly role: string;
  readonly academiaId?: string;
  readonly permissions?: string[];
}

export type UserType = 'student' | 'instructor' | 'admin';

export interface AuthSession {
  readonly user: User;
  readonly userProfile: UserProfile;
  readonly claims: Claims;
  readonly academia?: Academia;
}

export interface Academia {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly settings?: Record<string, any>;
}

export interface SignInCredentials {
  readonly email: string;
  readonly password: string;
}

export interface SignUpData {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly phone?: string;
  readonly userType: UserType;
}