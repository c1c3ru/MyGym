import { checkInService } from '@infrastructure/services/checkInService';
import { db } from '@infrastructure/services/firebase';
import { collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';

/**
 * Testes de Integração - Check-In Service
 * 
 * Testa o fluxo completo de check-in incluindo:
 * - Criação (dual-write)
 * - Leitura (queries otimizadas)
 * - Validações
 * - Notificações
 */

// Aumentar timeout para testes de integração (30 segundos)
jest.setTimeout(30000);

describe('CheckInService - Integration Tests', () => {
    const TEST_ACADEMIA_ID = 'test-academia-123';
    const TEST_CLASS_ID = 'test-class-456';
    const TEST_STUDENT_ID = 'test-student-789';
    const TEST_INSTRUCTOR_ID = 'test-instructor-101';

    // Dados de teste
    const mockCheckInData = {
        studentId: TEST_STUDENT_ID,
        studentName: 'João Silva',
        classId: TEST_CLASS_ID,
        className: 'Jiu-Jitsu Iniciante',
        instructorId: TEST_INSTRUCTOR_ID,
        instructorName: 'Professor Carlos',
        type: 'manual',
        verified: true
    };

    // Setup inicial - aguardar Firebase estar pronto
    beforeAll(async () => {
        console.log('🔧 Configurando testes de integração...');
        // Dar tempo para Firebase inicializar
        await new Promise(resolve => setTimeout(resolve, 2000));
    }, 10000);

    // Cleanup após cada teste
    afterEach(async () => {
        await cleanupTestData(TEST_ACADEMIA_ID);
    }, 15000);

    describe('create()', () => {
        it('deve criar check-in na localização global', async () => {
            const checkInId = await checkInService.create(mockCheckInData, TEST_ACADEMIA_ID);

            expect(checkInId).toBeDefined();
            expect(typeof checkInId).toBe('string');

            // Verificar se foi criado na localização global
            const globalSnapshot = await getDocs(
                collection(db, 'gyms', TEST_ACADEMIA_ID, 'checkIns')
            );

            const checkIn = globalSnapshot.docs.find(doc => doc.id === checkInId);
            expect(checkIn).toBeDefined();
            expect(checkIn.data().studentId).toBe(TEST_STUDENT_ID);
            expect(checkIn.data().classId).toBe(TEST_CLASS_ID);
        });

        it.skip('deve criar check-in na subcoleção (dual-write)', async () => {
            // ⚠️ TESTE DESABILITADO: Dual-write está desabilitado na Fase 5
            // Este teste só passa quando ENABLE_DUAL_WRITE = true (Fases 1-4)
            // 
            // Para testar dual-write:
            // 1. Altere ENABLE_DUAL_WRITE para true em checkInService.js (linha 18)
            // 2. Remova o .skip deste teste
            // 3. Execute os testes novamente

            const checkInId = await checkInService.create(mockCheckInData, TEST_ACADEMIA_ID);

            // Verificar se foi criado na subcoleção
            const legacySnapshot = await getDocs(
                collection(db, 'gyms', TEST_ACADEMIA_ID, 'classes', TEST_CLASS_ID, 'checkIns')
            );

            const checkIn = legacySnapshot.docs.find(doc => doc.id === checkInId);
            expect(checkIn).toBeDefined();
            expect(checkIn.data()._migratedFrom).toBe('dual-write');
        });

        it('deve adicionar campos obrigatórios automaticamente', async () => {
            const checkInId = await checkInService.create(mockCheckInData, TEST_ACADEMIA_ID);

            const globalSnapshot = await getDocs(
                query(
                    collection(db, 'gyms', TEST_ACADEMIA_ID, 'checkIns'),
                    where('__name__', '==', checkInId)
                )
            );

            const checkIn = globalSnapshot.docs[0].data();

            expect(checkIn.academiaId).toBe(TEST_ACADEMIA_ID);
            expect(checkIn.date).toBeDefined();
            expect(checkIn.timestamp).toBeDefined();
            expect(checkIn.createdAt).toBeDefined();
            expect(checkIn.updatedAt).toBeDefined();
        });

        it('deve lançar erro se academiaId não for fornecido', async () => {
            await expect(
                checkInService.create(mockCheckInData, null)
            ).rejects.toThrow('academiaId é obrigatório');
        });

        it('deve lançar erro se studentId não for fornecido', async () => {
            const invalidData = { ...mockCheckInData, studentId: null };

            await expect(
                checkInService.create(invalidData, TEST_ACADEMIA_ID)
            ).rejects.toThrow('studentId é obrigatório');
        });
    });

    describe('getByClass()', () => {
        beforeEach(async () => {
            // Criar alguns check-ins de teste
            await checkInService.create(mockCheckInData, TEST_ACADEMIA_ID);
            await checkInService.create({
                ...mockCheckInData,
                studentId: 'student-2',
                studentName: 'Maria Santos'
            }, TEST_ACADEMIA_ID);
        }, 15000);

        it('deve retornar check-ins da turma', async () => {
            const checkIns = await checkInService.getByClass(
                TEST_CLASS_ID,
                TEST_ACADEMIA_ID
            );

            expect(checkIns).toHaveLength(2);
            expect(checkIns[0].classId).toBe(TEST_CLASS_ID);
            expect(checkIns[1].classId).toBe(TEST_CLASS_ID);
        });

        it('deve filtrar por data quando fornecida', async () => {
            const today = new Date().toISOString().split('T')[0];

            const checkIns = await checkInService.getByClass(
                TEST_CLASS_ID,
                TEST_ACADEMIA_ID,
                today
            );

            expect(checkIns.length).toBeGreaterThan(0);
            checkIns.forEach(checkIn => {
                expect(checkIn.date).toBe(today);
            });
        });

        it('deve retornar array vazio se não houver check-ins', async () => {
            const checkIns = await checkInService.getByClass(
                'non-existent-class',
                TEST_ACADEMIA_ID
            );

            expect(checkIns).toEqual([]);
        });
    });

    describe('getByStudent()', () => {
        beforeEach(async () => {
            // Criar check-ins em turmas diferentes
            await checkInService.create(mockCheckInData, TEST_ACADEMIA_ID);
            await checkInService.create({
                ...mockCheckInData,
                classId: 'class-2',
                className: 'Muay Thai'
            }, TEST_ACADEMIA_ID);
        }, 15000);

        it('deve retornar todos os check-ins do aluno', async () => {
            const checkIns = await checkInService.getByStudent(
                TEST_STUDENT_ID,
                TEST_ACADEMIA_ID
            );

            expect(checkIns).toHaveLength(2);
            checkIns.forEach(checkIn => {
                expect(checkIn.studentId).toBe(TEST_STUDENT_ID);
            });
        });

        it('deve respeitar o limite de resultados', async () => {
            const checkIns = await checkInService.getByStudent(
                TEST_STUDENT_ID,
                TEST_ACADEMIA_ID,
                1
            );

            expect(checkIns).toHaveLength(1);
        });
    });

    describe('getByInstructor()', () => {
        beforeEach(async () => {
            await checkInService.create(mockCheckInData, TEST_ACADEMIA_ID);
            await checkInService.create({
                ...mockCheckInData,
                studentId: 'student-2',
                studentName: 'Pedro Costa'
            }, TEST_ACADEMIA_ID);
        }, 15000);

        it('deve retornar check-ins do instrutor', async () => {
            const checkIns = await checkInService.getByInstructor(
                TEST_INSTRUCTOR_ID,
                TEST_ACADEMIA_ID
            );

            expect(checkIns.length).toBeGreaterThan(0);
            checkIns.forEach(checkIn => {
                expect(checkIn.instructorId).toBe(TEST_INSTRUCTOR_ID);
            });
        });
    });

    describe('hasCheckedInToday()', () => {
        it('deve retornar true se aluno já fez check-in', async () => {
            await checkInService.create(mockCheckInData, TEST_ACADEMIA_ID);

            const hasCheckedIn = await checkInService.hasCheckedInToday(
                TEST_STUDENT_ID,
                TEST_CLASS_ID,
                TEST_ACADEMIA_ID
            );

            expect(hasCheckedIn).toBe(true);
        });

        it('deve retornar false se aluno não fez check-in', async () => {
            const hasCheckedIn = await checkInService.hasCheckedInToday(
                'non-existent-student',
                TEST_CLASS_ID,
                TEST_ACADEMIA_ID
            );

            expect(hasCheckedIn).toBe(false);
        });
    });

    describe('getStatistics()', () => {
        beforeEach(async () => {
            // Criar check-ins variados
            await checkInService.create(mockCheckInData, TEST_ACADEMIA_ID);
            await checkInService.create({
                ...mockCheckInData,
                type: 'qr',
                studentId: 'student-2'
            }, TEST_ACADEMIA_ID);
            await checkInService.create({
                ...mockCheckInData,
                type: 'geo',
                studentId: 'student-3'
            }, TEST_ACADEMIA_ID);
        }, 15000);

        it('deve calcular estatísticas corretamente', async () => {
            const today = new Date().toISOString().split('T')[0];

            const stats = await checkInService.getStatistics(
                TEST_ACADEMIA_ID,
                today,
                today
            );

            expect(stats.total).toBe(3);
            expect(stats.uniqueStudents).toBe(3);
            expect(stats.byType.manual).toBe(1);
            expect(stats.byType.qr).toBe(1);
            expect(stats.byType.geo).toBe(1);
        });
    });
});

/**
 * Limpar dados de teste
 */
async function cleanupTestData(academiaId) {
    try {
        // Limpar localização global
        const globalSnapshot = await getDocs(
            collection(db, 'gyms', academiaId, 'checkIns')
        );

        for (const doc of globalSnapshot.docs) {
            await deleteDoc(doc.ref);
        }

        // Limpar subcoleções
        const classesSnapshot = await getDocs(
            collection(db, 'gyms', academiaId, 'classes')
        );

        for (const classDoc of classesSnapshot.docs) {
            const checkInsSnapshot = await getDocs(
                collection(classDoc.ref, 'checkIns')
            );

            for (const checkInDoc of checkInsSnapshot.docs) {
                await deleteDoc(checkInDoc.ref);
            }
        }

        console.log('✅ Dados de teste limpos');
    } catch (error) {
        console.error('❌ Erro ao limpar dados de teste:', error);
    }
}
