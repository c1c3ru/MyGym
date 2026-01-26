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
import exportUtils from '@shared/utils/exportUtils';
import GlassCard from '@components/GlassCard';

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

  const handleExportPDF = useCallback(async () => {
    trackButtonClick('export_pdf_report', { period: selectedPeriod });
    console.log('Exportar PDF');

    try {
      const date = new Date().toLocaleDateString('pt-BR');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Relatório de Desempenho - MyGym</title>
            <style>
              body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; background-color: #fff; }
              .header { margin-bottom: 30px; border-bottom: 3px solid #e67e22; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
              h1 { color: #2c3e50; margin: 0; font-size: 28px; }
              .instructor-name { color: #e67e22; font-size: 18px; font-weight: bold; }
              .meta-info { text-align: right; font-size: 12px; color: #7f8c8d; }
              
              h2 { color: #d35400; margin-top: 40px; border-bottom: 1px solid #eee; padding-bottom: 10px; font-size: 20px; }
              
              .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
              .stat-card { background: #fffaf0; border: 1px solid #ffebcc; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
              .stat-label { font-size: 11px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
              .stat-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
              
              .chart-section { margin-top: 30px; }
              .chart-container { background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 10px; }
              .bar-row { margin-bottom: 15px; }
              .bar-label { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
              .bar-bg { background: #ecf0f1; height: 10px; border-radius: 5px; overflow: hidden; }
              .bar-fill { height: 100%; border-radius: 5px; background: #e67e22; }
              
              table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #fff; }
              th { background-color: #f8f9fa; text-align: left; padding: 12px; border-bottom: 2px solid #e67e22; color: #2c3e50; font-weight: bold; }
              td { padding: 12px; border-bottom: 1px solid #eee; }
              tr:nth-child(even) { background-color: #fffaf0; }
              
              .footer { margin-top: 60px; font-size: 11px; color: #bdc3c7; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
              
              @media print {
                body { padding: 0; }
                .stat-card { break-inside: avoid; }
                table { break-inside: auto; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>Relatório de Desempenho</h1>
                <div class="instructor-name">${userProfile?.name || 'Instrutor'} - ${selectedPeriod.toUpperCase()}</div>
              </div>
              <div class="meta-info">
                Gerado em: ${date}<br>
                Licença MyGym: Profissional
              </div>
            </div>
 
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Total de Aulas</div>
                <div class="stat-value">${reportData.totalAulas}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Alunos Ativos</div>
                <div class="stat-value">${reportData.totalAlunos}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Frequência Média</div>
                <div class="stat-value">${reportData.frequenciaMedia}%</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Receita Estimada</div>
                <div class="stat-value">R$ ${reportData.receitaMensal.toLocaleString('pt-BR')}</div>
              </div>
            </div>
 
            <div class="chart-section">
              <h2>Análise de Frequência</h2>
              <div class="chart-container">
                <div class="bar-row">
                  <div class="bar-label">
                    <span>Média Geral do Período</span>
                    <span>${reportData.frequenciaMedia}%</span>
                  </div>
                  <div class="bar-bg">
                    <div class="bar-fill" style="width: ${reportData.frequenciaMedia}%"></div>
                  </div>
                </div>
              </div>
            </div>
 
            <h2>Aulas Mais Populares</h2>
            <table>
              <thead>
                <tr>
                  <th>Aula</th>
                  <th style="text-align: right;">Matriculados</th>
                  <th style="text-align: right;">Presença</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.aulasPopulares.map(aula => `
                  <tr>
                    <td><strong>${aula.nome}</strong></td>
                    <td style="text-align: right;">${aula.alunos}</td>
                    <td style="text-align: right;">
                      <span style="display: inline-block; width: 50px; background: #eee; height: 6px; border-radius: 3px; overflow: hidden; vertical-align: middle; margin-right: 5px;">
                        <div style="width: ${aula.frequencia}%; background: #e67e22; height: 100%;"></div>
                      </span>
                      ${aula.frequencia}%
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
 
            <h2>Evolução Trimestral</h2>
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Alunos Totais</th>
                  <th style="text-align: right;">Receita Estimada</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.evolucaoMensal.map(mes => `
                  <tr>
                    <td>${mes.mes}</td>
                    <td>${mes.alunos} alunos</td>
                    <td style="text-align: right;">R$ ${mes.receita.toLocaleString('pt-BR')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
 
            <div class="footer">
              Relatório gerado via MyGym App para ${userProfile?.name || 'Instrutor'}.<br>
              ${new Date().getFullYear()} © MyGym Gestão Esportiva.
            </div>
          </body>
        </html>
      `;

      await exportUtils.exportToPDF({
        title: `Relatório MyGym - ${selectedPeriod}`,
        htmlContent
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Aqui idealmente usaríamos um Snackbar ou Alert
    }
  }, [trackButtonClick, selectedPeriod, reportData, userProfile]);

  const handleExportExcel = useCallback(async () => {
    trackButtonClick('export_excel_report', { period: selectedPeriod });
    console.log('Exportar Excel');

    try {
      // Preparar dados para o Excel
      // Juntando as informações em uma lista plana para facilitar
      const evolutionData = reportData.evolucaoMensal.map(item => ({
        'Categoria': 'Evolução Mensal',
        'Período': item.mes,
        'Métrica Primária': item.alunos, // Alunos
        'Métrica Secundária': item.receita, // Receita
        'Detalhes': '-'
      }));

      const classesData = reportData.aulasPopulares.map(item => ({
        'Categoria': 'Aulas Populares',
        'Período': selectedPeriod,
        'Métrica Primária': item.alunos, // Alunos
        'Métrica Secundária': item.frequencia, // Frequência (%)
        'Detalhes': item.nome
      }));

      const overviewData = [
        { 'Categoria': 'Resumo', 'Período': selectedPeriod, 'Métrica Primária': reportData.totalAlunos, 'Métrica Secundária': reportData.totalAulas, 'Detalhes': 'Total Alunos / Total Aulas' },
        { 'Categoria': 'Resumo', 'Período': selectedPeriod, 'Métrica Primária': reportData.receitaMensal, 'Métrica Secundária': reportData.frequenciaMedia, 'Detalhes': 'Receita / Frequência' }
      ];

      const fullData = [...overviewData, ...evolutionData, ...classesData];

      await exportUtils.exportToExcel({
        fileName: `relatorio_mygym_${selectedPeriod}_${new Date().getTime()}`,
        data: fullData,
        sheetName: 'Relatório Geral'
      });
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
    }
  }, [trackButtonClick, selectedPeriod, reportData]);

  const StatCard = useCallback(({ icon, title, value, subtitle, color = profileTheme.primary[500] }) => (
    <GlassCard variant="subtle" style={[styles.statCard, { borderLeftColor: color }]} padding={ResponsiveUtils.spacing.md}>
      <View style={styles.statHeader}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <Text style={[styles.statTitle, { color: profileTheme.text.secondary }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color: profileTheme.text.primary }]}>{value}</Text>
      {subtitle && <Text style={[styles.statSubtitle, { color: profileTheme.text.hint }]}>{subtitle}</Text>}
    </GlassCard>
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
            {/* Período */}
            <GlassCard variant="card" style={styles.card} padding={SPACING.lg}>
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
            </GlassCard>

            {/* Estatísticas Gerais */}
            <GlassCard variant="card" style={styles.card} padding={SPACING.lg}>
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
            </GlassCard>

            {/* Aulas Mais Populares */}
            <GlassCard variant="card" style={styles.card} padding={SPACING.lg}>
              <Text style={[styles.sectionTitle, styles.title, { color: profileTheme.text.primary }]}>Aulas Mais Populares</Text>

              {reportData.aulasPopulares.map((aula, index) => (
                <GlassCard variant="subtle" key={index} style={styles.aulaItem} padding={ResponsiveUtils.spacing.md}>
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
                </GlassCard>
              ))}
            </GlassCard>

            {/* Evolução Mensal */}
            <GlassCard variant="card" style={styles.card} padding={SPACING.lg}>
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
            </GlassCard>

            {/* Ações */}
            <GlassCard variant="card" style={styles.card} padding={SPACING.lg}>
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
            </GlassCard>
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
