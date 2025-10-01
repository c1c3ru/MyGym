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
  Z_INDEX, 
  OPACITY 
} from '@presentation/theme/designTokens';

const { width, height } = Dimensions.get('window');

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
   */
  const startTour = useCallback((tour) => {
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
        <OnboardingOverlay
          tour={currentTour}
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
const OnboardingOverlay = ({
  tour,
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
}) => {
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop escurecido */}
        <View style={styles.backdrop} />

        {/* Spotlight (se houver target) */}
        {step.target && (
          <View
            style={[
              styles.spotlight,
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
            styles.tooltip,
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
                color={COLORS.primary[500]}
                style={styles.tooltipIcon}
              />
            )}
            <View style={styles.tooltipHeaderText}>
              <Text style={styles.tooltipTitle}>{step.title}</Text>
              <Text style={styles.tooltipProgress}>
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
          <Text style={styles.tooltipMessage}>{step.message}</Text>

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
              {stepIndex === totalSteps - 1 ? 'Concluir' : 'Próximo'}
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
// TOURS PRÉ-DEFINIDOS
// ============================================
export const ONBOARDING_TOURS = {
  ADMIN_DASHBOARD: {
    id: 'admin_dashboard',
    name: 'Dashboard do Administrador',
    steps: [
      {
        title: 'Bem-vindo ao MyGym!',
        message: 'Vamos fazer um tour rápido pelas principais funcionalidades do dashboard.',
        icon: 'hand-wave',
        position: 'center',
      },
      {
        title: 'Estatísticas Rápidas',
        message: 'Aqui você vê um resumo dos principais números da sua academia: alunos, turmas e pagamentos.',
        icon: 'chart-box',
        position: 'top',
      },
      {
        title: 'Ações Rápidas',
        message: 'Use estes botões para acessar rapidamente as funções mais usadas.',
        icon: 'lightning-bolt',
        position: 'bottom',
      },
      {
        title: 'Menu de Navegação',
        message: 'Use a barra inferior para navegar entre as diferentes seções do app.',
        icon: 'navigation',
        position: 'bottom',
      },
    ],
  },
  INSTRUCTOR_CHECKIN: {
    id: 'instructor_checkin',
    name: 'Sistema de Check-in',
    steps: [
      {
        title: 'Check-in de Alunos',
        message: 'Aqui você registra a presença dos alunos nas suas turmas.',
        icon: 'clipboard-check',
        position: 'center',
      },
      {
        title: 'Selecionar Turma',
        message: 'Primeiro, selecione a turma para a qual deseja fazer o check-in.',
        icon: 'school',
        position: 'top',
      },
      {
        title: 'Marcar Presença',
        message: 'Toque nos alunos para marcar presença. Você pode usar o QR Code ou marcar manualmente.',
        icon: 'account-check',
        position: 'center',
      },
    ],
  },
  STUDENT_DASHBOARD: {
    id: 'student_dashboard',
    name: 'Dashboard do Aluno',
    steps: [
      {
        title: 'Seu Dashboard',
        message: 'Aqui você acompanha suas turmas, pagamentos e progresso.',
        icon: 'view-dashboard',
        position: 'center',
      },
      {
        title: 'Minhas Turmas',
        message: 'Veja suas turmas, horários e próximas aulas.',
        icon: 'calendar',
        position: 'top',
      },
      {
        title: 'Graduações',
        message: 'Acompanhe seu progresso e próximas graduações.',
        icon: 'trophy',
        position: 'center',
      },
    ],
  },
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
    backgroundColor: COLORS.overlay.darker,
  },
  spotlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 3,
    borderColor: COLORS.primary[500],
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: COLORS.COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.base,
    maxWidth: width - SPACING.base * 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tooltipTop: {
    top: SPACING.xxl,
    left: SPACING.base,
    right: SPACING.base,
  },
  tooltipBottom: {
    bottom: SPACING.xxl,
    left: SPACING.base,
    right: SPACING.base,
  },
  tooltipCenter: {
    top: '50%',
    left: SPACING.base,
    right: SPACING.base,
    transform: [{ translateY: -150 }],
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
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xxs,
  },
  tooltipProgress: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.secondary,
  },
  tooltipMessage: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    lineHeight: FONT_SIZE.base * 1.5,
    marginBottom: SPACING.lg,
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
