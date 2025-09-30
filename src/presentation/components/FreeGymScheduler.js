import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Text, Button, Chip, FAB, Portal, Modal } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthProvider';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { academyFirestoreService } from '@services/academyFirestoreService';
import { DAY_NAMES } from '@utils/scheduleUtils';

const { width } = Dimensions.get('window');

/**
 * Scheduler GRATUITO específico para academias
 * Funcionalidades:
 * - Eventos recorrentes (turmas semanais)
 * - Visualização mensal/semanal
 * - Detecção de conflitos
 * - Gestão de instrutores
 * - Cores por modalidade
 */
const FreeGymScheduler = ({
  classes = [],
  onClassPress,
  onDatePress,
  onCreateClass,
  navigation
}) => {
  const { colors, getString } = useTheme();
  const { user, userProfile, academia } = useAuth();
  const { role, isAdmin, isInstructor, isStudent } = useCustomClaims();
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [filterInstructor, setFilterInstructor] = useState(null);
  const [filterModality, setFilterModality] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [modalities, setModalities] = useState([]);

  // Cores por modalidade (adaptado para seu sistema)
  const modalityColors = {
    'karate': '#FF5722',
    'karatê': '#FF5722',
    'jiu-jitsu': '#9C27B0',
    'jiu jitsu': '#9C27B0',
    'muay-thai': '#F44336',
    'muay thai': '#F44336',
    'judo': '#3F51B5',
    'judô': '#3F51B5',
    'taekwondo': '#FF9800',
    'boxe': '#795548',
    'default': '#607D8B'
  };

  // Carregar dados da academia
  useEffect(() => {
    const loadAcademyData = async () => {
      try {
        const academiaId = userProfile?.academiaId || academia?.id;
        if (!academiaId) return;

        // Carregar instrutores
        const instructorsData = await academyFirestoreService.getAll('users', academiaId);
        const instructorsList = instructorsData.filter(user => 
          user.userType === 'instructor' || user.role === 'instructor'
        );
        setInstructors(instructorsList);

        // Carregar modalidades das turmas existentes
        const modalitiesSet = new Set();
        classes.forEach(cls => {
          if (cls.modality) {
            modalitiesSet.add(cls.modality);
          }
        });
        setModalities(Array.from(modalitiesSet));

      } catch (error) {
        console.error('Erro ao carregar dados da academia:', error);
      }
    };

    loadAcademyData();
  }, [userProfile?.academiaId, academia?.id, classes]);

  // Gerar eventos recorrentes adaptado para sua estrutura
  const generateRecurringEvents = useCallback((classData) => {
    const events = {};
    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());

    // Verificar se a turma tem schedule definido
    if (!classData.schedule || !classData.schedule.hours) {
      return events;
    }

    Object.entries(classData.schedule.hours).forEach(([day, hours]) => {
      if (!Array.isArray(hours) || hours.length === 0) return;

      const dayIndex = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
        domingo: 0, segunda: 1, terça: 2, quarta: 3,
        quinta: 4, sexta: 5, sábado: 6
      }[day.toLowerCase()];

      // Gerar eventos para próximas 12 semanas
      for (let week = 0; week < 12; week++) {
        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + (week * 7) + (dayIndex - today.getDay()));

        if (eventDate <= endDate && eventDate >= today) {
          const dateString = eventDate.toISOString().split('T')[0];

          hours.forEach(time => {
            const eventId = `${classData.id}-${dateString}-${time}`;
            
            if (!events[dateString]) events[dateString] = [];
            
            events[dateString].push({
              id: eventId,
              classId: classData.id,
              title: classData.name,
              time: time,
              duration: classData.schedule?.duration || 60,
              instructor: classData.instructorName || 'Instrutor não definido',
              instructorId: classData.instructorId,
              modality: classData.modality || 'Modalidade não definida',
              maxStudents: classData.maxStudents || 0,
              enrolledStudents: classData.students?.length || 0,
              color: modalityColors[classData.modality?.toLowerCase()] || modalityColors.default,
              date: dateString,
              ageCategory: classData.ageCategory,
              status: classData.status
            });
          });
        }
      }
    });

    return events;
  }, [modalityColors]);

  // Gerar todos os eventos de todas as turmas
  const allEvents = useMemo(() => {
    let events = {};
    
    classes.forEach(classData => {
      const classEvents = generateRecurringEvents(classData);
      
      Object.entries(classEvents).forEach(([date, dayEvents]) => {
        if (!events[date]) events[date] = [];
        events[date].push(...dayEvents);
      });
    });

    // Aplicar filtros
    if (filterInstructor || filterModality) {
      Object.keys(events).forEach(date => {
        events[date] = events[date].filter(event => {
          const matchInstructor = !filterInstructor || event.instructorId === filterInstructor;
          const matchModality = !filterModality || event.modality === filterModality;
          return matchInstructor && matchModality;
        });
        
        if (events[date].length === 0) {
          delete events[date];
        }
      });
    }

    return events;
  }, [classes, generateRecurringEvents, filterInstructor, filterModality]);

  // Marcar datas no calendário
  const markedDates = useMemo(() => {
    const marked = {};

    Object.entries(allEvents).forEach(([date, events]) => {
      const eventCount = events.length;
      const hasMultipleEvents = eventCount > 1;
      const primaryColor = events[0]?.color || colors?.primary;

      marked[date] = {
        marked: true,
        dotColor: primaryColor,
        selectedColor: primaryColor,
        customStyles: {
          container: {
            backgroundColor: hasMultipleEvents ? primaryColor : `${primaryColor}20`,
            borderRadius: 8,
            borderWidth: hasMultipleEvents ? 2 : 1,
            borderColor: primaryColor
          },
          text: {
            color: hasMultipleEvents ? '#ffffff' : primaryColor,
            fontWeight: hasMultipleEvents ? 'bold' : 'normal'
          }
        }
      };
    });

    return marked;
  }, [allEvents, colors]);

  // Detectar conflitos de horário
  const getConflicts = useCallback((date) => {
    const dayEvents = allEvents[date] || [];
    const conflicts = [];

    for (let i = 0; i < dayEvents.length; i++) {
      for (let j = i + 1; j < dayEvents.length; j++) {
        const event1 = dayEvents[i];
        const event2 = dayEvents[j];

        // Mesmo instrutor no mesmo horário = conflito
        if (event1.instructorId === event2.instructorId && event1.time === event2.time) {
          conflicts.push({ event1, event2, type: 'instructor' });
        }
      }
    }

    return conflicts;
  }, [allEvents]);

  // Selecionar data
  const handleDayPress = useCallback((day) => {
    setSelectedDate(day.dateString);
    if (onDatePress) {
      onDatePress(day.dateString, allEvents[day.dateString] || []);
    }
  }, [allEvents, onDatePress]);

  // Renderizar eventos do dia selecionado
  const renderDayEvents = () => {
    if (!selectedDate) return null;

    const dayEvents = allEvents[selectedDate] || [];
    const conflicts = getConflicts(selectedDate);

    if (dayEvents.length === 0) {
      return (
        <Text style={[styles.noEventsText, { color: colors?.onSurfaceVariant }]}>
          Nenhuma aula agendada para este dia
        </Text>
      );
    }

    return (
      <ScrollView style={styles.eventsContainer}>
        {dayEvents.map((event, index) => {
          const hasConflict = conflicts.some(c => 
            c.event1.id === event.id || c.event2.id === event.id
          );

          return (
            <Card
              key={event.id}
              style={[
                styles.eventCard,
                { backgroundColor: colors?.surface },
                hasConflict && { borderColor: colors?.error, borderWidth: 2 }
              ]}
              onPress={() => onClassPress && onClassPress(event)}
            >
              <Card.Content style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <View style={[styles.colorIndicator, { backgroundColor: event.color }]} />
                  <Text style={[styles.eventTitle, { color: colors?.onSurface }]}>
                    {event.title}
                  </Text>
                  {hasConflict && (
                    <Chip
                      compact
                      style={{ backgroundColor: colors?.errorContainer }}
                      textStyle={{ color: colors?.onErrorContainer, fontSize: 10 }}
                    >
                      ⚠️ Conflito
                    </Chip>
                  )}
                </View>

                <View style={styles.eventDetails}>
                  <Text style={[styles.eventTime, { color: colors?.primary }]}>
                    {event.time} - {addMinutesToTime(event.time, event.duration)}
                  </Text>
                  <Text style={[styles.eventInstructor, { color: colors?.onSurfaceVariant }]}>
                    👤 {event.instructor}
                  </Text>
                  <Text style={[styles.eventModality, { color: colors?.onSurfaceVariant }]}>
                    🥋 {event.modality}
                  </Text>
                  <Text style={[styles.eventCapacity, { color: colors?.onSurfaceVariant }]}>
                    👥 {event.enrolledStudents}/{event.maxStudents} alunos
                  </Text>
                </View>
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
    );
  };

  // Função auxiliar para adicionar minutos ao horário
  const addMinutesToTime = (time, minutes) => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <Card style={[styles.filtersCard, { backgroundColor: colors?.surface }]}>
        <Card.Content>
          <Text style={[styles.filtersTitle, { color: colors?.onSurface }]}>
            Filtros
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              {/* Filtro por instrutor */}
              <Chip
                selected={!filterInstructor}
                onPress={() => setFilterInstructor(null)}
                style={styles.filterChip}
              >
                Todos os Instrutores
              </Chip>
              
              {instructors.map(instructor => (
                <Chip
                  key={instructor.id}
                  selected={filterInstructor === instructor.id}
                  onPress={() => setFilterInstructor(instructor.id)}
                  style={styles.filterChip}
                >
                  {instructor.name}
                </Chip>
              ))}

              {/* Filtro por modalidade */}
              <Chip
                selected={!filterModality}
                onPress={() => setFilterModality(null)}
                style={styles.filterChip}
              >
                Todas as Modalidades
              </Chip>
              
              {modalities.map(modality => (
                <Chip
                  key={modality}
                  selected={filterModality === modality}
                  onPress={() => setFilterModality(modality)}
                  style={styles.filterChip}
                >
                  {modality}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Calendário */}
      <Card style={[styles.calendarCard, { backgroundColor: colors?.surface }]}>
        <Card.Content>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDayPress}
            firstDay={1} // Segunda-feira como primeiro dia
            monthFormat={'MMMM yyyy'}
            dayNames={['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']}
            dayNamesShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            monthNames={[
              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ]}
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
              monthTextColor: colors?.onSurface,
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13
            }}
          />
        </Card.Content>
      </Card>

      {/* Eventos do dia selecionado */}
      {selectedDate && (
        <Card style={[styles.dayEventsCard, { backgroundColor: colors?.surface }]}>
          <Card.Content>
            <Text style={[styles.dayEventsTitle, { color: colors?.onSurface }]}>
              {new Date(selectedDate).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long'
              })}
            </Text>
            {renderDayEvents()}
          </Card.Content>
        </Card>
      )}

      {/* FAB para criar nova turma */}
      {onCreateClass && (
        <FAB
          icon="plus"
          label="Nova Turma"
          onPress={() => {
            console.log('🔥 FAB Nova Turma clicado no FreeGymScheduler');
            if (typeof onCreateClass === 'function') {
              onCreateClass();
            } else {
              console.error('❌ onCreateClass não é uma função:', typeof onCreateClass);
            }
          }}
          style={[styles.fab, { backgroundColor: colors?.primary }]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  filtersCard: {
    margin: 16,
    marginBottom: 8
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8
  },
  filterChip: {
    marginRight: 8
  },
  calendarCard: {
    margin: 16,
    marginVertical: 8
  },
  dayEventsCard: {
    margin: 16,
    marginTop: 8,
    maxHeight: 300
  },
  dayEventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'capitalize'
  },
  eventsContainer: {
    maxHeight: 200
  },
  noEventsText: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20
  },
  eventCard: {
    marginBottom: 8
  },
  eventContent: {
    paddingVertical: 8
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  colorIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  eventDetails: {
    marginLeft: 16
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  eventInstructor: {
    fontSize: 12,
    marginBottom: 2
  },
  eventModality: {
    fontSize: 12,
    marginBottom: 2
  },
  eventCapacity: {
    fontSize: 12
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16
  }
});

export default FreeGymScheduler;
