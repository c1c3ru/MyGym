import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Button, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@contexts/ThemeContext';
import { LIGHT_THEME, ACADEMY_LIGHT_COLORS, LIGHT_TYPOGRAPHY } from '@presentation/theme/lightTheme';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, ELEVATION } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp } from '@react-navigation/native';

interface LightThemeExampleScreenProps {
  navigation: NavigationProp<any>;
}

const { width } = Dimensions.get('window');
const Typography: any = LIGHT_TYPOGRAPHY;

const LightThemeExampleScreen: React.FC<LightThemeExampleScreenProps> = ({ navigation }) => {
  const { getString } = useTheme();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header com gradiente azul sóbrio */}
        <LinearGradient
          colors={LIGHT_THEME.gradients.header as any}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>MyGym Light Theme</Text>
            <Text style={styles.headerSubtitle}>
              Padrão visual sóbrio e inovador para academias
            </Text>
          </View>
        </LinearGradient>

        {/* Seção: Nossa Missão (inspirada na imagem 2) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nossa Missão</Text>

          <View style={styles.missionGrid}>
            <Card style={[styles.missionCard, { backgroundColor: LIGHT_THEME.card.primary.background }]}>
              <Card.Content>
                <MaterialCommunityIcons
                  name="lightbulb-outline"
                  size={32}
                  color={LIGHT_THEME.primary[600]}
                  style={styles.missionIcon}
                />
                <Text style={styles.missionCardTitle}>Inovação Tecnológica</Text>
                <Text style={styles.missionCardText}>
                  Consolidar o MyGym como referência no fomento à inovação
                  através de tecnologia para academias.
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.missionCard, { backgroundColor: LIGHT_THEME.card.secondary.background }]}>
              <Card.Content>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={32}
                  color={LIGHT_THEME.secondary[600]}
                  style={styles.missionIcon}
                />
                <Text style={styles.missionCardTitle}>Gestão Inteligente</Text>
                <Text style={styles.missionCardText}>
                  Promover soluções acadêmicas e estreitar o relacionamento
                  entre instrutores e alunos.
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.missionCard, { backgroundColor: LIGHT_THEME.card.default.background }]}>
              <Card.Content>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={32}
                  color={LIGHT_THEME.info[600]}
                  style={styles.missionIcon}
                />
                <Text style={styles.missionCardTitle}>Localização Estratégica</Text>
                <Text style={styles.missionCardText}>
                  Aproveitar nossa posição no mercado para maior articulação
                  com academias parceiras.
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Seção: O que é o MyGym (inspirada na imagem 3) */}
        <View style={[styles.section, { backgroundColor: LIGHT_THEME.background.section }]}>
          <View style={styles.explanationSection}>
            <View style={styles.explanationText}>
              <Text style={styles.explanationTitle}>O que é o MyGym?</Text>
              <Text style={styles.explanationBody}>
                O MyGym é uma solução tecnológica estratégica para academias de artes marciais.
                Oferece suporte a instrutores e alunos de diversos estilos, estimulando o
                desenvolvimento de práticas inovadoras e a integração entre o meio acadêmico,
                social e produtivo.
              </Text>
              <Text style={styles.explanationBody}>
                Proporciona experiências práticas em gestão, inovação social e capacitação
                contínua, fortalecendo processos internos e a própria gestão da academia.
              </Text>
            </View>

            <Card style={[styles.infoCard, { backgroundColor: LIGHT_THEME.card.primary.background }]}>
              <Card.Content>
                <Text style={styles.infoCardTitle}>Alinhado às normas modernas:</Text>
                <View style={styles.infoList}>
                  <Text style={styles.infoItem}>• Gestão digital de alunos e turmas</Text>
                  <Text style={styles.infoItem}>• Sistema de graduações e avaliações</Text>
                  <Text style={styles.infoItem}>• Relatórios e analytics avançados</Text>
                </View>
                <Divider style={styles.infoDivider} />
                <Text style={styles.infoFooter}>
                  Esses recursos fortalecem o papel da academia como ambiente de inovação,
                  transferência tecnológica e empreendedorismo esportivo.
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>

        {/* Seção: Funcionalidades (inspirada na imagem 5) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>O que são as Funcionalidades?</Text>

          <View style={styles.featuresSection}>
            <View style={styles.featuresText}>
              <Text style={styles.featuresDefinition}>Definição</Text>
              <Text style={styles.featuresBody}>
                Funcionalidades com forte base tecnológica e pedagógica, nascidas
                em ambientes de inovação, desenvolvendo soluções completas e
                integradas para academias modernas.
              </Text>

              <Text style={styles.featuresAreaTitle}>Áreas de Atuação</Text>
              <View style={styles.featuresList}>
                <Text style={styles.featuresItem}>• Gestão de alunos e instrutores</Text>
                <Text style={styles.featuresItem}>• Sistema de graduações</Text>
                <Text style={styles.featuresItem}>• Check-in inteligente</Text>
                <Text style={styles.featuresItem}>• Relatórios avançados</Text>
                <Text style={styles.featuresItem}>• Comunicação integrada</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Seção: Demonstração de Componentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Componentes do Sistema</Text>

          {/* Cards de estatísticas */}
          <View style={styles.statsGrid}>
            <Card style={[styles.statCard, { backgroundColor: ACADEMY_LIGHT_COLORS.admin.background }]}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="people-outline" size={24} color={ACADEMY_LIGHT_COLORS.admin.primary} />
                <Text style={styles.statNumber}>1,247</Text>
                <Text style={styles.statLabel}>Alunos Ativos</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: ACADEMY_LIGHT_COLORS.instructor.background }]}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="school-outline" size={24} color={ACADEMY_LIGHT_COLORS.instructor.primary} />
                <Text style={styles.statNumber}>89</Text>
                <Text style={styles.statLabel}>{getString('classes')}</Text>
              </Card.Content>
            </Card>

            <Card style={[styles.statCard, { backgroundColor: ACADEMY_LIGHT_COLORS.student.background }]}>
              <Card.Content style={styles.statContent}>
                <Ionicons name="trophy-outline" size={24} color={ACADEMY_LIGHT_COLORS.student.primary} />
                <Text style={styles.statNumber}>156</Text>
                <Text style={styles.statLabel}>{getString('graduations')}</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Botões e chips */}
          <View style={styles.componentsSection}>
            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                buttonColor={LIGHT_THEME.primary[500]}
                style={styles.primaryButton}
              >
                Ação Principal
              </Button>
              <Button
                mode="outlined"
                textColor={LIGHT_THEME.secondary[600]}
                style={styles.secondaryButton}
              >
                Ação Secundária
              </Button>
            </View>

            <View style={styles.chipRow}>
              <Chip
                mode="flat"
                style={[styles.chip, { backgroundColor: LIGHT_THEME.primary[100] }]}
                textStyle={{ color: LIGHT_THEME.primary[700] }}
              >
                Karatê
              </Chip>
              <Chip
                mode="flat"
                style={[styles.chip, { backgroundColor: LIGHT_THEME.secondary[100] }]}
                textStyle={{ color: LIGHT_THEME.secondary[700] }}
              >
                Jiu-Jitsu
              </Chip>
              <Chip
                mode="flat"
                style={[styles.chip, { backgroundColor: LIGHT_THEME.success[100] }]}
                textStyle={{ color: LIGHT_THEME.success[700] }}
              >
                Muay Thai
              </Chip>
            </View>
          </View>
        </View>

        {/* Seção: Contatos (substituindo FAQ) */}
        <View style={[styles.section, { backgroundColor: LIGHT_THEME.background.section }]}>
          <Text style={styles.sectionTitle}>Entre em Contato</Text>

          <Card style={styles.contactCard}>
            <Card.Content>
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="email-outline" size={24} color={LIGHT_THEME.primary[600]} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>{getString('email')}</Text>
                  <Text style={styles.contactValue}>contato@mygym.app</Text>
                </View>
              </View>

              <Divider style={styles.contactDivider} />

              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="phone-outline" size={24} color={LIGHT_THEME.primary[600]} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>{getString('phone')}</Text>
                  <Text style={styles.contactValue}>(85) 3366-9999</Text>
                </View>
              </View>

              <Divider style={styles.contactDivider} />

              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="web" size={24} color={LIGHT_THEME.primary[600]} />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Website</Text>
                  <Text style={styles.contactValue}>www.mygym.app</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.background.default,
  },

  // Header
  header: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...(Typography.h1 as any),
    color: LIGHT_THEME.primary[800],
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    ...Typography.body1,
    color: LIGHT_THEME.primary[700],
    textAlign: 'center',
  },

  // Seções
  section: {
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...Typography.h2,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },

  // Missão
  missionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.base,
  },
  missionCard: {
    width: width > 768 ? '31%' : '100%',
    marginBottom: SPACING.base,
    elevation: 2,
    shadowColor: LIGHT_THEME.shadows.default,
  },
  missionIcon: {
    marginBottom: SPACING.md,
  },
  missionCardTitle: {
    ...Typography.h3,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.sm,
  },
  missionCardText: {
    ...Typography.body2,
    lineHeight: 20,
  },

  // Explicação
  explanationSection: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: SPACING.xxs,
  },
  explanationText: {
    flex: width > 768 ? 2 : 1,
  },
  explanationTitle: {
    ...Typography.h2,
    marginBottom: SPACING.base,
  },
  explanationBody: {
    ...Typography.body1,
    marginBottom: SPACING.base,
    lineHeight: 24,
  },
  infoCard: {
    flex: 1,
    elevation: 2,
  },
  infoCardTitle: {
    ...Typography.h3,
    fontSize: FONT_SIZE.base,
    color: LIGHT_THEME.primary[700],
    marginBottom: SPACING.md,
  },
  infoList: {
    marginBottom: SPACING.base,
  },
  infoItem: {
    ...Typography.body2,
    marginBottom: SPACING.xs,
  },
  infoDivider: {
    marginVertical: 12,
    backgroundColor: LIGHT_THEME.border.light,
  },
  infoFooter: {
    ...Typography.caption,
    fontStyle: 'italic',
  },

  // Funcionalidades
  featuresSection: {
    flexDirection: width > 768 ? 'row' : 'column',
  },
  featuresText: {
    flex: 1,
  },
  featuresDefinition: {
    ...Typography.h3,
    color: LIGHT_THEME.primary[600],
    marginBottom: SPACING.md,
  },
  featuresBody: {
    ...Typography.body1,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  featuresAreaTitle: {
    ...Typography.h3,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.md,
  },
  featuresList: {
    marginLeft: SPACING.sm,
  },
  featuresItem: {
    ...Typography.body2,
    marginBottom: 6,
  },

  // Estatísticas
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: width > 768 ? '31%' : '48%',
    marginBottom: SPACING.base,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statNumber: {
    ...Typography.h1,
    fontSize: FONT_SIZE.xl,
    marginVertical: 8,
  },
  statLabel: {
    ...Typography.caption,
    textAlign: 'center',
  },

  // Componentes
  componentsSection: {
    marginTop: SPACING.base,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.base,
  },
  secondaryButton: {
    borderRadius: BORDER_RADIUS.base,
    borderColor: LIGHT_THEME.secondary[300],
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  chip: {
    marginHorizontal: 4,
  },

  // Contatos
  contactCard: {
    elevation: 2,
    backgroundColor: LIGHT_THEME.card.default.background,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  contactInfo: {
    marginLeft: SPACING.base,
    flex: 1,
  },
  contactLabel: {
    ...Typography.caption,
    color: LIGHT_THEME.text.tertiary,
    marginBottom: 2,
  },
  contactValue: {
    ...Typography.body1,
    fontWeight: '500' as const,
  },
  contactDivider: {
    backgroundColor: LIGHT_THEME.border.light,
    marginVertical: 4,
  },
});

export default LightThemeExampleScreen;
