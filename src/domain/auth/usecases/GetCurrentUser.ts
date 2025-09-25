// Get current user use case

import { BaseUseCase } from './base';
import { AuthRepository } from '@components/repositories';
import { User } from '@components/entities';
import { mapFirebaseError } from '../errors';

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