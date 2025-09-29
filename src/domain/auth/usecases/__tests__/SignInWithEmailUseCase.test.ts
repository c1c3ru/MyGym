import { SignInWithEmailUseCase } from '../SignInWithEmail';
import { AuthRepository } from '../../repositories';

// Mock repository
const mockAuthRepository: jest.Mocked<AuthRepository> = {
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signOut: jest.fn(),
  getCurrentUser: jest.fn(),
  createUserProfile: jest.fn(),
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  getUserClaims: jest.fn(),
  refreshUserToken: jest.fn(),
  getAcademia: jest.fn(),
  signInWithGoogle: jest.fn(),
  signInWithFacebook: jest.fn(),
  signInWithMicrosoft: jest.fn(),
  signInWithApple: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn(),
};

describe('SignInWithEmailUseCase', () => {
  let useCase: SignInWithEmailUseCase;

  beforeEach(() => {
    useCase = new SignInWithEmailUseCase(mockAuthRepository);
    jest.clearAllMocks();
  });

  it('should sign in successfully with valid credentials', async () => {
    const mockUser = { 
      id: '123', 
      email: 'test@test.com',
      emailVerified: true,
      createdAt: new Date(),
      lastSignInAt: new Date()
    };
    const mockUserProfile = { 
      id: '123', 
      userType: 'admin' as const,
      academiaId: 'academia123',
      name: 'Test User',
      email: 'test@test.com',
      isActive: true,
      graduations: [],
      classIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const mockClaims = { role: 'admin', academiaId: 'academia123' };
    const mockAcademia = { 
      id: 'academia123', 
      name: 'Test Academia',
      isActive: true
    };

    mockAuthRepository.signInWithEmail.mockResolvedValue(mockUser);
    mockAuthRepository.getUserProfile.mockResolvedValue(mockUserProfile);
    mockAuthRepository.getUserClaims.mockResolvedValue(mockClaims);
    mockAuthRepository.getAcademia.mockResolvedValue(mockAcademia);

    const result = await useCase.execute({
      email: 'test@test.com',
      password: 'password123'
    });

    expect(result).toEqual({
      user: mockUser,
      userProfile: mockUserProfile,
      claims: mockClaims,
      academia: mockAcademia
    });
    expect(mockAuthRepository.signInWithEmail).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123'
    });
  });

  it('should throw error for invalid email', async () => {
    await expect(
      useCase.execute({ email: 'invalid-email', password: 'password123' })
    ).rejects.toThrow('Email inválido');
  });

  it('should throw error for short password', async () => {
    await expect(
      useCase.execute({ email: 'test@test.com', password: '123' })
    ).rejects.toThrow('Senha deve ter pelo menos 6 caracteres');
  });
});
