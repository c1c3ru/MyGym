import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, Alert, Dimensions } from 'react-native';
import {
  Card,
  Text,
  Button,
  Divider,
  Surface,
  Avatar,
  Chip,
  Snackbar
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { academyFirestoreService, academyStudentService } from '@infrastructure/services/academyFirestoreService';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, GLASS } from '@presentation/theme/designTokens';
import { getDayNames } from '@shared/utils/dateHelpers';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

interface Schedule {
  dayOfWeek?: number;
  hour?: number;
  minute?: number;
  day?: string;
  time?: string;
}

interface ClassInfo {
  id?: string;
  name: string;
  modality: string;
  level?: string;
  instructorName?: string;
  instructor?: string;
  schedule?: Schedule[];
  scheduleText?: string;
  maxStudents?: number;
  description?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  classIds?: string[];
}

interface ClassDetailsScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

const { width } = Dimensions.get('window');

const ClassDetailsScreen: React.FC<ClassDetailsScreenProps> = ({ route, navigation }) => {
  const { classId, classData = null } = route.params || {};
  const { user, userProfile } = useAuth();
  const { getString } = useTheme();
  const { role, isAdmin, academiaId: currentAcademiaId } = useCustomClaims();
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(classData);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(!classData);
  const [refreshing, setRefreshing] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    if (classId) {
      loadClassDetails();
    }
  }, [classId]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);

      if (!classInfo) {
        // Obter ID da academia para buscar a turma
        const academiaId = userProfile?.academiaId || currentAcademiaId;
        if (!academiaId) {
          console.error(getString('academyIdNotFound'));
          return;
        }

        console.log('🔍 Carregando detalhes da turma:', classId, 'academia:', academiaId);
        const classDetails = await academyFirestoreService.getById('classes', classId, academiaId) as ClassInfo;
        setClassInfo(classDetails);
      }

      // Obter ID da academia
      const academiaId = userProfile?.academiaId || currentAcademiaId;
      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }

      // Buscar alunos da turma na academia
      console.log('👥 Carregando alunos da turma...');
      const classStudents = await academyStudentService.getStudentsByClass(classId, academiaId) as Student[];
      console.log('✅ Alunos da turma encontrados:', classStudents.length);
      setStudents(classStudents);

    } catch (error) {
      console.error('Erro ao carregar detalhes da turma:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadClassDetails();
  };

  const handleDeleteClass = () => {
    if (!classId) return;
    Alert.alert(
      getString('confirmDeleteClass'),
      getString('confirmDeleteClassMessage'),
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const academiaId = userProfile?.academiaId || currentAcademiaId;
              await academyFirestoreService.delete('classes', classId, academiaId);
              setSnackbar({
                visible: true,
                message: getString('classDeletedSuccess'),
                type: 'success'
              });
              setTimeout(() => {
                navigation.goBack();
              }, 1500);
            } catch (error) {
              console.error('❌ Erro ao excluir turma:', error);
              setSnackbar({
                visible: true,
                message: getString('classDeleteError'),
                type: 'error'
              });
            }
          }
        }
      ]
    );
  };

  const formatSchedule = (schedule: Schedule | Schedule[] | string | undefined) => {
    if (!schedule) return getString('notDefined');

    // Se for uma string, retornar diretamente
    if (typeof schedule === 'string') {
      return schedule;
    }

    // Se for um objeto único com dayOfWeek, minute, hour
    if (!Array.isArray(schedule) && schedule.dayOfWeek !== undefined && schedule.hour !== undefined && schedule.minute !== undefined) {
      const days = getDayNames(getString);
      const dayName = days[schedule.dayOfWeek] || `${getString('day')} ${schedule.dayOfWeek}`;
      const time = `${schedule.hour.toString().padStart(2, '0')}:${schedule.minute.toString().padStart(2, '0')}`;
      return `${dayName} - ${time}`;
    }

    // Se for um array
    if (Array.isArray(schedule)) {
      return schedule.map(s => {
        if (typeof s === 'string') return s;
        if (s.dayOfWeek !== undefined && s.hour !== undefined && s.minute !== undefined) {
          const days = getDayNames(getString);
          const dayName = days[s.dayOfWeek] || `${getString('day')} ${s.dayOfWeek}`;
          const time = `${s.hour.toString().padStart(2, '0')}:${s.minute.toString().padStart(2, '0')}`;
          return `${dayName} - ${time}`;
        }
        return `${s.day || getString('day')} - ${s.time || getString('time')}`;
      }).join(', ');
    }

    return getString('scheduleNotDefined');
  };

  const getModalityColor = (modality: string | undefined): string => {
    const colors: Record<string, string> = {
      'Jiu-Jitsu': COLORS.info[500],
      'Muay Thai': COLORS.error[500],
      'MMA': COLORS.warning[500],
      'Boxe': COLORS.primary[500]
    };
    return (modality && colors[modality]) || COLORS.gray[500];
  };

  if (loading && !classInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>{getString('loadingClassDetails')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header da Turma */}
        <Surface style={styles.headerCard} elevation={4}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{classInfo?.name || getString('class')}</Text>
                <Chip
                  mode="flat"
                  style={[styles.modalityChip, { backgroundColor: getModalityColor(classInfo?.modality) }]}
                  textStyle={styles.modalityText}
                >
                  {classInfo?.modality || getString('modality')}
                </Chip>
              </View>
              <Avatar.Icon
                size={60}
                icon="school"
                style={[styles.classAvatar, { backgroundColor: getModalityColor(classInfo?.modality) }]}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={24} color={COLORS.info[500]} />
                <Text style={styles.statNumber}>{students.length}</Text>
                <Text style={styles.statLabel}>{getString('students')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="time" size={24} color={COLORS.primary[500]} />
                <Text style={styles.statNumber}>{classInfo?.schedule?.length || 0}</Text>
                <Text style={styles.statLabel}>{getString('schedules')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={24} color={COLORS.warning[500]} />
                <Text style={styles.statNumber}>{classInfo?.level || getString('all')}</Text>
                <Text style={styles.statLabel}>{getString('level')}</Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Informações Detalhadas */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>{getString('information')}</Text>

            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={24} color={COLORS.info[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{getString('instructor')}</Text>
                <Text style={styles.infoValue}>
                  {classInfo?.instructorName || classInfo?.instructor || getString('notDefined')}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={24} color={COLORS.primary[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{getString('schedules')}</Text>
                <Text style={styles.infoValue}>
                  {formatSchedule(classInfo?.schedule) || classInfo?.scheduleText || getString('scheduleNotDefined')}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={24} color={COLORS.warning[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{getString('capacity')}</Text>
                <Text style={styles.infoValue}>
                  {students.length} / {classInfo?.maxStudents || '∞'} {getString('students')}
                </Text>
              </View>
            </View>

            {classInfo?.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.infoLabel}>{getString('description')}</Text>
                <Text style={styles.descriptionText}>{classInfo.description}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Botão Alunos */}
        <Card style={styles.studentsCard}>
          <Card.Content>
            <View style={styles.studentsHeader}>
              <View style={styles.studentsInfo}>
                <Text style={styles.sectionTitle}>{getString('enrolledStudents')}</Text>
                <Text style={styles.studentsCount}>{students.length} {getString('student')}{students.length !== 1 ? 's' : ''}</Text>
              </View>
              <Button
                mode={showStudents ? "contained" : "outlined"}
                onPress={() => setShowStudents(!showStudents)}
                icon={showStudents ? "chevron-up" : "chevron-down"}
                style={styles.toggleButton}
              >
                {showStudents ? getString('hideStudents') : getString('viewStudents')}
              </Button>
            </View>

            {showStudents && (
              <View style={styles.studentsList}>
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <Surface key={student.id || index} style={styles.studentItem} elevation={1}>
                      <View style={styles.studentInfo}>
                        <Avatar.Text
                          size={40}
                          label={student.name?.charAt(0)?.toUpperCase() || 'A'}
                          style={styles.studentAvatar}
                        />
                        <View style={styles.studentDetails}>
                          <Text style={styles.studentName}>{student.name}</Text>
                          <Text style={styles.studentEmail}>{student.email}</Text>
                        </View>
                      </View>
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => navigation.navigate('StudentProfile', {
                          studentId: student.id,
                          studentData: student
                        })}
                        style={styles.studentButton}
                      >
                        {getString('viewProfile')}
                      </Button>
                    </Surface>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color={COLORS.gray[400]} />
                    <Text style={styles.emptyText}>{getString('noStudentsEnrolled')}</Text>
                    <Text style={styles.emptySubtext}>{getString('studentsWillAppearHere')}</Text>
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Ações Rápidas */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>{getString('quickActions')}</Text>

            <View style={styles.actionsGrid}>
              <Surface style={styles.actionItem} elevation={2}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('CheckIns', {
                    classId: classId,
                    className: classInfo?.name
                  })}
                  style={[styles.actionButton, { backgroundColor: COLORS.info[500] }]}
                  contentStyle={styles.actionButtonContent}
                  labelStyle={styles.actionButtonLabel}
                >
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                  {"\n"}{getString('checkIns')}
                </Button>
              </Surface>

              <Surface style={styles.actionItem} elevation={2}>
                <Button
                  mode="contained"
                  onPress={() => {
                    // Navegação condicional baseada no tipo de usuário
                    if (isAdmin()) {
                      navigation.navigate('ClassStudents', { classId: classId });
                    } else {
                      // Para instrutores, mostrar/ocultar lista de alunos na própria tela
                      setShowStudents(!showStudents);
                    }
                  }}
                  style={[styles.actionButton, { backgroundColor: COLORS.primary[500] }]}
                  contentStyle={styles.actionButtonContent}
                  labelStyle={styles.actionButtonLabel}
                >
                  <Ionicons name={showStudents ? "eye-off" : "eye"} size={20} color={COLORS.white} />
                  {"\n"}{isAdmin() ? getString('manage') : (showStudents ? getString('hideStudents') : getString('viewStudents'))}
                </Button>
              </Surface>
            </View>

            <Divider style={styles.actionDivider} />

            <Button
              mode="contained"
              onPress={handleDeleteClass}
              style={styles.deleteButton}
              contentStyle={styles.deleteButtonContent}
              icon="delete"
            >
              {getString('deleteClass')}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={{
          backgroundColor: snackbar.type === 'success' ? COLORS.primary[500] : COLORS.error[500]
        }}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header Card Styles
  headerCard: {
    margin: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    // Glassmorphism
    backgroundColor: GLASS.premium.backgroundColor,
    borderColor: GLASS.premium.borderColor,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: GLASS.premium.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 4px 16px 0 ${GLASS.premium.shadowColor}`,
        backdropFilter: GLASS.premium.backdropFilter,
      },
    }),
  },
  headerContent: {
    padding: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  classInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  className: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  modalityChip: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.lg,
  },
  modalityText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: FONT_SIZE.sm,
  },
  classAvatar: {
    backgroundColor: COLORS.info[500],
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray[900],
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: 16,
  },

  // Details Card
  detailsCard: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    // Glassmorphism
    backgroundColor: GLASS.premium.backgroundColor,
    borderColor: GLASS.premium.borderColor,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: GLASS.premium.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 4px 16px 0 ${GLASS.premium.shadowColor}`,
        backdropFilter: GLASS.premium.backdropFilter,
      },
    }),
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  infoLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[900],
  },
  descriptionContainer: {
    marginTop: SPACING.sm,
  },
  descriptionText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    lineHeight: 20,
    marginTop: SPACING.xs,
  },

  // Students Card
  studentsCard: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    // Glassmorphism
    backgroundColor: GLASS.premium.backgroundColor,
    borderColor: GLASS.premium.borderColor,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: GLASS.premium.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 4px 16px 0 ${GLASS.premium.shadowColor}`,
        backdropFilter: GLASS.premium.backdropFilter,
      },
    }),
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  studentsInfo: {
    flex: 1,
  },
  studentsCount: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  toggleButton: {
    borderRadius: BORDER_RADIUS.md,
  },
  studentsList: {
    marginTop: SPACING.md,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    backgroundColor: COLORS.info[500],
  },
  studentDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray[900],
  },
  studentEmail: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  studentButton: {
    borderRadius: BORDER_RADIUS.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  // Actions Card
  actionsCard: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    // Glassmorphism
    backgroundColor: GLASS.premium.backgroundColor,
    borderColor: GLASS.premium.borderColor,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: GLASS.premium.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 4px 16px 0 ${GLASS.premium.shadowColor}`,
        backdropFilter: GLASS.premium.backdropFilter,
      },
    }),
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  actionItem: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
  },
  actionButton: {
    borderRadius: BORDER_RADIUS.md,
    minHeight: 60,
  },
  actionButtonContent: {
    height: 60,
    flexDirection: 'column',
  },
  actionButtonLabel: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  actionDivider: {
    marginVertical: 16,
  },
  deleteButton: {
    backgroundColor: COLORS.error[500],
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: 0,
    maxWidth: '100%',
  },
  deleteButtonContent: {
    height: 48,
    paddingHorizontal: SPACING.md,
  },
});

export default ClassDetailsScreen;
