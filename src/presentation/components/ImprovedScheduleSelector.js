import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Chip, Portal, Modal, Divider } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '@contexts/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { 
  createEmptySchedule, 
  DAY_NAMES, 
  generateTimeSlots,
  scheduleToDisplayString,
  isValidSchedule 
} from '@utils/scheduleUtils';

/**
 * Seletor de horários melhorado que combina:
 * 1. Seleção tradicional por dias da semana (compatível com sistema atual)
 * 2. Visualização de calendário para preview
 * 3. Interface mais intuitiva
 */
const ImprovedScheduleSelector = ({
  value = null,
  onScheduleChange,
  duration = 60,
  timezone = getString('timezone'),
  startHour = 6,
  endHour = 22,
  interval = 60,
  style,
  disabled = false,
  required = false,
  label = getString('classSchedules'),
  enableConflictValidation = true,
  instructorId,
  excludeClassId
}) => {
  const { colors } = useTheme();
  const [schedule, setSchedule] = useState(value || createEmptySchedule());
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Gerar slots de tempo disponíveis
  const availableSlots = useMemo(() => 
    generateTimeSlots(startHour, endHour, interval), 
    [startHour, endHour, interval]
  );

  // Atualizar schedule quando value mudar
  React.useEffect(() => {
    if (value && isValidSchedule(value)) {
      setSchedule(value);
    }
  }, [value]);

  // Notificar mudanças
  React.useEffect(() => {
    const hasScheduleData = Object.values(schedule.hours).some(hours => hours.length > 0);
    if (hasScheduleData && onScheduleChange) {
      onScheduleChange({
        ...schedule,
        duration,
        timezone
      });
    }
  }, [schedule, duration, timezone]);

  // Alternar horário para o dia selecionado
  const toggleTimeSlot = useCallback((time) => {
    if (!selectedDay) return;

    const newSchedule = { ...schedule };
    const dayHours = [...newSchedule.hours[selectedDay]];
    
    const timeIndex = dayHours.indexOf(time);
    if (timeIndex >= 0) {
      dayHours.splice(timeIndex, 1);
    } else {
      dayHours.push(time);
      dayHours.sort();
    }
    
    newSchedule.hours[selectedDay] = dayHours;
    setSchedule(newSchedule);
  }, [selectedDay, schedule]);

  // Gerar datas marcadas para preview
  const markedDates = useMemo(() => {
    const marked = {};
    const today = new Date();
    
    // Marcar próximas 4 semanas baseado no schedule
    for (let week = 0; week < 4; week++) {
      Object.entries(schedule.hours).forEach(([dayKey, hours]) => {
        if (hours.length > 0) {
          const dayIndex = {
            sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
            thursday: 4, friday: 5, saturday: 6
          }[dayKey];
          
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + (week * 7) + (dayIndex - today.getDay()));
          
          const dateString = targetDate.toISOString().split('T')[0];
          marked[dateString] = {
            marked: true,
            dotColor: colors?.primary || '#6200ea',
            selectedColor: colors?.primary || '#6200ea',
            customStyles: {
              container: {
                backgroundColor: hours.length > 1 ? colors?.primary : colors?.primaryContainer,
                borderRadius: BORDER_RADIUS.md
              },
              text: {
                color: hours.length > 1 ? colors?.onPrimary : colors?.onPrimaryContainer,
                fontWeight: FONT_WEIGHT.bold
              }
            }
          };
        }
      });
    }
    
    return marked;
  }, [schedule, colors]);

  // Renderizar card de dia da semana
  const renderDayCard = (dayKey) => {
    const dayHours = schedule.hours[dayKey] || [];
    const hasHours = dayHours.length > 0;
    
    return (
      <Card
        key={dayKey}
        style={[
          styles.dayCard,
          { backgroundColor: colors?.surface },
          hasHours && { backgroundColor: (colors?.primary || '#6200ea') + '20' }
        ]}
        onPress={() => {
          setSelectedDay(dayKey);
          setModalVisible(true);
        }}
      >
        <Card.Content style={styles.dayCardContent}>
          <Text style={[
            styles.dayName, 
            hasHours && { color: colors?.primary || '#6200ea' }
          ]}>
            {DAY_NAMES[dayKey]}
          </Text>
          
          {hasHours ? (
            <View style={styles.hoursContainer}>
              {dayHours.map(hour => (
                <Chip
                  key={hour}
                  compact
                  style={[styles.hourChip, { backgroundColor: colors?.primary || '#6200ea' }]}
                  textStyle={{ color: colors?.onPrimary || getString('colorWhite'), fontSize: 10 }}
                >
                  {hour}
                </Chip>
              ))}
            </View>
          ) : (
            <Text style={[
              styles.noHours, 
              { color: colors?.onSurfaceVariant || getString('textSecondary') }
            ]}>
              Toque para definir
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: colors?.onSurface }]}>
        {label}
        {required && <Text style={{ color: colors?.error || 'currentTheme.error[500]' }}> *</Text>}
      </Text>

      {/* Botões de ação */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => setPreviewVisible(true)}
          icon="calendar"
          style={styles.actionButton}
        >
          Visualizar
        </Button>
        
        <Button
          mode="contained-tonal"
          onPress={() => {
            const hasAnySchedule = Object.values(schedule.hours).some(hours => hours.length > 0);
            if (hasAnySchedule) {
              // Mostrar resumo
              alert(scheduleToDisplayString(schedule));
            } else {
              // Abrir primeira configuração
              setSelectedDay('monday');
              setModalVisible(true);
            }
          }}
          icon="clock-outline"
          style={styles.actionButton}
        >
          Resumo
        </Button>
      </View>

      {/* Cards dos dias da semana */}
      <ScrollView style={styles.daysContainer} showsVerticalScrollIndicator={false}>
        {Object.keys(DAY_NAMES).map(renderDayCard)}
      </ScrollView>

      {/* Modal de Preview do Calendário */}
      <Portal>
        <Modal
          visible={previewVisible}
          onDismiss={() => setPreviewVisible(false)}
          contentContainerStyle={[styles.previewModal, { backgroundColor: colors?.surface }]}
        >
          <Text style={[styles.modalTitle, { color: colors?.onSurface }]}>
            Preview do Cronograma
          </Text>
          
          <Calendar
            markedDates={markedDates}
            theme={{
              backgroundColor: colors?.surface,
              calendarBackground: colors?.surface,
              textSectionTitleColor: colors?.onSurface,
              selectedDayBackgroundColor: colors?.primary,
              selectedDayTextColor: colors?.onPrimary,
              todayTextColor: colors?.primary,
              dayTextColor: colors?.onSurface,
              textDisabledColor: colors?.onSurfaceVariant,
              arrowColor: colors?.primary,
              monthTextColor: colors?.onSurface
            }}
            style={styles.calendar}
          />
          
          <Text style={[styles.previewDescription, { color: colors?.onSurfaceVariant }]}>
            As datas marcadas mostram quando as aulas acontecerão nas próximas 4 semanas
          </Text>
          
          <Button
            mode="contained"
            onPress={() => setPreviewVisible(false)}
            style={styles.closeButton}
          >
            Fechar
          </Button>
        </Modal>
      </Portal>

      {/* Modal de Seleção de Horários */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.timeModal, { backgroundColor: colors?.surface }]}
        >
          <Text style={[styles.modalTitle, { color: colors?.onSurface }]}>
            {selectedDay ? DAY_NAMES[selectedDay] : 'Selecionar Horários'}
          </Text>
          
          <Divider style={{ marginVertical: 16 }} />
          
          <ScrollView style={styles.timeSlotsContainer}>
            <View style={styles.timeSlotsGrid}>
              {availableSlots.map((time) => {
                const isSelected = selectedDay && schedule.hours[selectedDay].includes(time);
                return (
                  <Chip
                    key={time}
                    selected={isSelected}
                    onPress={() => toggleTimeSlot(time)}
                    style={[
                      styles.timeSlot,
                      isSelected && { backgroundColor: colors?.primary }
                    ]}
                    textStyle={{
                      color: isSelected ? colors?.onPrimary : colors?.onSurface
                    }}
                  >
                    {time}
                  </Chip>
                );
              })}
            </View>
          </ScrollView>
          
          <Button
            mode="contained"
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          >
            Confirmar
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.md
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  actionButton: {
    flex: 1
  },
  daysContainer: {
    maxHeight: 400
  },
  dayCard: {
    marginBottom: SPACING.sm,
    elevation: 2
  },
  dayCardContent: {
    paddingVertical: SPACING.md
  },
  dayName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm
  },
  hoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  hourChip: {
    height: 28,
    marginBottom: SPACING.xs
  },
  noHours: {
    fontSize: FONT_SIZE.sm,
    fontStyle: 'italic'
  },
  previewModal: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    maxHeight: '80%'
  },
  timeModal: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    maxHeight: '70%'
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
    marginBottom: SPACING.sm
  },
  calendar: {
    marginVertical: 16
  },
  previewDescription: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic'
  },
  timeSlotsContainer: {
    maxHeight: 300,
    marginBottom: 16
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  timeSlot: {
    marginBottom: SPACING.xs
  },
  closeButton: {
    marginTop: SPACING.sm
  }
});

export default ImprovedScheduleSelector;
