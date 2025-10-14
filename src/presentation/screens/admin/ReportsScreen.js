import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  RefreshControl
} from 'react-native';
import {
  Card,
  Text,
  Button,
  ProgressBar,
  DataTable
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthProvider';
import { academyFirestoreService } from '@services/academyFirestoreService';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@services/cacheService';
import batchFirestoreService from '@services/batchFirestoreService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import ReportsSkeleton from '@components/skeletons/ReportsSkeleton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from '@utils/theme';

const ReportsScreen = ({ navigation }) => {
  const { user, userProfile, academia } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalClasses: 0,
    activeClasses: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topClasses, setTopClasses] = useState([]);

  // Analytics tracking
  useScreenTracking('ReportsScreen', { 
    academiaId: userProfile?.academiaId,
    userType: userProfile?.userType 
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = useCallback(async () => {
    try {
      setLoading(true);
      
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }

      // Usar cache inteligente para dados dos relatórios
      const cacheKey = CACHE_KEYS.REPORTS(academiaId);
      
      const reportsData = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando dados dos relatórios (cache miss):', academiaId);
          
          // Usar batch processing para carregar múltiplas coleções
          const [students, classes, payments] = await Promise.all([
            academyFirestoreService.getAll('students', academiaId),
            academyFirestoreService.getAll('classes', academiaId),
            academyFirestoreService.getAll('payments', academiaId)
          ]);

          const activeStudents = students.filter(student => student.isActive !== false);
          const activeClasses = classes.filter(cls => cls.status === 'active');

          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          const totalRevenue = payments
            .filter(payment => payment.status === 'paid')
            .reduce((sum, payment) => sum + (payment.amount || 0), 0);

          const monthlyRevenue = payments
            .filter(payment => {
              const paymentDate = payment.createdAt?.seconds 
                ? new Date(payment.createdAt.seconds * 1000)
                : new Date(payment.createdAt);
              return payment.status === 'paid' && 
                     paymentDate.getMonth() === currentMonth &&
                     paymentDate.getFullYear() === currentYear;
            })
            .reduce((sum, payment) => sum + (payment.amount || 0), 0);

          const pendingPayments = payments.filter(payment => payment.status === 'pending').length;

          // Calcular turmas mais populares
          const classPopularity = classes.map(cls => ({
            ...cls,
            studentCount: students.filter(student => 
              student.classIds && student.classIds.includes(cls.id)
            ).length
          })).sort((a, b) => b.studentCount - a.studentCount).slice(0, 5);

          // Atividades recentes (simuladas - em produção viria do Firestore)
          const activities = [
            { type: 'student', action: 'Novo aluno cadastrado', time: '2 horas atrás' },
            { type: 'payment', action: 'Pagamento recebido', time: '4 horas atrás' },
            { type: 'class', action: 'Nova turma criada', time: '1 dia atrás' },
            { type: 'checkin', action: 'Check-in realizado', time: '2 dias atrás' }
          ];

          return {
            stats: {
              totalStudents: students.length,
              activeStudents: activeStudents.length,
              totalClasses: classes.length,
              activeClasses: activeClasses.length,
              totalRevenue,
              monthlyRevenue,
              pendingPayments
            },
            topClasses: classPopularity,
            recentActivities: activities
          };
        },
        CACHE_TTL.SHORT // Cache por 2 minutos (dados de relatórios mudam frequentemente)
      );

      setStats(reportsData.stats);
      setTopClasses(reportsData.topClasses);
      setRecentActivities(reportsData.recentActivities);
      
      console.log('✅ Relatórios carregados com sucesso');
      
      // Track analytics
      trackFeatureUsage('reports_loaded', {
        academiaId,
        totalStudents: reportsData.stats.totalStudents,
        totalClasses: reportsData.stats.totalClasses,
        monthlyRevenue: reportsData.stats.monthlyRevenue
      });

    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.academiaId, academia?.id, trackFeatureUsage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache para forçar refresh
    const academiaId = userProfile?.academiaId || academia?.id;
    if (academiaId) {
      cacheService.invalidatePattern(`reports:${academiaId}`);
    }
    loadReportsData();
  }, [loadReportsData, userProfile?.academiaId, academia?.id]);

  // Memoized utility functions
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: getString('currency')
    }).format(value || 0);
  }, []);

  const getActivityIcon = useCallback((type) => {
    switch (type) {
      case 'student': return 'person-add';
      case 'payment': return 'card';
      case 'class': return 'school';
      case 'checkin': return 'checkmark-circle';
      default: return 'information-circle';
    }
  }, []);

  const getActivityColor = useCallback((type) => {
    switch (type) {
      case 'student': return COLORS.info[500];
      case 'payment': return COLORS.primary[500];
      case 'class': return COLORS.warning[500];
      case 'checkin': return COLORS.secondary[500];
      default: return COLORS.text.secondary;
    }
  }, []);

  // Memoized navigation handlers
  const handleExportReport = useCallback(() => {
    trackButtonClick('export_report');
    // Implementar exportação de relatório
  }, [trackButtonClick]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ReportsSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro no ReportsScreen:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'ReportsScreen', academiaId: userProfile?.academiaId }}
    >
      <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatórios Gerenciais</Text>
          <Text style={styles.subtitle}>Visão geral do desempenho da academia</Text>
        </View>

        {/* Estatísticas Principais */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.cardTitle, styles.title]}>Estatísticas Principais</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: COLORS.info[700] }]}>
                  <Ionicons name="people" size={24} color={COLORS.white} />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.totalStudents}</Text>
                  <Text style={styles.statLabel}>Total de Alunos</Text>
                  <Text style={styles.statSubtext}>{stats.activeStudents} ativos</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: COLORS.primary[500] }]}>
                  <Ionicons name="school" size={24} color={COLORS.white} />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.totalClasses}</Text>
                  <Text style={styles.statLabel}>Total de Turmas</Text>
                  <Text style={styles.statSubtext}>{stats.activeClasses} ativas</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: COLORS.secondary[700] }]}>
                  <Ionicons name="card" size={24} color={COLORS.white} />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{formatCurrency(stats.monthlyRevenue)}</Text>
                  <Text style={styles.statLabel}>Receita Mensal</Text>
                  <Text style={styles.statSubtext}>Total: {formatCurrency(stats.totalRevenue)}</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: COLORS.error[700] }]}>
                  <Ionicons name="time" size={24} color={COLORS.white} />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.pendingPayments}</Text>
                  <Text style={styles.statLabel}>Pagamentos Pendentes</Text>
                  <Text style={styles.statSubtext}>Requer atenção</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Taxa de Ocupação */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.cardTitle, styles.title]}>Taxa de Ocupação</Text>
            
            <View style={styles.occupancyContainer}>
              <Text style={styles.occupancyLabel}>
                Alunos Ativos: {stats.activeStudents} / {stats.totalStudents}
              </Text>
              <ProgressBar 
                progress={stats.totalStudents > 0 ? stats.activeStudents / stats.totalStudents : 0}
                color={COLORS.primary[500]}
                style={[styles.progressBar, { borderRadius: 4 }]}
              />
              <Text style={styles.occupancyPercentage}>
                {stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}% de ocupação
              </Text>
            </View>

            <View style={styles.occupancyContainer}>
              <Text style={styles.occupancyLabel}>
                Turmas Ativas: {stats.activeClasses} / {stats.totalClasses}
              </Text>
              <ProgressBar 
                progress={stats.totalClasses > 0 ? stats.activeClasses / stats.totalClasses : 0}
                color={COLORS.info[500]}
                style={styles.progressBar}
              />
              <Text style={styles.occupancyPercentage}>
                {stats.totalClasses > 0 ? Math.round((stats.activeClasses / stats.totalClasses) * 100) : 0}% ativas
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Turmas Mais Populares */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.cardTitle, styles.title]}>Turmas Mais Populares</Text>
            
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Turma</DataTable.Title>
                <DataTable.Title>Modalidade</DataTable.Title>
                <DataTable.Title numeric>Alunos</DataTable.Title>
              </DataTable.Header>

              {topClasses.map((classItem, index) => (
                <DataTable.Row key={classItem.id || index}>
                  <DataTable.Cell>{classItem.name}</DataTable.Cell>
                  <DataTable.Cell>{classItem.modality}</DataTable.Cell>
                  <DataTable.Cell numeric>{classItem.studentCount}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>

            {topClasses.length === 0 && (
              <Text style={styles.noDataText}>Nenhuma turma encontrada</Text>
            )}
          </Card.Content>
        </Card>

        {/* Atividades Recentes */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.cardTitle, styles.title]}>Atividades Recentes</Text>
            
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
                  <Ionicons name={getActivityIcon(activity.type)} size={16} color={COLORS.white} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Ações Rápidas */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.cardTitle, styles.title]}>Ações Rápidas</Text>
            
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate(getString('addStudent'))}
                style={[styles.actionButton, { backgroundColor: COLORS.info[500] }]}
                icon={<MaterialCommunityIcons name="account-plus" size={18} color={COLORS.white} />}
              >
                Novo Aluno
              </Button>
              
              <Button
                mode="contained"
                onPress={() => navigation.navigate(getString('addClassScreen'))}
                style={[styles.actionButton, { backgroundColor: COLORS.primary[500] }]}
                icon={<MaterialCommunityIcons name="school-outline" size={18} color={COLORS.white} />}
              >
                Nova Turma
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      </SafeAreaView>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 16,
    color: COLORS.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    padding: SPACING.md,
    backgroundColor: COLORS.background.light,
    borderRadius: BORDER_RADIUS.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  occupancyContainer: {
    marginBottom: 20,
  },
  occupancyLabel: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  occupancyPercentage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    textAlign: 'right',
  },
  noDataText: {
    textAlign: 'center',
    color: COLORS.gray[500],
    fontStyle: 'italic',
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  activityTime: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ReportsScreen;
