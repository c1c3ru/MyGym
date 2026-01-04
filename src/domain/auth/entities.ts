// Domain entities for authentication

export interface User {
  readonly id: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly displayName?: string;
  readonly photoURL?: string;
  readonly phoneNumber?: string;
  readonly providerId?: string;
  readonly isAnonymous?: boolean;
  readonly metadata?: {
    readonly creationTime?: string;
    readonly lastSignInTime?: string;
  };
  readonly providerData?: ReadonlyArray<{
    readonly uid: string;
    readonly email?: string;
    readonly displayName?: string;
    readonly photoURL?: string;
    readonly providerId: string;
    readonly phoneNumber?: string;
  }>;
  readonly refreshToken?: string;
  readonly tenantId?: string;
  readonly createdAt: Date;
  readonly lastSignInAt?: Date;
  readonly updatedAt?: Date;
}

export interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly userType: UserType;
  readonly academiaId?: string;
  readonly isActive: boolean;
  readonly profileCompleted: boolean;
  readonly photoURL?: string;
  readonly dateOfBirth?: Date;
  readonly gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  readonly address?: {
    readonly street?: string;
    readonly city?: string;
    readonly state?: string;
    readonly zipCode?: string;
    readonly country?: string;
    readonly estadoNome?: string;
    readonly paisNome?: string;
  };
  readonly emergencyContact?: {
    readonly name: string;
    readonly phone: string;
    readonly relationship: string;
  };
  readonly medicalInfo?: {
    readonly allergies?: string[];
    readonly medications?: string[];
    readonly conditions?: string[];
    readonly notes?: string;
  };
  readonly currentGraduation?: string;
  readonly graduations: string[];
  readonly classIds: string[];
  readonly instructorIds?: string[];
  readonly preferences?: {
    readonly notifications: {
      readonly email: boolean;
      readonly push: boolean;
      readonly sms: boolean;
    };
    readonly language: string;
    readonly timezone: string;
  };
  readonly stats?: {
    readonly totalClasses: number;
    readonly totalHours: number;
    readonly streak: number;
    readonly lastActivity?: Date;
  };
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastLoginAt?: Date;
  readonly notificationSettings?: {
    readonly pushNotifications: boolean;
    readonly emailNotifications: boolean;
    readonly paymentReminders: boolean;
    readonly classReminders: boolean;
    readonly announcementNotifications: boolean;
    readonly evaluationReminders: boolean;
    readonly paymentReminderDays: number;
    readonly classReminderMinutes: number;
    readonly quietHoursEnabled: boolean;
    readonly quietHoursStart: string;
    readonly quietHoursEnd: string;
  };
}

export interface Claims {
  readonly role: string;
  readonly academiaId?: string;
  readonly permissions?: string[];
  readonly customClaims?: Record<string, any>;
  readonly issuedAt?: Date;
  readonly expiresAt?: Date;
  readonly issuer?: string;
  readonly audience?: string;
  readonly subject?: string;
  readonly scopes?: string[];
  readonly metadata?: Record<string, any>;
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
  readonly description?: string;
  readonly logoURL?: string;
  readonly website?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: {
    readonly street: string;
    readonly city: string;
    readonly state: string;
    readonly zipCode: string;
S    readonly country: string;
    readonly estadoNome ?: string;
    readonly paisNome ?: string;
    readonly coordinates ?: {
  readonly latitude: number;
  readonly longitude: number;
};
  };
  readonly socialMedia ?: {
  readonly facebook?: string;
  readonly instagram?: string;
  readonly twitter?: string;
  readonly youtube?: string;
  readonly tiktok?: string;
};
  readonly businessHours ?: {
  readonly [day: string]: {
      readonly open: string;
      readonly close: string;
      readonly closed ?: boolean;
};
  };
  readonly modalities ?: string[];
  readonly instructors ?: string[];
  readonly students ?: string[];
  readonly classes ?: string[];
  readonly subscription ?: {
  readonly plan: string;
  readonly status: 'active' | 'inactive' | 'suspended' | 'trial';
  readonly expiresAt?: Date;
  readonly features: string[];
};
  readonly settings ?: {
  readonly timezone: string;
  readonly language: string;
  readonly currency: string;
  readonly notifications: {
    readonly email: boolean;
    readonly sms: boolean;
    readonly push: boolean;
  };
  readonly features: {
    readonly graduations: boolean;
    readonly payments: boolean;
    readonly reports: boolean;
    readonly calendar: boolean;
    readonly checkin: boolean;
  };
  readonly branding?: {
    readonly primaryColor: string;
    readonly secondaryColor: string;
    readonly logoURL?: string;
  };
};
  readonly stats ?: {
  readonly totalStudents: number;
  readonly totalInstructors: number;
  readonly totalClasses: number;
  readonly activeClasses: number;
};
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly ownerId: string;
}

export interface SignInCredentials {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
  readonly deviceInfo?: {
    readonly deviceId: string;
    readonly deviceName: string;
    readonly platform: string;
    readonly version: string;
  };
}

export interface SignUpData {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly phone?: string;
  readonly userType: UserType;
  readonly academiaId?: string;
  readonly dateOfBirth?: Date;
  readonly gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  readonly acceptTerms: boolean;
  readonly acceptPrivacyPolicy: boolean;
  readonly marketingConsent?: boolean;
  readonly referralCode?: string;
  readonly emergencyContact?: {
    readonly name: string;
    readonly phone: string;
    readonly relationship: string;
  };
  readonly medicalInfo?: {
    readonly allergies?: string[];
    readonly medications?: string[];
    readonly conditions?: string[];
    readonly notes?: string;
  };
}

export interface PasswordResetData {
  readonly email: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
  readonly resetToken: string;
}

export interface UpdateProfileData {
  readonly name?: string;
  readonly phone?: string;
  readonly photoURL?: string;
  readonly dateOfBirth?: Date;
  readonly gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  readonly address?: {
    readonly street?: string;
    readonly city?: string;
    readonly state?: string;
    readonly zipCode?: string;
    readonly country?: string;
  };
  readonly emergencyContact?: {
    readonly name: string;
    readonly phone: string;
    readonly relationship: string;
  };
  readonly medicalInfo?: {
    readonly allergies?: string[];
    readonly medications?: string[];
    readonly conditions?: string[];
    readonly notes?: string;
  };
  readonly preferences?: {
    readonly notifications: {
      readonly email: boolean;
      readonly push: boolean;
      readonly sms: boolean;
    };
    readonly language: string;
    readonly timezone: string;
  };
}

export interface SocialAuthProvider {
  readonly provider: 'google' | 'facebook' | 'apple' | 'microsoft';
  readonly accessToken?: string;
  readonly idToken?: string;
  readonly refreshToken?: string;
  readonly scope?: string[];
}