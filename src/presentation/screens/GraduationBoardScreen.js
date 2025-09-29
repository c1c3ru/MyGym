import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text, FAB, Portal, Dialog, Button } from 'react-native-paper';
import GraduationBoard from '@components/GraduationBoard';
import LoadingSpinner from '@components/LoadingSpinner';
import { useAuth } from '@contexts/AuthProvider';

const GraduationBoardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [graduationBoard, setGraduationBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // Mock data - Em produção, isso viria de uma API
  const mockGraduationBoard = {
    upcomingExams: [
      {
        id: 'exam_1',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        modality: 'Karatê',
        examiner: 'Sensei João Silva',
        location: 'Dojo Principal',
        candidateStudents: ['student_1', 'student_2', 'student_3'],
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'exam_2',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
        modality: 'Jiu-Jitsu',
        examiner: 'Professor Carlos Santos',
        location: 'Tatame 2',
        candidateStudents: ['student_4', 'student_5'],
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    eligibleStudents: [
      {
        id: 'alert_1',
        studentId: 'student_1',
        studentName: 'Ana Silva',
        currentBelt: 'Verde',
        nextBelt: 'Azul',
        modality: 'Karatê',
        estimatedGraduationDate: new Date(),
        trainingStartDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        minimumTrainingDays: 180,
        daysUntilEligible: 0,
        isEligible: true,
        alertLevel: 'ready',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'alert_2',
        studentId: 'student_2',
        studentName: 'Pedro Santos',
        currentBelt: 'Azul',
        nextBelt: 'Marrom',
        modality: 'Karatê',
        estimatedGraduationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trainingStartDate: new Date(Date.now() - 210 * 24 * 60 * 60 * 1000),
        minimumTrainingDays: 240,
        daysUntilEligible: 30,
        isEligible: false,
        alertLevel: 'warning',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'alert_3',
        studentId: 'student_3',
        studentName: 'Maria Oliveira',
        currentBelt: 'Branca',
        nextBelt: 'Azul',
        modality: 'Jiu-Jitsu',
        estimatedGraduationDate: new Date(),
        trainingStartDate: new Date(Date.now() - 750 * 24 * 60 * 60 * 1000),
        minimumTrainingDays: 730,
        daysUntilEligible: 0,
        isEligible: true,
        alertLevel: 'ready',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    recentGraduations: [
      {
        studentId: 'student_6',
        studentName: 'João Costa',
        passed: true,
        newBelt: 'Preta 1º Dan',
        notes: 'Excelente desempenho técnico',
        score: 9.5
      },
      {
        studentId: 'student_7',
        studentName: 'Carla Lima',
        passed: true,
        newBelt: 'Marrom',
        notes: 'Boa evolução',
        score: 8.0
      },
      {
        studentId: 'student_8',
        studentName: 'Rafael Souza',
        passed: false,
        newBelt: null,
        notes: 'Precisa melhorar katas',
        score: 6.5
      }
    ],
    modalityStats: [
      {
        modality: 'Karatê',
        totalStudents: 45,
        eligibleStudents: 8,
        averageTrainingTime: 180,
        nextExamDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        modality: 'Jiu-Jitsu',
        totalStudents: 32,
        eligibleStudents: 5,
        averageTrainingTime: 365,
        nextExamDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      },
      {
        modality: 'Muay Thai',
        totalStudents: 28,
        eligibleStudents: 3,
        averageTrainingTime: 150
      },
      {
        modality: 'Judô',
        totalStudents: 20,
        eligibleStudents: 2,
        averageTrainingTime: 200
      }
    ]
  };

  const loadGraduationBoard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simular carregamento da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Em produção, isso seria uma chamada para a API
      // const board = await graduationService.getGraduationBoard();
      setGraduationBoard(mockGraduationBoard);
      
    } catch (err) {
      setError(err.message || 'Erro ao carregar mural de graduações');
      console.error('Erro ao carregar mural:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGraduationBoard();
    }, [loadGraduationBoard])
  );

  const handleRefresh = useCallback(async () => {
    await loadGraduationBoard();
  }, [loadGraduationBoard]);

  const handleScheduleExam = useCallback((exam = null) => {
    if (user?.role !== 'admin') {
      Alert.alert(
        'Acesso Negado',
        'Apenas administradores podem agendar exames de graduação.'
      );
      return;
    }

    if (exam) {
      // Editar exame existente
      navigation.navigate('ScheduleExam', { examId: exam.id, exam });
    } else {
      // Criar novo exame
      setShowScheduleDialog(true);
    }
  }, [user?.role, navigation]);

  const handleViewStudentDetails = useCallback((alertOrExam) => {
    if (alertOrExam.studentId) {
      // É um alerta de graduação
      navigation.navigate('StudentDetails', { 
        studentId: alertOrExam.studentId,
        tab: 'graduation'
      });
    } else if (alertOrExam.candidateStudents) {
      // É um exame com candidatos
      navigation.navigate('ExamCandidates', { 
        examId: alertOrExam.id,
        candidates: alertOrExam.candidateStudents
      });
    }
  }, [navigation]);

  const handleCreateNewExam = useCallback(() => {
    setShowScheduleDialog(false);
    navigation.navigate('ScheduleExam');
  }, [navigation]);

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Carregando mural de graduações...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar dados</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={handleRefresh}
          style={styles.retryButton}
        >
          Tentar Novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GraduationBoard
        graduationBoard={graduationBoard}
        onRefresh={handleRefresh}
        onScheduleExam={handleScheduleExam}
        onViewStudentDetails={handleViewStudentDetails}
        userRole={user?.role}
        isLoading={isLoading}
      />

      {isAdmin && (
        <FAB
          icon="calendar-plus"
          label="Agendar Exame"
          style={styles.fab}
          onPress={() => setShowScheduleDialog(true)}
        />
      )}

      <Portal>
        <Dialog 
          visible={showScheduleDialog} 
          onDismiss={() => setShowScheduleDialog(false)}
        >
          <Dialog.Title>Agendar Exame de Graduação</Dialog.Title>
          <Dialog.Content>
            <Text>
              Deseja agendar um novo exame de graduação?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowScheduleDialog(false)}>
              Cancelar
            </Button>
            <Button onPress={handleCreateNewExam}>
              Agendar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default GraduationBoardScreen;
