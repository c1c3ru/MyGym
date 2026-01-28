import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  Card,
  Text,
  Chip,
  FAB
} from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '@contexts/ThemeContext';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';


const { width } = Dimensions.get('window');

/**
 * Scheduler GRATUITO específico para academias
 * 
 * @param {Object} props
 * @param {Array} props.classes - Lista de turmas
 * @param {any} [props.refreshControl] - Elemento de controle de atualização
 * @param {Function} props.onClassPress - Callback ao clicar na turma
 * @param {Function} props.onDatePress - Callback ao selecionar data
 * @param {Function} [props.onCreateClass] - Callback para criar turma (opcional)
 * @param {Object} props.navigation - Objeto de navegação
 */
const FreeGymScheduler = ({
  classes = [],
  checkins = null, // Propriedade opcional para histórico de check-ins
  onClassPress,
  onDatePress,
  onCreateClass,
  navigation,
  theme, // Tema passado via prop
  refreshControl
}) => {
  const themeContext = useTheme();

  // Priorizar tema passado via prop, fallback para contexto
  const colors = theme?.colors || themeContext.colors;
  const getString = theme?.getString || themeContext.getString;
  // Se theme não tiver getString, pode causar erro, então garantir fallback
  const safeGetString = getString || ((key) => key);

  // Usa useAuthFacade para autenticação
  const { user, userProfile, academia } = useAuthFacade();

  // useCustomClaims agora é seguro e retorna valores padrão se não houver contexto
  const claims = useCustomClaims();
  const role = claims?.role || null;
  const isAdmin = claims?.isAdmin || false;
  const isInstructor = claims?.isInstructor || false;
  const isStudent = claims?.isStudent || false;

  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [filterInstructor, setFilterInstructor] = useState(null);
  const [filterModality, setFilterModality] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [modalities, setModalities] = useState([]);

  // Cores por modalidade (adaptado para seu sistema)
  const modalityColors = {
    'karate': COLORS.error[500],
    'karatê': COLORS.error[500],
    'jiu-jitsu': COLORS.secondary[500],
    'jiu jitsu': COLORS.secondary[500],
    'muay-thai': COLORS.error[500],
    'muay thai': COLORS.error[500],
    'judo': COLORS.info[700],
    'judô': COLORS.info[700],
    'taekwondo': COLORS.warning[500],
    'boxe': COLORS.gray[700],
    'default': COLORS.gray[600]
  };

  // Carregar dados da academia
  useEffect(() => {
    const loadAcademyData = async () => {
      try {
        const academiaId = userProfile?.academiaId || academia?.id;
        if (!academiaId) return;

        // Carregar instrutores
        const instructorsList = await academyFirestoreService.getAll('instructors', academiaId);
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
    // Reset time to start of today for accurate comparison
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Para alunos (com checkins), geramos apenas do futuro. Para outros, mantemos histórico.
    // Mas a lógica de 3 meses permanece para o futuro.
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

        // Normalizar data do evento
        const eventDateString = eventDate.toISOString().split('T')[0];
        const eventDateObj = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

        // Se tivermos checkins (visão aluno), só mostramos schedule futuro (>= hoje)
        const isFuture = eventDateObj >= startOfToday;
        const shouldInclude = checkins ? isFuture : true;

        if (eventDate <= endDate && shouldInclude) {
          hours.forEach(time => {
            const eventId = `${classData.id}-${eventDateString}-${time}`;

            if (!events[eventDateString]) events[eventDateString] = [];

            events[eventDateString].push({
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
              date: eventDateString,
              ageCategory: classData.ageCategory,
              status: classData.status,
              type: 'scheduled' // Marcador de tipo
            });
          });
        }
      }
    });

    return events;
  }, [modalityColors, checkins]);

  // Gerar todos os eventos de todas as turmas
  const allEvents = useMemo(() => {
    let events = {};

    // 1. Gerar eventos agendados (Schedule)
    classes.forEach(classData => {
      const classEvents = generateRecurringEvents(classData);

      Object.entries(classEvents).forEach(([date, dayEvents]) => {
        if (!events[date]) events[date] = [];
        events[date].push(...dayEvents);
      });
    });

    // 2. Se houver check-ins (Histórico), adicionar como eventos passados
    if (checkins && Array.isArray(checkins)) {
      checkins.forEach(checkin => {
        // Garantir formato de data YYYY-MM-DD
        let checkinDate = checkin.date;
        if (checkin.date && typeof checkin.date === 'object' && checkin.date.toDate) {
          checkinDate = checkin.date.toDate().toISOString().split('T')[0];
        } else if (checkin.date && typeof checkin.date === 'string' && checkin.date.includes('T')) {
          checkinDate = checkin.date.split('T')[0];
        }

        if (checkinDate) {
          if (!events[checkinDate]) events[checkinDate] = [];

          // Tentar encontrar dados da turma original se possível
          const originalClass = classes.find(c => c.id === checkin.classId) || {};

          events[checkinDate].push({
            id: checkin.id,
            classId: checkin.classId,
            title: checkin.className || originalClass.name || 'Treino Realizado',
            time: checkin.time || '00:00',
            duration: 60, // Estimado se não tiver
            instructor: checkin.instructorName || originalClass.instructorName || '-',
            modality: checkin.modality || originalClass.modality || 'Treino',
            color: modalityColors[(checkin.modality || originalClass.modality || '').toLowerCase()] || COLORS.success[500],
            date: checkinDate,
            type: 'checkin', // Marcador de tipo
            status: checkin.status || 'present'
          });
        }
      });
    }

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
  }, [classes, generateRecurringEvents, filterInstructor, filterModality, checkins]);

  // Marcar datas no calendário
  const markedDates = useMemo(() => {
    const marked = {};

    Object.entries(allEvents).forEach(([date, events]) => {
      const eventCount = events.length;
      const hasMultipleEvents = eventCount > 1;
      const hasCheckin = events.some(e => e.type === 'checkin');

      // Se tiver check-in, cor de sucesso, senão cor primária (agendado)
      const primaryColor = hasCheckin ? COLORS.success[500] : (events[0]?.color || colors?.primary);

      marked[date] = {
        marked: true,
        dotColor: primaryColor,
        selectedColor: primaryColor,
        customStyles: {
          container: {
            backgroundColor: hasCheckin ? COLORS.success[100] : (hasMultipleEvents ? primaryColor : `${primaryColor}20`),
            borderRadius: BORDER_RADIUS.full, // Círculo completo para destaque
            borderWidth: hasCheckin ? 2 : (hasMultipleEvents ? 2 : 1),
            borderColor: primaryColor,
            elevation: hasCheckin ? 2 : 0 // Sombra leve para checkins
          },
          text: {
            color: hasCheckin ? COLORS.success[700] : (hasMultipleEvents ? getString('colorWhite') : primaryColor),
            fontWeight: (hasMultipleEvents || hasCheckin) ? 'bold' : 'normal'
          }
        }
      };
    });

    return marked;
  }, [allEvents, colors, getString]);

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

          const isCheckin = event.type === 'checkin';

          return (
            <Card
              key={event.id}
              style={[
                styles.eventCard,
                { backgroundColor: isCheckin ? colors?.elevation?.level2 : colors?.surface },
                isCheckin && { borderLeftWidth: 4, borderLeftColor: COLORS.success[500] },
                hasConflict && !isCheckin && { borderColor: colors?.error, borderWidth: 2 }
              ]}
              onPress={() => onClassPress && onClassPress(event)}
            >
              <Card.Content style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  {!isCheckin && <View style={[styles.colorIndicator, { backgroundColor: event.color }]} />}

                  <Text style={[styles.eventTitle, { color: colors?.onSurface, fontWeight: isCheckin ? 'bold' : '600' }]}>
                    {isCheckin ? '✅ ' : ''}{event.title}
                  </Text>

                  {isCheckin && (
                    <Chip
                      compact
                      style={{ backgroundColor: COLORS.success[100], height: 24 }}
                      textStyle={{ color: COLORS.success[700], fontSize: 10, lineHeight: 10 }}
                    >
                      Realizado
                    </Chip>
                  )}

                  {!isCheckin && (
                    <Chip
                      compact
                      mode="outlined"
                      style={{ height: 24, borderColor: colors?.outline }}
                      textStyle={{ color: colors?.onSurfaceVariant, fontSize: 10, lineHeight: 10 }}
                    >
                      Agendado
                    </Chip>
                  )}

                  {hasConflict && !isCheckin && (
                    <Chip
                      compact
                      style={{ backgroundColor: colors?.errorContainer, marginLeft: 4 }}
                      textStyle={{ color: colors?.onErrorContainer, fontSize: FONT_SIZE.xxs }}
                    >
                      ⚠️ Conflito
                    </Chip>
                  )}
                </View>

                <View style={[styles.eventDetails, isCheckin && { marginLeft: 0 }]}>
                  <Text style={[styles.eventTime, { color: isCheckin ? colors?.onSurface : colors?.primary }]}>
                    🕒 {event.time} - {addMinutesToTime(event.time, event.duration)}
                  </Text>
                  <Text style={[styles.eventInstructor, { color: colors?.onSurfaceVariant }]}>
                    👤 {event.instructor}
                  </Text>
                  <Text style={[styles.eventModality, { color: colors?.onSurfaceVariant }]}>
                    🥋 {event.modality}
                  </Text>
                  {!isCheckin && (
                    <Text style={[styles.eventCapacity, { color: colors?.onSurfaceVariant }]}>
                      👥 {event.enrolledStudents}/{event.maxStudents} alunos
                    </Text>
                  )}
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
    <ScrollView
      style={styles.container}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
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
                {getString('allModalities')}
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
            dayNames={[getString('sunday'), getString('monday'), getString('tuesday'), getString('wednesday'), getString('thursday'), getString('friday'), getString('saturday')]}
            dayNamesShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            monthNames={[
              getString('january'), getString('february'), getString('march'), getString('april'), getString('may'), getString('june'),
              getString('july'), getString('august'), getString('september'), getString('october'), getString('november'), getString('december')
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
              textDayFontFamily: getString('system'),
              textMonthFontFamily: getString('system'),
              textDayHeaderFontFamily: getString('system'),
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
    </ScrollView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors?.background
  },
  filtersCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm
  },
  filtersTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.md
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: SPACING.sm
  },
  filterChip: {
    marginRight: SPACING.sm
  },
  calendarCard: {
    margin: SPACING.md,
    marginVertical: 8
  },
  dayEventsCard: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    maxHeight: 300
  },
  dayEventsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.md,
    textTransform: 'capitalize'
  },
  eventsContainer: {
    maxHeight: 200
  },
  noEventsText: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: SPACING.lg
  },
  eventCard: {
    marginBottom: SPACING.sm
  },
  eventContent: {
    paddingVertical: SPACING.sm
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  colorIndicator: {
    width: 4,
    height: 20,
    borderRadius: BORDER_RADIUS.xs,
    marginRight: SPACING.md
  },
  eventTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    flex: 1
  },
  eventDetails: {
    marginLeft: SPACING.md
  },
  eventTime: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.xs
  },
  eventInstructor: {
    fontSize: FONT_SIZE.sm,
    marginBottom: 2
  },
  eventModality: {
    fontSize: FONT_SIZE.sm,
    marginBottom: 2
  },
  eventCapacity: {
    fontSize: FONT_SIZE.sm
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16
  }
});

export default FreeGymScheduler;
