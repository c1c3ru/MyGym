import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, useWindowDimensions, Animated, Modal, TouchableOpacity } from 'react-native';
import {
  Card,
  Chip,
  Divider,
  Text,
  List,
  Surface,
  Portal,
  IconButton,
  Button
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { firestoreService } from '@infrastructure/services/firestoreService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, GLASS } from '@presentation/theme/designTokens';
import { getProgressionForModality } from '@shared/constants/graduations';
import GlassCard from '@components/GlassCard';

const StudentEvolution = ({ navigation }) => {
  const { user, userProfile, academia } = useAuthFacade();
  const { getString, theme } = useTheme();
  const colors = theme.colors;

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [graduations, setGraduations] = useState([]);
  const [stats, setStats] = useState({
    totalGraduations: 0,
    currentGraduation: '',
    timeInCurrentGraduation: 0,
    modalities: [],
    beltsByModality: {}
  });
  const [selectedModality, setSelectedModality] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Animation for pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

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

      // 0. Obter modalidades do perfil do aluno (matrícula)
      const profileModalities = userProfile?.modalities || [];
      const graduationModalities = userGraduations.map(g => g.modality);

      // Combinar e remover duplicatas
      const allModalities = [...new Set([...profileModalities, ...graduationModalities])].filter(Boolean);

      const defaultModality = allModalities[0] || 'Jiu-Jitsu';
      const progression = getProgressionForModality(defaultModality);
      const defaultGraduationLabel = progression.levels[0]?.label || getString('beginner');

      setStats({
        totalGraduations: userGraduations.length,
        currentGraduation: currentGrad?.graduation || defaultGraduationLabel,
        timeInCurrentGraduation: timeInCurrent,
        modalities: allModalities,
        beltsByModality: allModalities.reduce((acc, mod) => {
          const modGrads = sortedGraduations.filter(g => g.modality === mod);
          acc[mod] = modGrads[0]?.graduation ||
            (getProgressionForModality(mod).levels[0]?.label || getString('beginner'));
          return acc;
        }, {})
      });

    } catch (error) {
      console.error('Erro ao carregar evolução:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const RenderSnakeTimeline = () => {
    // Se a modalidade selecionada for 'All', usamos a lista simples de graduações conquistadas
    // Caso contrário, montamos a trilha completa da federação
    let timelineItems = [];

    if (selectedModality === 'All') {
      if (graduations.length === 0) {
        // Fallback para mostrar a trilha mesmo sem dados (Gamificação)
        // Tenta pegar a primeira modalidade da academia se disponível, senão Default (agora com faixas)
        const academicModality = stats.modalities[0] || 'Jiu-Jitsu';
        const progression = getProgressionForModality(academicModality);
        timelineItems = progression.levels.map((level, idx) => ({
          graduation: level.label,
          modality: academicModality,
          color: level.color,
          isLocked: idx > 0, // Apenas a primeira fica "desbloqueada" como início
          isCurrent: idx === 0 // A primeira é a atual
        }));
      } else {
        // Se tem graduações, pega a mais recente para decidir qual trilha completa mostrar
        const lastGrad = graduations[0];
        const progression = getProgressionForModality(lastGrad.modality);

        timelineItems = progression.levels.map(level => {
          const earned = graduations.find(eg =>
            eg.modality === lastGrad.modality &&
            (eg.graduation.toLowerCase().includes(level.label.toLowerCase()) ||
              level.label.toLowerCase().includes(eg.graduation.toLowerCase()))
          );

          return {
            ...earned,
            graduation: level.label,
            modality: lastGrad.modality,
            color: level.color,
            isLocked: !earned,
            isCurrent: earned && earned.graduation === lastGrad.graduation
          };
        });
      }
    } else {
      const progression = getProgressionForModality(selectedModality);
      const earnedGrads = graduations.filter(g => g.modality === selectedModality);

      // Mapear níveis da federação para estado do aluno
      timelineItems = progression.levels.map((level, index) => {
        const earned = earnedGrads.find(eg =>
          eg.graduation.toLowerCase().includes(level.label.toLowerCase()) ||
          level.label.toLowerCase().includes(eg.graduation.toLowerCase())
        );

        return {
          ...earned,
          graduation: level.label,
          modality: selectedModality,
          color: level.color,
          isLocked: !earned,
          isCurrent: earned && earned.graduation === stats.beltsByModality[selectedModality]
        };
      });
    }

    return (
      <View style={styles.snakeContainer}>
        {/* Marcador de Início da Jornada */}
        <View style={styles.startBadge}>
          <Text style={styles.startBadgeText}>Início da Jornada</Text>
          <Ionicons name="flag" size={16} color="#FFF" />
        </View>

        {timelineItems.map((item, index) => {
          // Lógica de Zig-Zag: 10%, 40%, 70%, 40% (Cria efeito S)
          const position = index % 4;
          let marginLeft = '0%';
          if (position === 0) marginLeft = '15%';
          if (position === 1) marginLeft = '45%';
          if (position === 2) marginLeft = '75%';
          if (position === 3) marginLeft = '45%';

          return (
            <View key={index} style={[styles.snakeRow, { paddingLeft: marginLeft }]}>
              {/* Linha Conectora Vertical (Trilha) */}
              {index < timelineItems.length - 1 && (
                <View style={[
                  styles.snakeConnector,
                  {
                    backgroundColor: item.isLocked ? colors.outline : getGraduationColor(item.graduation, item.modality),
                    opacity: item.isLocked ? 0.2 : 0.6,
                    height: 120,
                  }
                ]} />
              )}

              <TouchableOpacity
                onPress={() => {
                  setSelectedMilestone(item);
                  setIsModalVisible(true);
                }}
                activeOpacity={0.7}
                style={styles.milestoneWrapper}
              >
                <Animated.View style={[
                  styles.milestoneCircle,
                  {
                    borderColor: getGraduationColor(item.graduation, item.modality),
                    backgroundColor: item.isLocked ? 'rgba(255,255,255,0.05)' : getGraduationColor(item.graduation, item.modality),
                    transform: item.isCurrent ? [{ scale: pulseAnim }] : []
                  }
                ]}>
                  {item.isLocked ? (
                    <MaterialCommunityIcons name="lock" size={24} color={colors.outline} />
                  ) : (
                    <Ionicons
                      name={getGraduationIcon(item.modality)}
                      size={28}
                      color={item.color === 'white' ? '#000' : '#FFF'}
                    />
                  )}

                  {item.isCurrent && (
                    <Animated.View style={[
                      styles.pulseCircle,
                      { borderColor: getGraduationColor(item.graduation, item.modality) }
                    ]} />
                  )}
                </Animated.View>
                <View style={styles.milestoneTextContainer}>
                  <Text style={[
                    styles.milestoneLabel,
                    { color: item.isLocked ? colors.onSurfaceVariant : colors.onSurface }
                  ]}>
                    {item.graduation}
                  </Text>
                  {!item.isLocked && (
                    <Text style={styles.milestoneDate}>{formatDate(item.date)}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvolutionData();
  };

  const formatDate = (date) => {
    if (!date) return getString('dateNotInformed');
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getGraduationColor = (graduation, modality) => {
    if (!graduation) return colors.primary;

    // 1. Tentar obter a cor diretamente da definição da modalidade se disponível
    if (modality) {
      const progression = getProgressionForModality(modality);
      const level = progression.levels.find(l =>
        l.label.toLowerCase().includes(graduation.toLowerCase()) ||
        graduation.toLowerCase().includes(l.label.toLowerCase())
      );
      if (level && level.color) {
        const colorMap = {
          'white': COLORS.special.belt.white,
          'yellow': COLORS.special.belt.yellow,
          'orange': COLORS.special.belt.orange,
          'green': COLORS.special.belt.green,
          'blue': COLORS.special.belt.blue,
          'purple': COLORS.special.belt.purple,
          'brown': COLORS.special.belt.brown,
          'black': COLORS.special.belt.black,
          'red': COLORS.special.belt.red,
          'gray': COLORS.gray[500],
        };
        if (colorMap[level.color]) return colorMap[level.color];
      }
    }

    // 2. Fallback para mapeamento por string (compatibilidade)
    const normalized = graduation.replace(/Faixa\s+/i, '').toLowerCase().trim();

    const beltColors = {
      'branca': COLORS.special.belt.white,
      'cinza': COLORS.gray[500],
      'amarela': COLORS.special.belt.yellow,
      'laranja': COLORS.special.belt.orange,
      'verde': COLORS.special.belt.green,
      'azul': COLORS.special.belt.blue,
      'roxa': COLORS.special.belt.purple,
      'marrom': COLORS.special.belt.brown,
      'preta': COLORS.special.belt.black,
      'coral': COLORS.special.belt.red,
      'vermelha': COLORS.special.belt.red,
      'white': COLORS.special.belt.white,
      'yellow': COLORS.special.belt.yellow,
      'orange': COLORS.special.belt.orange,
      'green': COLORS.special.belt.green,
      'blue': COLORS.special.belt.blue,
      'purple': COLORS.special.belt.purple,
      'brown': COLORS.special.belt.brown,
      'black': COLORS.special.belt.black,
      'red': COLORS.special.belt.red,
    };

    // Busca parcial se não encontrar exato
    if (!beltColors[normalized]) {
      const key = Object.keys(beltColors).find(k => normalized.includes(k));
      if (key) return beltColors[key];
    }

    return beltColors[normalized] || colors.primary;
  };

  const getGraduationIcon = (modality) => {
    const icons = {
      'Jiu-Jitsu': 'fitness-outline',
      'Muay Thai': 'hand-left-outline',
      'Boxe': 'hand-right-outline',
      'MMA': 'shield-outline',
      'Karatê': 'body-outline',
      'Judô': 'person-outline',
      'Taekwondo': 'flash-outline',
      'Kickboxing': 'walk-outline',
      'Capoeira': 'repeat-outline',
      'Krav Maga': 'shield-half-outline',
      'Aikido': 'infinite-outline',
      'Sanda': 'fist-outline'
    };
    return icons[modality] || 'medal-outline';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        {/* Estatísticas Gerais */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="trophy-outline" size={24} color={colors.primary} />
              <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                <Text style={styles.cardTitle}>{getString('myEvolution')}</Text>
                <Text style={styles.academyName}>
                  🏛️ {academia?.name || userProfile?.academiaName || getString('academy')}
                </Text>
              </View>
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
                <Text style={styles.statLabel}>{getString('daysInCurrent')}</Text>
              </Surface>
            </View>

            <View style={styles.currentGraduation}>
              <Text style={styles.currentLabel}>{getString('currentGraduationLabel')}</Text>
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

            <Divider style={styles.divider} />
            <Text style={styles.subTitle}>{getString('beltsByModality') || 'Faixas por Modalidade'}</Text>
            <View style={styles.modalitiesGrid}>
              {stats.modalities.map((mod, idx) => (
                <View key={idx} style={styles.modalityBeltRow}>
                  <Text style={styles.modalityName}>{mod}:</Text>
                  <Chip
                    compact
                    style={[styles.smallChip, { borderColor: getGraduationColor(stats.beltsByModality[mod], mod) }]}
                    textStyle={{ color: getGraduationColor(stats.beltsByModality[mod], mod), fontSize: 12 }}
                  >
                    {stats.beltsByModality[mod]}
                  </Chip>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Timeline de Graduações - Snake Path Style */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="tournament" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, styles.title]}>{getString('timelineGraduations')}</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
              <Chip
                selected={selectedModality === 'All'}
                onPress={() => setSelectedModality('All')}
                style={styles.filterChip}
                selectedColor={colors.primary}
              >
                {getString('all')}
              </Chip>
              {stats.modalities.map((mod, idx) => (
                <Chip
                  key={idx}
                  selected={selectedModality === mod}
                  onPress={() => setSelectedModality(mod)}
                  style={styles.filterChip}
                  selectedColor={colors.primary}
                >
                  {mod}
                </Chip>
              ))}
            </ScrollView>

            {RenderSnakeTimeline()}
          </Card.Content>
        </Card>

        {/* Milestone Detail Modal */}
        <Portal>
          <Modal
            visible={isModalVisible}
            onDismiss={() => setIsModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <GlassCard variant="modal" padding={SPACING.lg}>
              {selectedMilestone && (
                <View>
                  <View style={styles.modalHeader}>
                    <View style={[styles.modalBeltIcon, { backgroundColor: getGraduationColor(selectedMilestone.graduation, selectedMilestone.modality) }]}>
                      <Ionicons name="medal" size={32} color={selectedMilestone.color === 'white' ? '#000' : '#FFF'} />
                    </View>
                    <View style={{ flex: 1, marginLeft: SPACING.md }}>
                      <Text style={styles.modalTitle}>{selectedMilestone.graduation}</Text>
                      <Text style={styles.modalSubtitle}>{selectedMilestone.modality}</Text>
                    </View>
                    <IconButton icon="close" onPress={() => setIsModalVisible(false)} />
                  </View>

                  <Divider style={styles.modalDivider} />

                  <View style={styles.modalInfoRow}>
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    <Text style={styles.modalInfoText}>
                      {selectedMilestone.isLocked ? "Próximo Objetivo" : formatDate(selectedMilestone.date)}
                    </Text>
                  </View>

                  {!selectedMilestone.isLocked && selectedMilestone.instructor && (
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="person-outline" size={20} color={colors.primary} />
                      <Text style={styles.modalInfoText}>
                        {getString('instructorLabel')} {selectedMilestone.instructor}
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalDescriptionContainer}>
                    <Text style={styles.modalDescriptionTitle}>Observações:</Text>
                    <Text style={styles.modalDescriptionText}>
                      {selectedMilestone.isLocked
                        ? "Continue treinando com foco e disciplina para desbloquear esta graduação. A consistência é a chave para a evolução."
                        : (selectedMilestone.observations || "Nenhuma observação registrada para esta graduação.")}
                    </Text>
                  </View>

                  {selectedMilestone.isLocked && (
                    <Button
                      mode="contained"
                      style={styles.modalButton}
                      buttonColor={colors.primary}
                    >
                      Ver Requisitos
                    </Button>
                  )}
                </View>
              )}
            </GlassCard>
          </Modal>
        </Portal>

        {/* Modalidades Praticadas */}
        {stats.modalities.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Ionicons name="fitness-outline" size={24} color={colors.primary} />
                <Text style={[styles.cardTitle, styles.title]}>{getString('modalities')}</Text>
              </View>

              <View style={styles.modalitiesContainer}>
                {stats.modalities.map((modality, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    style={styles.modalityChip}
                    icon={getGraduationIcon(modality)}
                    textStyle={{ color: colors.onSurface }}
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
              <Ionicons name="flag-outline" size={24} color={colors.tertiary || colors.primary} />
              <Text style={[styles.cardTitle, styles.title]}>{getString('nextGoals')}</Text>
            </View>

            <List.Item
              title={getString('maintainFrequency')}
              titleStyle={{ color: colors.onSurface }}
              description={getString('maintainFrequencyDetails')}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={() => <List.Icon icon="check-circle-outline" color={COLORS.success[500]} />}
            />

            <List.Item
              title={getString('improveTechniques')}
              titleStyle={{ color: colors.onSurface }}
              description={getString('improveTechniquesDetails')}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={() => <List.Icon icon="trending-up" color={colors.secondary || COLORS.info[500]} />}
            />

            <List.Item
              title={getString('nextGraduation')}
              titleStyle={{ color: colors.onSurface }}
              description={getString('nextGraduationDetails')}
              descriptionStyle={{ color: colors.onSurfaceVariant }}
              left={() => <List.Icon icon="trophy" color={COLORS.warning[300]} />}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    statsCard: {
      margin: SPACING.md,
      marginBottom: SPACING.sm,
      elevation: 4,
      backgroundColor: colors.surface,
    },
    card: {
      margin: SPACING.md,
      marginTop: SPACING.sm,
      elevation: 2,
      backgroundColor: colors.surface,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    cardTitle: {
      marginLeft: SPACING.sm,
      fontSize: FONT_SIZE.lg,
      color: colors.onSurface
    },
    title: { color: colors.onSurface },
    paragraph: { color: colors.onSurfaceVariant },
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
      backgroundColor: colors.surfaceVariant, // Slightly different to stand out or same as surface
      minWidth: 80
    },
    statNumber: {
      fontSize: FONT_SIZE.xxl,
      fontWeight: FONT_WEIGHT.bold,
      color: colors.primary,
    },
    statLabel: {
      fontSize: FONT_SIZE.sm,
      color: colors.onSurfaceVariant,
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
      color: colors.onSurface
    },
    graduationChip: {
      borderWidth: 2,
      backgroundColor: 'transparent'
    },
    timelineItem: {
      marginBottom: SPACING.md,
    },
    timelineContent: {
      backgroundColor: colors.surfaceVariant,
      padding: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      elevation: 0,
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
      color: colors.onSurface
    },
    graduationDate: {
      fontSize: FONT_SIZE.base,
      color: colors.onSurfaceVariant,
    },
    instructorText: {
      fontSize: FONT_SIZE.base,
      color: colors.onSurfaceVariant,
      marginBottom: SPACING.xs,
    },
    observationsText: {
      fontSize: FONT_SIZE.base,
      color: colors.onSurface,
      fontStyle: 'italic',
    },
    timelineLine: {
      width: 2,
      height: 16,
      backgroundColor: colors.outline,
      marginLeft: 20,
      marginTop: SPACING.sm,
    },
    emptyState: {
      alignItems: 'center',
      padding: 32,
    },
    emptyText: {
      fontSize: FONT_SIZE.md,
      color: colors.onSurfaceVariant,
      marginTop: SPACING.md,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: FONT_SIZE.base,
      color: colors.onSurfaceVariant,
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
      backgroundColor: colors.surfaceVariant
    },
    academyName: {
      fontSize: FONT_SIZE.sm,
      color: colors.primary,
      fontWeight: '600'
    },
    divider: {
      marginVertical: SPACING.md,
      backgroundColor: colors.outline
    },
    subTitle: {
      fontSize: FONT_SIZE.md,
      fontWeight: 'bold',
      color: colors.onSurface,
      marginBottom: SPACING.sm
    },
    modalitiesGrid: {
      marginTop: SPACING.xs
    },
    modalityBeltRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.xs
    },
    modalityName: {
      fontSize: FONT_SIZE.base,
      color: colors.onSurfaceVariant
    },
    smallChip: {
      height: 24,
      paddingHorizontal: 0,
      backgroundColor: 'transparent'
    },
    filterContainer: {
      flexDirection: 'row',
      marginBottom: SPACING.md,
      paddingBottom: SPACING.xs
    },
    filterLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant
    },
    // Snake Timeline Styles
    snakeContainer: {
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.md,
      alignItems: 'flex-start',
      width: '100%',
      minHeight: 400,
      backgroundColor: 'rgba(0,0,0,0.02)',
      borderRadius: BORDER_RADIUS.lg,
    },
    startBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.full,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: SPACING.lg,
      alignSelf: 'center',
    },
    startBadgeText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    snakeRow: {
      width: '100%',
      marginVertical: SPACING.md,
      zIndex: 2,
    },
    milestoneWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 200,
    },
    milestoneCircle: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 4,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      zIndex: 5,
    },
    pulseCircle: {
      position: 'absolute',
      width: 85,
      height: 85,
      borderRadius: 42.5,
      borderWidth: 2,
      opacity: 0.5,
    },
    milestoneTextContainer: {
      marginLeft: SPACING.md,
      backgroundColor: 'rgba(255,255,255,0.05)',
      padding: SPACING.sm,
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      minWidth: 120,
    },
    milestoneLabel: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    milestoneDate: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.5)',
      marginTop: 2,
    },
    snakeConnector: {
      position: 'absolute',
      width: 4,
      left: 33, // Centralizado com o círculo de 70px (35 - 2)
      top: 70,
      zIndex: 1,
    },
    // Modal Styles
    modalContainer: {
      margin: SPACING.lg,
      justifyContent: 'center',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.md,
    },
    modalBeltIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    },
    modalTitle: {
      fontSize: FONT_SIZE.xl,
      fontWeight: 'bold',
      color: colors.onSurface,
    },
    modalSubtitle: {
      fontSize: FONT_SIZE.md,
      color: colors.onSurfaceVariant,
    },
    modalDivider: {
      backgroundColor: colors.outline,
      marginVertical: SPACING.md,
    },
    modalInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    modalInfoText: {
      marginLeft: SPACING.sm,
      color: colors.onSurface,
      fontSize: FONT_SIZE.base,
    },
    modalDescriptionContainer: {
      marginTop: SPACING.md,
      padding: SPACING.md,
      backgroundColor: colors.surfaceVariant,
      borderRadius: BORDER_RADIUS.md,
    },
    modalDescriptionTitle: {
      color: colors.onSurface,
      fontWeight: 'bold',
      marginBottom: SPACING.xs,
    },
    modalDescriptionText: {
      color: colors.onSurfaceVariant,
      fontSize: 12,
      lineHeight: 18,
    },
    modalButton: {
      marginTop: SPACING.lg,
      borderRadius: BORDER_RADIUS.md,
    }
  });
}

export default StudentEvolution;
