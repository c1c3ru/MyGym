// Sign in with email use case

import { BaseUseCase } from './base';
import { AuthRepository } from '../repositories';
import { AuthSession } from '../entities';
import { mapFirebaseError, UserProfileNotFoundError } from '../errors';
import { signInSchema, SignInInput } from './schemas';

export class SignInWithEmailUseCase extends BaseUseCase<SignInInput, AuthSession> {
  constructor(private authRepository: AuthRepository) {
    super();
  }

  async execute(input: SignInInput): Promise<AuthSession> {
    // Validate input first (don't catch validation errors)
    const validatedInput = this.validateInput(input, signInSchema);
    
    try {
      // Sign in user
      const user = await this.authRepository.signInWithEmail({
        email: validatedInput.email,
        password: validatedInput.password
      });

      // Get user profile
      const userProfile = await this.authRepository.getUserProfile(user.id);
      if (!userProfile) {
        throw new UserProfileNotFoundError();
      }

      // Get user claims
      const claims = await this.authRepository.getUserClaims(user) || {
        role: userProfile.userType,
        academiaId: userProfile.academiaId
      };

      // Get academia if user has one
      let academia = undefined;
      if (userProfile.academiaId) {
        academia = await this.authRepository.getAcademia(userProfile.academiaId) || undefined;
      }

      return {
        user,
        userProfile,
        claims,
        academia
      };
    } catch (error: any) {
      // Don't map UserProfileNotFoundError - let it pass through
      if (error instanceof UserProfileNotFoundError) {
        throw error;
      }
      throw mapFirebaseError(error);
    }
  }
}