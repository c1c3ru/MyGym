/**
 * Serviço de notificações para mudanças de horário
 */

import { useState, useCallback } from 'react';
import { notificationService } from '@infrastructure/services/notificationService';
import { academyFirestoreService } from '@services/academyFirestoreService';
import { scheduleToDisplayString } from '@utils/scheduleUtils';

/**
 * Envia notificações quando horários de turma são alterados
 */
export const notifyScheduleChange = async (classData, oldSchedule, newSchedule, academiaId) => {
  try {
    console.log('📅 Enviando notificações de mudança de horário...');

    // Buscar alunos da turma
    const students = await academyFirestoreService.getWhere(
      'students',
      [{ field: 'classIds', operator: 'array-contains', value: classData.id }],
      academiaId
    );

    // Buscar instrutor
    let instructor = null;
    if (classData.instructorId) {
      try {
        instructor = await academyFirestoreService.getById('instructors', classData.instructorId, academiaId);
      } catch (error) {
        console.warn('Instrutor não encontrado na subcoleção, buscando em users...');
      }
    }

    // Preparar dados da notificação
    const oldScheduleText = scheduleToDisplayString(oldSchedule);
    const newScheduleText = scheduleToDisplayString(newSchedule);

    const notificationData = {
      type: 'schedule_change',
      title: 'Mudança de Horário',
      body: `A turma "${classData.name}" teve seus horários alterados`,
      data: {
        classId: classData.id,
        className: classData.name,
        modality: classData.modality,
        oldSchedule: oldScheduleText,
        newSchedule: newScheduleText,
        instructorName: classData.instructorName,
        academiaId
      },
      priority: 'high',
      category: 'schedule'
    };

    // Notificar alunos
    const studentNotifications = students.map(async (student) => {
      if (student.userId) {
        await notificationService.sendToUser(student.userId, {
          ...notificationData,
          body: `Atenção! Os horários da sua turma "${classData.name}" foram alterados.`,
          data: {
            ...notificationData.data,
            studentId: student.id,
            userType: 'student'
          }
        });
      }
    });

    // Notificar instrutor (se não for ele mesmo que fez a mudança)
    if (instructor && instructor.userId) {
      await notificationService.sendToUser(instructor.userId, {
        ...notificationData,
        body: `Os horários da turma "${classData.name}" que você leciona foram alterados.`,
        data: {
          ...notificationData.data,
          instructorId: instructor.id,
          userType: 'instructor'
        }
      });
    }

    // Executar todas as notificações
    await Promise.all(studentNotifications);

    // Salvar no histórico de notificações
    await saveScheduleChangeHistory(classData, oldSchedule, newSchedule, academiaId);

    console.log(`✅ Notificações enviadas para ${students.length} alunos${instructor ? ' e 1 instrutor' : ''}`);

    return {
      success: true,
      studentsNotified: students.length,
      instructorNotified: !!instructor
    };

  } catch (error) {
    console.error('❌ Erro ao enviar notificações de mudança de horário:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Envia notificações quando uma turma é cancelada
 */
export const notifyClassCancellation = async (classData, reason, academiaId) => {
  try {
    console.log('🚫 Enviando notificações de cancelamento de turma...');

    // Buscar alunos da turma
    const students = await academyFirestoreService.getWhere(
      'students',
      [{ field: 'classIds', operator: 'array-contains', value: classData.id }],
      academiaId
    );

    const notificationData = {
      type: 'class_cancelled',
      title: 'Turma Cancelada',
      body: `A turma "${classData.name}" foi cancelada`,
      data: {
        classId: classData.id,
        className: classData.name,
        modality: classData.modality,
        reason: reason || 'Não informado',
        academiaId
      },
      priority: 'high',
      category: 'cancellation'
    };

    // Notificar alunos
    const notifications = students.map(async (student) => {
      if (student.userId) {
        await notificationService.sendToUser(student.userId, {
          ...notificationData,
          body: `Importante: A turma "${classData.name}" foi cancelada. ${reason ? `Motivo: ${reason}` : ''}`,
          data: {
            ...notificationData.data,
            studentId: student.id,
            userType: 'student'
          }
        });
      }
    });

    await Promise.all(notifications);

    console.log(`✅ Notificações de cancelamento enviadas para ${students.length} alunos`);

    return {
      success: true,
      studentsNotified: students.length
    };

  } catch (error) {
    console.error('❌ Erro ao enviar notificações de cancelamento:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Envia notificações quando uma nova turma é criada
 */
export const notifyNewClass = async (classData, academiaId) => {
  try {
    console.log('🆕 Enviando notificações de nova turma...');

    // Buscar todos os usuários da academia (para notificar sobre nova turma disponível)
    const users = await academyFirestoreService.getAll('users', academiaId);

    const scheduleText = scheduleToDisplayString(classData.schedule);

    const notificationData = {
      type: 'new_class',
      title: 'Nova Turma Disponível',
      body: `Nova turma de ${classData.modality} disponível: "${classData.name}"`,
      data: {
        classId: classData.id,
        className: classData.name,
        modality: classData.modality,
        schedule: scheduleText,
        instructorName: classData.instructorName,
        ageCategory: classData.ageCategory,
        academiaId
      },
      priority: 'normal',
      category: 'new_class'
    };

    // Filtrar apenas estudantes (não notificar admins/instrutores sobre novas turmas)
    const students = users.filter(user => user.role === 'student');

    const notifications = students.map(async (student) => {
      await notificationService.sendToUser(student.id, {
        ...notificationData,
        data: {
          ...notificationData.data,
          userType: 'student'
        }
      });
    });

    await Promise.all(notifications);

    console.log(`✅ Notificações de nova turma enviadas para ${students.length} estudantes`);

    return {
      success: true,
      studentsNotified: students.length
    };

  } catch (error) {
    console.error('❌ Erro ao enviar notificações de nova turma:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Salva histórico de mudanças de horário
 */
const saveScheduleChangeHistory = async (classData, oldSchedule, newSchedule, academiaId) => {
  try {
    const historyData = {
      classId: classData.id,
      className: classData.name,
      modality: classData.modality,
      oldSchedule,
      newSchedule,
      oldScheduleText: scheduleToDisplayString(oldSchedule),
      newScheduleText: scheduleToDisplayString(newSchedule),
      changedAt: new Date(),
      changedBy: classData.updatedBy || 'system',
      academiaId
    };

    await academyFirestoreService.create('schedule_changes', historyData, academiaId);
    console.log('📝 Histórico de mudança de horário salvo');

  } catch (error) {
    console.error('❌ Erro ao salvar histórico de mudança:', error);
  }
};

/**
 * Hook para usar notificações de horário
 */
export const useScheduleNotifications = () => {
  const [isSending, setIsSending] = useState(false);

  const handleScheduleChange = useCallback(async (classData, oldSchedule, newSchedule, academiaId) => {
    setIsSending(true);
    try {
      const result = await notifyScheduleChange(classData, oldSchedule, newSchedule, academiaId);
      return result;
    } finally {
      setIsSending(false);
    }
  }, []);

  const handleClassCancellation = useCallback(async (classData, reason, academiaId) => {
    setIsSending(true);
    try {
      const result = await notifyClassCancellation(classData, reason, academiaId);
      return result;
    } finally {
      setIsSending(false);
    }
  }, []);

  const handleNewClass = useCallback(async (classData, academiaId) => {
    setIsSending(true);
    try {
      const result = await notifyNewClass(classData, academiaId);
      return result;
    } finally {
      setIsSending(false);
    }
  }, []);

  return {
    notifyScheduleChange: handleScheduleChange,
    notifyClassCancellation: handleClassCancellation,
    notifyNewClass: handleNewClass,
    isSending
  };
};

export default {
  notifyScheduleChange,
  notifyClassCancellation,
  notifyNewClass,
  useScheduleNotifications
};
