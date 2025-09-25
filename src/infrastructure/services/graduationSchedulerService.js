/**
 * Serviço para agendamento automático de verificações de graduação
 */

import graduationBoardService from './graduationBoardService';
import graduationNotificationService from './graduationNotificationService';
import { firestoreService } from './firestoreService';

class GraduationSchedulerService {
  constructor() {
    this.scheduledTasks = new Map();
    this.isRunning = false;
    this.checkInterval = 24 * 60 * 60 * 1000; // 24 horas em millisegundos
  }

  /**
   * Inicia o agendador automático
   */
  start() {
    if (this.isRunning) {
      console.log('🤖 Agendador de graduações já está em execução');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Iniciando agendador automático de graduações...');
    
    // Executar verificação inicial
    this.runDailyCheck();
    
    // Agendar verificações diárias
    this.scheduleInterval = setInterval(() => {
      this.runDailyCheck();
    }, this.checkInterval);

    console.log('✅ Agendador automático de graduações iniciado');
  }

  /**
   * Para o agendador automático
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Agendador de graduações não está em execução');
      return;
    }

    this.isRunning = false;
    
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }

    // Cancelar tarefas agendadas
    this.scheduledTasks.forEach(task => {
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
    });
    this.scheduledTasks.clear();

    console.log('⏹️ Agendador automático de graduações parado');
  }

  /**
   * Executa verificação diária para todas as academias
   */
  async runDailyCheck() {
    try {
      console.log('🔍 Executando verificação diária de graduações...');
      
      const academias = await this.getActiveAcademias();
      
      for (const academia of academias) {
        await this.processAcademiaGraduations(academia.id);
      }

      console.log(`✅ Verificação diária concluída para ${academias.length} academias`);
    } catch (error) {
      console.error('❌ Erro na verificação diária:', error);
    }
  }

  /**
   * Processa graduações de uma academia específica
   * @param {string} academiaId - ID da academia
   */
  async processAcademiaGraduations(academiaId) {
    try {
      console.log(`🏫 Processando graduações para academia ${academiaId}...`);
      
      // Executar verificação automática
      await graduationBoardService.runAutomaticGraduationCheck(academiaId);
      
      // Limpeza de notificações expiradas
      await graduationNotificationService.cleanupExpiredNotifications(academiaId);
      
      // Verificar exames próximos (7 dias)
      await this.checkUpcomingExams(academiaId);
      
      console.log(`✅ Processamento concluído para academia ${academiaId}`);
    } catch (error) {
      console.error(`❌ Erro ao processar academia ${academiaId}:`, error);
    }
  }

  /**
   * Verifica exames próximos e envia lembretes
   * @param {string} academiaId - ID da academia
   */
  async checkUpcomingExams(academiaId) {
    try {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const now = new Date();

      const upcomingExams = await firestoreService.query(
        'graduation_exams',
        academiaId,
        [
          { field: 'academiaId', operator: '==', value: academiaId },
          { field: 'date', operator: '>=', value: now },
          { field: 'date', operator: '<=', value: sevenDaysFromNow },
          { field: 'status', operator: '==', value: 'scheduled' }
        ]
      );

      for (const exam of upcomingExams) {
        await this.processUpcomingExam(exam);
      }

      if (upcomingExams.length > 0) {
        console.log(`📅 ${upcomingExams.length} exames próximos processados`);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar exames próximos:', error);
    }
  }

  /**
   * Processa um exame próximo
   * @param {Object} exam - Dados do exame
   */
  async processUpcomingExam(exam) {
    try {
      const examDate = new Date(exam.date);
      const now = new Date();
      const daysUntilExam = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));

      // Verificar se já enviou lembrete para esta data
      const reminderKey = `${exam.id}_${daysUntilExam}d`;
      if (this.hasReminderBeenSent(reminderKey)) {
        return;
      }

      if (daysUntilExam === 7) {
        // Lembrete de 7 dias
        await this.sendExamReminder(exam, 'Uma semana para o exame');
        this.markReminderSent(reminderKey);
      } else if (daysUntilExam === 3) {
        // Lembrete de 3 dias
        await this.sendExamReminder(exam, 'Três dias para o exame');
        this.markReminderSent(reminderKey);
      } else if (daysUntilExam === 1) {
        // Lembrete de 1 dia
        await this.sendExamReminder(exam, 'Exame é amanhã');
        this.markReminderSent(reminderKey);
      }
    } catch (error) {
      console.error('❌ Erro ao processar exame próximo:', error);
    }
  }

  /**
   * Envia lembrete de exame
   * @param {Object} exam - Dados do exame
   * @param {string} messageType - Tipo da mensagem
   */
  async sendExamReminder(exam, messageType) {
    try {
      if (!exam.candidateStudents || exam.candidateStudents.length === 0) {
        return;
      }

      await graduationNotificationService.scheduleExamReminder(
        exam,
        exam.candidateStudents,
        messageType === 'Exame é amanhã' ? 24 : 
        messageType === 'Três dias para o exame' ? 72 : 168
      );

      console.log(`📢 Lembrete enviado: ${messageType} - ${exam.modality}`);
    } catch (error) {
      console.error('❌ Erro ao enviar lembrete de exame:', error);
    }
  }

  /**
   * Verifica se lembrete já foi enviado
   * @param {string} reminderKey - Chave do lembrete
   * @returns {boolean}
   */
  hasReminderBeenSent(reminderKey) {
    const today = new Date().toDateString();
    const key = `${reminderKey}_${today}`;
    return this.scheduledTasks.has(key);
  }

  /**
   * Marca lembrete como enviado
   * @param {string} reminderKey - Chave do lembrete
   */
  markReminderSent(reminderKey) {
    const today = new Date().toDateString();
    const key = `${reminderKey}_${today}`;
    this.scheduledTasks.set(key, {
      sent: true,
      timestamp: new Date()
    });
  }

  /**
   * Busca academias ativas
   * @returns {Array} Lista de academias ativas
   */
  async getActiveAcademias() {
    try {
      const academias = await firestoreService.query(
        'academias',
        null,
        [{ field: 'isActive', operator: '==', value: true }]
      );
      return academias;
    } catch (error) {
      console.error('❌ Erro ao buscar academias:', error);
      return [];
    }
  }

  /**
   * Agenda verificação para uma hora específica
   * @param {string} academiaId - ID da academia
   * @param {Date} scheduledTime - Hora agendada
   */
  scheduleGraduationCheck(academiaId, scheduledTime) {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Se a hora já passou, executar imediatamente
      this.processAcademiaGraduations(academiaId);
      return;
    }

    const taskKey = `${academiaId}_${scheduledTime.getTime()}`;
    
    const timeoutId = setTimeout(async () => {
      await this.processAcademiaGraduations(academiaId);
      this.scheduledTasks.delete(taskKey);
    }, delay);

    this.scheduledTasks.set(taskKey, {
      academiaId,
      scheduledTime,
      timeoutId,
      type: 'graduation_check'
    });

    console.log(`⏰ Verificação agendada para academia ${academiaId} às ${scheduledTime.toLocaleString()}`);
  }

  /**
   * Agenda lembrete de exame
   * @param {Object} exam - Dados do exame
   * @param {number} hoursBeforeExam - Horas antes do exame
   */
  scheduleExamReminder(exam, hoursBeforeExam = 24) {
    const examDate = new Date(exam.date);
    const reminderTime = new Date(examDate.getTime() - (hoursBeforeExam * 60 * 60 * 1000));
    const now = new Date();

    if (reminderTime <= now) {
      return; // Já passou da hora
    }

    const delay = reminderTime.getTime() - now.getTime();
    const taskKey = `exam_reminder_${exam.id}_${hoursBeforeExam}h`;

    const timeoutId = setTimeout(async () => {
      await this.sendExamReminder(exam, `${hoursBeforeExam} horas para o exame`);
      this.scheduledTasks.delete(taskKey);
    }, delay);

    this.scheduledTasks.set(taskKey, {
      examId: exam.id,
      reminderTime,
      timeoutId,
      type: 'exam_reminder'
    });

    console.log(`⏰ Lembrete de exame agendado: ${exam.modality} em ${hoursBeforeExam}h`);
  }

  /**
   * Cancela tarefa agendada
   * @param {string} taskKey - Chave da tarefa
   */
  cancelScheduledTask(taskKey) {
    if (this.scheduledTasks.has(taskKey)) {
      const task = this.scheduledTasks.get(taskKey);
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
      this.scheduledTasks.delete(taskKey);
      console.log(`❌ Tarefa cancelada: ${taskKey}`);
    }
  }

  /**
   * Obtém estatísticas do agendador
   * @returns {Object}
   */
  getSchedulerStats() {
    return {
      isRunning: this.isRunning,
      scheduledTasksCount: this.scheduledTasks.size,
      checkInterval: this.checkInterval,
      nextCheck: this.isRunning ? new Date(Date.now() + this.checkInterval) : null,
      scheduledTasks: Array.from(this.scheduledTasks.entries()).map(([key, task]) => ({
        key,
        type: task.type,
        scheduledTime: task.scheduledTime || task.reminderTime,
        academiaId: task.academiaId,
        examId: task.examId
      }))
    };
  }

  /**
   * Atualiza intervalo de verificação
   * @param {number} intervalMs - Novo intervalo em millisegundos
   */
  updateCheckInterval(intervalMs) {
    this.checkInterval = intervalMs;
    
    if (this.isRunning) {
      // Reiniciar com novo intervalo
      this.stop();
      this.start();
    }
    
    console.log(`🔄 Intervalo de verificação atualizado para ${intervalMs / (1000 * 60 * 60)} horas`);
  }

  /**
   * Executa verificação manual para todas as academias
   */
  async runManualCheck() {
    console.log('🔍 Executando verificação manual...');
    await this.runDailyCheck();
  }

  /**
   * Limpa cache e tarefas antigas
   */
  cleanup() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Remover tarefas antigas do cache
    this.scheduledTasks.forEach((task, key) => {
      if (task.timestamp && task.timestamp < oneDayAgo) {
        this.scheduledTasks.delete(key);
      }
    });

    console.log('🧹 Limpeza de cache concluída');
  }
}

export default new GraduationSchedulerService();