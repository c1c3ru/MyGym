// Sign out use case

import { BaseUseCase } from './base';
import { AuthRepository } from '@/domain/repositories';
import { mapFirebaseError } from '../errors';

export class SignOutUseCase extends BaseUseCase<void, void> {
  constructor(private authRepository: AuthRepository) {
    super();
  }

  async execute(): Promise<void> {
    try {
      await this.authRepository.signOut();
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }
}