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
  Title
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthProvider';
import { academyFirestoreService } from '@services/academyFirestoreService';
import EnhancedErrorBoundary from '@/components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@services/cacheService';
import batchFirestoreService from '@services/batchFirestoreService';
import { useScreenTracking, useUserActionTracking } from '@/hooks/useAnalytics';
import ReportsSkeleton from '@/components/skeletons/ReportsSkeleton';

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
        console.error('Academia ID não encontrado');
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
      currency: 'BRL'
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
      case 'student': return '#2196F3';
      case 'payment': return '#4CAF50';
      case 'class': return '#FF9800';
      case 'checkin': return '#9C27B0';
      default: return '#666';
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
          <Title style={styles.title}>Relatórios Gerenciais</Title>
          <Text style={styles.subtitle}>Visão geral do desempenho da academia</Text>
        </View>

        {/* Estatísticas Principais */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Estatísticas Principais</Title>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#2196F3' }]}>
                  <Ionicons name="people" size={24} color="white" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.totalStudents}</Text>
                  <Text style={styles.statLabel}>Total de Alunos</Text>
                  <Text style={styles.statSubtext}>{stats.activeStudents} ativos</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#4CAF50' }]}>
                  <Ionicons name="school" size={24} color="white" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.totalClasses}</Text>
                  <Text style={styles.statLabel}>Total de Turmas</Text>
                  <Text style={styles.statSubtext}>{stats.activeClasses} ativas</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FF9800' }]}>
                  <Ionicons name="card" size={24} color="white" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{formatCurrency(stats.monthlyRevenue)}</Text>
                  <Text style={styles.statLabel}>Receita Mensal</Text>
                  <Text style={styles.statSubtext}>Total: {formatCurrency(stats.totalRevenue)}</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#F44336' }]}>
                  <Ionicons name="time" size={24} color="white" />
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
            <Title style={styles.cardTitle}>Taxa de Ocupação</Title>
            
            <View style={styles.occupancyContainer}>
              <Text style={styles.occupancyLabel}>
                Alunos Ativos: {stats.activeStudents} / {stats.totalStudents}
              </Text>
              <ProgressBar 
                progress={stats.totalStudents > 0 ? stats.activeStudents / stats.totalStudents : 0}
                color="#4CAF50"
                style={styles.progressBar}
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
                color="#2196F3"
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
            <Title style={styles.cardTitle}>Turmas Mais Populares</Title>
            
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
            <Title style={styles.cardTitle}>Atividades Recentes</Title>
            
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
                  <Ionicons name={getActivityIcon(activity.type)} size={16} color="white" />
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
            <Title style={styles.cardTitle}>Ações Rápidas</Title>
            
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('AddStudent')}
                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                icon={<MaterialCommunityIcons name="account-plus" size={18} color="#fff" />}
              >
                Novo Aluno
              </Button>
              
              <Button
                mode="contained"
                onPress={() => navigation.navigate('AddClass')}
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                icon={<MaterialCommunityIcons name="school-outline" size={18} color="#fff" />}
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
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
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  occupancyContainer: {
    marginBottom: 20,
  },
  occupancyLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  occupancyPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
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
