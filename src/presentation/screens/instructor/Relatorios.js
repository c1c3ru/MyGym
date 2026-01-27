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
import { useProfileTheme } from "@contexts/ProfileThemeContext";
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

          try {
            const { academyFirestoreService, academyClassService } = await import('@infrastructure/services/academyFirestoreService');

            // Buscar turmas do instrutor
            const instructorClasses = await academyClassService.getClassesByInstructor(user.id, userProfile.academiaId);

            // Buscar alunos de todas as turmas do instrutor
            const allStudents = await academyFirestoreService.getAll('users', userProfile.academiaId);
            const activeStudents = allStudents.filter(student =>
              student.isActive &&
              student.classIds?.some(classId => instructorClasses.some(c => c.id === classId))
            );

            // Buscar check-ins para calcular frequência
            const checkIns = await academyFirestoreService.getAll('checkIns', userProfile.academiaId);
            const instructorCheckIns = checkIns.filter(checkIn =>
              instructorClasses.some(c => c.id === checkIn.classId)
            );

            // Calcular estatísticas por turma
            const classStats = instructorClasses.map(classItem => {
              const classStudents = activeStudents.filter(s => s.classIds?.includes(classItem.id));
              const classCheckIns = instructorCheckIns.filter(ci => ci.classId === classItem.id);
              const frequencia = classStudents.length > 0
                ? Math.round((classCheckIns.length / (classStudents.length * 4)) * 100) // Assumindo 4 aulas por mês
                : 0;

              return {
                nome: classItem.name || 'Turma sem nome',
                alunos: classStudents.length,
                frequencia: Math.min(frequencia, 100)
              };
            });

            // Ordenar por número de alunos
            const aulasPopulares = classStats
              .sort((a, b) => b.alunos - a.alunos)
              .slice(0, 5);

            // Calcular frequência média geral
            const frequenciaMedia = aulasPopulares.length > 0
              ? Math.round(aulasPopulares.reduce((acc, aula) => acc + aula.frequencia, 0) / aulasPopulares.length)
              : 0;

            // Buscar pagamentos (se disponível)
            let receitaMensal = 0;
            try {
              const payments = await academyFirestoreService.getAll('payments', userProfile.academiaId);
              const thisMonthPayments = payments.filter(p => {
                const paymentDate = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
                const now = new Date();
                return paymentDate.getMonth() === now.getMonth() &&
                  paymentDate.getFullYear() === now.getFullYear() &&
                  p.status === 'paid';
              });
              receitaMensal = thisMonthPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
            } catch (error) {
              console.warn('Não foi possível buscar pagamentos:', error);
            }

            // Evolução mensal (últimos 3 meses)
            const now = new Date();
            const evolucaoMensal = [];
            for (let i = 2; i >= 0; i--) {
              const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'short' });
              const monthStudents = activeStudents.filter(s => {
                const createdDate = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt);
                return createdDate <= monthDate;
              });

              evolucaoMensal.push({
                mes: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                alunos: monthStudents.length,
                receita: Math.round(receitaMensal * (0.8 + (i * 0.1))) // Estimativa baseada no mês atual
              });
            }

            return {
              totalAulas: instructorClasses.length,
              totalAlunos: activeStudents.length,
              frequenciaMedia,
              receitaMensal,
              aulasPopulares,
              evolucaoMensal
            };
          } catch (error) {
            console.error('Erro ao buscar dados reais:', error);
            // Fallback para dados mockados em caso de erro
            return {
              totalAulas: 0,
              totalAlunos: 0,
              frequenciaMedia: 0,
              receitaMensal: 0,
              aulasPopulares: [],
              evolucaoMensal: []
            };
          }
        },
        CACHE_TTL.MEDIUM
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
      const date = new Date().toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'pt-BR');
      const primaryColor = profileTheme.primary[500];
      const secondaryColor = profileTheme.secondary[500];
      const textColor = '#333333'; // Core text color for PDF readability
      const lightBg = '#f0f2f5';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${getString('reportsExportTitle')}</title>
            <style>
              body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: ${textColor}; line-height: 1.6; background-color: ${lightBg}; }
              .document { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
              .header { margin-bottom: 30px; border-bottom: 4px solid ${primaryColor}; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
              h1 { color: #2c3e50; margin: 0; font-size: 24px; }
              .instructor-name { color: ${secondaryColor}; font-size: 18px; font-weight: bold; }
              .meta-info { text-align: right; font-size: 11px; color: #7f8c8d; }
              
              h2 { color: ${primaryColor}; margin-top: 40px; border-bottom: 1px solid #eee; padding-bottom: 10px; font-size: 18px; text-transform: uppercase; }
              
              .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px; }
              .stat-box { background: #fffcf9; border: 1px solid ${primaryColor}40; border-radius: 8px; padding: 15px; text-align: center; }
              .stat-label { font-size: 10px; color: #7f8c8d; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; }
              .stat-value { font-size: 22px; font-weight: bold; color: ${secondaryColor}; }
              
              .chart-container { margin-top: 30px; background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 8px; }
              .bar-group { margin-bottom: 20px; }
              .bar-label { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; font-weight: 500; }
              .bar-outer { background: #f1f3f5; height: 12px; border-radius: 6px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1); }
              .bar-inner { height: 100%; border-radius: 6px; background: linear-gradient(90deg, ${primaryColor}, ${secondaryColor}); transition: width 0.5s ease; }
              
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
              th { background-color: ${primaryColor}10; text-align: left; padding: 12px; border-bottom: 2px solid ${primaryColor}; color: ${secondaryColor}; font-weight: bold; }
              td { padding: 12px; border-bottom: 1px solid #eee; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              
              .footer { margin-top: 60px; font-size: 10px; color: #adb5bd; text-align: center; border-top: 1px solid #dee2e6; padding-top: 20px; }
              
              @media print {
                body { background: white; padding: 0; }
                .document { box-shadow: none; border: none; max-width: 100%; }
              }
            </style>
          </head>
          <body>
            <div class="document">
              <div class="header">
                <div>
                  <h1>${getString('reportsActivityReport')}</h1>
                  <div class="instructor-name">${userProfile?.name || getString('instructor')}</div>
                </div>
                <div class="meta-info">
                  ${getString('reportsPeriod')}: ${selectedPeriod.toUpperCase()}<br>
                  ${getString('reportsGeneratedAt')} ${date}
                </div>
              </div>
  
              <div class="stats-row">
                <div class="stat-box">
                  <div class="stat-label">${getString('reportsTotalClasses')}</div>
                  <div class="stat-value">${reportData.totalAulas}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">${getString('reportsActiveStudents')}</div>
                  <div class="stat-value">${reportData.totalAlunos}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">${getString('reportsFrequency')}</div>
                  <div class="stat-value">${reportData.frequenciaMedia}%</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">${getString('reportsRevenue')}</div>
                  <div class="stat-value">R$ ${Math.round(reportData.receitaMensal / 1000)}k</div>
                </div>
              </div>
  
              <div class="chart-container">
                <div class="bar-group">
                  <div class="bar-label"><span>${getString('reportsAvgStudentFrequency')}</span><span>${reportData.frequenciaMedia}%</span></div>
                  <div class="bar-outer"><div class="bar-inner" style="width: ${reportData.frequenciaMedia}%"></div></div>
                </div>
                <div class="bar-group">
                  <div class="bar-label"><span>${getString('reportsCapacityUsed')}</span><span>78%</span></div>
                  <div class="bar-outer"><div class="bar-inner" style="width: 78%; background: #51cf66;"></div></div>
                </div>
              </div>
  
              <h2>${getString('reportsClassDetail')}</h2>
              <table>
                <thead>
                  <tr>
                    <th>${getString('reportsClassTableClass')}</th>
                    <th style="text-align: center;">${getString('reportsClassTableEnrolled')}</th>
                    <th style="text-align: center;">${getString('reportsClassTablePresence')}</th>
                    <th style="text-align: right;">${getString('reportsClassTableStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.aulasPopulares.map(aula => `
                    <tr>
                      <td><strong>${aula.nome}</strong></td>
                      <td style="text-align: center;">${aula.alunos}</td>
                      <td style="text-align: center;">
                        <span style="font-size: 11px; font-weight: bold; color: ${secondaryColor};">${aula.frequencia}%</span>
                      </td>
                      <td style="text-align: right;"><span style="color: #2f9e44; font-size: 11px; font-weight: bold;">● ${getString('reportsStable')}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
  
              <h2>${getString('reportsRecentHistory')}</h2>
              <table>
                <thead>
                  <tr>
                    <th>${getString('reportsMonthTableMonth')}</th>
                    <th>${getString('reportsMonthTableTotalStudents')}</th>
                    <th style="text-align: right;">${getString('reportsMonthTableEstimatedRevenue')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.evolucaoMensal.map(mes => `
                    <tr>
                      <td>${mes.mes}</td>
                      <td>${mes.alunos} ${getString('reportsEnrolledLower')}</td>
                      <td style="text-align: right;">R$ ${mes.receita.toLocaleString(currentLanguage === 'en' ? 'en-US' : 'pt-BR')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
  
              <div class="footer">
                ${getString('reportsGeneratedBy')}<br>
                ${getString('reportsAllRightsReserved')} ${new Date().getFullYear()}.
              </div>
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
        [getString('reportsCategory')]: getString('reportsEvolutionMonthly'),
        [getString('reportsPeriod')]: item.mes,
        [getString('reportsPrimaryMetric')]: item.alunos, // Alunos
        [getString('reportsSecondaryMetric')]: item.receita, // Receita
        [getString('reportsDetails')]: '-'
      }));

      const classesData = reportData.aulasPopulares.map(item => ({
        [getString('reportsCategory')]: getString('reportsPopularClasses'),
        [getString('reportsPeriod')]: selectedPeriod,
        [getString('reportsPrimaryMetric')]: item.alunos, // Alunos
        [getString('reportsSecondaryMetric')]: item.frequencia, // Frequência (%)
        [getString('reportsDetails')]: item.nome
      }));

      const overviewData = [
        { [getString('reportsCategory')]: getString('reportsSummary'), [getString('reportsPeriod')]: selectedPeriod, [getString('reportsPrimaryMetric')]: reportData.totalAlunos, [getString('reportsSecondaryMetric')]: reportData.totalAulas, [getString('reportsDetails')]: 'Total Alunos / Total Aulas' },
        { [getString('reportsCategory')]: getString('reportsSummary'), [getString('reportsPeriod')]: selectedPeriod, [getString('reportsPrimaryMetric')]: reportData.receitaMensal, [getString('reportsSecondaryMetric')]: reportData.frequenciaMedia, [getString('reportsDetails')]: 'Receita / Frequência' }
      ];

      const fullData = [...overviewData, ...evolutionData, ...classesData];

      await exportUtils.exportToExcel({
        fileName: `relatorio_mygym_${selectedPeriod}_${new Date().getTime()}`,
        data: fullData,
        sheetName: getString('reportsSheetGeneral')
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
                <Text style={[styles.title, styles.title, { color: profileTheme.text.primary }]}>{getString('reportsAnalyzesAndReports')}</Text>
              </View>

              <SegmentedButtons
                value={selectedPeriod}
                onValueChange={(value) => {
                  trackButtonClick('change_report_period', { period: value });
                  setSelectedPeriod(value);
                }}
                buttons={[
                  { value: 'semana', label: getString('reportsWeek') },
                  { value: 'mes', label: getString('reportsMonth') },
                  { value: 'ano', label: getString('reportsYear') }
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
              <Text style={[styles.sectionTitle, styles.title, { color: profileTheme.text.primary }]}>{getString('reportsOverview')}</Text>

              <View style={styles.statsGrid}>
                <StatCard
                  icon="school"
                  title={getString('reportsTotalClasses')}
                  value={reportData.totalAulas}
                  subtitle={getString('reportsThisMonth')}
                  color={profileTheme.primary[500]}
                />

                <StatCard
                  icon="account-group"
                  title={getString('reportsActiveStudents')}
                  value={reportData.totalAlunos}
                  subtitle={`+15 ${getString('reportsThisMonth')}`}
                  color={profileTheme.info || COLORS.info[500]}
                />

                <StatCard
                  icon="chart-line"
                  title={getString('reportsFrequency')}
                  value={`${reportData.frequenciaMedia}%`}
                  subtitle={`+3% ${getString('reportsGrowth')}`}
                  color={COLORS.warning[500]}
                />

                <StatCard
                  icon="currency-usd"
                  title={getString('reportsRevenue')}
                  value={`R$ ${reportData.receitaMensal.toLocaleString()}`}
                  subtitle={`+12% ${getString('reportsGrowth')}`}
                  color={profileTheme.secondary[500]}
                />
              </View>
            </GlassCard>

            {/* Aulas Mais Populares */}
            <GlassCard variant="card" style={styles.card} padding={SPACING.lg}>
              <Text style={[styles.sectionTitle, styles.title, { color: profileTheme.text.primary }]}>{getString('reportsMostPopularClasses')}</Text>

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
                    <Text style={[styles.aulaAlunos, { color: profileTheme.text.secondary }]}>{aula.alunos} {getString('reportsStudentsLower')}</Text>
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
              <Text style={[styles.sectionTitle, styles.title, { color: profileTheme.text.primary }]}>{getString('reportsLastMonthsEvolution')}</Text>

              {reportData.evolucaoMensal.map((mes, index) => (
                <View key={index} style={[styles.evolucaoItem, { borderBottomColor: profileTheme.text.disabled }]}>
                  <Text style={[styles.evolucaoMes, { color: profileTheme.text.primary }]}>{mes.mes}</Text>
                  <View style={styles.evolucaoData}>
                    <View style={styles.evolucaoMetric}>
                      <MaterialCommunityIcons name="account-group" size={16} color={profileTheme.info || COLORS.info[500]} />
                      <Text style={[styles.evolucaoValue, { color: profileTheme.text.secondary }]}>{mes.alunos} {getString('reportsStudentsLower')}</Text>
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
              <Text style={[styles.sectionTitle, styles.title, { color: profileTheme.text.primary }]}>{getString('reportsExportReports')}</Text>

              <View style={styles.exportButtons}>
                <Button
                  mode="outlined"
                  icon="file-pdf-box"
                  onPress={handleExportPDF}
                  style={[styles.exportButton, { borderColor: profileTheme.primary[500] }]}
                  textColor={profileTheme.primary[500]}
                >
                  {getString('reportsExportPDF')}
                </Button>

                <Button
                  mode="outlined"
                  icon="microsoft-excel"
                  onPress={handleExportExcel}
                  style={[styles.exportButton, { borderColor: profileTheme.secondary[500] }]}
                  textColor={profileTheme.secondary[500]}
                >
                  {getString('reportsExportExcel')}
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
    flexWrap: 'wrap',
    flex: 1,
  },
  statValue: {
    fontSize: ResponsiveUtils.fontSize.extraLarge,
    fontWeight: FONT_WEIGHT.bold,
    flexWrap: 'wrap',
  },
  statSubtitle: {
    fontSize: ResponsiveUtils.fontSize.small,
    marginTop: 2,
    flexWrap: 'wrap',
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
    flexWrap: 'wrap',
    marginRight: SPACING.sm,
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
