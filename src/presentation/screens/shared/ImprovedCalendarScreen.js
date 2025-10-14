import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@services/academyFirestoreService';
import { useCustomClaims } from '@hooks/useCustomClaims';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import FreeGymScheduler from '@components/FreeGymScheduler';
import { COLORS } from '@presentation/theme/designTokens';
import { getString } from '@utils/theme';

/**
 * Tela de calendário melhorada usando o FreeGymScheduler
 * Substitui o EnhancedCalendarScreen com funcionalidades aprimoradas
 */
const ImprovedCalendarScreen = ({ navigation }) => {
  const { user, userProfile, academia } = useAuth();
  const { getString } = useTheme();
  const { role, isAdmin, isInstructor, isStudent } = useCustomClaims();
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics tracking
  useScreenTracking('ImprovedCalendarScreen', { 
    academiaId: userProfile?.academiaId,
    userType: userProfile?.userType,
    role 
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  // Carregar turmas baseado no role do usuário
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.warn('⚠️ Nenhuma academia encontrada para carregar turmas');
        setClasses([]);
        return;
      }

      console.log('🔍 Carregando turmas do calendário...', { academiaId, role });

      // Usar cache para melhor performance
      const userClasses = await cacheService.getOrSet(
        CACHE_KEYS.CALENDAR_CLASSES(academiaId, role),
        async () => {
          const allClasses = await academyFirestoreService.getAll('classes', academiaId);
          let filteredClasses = [];
          
          if (isAdmin()) {
            // Admin vê todas as turmas da academia
            filteredClasses = allClasses;
          } else if (isInstructor()) {
            // Instrutor vê suas turmas da academia
            filteredClasses = allClasses.filter(cls => cls.instructorId === user.id);
          } else if (isStudent()) {
            // Aluno vê suas turmas matriculadas da academia
            filteredClasses = allClasses.filter(cls => 
              userProfile?.classIds && userProfile.classIds.includes(cls.id)
            );
          }
          
          return filteredClasses;
        },
        CACHE_TTL.MEDIUM // Cache por 5 minutos
      );
      
      setClasses(userClasses);
      
      console.log('✅ Turmas do calendário carregadas com sucesso', {
        total: userClasses.length,
        role
      });
      
      // Track analytics
      trackFeatureUsage('calendar_classes_loaded', {
        academiaId,
        role,
        classesCount: userClasses.length
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar turmas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.academiaId, academia?.id, role, user.id, userProfile?.classIds, isAdmin, isInstructor, isStudent, trackFeatureUsage]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Refresh manual
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache para forçar refresh
    const academiaId = userProfile?.academiaId || academia?.id;
    if (academiaId) {
      cacheService.invalidatePattern(`calendar_classes:${academiaId}`);
    }
    loadClasses();
  }, [loadClasses, userProfile?.academiaId, academia?.id]);

  // Navegar para detalhes da turma
  const handleClassPress = useCallback((event) => {
    trackButtonClick('calendar_class_select', { 
      classId: event.classId,
      modality: event.modality 
    });
    
    navigation.navigate('ClassDetails', { 
      classId: event.classId,
      className: event.title 
    }));
  }, [navigation, trackButtonClick]);

  // Navegar para criar nova turma (apenas admin/instrutor)
  const handleCreateClass = useCallback(() => {
    trackButtonClick('calendar_create_class');
    
    if (isAdmin()) {
      navigation.navigate(getString('addClassScreen'));
    } else if (isInstructor()) {
      navigation.navigate(getString('addClassScreen', { instructorId: user.id }));
    }
  }, [navigation, trackButtonClick, isAdmin, isInstructor, user.id]);

  // Callback para seleção de data
  const handleDatePress = useCallback((date, dayEvents) => {
    trackButtonClick('calendar_date_select', { 
      date,
      eventsCount: dayEvents.length 
    });
    
    console.log('📅 Data selecionada:', date, 'Eventos:', dayEvents.length);
  }, [trackButtonClick]);

  return (
    <EnhancedErrorBoundary>
      <SafeAreaView style={styles.container}>
        <FreeGymScheduler
          classes={classes}
          onClassPress={handleClassPress}
          onDatePress={handleDatePress}
          onCreateClass={(isAdmin() || isInstructor()) ? handleCreateClass : null}
          navigation={navigation}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      </SafeAreaView>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100]
  }
});

export default ImprovedCalendarScreen;
