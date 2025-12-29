import { GetStudentsUseCase, GetStudentsInput } from '../GetStudents';
import { StudentsRepository } from '@domain/repositories';
import { Student } from '@domain/students/entities';

// Mock do repositório
const mockStudentsRepository: jest.Mocked<StudentsRepository> = {
  getAll: jest.fn(),
  getById: jest.fn(),
  getActiveStudents: jest.fn(),
  getInactiveStudents: jest.fn(),
  getByModality: jest.fn(),
  getByClass: jest.fn(),
  getByInstructor: jest.fn(),
  getByPaymentStatus: jest.fn(),
  getByGraduation: jest.fn(),
  search: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('GetStudentsUseCase', () => {
  let useCase: GetStudentsUseCase;
  const mockAcademiaId = 'academia-123';

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetStudentsUseCase(mockStudentsRepository);
  });

  describe('Validação de entrada', () => {
    it('deve lançar erro se academiaId não for fornecido', async () => {
      const input = {} as GetStudentsInput;

      await expect(useCase.execute(input)).rejects.toThrow();
    });

    it('deve lançar erro se academiaId for vazio', async () => {
      const input: GetStudentsInput = {
        academiaId: '',
      };

      await expect(useCase.execute(input)).rejects.toThrow();
    });
  });

  describe('Buscar todos os alunos', () => {
    it('deve retornar todos os alunos quando não há filtros', async () => {
      const mockStudents: Student[] = [
        { id: '1', name: 'Aluno 1', academiaId: mockAcademiaId } as Student,
        { id: '2', name: 'Aluno 2', academiaId: mockAcademiaId } as Student,
      ];

      mockStudentsRepository.getAll.mockResolvedValue(mockStudents);

      const input: GetStudentsInput = {
        academiaId: mockAcademiaId,
      };

      const result = await useCase.execute(input);

      expect(result).toEqual(mockStudents);
      expect(mockStudentsRepository.getAll).toHaveBeenCalledWith(mockAcademiaId);
      expect(mockStudentsRepository.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Buscar alunos ativos', () => {
    it('deve retornar apenas alunos ativos quando filter.active = true', async () => {
      const mockStudents: Student[] = [
        { id: '1', name: 'Aluno Ativo', academiaId: mockAcademiaId, active: true } as Student,
      ];

      mockStudentsRepository.getActiveStudents.mockResolvedValue(mockStudents);

      const input: GetStudentsInput = {
        academiaId: mockAcademiaId,
        filters: {
          active: true,
        },
      };

      const result = await useCase.execute(input);

      expect(result).toEqual(mockStudents);
      expect(mockStudentsRepository.getActiveStudents).toHaveBeenCalledWith(mockAcademiaId);
      expect(mockStudentsRepository.getAll).not.toHaveBeenCalled();
    });
  });

  describe('Buscar alunos inativos', () => {
    it('deve retornar apenas alunos inativos quando filter.active = false', async () => {
      const mockStudents: Student[] = [
        { id: '1', name: 'Aluno Inativo', academiaId: mockAcademiaId, active: false } as Student,
      ];

      mockStudentsRepository.getInactiveStudents.mockResolvedValue(mockStudents);

      const input: GetStudentsInput = {
        academiaId: mockAcademiaId,
        filters: {
          active: false,
        },
      };

      const result = await useCase.execute(input);

      expect(result).toEqual(mockStudents);
      expect(mockStudentsRepository.getInactiveStudents).toHaveBeenCalledWith(mockAcademiaId);
    });
  });

  describe('Buscar por modalidade', () => {
    it('deve retornar alunos filtrados por modalidade', async () => {
      const modalityId = 'modality-123';
      const mockStudents: Student[] = [
        { id: '1', name: 'Aluno 1', academiaId: mockAcademiaId, modalityId } as Student,
      ];

      mockStudentsRepository.getByModality.mockResolvedValue(mockStudents);

      const input: GetStudentsInput = {
        academiaId: mockAcademiaId,
        filters: {
          modalityId,
        },
      };

      const result = await useCase.execute(input);

      expect(result).toEqual(mockStudents);
      expect(mockStudentsRepository.getByModality).toHaveBeenCalledWith(mockAcademiaId, modalityId);
    });
  });

  describe('Buscar por turma', () => {
    it('deve retornar alunos filtrados por turma', async () => {
      const classId = 'class-123';
      const mockStudents: Student[] = [
        { id: '1', name: 'Aluno 1', academiaId: mockAcademiaId, classId } as Student,
      ];

      mockStudentsRepository.getByClass.mockResolvedValue(mockStudents);

      const input: GetStudentsInput = {
        academiaId: mockAcademiaId,
        filters: {
          classId,
        },
      };

      const result = await useCase.execute(input);

      expect(result).toEqual(mockStudents);
      expect(mockStudentsRepository.getByClass).toHaveBeenCalledWith(mockAcademiaId, classId);
    });
  });

  describe('Buscar por instrutor', () => {
    it('deve retornar alunos filtrados por instrutor', async () => {
      const instructorId = 'instructor-123';
      const mockStudents: Student[] = [
        { id: '1', name: 'Aluno 1', academiaId: mockAcademiaId, instructorId } as Student,
      ];

      mockStudentsRepository.getByInstructor.mockResolvedValue(mockStudents);

      const input: GetStudentsInput = {
        academiaId: mockAcademiaId,
        filters: {
          instructorId,
        },
      };

      const result = await useCase.execute(input);

      expect(result).toEqual(mockStudents);
      expect(mockStudentsRepository.getByInstructor).toHaveBeenCalledWith(mockAcademiaId, instructorId);
    });
  });

  describe('Buscar por status de pagamento', () => {
    it('deve retornar alunos filtrados por status de pagamento', async () => {
      const paymentStatus = 'paid';
      const mockStudents: Student[] = [
        { id: '1', name: 'Aluno 1', academiaId: mockAcademiaId } as Student,
      ];

      mockStudentsRepository.getByPaymentStatus.mockResolvedValue(mockStudents);

      const input: GetStudentsInput = {
        academiaId: mockAcademiaId,
        filters: {
          paymentStatus,
        },
      };

      const result = await useCase.execute(input);

      expect(result).toEqual(mockStudents);
      expect(mockStudentsRepository.getByPaymentStatus).toHaveBeenCalledWith(mockAcademiaId, paymentStatus);
    });
  });

  describe('Buscar por graduação', () => {
    it('deve retornar alunos filtrados por graduação', async () => {
      const graduation = 'faixa-preta';
      const mockStudents: Student[] = [
        { id: '1', name: 'Aluno 1', academiaId: mockAcademiaId } as Student,
      ];

      mockStudentsRepository.getByGraduation.mockResolvedValue(mockStudents);

      const input: GetStudentsInput = {
        academiaId: mockAcademiaId,
        filters: {
          graduation,
        },
      };

      const result = await useCase.execute(input);

      expect(result).toEqual(mockStudents);
      expect(mockStudentsRepository.getByGraduation).toHaveBeenCalledWith(mockAcademiaId, graduation);
    });
  });

  describe('Buscar por texto (search)', () => {
    it('deve retornar alunos que correspondem à busca', async () => {
      const searchTerm = 'João';
      const mockStudents: Student[] = [
        { id: '1', name: 'João Silva', academiaId: mockAcademiaId } as Student,
      ];

      mockStudentsRepository.search.mockResolvedValue(mockStudents);

      const input: GetStudentsInput = {
        academiaId: mockAcademiaId,
        filters: {
          search: searchTerm,
        },
      };

      const result = await useCase.execute(input);

      expect(result).toEqual(mockStudents);
      expect(mockStudentsRepository.search).toHaveBeenCalledWith(mockAcademiaId, searchTerm);
    });
  });

  describe('Tratamento de erros', () => {
    it('deve lançar erro quando o repositório falha', async () => {
      const error = new Error('Database error');
      mockStudentsRepository.getAll.mockRejectedValue(error);

      const input: GetStudentsInput = {
        academiaId: mockAcademiaId,
      };

      await expect(useCase.execute(input)).rejects.toThrow('Failed to get students');
    });
  });
});
