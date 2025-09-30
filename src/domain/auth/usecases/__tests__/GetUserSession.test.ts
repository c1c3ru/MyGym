// Tests for GetUserSession use case

import { GetUserSessionUseCase } from '../GetUserSession';
import { createMockAuthRepository, mockUser, mockUserProfile, mockClaims, mockAcademia } from './mocks';
import { UserProfileNotFoundError } from '../../errors';

describe('GetUserSessionUseCase', () => {
  let useCase: GetUserSessionUseCase;
  let mockRepository: jest.Mocked<any>;

  beforeEach(() => {
    mockRepository = createMockAuthRepository();
    useCase = new GetUserSessionUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should successfully get user session with academia', async () => {
      // Arrange
      mockRepository.getUserProfile.mockResolvedValue(mockUserProfile);
      mockRepository.getUserClaims.mockResolvedValue(mockClaims);
      mockRepository.getAcademia.mockResolvedValue(mockAcademia);

      // Act
      const result = await useCase.execute(mockUser);

      // Assert
      expect(result).toEqual({
        user: mockUser,
        userProfile: mockUserProfile,
        claims: mockClaims,
        academia: mockAcademia
      });
      
      expect(mockRepository.getUserProfile).toHaveBeenCalledWith(mockUser.id);
      expect(mockRepository.getUserClaims).toHaveBeenCalledWith(mockUser);
      expect(mockRepository.getAcademia).toHaveBeenCalledWith(mockUserProfile.academiaId);
    });

    it('should handle user without academia', async () => {
      // Arrange
      const profileWithoutAcademia = { ...mockUserProfile, academiaId: undefined };
      mockRepository.getUserProfile.mockResolvedValue(profileWithoutAcademia);
      mockRepository.getUserClaims.mockResolvedValue(mockClaims);

      // Act
      const result = await useCase.execute(mockUser);

      // Assert
      expect(result.academia).toBeUndefined();
      expect(mockRepository.getAcademia).not.toHaveBeenCalled();
    });

    it('should create default claims when getUserClaims returns null', async () => {
      // Arrange
      mockRepository.getUserProfile.mockResolvedValue(mockUserProfile);
      mockRepository.getUserClaims.mockResolvedValue(null);
      mockRepository.getAcademia.mockResolvedValue(mockAcademia);

      // Act
      const result = await useCase.execute(mockUser);

      // Assert
      expect(result.claims).toEqual({
        role: mockUserProfile.userType,
        academiaId: mockUserProfile.academiaId
      });
    });

    it('should handle academia not found', async () => {
      // Arrange
      mockRepository.getUserProfile.mockResolvedValue(mockUserProfile);
      mockRepository.getUserClaims.mockResolvedValue(mockClaims);
      mockRepository.getAcademia.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(mockUser);

      // Assert
      expect(result.academia).toBeUndefined();
    });

    it('should throw UserProfileNotFoundError when profile not found', async () => {
      // Arrange
      mockRepository.getUserProfile.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(mockUser)).rejects.toThrow(UserProfileNotFoundError);
      expect(mockRepository.getUserClaims).not.toHaveBeenCalled();
      expect(mockRepository.getAcademia).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockRepository.getUserProfile.mockRejectedValue(repositoryError);

      // Act & Assert
      // O erro genérico é convertido para UnauthorizedError pelo error mapper
      await expect(useCase.execute(mockUser)).rejects.toThrow();
    });
  });
});