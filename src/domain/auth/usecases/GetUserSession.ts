// Get complete user session use case

import { BaseUseCase } from './base';
import { AuthRepository } from '@components/repositories';
import { AuthSession, User } from '@components/entities';
import { mapFirebaseError, UserProfileNotFoundError } from '../errors';

export class GetUserSessionUseCase extends BaseUseCase<User, AuthSession> {
  constructor(private authRepository: AuthRepository) {
    super();
  }

  async execute(user: User): Promise<AuthSession> {
    try {
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