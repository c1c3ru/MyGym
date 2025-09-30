// Tests for SignInWithEmail use case

import { SignInWithEmailUseCase } from '../SignInWithEmail';
import { createMockAuthRepository, mockUser, mockUserProfile, mockClaims, mockAcademia } from './mocks';
import { ValidationError, InvalidCredentialsError } from '../../errors';

describe('SignInWithEmailUseCase', () => {
  let useCase: SignInWithEmailUseCase;
  let mockRepository: jest.Mocked<any>;

  beforeEach(() => {
    mockRepository = createMockAuthRepository();
    useCase = new SignInWithEmailUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should successfully sign in with valid credentials', async () => {
      // Arrange
      const input = { email: 'test@example.com', password: 'password123' };
      mockRepository.signInWithEmail.mockResolvedValue(mockUser);
      mockRepository.getUserProfile.mockResolvedValue(mockUserProfile);
      mockRepository.getUserClaims.mockResolvedValue(mockClaims);
      mockRepository.getAcademia.mockResolvedValue(mockAcademia);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        user: mockUser,
        userProfile: mockUserProfile,
        claims: mockClaims,
        academia: mockAcademia
      });
      expect(mockRepository.signInWithEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle user without academia', async () => {
      // Arrange
      const input = { email: 'test@example.com', password: 'password123' };
      const profileWithoutAcademia = { ...mockUserProfile, academiaId: undefined };
      
      mockRepository.signInWithEmail.mockResolvedValue(mockUser);
      mockRepository.getUserProfile.mockResolvedValue(profileWithoutAcademia);
      mockRepository.getUserClaims.mockResolvedValue(mockClaims);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.academia).toBeUndefined();
      expect(mockRepository.getAcademia).not.toHaveBeenCalled();
    });

    it('should create default claims when getUserClaims returns null', async () => {
      // Arrange
      const input = { email: 'test@example.com', password: 'password123' };
      mockRepository.signInWithEmail.mockResolvedValue(mockUser);
      mockRepository.getUserProfile.mockResolvedValue(mockUserProfile);
      mockRepository.getUserClaims.mockResolvedValue(null);
      mockRepository.getAcademia.mockResolvedValue(mockAcademia);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.claims).toEqual({
        role: mockUserProfile.userType,
        academiaId: mockUserProfile.academiaId
      });
    });

    it('should throw ValidationError for invalid email', async () => {
      // Arrange
      const input = { email: 'invalid-email', password: 'password123' };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockRepository.signInWithEmail).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for short password', async () => {
      // Arrange
      const input = { email: 'test@example.com', password: '123' };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockRepository.signInWithEmail).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for empty email', async () => {
      // Arrange
      const input = { email: '', password: 'password123' };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockRepository.signInWithEmail).not.toHaveBeenCalled();
    });

    it('should map Firebase errors to domain errors', async () => {
      // Arrange
      const input = { email: 'test@example.com', password: 'password123' };
      const firebaseError = { code: 'auth/invalid-credential', message: 'Invalid credentials' };
      mockRepository.signInWithEmail.mockRejectedValue(firebaseError);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw error when user profile not found', async () => {
      // Arrange
      const input = { email: 'test@example.com', password: 'password123' };
      mockRepository.signInWithEmail.mockResolvedValue(mockUser);
      mockRepository.getUserProfile.mockResolvedValue(null);

      // Act & Assert
      // O erro é convertido para UnauthorizedError pelo error mapper
      await expect(useCase.execute(input)).rejects.toThrow();
    });
  });
});