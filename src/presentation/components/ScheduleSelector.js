import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Button, Portal, Modal, List, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthProvider';
import {
  createEmptySchedule,
  DAY_NAMES,
  DAY_NAMES_SHORT,
  generateTimeSlots,
  scheduleToDisplayString,
  isValidSchedule
} from '@utils/scheduleUtils';
import { useScheduleConflictValidator } from '@utils/scheduleConflictValidator';
import ConflictWarning from './ConflictWarning';

const ScheduleSelector = ({
  value = null,
  onScheduleChange,
  duration = 60,
  timezone = 'America/Fortaleza',
  startHour = 6,
  endHour = 22,
  interval = 60,
  style,
  disabled = false,
  required = false,
  label = 'Horários da Turma',
  // Validação de conflitos
  enableConflictValidation = false,
  instructorId = null,
  excludeClassId = null,
  onConflictDetected = null
}) => {
  const { colors, getString } = useTheme();
  const { userProfile } = useAuth();
  const [schedule, setSchedule] = useState(() => 
    value && isValidSchedule(value) ? value : createEmptySchedule()
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [availableSlots] = useState(() => generateTimeSlots(startHour, endHour, interval));
  
  // Validação de conflitos
  const { validateConflicts, isValidating, conflicts, hasConflicts } = useScheduleConflictValidator();

  // Atualizar schedule quando value mudar
  useEffect(() => {
    if (value && isValidSchedule(value)) {
      setSchedule(value);
    }
  }, [value]);

  // Notificar mudanças (sem incluir onScheduleChange nas dependências para evitar loops)
  useEffect(() => {
    // Só notifica se houve mudança real no schedule e se onScheduleChange existe
    const hasScheduleData = Object.values(schedule.hours).some(hours => hours.length > 0);
    if (hasScheduleData && onScheduleChange) {
      onScheduleChange({
        ...schedule,
        duration,
        timezone
      });
    }
  }, [schedule, duration, timezone]); // Removido onScheduleChange das dependências

  // Validar conflitos quando schedule mudar
  useEffect(() => {
    if (enableConflictValidation && userProfile?.academiaId && Object.values(schedule.hours).some(hours => hours.length > 0)) {
      const timeoutId = setTimeout(() => {
        validateConflicts(schedule, userProfile.academiaId, instructorId, excludeClassId);
      }, 500); // Debounce de 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [schedule, enableConflictValidation, userProfile?.academiaId, instructorId, excludeClassId, validateConflicts]);

  // Notificar conflitos detectados
  useEffect(() => {
    if (onConflictDetected && enableConflictValidation) {
      onConflictDetected(conflicts, hasConflicts);
    }
  }, [conflicts, hasConflicts, onConflictDetected, enableConflictValidation]);

  const handleDayPress = (dayKey) => {
    setSelectedDay(dayKey);
    setModalVisible(true);
  };

  const handleTimeToggle = (time) => {
    if (!selectedDay) return;

    const newSchedule = { ...schedule };
    const dayHours = [...newSchedule.hours[selectedDay]];
    
    if (dayHours.includes(time)) {
      // Remover horário
      const index = dayHours.indexOf(time);
      dayHours.splice(index, 1);
    } else {
      // Adicionar horário
      dayHours.push(time);
      dayHours.sort();
    }
    
    newSchedule.hours[selectedDay] = dayHours;
    setSchedule(newSchedule);
  };

  const clearDay = (dayKey) => {
    const newSchedule = { ...schedule };
    newSchedule.hours[dayKey] = [];
    setSchedule(newSchedule);
  };

  const clearAllSchedule = () => {
    setSchedule(createEmptySchedule());
  };

  const hasAnySchedule = () => {
    return Object.values(schedule.hours).some(hours => hours.length > 0);
  };

  const getDayScheduleText = (dayKey) => {
    const hours = schedule.hours[dayKey];
    if (hours.length === 0) return 'Não selecionado';
    
    if (hours.length === 1) {
      return `${hours[0]} (${duration}min)`;
    }
    
    // Agrupar horários consecutivos
    const groups = [];
    let currentGroup = [hours[0]];
    
    for (let i = 1; i < hours.length; i++) {
      const prevHour = parseInt(hours[i - 1].split(':')[0]);
      const currentHour = parseInt(hours[i].split(':')[0]);
      
      if (currentHour === prevHour + 1) {
        currentGroup.push(hours[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [hours[i]];
      }
    }
    groups.push(currentGroup);
    
    return groups.map(group => {
      if (group.length === 1) {
        return `${group[0]} (${duration}min)`;
      } else {
        const start = group[0];
        const end = group[group.length - 1];
        const totalDuration = group.length * duration;
        return `${start} às ${end} (${totalDuration}min)`;
      }
    }).join(', ');
  };

  const renderDayCard = (dayKey) => {
    const dayName = DAY_NAMES[dayKey];
    const shortName = DAY_NAMES_SHORT[dayKey];
    const hasHours = schedule.hours[dayKey].length > 0;
    
    return (
      <Card
        key={dayKey}
        style={[
          styles.dayCard,
          hasHours && { backgroundColor: (colors?.primary || '#6200ea') + '20' }
        ]}
        onPress={() => !disabled && handleDayPress(dayKey)}
        disabled={disabled}
      >
        <Card.Content style={styles.dayCardContent}>
          <View style={styles.dayHeader}>
            <Text style={[styles.dayName, hasHours && { color: colors?.primary || '#6200ea' }]}>
              {shortName}
            </Text>
            {hasHours && (
              <Chip
                mode="flat"
                compact
                style={[styles.hourChip, { backgroundColor: colors?.primary || '#6200ea' }]}
                textStyle={{ color: colors?.onPrimary || '#ffffff', fontSize: 10 }}
              >
                {schedule.hours[dayKey].length}h
              </Chip>
            )}
          </View>
          <Text style={[
            styles.daySchedule,
            hasHours ? { color: colors?.primary || '#6200ea' } : { color: colors?.onSurfaceVariant || '#666666' }
          ]}>
            {getDayScheduleText(dayKey)}
          </Text>
          {hasHours && !disabled && (
            <Button
              mode="text"
              compact
              onPress={(e) => {
                e.stopPropagation();
                clearDay(dayKey);
              }}
              style={styles.clearButton}
            >
              Limpar
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: colors?.error || '#f44336' }}> *</Text>}
        </Text>
        {hasAnySchedule() && !disabled && (
          <Button
            mode="text"
            compact
            onPress={clearAllSchedule}
            textColor={colors?.error || '#f44336'}
          >
            Limpar Tudo
          </Button>
        )}
      </View>

      {/* Resumo */}
      {hasAnySchedule() && (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Resumo dos Horários</Text>
            <Text style={styles.summaryText}>
              {scheduleToDisplayString({ ...schedule, duration, timezone })}
            </Text>
            {isValidating && (
              <Text style={[styles.validatingText, { color: colors?.primary || '#6200ea' }]}>
                🔍 Verificando conflitos...
              </Text>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Aviso de Conflitos */}
      {enableConflictValidation && (
        <ConflictWarning
          conflicts={conflicts}
          visible={hasConflicts && !isValidating}
          onDismiss={() => {/* Conflitos são informativos, não dismissíveis */}}
        />
      )}

      {/* Dias da Semana */}
      <ScrollView style={styles.daysContainer} showsVerticalScrollIndicator={false}>
        {Object.keys(DAY_NAMES).map(renderDayCard)}
      </ScrollView>

      {/* Modal de Seleção de Horários */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: colors?.surface || '#ffffff' }]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedDay ? DAY_NAMES[selectedDay] : ''}
            </Text>
            <Button
              mode="text"
              onPress={() => setModalVisible(false)}
            >
              Fechar
            </Button>
          </View>
          
          <Divider />
          
          <ScrollView style={styles.timeSlotsContainer}>
            {availableSlots.map((time) => {
              const isSelected = selectedDay && schedule.hours[selectedDay].includes(time);
              
              return (
                <List.Item
                  key={time}
                  title={`${time} - ${time.split(':')[0]}:${String(parseInt(time.split(':')[0]) + 1).padStart(2, '0')}:00`}
                  description={`Duração: ${duration} minutos`}
                  left={(props) => (
                    <Ionicons
                      {...props}
                      name={isSelected ? 'checkmark-circle' : 'time-outline'}
                      size={24}
                      color={isSelected ? (colors?.primary || '#6200ea') : (colors?.onSurfaceVariant || '#666666')}
                    />
                  )}
                  onPress={() => handleTimeToggle(time)}
                  style={[
                    styles.timeSlot,
                    isSelected && { backgroundColor: (colors?.primary || '#6200ea') + '10' }
                  ]}
                />
              );
            })}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  validatingText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  daysContainer: {
    maxHeight: 400,
  },
  dayCard: {
    marginBottom: 8,
    elevation: 2,
  },
  dayCardContent: {
    paddingVertical: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
  },
  hourChip: {
    height: 24,
  },
  daySchedule: {
    fontSize: 14,
    marginBottom: 8,
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  modal: {
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  timeSlotsContainer: {
    maxHeight: 400,
  },
  timeSlot: {
    paddingHorizontal: 16,
  },
});

export default ScheduleSelector;
