// Tests for SignUpWithEmail use case

import { SignUpWithEmailUseCase } from '../SignUpWithEmail';
import { createMockAuthRepository, mockUser, mockUserProfile } from './mocks';
import { ValidationError, EmailAlreadyInUseError } from '../../errors';

describe('SignUpWithEmailUseCase', () => {
  let useCase: SignUpWithEmailUseCase;
  let mockRepository: jest.Mocked<any>;

  beforeEach(() => {
    mockRepository = createMockAuthRepository();
    useCase = new SignUpWithEmailUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should successfully sign up with valid data', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '123456789',
        userType: 'student' as const,
        acceptTerms: true,
        acceptPrivacyPolicy: true
      };
      
      mockRepository.signUpWithEmail.mockResolvedValue(mockUser);
      mockRepository.createUserProfile.mockResolvedValue(mockUserProfile);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        user: mockUser,
        userProfile: mockUserProfile,
        claims: {
          role: 'student',
          academiaId: undefined,
          permissions: []
        },
        academia: undefined
      });
      
      expect(mockRepository.signUpWithEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '123456789',
        userType: 'student'
      });
      
      expect(mockRepository.createUserProfile).toHaveBeenCalledWith(mockUser.id, {
        id: mockUser.id,
        name: 'Test User',
        email: 'test@example.com',
        phone: '123456789',
        userType: 'student',
        isActive: true,
        currentGraduation: 'Iniciante',
        graduations: [],
        classIds: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should handle instructor user type without setting graduation', async () => {
      // Arrange
      const input = {
        email: 'instructor@example.com',
        password: 'password123',
        name: 'Instructor User',
        userType: 'instructor' as const,
        acceptTerms: true,
        acceptPrivacyPolicy: true
      };
      
      const instructorProfile = { ...mockUserProfile, userType: 'instructor', currentGraduation: undefined };
      mockRepository.signUpWithEmail.mockResolvedValue(mockUser);
      mockRepository.createUserProfile.mockResolvedValue(instructorProfile);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockRepository.createUserProfile).toHaveBeenCalledWith(mockUser.id, {
        id: mockUser.id,
        name: 'Instructor User',
        email: 'instructor@example.com',
        phone: undefined,
        userType: 'instructor',
        isActive: true,
        currentGraduation: undefined,
        graduations: [],
        classIds: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });

    it('should throw ValidationError for invalid email', async () => {
      // Arrange
      const input = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
        userType: 'student' as const,
        acceptTerms: true,
        acceptPrivacyPolicy: true
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockRepository.signUpWithEmail).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for short password', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
        userType: 'student' as const,
        acceptTerms: true,
        acceptPrivacyPolicy: true
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockRepository.signUpWithEmail).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for empty name', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: '',
        userType: 'student' as const,
        acceptTerms: true,
        acceptPrivacyPolicy: true
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockRepository.signUpWithEmail).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid user type', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        userType: 'invalid' as any,
        acceptTerms: true,
        acceptPrivacyPolicy: true
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
      expect(mockRepository.signUpWithEmail).not.toHaveBeenCalled();
    });

    it('should map Firebase errors to domain errors', async () => {
      // Arrange
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        userType: 'student' as const,
        acceptTerms: true,
        acceptPrivacyPolicy: true
      };
      
      const firebaseError = { code: 'auth/email-already-in-use', message: 'Email already in use' };
      mockRepository.signUpWithEmail.mockRejectedValue(firebaseError);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(EmailAlreadyInUseError);
    });
  });
});