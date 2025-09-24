import { GetStudentsUseCase } from '../GetStudents';
import { StudentsRepository } from '../../repositories';
import { Student } from '../../entities';

// Mock repository
const mockStudentsRepository: jest.Mocked<StudentsRepository> = {
  create: jest.fn(),
  getById: jest.fn(),
  getAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByEmail: jest.fn(),
  getByModality: jest.fn(),
  getByClass: jest.fn(),
  getByInstructor: jest.fn(),
  getActiveStudents: jest.fn(),
  getInactiveStudents: jest.fn(),
  getByPaymentStatus: jest.fn(),
  getByGraduation: jest.fn(),
  search: jest.fn(),
  searchByName: jest.fn(),
  getStats: jest.fn(),
  getAcademyStats: jest.fn(),
  subscribeToStudent: jest.fn(),
  subscribeToStudents: jest.fn(),
  subscribeToStudentsByClass: jest.fn(),
};

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@test.com',
    academiaId: 'academia123',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@test.com',
    academiaId: 'academia123',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('GetStudentsUseCase', () => {
  let useCase: GetStudentsUseCase;

  beforeEach(() => {
    useCase = new GetStudentsUseCase(mockStudentsRepository);
    jest.clearAllMocks();
  });

  it('should get all students when no filters provided', async () => {
    mockStudentsRepository.getAll.mockResolvedValue(mockStudents);

    const result = await useCase.execute({
      academiaId: 'academia123'
    });

    expect(result).toEqual(mockStudents);
    expect(mockStudentsRepository.getAll).toHaveBeenCalledWith('academia123');
  });

  it('should search students when search filter provided', async () => {
    const searchResults = [mockStudents[0]];
    mockStudentsRepository.search.mockResolvedValue(searchResults);

    const result = await useCase.execute({
      academiaId: 'academia123',
      filters: { search: 'João' }
    });

    expect(result).toEqual(searchResults);
    expect(mockStudentsRepository.search).toHaveBeenCalledWith('academia123', 'João');
  });

  it('should get students by modality when modality filter provided', async () => {
    mockStudentsRepository.getByModality.mockResolvedValue([mockStudents[0]]);

    const result = await useCase.execute({
      academiaId: 'academia123',
      filters: { modalityId: 'bjj' }
    });

    expect(result).toEqual([mockStudents[0]]);
    expect(mockStudentsRepository.getByModality).toHaveBeenCalledWith('academia123', 'bjj');
  });

  it('should get active students when active filter is true', async () => {
    mockStudentsRepository.getActiveStudents.mockResolvedValue([mockStudents[0]]);

    const result = await useCase.execute({
      academiaId: 'academia123',
      filters: { active: true }
    });

    expect(result).toEqual([mockStudents[0]]);
    expect(mockStudentsRepository.getActiveStudents).toHaveBeenCalledWith('academia123');
  });

  it('should get inactive students when active filter is false', async () => {
    mockStudentsRepository.getInactiveStudents.mockResolvedValue([mockStudents[1]]);

    const result = await useCase.execute({
      academiaId: 'academia123',
      filters: { active: false }
    });

    expect(result).toEqual([mockStudents[1]]);
    expect(mockStudentsRepository.getInactiveStudents).toHaveBeenCalledWith('academia123');
  });

  it('should throw error for invalid academiaId', async () => {
    await expect(
      useCase.execute({ academiaId: '' })
    ).rejects.toThrow('Academia ID é obrigatório');
  });

  it('should handle repository errors', async () => {
    mockStudentsRepository.getAll.mockRejectedValue(new Error('Database error'));

    await expect(
      useCase.execute({ academiaId: 'academia123' })
    ).rejects.toThrow('Failed to get students: Database error');
  });
});
