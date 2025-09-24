// Domain entities for students

export interface Student {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly dateOfBirth?: Date;
  readonly gender?: 'male' | 'female' | 'other';
  readonly address?: Address;
  readonly emergencyContact?: EmergencyContact;
  readonly academiaId: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface StudentProfile extends Student {
  readonly currentGraduation: string;
  readonly graduations: Graduation[];
  readonly modalities: string[];
  readonly classIds: string[];
  readonly planId?: string;
  readonly paymentStatus: PaymentStatus;
  readonly medicalRestrictions?: string[];
  readonly notes?: string;
}

export interface Address {
  readonly street: string;
  readonly number: string;
  readonly complement?: string;
  readonly neighborhood: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
}

export interface EmergencyContact {
  readonly name: string;
  readonly phone: string;
  readonly relationship: string;
}

export interface Graduation {
  readonly id: string;
  readonly level: string;
  readonly modality: string;
  readonly date: Date;
  readonly instructorId: string;
  readonly certificateUrl?: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export interface StudentStats {
  readonly totalClasses: number;
  readonly attendanceRate: number;
  readonly lastCheckIn?: Date;
  readonly monthlyPaymentStatus: PaymentStatus;
  readonly graduationProgress: number;
}

export interface CreateStudentData {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly dateOfBirth?: Date;
  readonly gender?: 'male' | 'female' | 'other';
  readonly address?: Address;
  readonly emergencyContact?: EmergencyContact;
  readonly modalities: string[];
  readonly planId?: string;
}

export interface UpdateStudentData {
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly dateOfBirth?: Date;
  readonly gender?: 'male' | 'female' | 'other';
  readonly address?: Address;
  readonly emergencyContact?: EmergencyContact;
  readonly modalities?: string[];
  readonly planId?: string;
  readonly isActive?: boolean;
  readonly medicalRestrictions?: string[];
  readonly notes?: string;
}
