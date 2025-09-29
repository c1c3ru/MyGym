import { GraduationAlert, GraduationRule, GraduationExam, GraduationBoard } from '@domain/entities/GraduationAlert';

export interface GraduationRepository {
  // Alertas de graduação
  getGraduationAlerts(): Promise<GraduationAlert[]>;
  getGraduationAlertsByStudent(studentId: string): Promise<GraduationAlert[]>;
  getGraduationAlertsByModality(modality: string): Promise<GraduationAlert[]>;
  createGraduationAlert(alert: Omit<GraduationAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<GraduationAlert>;
  updateGraduationAlert(id: string, alert: Partial<GraduationAlert>): Promise<GraduationAlert>;
  deleteGraduationAlert(id: string): Promise<void>;

  // Regras de graduação
  getGraduationRules(): Promise<GraduationRule[]>;
  getGraduationRulesByModality(modality: string): Promise<GraduationRule[]>;
  createGraduationRule(rule: GraduationRule): Promise<GraduationRule>;
  updateGraduationRule(modality: string, fromBelt: string, toBelt: string, rule: Partial<GraduationRule>): Promise<GraduationRule>;
  deleteGraduationRule(modality: string, fromBelt: string, toBelt: string): Promise<void>;

  // Exames de graduação
  getGraduationExams(): Promise<GraduationExam[]>;
  getGraduationExamsByModality(modality: string): Promise<GraduationExam[]>;
  getUpcomingGraduationExams(): Promise<GraduationExam[]>;
  createGraduationExam(exam: Omit<GraduationExam, 'id' | 'createdAt' | 'updatedAt'>): Promise<GraduationExam>;
  updateGraduationExam(id: string, exam: Partial<GraduationExam>): Promise<GraduationExam>;
  deleteGraduationExam(id: string): Promise<void>;

  // Mural de graduações
  getGraduationBoard(): Promise<GraduationBoard>;
  
  // Estudantes elegíveis
  getEligibleStudents(modality?: string): Promise<GraduationAlert[]>;
  
  // Notificações
  markAlertAsNotified(alertId: string): Promise<void>;
  getUnnotifiedAlerts(): Promise<GraduationAlert[]>;
}
