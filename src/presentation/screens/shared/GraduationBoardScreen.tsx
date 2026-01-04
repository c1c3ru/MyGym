import React, { useState, useEffect, useCallback } from 'react';
import {
import { getString } from '@utils/theme';
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
  Pressable
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Surface,
  Divider,
  Text,
  Portal,
  Dialog,
  List,
  Avatar,
  Badge,
  IconButton,
  ProgressBar
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { useNotification } from '@contexts/NotificationContext';
import graduationBoardService from '@infrastructure/services/graduationBoardService';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp } from '@react-navigation/native';

interface GraduationBoardScreenProps {
  navigation: NavigationProp<any>;
}

interface Student {
  id: string;
  studentName: string;
  modality: string;
  currentBelt: string;
  nextBelt: string;
  alertLevel: 'ready' | 'warning' | 'info';
}

interface Exam {
  id: string;
  modality: string;
  date: string | Date;
  examiner: string;
  location: string;
  candidateStudents: any[];
}

interface ModalityStat {
  modality: string;
  eligibleStudents: number;
  totalStudents: number;
  averageTrainingTime: number;
  nextExamDate: string | Date | null;
}

interface GraduationBoard {
  summary: {
    totalStudents: number;
    totalEligible: number;
    totalUpcomingExams: number;
  };
  modalityStats: ModalityStat[];
  eligibleStudents: Student[];
  upcomingExams: Exam[];
  lastUpdated: string | Date;
}

const { width } = Dimensions.get('window');

const GraduationBoardScreen = ({ navigation }: GraduationBoardScreenProps) => {
  const { user, userProfile, academia } = useAuth();
  const { getString } = useTheme();
  const { showSuccess, showError } = useNotification();

  const [graduationBoard, setGraduationBoard] = useState<GraduationBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedModality, setSelectedModality] = useState('all');
  const [examDialogVisible, setExamDialogVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  useEffect(() => {
    loadGraduationBoard();
  }, [academia?.id]);

  const loadGraduationBoard = useCallback(async (forceRefresh = false) => {
    try {
      if (!academia?.id) return;

      setLoading(true);
      const board = await graduationBoardService.getGraduationBoard(academia.id, forceRefresh);
      setGraduationBoard(board as GraduationBoard);
    } catch (error) {
      console.error('Erro ao carregar painel de graduações:', error);
      showError('Erro ao carregar dados de graduação');
    } finally {
      setLoading(false);
    }
  }, [academia?.id, showError]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGraduationBoard(true);
    setRefreshing(false);
  }, [loadGraduationBoard]);

  const filterStudentsByModality = useCallback((students: Student[]) => {
    if (selectedModality === 'all') return students;
    return students.filter(student => student.modality === selectedModality);
  }, [selectedModality]);

  const getBeltColor = (belt: string) => {
    const colors: { [key: string]: string } = {
      'Branca': COLORS.special.belt.white,
      'Cinza': COLORS.gray[500],
      'Amarela': COLORS.special.belt.yellow,
      'Laranja': COLORS.special.belt.orange,
      'Verde': COLORS.special.belt.green,
      'Azul': COLORS.special.belt.blue,
      'Roxa': COLORS.special.belt.purple,
      'Marrom': COLORS.special.belt.brown,
      'Preta': COLORS.special.belt.black
    };
    return colors[belt] || COLORS.gray[300];
  };

  const getAlertColor = (alertLevel: Student['alertLevel']) => {
    const colors: { [key: string]: string } = {
      'ready': COLORS.success[500],
      'warning': COLORS.warning[500],
      'info': COLORS.info[500]
    };
    return colors[alertLevel] || COLORS.gray[300];
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const renderSummaryCards = () => {
    if (!graduationBoard?.summary) return null;

    const { summary } = graduationBoard;

    return (
      <View style={styles.summaryContainer}>
        <Card style={[styles.summaryCard, styles.studentsCard]}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryIcon}>
              <Ionicons name="people" size={24} color={COLORS.info[500]} />
            </View>
            <View style={styles.summaryText}>
              <Text style={[styles.summaryNumber, styles.title]}>{summary.totalStudents}</Text>
              <Text style={[styles.summaryLabel, styles.paragraph]}>Estudantes</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, styles.eligibleCard]}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryIcon}>
              <Ionicons name="trophy" size={24} color={COLORS.success[500]} />
            </View>
            <View style={styles.summaryText}>
              <Text style={[styles.summaryNumber, styles.title]}>{summary.totalEligible}</Text>
              <Text style={[styles.summaryLabel, styles.paragraph]}>Elegíveis</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, styles.examsCard]}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryIcon}>
              <Ionicons name="calendar" size={24} color={COLORS.warning[500]} />
            </View>
            <View style={styles.summaryText}>
              <Text style={[styles.summaryNumber, styles.title]}>{summary.totalUpcomingExams}</Text>
              <Text style={[styles.summaryLabel, styles.paragraph]}>Exames</Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderModalityFilter = () => {
    if (!graduationBoard?.modalityStats) return null;

    const modalities = ['all', ...graduationBoard.modalityStats.map((stat: ModalityStat) => stat.modality)];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {modalities.map((modality) => (
          <Chip
            key={modality}
            mode={selectedModality === modality ? 'flat' : 'outlined'}
            selected={selectedModality === modality}
            onPress={() => setSelectedModality(modality)}
            style={[
              styles.filterChip,
              selectedModality === modality && styles.selectedChip
            ]}
          >
            {modality === 'all' ? 'all' : modality}
          </Chip>
        ))}
      </ScrollView>
    );
  };

  const renderEligibleStudents = () => {
    if (!graduationBoard?.eligibleStudents) return null;

    const filteredStudents = filterStudentsByModality(graduationBoard?.eligibleStudents || []);

    if (filteredStudents.length === 0) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, null]}>Estudantes Elegíveis</Text>
            <Text style={[styles.paragraph, null]}>Nenhum estudante elegível para graduação no momento.</Text>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, null]}>Estudantes Elegíveis</Text>
            <Badge style={styles.badge}>{filteredStudents.length}</Badge>
          </View>
          <Divider style={styles.divider} />

          {filteredStudents.map((student: Student) => (
            <Surface key={student.id} style={styles.studentItem}>
              <View style={styles.studentInfo}>
                <Avatar.Text
                  size={40}
                  label={student.studentName.charAt(0)}
                  style={{ backgroundColor: getBeltColor(student.currentBelt) }}
                />
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName}>{student.studentName}</Text>
                  <Text style={styles.studentModality}>{student.modality}</Text>
                  <View style={styles.beltProgression}>
                    <Chip
                      compact
                      style={[styles.beltChip, { backgroundColor: getBeltColor(student.currentBelt) }]}
                    >
                      {student.currentBelt}
                    </Chip>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.text.secondary} />
                    <Chip
                      compact
                      style={[styles.beltChip, { backgroundColor: getBeltColor(student.nextBelt) }]}
                    >
                      {student.nextBelt}
                    </Chip>
                  </View>
                </View>
              </View>
              <View style={styles.studentStatus}>
                <Chip
                  icon="check-circle"
                  style={[styles.statusChip, { backgroundColor: getAlertColor(student.alertLevel) }]}
                >
                  Pronto
                </Chip>
              </View>
            </Surface>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderUpcomingExams = () => {
    if (!graduationBoard?.upcomingExams) return null;

    const filteredExams = selectedModality === 'all'
      ? graduationBoard.upcomingExams
      : graduationBoard.upcomingExams.filter((exam: Exam) => exam.modality === selectedModality);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, null]}>Próximos Exames</Text>
            <Badge style={styles.badge}>{filteredExams.length}</Badge>
          </View>
          <Divider style={styles.divider} />

          {filteredExams.length === 0 ? (
            <Text style={[styles.paragraph, null]}>Nenhum exame agendado.</Text>
          ) : (
            filteredExams.map((exam: Exam) => (
              <Surface
                key={exam.id}
                style={styles.examItem}
              >
                <Pressable
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => {
                    setSelectedExam(exam);
                    setExamDialogVisible(true);
                  }}
                >
                  <View style={styles.examInfo}>
                    <View style={styles.examHeader}>
                      <Text style={styles.examModality}>{exam.modality}</Text>
                      <Text style={styles.examDate}>{formatDate(exam.date)}</Text>
                    </View>
                    <Text style={styles.examDetails}>
                      Examinador: {exam.examiner}
                    </Text>
                    <Text style={styles.examDetails}>
                      Local: {exam.location}
                    </Text>
                    <Text style={styles.examCandidates}>
                      {exam.candidateStudents.length} candidatos
                    </Text>
                  </View>
                  <IconButton icon="chevron-right" />
                </Pressable>
              </Surface>
            ))
          )}

          {(userProfile?.userType === 'admin' || userProfile?.userType === 'instructor') && (
            <Button
              mode="outlined"
              icon="plus"
              onPress={() => navigation.navigate('ScheduleExam')}
              style={styles.addButton}
            >
              Agendar Exame
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderModalityStats = () => {
    if (!graduationBoard?.modalityStats) return null;

    const filteredStats = selectedModality === 'all'
      ? graduationBoard.modalityStats
      : graduationBoard.modalityStats.filter((stat: ModalityStat) => stat.modality === selectedModality);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.title, null]}>Estatísticas por Modalidade</Text>
          <Divider style={styles.divider} />

          {filteredStats.map((stat: ModalityStat) => (
            <Surface key={stat.modality} style={styles.statItem}>
              <View style={styles.statHeader}>
                <Text style={styles.statModality}>{stat.modality}</Text>
                <View style={styles.statNumbers}>
                  <Text style={styles.statEligible}>{stat.eligibleStudents}</Text>
                  <Text style={styles.statTotal}>/{stat.totalStudents}</Text>
                </View>
              </View>

              <ProgressBar
                progress={stat.totalStudents > 0 ? stat.eligibleStudents / stat.totalStudents : 0}
                color={COLORS.success[500]}
                style={styles.progressBar}
              />

              <View style={styles.statDetails}>
                <Text style={styles.statDetail}>
                  Tempo médio: {Math.round(stat.averageTrainingTime / 30)} meses
                </Text>
                {stat.nextExamDate && (
                  <Text style={styles.statDetail}>
                    Próximo exame: {formatDate(stat.nextExamDate)}
                  </Text>
                )}
              </View>
            </Surface>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderExamDialog = () => {
    if (!selectedExam) return null;

    return (
      <Portal>
        <Dialog visible={examDialogVisible} onDismiss={() => setExamDialogVisible(false)}>
          <Dialog.Title>Detalhes do Exame</Dialog.Title>
          <Dialog.Content>
            <List.Item
              title="modality"
              description={selectedExam.modality}
              left={props => <List.Icon {...props} icon="karate" />}
            />
            <List.Item
              title={getString('date')}
              description={formatDate(selectedExam.date)}
              left={props => <List.Icon {...props} icon="calendar" />}
            />
            <List.Item
              title="Examinador"
              description={selectedExam.examiner}
              left={props => <List.Icon {...props} icon="account" />}
            />
            <List.Item
              title="local"
              description={selectedExam.location}
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
            <List.Item
              title="Candidatos"
              description={`${selectedExam.candidateStudents.length} estudantes`}
              left={props => <List.Icon {...props} icon="account-group" />}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExamDialogVisible(false)}>{getString('close')}</Button>
            {(userProfile?.userType === 'admin' || userProfile?.userType === 'instructor') && (
              <Button
                mode="contained"
                onPress={() => {
                  setExamDialogVisible(false);
                  navigation.navigate('ExamResults', { examId: selectedExam.id });
                }}
              >
                Gerenciar
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };

  if (loading && !graduationBoard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ProgressBar indeterminate />
          <Text style={styles.loadingText}>Carregando painel de graduações...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.info[500], COLORS.info[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, styles.title]}>Painel de Graduações</Text>
          <Text style={[styles.headerSubtitle, styles.paragraph]}>
            Última atualização: {graduationBoard?.lastUpdated ? formatDate(graduationBoard.lastUpdated) : getString('notAvailable')}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderSummaryCards()}
        {renderModalityFilter()}
        {renderEligibleStudents()}
        {renderUpcomingExams()}
        {renderModalityStats()}
      </ScrollView>

      {renderExamDialog()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.xs,
  },
  paragraph: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  studentsCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info[500],
  },
  eligibleCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success[500],
  },
  examsCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning[500],
  },
  selectedChip: {
    backgroundColor: COLORS.info[100],
    borderColor: COLORS.info[500],
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold as const,
  },
  headerSubtitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
  },
  content: {
    flex: 1,
    padding: SPACING.base,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.base,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.base,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  summaryIcon: {
    marginRight: SPACING.md,
  },
  summaryText: {
    flex: 1,
  },
  summaryNumber: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold as const,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  filterContainer: {
    marginBottom: SPACING.base,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  card: {
    marginBottom: SPACING.base,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badge: {
    backgroundColor: COLORS.info[500],
  },
  divider: {
    marginBottom: SPACING.base,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    elevation: 1,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold as const,
  },
  studentModality: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  beltProgression: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beltChip: {
    marginHorizontal: 4,
  },
  studentStatus: {
    alignItems: 'center',
  },
  statusChip: {
    paddingHorizontal: SPACING.sm,
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    elevation: 1,
  },
  examInfo: {
    flex: 1,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  examModality: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold as const,
  },
  examDate: {
    fontSize: FONT_SIZE.base,
    color: COLORS.info[500],
    fontWeight: FONT_WEIGHT.bold as const,
  },
  examDetails: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  examCandidates: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
  },
  addButton: {
    marginTop: SPACING.base,
  },
  statItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statModality: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold as const,
  },
  statNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statEligible: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold as const,
    color: COLORS.primary[500],
  },
  statTotal: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.sm,
  },
  statDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statDetail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
});

export default GraduationBoardScreen;