import { GraduationAlert } from '@domain/entities/GraduationAlert';

export interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  role: 'instructor' | 'admin';
  modalities?: string[];
}

export interface GraduationNotification {
  id: string;
  type: 'student_eligible' | 'exam_reminder' | 'graduation_completed' | 'bulk_eligible';
  title: string;
  message: string;
  recipients: string[];
  data: any;
  scheduled: boolean;
  sentAt?: Date;
  createdAt: Date;
}

export class GraduationNotificationService {
  private notifications: GraduationNotification[] = [];

  /**
   * Cria notificação para aluno elegível
   */
  createStudentEligibleNotification(
    alert: GraduationAlert,
    recipients: NotificationRecipient[]
  ): GraduationNotification {
    const notification: GraduationNotification = {
      id: `notif_${alert.id}_${Date.now()}`,
      type: 'student_eligible',
      title: 'Aluno Elegível para Graduação',
      message: `${alert.studentName} está elegível para graduação de ${alert.currentBelt} para ${alert.nextBelt} em ${alert.modality}`,
      recipients: recipients.map(r => r.id),
      data: {
        alertId: alert.id,
        studentId: alert.studentId,
        studentName: alert.studentName,
        modality: alert.modality,
        currentBelt: alert.currentBelt,
        nextBelt: alert.nextBelt
      },
      scheduled: false,
      createdAt: new Date()
    };

    this.notifications.push(notification);
    return notification;
  }

  /**
   * Cria notificação de lembrete de exame
   */
  createExamReminderNotification(
    examId: string,
    examDate: Date,
    modality: string,
    candidateCount: number,
    recipients: NotificationRecipient[]
  ): GraduationNotification {
    const daysUntilExam = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    const notification: GraduationNotification = {
      id: `exam_reminder_${examId}_${Date.now()}`,
      type: 'exam_reminder',
      title: 'Lembrete de Exame de Graduação',
      message: `Exame de ${modality} em ${daysUntilExam} dias com ${candidateCount} candidatos`,
      recipients: recipients.map(r => r.id),
      data: {
        examId,
        examDate,
        modality,
        candidateCount,
        daysUntilExam
      },
      scheduled: false,
      createdAt: new Date()
    };

    this.notifications.push(notification);
    return notification;
  }

  /**
   * Cria notificação de graduação concluída
   */
  createGraduationCompletedNotification(
    examId: string,
    modality: string,
    approvedCount: number,
    totalCandidates: number,
    recipients: NotificationRecipient[]
  ): GraduationNotification {
    const notification: GraduationNotification = {
      id: `graduation_completed_${examId}_${Date.now()}`,
      type: 'graduation_completed',
      title: 'Exame de Graduação Concluído',
      message: `Exame de ${modality} finalizado: ${approvedCount}/${totalCandidates} candidatos aprovados`,
      recipients: recipients.map(r => r.id),
      data: {
        examId,
        modality,
        approvedCount,
        totalCandidates,
        successRate: Math.round((approvedCount / totalCandidates) * 100)
      },
      scheduled: false,
      createdAt: new Date()
    };

    this.notifications.push(notification);
    return notification;
  }

  /**
   * Cria notificação para múltiplos alunos elegíveis
   */
  createBulkEligibleNotification(
    alerts: GraduationAlert[],
    modality: string,
    recipients: NotificationRecipient[]
  ): GraduationNotification {
    const notification: GraduationNotification = {
      id: `bulk_eligible_${modality}_${Date.now()}`,
      type: 'bulk_eligible',
      title: 'Múltiplos Alunos Elegíveis',
      message: `${alerts.length} alunos de ${modality} estão elegíveis para graduação`,
      recipients: recipients.map(r => r.id),
      data: {
        modality,
        eligibleCount: alerts.length,
        students: alerts.map(alert => ({
          id: alert.studentId,
          name: alert.studentName,
          currentBelt: alert.currentBelt,
          nextBelt: alert.nextBelt
        }))
      },
      scheduled: false,
      createdAt: new Date()
    };

    this.notifications.push(notification);
    return notification;
  }

  /**
   * Filtra destinatários por modalidade
   */
  filterRecipientsByModality(
    recipients: NotificationRecipient[],
    modality: string
  ): NotificationRecipient[] {
    return recipients.filter(recipient => {
      // Admins recebem todas as notificações
      if (recipient.role === 'admin') {
        return true;
      }
      
      // Instrutores só recebem da sua modalidade
      return recipient.modalities?.includes(modality) || false;
    });
  }

  /**
   * Agenda notificações automáticas baseadas em alertas
   */
  scheduleAutomaticNotifications(
    alerts: GraduationAlert[],
    recipients: NotificationRecipient[]
  ): GraduationNotification[] {
    const notifications: GraduationNotification[] = [];

    // Agrupar alertas por modalidade
    const alertsByModality = alerts.reduce((acc, alert) => {
      if (!acc[alert.modality]) {
        acc[alert.modality] = [];
      }
      acc[alert.modality].push(alert);
      return acc;
    }, {} as Record<string, GraduationAlert[]>);

    // Criar notificações por modalidade
    Object.entries(alertsByModality).forEach(([modality, modalityAlerts]) => {
      const modalityRecipients = this.filterRecipientsByModality(recipients, modality);
      
      if (modalityRecipients.length === 0) return;

      // Notificação individual para cada aluno elegível
      modalityAlerts.forEach(alert => {
        if (alert.isEligible) {
          const notification = this.createStudentEligibleNotification(alert, modalityRecipients);
          notifications.push(notification);
        }
      });

      // Notificação em lote se houver muitos alunos elegíveis
      const eligibleAlerts = modalityAlerts.filter(alert => alert.isEligible);
      if (eligibleAlerts.length >= 3) {
        const bulkNotification = this.createBulkEligibleNotification(
          eligibleAlerts,
          modality,
          modalityRecipients
        );
        notifications.push(bulkNotification);
      }
    });

    return notifications;
  }

  /**
   * Obtém notificações pendentes para um usuário
   */
  getPendingNotifications(userId: string): GraduationNotification[] {
    return this.notifications.filter(
      notification => 
        notification.recipients.includes(userId) && 
        !notification.sentAt
    );
  }

  /**
   * Marca notificação como enviada
   */
  markNotificationAsSent(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.sentAt = new Date();
    }
  }

  /**
   * Obtém estatísticas de notificações
   */
  getNotificationStats(timeframe: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const periodNotifications = this.notifications.filter(
      n => n.createdAt >= startDate
    );

    const stats = {
      total: periodNotifications.length,
      sent: periodNotifications.filter(n => n.sentAt).length,
      pending: periodNotifications.filter(n => !n.sentAt).length,
      byType: {} as Record<string, number>
    };

    // Contar por tipo
    periodNotifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Limpa notificações antigas
   */
  cleanupOldNotifications(daysOld: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const initialCount = this.notifications.length;
    this.notifications = this.notifications.filter(
      notification => notification.createdAt >= cutoffDate
    );

    return initialCount - this.notifications.length;
  }

  /**
   * Formata mensagem de notificação para diferentes canais
   */
  formatNotificationMessage(
    notification: GraduationNotification,
    format: 'push' | 'email' | 'sms'
  ): string {
    switch (format) {
      case 'push':
        return notification.message;
      
      case 'email':
        return this.formatEmailMessage(notification);
      
      case 'sms':
        return this.formatSMSMessage(notification);
      
      default:
        return notification.message;
    }
  }

  private formatEmailMessage(notification: GraduationNotification): string {
    const { data } = notification;
    
    switch (notification.type) {
      case 'student_eligible':
        return `
Olá,

O aluno ${data.studentName} está elegível para graduação!

Detalhes:
- Modalidade: ${data.modality}
- Faixa atual: ${data.currentBelt}
- Próxima faixa: ${data.nextBelt}

Acesse o sistema para agendar o exame de graduação.

Atenciosamente,
Sistema MyGym
        `.trim();

      case 'exam_reminder':
        return `
Olá,

Lembrete: Exame de graduação de ${data.modality} em ${data.daysUntilExam} dias.

Detalhes:
- Data: ${new Date(data.examDate).toLocaleDateString('pt-BR')}
- Candidatos: ${data.candidateCount}

Prepare-se para o exame!

Atenciosamente,
Sistema MyGym
        `.trim();

      default:
        return notification.message;
    }
  }

  private formatSMSMessage(notification: GraduationNotification): string {
    const { data } = notification;
    
    switch (notification.type) {
      case 'student_eligible':
        return `MyGym: ${data.studentName} elegível para graduação ${data.currentBelt}→${data.nextBelt} (${data.modality})`;
      
      case 'exam_reminder':
        return `MyGym: Exame ${data.modality} em ${data.daysUntilExam} dias - ${data.candidateCount} candidatos`;
      
      default:
        return `MyGym: ${notification.message}`;
    }
  }
}
