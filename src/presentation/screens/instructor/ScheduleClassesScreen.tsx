import { getString } from '@utils/theme';
/**
 * ScheduleClassesScreen - Tela para agendar aulas em turmas existentes
 * 
 * Permite ao instrutor selecionar uma ou mais turmas e adicionar/editar aulas
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  TextInput,
  Divider,
  List,
  Checkbox
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
// import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

interface ScheduleClassesScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

const ScheduleClassesScreen = ({ navigation, route }: ScheduleClassesScreenProps) => {
  const { getString } = useTheme();

  const { user, userProfile } = useAuthFacade();
  const { classes: initialClasses = [] } = (route.params as any) || {};

  const [selectedClasses, setSelectedClasses] = useState(new Set());
  const [classDate, setClassDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [classTime, setClassTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState('60');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState(initialClasses);

  useEffect(() => {
    if (classes.length === 0) {
      loadClasses();
    }
  }, []);

  const loadClasses = async () => {
    try {
      if (!user?.id || !userProfile?.academiaId) return;

      const instructorClasses = await academyFirestoreService.getWhere(
        'classes',
        'instructorId',
        '==',
        user.id,
        userProfile.academiaId
      );
      setClasses(instructorClasses);
    } catch (error) {
      console.error(getString('loadClassesError'), error);
      Alert.alert(getString('error'), 'Não foi possível carregar suas turmas');
    }
  };

  const toggleClassSelection = (classId: string) => {
    const newSelection = new Set(selectedClasses);
    if (newSelection.has(classId)) {
      newSelection.delete(classId);
    } else {
      newSelection.add(classId);
    }
    setSelectedClasses(newSelection);
  };

  const handleSchedule = async () => {
    if (selectedClasses.size === 0) {
      // Alert.alert(getString('attention'), 'Selecione pelo menos uma turma'); // getString commented out to avoid errors if not available from context, using hardcoded for now or assuming Alert works
      Alert.alert('Atenção', 'Selecione pelo menos uma turma');
      return;
    }

    if (!topic.trim()) {
      Alert.alert('Atenção', 'Informe o tema da aula');
      return;
    }

    if (!userProfile?.academiaId) {
      Alert.alert(getString('error'), 'Perfil de usuário incompleto');
      return;
    }

    try {
      setLoading(true);

      // Combinar data e hora
      const scheduledDateTime = new Date(classDate);
      scheduledDateTime.setHours(classTime.getHours());
      scheduledDateTime.setMinutes(classTime.getMinutes());

      const schedulePromises = Array.from(selectedClasses).map(async (classId: any) => {
        const classData = classes.find((c: any) => c.id === classId);

        const lessonData = {
          classId,
          className: classData?.name || 'Aula',
          instructorId: user?.id,
          instructorName: userProfile?.name || user?.email,
          academiaId: userProfile?.academiaId,
          scheduledDate: scheduledDateTime,
          duration: parseInt(duration),
          topic: topic.trim(),
          notes: notes.trim(),
          status: 'scheduled',
          createdAt: new Date(),
          createdBy: user?.id
        };

        if (!userProfile?.academiaId) return; // Safety check inside loop

        return academyFirestoreService.create(
          'lessons',
          lessonData,
          userProfile.academiaId
        );
      });

      await Promise.all(schedulePromises);

      Alert.alert(
        getString('successCheck'),
        `Aula agendada para ${selectedClasses.size} turma(s)!`,
        [
          { text: getString('ok'), onPress: () => navigation.goBack() }
        ]
      );

    } catch (error) {
      console.error('Erro ao agendar aulas:', error);
      Alert.alert(getString('error'), 'Não foi possível agendar as aulas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Seleção de Turmas */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="school" size={28} color={COLORS.primary[500]} />
              <Text style={styles.title}>Selecione as Turmas</Text>
            </View>
            <Text style={styles.subtitle}>
              {selectedClasses.size} turma(s) selecionada(s)
            </Text>

            {classes.length > 0 ? (
              classes.map((classItem: any) => (
                <List.Item
                  key={classItem.id}
                  title={classItem.name}
                  description={`${classItem.modality || getString('modality')} • ${classItem.students?.length || 0} alunos`}
                  left={() => (
                    <Checkbox
                      status={selectedClasses.has(classItem.id) ? 'checked' : 'unchecked'}
                      onPress={() => toggleClassSelection(classItem.id)}
                    />
                  )}
                  onPress={() => toggleClassSelection(classItem.id)}
                  style={[
                    styles.classItem,
                    selectedClasses.has(classItem.id) && styles.classItemSelected
                  ]}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="school" size={48} color={COLORS.gray[300]} />
                <Text style={styles.emptyText}>{getString('noClassesFound')}</Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('AddClass')}
                  style={styles.createButton}
                >
                  Criar Turma
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Detalhes da Aula */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="calendar-clock" size={28} color={COLORS.secondary[500]} />
              <Text style={styles.title}>Detalhes da Aula</Text>
            </View>

            {/* Data */}
            <Text style={styles.label}>Data da Aula *</Text>
            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              icon="calendar"
              style={styles.dateButton}
            >
              {formatDate(classDate)}
            </Button>

            {showDatePicker && (
              <DateTimePicker
                value={classDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setClassDate(selectedDate);
                }}
                minimumDate={new Date()}
              />
            )}

            {/* Hora */}
            <Text style={styles.label}>Horário *</Text>
            <Button
              mode="outlined"
              onPress={() => setShowTimePicker(true)}
              icon="clock-outline"
              style={styles.dateButton}
            >
              {formatTime(classTime)}
            </Button>

            {showTimePicker && (
              <DateTimePicker
                value={classTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setClassTime(selectedTime);
                }}
              />
            )}

            {/* Duração */}
            <Text style={styles.label}>Duração (minutos) *</Text>
            <View style={styles.durationChips}>
              {['30', '45', '60', '90', '120'].map((min) => (
                <Chip
                  key={min}
                  selected={duration === min}
                  onPress={() => setDuration(min)}
                  style={styles.chip}
                >
                  {min} min
                </Chip>
              ))}
            </View>

            {/* Tema */}
            <TextInput
              label="Tema da Aula *"
              value={topic}
              onChangeText={setTopic}
              mode="outlined"
              style={styles.input}
              placeholder="Ex: Fundamentos de Defesa"
            />

            {/* Observações */}
            <TextInput
              label="optionalObservations"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Materiais necessários, avisos, etc."
            />
          </Card.Content>
        </Card>

        {/* Resumo */}
        {selectedClasses.size > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <MaterialCommunityIcons name="information" size={28} color={COLORS.info[500]} />
                <Text style={styles.title}>Resumo</Text>
              </View>
              <Text style={styles.summaryText}>
                📅 {formatDate(classDate)} às {formatTime(classTime)}
              </Text>
              <Text style={styles.summaryText}>
                ⏱️ Duração: {duration} minutos
              </Text>
              <Text style={styles.summaryText}>
                🏫 {selectedClasses.size} turma(s) selecionada(s)
              </Text>
              {topic && (
                <Text style={styles.summaryText}>
                  📚 Tema: {topic}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Botões de Ação */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >{getString('cancel')}</Button>
        <Button
          mode="contained"
          onPress={handleSchedule}
          loading={loading}
          disabled={loading || selectedClasses.size === 0}
          style={[styles.button, styles.scheduleButton]}
        >
          Agendar Aula
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: SPACING.base,
    borderRadius: BORDER_RADIUS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold as const,
    marginLeft: SPACING.sm,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  classItem: {
    borderRadius: BORDER_RADIUS.sm,
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.background.light,
  },
  classItemSelected: {
    backgroundColor: COLORS.primary[50],
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  createButton: {
    marginTop: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold as const,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  dateButton: {
    marginBottom: SPACING.sm,
  },
  durationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  input: {
    marginBottom: SPACING.md,
  },
  summaryText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.primary,
    marginVertical: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.base,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  button: {
    flex: 1,
  },
  scheduleButton: {
    backgroundColor: COLORS.primary[500],
  },
});

export default ScheduleClassesScreen;
