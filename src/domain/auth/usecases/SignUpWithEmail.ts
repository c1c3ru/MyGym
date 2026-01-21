// Sign up with email use case

import { BaseUseCase } from './base';
import { AuthRepository } from '../repositories';
import { AuthSession } from '../entities';
import { mapFirebaseError } from '../errors';
import { signUpSchema, SignUpInput } from './schemas';

export class SignUpWithEmailUseCase extends BaseUseCase<SignUpInput, AuthSession> {
  constructor(private authRepository: AuthRepository) {
    super();
  }

  async execute(input: SignUpInput): Promise<AuthSession> {
    // Validate input first (don't catch validation errors)
    const validatedInput = this.validateInput(input, signUpSchema);
    
    console.log('🔍 SignUpWithEmail: Dados validados:', {
      email: validatedInput.email,
      name: validatedInput.name,
      phone: validatedInput.phone,
      userType: validatedInput.userType,
      acceptTerms: validatedInput.acceptTerms,
      acceptPrivacyPolicy: validatedInput.acceptPrivacyPolicy
    });
    
    try {
      // Create user account
      console.log('📝 SignUpWithEmail: Criando conta no Firebase Auth...');
      const user = await this.authRepository.signUpWithEmail({
        email: validatedInput.email,
        password: validatedInput.password,
        name: validatedInput.name,
        phone: validatedInput.phone,
        userType: validatedInput.userType,
        acceptTerms: validatedInput.acceptTerms,
        acceptPrivacyPolicy: validatedInput.acceptPrivacyPolicy
      });
      console.log('✅ SignUpWithEmail: Usuário criado no Auth:', user.id);

      // Create user profile
      const userProfile = await this.authRepository.createUserProfile(user.id, {
        id: user.id,
        name: validatedInput.name,
        email: validatedInput.email,
        phone: validatedInput.phone,
        userType: validatedInput.userType,
        isActive: true,
        currentGraduation: validatedInput.userType === 'student' ? 'Iniciante' : undefined,
        graduations: [],
        classIds: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create default claims
      const claims = {
        role: validatedInput.userType,
        academiaId: undefined,
        permissions: []
      };

      return {
        user,
        userProfile,
        claims,
        academia: undefined
      };
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }
}