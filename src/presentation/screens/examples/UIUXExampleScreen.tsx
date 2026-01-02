/**
 * UIUXExampleScreen - Tela de exemplo demonstrando as melhorias de UI/UX
 * 
 * Esta tela demonstra como usar todos os novos componentes e sistemas
 * implementados para melhorar a experiência do usuário.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Importar novos componentes
import { SPACING, FONT_SIZE, COLORS, BORDER_RADIUS, getElevation } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import EnhancedErrorMessage, { useEnhancedError } from '@components/EnhancedErrorMessage';
import {
  AccessibleButton,
  AccessibleIconButton,
  AccessibleCard,
  AccessibleChip,
} from '@components/AccessibleComponents';
import Breadcrumb, { useBreadcrumb } from '@components/Breadcrumb';
import { useUndo, useDeleteWithUndo } from '@components/UndoManager';
import { useOnboarding, ONBOARDING_TOURS } from '@components/OnboardingTour';
import { useTheme } from '@contexts/ThemeContext';
import type { NavigationProp } from '@react-navigation/native';

interface UIUXExampleScreenProps {
  navigation: NavigationProp<any>;
}

const UIUXExampleScreen = ({ navigation }) => {
  // ============================================
  // HOOKS
  // ============================================
  const { error, showError, clearError } = useEnhancedError();
  const { breadcrumbItems, setBreadcrumbs } = useBreadcrumb();
  const { deleteWithUndo } = useDeleteWithUndo();
  const { startTour, resetAllTours } = useOnboarding();

  const [selectedChips, setSelectedChips] = useState([]);
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ]);

  // ============================================
  // SETUP
  // ============================================
  useEffect(() => {
    // Configura breadcrumb
    setBreadcrumbs([
      { label: 'Exemplos', onPress: () => navigation.goBack() },
      { label: 'UI/UX Demo' },
    ]);
  }, []);

  // ============================================
  // HANDLERS
  // ============================================
  const handleShowError = (errorCode) => {
    showError(errorCode);
  };

  const handleDeleteItem = async (item) => {
    await deleteWithUndo(
      item,
      async (itemToDelete) => {
        // Simula exclusão
        setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      },
      async (itemToRestore) => {
        // Simula restauração
        setItems(prev => [...prev, itemToRestore].sort((a, b) => a.id - b.id));
      },
      item.name
    );
  };

  const handleStartTour = () => {
    const demoTour = {
      id: 'demo_tour',
      name: 'Tour de Demonstração',
      steps: [
        {
          title: 'Bem-vindo ao Demo!',
          message: 'Este é um tour de demonstração dos novos componentes de UI/UX.',
          icon: 'hand-wave',
          position: 'center',
        },
        {
          title: 'Design Tokens',
          message: 'Todos os espaçamentos, cores e tamanhos são padronizados.',
          icon: 'palette',
          position: 'top',
        },
        {
          title: 'Mensagens de Erro',
          message: 'Erros agora são claros e acionáveis.',
          icon: 'alert-circle',
          position: 'center',
        },
        {
          title: 'Sistema de Undo',
          message: 'Ações destrutivas podem ser desfeitas.',
          icon: 'undo',
          position: 'bottom',
        },
      ],
    };

    startTour(demoTour);
  };

  const toggleChip = (id) => {
    setSelectedChips(prev =>
      prev.includes(id)
        ? prev.filter(chipId => chipId !== id)
        : [...prev, id]
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} showHome={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Demonstração UI/UX</Text>
        <Text style={styles.subtitle}>
          Exemplos práticos dos novos componentes e sistemas
        </Text>

        <Divider style={styles.divider} />

        {/* Seção 1: Design Tokens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Design Tokens</Text>
          <Text style={styles.sectionDescription}>
            Espaçamentos, cores e tamanhos padronizados
          </Text>

          <View style={styles.tokenExamples}>
            <View style={[styles.tokenBox, { backgroundColor: COLORS.primary[500] }]}>
              <Text style={styles.tokenLabel}>Primary</Text>
            </View>
            <View style={[styles.tokenBox, { backgroundColor: COLORS.secondary[500] }]}>
              <Text style={styles.tokenLabel}>Secondary</Text>
            </View>
            <View style={[styles.tokenBox, { backgroundColor: COLORS.success[500] }]}>
              <Text style={styles.tokenLabel}>Success</Text>
            </View>
            <View style={[styles.tokenBox, { backgroundColor: COLORS.error[500] }]}>
              <Text style={styles.tokenLabel}>Error</Text>
            </View>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Seção 2: Mensagens de Erro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Mensagens de Erro Melhoradas</Text>
          <Text style={styles.sectionDescription}>
            Erros claros, específicos e acionáveis
          </Text>

          {error && (
            <EnhancedErrorMessage
              errorCode={error.errorCode}
              onAction={(action) => {
                console.log('Ação:', action);
                clearError();
              }}
              onDismiss={clearError}
              style={styles.errorMessage}
            />
          )}

          <View style={styles.buttonRow}>
            <AccessibleButton
              mode="outlined"
              onPress={() => handleShowError('auth/invalid-email')}
              accessibilityLabel="Mostrar erro de email inválido"
              style={styles.smallButton}
            >
              Email Inválido
            </AccessibleButton>
            <AccessibleButton
              mode="outlined"
              onPress={() => handleShowError('network/offline')}
              accessibilityLabel="Mostrar erro de rede"
              style={styles.smallButton}
            >
              Sem Conexão
            </AccessibleButton>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Seção 3: Componentes Acessíveis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Componentes Acessíveis</Text>
          <Text style={styles.sectionDescription}>
            Todos com labels e hints para leitores de tela
          </Text>

          <AccessibleCard
            onPress={() => console.log('Card pressionado')}
            accessibilityLabel="Card de exemplo"
            accessibilityHint="Toque para ver mais detalhes"
            elevation="md"
            style={styles.exampleCard}
          >
            <Text style={styles.cardTitle}>Card Acessível</Text>
            <Text style={styles.cardDescription}>
              Este card tem todas as propriedades de acessibilidade configuradas
            </Text>
          </AccessibleCard>

          <View style={styles.chipRow}>
            {[getString('karate'), getString('jiujitsu'), getString('muayThai')].map((modality, index) => (
              <AccessibleChip
                key={index}
                selected={selectedChips.includes(index)}
                onPress={() => toggleChip(index)}
                accessibilityLabel={`Modalidade ${modality}`}
                accessibilityHint={
                  selectedChips.includes(index)
                    ? 'Selecionado, toque para desmarcar'
                    : 'Toque para selecionar'
                }
                style={styles.chip}
              >
                {modality}
              </AccessibleChip>
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Seção 4: Sistema de Undo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Sistema de Undo</Text>
          <Text style={styles.sectionDescription}>
            Desfaça ações destrutivas em 5 segundos
          </Text>

          {items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <AccessibleIconButton
                icon="delete"
                onPress={() => handleDeleteItem(item)}
                accessibilityLabel={`Excluir ${item.name}`}
                accessibilityHint="Você poderá desfazer esta ação"
                color={COLORS.error[500]}
              />
            </View>
          ))}
        </View>

        <Divider style={styles.divider} />

        {/* Seção 5: Onboarding */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Sistema de Onboarding</Text>
          <Text style={styles.sectionDescription}>
            Tours guiados para novos usuários
          </Text>

          <AccessibleButton
            mode="contained"
            onPress={handleStartTour}
            accessibilityLabel="Iniciar tour de demonstração"
            icon="play-circle"
            style={styles.tourButton}
          >
            Iniciar Tour Demo
          </AccessibleButton>

          <AccessibleButton
            mode="outlined"
            onPress={resetAllTours}
            accessibilityLabel="Resetar todos os tours"
            icon="refresh"
            style={styles.tourButton}
          >
            Resetar Tours
          </AccessibleButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.base,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  divider: {
    marginVertical: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  tokenExamples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tokenBox: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...getElevation('sm'),
  },
  tokenLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  errorMessage: {
    marginBottom: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  smallButton: {
    flex: 1,
  },
  exampleCard: {
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    marginRight: 0,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
    ...getElevation('xs'),
  },
  itemName: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.primary,
  },
  tourButton: {
    marginBottom: SPACING.sm,
  },
});

export default UIUXExampleScreen;
