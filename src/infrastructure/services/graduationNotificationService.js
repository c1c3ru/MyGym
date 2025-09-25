/**
 * Serviço para notificações de graduação
 */

import notificationService from './notificationService';
import { firestoreService } from './firestoreService';

class GraduationNotificationService {
  constructor() {
    this.notificationTypes = {
      ELIGIBILITY_ALERT: 'graduation_eligibility',
      EXAM_SCHEDULED: 'graduation_exam_scheduled',
      EXAM_REMINDER: 'graduation_exam_reminder',
      GRADUATION_COMPLETED: 'graduation_completed',
      BULK_ELIGIBILITY: 'bulk_graduation_eligibility'
    };
  }

  /**
   * Notifica instrutor sobre estudantes elegíveis para graduação
   * @param {string} instructorId - ID do instrutor
   * @param {Array} eligibleStudents - Estudantes elegíveis
   * @param {string} academiaId - ID da academia
   */
  async notifyInstructorEligibleStudents(instructorId, eligibleStudents, academiaId) {
    try {
      if (!eligibleStudents || eligibleStudents.length === 0) {
        return;
      }

      const title = 'Estudantes Elegíveis para Graduação';
      const message = eligibleStudents.length === 1 
        ? `${eligibleStudents[0].studentName} está elegível para graduação em ${eligibleStudents[0].modality}`
        : `${eligibleStudents.length} estudantes estão elegíveis para graduação`;

      // Salvar notificação no Firestore
      await this.saveGraduationNotification({
        userId: instructorId,
        academiaId: academiaId,
        type: this.notificationTypes.ELIGIBILITY_ALERT,
        title: title,
        message: message,
        data: {
          eligibleStudents: eligibleStudents.map(student => ({
            studentId: student.studentId,
            studentName: student.studentName,
            modality: student.modality,
            currentBelt: student.currentBelt,
            nextBelt: student.nextBelt,
            daysUntilEligible: student.daysUntilEligible
          })),
          count: eligibleStudents.length
        },
        priority: 'high',
        isRead: false,
        createdAt: new Date()
      });

      // Enviar notificação local
      await notificationService.sendLocalNotification(title, message, {
        type: this.notificationTypes.ELIGIBILITY_ALERT,
        userId: instructorId,
        screen: 'GraduationBoard'
      });

      console.log(`✅ Notificação de elegibilidade enviada para instrutor ${instructorId}`);
    } catch (error) {
      console.error('❌ Erro ao notificar instrutor sobre elegibilidade:', error);
    }
  }

  /**
   * Notifica admin sobre estatísticas de graduação
   * @param {string} adminId - ID do administrador
   * @param {Object} stats - Estatísticas de graduação
   * @param {string} academiaId - ID da academia
   */
  async notifyAdminGraduationStats(adminId, stats, academiaId) {
    try {
      const totalEligible = stats.reduce((sum, modalityStats) => sum + modalityStats.eligibleStudents, 0);
      
      if (totalEligible === 0) {
        return;
      }

      const title = 'Relatório de Graduações';
      const message = `${totalEligible} estudantes elegíveis para graduação em ${stats.length} modalidades`;

      await this.saveGraduationNotification({
        userId: adminId,
        academiaId: academiaId,
        type: this.notificationTypes.BULK_ELIGIBILITY,
        title: title,
        message: message,
        data: {
          modalityStats: stats,
          totalEligible: totalEligible,
          reportDate: new Date()
        },
        priority: 'medium',
        isRead: false,
        createdAt: new Date()
      });

      await notificationService.sendLocalNotification(title, message, {
        type: this.notificationTypes.BULK_ELIGIBILITY,
        userId: adminId,
        screen: 'Reports'
      });

      console.log(`✅ Relatório de graduações enviado para admin ${adminId}`);
    } catch (error) {
      console.error('❌ Erro ao enviar relatório para admin:', error);
    }
  }

  /**
   * Notifica sobre exame de graduação agendado
   * @param {Object} exam - Dados do exame
   * @param {Array} candidateIds - IDs dos candidatos
   */
  async notifyExamScheduled(exam, candidateIds) {
    try {
      const title = 'Exame de Graduação Agendado';
      const examDate = new Date(exam.date);
      const message = `Exame de ${exam.modality} agendado para ${examDate.toLocaleDateString('pt-BR')}`;

      // Notificar cada candidato
      for (const candidateId of candidateIds) {
        await this.saveGraduationNotification({
          userId: candidateId,
          academiaId: exam.academiaId,
          type: this.notificationTypes.EXAM_SCHEDULED,
          title: title,
          message: message,
          data: {
            examId: exam.id,
            modality: exam.modality,
            examDate: exam.date,
            location: exam.location,
            examiner: exam.examiner
          },
          priority: 'high',
          isRead: false,
          createdAt: new Date()
        });

        await notificationService.sendLocalNotification(title, message, {
          type: this.notificationTypes.EXAM_SCHEDULED,
          userId: candidateId,
          screen: 'Calendar'
        });
      }

      console.log(`✅ Notificações de exame enviadas para ${candidateIds.length} candidatos`);
    } catch (error) {
      console.error('❌ Erro ao notificar sobre exame agendado:', error);
    }
  }

  /**
   * Agenda lembrete de exame
   * @param {Object} exam - Dados do exame
   * @param {Array} candidateIds - IDs dos candidatos
   * @param {number} hoursBeforeExam - Horas antes do exame para lembrar
   */
  async scheduleExamReminder(exam, candidateIds, hoursBeforeExam = 24) {
    try {
      const examDate = new Date(exam.date);
      const reminderDate = new Date(examDate.getTime() - (hoursBeforeExam * 60 * 60 * 1000));

      // Só agendar se a data for no futuro
      if (reminderDate <= new Date()) {
        return;
      }

      const title = 'Lembrete: Exame de Graduação';
      const message = `Seu exame de ${exam.modality} é ${hoursBeforeExam === 24 ? 'amanhã' : `em ${hoursBeforeExam} horas`}`;

      for (const candidateId of candidateIds) {
        await notificationService.scheduleNotification(
          title,
          message,
          reminderDate,
          {
            type: this.notificationTypes.EXAM_REMINDER,
            userId: candidateId,
            examId: exam.id,
            modality: exam.modality,
            screen: 'Calendar'
          }
        );
      }

      console.log(`✅ Lembretes de exame agendados para ${candidateIds.length} candidatos`);
    } catch (error) {
      console.error('❌ Erro ao agendar lembretes de exame:', error);
    }
  }

  /**
   * Notifica sobre graduação completada
   * @param {string} studentId - ID do estudante
   * @param {Object} graduationData - Dados da graduação
   */
  async notifyGraduationCompleted(studentId, graduationData) {
    try {
      const title = 'Parabéns! Graduação Concluída';
      const message = `Você foi promovido para ${graduationData.newBelt} em ${graduationData.modality}!`;

      await this.saveGraduationNotification({
        userId: studentId,
        academiaId: graduationData.academiaId,
        type: this.notificationTypes.GRADUATION_COMPLETED,
        title: title,
        message: message,
        data: {
          graduationId: graduationData.id,
          modality: graduationData.modality,
          fromBelt: graduationData.fromBelt,
          toBelt: graduationData.newBelt,
          examDate: graduationData.examDate,
          instructor: graduationData.instructor,
          certificateUrl: graduationData.certificateUrl
        },
        priority: 'high',
        isRead: false,
        createdAt: new Date()
      });

      await notificationService.sendLocalNotification(title, message, {
        type: this.notificationTypes.GRADUATION_COMPLETED,
        userId: studentId,
        screen: 'Evolution'
      });

      console.log(`✅ Notificação de graduação enviada para estudante ${studentId}`);
    } catch (error) {
      console.error('❌ Erro ao notificar graduação completada:', error);
    }
  }

  /**
   * Salva notificação de graduação no Firestore
   * @param {Object} notificationData - Dados da notificação
   */
  async saveGraduationNotification(notificationData) {
    try {
      const notificationDoc = {
        ...notificationData,
        id: `graduation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        category: 'graduation',
        expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // Expira em 30 dias
      };

      await firestoreService.add('notifications', notificationDoc, notificationData.academiaId);
      return notificationDoc.id;
    } catch (error) {
      console.error('❌ Erro ao salvar notificação de graduação:', error);
      throw error;
    }
  }

  /**
   * Busca notificações de graduação para um usuário
   * @param {string} userId - ID do usuário
   * @param {string} academiaId - ID da academia
   * @param {number} limit - Limite de notificações
   * @returns {Array} - Lista de notificações
   */
  async getGraduationNotifications(userId, academiaId, limit = 20) {
    try {
      const notifications = await firestoreService.query(
        'notifications',
        academiaId,
        [
          { field: 'userId', operator: '==', value: userId },
          { field: 'category', operator: '==', value: 'graduation' },
          { field: 'expiresAt', operator: '>', value: new Date() }
        ],
        { field: 'createdAt', direction: 'desc' },
        limit
      );

      return notifications;
    } catch (error) {
      console.error('❌ Erro ao buscar notificações de graduação:', error);
      return [];
    }
  }

  /**
   * Marca notificação como lida
   * @param {string} notificationId - ID da notificação
   * @param {string} academiaId - ID da academia
   */
  async markNotificationAsRead(notificationId, academiaId) {
    try {
      await firestoreService.update('notifications', notificationId, {
        isRead: true,
        readAt: new Date()
      }, academiaId);
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
    }
  }

  /**
   * Remove notificações expiradas
   * @param {string} academiaId - ID da academia
   */
  async cleanupExpiredNotifications(academiaId) {
    try {
      const expiredNotifications = await firestoreService.query(
        'notifications',
        academiaId,
        [
          { field: 'category', operator: '==', value: 'graduation' },
          { field: 'expiresAt', operator: '<=', value: new Date() }
        ]
      );

      for (const notification of expiredNotifications) {
        await firestoreService.delete('notifications', notification.id, academiaId);
      }

      console.log(`✅ ${expiredNotifications.length} notificações expiradas removidas`);
    } catch (error) {
      console.error('❌ Erro ao limpar notificações expiradas:', error);
    }
  }

  /**
   * Envia notificações em lote para múltiplos usuários
   * @param {Array} notifications - Lista de notificações
   */
  async sendBulkNotifications(notifications) {
    try {
      const promises = notifications.map(notification => 
        this.saveGraduationNotification(notification)
      );

      await Promise.all(promises);
      console.log(`✅ ${notifications.length} notificações enviadas em lote`);
    } catch (error) {
      console.error('❌ Erro ao enviar notificações em lote:', error);
    }
  }
}

export default new GraduationNotificationService();