import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
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
import { useNotification } from '@components/NotificationManager';
import graduationBoardService from '@services/graduationBoardService';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const GraduationBoardScreen = ({ navigation }) => {
  const { user, userProfile, academia } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [graduationBoard, setGraduationBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedModality, setSelectedModality] = useState('all');
  const [examDialogVisible, setExamDialogVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    loadGraduationBoard();
  }, [academia?.id]);

  const loadGraduationBoard = useCallback(async (forceRefresh = false) => {
    try {
      if (!academia?.id) return;

      setLoading(true);
      const board = await graduationBoardService.getGraduationBoard(academia.id, forceRefresh);
      setGraduationBoard(board);
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

  const filterStudentsByModality = useCallback((students) => {
    if (selectedModality === 'all') return students;
    return students.filter(student => student.modality === selectedModality);
  }, [selectedModality]);

  const getBeltColor = (belt) => {
    const colors = {
      'Branca': '#FFFFFF',
      'Cinza': '#808080',
      'Amarela': '#FFEB3B',
      'Laranja': '#FF9800',
      'Verde': '#4CAF50',
      'Azul': '#2196F3',
      'Roxa': '#9C27B0',
      'Marrom': '#795548',
      'Preta': '#000000'
    };
    return colors[belt] || '#E0E0E0';
  };

  const getAlertColor = (alertLevel) => {
    const colors = {
      'ready': '#4CAF50',
      'warning': '#FF9800',
      'info': '#2196F3'
    };
    return colors[alertLevel] || '#E0E0E0';
  };

  const formatDate = (date) => {
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
              <Ionicons name="people" size={24} color="#2196F3" />
            </View>
            <View style={styles.summaryText}>
              <Title style={styles.summaryNumber}>{summary.totalStudents}</Title>
              <Paragraph style={styles.summaryLabel}>Estudantes</Paragraph>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, styles.eligibleCard]}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryIcon}>
              <Ionicons name="trophy" size={24} color="#4CAF50" />
            </View>
            <View style={styles.summaryText}>
              <Title style={styles.summaryNumber}>{summary.totalEligible}</Title>
              <Paragraph style={styles.summaryLabel}>Elegíveis</Paragraph>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, styles.examsCard]}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryIcon}>
              <Ionicons name="calendar" size={24} color="#FF9800" />
            </View>
            <View style={styles.summaryText}>
              <Title style={styles.summaryNumber}>{summary.totalUpcomingExams}</Title>
              <Paragraph style={styles.summaryLabel}>Exames</Paragraph>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderModalityFilter = () => {
    if (!graduationBoard?.modalityStats) return null;

    const modalities = ['all', ...graduationBoard.modalityStats.map(stat => stat.modality)];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {modalities.map((modality) => (
          <Chip
            key={modality}
            mode={selectedModality === modality ? 'flat' : 'outlined'}
            selected={selectedModality === modality}
            onPress={() => setSelectedModality(modality)}
            style={styles.filterChip}
          >
            {modality === 'all' ? 'Todas' : modality}
          </Chip>
        ))}
      </ScrollView>
    );
  };

  const renderEligibleStudents = () => {
    if (!graduationBoard?.eligibleStudents) return null;

    const filteredStudents = filterStudentsByModality(graduationBoard.eligibleStudents);

    if (filteredStudents.length === 0) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Estudantes Elegíveis</Title>
            <Paragraph>Nenhum estudante elegível para graduação no momento.</Paragraph>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Estudantes Elegíveis</Title>
            <Badge style={styles.badge}>{filteredStudents.length}</Badge>
          </View>
          <Divider style={styles.divider} />
          
          {filteredStudents.map((student, index) => (
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
                      size="small" 
                      style={[styles.beltChip, { backgroundColor: getBeltColor(student.currentBelt) }]}
                    >
                      {student.currentBelt}
                    </Chip>
                    <Ionicons name="arrow-forward" size={16} color="#666" />
                    <Chip 
                      size="small" 
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
      : graduationBoard.upcomingExams.filter(exam => exam.modality === selectedModality);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title>Próximos Exames</Title>
            <Badge style={styles.badge}>{filteredExams.length}</Badge>
          </View>
          <Divider style={styles.divider} />

          {filteredExams.length === 0 ? (
            <Paragraph>Nenhum exame agendado.</Paragraph>
          ) : (
            filteredExams.map((exam) => (
              <Surface 
                key={exam.id} 
                style={styles.examItem}
                onTouchEnd={() => {
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
      : graduationBoard.modalityStats.filter(stat => stat.modality === selectedModality);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>Estatísticas por Modalidade</Title>
          <Divider style={styles.divider} />

          {filteredStats.map((stat) => (
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
                color="#4CAF50"
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
              title="Modalidade"
              description={selectedExam.modality}
              left={props => <List.Icon {...props} icon="karate" />}
            />
            <List.Item
              title="Data"
              description={formatDate(selectedExam.date)}
              left={props => <List.Icon {...props} icon="calendar" />}
            />
            <List.Item
              title="Examinador"
              description={selectedExam.examiner}
              left={props => <List.Icon {...props} icon="account" />}
            />
            <List.Item
              title="Local"
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
            <Button onPress={() => setExamDialogVisible(false)}>Fechar</Button>
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
        colors={['#2196F3', '#1976D2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Title style={styles.headerTitle}>Painel de Graduações</Title>
          <Paragraph style={styles.headerSubtitle}>
            Última atualização: {graduationBoard?.lastUpdated ? formatDate(graduationBoard.lastUpdated) : 'N/A'}
          </Paragraph>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  summaryIcon: {
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#2196F3',
  },
  divider: {
    marginBottom: 16,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentModality: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
    paddingHorizontal: 8,
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  examInfo: {
    flex: 1,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  examModality: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  examDate: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  examDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  examCandidates: {
    fontSize: 12,
    color: '#999',
  },
  addButton: {
    marginTop: 16,
  },
  statItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statModality: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statEligible: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statTotal: {
    fontSize: 16,
    color: '#666',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  statDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statDetail: {
    fontSize: 12,
    color: '#666',
  },
});

export default GraduationBoardScreen;