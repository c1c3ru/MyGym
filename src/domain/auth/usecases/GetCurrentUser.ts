// Get current user use case

import { BaseUseCase } from './base';
import { AuthRepository } from '@/domain/repositories';
import { User } from '@/domain/entities';
import { mapFirebaseError } from '@components/errors';

export class GetCurrentUserUseCase extends BaseUseCase<void, User | null> {
  constructor(private authRepository: AuthRepository) {
    super();
  }

  async execute(): Promise<User | null> {
    try {
      return await this.authRepository.getCurrentUser();
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }
}