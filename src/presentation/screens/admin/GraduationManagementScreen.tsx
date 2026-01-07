import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Alert
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  FAB,
  Portal,
  Dialog,
  TextInput,
  List,
  Divider,
  Surface,
  ProgressBar,
  Text
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGraduation } from '@hooks/useGraduation';
import { useAuth } from '@contexts/AuthProvider';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import GraduationAlertCard, { GraduationAlert } from '@components/GraduationAlertCard';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from "@utils/theme";

interface SummaryStats {
  totalStudents: number;
  eligibleStudents: number;
  upcomingExams: number;
  recentGraduations: number;
  eligibilityRate: string | number;
}

interface ModalityStat {
  modality: string;
  count: number;
}

interface GraduationBoard {
  summary: {
    totalStudents: number;
    totalEligible: number;
    totalUpcomingExams: number;
    totalRecentGraduations: number;
  };
  modalityStats: ModalityStat[];
  allAlerts: GraduationAlert[];
  upcomingExams: any[];
}

interface ExamForm {
  modality: string;
  date: string;
  examiner: string;
  location: string;
  candidates: string[];
}

const GraduationManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { currentTheme } = useThemeToggle();

  const { userProfile } = useAuth();
  const {
    graduationBoard,
    loading,
    refreshing,
    refreshGraduationBoard,
    scheduleExam,
    runAutomaticCheck,
    getSummaryStats,
    getAlertsByModality,
    canManageGraduations
  }: {
    graduationBoard: GraduationBoard | null;
    loading: boolean;
    refreshing: boolean;
    refreshGraduationBoard: () => Promise<any>;
    scheduleExam: (data: any) => Promise<boolean>;
    runAutomaticCheck: () => Promise<boolean>;
    getSummaryStats: () => SummaryStats | null;
    getAlertsByModality: (modality: string) => GraduationAlert[];
    canManageGraduations: () => boolean;
  } = useGraduation() as any;

  const [selectedModality, setSelectedModality] = useState('all');
  const [fabOpen, setFabOpen] = useState(false);
  const [examDialogVisible, setExamDialogVisible] = useState(false);
  const [rulesDialogVisible, setRulesDialogVisible] = useState(false);
  const [examForm, setExamForm] = useState<ExamForm>({
    modality: '',
    date: '',
    examiner: '',
    location: '',
    candidates: []
  });

  useEffect(() => {
    if (!canManageGraduations()) {
      Alert.alert(
        'Acesso Negado',
        'Você não tem permissão para acessar esta funcionalidade.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [canManageGraduations, navigation]);

  const handleScheduleExam = async () => {
    try {
      const success = await scheduleExam({
        modality: examForm.modality,
        date: new Date(examForm.date),
        examiner: examForm.examiner,
        location: examForm.location,
        candidateStudents: examForm.candidates
      });

      if (success) {
        setExamDialogVisible(false);
        setExamForm({
          modality: '',
          date: '',
          examiner: '',
          location: '',
          candidates: []
        });
      }
    } catch (error) {
      console.error('Erro ao agendar exame:', error);
    }
  };

  const handleRunAutomaticCheck = async () => {
    Alert.alert(
      'Verificação Automática',
      'Deseja executar uma verificação automática de graduações? Isso enviará notificações para instrutores sobre estudantes elegíveis.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Executar',
          onPress: async () => {
            await runAutomaticCheck();
          }
        }
      ]
    );
  };

  const renderSummaryCards = () => {
    const stats = getSummaryStats();
    if (!stats) return null;

    return (
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryIcon}>
              <Ionicons name="people" size={24} color={COLORS.info[500]} />
            </View>
            <View>
              <Text style={styles.summaryNumber}>{stats.totalStudents}</Text>
              <Text style={styles.summaryLabel}>Total de Estudantes</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryIcon}>
              <Ionicons name="trophy" size={24} color={COLORS.primary[500]} />
            </View>
            <View>
              <Text style={styles.summaryNumber}>{stats.eligibleStudents}</Text>
              <Text style={styles.summaryLabel}>Elegíveis</Text>
              <Text style={styles.summaryPercentage}>
                {stats.eligibilityRate}% do total
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <View style={styles.summaryIcon}>
              <Ionicons name="calendar" size={24} color={COLORS.warning[500]} />
            </View>
            <View>
              <Text style={styles.summaryNumber}>{stats.upcomingExams}</Text>
              <Text style={styles.summaryLabel}>Próximos Exames</Text>
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
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Filtrar por Modalidade</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterContainer}>
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
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderEligibleStudents = () => {
    const alerts = getAlertsByModality(selectedModality).filter(alert => alert.isEligible);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Estudantes Elegíveis</Text>
          <Chip style={styles.countChip}>{alerts.length}</Chip>
        </View>

        {alerts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.paragraph}>Nenhum estudante elegível para graduação no momento.</Text>
            </Card.Content>
          </Card>
        ) : (
          alerts.map((alert: GraduationAlert) => (
            <GraduationAlertCard
              key={alert.id}
              alert={alert}
              onViewDetails={(alert: GraduationAlert) => navigation.navigate('StudentDetails', { studentId: alert.studentId })}
              onScheduleExam={(alert: GraduationAlert) => {
                setExamForm((prev: ExamForm) => ({
                  ...prev,
                  modality: alert.modality,
                  candidates: [alert.studentId]
                }));
                setExamDialogVisible(true);
              }}
              compact
            />
          ))
        )}
      </View>
    );
  };

  const renderManagementActions = () => {
    return (
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Ações de Gerenciamento</Text>
          <Divider style={styles.divider} />

          <List.Item
            title="Executar Verificação Automática"
            description="Verificar eligibilidade e enviar notificações"
            left={props => <List.Icon {...props} icon="refresh" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleRunAutomaticCheck}
          />

          <Divider />

          <List.Item
            title="Configurar Regras de Graduação"
            description="Personalizar critérios por modalidade"
            left={props => <List.Icon {...props} icon="cog" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setRulesDialogVisible(true)}
          />

          <Divider />

          <List.Item
            title="Relatórios de Graduação"
            description="Visualizar estatísticas detalhadas"
            left={props => <List.Icon {...props} icon="chart-bar" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('GraduationReports')}
          />

          <Divider />

          <List.Item
            title="Histórico de Exames"
            description="Ver exames anteriores e resultados"
            left={props => <List.Icon {...props} icon="history" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ExamHistory')}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderExamDialog = () => {
    return (
      <Portal>
        <Dialog visible={examDialogVisible} onDismiss={() => setExamDialogVisible(false)}>
          <Dialog.Title>Agendar Exame de Graduação</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Modalidade"
              value={examForm.modality}
              onChangeText={(text) => setExamForm(prev => ({ ...prev, modality: text }))}
              style={styles.input}
            />
            <TextInput
              label="Data (YYYY-MM-DD)"
              value={examForm.date}
              onChangeText={(text) => setExamForm(prev => ({ ...prev, date: text }))}
              style={styles.input}
            />
            <TextInput
              label="Examinador"
              value={examForm.examiner}
              onChangeText={(text) => setExamForm(prev => ({ ...prev, examiner: text }))}
              style={styles.input}
            />
            <TextInput
              label="Local"
              value={examForm.location}
              onChangeText={(text) => setExamForm(prev => ({ ...prev, location: text }))}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExamDialogVisible(false)}>Cancelar</Button>
            <Button mode="contained" onPress={handleScheduleExam}>
              Agendar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  };

  const renderFAB = () => {
    return (
      <FAB.Group
        open={fabOpen}
        visible={true}
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          {
            icon: 'calendar-plus',
            label: 'Agendar Exame',
            onPress: () => setExamDialogVisible(true),
          },
          {
            icon: 'refresh',
            label: 'Verificação Automática',
            onPress: handleRunAutomaticCheck,
          },
          {
            icon: 'eye',
            label: 'Ver Painel Completo',
            onPress: () => navigation.navigate('GraduationBoard'),
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        onPress={() => {
          if (fabOpen) {
            // do something if the speed dial is open
          }
        }}
      />
    );
  };

  if (loading && !graduationBoard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ProgressBar indeterminate />
          <Text style={styles.loadingText}>Carregando dados de graduação...</Text>
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
        <Text style={styles.headerTitle}>Gerenciamento de Graduações</Text>
        <Text style={styles.headerSubtitle}>
          Administração e controle de graduações
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshGraduationBoard} />
        }
      >
        {renderSummaryCards()}
        {renderModalityFilter()}
        {renderEligibleStudents()}
        {renderManagementActions()}
      </ScrollView>

      {renderExamDialog()}
      {renderFAB()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold as any,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
    textAlign: 'center',
  },
  title: {
    color: COLORS.black,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  paragraph: {
    color: COLORS.gray[500],
    fontSize: FONT_SIZE.base,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
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
  summaryNumber: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
  },
  summaryPercentage: {
    fontSize: FONT_SIZE.xxs,
    color: COLORS.gray[500],
  },
  filterSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  countChip: {
    backgroundColor: COLORS.info[500],
  },
  emptyCard: {
    elevation: 2,
  },
  actionsCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  divider: {
    marginVertical: 8,
  },
  input: {
    marginBottom: SPACING.md,
  },
});

export default GraduationManagementScreen;