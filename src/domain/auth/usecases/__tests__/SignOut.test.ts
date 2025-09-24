// Tests for SignOut use case

import { SignOutUseCase } from '../SignOut';
import { createMockAuthRepository } from './mocks';
import { NetworkError } from '../../errors';

describe('SignOutUseCase', () => {
  let useCase: SignOutUseCase;
  let mockRepository: jest.Mocked<any>;

  beforeEach(() => {
    mockRepository = createMockAuthRepository();
    useCase = new SignOutUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should successfully sign out', async () => {
      // Arrange
      mockRepository.signOut.mockResolvedValue(undefined);

      // Act
      await useCase.execute();

      // Assert
      expect(mockRepository.signOut).toHaveBeenCalledTimes(1);
    });

    it('should map Firebase errors to domain errors', async () => {
      // Arrange
      const firebaseError = { code: 'auth/network-request-failed', message: 'Network error' };
      mockRepository.signOut.mockRejectedValue(firebaseError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(NetworkError);
    });

    it('should handle unknown errors', async () => {
      // Arrange
      const unknownError = new Error('Unknown error');
      mockRepository.signOut.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Unknown error');
    });
  });
});