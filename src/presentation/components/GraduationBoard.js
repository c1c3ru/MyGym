import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  Chip,
  Button,
  Surface,
  Divider,
  IconButton,
  SegmentedButtons
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import GraduationAlertCard from './GraduationAlertCard';

const GraduationBoard = ({ 
  graduationBoard, 
  onRefresh, 
  onScheduleExam, 
  onViewStudentDetails,
  userRole = 'instructor',
  isLoading = false 
}) => {
  const [activeTab, setActiveTab] = useState('eligible');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getModalityIcon = (modality) => {
    const icons = {
      'Karatê': 'hand-right',
      'Jiu-Jitsu': 'fitness',
      'Muay Thai': 'flash',
      'Judô': 'body',
      'Taekwondo': 'footsteps'
    };
    return icons[modality] || 'trophy';
  };

  const renderUpcomingExams = () => {
    if (!graduationBoard?.upcomingExams?.length) {
      return (
        <Surface style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum exame agendado</Text>
          {userRole === 'admin' && (
            <Button 
              mode="outlined" 
              onPress={() => onScheduleExam?.()}
              style={styles.emptyAction}
            >
              Agendar Exame
            </Button>
          )}
        </Surface>
      );
    }

    return graduationBoard.upcomingExams.map((exam) => (
      <Card key={exam.id} style={styles.examCard}>
        <Card.Content>
          <View style={styles.examHeader}>
            <View style={styles.examInfo}>
              <Text style={styles.examTitle}>{exam.modality}</Text>
              <Text style={styles.examDate}>{formatDate(exam.date)}</Text>
              <Text style={styles.examLocation}>{exam.location}</Text>
            </View>
            
            <Chip 
              icon={getModalityIcon(exam.modality)}
              style={styles.modalityChip}
            >
              {exam.candidateStudents.length} candidatos
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.examDetails}>
            <View style={styles.examDetailRow}>
              <Ionicons name="person" size={16} color="#666" />
              <Text style={styles.examDetailText}>Examinador: {exam.examiner}</Text>
            </View>
            
            <View style={styles.examDetailRow}>
              <Ionicons name="people" size={16} color="#666" />
              <Text style={styles.examDetailText}>
                {exam.candidateStudents.length} candidatos inscritos
              </Text>
            </View>
          </View>

          {userRole === 'admin' && (
            <View style={styles.examActions}>
              <Button 
                mode="outlined" 
                onPress={() => onViewStudentDetails?.(exam)}
                style={styles.examActionButton}
              >
                Ver Candidatos
              </Button>
              <Button 
                mode="contained" 
                onPress={() => onScheduleExam?.(exam)}
                style={styles.examActionButton}
              >
                Editar Exame
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    ));
  };

  const renderEligibleStudents = () => {
    if (!graduationBoard?.eligibleStudents?.length) {
      return (
        <Surface style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum aluno elegível</Text>
          <Text style={styles.emptySubtext}>
            Os alunos aparecerão aqui quando estiverem prontos para graduação
          </Text>
        </Surface>
      );
    }

    return graduationBoard.eligibleStudents.map((alert) => (
      <GraduationAlertCard
        key={alert.id}
        alert={alert}
        onViewDetails={onViewStudentDetails}
        onScheduleExam={userRole === 'admin' ? onScheduleExam : undefined}
        compact={false}
      />
    ));
  };

  const renderRecentGraduations = () => {
    if (!graduationBoard?.recentGraduations?.length) {
      return (
        <Surface style={styles.emptyState}>
          <Ionicons name="medal-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Nenhuma graduação recente</Text>
        </Surface>
      );
    }

    return graduationBoard.recentGraduations.map((result, index) => (
      <Card key={index} style={styles.graduationCard}>
        <Card.Content>
          <View style={styles.graduationHeader}>
            <View style={styles.graduationInfo}>
              <Text style={styles.graduationStudent}>{result.studentName}</Text>
              <Text style={styles.graduationBelt}>Nova faixa: {result.newBelt}</Text>
            </View>
            
            <Chip 
              icon={result.passed ? "checkmark-circle" : "close-circle"}
              style={[
                styles.resultChip,
                { backgroundColor: result.passed ? '#4CAF50' : '#F44336' }
              ]}
            >
              {result.passed ? 'Aprovado' : 'Reprovado'}
            </Chip>
          </View>

          {result.score && (
            <Text style={styles.graduationScore}>Nota: {result.score}/10</Text>
          )}
          
          {result.notes && (
            <Text style={styles.graduationNotes}>{result.notes}</Text>
          )}
        </Card.Content>
      </Card>
    ));
  };

  const renderModalityStats = () => {
    if (!graduationBoard?.modalityStats?.length) {
      return (
        <Surface style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Sem estatísticas disponíveis</Text>
        </Surface>
      );
    }

    return graduationBoard.modalityStats.map((stat) => (
      <Card key={stat.modality} style={styles.statCard}>
        <Card.Content>
          <View style={styles.statHeader}>
            <Text style={styles.statModality}>{stat.modality}</Text>
            <Chip icon={getModalityIcon(stat.modality)}>
              {stat.totalStudents} alunos
            </Chip>
          </View>

          <View style={styles.statDetails}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Elegíveis:</Text>
              <Text style={styles.statValue}>{stat.eligibleStudents}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tempo médio:</Text>
              <Text style={styles.statValue}>
                {Math.floor(stat.averageTrainingTime / 30)} meses
              </Text>
            </View>
            
            {stat.nextExamDate && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Próximo exame:</Text>
                <Text style={styles.statValue}>{formatDate(stat.nextExamDate)}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    ));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'exams':
        return renderUpcomingExams();
      case 'eligible':
        return renderEligibleStudents();
      case 'recent':
        return renderRecentGraduations();
      case 'stats':
        return renderModalityStats();
      default:
        return renderEligibleStudents();
    }
  };

  const tabs = [
    { value: 'eligible', label: 'Elegíveis', icon: 'trophy' },
    { value: 'exams', label: 'Exames', icon: 'calendar' },
    { value: 'recent', label: 'Recentes', icon: 'medal' },
    { value: 'stats', label: 'Estatísticas', icon: 'bar-chart' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mural de Graduações</Text>
        <IconButton 
          icon="refresh" 
          onPress={handleRefresh}
          disabled={isLoading || refreshing}
        />
      </View>

      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={tabs.map(tab => ({
          value: tab.value,
          label: tab.label,
          icon: tab.icon
        }))}
        style={styles.segmentedButtons}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  segmentedButtons: {
    margin: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  examCard: {
    marginBottom: 12,
    elevation: 2,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  examDate: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 2,
  },
  examLocation: {
    fontSize: 14,
    color: '#666',
  },
  modalityChip: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 12,
  },
  examDetails: {
    marginBottom: 12,
  },
  examDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  examDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  examActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  examActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  graduationCard: {
    marginBottom: 8,
    elevation: 1,
  },
  graduationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  graduationInfo: {
    flex: 1,
  },
  graduationStudent: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  graduationBelt: {
    fontSize: 14,
    color: '#666',
  },
  resultChip: {
    alignSelf: 'flex-start',
  },
  graduationScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  graduationNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  statCard: {
    marginBottom: 8,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statModality: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statDetails: {
    gap: 6,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 8,
    marginVertical: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: 16,
  },
});

export default GraduationBoard;
