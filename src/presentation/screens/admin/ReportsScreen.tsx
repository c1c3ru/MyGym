import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl
} from 'react-native';
import {
  Text,
  Button,
  ProgressBar,
  DataTable,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@infrastructure/services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import GlassCard from '@components/GlassCard';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';
import exportUtils from '@shared/utils/exportUtils';
import type { NavigationProp } from '@react-navigation/native';

interface ReportsScreenProps {
  navigation: NavigationProp<any>;
}

interface Student {
  id: string;
  isActive?: boolean;
  classIds?: string[];
}

interface ClassInfo {
  id: string;
  name: string;
  modality: string;
  status: string;
  studentCount?: number;
}

interface Payment {
  id: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  amount: number;
  createdAt: any;
}



const ReportsScreen: React.FC<ReportsScreenProps> = ({ navigation }) => {
  const { userProfile, academia } = useAuthFacade();
  const { getString, isDarkMode, theme } = useTheme();

  // Dynamic Styles
  const backgroundGradient = isDarkMode
    ? [COLORS.gray[800], COLORS.gray[900], COLORS.black]
    : [COLORS.gray[100], COLORS.gray[50], COLORS.white];

  const textColor = theme.colors.text;
  const secondaryTextColor = theme.colors.textSecondary;
  const glassVariant = isDarkMode ? 'premium' : 'card';
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
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topClasses, setTopClasses] = useState<any[]>([]);

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

      const cacheKey = CACHE_KEYS.REPORTS(academiaId);

      const reportsData = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando dados dos relatórios (cache miss):', academiaId);

          const [students, classes, payments] = await Promise.all([
            academyFirestoreService.getAll('students', academiaId) as Promise<Student[]>,
            academyFirestoreService.getAll('classes', academiaId) as Promise<ClassInfo[]>,
            academyFirestoreService.getAll('payments', academiaId) as Promise<Payment[]>
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

          const classPopularity = classes.map(cls => ({
            ...cls,
            studentCount: students.filter(student =>
              student.classIds && student.classIds.includes(cls.id)
            ).length
          })).sort((a, b) => b.studentCount - a.studentCount).slice(0, 5);

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
        CACHE_TTL.SHORT
      );

      setStats(reportsData.stats);
      setTopClasses(reportsData.topClasses);
      setRecentActivities(reportsData.recentActivities);

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
  }, [userProfile?.academiaId, academia?.id, trackFeatureUsage, getString]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const academiaId = userProfile?.academiaId || academia?.id;
    if (academiaId) {
      cacheService.invalidatePattern(`reports:${academiaId}`);
    }
    loadReportsData();
  }, [loadReportsData, userProfile?.academiaId, academia?.id]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: getString ? getString('currency') : 'BRL'
    }).format(value || 0);
  }, [getString]);

  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case 'student': return 'person-add';
      case 'payment': return 'card';
      case 'class': return 'school';
      case 'checkin': return 'checkmark-circle';
      default: return 'information-circle';
    }
  }, []);

  const getActivityColor = useCallback((type: string) => {
    switch (type) {
      case 'student': return COLORS.info[400];
      case 'payment': return COLORS.success[400];
      case 'class': return COLORS.warning[400];
      case 'checkin': return COLORS.secondary[400];
      default: return COLORS.gray[400];
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
    trackButtonClick('export_pdf_report_admin', {});

    try {
      const date = new Date().toLocaleDateString('pt-BR');
      const time = new Date().toLocaleTimeString('pt-BR');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Relatório Gerencial - MyGym</title>
            <style>
              body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; background-color: #fff; }
              .header { margin-bottom: 30px; border-bottom: 3px solid #3498db; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
              h1 { color: #2c3e50; margin: 0; font-size: 28px; }
              .academia-name { color: #3498db; font-size: 18px; font-weight: bold; }
              .meta-info { text-align: right; font-size: 12px; color: #7f8c8d; }
              
              h2 { color: #2980b9; margin-top: 40px; border-bottom: 1px solid #eee; padding-bottom: 10px; font-size: 20px; }
              
              .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
              .stat-card { background: #f8f9fa; border: 1px solid #e1e8ed; border-radius: 10px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
              .stat-label { font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
              .stat-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
              .stat-sub { font-size: 12px; color: #95a5a6; margin-top: 5px; }
              
              .chart-section { margin-top: 30px; }
              .chart-container { background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 10px; }
              .bar-row { margin-bottom: 15px; }
              .bar-label { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
              .bar-bg { background: #ecf0f1; height: 12px; border-radius: 6px; overflow: hidden; }
              .bar-fill { height: 100%; border-radius: 6px; }
              .fill-primary { background: #3498db; }
              .fill-success { background: #27ae60; }
              .fill-warning { background: #f1c40f; }
              
              table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #fff; }
              th { background-color: #f8f9fa; text-align: left; padding: 12px; border-bottom: 2px solid #3498db; color: #2c3e50; font-weight: bold; }
              td { padding: 12px; border-bottom: 1px solid #eee; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              
              .footer { margin-top: 60px; font-size: 11px; color: #bdc3c7; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
              
              @media print {
                body { padding: 0; }
                .stat-card { break-inside: avoid; }
                table { break-inside: auto; }
                tr { break-inside: avoid; break-after: auto; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>Relatório Gerencial</h1>
                <div class="academia-name">${academia?.name || 'MyGym Academy'}</div>
              </div>
              <div class="meta-info">
                Gerado em: ${date} às ${time}<br>
                Identificador: #${Math.floor(Math.random() * 1000000)}
              </div>
            </div>
 
            <h2>Visão Geral</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Engajamento de Alunos</div>
                <div class="stat-value">${stats.totalStudents}</div>
                <div class="stat-sub">${stats.activeStudents} alunos ativos (${stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%)</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Capacidade de Turmas</div>
                <div class="stat-value">${stats.totalClasses}</div>
                <div class="stat-sub">${stats.activeClasses} turmas em operação</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Receita Mensal</div>
                <div class="stat-value">${formatCurrency(stats.monthlyRevenue)}</div>
                <div class="stat-sub">Referente ao mês atual</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Adimplência</div>
                <div class="stat-value">${stats.pendingPayments}</div>
                <div class="stat-sub">Pagamentos aguardando quitação</div>
              </div>
            </div>
 
            <div class="chart-section">
              <h2>Indicadores de Performance</h2>
              <div class="chart-container">
                <div class="bar-row">
                  <div class="bar-label">
                    <span>Taxa de Retenção (Alunos Ativos)</span>
                    <span>${stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%</span>
                  </div>
                  <div class="bar-bg">
                    <div class="bar-fill fill-primary" style="width: ${stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%"></div>
                  </div>
                </div>
                
                <div class="bar-row">
                  <div class="bar-label">
                    <span>Ocupação de Turmas</span>
                    <span>${stats.totalClasses > 0 ? Math.round((stats.activeClasses / stats.totalClasses) * 100) : 0}%</span>
                  </div>
                  <div class="bar-bg">
                    <div class="bar-fill fill-success" style="width: ${stats.totalClasses > 0 ? Math.round((stats.activeClasses / stats.totalClasses) * 100) : 0}%"></div>
                  </div>
                </div>
              </div>
            </div>
 
            <h2>Ranking de Turmas Populares</h2>
            <table>
              <thead>
                <tr>
                  <th>Turma</th>
                  <th>Modalidade</th>
                  <th style="text-align: right;">Total de Alunos</th>
                  <th style="text-align: right;">Popularidade</th>
                </tr>
              </thead>
              <tbody>
                ${topClasses.map(cls => {
        const percentage = stats.totalStudents > 0 ? Math.round((cls.studentCount / stats.totalStudents) * 100) : 0;
        return `
                    <tr>
                      <td><strong>${cls.name}</strong></td>
                      <td>${cls.modality}</td>
                      <td style="text-align: right;">${cls.studentCount}</td>
                      <td style="text-align: right;">
                        <span style="display: inline-block; width: 60px; background: #eee; height: 8px; border-radius: 4px; overflow: hidden; vertical-align: middle; margin-right: 5px;">
                          <div style="width: ${percentage}%; background: #3498db; height: 100%;"></div>
                        </span>
                        ${percentage}%
                      </td>
                    </tr>
                  `;
      }).join('')}
              </tbody>
            </table>
 
            <div class="footer">
              Este relatório é um documento oficial da ${academia?.name || 'MyGym Academy'}.<br>
              Gerado automaticamente pelo sistema de gestão MyGym em ${date}.
            </div>
          </body>
        </html>
      `;

      await exportUtils.exportToPDF({
        title: `Relatório Gerencial - ${date}`,
        htmlContent
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  }, [trackButtonClick, stats, topClasses, formatCurrency]);

  const handleExportExcel = useCallback(async () => {
    trackButtonClick('export_excel_report_admin', {});

    try {
      const generalStats = [
        { Categoria: 'Geral', Métrica: 'Total Alunos', Valor: stats.totalStudents },
        { Categoria: 'Geral', Métrica: 'Alunos Ativos', Valor: stats.activeStudents },
        { Categoria: 'Geral', Métrica: 'Total Turmas', Valor: stats.totalClasses },
        { Categoria: 'Geral', Métrica: 'Turmas Ativas', Valor: stats.activeClasses },
        { Categoria: 'Financeiro', Métrica: 'Receita Mensal', Valor: stats.monthlyRevenue },
        { Categoria: 'Financeiro', Métrica: 'Receita Total', Valor: stats.totalRevenue },
        { Categoria: 'Financeiro', Métrica: 'Pagamentos Pendentes', Valor: stats.pendingPayments },
      ];

      const classesData = topClasses.map(cls => ({
        Categoria: 'Turma',
        Métrica: cls.name,
        Valor: cls.studentCount,
        Detalhe: cls.modality
      }));

      const fullData = [...generalStats, ...classesData];

      await exportUtils.exportToExcel({
        fileName: `relatorio_admin_${new Date().getTime()}`,
        data: fullData,
        sheetName: 'Relatório Admin'
      });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
    }
  }, [trackButtonClick, stats, topClasses]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </SafeAreaView>
    );
  }

  return (
    <EnhancedErrorBoundary
      onError={(error: Error, errorInfo: any, errorId: string) => {
        console.error('🚨 Erro no ReportsScreen:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'ReportsScreen', academiaId: userProfile?.academiaId }}
    >
      <View style={styles.container}>
        {/* Background Gradient Principal */}
        <LinearGradient
          colors={backgroundGradient as any}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary[500]}
                colors={[COLORS.primary[500]]}
              />
            }
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: textColor }]}>Relatórios Gerenciais</Text>
              <Text style={[styles.subtitle, { color: secondaryTextColor }]}>Visão geral do desempenho da academia</Text>
            </View>

            {/* Estatísticas Principais */}
            <GlassCard style={styles.card} variant={glassVariant}>
              <View style={[styles.cardHeader, { borderBottomColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : hexToRgba(COLORS.black, 0.05) }]}>
                <Text style={[styles.cardTitle, { color: textColor }]}>Estatísticas Principais</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <LinearGradient
                    colors={[COLORS.info[700], COLORS.info[900]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="people" size={24} color={COLORS.white} />
                  </LinearGradient>
                  <View style={styles.statContent}>
                    <Text style={styles.statNumber}>{stats.totalStudents}</Text>
                    <Text style={styles.statLabel}>Total de Alunos</Text>
                    <Text style={styles.statSubtext}>{stats.activeStudents} ativos</Text>
                  </View>
                </View>

                <View style={styles.statItem}>
                  <LinearGradient
                    colors={[COLORS.primary[600], COLORS.primary[800]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="school" size={24} color={COLORS.white} />
                  </LinearGradient>
                  <View style={styles.statContent}>
                    <Text style={styles.statNumber}>{stats.totalClasses}</Text>
                    <Text style={styles.statLabel}>Total de Turmas</Text>
                    <Text style={styles.statSubtext}>{stats.activeClasses} ativas</Text>
                  </View>
                </View>

                <View style={styles.statItem}>
                  <LinearGradient
                    colors={[COLORS.success[600], COLORS.success[800]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="card" size={24} color={COLORS.white} />
                  </LinearGradient>
                  <View style={styles.statContent}>
                    <Text style={[styles.statNumber, { color: textColor }]}>{formatCurrency(stats.monthlyRevenue)}</Text>
                    <Text style={[styles.statLabel, { color: secondaryTextColor }]}>Receita Mensal</Text>
                    <Text style={[styles.statSubtext, { color: secondaryTextColor }]}>Total: {formatCurrency(stats.totalRevenue)}</Text>
                  </View>
                </View>

                <View style={styles.statItem}>
                  <LinearGradient
                    colors={[COLORS.error[600], COLORS.error[800]]}
                    style={styles.statIcon}
                  >
                    <Ionicons name="time" size={24} color={COLORS.white} />
                  </LinearGradient>
                  <View style={styles.statContent}>
                    <Text style={styles.statNumber}>{stats.pendingPayments}</Text>
                    <Text style={styles.statLabel}>Pagamentos Pendentes</Text>
                    <Text style={styles.statSubtext}>Requer atenção</Text>
                  </View>
                </View>
              </View>
            </GlassCard>

            {/* Taxa de Ocupação */}
            <GlassCard style={styles.card} variant={glassVariant}>
              <View style={[styles.cardHeader, { borderBottomColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : hexToRgba(COLORS.black, 0.05) }]}>
                <Text style={[styles.cardTitle, { color: textColor }]}>Taxa de Ocupação</Text>
              </View>

              <View style={styles.occupancyContainer}>
                <View style={styles.occupancyHeader}>
                  <Text style={[styles.occupancyLabel, { color: secondaryTextColor }]}>Alunos Ativos</Text>
                  <Text style={[styles.occupancyValue, { color: textColor }]}>{stats.activeStudents} / {stats.totalStudents}</Text>
                </View>
                <ProgressBar
                  progress={stats.totalStudents > 0 ? stats.activeStudents / stats.totalStudents : 0}
                  color={COLORS.primary[500]}
                  style={styles.progressBar}
                />
                <Text style={styles.occupancyPercentage}>
                  {stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}% de ocupação
                </Text>
              </View>

              <View style={styles.occupancyContainer}>
                <View style={styles.occupancyHeader}>
                  <Text style={[styles.occupancyLabel, { color: secondaryTextColor }]}>Turmas Ativas</Text>
                  <Text style={[styles.occupancyValue, { color: textColor }]}>{stats.activeClasses} / {stats.totalClasses}</Text>
                </View>
                <ProgressBar
                  progress={stats.totalClasses > 0 ? stats.activeClasses / stats.totalClasses : 0}
                  color={COLORS.info[500]}
                  style={styles.progressBar}
                />
                <Text style={styles.occupancyPercentage}>
                  {stats.totalClasses > 0 ? Math.round((stats.activeClasses / stats.totalClasses) * 100) : 0}% ativas
                </Text>
              </View>
            </GlassCard>

            {/* Turmas Mais Populares */}
            <GlassCard style={styles.card} variant={glassVariant}>
              <View style={[styles.cardHeader, { borderBottomColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : hexToRgba(COLORS.black, 0.05) }]}>
                <Text style={[styles.cardTitle, { color: textColor }]}>Turmas Mais Populares</Text>
              </View>

              <DataTable>
                <DataTable.Header style={[styles.tableHeader, { borderBottomColor: isDarkMode ? hexToRgba(COLORS.white, 0.1) : hexToRgba(COLORS.black, 0.1) }]}>
                  <DataTable.Title textStyle={{ color: secondaryTextColor }}>Turma</DataTable.Title>
                  <DataTable.Title textStyle={{ color: secondaryTextColor }}>Modalidade</DataTable.Title>
                  <DataTable.Title numeric textStyle={{ color: secondaryTextColor }}>Alunos</DataTable.Title>
                </DataTable.Header>

                {topClasses.map((classItem, index) => (
                  <DataTable.Row key={classItem.id || index} style={[styles.tableRow, { borderBottomColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : hexToRgba(COLORS.black, 0.05) }]}>
                    <DataTable.Cell textStyle={{ color: textColor }}>{classItem.name}</DataTable.Cell>
                    <DataTable.Cell textStyle={{ color: textColor }}>{classItem.modality}</DataTable.Cell>
                    <DataTable.Cell numeric textStyle={{ color: textColor }}>{classItem.studentCount}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>

              {topClasses.length === 0 && (
                <Text style={styles.noDataText}>Nenhuma turma encontrada</Text>
              )}
            </GlassCard>

            {/* Atividades Recentes */}
            <GlassCard style={styles.card} variant={glassVariant}>
              <View style={[styles.cardHeader, { borderBottomColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : hexToRgba(COLORS.black, 0.05) }]}>
                <Text style={[styles.cardTitle, { color: textColor }]}>Atividades Recentes</Text>
              </View>

              {recentActivities.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
                    <Ionicons name={getActivityIcon(activity.type)} size={18} color={getActivityColor(activity.type)} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityAction, { color: textColor }]}>{activity.action}</Text>
                    <Text style={[styles.activityTime, { color: secondaryTextColor }]}>{activity.time}</Text>
                  </View>
                </View>
              ))}
            </GlassCard>

            {/* Ações Rápidas */}
            <GlassCard style={styles.card} variant={glassVariant}>
              <View style={[styles.cardHeader, { borderBottomColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : hexToRgba(COLORS.black, 0.05) }]}>
                <Text style={[styles.cardTitle, { color: textColor }]}>Ações Rápidas</Text>
              </View>

              <View style={styles.actionsContainer}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('AddStudent')}
                  style={[styles.actionButton, { backgroundColor: COLORS.info[600] }]}
                  contentStyle={styles.actionButtonContent}
                  icon={({ size, color }) => <MaterialCommunityIcons name="account-plus" size={size} color={color} />}
                >
                  Novo Aluno
                </Button>

                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('AddClass')}
                  style={[styles.actionButton, { backgroundColor: COLORS.primary[600] }]}
                  contentStyle={styles.actionButtonContent}
                  icon={({ size, color }) => <MaterialCommunityIcons name="school-outline" size={size} color={color} />}
                >
                  Nova Turma
                </Button>
              </View>
            </GlassCard>

            {/* Exportar Relatórios */}
            <GlassCard style={styles.card} variant={glassVariant}>
              <View style={[styles.cardHeader, { borderBottomColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : hexToRgba(COLORS.black, 0.05) }]}>
                <Text style={[styles.cardTitle, { color: textColor }]}>Exportar Relatórios</Text>
              </View>

              <View style={styles.actionsContainer}>
                <Button
                  mode="outlined"
                  onPress={handleExportPDF}
                  style={[styles.actionButton, { borderColor: COLORS.error[500], borderWidth: 1 }]}
                  contentStyle={styles.actionButtonContent}
                  textColor={COLORS.error[500]}
                  icon={({ size, color }) => <MaterialCommunityIcons name="file-pdf-box" size={size} color={color} />}
                >
                  PDF
                </Button>

                <Button
                  mode="outlined"
                  onPress={handleExportExcel}
                  style={[styles.actionButton, { borderColor: COLORS.success[600], borderWidth: 1 }]}
                  contentStyle={styles.actionButtonContent}
                  textColor={COLORS.success[600]}
                  icon={({ size, color }) => <MaterialCommunityIcons name="microsoft-excel" size={size} color={color} />}
                >
                  Excel
                </Button>
              </View>
            </GlassCard>
          </ScrollView>
        </SafeAreaView>
      </View>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl * 3,
  },
  header: {
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[400],
    marginTop: SPACING.xs,
  },
  // Glass Card Styles

  card: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  cardHeader: {
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: hexToRgba(COLORS.white, 0.05),
    paddingBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: hexToRgba(COLORS.white, 0.03),
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.white, 0.05),
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[400],
    marginTop: 2,
  },
  statSubtext: {
    fontSize: FONT_SIZE.xxs,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  // Occupancy
  occupancyContainer: {
    marginBottom: 20,
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  occupancyLabel: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[300],
  },
  occupancyValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
  },
  progressBar: {
    height: 8,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
    backgroundColor: hexToRgba(COLORS.white, 0.1),
  },
  occupancyPercentage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    textAlign: 'right',
  },
  // Table
  tableHeader: {
    borderBottomColor: hexToRgba(COLORS.white, 0.1),
  },
  tableTitle: {
    color: COLORS.gray[400],
    fontSize: FONT_SIZE.sm,
  },
  tableRow: {
    borderBottomColor: hexToRgba(COLORS.white, 0.05),
  },
  tableCell: {
    color: COLORS.white,
  },
  noDataText: {
    textAlign: 'center',
    color: COLORS.gray[500],
    fontStyle: 'italic',
    marginTop: SPACING.md,
  },
  // Activity
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: hexToRgba(COLORS.white, 0.05),
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: FONT_SIZE.base,
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.medium,
  },
  activityTime: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
  },
  actionButtonContent: {
    height: 48,
  },
});

export default ReportsScreen;
