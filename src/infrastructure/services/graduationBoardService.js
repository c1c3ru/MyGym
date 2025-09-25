/**
 * Serviço para o mural de graduações (GraduationBoard)
 */

import graduationCalculationService from './graduationCalculationService';
import graduationNotificationService from './graduationNotificationService';
import { firestoreService } from './firestoreService';

class GraduationBoardService {
  constructor() {
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.cache = new Map();
  }

  /**
   * Obtém o painel completo de graduações para uma academia
   * @param {string} academiaId - ID da academia
   * @param {boolean} forceRefresh - Forçar atualização do cache
   * @returns {Object} - Painel de graduações
   */
  async getGraduationBoard(academiaId, forceRefresh = false) {
    try {
      const cacheKey = `graduation_board_${academiaId}`;
      
      // Verificar cache
      if (!forceRefresh && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      console.log('🎓 Gerando painel de graduações...');

      // Buscar dados necessários
      const [students, exams, recentGraduations, attendanceData] = await Promise.all([
        this.getActiveStudents(academiaId),
        this.getUpcomingExams(academiaId),
        this.getRecentGraduations(academiaId),
        this.getAttendanceData(academiaId)
      ]);

      // Calcular alertas de graduação
      const alerts = graduationCalculationService.calculateBulkGraduationAlerts(
        students,
        attendanceData
      );

      // Filtrar apenas estudantes elegíveis
      const eligibleStudents = alerts.filter(alert => alert.isEligible);

      // Calcular estatísticas por modalidade
      const modalityStats = graduationCalculationService.getModalityGraduationStats(
        students,
        alerts
      );

      const graduationBoard = {
        academiaId: academiaId,
        upcomingExams: exams,
        eligibleStudents: eligibleStudents,
        allAlerts: alerts,
        recentGraduations: recentGraduations,
        modalityStats: modalityStats,
        summary: {
          totalStudents: students.length,
          totalEligible: eligibleStudents.length,
          totalUpcomingExams: exams.length,
          totalRecentGraduations: recentGraduations.length,
          modalitiesWithEligible: modalityStats.filter(stat => stat.eligibleStudents > 0).length
        },
        lastUpdated: new Date(),
        nextRefreshDue: new Date(Date.now() + this.cacheTimeout)
      };

      // Atualizar cache
      this.cache.set(cacheKey, {
        data: graduationBoard,
        timestamp: Date.now()
      });

      console.log(`✅ Painel de graduações gerado: ${eligibleStudents.length} elegíveis de ${students.length} estudantes`);
      return graduationBoard;

    } catch (error) {
      console.error('❌ Erro ao gerar painel de graduações:', error);
      throw error;
    }
  }

  /**
   * Busca estudantes ativos da academia
   * @param {string} academiaId - ID da academia
   * @returns {Array} - Lista de estudantes ativos
   */
  async getActiveStudents(academiaId) {
    try {
      const students = await firestoreService.query(
        'students',
        academiaId,
        [
          { field: 'isActive', operator: '==', value: true },
          { field: 'academiaId', operator: '==', value: academiaId }
        ]
      );

      return students.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        modalities: student.modalities || [],
        currentGraduation: student.currentGraduation,
        graduations: student.graduations || [],
        createdAt: student.createdAt
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar estudantes:', error);
      return [];
    }
  }

  /**
   * Busca próximos exames
   * @param {string} academiaId - ID da academia
   * @returns {Array} - Lista de próximos exames
   */
  async getUpcomingExams(academiaId) {
    try {
      const now = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      const exams = await firestoreService.query(
        'graduation_exams',
        academiaId,
        [
          { field: 'academiaId', operator: '==', value: academiaId },
          { field: 'date', operator: '>=', value: now },
          { field: 'date', operator: '<=', value: threeMonthsFromNow },
          { field: 'status', operator: '==', value: 'scheduled' }
        ],
        { field: 'date', direction: 'asc' }
      );

      return exams;
    } catch (error) {
      console.error('❌ Erro ao buscar próximos exames:', error);
      return [];
    }
  }

  /**
   * Busca graduações recentes (últimos 3 meses)
   * @param {string} academiaId - ID da academia
   * @returns {Array} - Lista de graduações recentes
   */
  async getRecentGraduations(academiaId) {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const graduations = await firestoreService.query(
        'graduations',
        academiaId,
        [
          { field: 'academiaId', operator: '==', value: academiaId },
          { field: 'date', operator: '>=', value: threeMonthsAgo }
        ],
        { field: 'date', direction: 'desc' },
        20
      );

      return graduations;
    } catch (error) {
      console.error('❌ Erro ao buscar graduações recentes:', error);
      return [];
    }
  }

  /**
   * Busca dados de frequência dos estudantes
   * @param {string} academiaId - ID da academia
   * @returns {Object} - Mapa de frequência por estudante
   */
  async getAttendanceData(academiaId) {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const attendance = await firestoreService.query(
        'check_ins',
        academiaId,
        [
          { field: 'academiaId', operator: '==', value: academiaId },
          { field: 'date', operator: '>=', value: sixMonthsAgo }
        ]
      );

      // Agrupar por estudante
      const attendanceMap = {};
      attendance.forEach(record => {
        if (!attendanceMap[record.studentId]) {
          attendanceMap[record.studentId] = [];
        }
        attendanceMap[record.studentId].push({
          date: record.date,
          modality: record.modality,
          present: record.present !== false // Default true se não especificado
        });
      });

      return attendanceMap;
    } catch (error) {
      console.error('❌ Erro ao buscar dados de frequência:', error);
      return {};
    }
  }

  /**
   * Agenda um novo exame de graduação
   * @param {Object} examData - Dados do exame
   * @returns {string} - ID do exame criado
   */
  async scheduleGraduationExam(examData) {
    try {
      const exam = {
        id: `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: new Date(examData.date),
        modality: examData.modality,
        examiner: examData.examiner,
        location: examData.location,
        candidateStudents: examData.candidateStudents || [],
        status: 'scheduled',
        academiaId: examData.academiaId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: examData.createdBy
      };

      await firestoreService.add('graduation_exams', exam, examData.academiaId);

      // Notificar candidatos
      if (exam.candidateStudents.length > 0) {
        await graduationNotificationService.notifyExamScheduled(exam, exam.candidateStudents);
        
        // Agendar lembrete para 24h antes
        await graduationNotificationService.scheduleExamReminder(exam, exam.candidateStudents, 24);
      }

      // Invalidar cache
      this.clearCache(examData.academiaId);

      console.log(`✅ Exame de graduação agendado: ${exam.id}`);
      return exam.id;

    } catch (error) {
      console.error('❌ Erro ao agendar exame de graduação:', error);
      throw error;
    }
  }

  /**
   * Processa resultados de um exame
   * @param {string} examId - ID do exame
   * @param {Array} results - Resultados do exame
   * @param {string} academiaId - ID da academia
   */
  async processExamResults(examId, results, academiaId) {
    try {
      const exam = await firestoreService.get('graduation_exams', examId, academiaId);
      if (!exam) {
        throw new Error('Exame não encontrado');
      }

      // Atualizar status do exame
      await firestoreService.update('graduation_exams', examId, {
        status: 'completed',
        results: results,
        completedAt: new Date(),
        updatedAt: new Date()
      }, academiaId);

      // Processar cada resultado
      for (const result of results) {
        if (result.passed && result.newBelt) {
          // Criar registro de graduação
          const graduationRecord = {
            id: `graduation_${Date.now()}_${result.studentId}`,
            studentId: result.studentId,
            examId: examId,
            modality: exam.modality,
            fromBelt: result.currentBelt || 'N/A',
            toBelt: result.newBelt,
            date: exam.date,
            instructor: exam.examiner,
            academiaId: academiaId,
            notes: result.notes,
            score: result.score,
            createdAt: new Date()
          };

          await firestoreService.add('graduations', graduationRecord, academiaId);

          // Atualizar perfil do estudante
          await this.updateStudentGraduation(result.studentId, result.newBelt, graduationRecord, academiaId);

          // Notificar estudante
          await graduationNotificationService.notifyGraduationCompleted(
            result.studentId,
            {
              ...graduationRecord,
              newBelt: result.newBelt,
              examDate: exam.date,
              instructor: exam.examiner
            }
          );
        }
      }

      // Invalidar cache
      this.clearCache(academiaId);

      console.log(`✅ Resultados do exame ${examId} processados`);
    } catch (error) {
      console.error('❌ Erro ao processar resultados do exame:', error);
      throw error;
    }
  }

  /**
   * Atualiza graduação do estudante
   * @param {string} studentId - ID do estudante
   * @param {string} newBelt - Nova graduação
   * @param {Object} graduationRecord - Registro da graduação
   * @param {string} academiaId - ID da academia
   */
  async updateStudentGraduation(studentId, newBelt, graduationRecord, academiaId) {
    try {
      const student = await firestoreService.get('students', studentId, academiaId);
      if (!student) {
        throw new Error('Estudante não encontrado');
      }

      const updatedGraduations = [...(student.graduations || []), {
        id: graduationRecord.id,
        level: newBelt,
        modality: graduationRecord.modality,
        date: graduationRecord.date,
        instructorId: graduationRecord.instructor
      }];

      await firestoreService.update('students', studentId, {
        currentGraduation: newBelt,
        graduations: updatedGraduations,
        updatedAt: new Date()
      }, academiaId);

      console.log(`✅ Graduação do estudante ${studentId} atualizada para ${newBelt}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar graduação do estudante:', error);
    }
  }

  /**
   * Executa verificação automática de alertas de graduação
   * @param {string} academiaId - ID da academia
   */
  async runAutomaticGraduationCheck(academiaId) {
    try {
      console.log('🤖 Executando verificação automática de graduações...');

      const board = await this.getGraduationBoard(academiaId, true);
      
      // Notificar instrutores sobre estudantes elegíveis
      if (board.eligibleStudents.length > 0) {
        const instructors = await this.getInstructors(academiaId);
        
        for (const instructor of instructors) {
          await graduationNotificationService.notifyInstructorEligibleStudents(
            instructor.id,
            board.eligibleStudents,
            academiaId
          );
        }
      }

      // Notificar admins sobre estatísticas
      const admins = await this.getAdmins(academiaId);
      if (admins.length > 0 && board.modalityStats.length > 0) {
        for (const admin of admins) {
          await graduationNotificationService.notifyAdminGraduationStats(
            admin.id,
            board.modalityStats,
            academiaId
          );
        }
      }

      console.log(`✅ Verificação automática concluída: ${board.eligibleStudents.length} elegíveis encontrados`);
    } catch (error) {
      console.error('❌ Erro na verificação automática:', error);
    }
  }

  /**
   * Busca instrutores da academia
   * @param {string} academiaId - ID da academia
   * @returns {Array} - Lista de instrutores
   */
  async getInstructors(academiaId) {
    try {
      return await firestoreService.query(
        'users',
        null,
        [
          { field: 'academiaId', operator: '==', value: academiaId },
          { field: 'userType', operator: '==', value: 'instructor' },
          { field: 'isActive', operator: '==', value: true }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar instrutores:', error);
      return [];
    }
  }

  /**
   * Busca administradores da academia
   * @param {string} academiaId - ID da academia
   * @returns {Array} - Lista de administradores
   */
  async getAdmins(academiaId) {
    try {
      return await firestoreService.query(
        'users',
        null,
        [
          { field: 'academiaId', operator: '==', value: academiaId },
          { field: 'userType', operator: '==', value: 'admin' },
          { field: 'isActive', operator: '==', value: true }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar administradores:', error);
      return [];
    }
  }

  /**
   * Limpa cache para uma academia
   * @param {string} academiaId - ID da academia
   */
  clearCache(academiaId) {
    const cacheKey = `graduation_board_${academiaId}`;
    this.cache.delete(cacheKey);
  }

  /**
   * Limpa todo o cache
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * Obtém estatísticas do cache
   * @returns {Object} - Estatísticas do cache
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default new GraduationBoardService();