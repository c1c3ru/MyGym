import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Button,
  Avatar,
  Chip,
  Divider,
  Text,
  List,
  Surface
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { firestoreService } from '@infrastructure/services/firestoreService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const StudentEvolution = ({ navigation }) => {
  const { user, userProfile, academia } = useAuthFacade();
  const { getString } = useTheme();
  const [graduations, setGraduations] = useState([]);
  const [stats, setStats] = useState({
    totalGraduations: 0,
    currentGraduation: '',
    timeInCurrentGraduation: 0,
    modalities: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvolutionData();
  }, []);

  const loadEvolutionData = async () => {
    try {
      setLoading(true);

      // Obter ID da academia e do usuário
      const academiaId = userProfile?.academiaId || academia?.id;
      const userId = user?.id || user?.uid;

      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }

      if (!userId) {
        console.error('ID do usuário não encontrado');
        return;
      }

      // 🔒 SEGURANÇA: Buscar APENAS as graduações do próprio aluno
      // Caminho correto: gyms/{gymId}/students/{studentId}/graduations
      const userGraduations = await firestoreService.getAll(
        `gyms/${academiaId}/students/${userId}/graduations`
      );

      // Ordenar graduações por data (mais recente primeiro)
      const sortedGraduations = userGraduations.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );

      setGraduations(sortedGraduations);

      // Calcular estatísticas
      const currentGrad = sortedGraduations[0];
      const timeInCurrent = currentGrad ?
        Math.floor((new Date() - new Date(currentGrad.date)) / (1000 * 60 * 60 * 24)) : 0;

      const modalities = [...new Set(userGraduations.map(g => g.modality))];

      setStats({
        totalGraduations: userGraduations.length,
        currentGraduation: currentGrad?.graduation || getString('beginner'),
        timeInCurrentGraduation: timeInCurrent,
        modalities
      });

    } catch (error) {
      console.error('Erro ao carregar evolução:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvolutionData();
  };

  const formatDate = (date) => {
    if (!date) return getString('dateNotInformed');
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getGraduationColor = (graduation) => {
    const colors = {
      'Branca': COLORS.special.belt.white,
      'Cinza': COLORS.gray[500],
      'Amarela': COLORS.special.belt.yellow,
      'Laranja': COLORS.special.belt.orange,
      'Verde': COLORS.special.belt.green,
      'Azul': COLORS.special.belt.blue,
      'Roxa': COLORS.special.belt.purple,
      'Marrom': COLORS.special.belt.brown,
      'Preta': COLORS.special.belt.black,
      'Coral': COLORS.special.belt.red,
      'Vermelha': COLORS.special.belt.red
    };
    return colors[graduation] || COLORS.info[500];
  };

  const getGraduationIcon = (modality) => {
    const icons = {
      'Jiu-Jitsu': 'fitness-outline',
      'Muay Thai': 'hand-left-outline',
      'Boxe': 'hand-right-outline',
      'MMA': 'shield-outline',
      'Karatê': 'body-outline',
      'Judô': 'person-outline'
    };
    return icons[modality] || 'medal-outline';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Estatísticas Gerais */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy-outline" size={24} color={COLORS.warning[300]} />
              <Text style={[styles.cardTitle, styles.title]}>Minha Evolução</Text>
            </View>

            <View style={styles.statsGrid}>
              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalGraduations}</Text>
                <Text style={styles.statLabel}>{getString('graduations')}</Text>
              </Surface>

              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.modalities.length}</Text>
                <Text style={styles.statLabel}>{getString('modalities')}</Text>
              </Surface>

              <Surface style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.timeInCurrentGraduation}</Text>
                <Text style={styles.statLabel}>Dias na Atual</Text>
              </Surface>
            </View>

            <View style={styles.currentGraduation}>
              <Text style={styles.currentLabel}>Graduação Atual:</Text>
              <Chip
                mode="outlined"
                style={[
                  styles.graduationChip,
                  { borderColor: getGraduationColor(stats.currentGraduation) }
                ]}
                textStyle={{
                  color: getGraduationColor(stats.currentGraduation),
                  fontWeight: FONT_WEIGHT.bold
                }}
              >
                {stats.currentGraduation}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Timeline de Graduações */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="git-branch-outline" size={24} color={COLORS.info[500]} />
              <Text style={[styles.cardTitle, styles.title]}>Timeline de Graduações</Text>
            </View>

            {graduations.length > 0 ? (
              graduations.map((graduation, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <View style={styles.graduationInfo}>
                        <Ionicons
                          name={getGraduationIcon(graduation.modality)}
                          size={20}
                          color={getGraduationColor(graduation.graduation)}
                        />
                        <Text style={styles.graduationTitle}>
                          {graduation.graduation} - {graduation.modality}
                        </Text>
                      </View>
                      <Text style={styles.graduationDate}>
                        {formatDate(graduation.date)}
                      </Text>
                    </View>

                    {graduation.instructor && (
                      <Text style={styles.instructorText}>
                        Professor: {graduation.instructor}
                      </Text>
                    )}

                    {graduation.observations && (
                      <Text style={styles.observationsText}>
                        {graduation.observations}
                      </Text>
                    )}
                  </View>

                  {index < graduations.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="medal-outline" size={48} color={COLORS.gray[300]} />
                <Text style={[styles.emptyText, styles.paragraph]}>
                  Nenhuma graduação registrada ainda
                </Text>
                <Text style={[styles.emptySubtext, styles.paragraph]}>
                  Suas graduações aparecerão aqui conforme você evolui
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Modalidades Praticadas */}
        {stats.modalities.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="fitness-outline" size={24} color={COLORS.primary[500]} />
                <Text style={[styles.cardTitle, styles.title]}>{getString('modalities')}</Text>
              </View>

              <View style={styles.modalitiesContainer}>
                {stats.modalities.map((modality, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    style={styles.modalityChip}
                    icon={getGraduationIcon(modality)}
                  >
                    {modality}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Próximos Objetivos */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="flag-outline" size={24} color={COLORS.warning[500]} />
              <Text style={[styles.cardTitle, styles.title]}>Próximos Objetivos</Text>
            </View>

            <List.Item
              title={getString('maintainFrequency')}
              description="Continue participando regularmente das aulas"
              left={() => <List.Icon icon="check-circle-outline" color={COLORS.success[500]} />}
            />

            <List.Item
              title={getString('improveTechniques')}
              description="Foque no desenvolvimento técnico"
              left={() => <List.Icon icon="trending-up" color={COLORS.info[500]} />}
            />

            <List.Item
              title={getString('nextGraduation')}
              description="Continue se dedicando para a próxima faixa"
              left={() => <List.Icon icon="trophy" color={COLORS.warning[300]} />}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
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
  statsCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 4,
    backgroundColor: COLORS.primary[50],
  },
  card: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    elevation: 1,
    backgroundColor: COLORS.white,
  },
  statNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.info[500],
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  currentGraduation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  graduationChip: {
    borderWidth: 2,
  },
  timelineItem: {
    marginBottom: SPACING.md,
  },
  timelineContent: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    elevation: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  graduationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  graduationTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginLeft: SPACING.sm,
  },
  graduationDate: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
  },
  instructorText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  observationsText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.black,
    fontStyle: 'italic',
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.border.light,
    marginLeft: 20,
    marginTop: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  modalitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  modalityChip: {
    marginBottom: SPACING.sm,
  },
});

export default StudentEvolution;
