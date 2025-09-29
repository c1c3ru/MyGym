import { GraduationAlert, GraduationRule, GraduationExam, GraduationBoard } from '@domain/entities/GraduationAlert';
import { GraduationRepository } from '@domain/repositories/GraduationRepository';
import { GraduationCalculationService, StudentTrainingData } from '@components/services/GraduationCalculationService';
import { GraduationNotificationService, NotificationRecipient } from '@components/services/GraduationNotificationService';
import { GRADUATION_RULES } from '@components/data/GraduationRules';

export class GraduationManagementUseCase {
  private graduationRepository: GraduationRepository;
  private calculationService: GraduationCalculationService;
  private notificationService: GraduationNotificationService;

  constructor(
    graduationRepository: GraduationRepository,
    notificationService?: GraduationNotificationService
  ) {
    this.graduationRepository = graduationRepository;
    this.calculationService = new GraduationCalculationService(GRADUATION_RULES);
    this.notificationService = notificationService || new GraduationNotificationService();
  }

  /**
   * Calcula e atualiza alertas de graduação para todos os estudantes
   */
  async updateGraduationAlerts(students: StudentTrainingData[]): Promise<GraduationAlert[]> {
    try {
      // Calcular novos alertas
      const newAlerts = this.calculationService.calculateBulkGraduationAlerts(students);
      
      // Obter alertas existentes
      const existingAlerts = await this.graduationRepository.getGraduationAlerts();
      
      // Atualizar ou criar alertas
      const updatedAlerts: GraduationAlert[] = [];
      
      for (const newAlert of newAlerts) {
        const existingAlert = existingAlerts.find(
          alert => alert.studentId === newAlert.studentId && alert.modality === newAlert.modality
        );
        
        if (existingAlert) {
          // Atualizar alerta existente
          const updated = await this.graduationRepository.updateGraduationAlert(
            existingAlert.id,
            {
              ...newAlert,
              id: existingAlert.id,
              createdAt: existingAlert.createdAt,
              updatedAt: new Date()
            }
          );
          updatedAlerts.push(updated);
        } else {
          // Criar novo alerta
          const created = await this.graduationRepository.createGraduationAlert(newAlert);
          updatedAlerts.push(created);
        }
      }
      
      return updatedAlerts;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao atualizar alertas de graduação: ${errorMessage}`);
    }
  }

  /**
   * Obtém o mural de graduações completo
   */
  async getGraduationBoard(): Promise<GraduationBoard> {
    try {
      return await this.graduationRepository.getGraduationBoard();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao obter mural de graduações: ${errorMessage}`);
    }
  }

  /**
   * Obtém estudantes elegíveis por modalidade
   */
  async getEligibleStudents(modality?: string): Promise<GraduationAlert[]> {
    try {
      return await this.graduationRepository.getEligibleStudents(modality);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao obter estudantes elegíveis: ${errorMessage}`);
    }
  }

  /**
   * Agenda um exame de graduação
   */
  async scheduleGraduationExam(examData: {
    date: Date;
    modality: string;
    examiner: string;
    location: string;
    candidateStudents: string[];
  }): Promise<GraduationExam> {
    try {
      const exam = await this.graduationRepository.createGraduationExam({
        ...examData,
        status: 'scheduled',
        results: []
      });

      return exam;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao agendar exame: ${errorMessage}`);
    }
  }

  /**
   * Processa notificações automáticas de graduação
   */
  async processGraduationNotifications(
    recipients: NotificationRecipient[]
  ): Promise<void> {
    try {
      // Obter alertas não notificados
      const unnotifiedAlerts = await this.graduationRepository.getUnnotifiedAlerts();
      
      if (unnotifiedAlerts.length === 0) {
        return;
      }

      // Criar notificações
      const notifications = this.notificationService.scheduleAutomaticNotifications(
        unnotifiedAlerts,
        recipients
      );

      // Marcar alertas como notificados
      for (const alert of unnotifiedAlerts) {
        await this.graduationRepository.markAlertAsNotified(alert.id);
      }

      // Aqui você pode integrar com serviços de envio de notificação
      // (push notifications, email, SMS, etc.)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao processar notificações: ${errorMessage}`);
    }
  }

  /**
   * Obtém estatísticas de graduação por modalidade
   */
  async getGraduationStatistics(modality?: string) {
    try {
      const board = await this.graduationRepository.getGraduationBoard();
      
      if (modality) {
        return board.modalityStats.find(stat => stat.modality === modality);
      }
      
      return {
        totalModalityStats: board.modalityStats,
        totalEligibleStudents: board.eligibleStudents.length,
        totalUpcomingExams: board.upcomingExams.length,
        totalRecentGraduations: board.recentGraduations.length
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao obter estatísticas: ${errorMessage}`);
    }
  }

  /**
   * Verifica se um estudante está elegível para graduação
   */
  async checkStudentEligibility(studentData: StudentTrainingData): Promise<{
    isEligible: boolean;
    alert?: GraduationAlert;
    requirements?: string[];
  }> {
    try {
      const alert = this.calculationService.calculateGraduationAlert(studentData);
      
      if (!alert) {
        return {
          isEligible: false,
          requirements: ['Não há regra de graduação definida para esta modalidade/faixa']
        };
      }

      const rule = GRADUATION_RULES.find(
        r => r.modality === studentData.modality && r.fromBelt === studentData.currentBelt
      );

      return {
        isEligible: alert.isEligible,
        alert,
        requirements: rule?.additionalRequirements || []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao verificar elegibilidade: ${errorMessage}`);
    }
  }

  /**
   * Registra resultado de exame de graduação
   */
  async recordExamResults(
    examId: string,
    results: Array<{
      studentId: string;
      passed: boolean;
      newBelt?: string;
      notes?: string;
      score?: number;
    }>
  ): Promise<GraduationExam> {
    try {
      const exam = await this.graduationRepository.updateGraduationExam(examId, {
        status: 'completed',
        results: results.map(result => ({
          ...result,
          studentId: result.studentId,
          passed: result.passed,
          newBelt: result.newBelt,
          notes: result.notes,
          score: result.score
        }))
      });

      return exam;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao registrar resultados do exame: ${errorMessage}`);
    }
  }

  /**
   * Obtém próximos exames para um instrutor/modalidade
   */
  async getUpcomingExams(modality?: string): Promise<GraduationExam[]> {
    try {
      const exams = await this.graduationRepository.getUpcomingGraduationExams();
      
      if (modality) {
        return exams.filter(exam => exam.modality === modality);
      }
      
      return exams;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao obter próximos exames: ${errorMessage}`);
    }
  }

  /**
   * Obtém regras de graduação para uma modalidade
   */
  getGraduationRules(modality: string): GraduationRule[] {
    return GRADUATION_RULES.filter(rule => rule.modality === modality);
  }

  /**
   * Calcula tempo estimado para próxima graduação
   */
  calculateTimeToNextGraduation(studentData: StudentTrainingData): {
    daysRemaining: number;
    estimatedDate: Date;
    nextBelt?: string;
  } | null {
    const alert = this.calculationService.calculateGraduationAlert(studentData);
    
    if (!alert) {
      return null;
    }

    return {
      daysRemaining: alert.daysUntilEligible,
      estimatedDate: alert.estimatedGraduationDate,
      nextBelt: alert.nextBelt
    };
  }
}
