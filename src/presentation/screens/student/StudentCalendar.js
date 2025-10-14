import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@services/academyFirestoreService';
import FreeGymScheduler from '@components/FreeGymScheduler';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { COLORS } from '@presentation/theme/designTokens';
import { getString } from '@utils/theme';

/**
 * Calendário do Aluno usando FreeGymScheduler
 * Mostra apenas as turmas em que o aluno está matriculado
 */
const StudentCalendar = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const { getString } = useTheme();
  const { isStudent } = useCustomClaims();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar turmas do aluno
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!userProfile?.academiaId) {
        console.warn('⚠️ Usuário sem academiaId definido');
        setClasses([]);
        return;
      }

      // Buscar todas as turmas da academia
      const allClasses = await academyFirestoreService.getAll('classes', userProfile.academiaId);
      
      // Filtrar apenas as turmas em que o aluno está matriculado
      const studentClasses = allClasses.filter(cls => 
        userProfile?.classIds && userProfile.classIds.includes(cls.id)
      );
      
      setClasses(studentClasses);
      console.log('✅ Turmas do aluno carregadas:', studentClasses.length);
      
    } catch (error) {
      console.error('❌ Erro ao carregar turmas do aluno:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.academiaId, userProfile?.classIds]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Refresh manual
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClasses();
  }, [loadClasses]);

  // Navegar para detalhes da turma
  const handleClassPress = useCallback((event) => {
    navigation.navigate('ClassDetails'), { 
      classId: event.classId,
      className: event.title 
    });
  }, [navigation]);

  // Callback para seleção de data
  const handleDatePress = useCallback((date, dayEvents) => {
    console.log('📅 Data selecionada:', date, 'Eventos:', dayEvents.length);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FreeGymScheduler
        classes={classes}
        onClassPress={handleClassPress}
        onDatePress={handleDatePress}
        onCreateClass={null} // Alunos não podem criar turmas
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100]
  }
});

export default StudentCalendar;
