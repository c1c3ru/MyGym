// Mock Firebase Firestore BEFORE importing the module under test
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: (...args) => mockCollection(...args),
  doc: (...args) => mockDoc(...args),
  addDoc: (...args) => mockAddDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  getDoc: (...args) => mockGetDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  orderBy: (...args) => mockOrderBy(...args),
  initializeFirestore: jest.fn(() => ({})),
}));

// Mock Firebase app/db used inside firestoreService
jest.mock('@infrastructure/services/firebase', () => ({
  db: {},
}));

// Now import the module under test
import { firestoreService, studentService, classService, paymentService } from '../firestoreService';

describe('firestoreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure firestore helpers return reference objects
    mockCollection.mockReturnValue({});
    mockDoc.mockReturnValue({});
  });

  describe('create', () => {
    it('creates a document with timestamp', async () => {
      const mockDocRef = { id: 'test-id' };
      mockAddDoc.mockResolvedValue(mockDocRef);

      const data = { name: 'Test' };
      const result = await firestoreService.create('test-collection', data);

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...data,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        })
      );
      expect(result).toBe('test-id');
    });

    it('throws error when creation fails', async () => {
      const error = new Error('Creation failed');
      mockAddDoc.mockRejectedValue(error);

      await expect(
        firestoreService.create('test-collection', {})
      ).rejects.toThrow('Creation failed');
    });
  });

  describe('getById', () => {
    it('returns document data when document exists', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: 'test-id',
        data: () => ({ name: 'Test' })
      };
      mockGetDoc.mockResolvedValue(mockDocSnap);

      const result = await firestoreService.getById('test-collection', 'test-id');

      expect(result).toEqual({
        id: 'test-id',
        name: 'Test'
      });
    });

    it('returns null when document does not exist', async () => {
      const mockDocSnap = {
        exists: () => false
      };
      mockGetDoc.mockResolvedValue(mockDocSnap);

      const result = await firestoreService.getById('test-collection', 'test-id');

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('returns all documents with default ordering', async () => {
      const mockDocs = [
        { id: 'doc1', data: () => ({ name: 'Doc 1' }) },
        { id: 'doc2', data: () => ({ name: 'Doc 2' }) }
      ];
      const mockQuerySnapshot = { docs: mockDocs };
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await firestoreService.getAll('test-collection');

      expect(mockQuery).toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(result).toEqual([
        { id: 'doc1', name: 'Doc 1' },
        { id: 'doc2', name: 'Doc 2' }
      ]);
    });
  });

  describe('update', () => {
    it('updates document with timestamp', async () => {
      const data = { name: 'Updated' };
      await firestoreService.update('test-collection', 'test-id', data);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...data,
          updatedAt: expect.any(Date)
        })
      );
    });
  });

  describe('delete', () => {
    it('deletes document', async () => {
      await firestoreService.delete('test-collection', 'test-id');

      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.anything());
    });
  });
});

describe('studentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStudentsByClass', () => {
    it('returns students in a specific class', async () => {
      const mockUsers = [
        { id: 'user1', userType: 'student', classIds: ['class1'] },
        { id: 'user2', userType: 'instructor', classIds: ['class1'] },
        { id: 'user3', userType: 'student', classIds: ['class2'] }
      ];

      jest.spyOn(firestoreService, 'getWhere').mockResolvedValue(mockUsers);

      const result = await studentService.getStudentsByClass('class1');

      expect(firestoreService.getWhere).toHaveBeenCalledWith(
        'users',
        'classIds',
        'array-contains',
        'class1'
      );
      expect(result).toEqual(mockUsers);
    });
  });
});

describe('classService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClassesByInstructor', () => {
    it('returns classes for an instructor', async () => {
      const mockClasses = [
        { id: 'class1', instructorId: 'instructor1' },
        { id: 'class2', instructorId: 'instructor1' }
      ];

      jest.spyOn(firestoreService, 'getWhere')
        .mockResolvedValueOnce(mockClasses)
        .mockResolvedValue([]);

      const result = await classService.getClassesByInstructor('instructor1', 'instructor@test.com');

      expect(result).toEqual(mockClasses);
    });
  });

  describe('checkIn', () => {
    it('throws because check-ins are subcollections now', async () => {
      await expect(classService.checkIn('class1', 'student1')).rejects.toThrow(
        'CheckIns agora são subcoleções'
      );
    });
  });
});

describe('paymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaymentsByStudent', () => {
    it('returns payments for a student (scoped by academia)', async () => {
      const mockPayments = [
        { id: 'payment1', studentId: 'student1', amount: 100 },
        { id: 'payment2', studentId: 'student1', amount: 150 }
      ];

      jest.spyOn(firestoreService, 'getWhere').mockResolvedValue(mockPayments);

      const result = await paymentService.getPaymentsByStudent('student1', 'academy1');

      expect(firestoreService.getWhere).toHaveBeenCalledWith(
        'gyms/academy1/payments',
        'studentId',
        '==',
        'student1'
      );
      expect(result).toEqual(mockPayments);
    });
  });

  describe('registerPayment', () => {
    it('creates a payment record', async () => {
      jest.spyOn(firestoreService, 'create').mockResolvedValue('payment-id');

      const paymentData = { amount: 100, method: 'credit_card' };
      const result = await paymentService.registerPayment('student1', paymentData);

      expect(firestoreService.create).toHaveBeenCalledWith(
        'payments',
        expect.objectContaining({
          studentId: 'student1',
          ...paymentData
        })
      );
      expect(result).toBe('payment-id');
    });
  });
});
