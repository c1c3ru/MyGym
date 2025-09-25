// Refresh user token use case

import { BaseUseCase } from './base';
import { AuthRepository } from '@/domain/repositories';
import { User, Claims } from '@/domain/entities';
import { mapFirebaseError } from '@components/errors';

export class RefreshUserTokenUseCase extends BaseUseCase<User, Claims> {
  constructor(private authRepository: AuthRepository) {
    super();
  }

  async execute(user: User): Promise<Claims> {
    try {
      await this.authRepository.refreshUserToken(user);
      
      const claims = await this.authRepository.getUserClaims(user);
      if (!claims) {
        throw new Error('Failed to refresh user claims');
      }
      
      return claims;
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }
}