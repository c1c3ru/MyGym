// Send password reset email use case

import { BaseUseCase } from './base';
import { AuthRepository } from '@domain/repositories';
import { mapFirebaseError } from '@components/errors';
import { emailSchema, EmailInput } from './schemas';

export class SendPasswordResetEmailUseCase extends BaseUseCase<EmailInput, void> {
  constructor(private authRepository: AuthRepository) {
    super();
  }

  async execute(input: EmailInput): Promise<void> {
    // Validate input first (don't catch validation errors)
    const validatedInput = this.validateInput(input, emailSchema);
    
    try {
      await this.authRepository.sendPasswordResetEmail(validatedInput.email);
    } catch (error: any) {
      throw mapFirebaseError(error);
    }
  }
}