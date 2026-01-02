/**
 * Validador de conflitos de horários para turmas
 */

import { useState, useCallback } from 'react';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { isValidSchedule, hasScheduleConflict } from './scheduleUtils';

/**
 * Verifica conflitos de horário para uma nova turma
 */
export const validateScheduleConflicts = async (schedule, academiaId, excludeClassId = null) => {
  try {
    if (!isValidSchedule(schedule)) {
      return {
        hasConflict: false,
        conflicts: [],
        error: 'Schedule inválido'
      };
    }

    // Buscar todas as turmas ativas da academia
    const existingClasses = await academyFirestoreService.getAll('classes', academiaId);
    
    const conflicts = [];
    
    for (const existingClass of existingClasses) {
      // Pular a própria turma se estiver editando
      if (excludeClassId && existingClass.id === excludeClassId) {
        continue;
      }
      
      // Pular turmas inativas
      if (existingClass.status !== 'active') {
        continue;
      }
      
      // Verificar se tem schedule válido
      if (!existingClass.schedule || !isValidSchedule(existingClass.schedule)) {
        continue;
      }
      
      // Verificar conflito
      if (hasScheduleConflict(schedule, existingClass.schedule)) {
        conflicts.push({
          classId: existingClass.id,
          className: existingClass.name,
          instructorName: existingClass.instructorName,
          modality: existingClass.modality,
          schedule: existingClass.schedule,
          conflictingDays: getConflictingDays(schedule, existingClass.schedule)
        });
      }
    }
    
    return {
      hasConflict: conflicts.length > 0,
      conflicts,
      error: null
    };
    
  } catch (error) {
    console.error('Erro ao validar conflitos de horário:', error);
    return {
      hasConflict: false,
      conflicts: [],
      error: error.message
    };
  }
};

/**
 * Verifica conflitos de horário para um instrutor específico
 */
export const validateInstructorScheduleConflicts = async (schedule, instructorId, academiaId, excludeClassId = null) => {
  try {
    if (!isValidSchedule(schedule) || !instructorId) {
      return {
        hasConflict: false,
        conflicts: [],
        error: 'Parâmetros inválidos'
      };
    }

    // Buscar turmas do instrutor
    const instructorClasses = await academyFirestoreService.getWhere(
      'classes',
      [
        { field: 'instructorId', operator: '==', value: instructorId },
        { field: 'status', operator: '==', value: 'active' }
      ],
      academiaId
    );
    
    const conflicts = [];
    
    for (const existingClass of instructorClasses) {
      // Pular a própria turma se estiver editando
      if (excludeClassId && existingClass.id === excludeClassId) {
        continue;
      }
      
      // Verificar se tem schedule válido
      if (!existingClass.schedule || !isValidSchedule(existingClass.schedule)) {
        continue;
      }
      
      // Verificar conflito
      if (hasScheduleConflict(schedule, existingClass.schedule)) {
        conflicts.push({
          classId: existingClass.id,
          className: existingClass.name,
          modality: existingClass.modality,
          schedule: existingClass.schedule,
          conflictingDays: getConflictingDays(schedule, existingClass.schedule)
        });
      }
    }
    
    return {
      hasConflict: conflicts.length > 0,
      conflicts,
      error: null
    };
    
  } catch (error) {
    console.error('Erro ao validar conflitos do instrutor:', error);
    return {
      hasConflict: false,
      conflicts: [],
      error: error.message
    };
  }
};

/**
 * Identifica quais dias têm conflito entre dois schedules
 */
export const getConflictingDays = (schedule1, schedule2) => {
  const conflictingDays = [];
  
  Object.keys(schedule1.hours).forEach(day => {
    const hours1 = schedule1.hours[day];
    const hours2 = schedule2.hours[day];
    
    const conflictingHours = hours1.filter(hour => hours2.includes(hour));
    
    if (conflictingHours.length > 0) {
      conflictingDays.push({
        day,
        conflictingHours
      });
    }
  });
  
  return conflictingDays;
};

/**
 * Formata mensagem de conflito para exibição
 */
export const formatConflictMessage = (conflicts) => {
  if (conflicts.length === 0) return '';
  
  if (conflicts.length === 1) {
    const conflict = conflicts[0];
    const days = conflict.conflictingDays.map(d => d.day).join(', ');
    return `Conflito detectado com a turma "${conflict.className}" (${conflict.modality}) nos dias: ${days}`;
  }
  
  return `${conflicts.length} conflitos detectados com outras turmas. Verifique os horários.`;
};

/**
 * Hook para validação de conflitos em tempo real
 */
export const useScheduleConflictValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  
  const validateConflicts = useCallback(async (schedule, academiaId, instructorId = null, excludeClassId = null) => {
    setIsValidating(true);
    
    try {
      let result;
      
      if (instructorId) {
        // Validar conflitos específicos do instrutor
        result = await validateInstructorScheduleConflicts(schedule, instructorId, academiaId, excludeClassId);
      } else {
        // Validar conflitos gerais
        result = await validateScheduleConflicts(schedule, academiaId, excludeClassId);
      }
      
      setConflicts(result.conflicts);
      return result;
      
    } finally {
      setIsValidating(false);
    }
  }, []);
  
  return {
    validateConflicts,
    isValidating,
    conflicts,
    hasConflicts: conflicts.length > 0
  };
};

export default {
  validateScheduleConflicts,
  validateInstructorScheduleConflicts,
  getConflictingDays,
  formatConflictMessage,
  useScheduleConflictValidator
};
