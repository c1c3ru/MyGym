/**
 * OnboardingTour - Sistema de onboarding interativo
 * 
 * Guia novos usuários através das funcionalidades principais do app
 * com tooltips, overlays e tours guiados.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Modal, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  COLORS,
  SPACING, 
  FONT_SIZE, 
  FONT_WEIGHT, 
  BORDER_RADIUS,
  BORDER_WIDTH,
  Z_INDEX, 
  OPACITY 
} from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { getString } from '@shared/utils/theme';

const { width, height } = Dimensions.get('window');

// ============================================
// TOURS PRÉ-DEFINIDOS
// ============================================
export const ONBOARDING_TOURS = {
  ADMIN_DASHBOARD: {
    id: 'admin_dashboard',
    name: 'Dashboard do Administrador',
    steps: [
      {
        title: 'Bem-vindo ao MyGym!',
        message: 'Vamos fazer um tour rápido pelas principais funcionalidades do dashboard administrativo.',
        icon: 'hand-wave',
        position: 'center',
      },
      {
        title: 'Estatísticas Rápidas',
        message: 'Aqui você vê um resumo dos principais números da sua academia: alunos ativos, turmas, receita mensal e pagamentos pendentes.',
        icon: 'chart-box',
        position: 'top',
      },
      {
        title: 'Ações Rápidas',
        message: 'Use estes botões para adicionar novos alunos, criar turmas, registrar pagamentos e muito mais.',
        icon: 'lightning-bolt',
        position: 'center',
      },
      {
        title: 'Menu de Navegação',
        message: 'Use a barra inferior para navegar entre Dashboard, Alunos, Turmas, Relatórios e Configurações.',
        icon: 'navigation',
        position: 'bottom',
      },
    ],
  },
  INSTRUCTOR_CHECKIN: {
    id: 'instructor_checkin',
    name: 'Dashboard do Instrutor',
    steps: [
      {
        title: 'Bem-vindo, Instrutor!',
        message: 'Aqui você gerencia suas turmas, faz check-in de alunos e acompanha o progresso.',
        icon: 'account-tie',
        position: 'center',
      },
      {
        title: 'Suas Turmas',
        message: 'Veja todas as suas turmas ativas, horários e número de alunos matriculados.',
        icon: 'school',
        position: 'top',
      },
      {
        title: 'Check-in Rápido',
        message: 'Use o botão de check-in para registrar a presença dos alunos. Você pode usar QR Code ou seleção manual.',
        icon: 'qrcode-scan',
        position: 'center',
      },
      {
        title: 'Agendar Aulas',
        message: 'Crie novos horários de aula para suas turmas de forma rápida e fácil.',
        icon: 'calendar-plus',
        position: 'bottom',
      },
    ],
  },
  STUDENT_DASHBOARD: {
    id: 'student_dashboard',
    name: 'Dashboard do Aluno',
    steps: [
      {
        title: 'Bem-vindo ao MyGym!',
        message: 'Aqui você acompanha suas turmas, pagamentos, graduações e muito mais.',
        icon: 'account-circle',
        position: 'center',
      },
      {
        title: 'Status de Graduação',
        message: 'Veja sua graduação atual e quando será sua próxima avaliação.',
        icon: 'trophy',
        position: 'top',
      },
      {
        title: 'Minhas Turmas',
        message: 'Confira suas turmas matriculadas, horários e próximas aulas.',
        icon: 'calendar-clock',
        position: 'center',
      },
      {
        title: 'Frequência',
        message: 'Acompanhe sua taxa de presença e total de aulas realizadas.',
        icon: 'chart-line',
        position: 'center',
      },
      {
        title: 'Anúncios',
        message: 'Fique por dentro das novidades e avisos importantes da academia.',
        icon: 'bullhorn',
        position: 'bottom',
      },
    ],
  },
};

// ============================================
// CONTEXT
// ============================================
const OnboardingContext = createContext(null);

// ============================================
// PROVIDER
// ============================================
export const OnboardingProvider = ({ children }) => {
  const [currentTour, setCurrentTour] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completedTours, setCompletedTours] = useState([]);

  // Carrega tours completados do AsyncStorage
  useEffect(() => {
    loadCompletedTours();
  }, []);

  const loadCompletedTours = async () => {
    try {
      const completed = await AsyncStorage.getItem('@onboarding_completed');
      if (completed) {
        setCompletedTours(JSON.parse(completed));
      }
    } catch (error) {
      console.error('Erro ao carregar tours completados:', error);
    }
  };

  const saveCompletedTour = async (tourId) => {
    try {
      const updated = [...completedTours, tourId];
      await AsyncStorage.setItem('@onboarding_completed', JSON.stringify(updated));
      setCompletedTours(updated);
    } catch (error) {
      console.error('Erro ao salvar tour completado:', error);
    }
  };

  /**
   * Inicia um tour de onboarding
   * @param {string|object} tourIdOrObject - ID do tour (string) ou objeto do tour
   */
  const startTour = useCallback((tourIdOrObject) => {
    // Se for string, busca o tour pré-definido
    const tour = typeof tourIdOrObject === 'string' 
      ? ONBOARDING_TOURS[tourIdOrObject]
      : tourIdOrObject;

    if (!tour) {
      console.warn(`Tour "${tourIdOrObject}" não encontrado`);
      return;
    }

    // Verifica se o tour já foi completado
    if (completedTours.includes(tour.id) && !tour.forceShow) {
      return;
    }

    setCurrentTour(tour);
    setCurrentStep(0);
    setIsVisible(true);
  }, [completedTours]);

  /**
   * Avança para o próximo passo
   */
  const nextStep = useCallback(() => {
    if (!currentTour) return;

    if (currentStep < currentTour.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentTour, currentStep]);

  /**
   * Volta para o passo anterior
   */
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  /**
   * Pula o tour
   */
  const skipTour = useCallback(() => {
    if (currentTour) {
      saveCompletedTour(currentTour.id);
    }
    setIsVisible(false);
    setCurrentTour(null);
    setCurrentStep(0);
  }, [currentTour]);

  /**
   * Completa o tour
   */
  const completeTour = useCallback(() => {
    if (currentTour) {
      saveCompletedTour(currentTour.id);
      if (currentTour.onComplete) {
        currentTour.onComplete();
      }
    }
    setIsVisible(false);
    setCurrentTour(null);
    setCurrentStep(0);
  }, [currentTour]);

  /**
   * Reseta todos os tours (para desenvolvimento/testes)
   */
  const resetAllTours = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('@onboarding_completed');
      setCompletedTours([]);
    } catch (error) {
      console.error('Erro ao resetar tours:', error);
    }
  }, []);

  const value = {
    startTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    resetAllTours,
    currentTour,
    currentStep,
    isVisible,
    completedTours,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {isVisible && currentTour && (
        <OnboardingTooltip
          step={currentTour.steps[currentStep]}
          stepIndex={currentStep}
          totalSteps={currentTour.steps.length}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipTour}
        />
      )}
    </OnboardingContext.Provider>
  );
};

// ============================================
// OVERLAY COMPONENT
// ============================================
const OnboardingTooltip = ({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
}) => {
  const { currentTheme } = useThemeToggle();
  
  // Estilos dinâmicos baseados no tema atual
  const dynamicStyles = StyleSheet.create({
    tooltip: {
      ...styles.tooltip,
      backgroundColor: currentTheme.card.default.background,
      borderColor: COLORS.border.default,
      ...Platform.select({
        ios: {
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    tooltipTitle: {
      ...styles.tooltipTitle,
      color: COLORS.text.primary,
    },
    tooltipProgress: {
      ...styles.tooltipProgress,
      color: COLORS.text.primary,
    },
    tooltipMessage: {
      ...styles.tooltipMessage,
      color: COLORS.text.primary,
    },
    backdrop: {
      ...styles.backdrop,
      backgroundColor: currentTheme.overlay.default,
    },
    spotlight: {
      ...styles.spotlight,
      borderColor: COLORS.border.default,
      shadowColor: COLORS.black,
    },
  });
  
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop escurecido */}
        <View style={dynamicStyles.backdrop} />

        {/* Spotlight (se houver target) */}
        {step.target && (
          <View
            style={[
              dynamicStyles.spotlight,
              {
                top: step.target.y - 10,
                left: step.target.x - 10,
                width: step.target.width + 20,
                height: step.target.height + 20,
              },
            ]}
          />
        )}

        {/* Tooltip */}
        <View
          style={[
            dynamicStyles.tooltip,
            step.position === 'top' && styles.tooltipTop,
            step.position === 'bottom' && styles.tooltipBottom,
            step.position === 'center' && styles.tooltipCenter,
          ]}
        >
          {/* Header */}
          <View style={styles.tooltipHeader}>
            {step.icon && (
              <MaterialCommunityIcons
                name={step.icon}
                size={32}
                color={currentTheme.primary[500]}
                style={styles.tooltipIcon}
              />
            )}
            <View style={styles.tooltipHeaderText}>
              <Text style={dynamicStyles.tooltipTitle}>{step.title}</Text>
              <Text style={dynamicStyles.tooltipProgress}>
                {stepIndex + 1} de {totalSteps}
              </Text>
            </View>
            <IconButton
              icon="close"
              size={20}
              onPress={onSkip}
              accessibilityLabel="Pular tour"
            />
          </View>

          {/* Content */}
          <Text style={dynamicStyles.tooltipMessage}>{step.message}</Text>

          {/* Actions */}
          <View style={styles.tooltipActions}>
            {stepIndex > 0 && (
              <Button
                mode="text"
                onPress={onPrevious}
                accessibilityLabel="Passo anterior"
              >
                Anterior
              </Button>
            )}
            <View style={styles.spacer} />
            <Button
              mode="text"
              onPress={onSkip}
              accessibilityLabel="Pular tour"
            >
              Pular
            </Button>
            <Button
              mode="contained"
              onPress={onNext}
              style={styles.nextButton}
              accessibilityLabel={
                stepIndex === totalSteps - 1 ? 'Concluir tour' : 'Próximo passo'
              }
            >
              {stepIndex === totalSteps - 1 ? 'Concluir' : getString('next')}
            </Button>
          </View>

          {/* Progress dots */}
          <View style={styles.progressDots}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === stepIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============================================
// HOOK
// ============================================
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding deve ser usado dentro de OnboardingProvider');
  }
  return context;
};

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay.default,  // Será sobrescrito pelos estilos dinâmicos
  },
  spotlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDER_WIDTH.thick,  // Borda mais visível
    borderColor: COLORS.primary[400],  // Será sobrescrito pelos estilos dinâmicos
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,  // Sombra mais forte
    shadowRadius: 12,    // Raio maior
    elevation: 12,       // Elevação maior
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: COLORS.card.default.background,  // Será sobrescrito pelos estilos dinâmicos
    borderRadius: BORDER_RADIUS.lg,
    padding: width < 360 ? SPACING.lg : SPACING.xl,
    maxWidth: width - SPACING.base * 2,
    // Sombra será definida nos estilos dinâmicos
  },
  tooltipTop: {
    top: width < 360 ? SPACING.lg : SPACING.xxl,
    left: '50%',
    transform: [{ translateX: -(width * 0.45) }],
    width: width < 360 ? '95%' : '90%',
    maxWidth: width < 768 ? 400 : 500,
  },
  tooltipBottom: {
    bottom: width < 360 ? SPACING.lg : SPACING.xxl,
    left: '50%',
    transform: [{ translateX: -(width * 0.45) }],
    width: width < 360 ? '95%' : '90%',
    maxWidth: width < 768 ? 400 : 500,
  },
  tooltipCenter: {
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -(width * 0.45) }, 
      { translateY: width < 360 ? -120 : -150 }
    ],
    width: width < 360 ? '95%' : '90%',
    maxWidth: width < 768 ? 400 : 500,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tooltipIcon: {
    marginRight: SPACING.sm,
  },
  tooltipHeaderText: {
    flex: 1,
  },
  tooltipTitle: {
    fontSize: width < 360 ? FONT_SIZE.base : FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,  // Será sobrescrito pelos estilos dinâmicos
    marginBottom: SPACING.xxs,
  },
  tooltipProgress: {
    fontSize: width < 360 ? FONT_SIZE.xxs : FONT_SIZE.xs,
    color: COLORS.text.secondary,  // Será sobrescrito pelos estilos dinâmicos
  },
  tooltipMessage: {
    fontSize: width < 360 ? FONT_SIZE.sm : FONT_SIZE.base,
    color: COLORS.text.primary,  // Será sobrescrito pelos estilos dinâmicos
    lineHeight: (width < 360 ? FONT_SIZE.sm : FONT_SIZE.base) * 1.5,
    marginBottom: width < 360 ? SPACING.md : SPACING.lg,
  },
  tooltipActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    marginLeft: SPACING.sm,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.gray[300],
  },
  dotActive: {
    backgroundColor: COLORS.primary[500],
    width: 24,
  },
});

export default {
  OnboardingProvider,
  useOnboarding,
  ONBOARDING_TOURS,
};
