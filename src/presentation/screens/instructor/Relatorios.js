import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  Surface,
  SegmentedButtons
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ResponsiveUtils } from '@utils/animations';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@infrastructure/services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import ReportsSkeleton from '@components/skeletons/ReportsSkeleton';
import { COLORS, SPACING, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useTheme } from "@contexts/ThemeContext";
import { useProfileTheme } from "../../../contexts/ProfileThemeContext";

const Relatorios = ({ navigation }) => {
  const { getString, currentLanguage } = useTheme();
  const { theme: profileTheme } = useProfileTheme();
  const { user, userProfile } = useAuthFacade();
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
      // Usar cache inteligente para dados dos relatórios
      const cacheKey = `${CACHE_KEYS.INSTRUCTOR_REPORTS(userProfile.academiaId, user.id, selectedPeriod)}:${currentLanguage}`;

      const reportsData = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando dados dos relatórios (cache miss):', user.id, selectedPeriod);

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
              { nome: getString('jiujitsu'), alunos: 22, frequencia: 85 }
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
        instructorId: user.id,
        period: selectedPeriod
      });

    } catch (error) {
      console.error('❌ Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id, userProfile?.academiaId, selectedPeriod, trackFeatureUsage, getString, currentLanguage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache
    if (userProfile?.academiaId) {
      cacheService.invalidatePattern(`instructor_reports:${userProfile.academiaId}:${user.id}`);
    }
    loadReportData();
  }, [loadReportData, userProfile?.academiaId, user.id]);

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

  const StatCard = useCallback(({ icon, title, value, subtitle, color = profileTheme.primary[500] }) => (
    <Surface style={[styles.statCard, { borderLeftColor: color, backgroundColor: profileTheme.background.default }]}>
      <View style={styles.statHeader}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <Text style={[styles.statTitle, { color: profileTheme.text.secondary }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color: profileTheme.text.primary }]}>{value}</Text>
      {subtitle && <Text style={[styles.statSubtitle, { color: profileTheme.text.hint }]}>{subtitle}</Text>}
    </Surface>
  ), [profileTheme]);

  if (loading) {
    return (
      <LinearGradient colors={profileTheme.gradients.hero} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <ReportsSkeleton />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro no InstructorReports:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'InstructorReports', academiaId: userProfile?.academiaId, instructorId: user?.uid }}
    >
      <LinearGradient colors={profileTheme.gradients.hero} style={{ flex: 1 }}>
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={profileTheme.primary[500]}
                colors={[profileTheme.primary[500]]}
              />
            }
          >
            {/* Período */}
            <Card style={[styles.card, { backgroundColor: profileTheme.background.paper }]}>
              <Card.Content>
                <View style={styles.header}>
                  <MaterialCommunityIcons name="chart-line" size={32} color={profileTheme.secondary[500]} />
                  <Text style={[styles.title, styles.title, { color: profileTheme.text.primary }]}>Relatórios e Análises</Text>
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
                  theme={{
                    colors: {
                      secondaryContainer: profileTheme.primary[100],
                      onSecondaryContainer: profileTheme.primary[700],
                      outline: profileTheme.primary[500]
                    }
                  }}
                />
              </Card.Content>
            </Card>

            {/* Estatísticas Gerais */}
            <Card style={[styles.card, { backgroundColor: profileTheme.background.paper }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, styles.title, { color: profileTheme.text.primary }]}>Visão Geral</Text>

                <View style={styles.statsGrid}>
                  <StatCard
                    icon="school"
                    title="Total de Aulas"
                    value={reportData.totalAulas}
                    subtitle="Este mês"
                    color={profileTheme.primary[500]}
                  />

                  <StatCard
                    icon="account-group"
                    title="Alunos Ativos"
                    value={reportData.totalAlunos}
                    subtitle="+15 este mês"
                    color={profileTheme.info || COLORS.info[500]}
                  />

                  <StatCard
                    icon="chart-line"
                    title="Frequência Média"
                    value={`${reportData.frequenciaMedia}%`}
                    subtitle="+3% vs mês anterior"
                    color={COLORS.warning[500]}
                  />

                  <StatCard
                    icon="currency-usd"
                    title="Receita Mensal"
                    value={`R$ ${reportData.receitaMensal.toLocaleString()}`}
                    subtitle="+12% crescimento"
                    color={profileTheme.secondary[500]}
                  />
                </View>
              </Card.Content>
            </Card>

            {/* Aulas Mais Populares */}
            <Card style={[styles.card, { backgroundColor: profileTheme.background.paper }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, styles.title, { color: profileTheme.text.primary }]}>Aulas Mais Populares</Text>

                {reportData.aulasPopulares.map((aula, index) => (
                  <Surface key={index} style={[styles.aulaItem, { backgroundColor: profileTheme.background.default }]}>
                    <View style={styles.aulaHeader}>
                      <Text style={[styles.aulaNome, { color: profileTheme.text.primary }]}>{aula.nome}</Text>
                      <Chip mode="flat" style={[styles.frequenciaChip, { backgroundColor: profileTheme.secondary[100] }]} textStyle={{ color: profileTheme.secondary[900] }}>
                        {aula.frequencia}%
                      </Chip>
                    </View>
                    <View style={styles.aulaDetails}>
                      <MaterialCommunityIcons name="account-multiple" size={16} color={profileTheme.text.secondary} />
                      <Text style={[styles.aulaAlunos, { color: profileTheme.text.secondary }]}>{aula.alunos} alunos</Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: profileTheme.text.disabled }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${aula.frequencia}%`, backgroundColor: profileTheme.primary[500] }
                        ]}
                      />
                    </View>
                  </Surface>
                ))}
              </Card.Content>
            </Card>

            {/* Evolução Mensal */}
            <Card style={[styles.card, { backgroundColor: profileTheme.background.paper }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, styles.title, { color: profileTheme.text.primary }]}>Evolução dos Últimos Meses</Text>

                {reportData.evolucaoMensal.map((mes, index) => (
                  <View key={index} style={[styles.evolucaoItem, { borderBottomColor: profileTheme.text.disabled }]}>
                    <Text style={[styles.evolucaoMes, { color: profileTheme.text.primary }]}>{mes.mes}</Text>
                    <View style={styles.evolucaoData}>
                      <View style={styles.evolucaoMetric}>
                        <MaterialCommunityIcons name="account-group" size={16} color={profileTheme.info || COLORS.info[500]} />
                        <Text style={[styles.evolucaoValue, { color: profileTheme.text.secondary }]}>{mes.alunos} alunos</Text>
                      </View>
                      <View style={styles.evolucaoMetric}>
                        <MaterialCommunityIcons name="currency-usd" size={16} color={profileTheme.primary[500]} />
                        <Text style={[styles.evolucaoValue, { color: profileTheme.text.secondary }]}>R$ {mes.receita.toLocaleString()}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>

            {/* Ações */}
            <Card style={[styles.card, { backgroundColor: profileTheme.background.paper }]}>
              <Card.Content>
                <Text style={[styles.sectionTitle, styles.title, { color: profileTheme.text.primary }]}>Exportar Relatórios</Text>

                <View style={styles.exportButtons}>
                  <Button
                    mode="outlined"
                    icon="file-pdf-box"
                    onPress={handleExportPDF}
                    style={[styles.exportButton, { borderColor: profileTheme.primary[500] }]}
                    textColor={profileTheme.primary[500]}
                  >
                    Exportar PDF
                  </Button>

                  <Button
                    mode="outlined"
                    icon="microsoft-excel"
                    onPress={handleExportExcel}
                    style={[styles.exportButton, { borderColor: profileTheme.secondary[500] }]}
                    textColor={profileTheme.secondary[500]}
                  >
                    Exportar Excel
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: FONT_WEIGHT.bold,
  },
  sectionTitle: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
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
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  statTitle: {
    marginLeft: ResponsiveUtils.spacing.xs,
    fontSize: ResponsiveUtils.fontSize.small,
  },
  statValue: {
    fontSize: ResponsiveUtils.fontSize.extraLarge,
    fontWeight: FONT_WEIGHT.bold,
  },
  statSubtitle: {
    fontSize: ResponsiveUtils.fontSize.small,
    marginTop: 2,
  },
  aulaItem: {
    padding: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.sm,
    borderRadius: ResponsiveUtils.borderRadius.medium,
  },
  aulaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  aulaNome: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
    flex: 1,
  },
  frequenciaChip: {
  },
  aulaDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  aulaAlunos: {
    marginLeft: SPACING.xs,
    fontSize: ResponsiveUtils.fontSize.small,
  },
  progressBar: {
    height: 4,
    borderRadius: BORDER_RADIUS.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  evolucaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ResponsiveUtils.spacing.sm,
    borderBottomWidth: 1,
  },
  evolucaoMes: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
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
    marginLeft: SPACING.xs,
    fontSize: ResponsiveUtils.fontSize.small,
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
