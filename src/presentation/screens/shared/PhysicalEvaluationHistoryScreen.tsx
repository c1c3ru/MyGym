import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, Platform } from 'react-native';
import {
  Card,
  Text,
  Button,
  FAB,
  Chip,
  Divider,
  Surface,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp } from '@react-navigation/native';

interface PhysicalEvaluationHistoryScreenProps {
  navigation: NavigationProp<any>;
}

const { width } = Dimensions.get('window');

const PhysicalEvaluationHistoryScreen = ({ navigation }: PhysicalEvaluationHistoryScreenProps) => {
  const { user, academia, userProfile } = useAuth();
  const { getString, isDarkMode } = useTheme();

  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('weight');

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      setLoading(true);

      // Verificar se academia está disponível
      const academiaId = academia?.id || userProfile?.academiaId;
      if (!academiaId) {
        console.error(getString('academyNotIdentified'));
        setEvaluations([]);
        return;
      }

      const evaluationData = await academyFirestoreService.getWhere(
        'physicalEvaluations',
        'studentId',
        '==',
        user.id,
        academiaId
      );

      setEvaluations(evaluationData);
    } catch (error) {
      console.error('Erro ao carregar avaliações físicas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvaluations();
  };

  const getIMCColor = (classification: string) => {
    switch (classification) {
      case 'underweight':
      case 'Abaixo do peso':
        return COLORS.warning[500];
      case 'normalWeight':
      case 'Peso normal':
        return COLORS.success[500];
      case 'overweight':
      case 'Sobrepeso':
        return COLORS.warning[500];
      case 'obesityI':
      case 'Obesidade grau I':
        return COLORS.error[500];
      case 'obesityII':
      case 'Obesidade grau II':
        return COLORS.error[500];
      case 'obesityIII':
      case 'Obesidade grau III':
        return COLORS.secondary[500];
      default: return COLORS.gray[500];
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const evalDate = date.toDate ? date.toDate() : new Date(date);
    return evalDate.toLocaleDateString('pt-BR');
  };

  const getChartData = () => {
    if (evaluations.length === 0) return null;

    const sortedEvaluations = [...evaluations].reverse(); // Ordem cronológica
    const labels = sortedEvaluations.map(evaluation => {
      const date = evaluation.date.toDate ? evaluation.date.toDate() : new Date(evaluation.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    let data;
    let suffix = '';

    switch (selectedMetric) {
      case 'weight':
        data = sortedEvaluations.map(evaluation => evaluation.weight);
        suffix = ' kg';
        break;
      case 'imc':
        data = sortedEvaluations.map(evaluation => evaluation.imc);
        suffix = '';
        break;
      case 'bodyFat':
        data = sortedEvaluations.filter(evaluation => evaluation.bodyFat).map(evaluation => evaluation.bodyFat);
        suffix = '%';
        break;
      case 'muscleMass':
        data = sortedEvaluations.filter(evaluation => evaluation.muscleMass).map(evaluation => evaluation.muscleMass);
        suffix = ' kg';
        break;
      default:
        data = sortedEvaluations.map(evaluation => evaluation.weight);
        suffix = ' kg';
    }

    if (data.length === 0) return null;

    return {
      labels: labels.slice(-10), // Últimas 10 medições
      datasets: [
        {
          data: data.slice(-10),
          strokeWidth: 3,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        },
      ],
      suffix
    };
  };

  const getLatestEvaluation = () => {
    return evaluations.length > 0 ? evaluations[0] : null;
  };

  const getProgress = () => {
    if (evaluations.length < 2) return null;

    const latest = evaluations[0];
    const previous = evaluations[1];

    const weightDiff = latest.weight - previous.weight;
    const imcDiff = latest.imc - previous.imc;

    return {
      weight: weightDiff,
      imc: imcDiff,
      bodyFat: latest.bodyFat && previous.bodyFat ? latest.bodyFat - previous.bodyFat : null,
      muscleMass: latest.muscleMass && previous.muscleMass ? latest.muscleMass - previous.muscleMass : null
    };
  };

  const chartData = getChartData();
  const latestEvaluation = getLatestEvaluation();
  const progress = getProgress();

  const metrics = [
    { key: 'weight', label: getString('weightKg').replace(' (kg)', ''), icon: 'scale-outline' },
    { key: 'imc', label: 'IMC', icon: 'calculator-outline' },
    { key: 'bodyFat', label: getString('bodyFatPercent').replace(' (%)', ''), icon: 'body-outline' },
    { key: 'muscleMass', label: getString('muscleMassKg').replace(' (kg)', ''), icon: 'fitness-outline' }
  ];

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary[500]} />
          }
        >
          {/* Resumo Atual */}
          {latestEvaluation && (
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="fitness-outline" size={24} color={COLORS.primary[500]} />
                <Text style={styles.cardTitle}>{getString('currentEvaluation')}</Text>
                <Text style={styles.dateText}>{formatDate(latestEvaluation.date)}</Text>
              </View>

              <View style={styles.statsGrid}>
                <Surface style={styles.statItem}>
                  <Text style={styles.statValue}>{latestEvaluation.weight} kg</Text>
                  <Text style={styles.statLabel}>{getString('weightKg').replace(' (kg)', '')}</Text>
                </Surface>

                <Surface style={styles.statItem}>
                  <Text style={styles.statValue}>{latestEvaluation.imc}</Text>
                  <Text style={styles.statLabel}>IMC</Text>
                </Surface>

                <Surface style={styles.statItem}>
                  <Text style={styles.statValue}>{latestEvaluation.height} cm</Text>
                  <Text style={styles.statLabel}>{getString('heightCm').replace(' (cm)', '')}</Text>
                </Surface>

                <Surface style={styles.statItem}>
                  <Text style={styles.statValue}>{latestEvaluation.age} {getString('ageYears').replace(' (anos)', '')}</Text>
                  <Text style={styles.statLabel}>{getString('ageYears').replace(' (anos)', '')}</Text>
                </Surface>
              </View>

              <View style={styles.imcContainer}>
                <Chip
                  mode="flat"
                  style={[styles.imcChip, { backgroundColor: getIMCColor(latestEvaluation.imcClassification) }]}
                  textStyle={{ color: COLORS.white, fontWeight: FONT_WEIGHT.bold }}
                >
                  {getString(latestEvaluation.imcClassification)}
                </Chip>
              </View>
            </View>
          )}

          {/* Progresso */}
          {progress && (
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="trending-up-outline" size={24} color={COLORS.info[500]} />
                <Text style={styles.cardTitle}>{getString('progress')}</Text>
                <Text style={styles.subtitle}>{getString('vsPreviousEvaluation')}</Text>
              </View>

              <View style={styles.progressGrid}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>{getString('weightKg').replace(' (kg)', '')}</Text>
                  <Text style={[
                    styles.progressValue,
                    { color: progress.weight > 0 ? COLORS.error[500] : progress.weight < 0 ? COLORS.primary[500] : COLORS.gray[500] }
                  ]}>
                    {progress.weight > 0 ? '+' : ''}{progress.weight.toFixed(1)} kg
                  </Text>
                </View>

                <View style={styles.progressItem}>
                  <Text style={styles.progressLabel}>IMC</Text>
                  <Text style={[
                    styles.progressValue,
                    { color: progress.imc > 0 ? COLORS.error[500] : progress.imc < 0 ? COLORS.primary[500] : COLORS.gray[500] }
                  ]}>
                    {progress.imc > 0 ? '+' : ''}{progress.imc.toFixed(2)}
                  </Text>
                </View>

                {progress.bodyFat !== null && (
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>{getString('bodyFatPercent').replace(' (%)', '')}</Text>
                    <Text style={[
                      styles.progressValue,
                      { color: progress.bodyFat > 0 ? COLORS.error[500] : progress.bodyFat < 0 ? COLORS.primary[500] : COLORS.gray[500] }
                    ]}>
                      {progress.bodyFat > 0 ? '+' : ''}{progress.bodyFat.toFixed(1)}%
                    </Text>
                  </View>
                )}

                {progress.muscleMass !== null && (
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>{getString('muscleMassKg').replace(' (kg)', '')}</Text>
                    <Text style={[
                      styles.progressValue,
                      { color: progress.muscleMass > 0 ? COLORS.primary[500] : progress.muscleMass < 0 ? COLORS.error[500] : COLORS.gray[500] }
                    ]}>
                      {progress.muscleMass > 0 ? '+' : ''}{progress.muscleMass.toFixed(1)} kg
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Gráfico de Evolução */}
          {chartData && (
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="analytics-outline" size={24} color={COLORS.secondary[500]} />
                <Text style={styles.cardTitle}>{getString('evolution')}</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsContainer}>
                {metrics.map((metric) => (
                  <Chip
                    key={metric.key}
                    mode={selectedMetric === metric.key ? 'flat' : 'outlined'}
                    selected={selectedMetric === metric.key}
                    onPress={() => setSelectedMetric(metric.key)}
                    style={styles.metricChip}
                    icon={metric.icon}
                  >
                    {metric.label}
                  </Chip>
                ))}
              </ScrollView>

              <LineChart
                data={chartData}
                width={width - 64}
                height={220}
                chartConfig={{
                  backgroundColor: 'transparent',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  backgroundGradientFromOpacity: 0.5,
                  backgroundGradientToOpacity: 0.5,
                  fillShadowGradientFrom: COLORS.primary[500],
                  fillShadowGradientTo: COLORS.primary[100],
                  decimalPlaces: selectedMetric === 'imc' ? 2 : 1,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: BORDER_RADIUS.lg,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: COLORS.info[500],
                    fill: COLORS.white
                  },
                  formatXLabel: (value: any) => value,
                  formatYLabel: (value: any) => `${value}${chartData.suffix}`,
                }}
                bezier
                style={styles.chart}
              />
            </View>
          )}

          {/* Histórico */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={24} color={COLORS.warning[500]} />
              <Text style={styles.cardTitle}>{getString('evaluationHistory')}</Text>
            </View>

            {evaluations.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color={COLORS.gray[400]} />
                <Text style={styles.emptyText}>{getString('noEvaluationsFound')}</Text>
                <Text style={styles.emptySubtext}>{getString('startEvaluationPrompt')}</Text>
              </View>
            ) : (
              evaluations.map((evaluation, index) => (
                <View key={evaluation.id || index}>
                  <List.Item
                    title={`${evaluation.weight} kg • IMC ${evaluation.imc}`}
                    description={`${formatDate(evaluation.date)} • ${getString(evaluation.imcClassification)}`}
                    left={() => <List.Icon icon="scale" />}
                    right={() => <List.Icon icon="chevron-right" />}
                    onPress={() => navigation.navigate('PhysicalEvaluation', {
                      evaluation,
                      isEditing: true
                    })}
                  />
                  {index < evaluations.length - 1 && <Divider />}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('PhysicalEvaluation')}
          label={getString('newEvaluation')}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 80, // Space for FAB
  },
  glassCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginLeft: SPACING.sm,
    flex: 1,
    color: COLORS.black,
  },
  dateText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
  },
  subtitle: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    width: '48%',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    elevation: 0,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  imcContainer: {
    alignItems: 'center',
  },
  imcChip: {
    elevation: 0,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressLabel: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  progressValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  metricsContainer: {
    marginBottom: SPACING.md,
  },
  metricChip: {
    marginRight: SPACING.sm,
  },
  chart: {
    marginVertical: 8,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary[500],
  },
});

export default PhysicalEvaluationHistoryScreen;