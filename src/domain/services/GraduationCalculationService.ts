import { GraduationAlert, GraduationRule } from '@domain/entities/GraduationAlert';

export interface StudentTrainingData {
  id: string;
  name: string;
  currentBelt: string;
  modality: string;
  trainingStartDate: Date;
  totalClasses?: number;
  lastClassDate?: Date;
}

export class GraduationCalculationService {
  private graduationRules: GraduationRule[];

  constructor(graduationRules: GraduationRule[]) {
    this.graduationRules = graduationRules;
  }

  /**
   * Calcula o alerta de graduação para um estudante
   */
  calculateGraduationAlert(student: StudentTrainingData): GraduationAlert | null {
    const rule = this.findGraduationRule(student.modality, student.currentBelt);
    if (!rule) {
      return null;
    }

    const trainingDays = this.calculateTrainingDays(student.trainingStartDate);
    const daysUntilEligible = Math.max(0, rule.minimumDays - trainingDays);
    const isEligible = trainingDays >= rule.minimumDays;
    
    // Verifica requisitos adicionais se existirem
    if (rule.minimumClasses && student.totalClasses && student.totalClasses < rule.minimumClasses) {
      return null; // Não elegível por falta de aulas
    }

    const estimatedGraduationDate = this.calculateEstimatedGraduationDate(
      student.trainingStartDate,
      rule.minimumDays
    );

    const alertLevel = this.determineAlertLevel(daysUntilEligible, isEligible);

    return {
      id: this.generateAlertId(student.id, student.modality),
      studentId: student.id,
      studentName: student.name,
      currentBelt: student.currentBelt,
      nextBelt: rule.toBelt,
      modality: student.modality,
      estimatedGraduationDate,
      trainingStartDate: student.trainingStartDate,
      minimumTrainingDays: rule.minimumDays,
      daysUntilEligible,
      isEligible,
      alertLevel,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Calcula alertas para múltiplos estudantes
   */
  calculateBulkGraduationAlerts(students: StudentTrainingData[]): GraduationAlert[] {
    return students
      .map(student => this.calculateGraduationAlert(student))
      .filter((alert): alert is GraduationAlert => alert !== null);
  }

  /**
   * Encontra a regra de graduação apropriada
   */
  private findGraduationRule(modality: string, currentBelt: string): GraduationRule | undefined {
    return this.graduationRules.find(
      rule => rule.modality === modality && rule.fromBelt === currentBelt
    );
  }

  /**
   * Calcula o número de dias de treinamento
   */
  private calculateTrainingDays(startDate: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula a data estimada de graduação
   */
  private calculateEstimatedGraduationDate(startDate: Date, minimumDays: number): Date {
    const estimatedDate = new Date(startDate);
    estimatedDate.setDate(estimatedDate.getDate() + minimumDays);
    return estimatedDate;
  }

  /**
   * Determina o nível de alerta baseado nos dias restantes
   */
  private determineAlertLevel(daysUntilEligible: number, isEligible: boolean): 'info' | 'warning' | 'ready' {
    if (isEligible) {
      return 'ready';
    }
    
    if (daysUntilEligible <= 30) {
      return 'warning';
    }
    
    return 'info';
  }

  /**
   * Gera um ID único para o alerta
   */
  private generateAlertId(studentId: string, modality: string): string {
    return `alert_${studentId}_${modality}_${Date.now()}`;
  }

  /**
   * Obtém a próxima faixa para um estudante
   */
  getNextBelt(modality: string, currentBelt: string): string | null {
    const rule = this.findGraduationRule(modality, currentBelt);
    return rule ? rule.toBelt : null;
  }

  /**
   * Verifica se um estudante está elegível para graduação
   */
  isStudentEligible(student: StudentTrainingData): boolean {
    const alert = this.calculateGraduationAlert(student);
    return alert ? alert.isEligible : false;
  }

  /**
   * Obtém estatísticas de graduação por modalidade
   */
  getModalityGraduationStats(students: StudentTrainingData[], modality: string) {
    const modalityStudents = students.filter(s => s.modality === modality);
    const alerts = this.calculateBulkGraduationAlerts(modalityStudents);
    const eligibleStudents = alerts.filter(a => a.isEligible);
    
    const totalTrainingDays = modalityStudents.reduce((sum, student) => {
      return sum + this.calculateTrainingDays(student.trainingStartDate);
    }, 0);
    
    const averageTrainingTime = modalityStudents.length > 0 
      ? totalTrainingDays / modalityStudents.length 
      : 0;

    return {
      modality,
      totalStudents: modalityStudents.length,
      eligibleStudents: eligibleStudents.length,
      averageTrainingTime: Math.round(averageTrainingTime)
    };
  }
}
