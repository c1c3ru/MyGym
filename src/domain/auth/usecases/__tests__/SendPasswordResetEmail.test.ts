// Tests for SendPasswordResetEmail use case

import { SendPasswordResetEmailUseCase } from '../SendPasswordResetEmail';
import { createMockAuthRepository } from './mocks';
import { ValidationError, NetworkError } from '../../errors';

describe('SendPasswordResetEmailUseCase', () => {
  let useCase: SendPasswordResetEmailUseCase;
  let mockRepository: jest.Mocked<any>;

  beforeEach(() => {
    mockRepository = createMockAuthRepository();
    useCase = new SendPasswordResetEmailUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should successfully send password reset email', async () => {
      // Arrange
      const input = { email: 'test@example.com' };
      mockRepository.sendPasswordResetEmail.mockResolvedValue(undefined);

      // Act
      await useCase.execute(input);

      // Assert
      expect(mockRepository.sendPasswordResetEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw ValidationError for invalid email', async () => {
      // Arrange
      const input = { email: 'invalid-email' };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockRepository.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for empty email', async () => {
      // Arrange
      const input = { email: '' };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockRepository.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should map Firebase errors to domain errors', async () => {
      // Arrange
      const input = { email: 'test@example.com' };
      const firebaseError = { code: 'auth/network-request-failed', message: 'Network error' };
      mockRepository.sendPasswordResetEmail.mockRejectedValue(firebaseError);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(NetworkError);
    });

    it('should handle unknown errors', async () => {
      // Arrange
      const input = { email: 'test@example.com' };
      const unknownError = new Error('Unknown error');
      mockRepository.sendPasswordResetEmail.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Unknown error');
    });
  });
});