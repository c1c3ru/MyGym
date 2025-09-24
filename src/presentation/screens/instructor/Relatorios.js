import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { 
  Card, 
  Title, 
  Text,
  Button,
  Chip,
  Surface,
  Divider,
  SegmentedButtons
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ResponsiveUtils } from '../../../shared/utils/animations';
import { useAuth } from '../../contexts/AuthProvider';
import { academyFirestoreService } from '../../../infrastructure/services/academyFirestoreService';
import EnhancedErrorBoundary from '../../components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '../../../infrastructure/services/cacheService';
import { useScreenTracking, useUserActionTracking } from '../../hooks/useAnalytics';
import ReportsSkeleton from '../../components/skeletons/ReportsSkeleton';

const Relatorios = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [reportData, setReportData] = useState({
    totalAulas: 0,
    totalAlunos: 0,
    frequenciaMedia: 0,
    receitaMensal: 0,
    aulasPopulares: [],
    evolucaoMensal: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics tracking
  useScreenTracking('InstructorReports', { 
    academiaId: userProfile?.academiaId,
    userType: 'instructor',
    instructorId: user?.uid 
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!userProfile?.academiaId || !user?.uid) {
        console.warn('⚠️ Usuário sem academiaId ou uid definido');
        return;
      }

      // Usar cache inteligente para dados dos relatórios
      const cacheKey = CACHE_KEYS.INSTRUCTOR_REPORTS(userProfile.academiaId, user.uid, selectedPeriod);
      
      const reportsData = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando dados dos relatórios (cache miss):', user.uid, selectedPeriod);
          
          // Simular dados reais - em produção viria do Firestore
          // Aqui você implementaria as consultas reais ao Firestore
          const mockData = {
            totalAulas: 45,
            totalAlunos: 120,
            frequenciaMedia: 85,
            receitaMensal: 15000,
            aulasPopulares: [
              { nome: 'Karatê Iniciante', alunos: 25, frequencia: 92 },
              { nome: 'Muay Thai Avançado', alunos: 18, frequencia: 88 },
              { nome: 'Jiu-Jitsu', alunos: 22, frequencia: 85 }
            ],
            evolucaoMensal: [
              { mes: 'Jan', alunos: 95, receita: 12000 },
              { mes: 'Fev', alunos: 105, receita: 13500 },
              { mes: 'Mar', alunos: 120, receita: 15000 }
            ]
          };
          
          return mockData;
        },
        CACHE_TTL.MEDIUM // Cache por 5 minutos
      );
      
      setReportData(reportsData);
      
      // Track analytics
      trackFeatureUsage('instructor_reports_loaded', {
        academiaId: userProfile.academiaId,
        instructorId: user.uid,
        period: selectedPeriod
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.uid, userProfile?.academiaId, selectedPeriod, trackFeatureUsage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache
    if (userProfile?.academiaId) {
      cacheService.invalidatePattern(`instructor_reports:${userProfile.academiaId}:${user.uid}`);
    }
    loadReportData();
  }, [loadReportData, userProfile?.academiaId, user.uid]);

  const handleExportPDF = useCallback(() => {
    trackButtonClick('export_pdf_report', { period: selectedPeriod });
    console.log('Exportar PDF');
    // Implementar exportação PDF
  }, [trackButtonClick, selectedPeriod]);

  const handleExportExcel = useCallback(() => {
    trackButtonClick('export_excel_report', { period: selectedPeriod });
    console.log('Exportar Excel');
    // Implementar exportação Excel
  }, [trackButtonClick, selectedPeriod]);

  const StatCard = useCallback(({ icon, title, value, subtitle, color = '#4CAF50' }) => (
    <Surface style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Surface>
  ), []);

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
        console.error('🚨 Erro no InstructorReports:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'InstructorReports', academiaId: userProfile?.academiaId, instructorId: user?.uid }}
    >
      <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Período */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="chart-line" size={32} color="#9C27B0" />
              <Title style={styles.title}>Relatórios e Análises</Title>
            </View>
            
            <SegmentedButtons
              value={selectedPeriod}
              onValueChange={(value) => {
                trackButtonClick('change_report_period', { period: value });
                setSelectedPeriod(value);
              }}
              buttons={[
                { value: 'semana', label: 'Semana' },
                { value: 'mes', label: 'Mês' },
                { value: 'ano', label: 'Ano' }
              ]}
              style={styles.periodSelector}
            />
          </Card.Content>
        </Card>

        {/* Estatísticas Gerais */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Visão Geral</Title>
            
            <View style={styles.statsGrid}>
              <StatCard
                icon="school"
                title="Total de Aulas"
                value={reportData.totalAulas}
                subtitle="Este mês"
                color="#4CAF50"
              />
              
              <StatCard
                icon="account-group"
                title="Alunos Ativos"
                value={reportData.totalAlunos}
                subtitle="+15 este mês"
                color="#2196F3"
              />
              
              <StatCard
                icon="chart-line"
                title="Frequência Média"
                value={`${reportData.frequenciaMedia}%`}
                subtitle="+3% vs mês anterior"
                color="#FF9800"
              />
              
              <StatCard
                icon="currency-usd"
                title="Receita Mensal"
                value={`R$ ${reportData.receitaMensal.toLocaleString()}`}
                subtitle="+12% crescimento"
                color="#9C27B0"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Aulas Mais Populares */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Aulas Mais Populares</Title>
            
            {reportData.aulasPopulares.map((aula, index) => (
              <Surface key={index} style={styles.aulaItem}>
                <View style={styles.aulaHeader}>
                  <Text style={styles.aulaNome}>{aula.nome}</Text>
                  <Chip mode="flat" style={styles.frequenciaChip}>
                    {aula.frequencia}%
                  </Chip>
                </View>
                <View style={styles.aulaDetails}>
                  <MaterialCommunityIcons name="account-multiple" size={16} color="#666" />
                  <Text style={styles.aulaAlunos}>{aula.alunos} alunos</Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${aula.frequencia}%` }
                    ]} 
                  />
                </View>
              </Surface>
            ))}
          </Card.Content>
        </Card>

        {/* Evolução Mensal */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Evolução dos Últimos Meses</Title>
            
            {reportData.evolucaoMensal.map((mes, index) => (
              <View key={index} style={styles.evolucaoItem}>
                <Text style={styles.evolucaoMes}>{mes.mes}</Text>
                <View style={styles.evolucaoData}>
                  <View style={styles.evolucaoMetric}>
                    <MaterialCommunityIcons name="account-group" size={16} color="#2196F3" />
                    <Text style={styles.evolucaoValue}>{mes.alunos} alunos</Text>
                  </View>
                  <View style={styles.evolucaoMetric}>
                    <MaterialCommunityIcons name="currency-usd" size={16} color="#4CAF50" />
                    <Text style={styles.evolucaoValue}>R$ {mes.receita.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Ações */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Exportar Relatórios</Title>
            
            <View style={styles.exportButtons}>
              <Button
                mode="outlined"
                icon="file-pdf-box"
                onPress={handleExportPDF}
                style={styles.exportButton}
              >
                Exportar PDF
              </Button>
              
              <Button
                mode="outlined"
                icon="microsoft-excel"
                onPress={handleExportExcel}
                style={styles.exportButton}
              >
                Exportar Excel
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
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.large,
    ...ResponsiveUtils.elevation,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.lg,
  },
  title: {
    marginLeft: ResponsiveUtils.spacing.md,
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  periodSelector: {
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.sm,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    borderLeftWidth: 4,
    backgroundColor: 'white',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  statTitle: {
    marginLeft: ResponsiveUtils.spacing.xs,
    fontSize: ResponsiveUtils.fontSize.small,
    color: '#666',
  },
  statValue: {
    fontSize: ResponsiveUtils.fontSize.extraLarge,
    fontWeight: 'bold',
    color: '#333',
  },
  statSubtitle: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: '#666',
    marginTop: 2,
  },
  aulaItem: {
    padding: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.sm,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    backgroundColor: '#f8f9fa',
  },
  aulaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  aulaNome: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  frequenciaChip: {
    backgroundColor: '#e3f2fd',
  },
  aulaDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  aulaAlunos: {
    marginLeft: 4,
    fontSize: ResponsiveUtils.fontSize.small,
    color: '#666',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  evolucaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ResponsiveUtils.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  evolucaoMes: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: 'bold',
    color: '#333',
    width: 50,
  },
  evolucaoData: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  evolucaoMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evolucaoValue: {
    marginLeft: 4,
    fontSize: ResponsiveUtils.fontSize.small,
    color: '#666',
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportButton: {
    flex: 0.48,
  },
});

export default Relatorios;
