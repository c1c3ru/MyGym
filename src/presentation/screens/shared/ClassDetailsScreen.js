import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, Alert, Dimensions } from 'react-native';
import {
  Card,
  Text,
  Button,
  List,
  Divider,
  Badge,
  FAB,
  Surface,
  Avatar,
  Chip,
  Snackbar
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { academyFirestoreService } from '@services/academyFirestoreService';
import { useAuth } from '@contexts/AuthProvider';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const { width } = Dimensions.get('window');

const ClassDetailsScreen = ({ route, navigation }) => {
  const { classId, classData = null } = route.params || {};
  const { user, userProfile } = useAuth();
  const { isAdmin } = useCustomClaims();
  const [classInfo, setClassInfo] = useState(classData);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(!classData);
  const [refreshing, setRefreshing] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    if (classId) {
      loadClassDetails();
    }
  }, [classId]);

  const loadClassDetails = async () => {
    try {
      setLoading(true);
      
      if (!classInfo) {
        // Obter ID da academia para buscar a turma
        const academiaId = userProfile?.academiaId || academia?.id;
        if (!academiaId) {
          console.error(getString('academyIdNotFound'));
          return;
        }
        
        console.log('🔍 Carregando detalhes da turma:', classId, 'academia:', academiaId);
        const classDetails = await academyFirestoreService.getById('classes', classId, academiaId);
        setClassInfo(classDetails);
      }
      
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }
      
      // Buscar alunos da turma na academia
      console.log('👥 Carregando alunos da turma...');
      const allStudents = await academyFirestoreService.getAll('students', academiaId);
      const classStudents = allStudents.filter(student => 
        student.classIds && 
        student.classIds.includes(classId)
      );
      console.log('✅ Alunos da turma encontrados:', classStudents.length);
      setStudents(classStudents);
      
    } catch (error) {
      console.error('Erro ao carregar detalhes da turma:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadClassDetails();
  };

  const handleDeleteClass = () => {
    if (!classId) return;
    Alert.alert(
      '🗑️ Confirmar Exclusão',
      'Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita e todos os alunos serão desvinculados.',
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await firestoreService.delete('classes', classId);
              setSnackbar({
                visible: true,
                message: '✅ Turma excluída com sucesso!',
                type: 'success'
              });
              setTimeout(() => {
                navigation.goBack();
              }, 1500);
            } catch (error) {
              console.error('❌ Erro ao excluir turma:', error);
              setSnackbar({
                visible: true,
                message: '❌ Erro ao excluir turma. Tente novamente.',
                type: 'error'
              });
            }
          }
        }
      ]
    );
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return getString('notDefined');
    
    // Se for uma string, retornar diretamente
    if (typeof schedule === 'string') {
      return schedule;
    }
    
    // Se for um objeto único com dayOfWeek, minute, hour
    if (schedule.dayOfWeek !== undefined && schedule.hour !== undefined && schedule.minute !== undefined) {
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const dayName = days[schedule.dayOfWeek] || `Dia ${schedule.dayOfWeek}`;
      const time = `${schedule.hour.toString().padStart(2, '0')}:${schedule.minute.toString().padStart(2, '0')}`;
      return `${dayName} - ${time}`;
    }
    
    // Se for um array
    if (Array.isArray(schedule)) {
      return schedule.map(s => {
        if (typeof s === 'string') return s;
        if (s.dayOfWeek !== undefined && s.hour !== undefined && s.minute !== undefined) {
          const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          const dayName = days[s.dayOfWeek] || `Dia ${s.dayOfWeek}`;
          const time = `${s.hour.toString().padStart(2, '0')}:${s.minute.toString().padStart(2, '0')}`;
          return `${dayName} - ${time}`;
        }
        return `${s.day || getString('day')} - ${s.time || 'Horário'}`;
      }).join(', ');
    }
    
    return getString('scheduleNotDefined');
  };

  const getModalityColor = (modality) => {
    const colors = {
      getString('jiujitsu'): COLORS.info[500],
      getString('muayThai'): COLORS.error[500],
      getString('mma'): COLORS.warning[500],
      getString('boxing'): COLORS.primary[500]
    };
    return colors[modality] || COLORS.text.secondary;
  };

  if (loading && !classInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando detalhes da turma...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header da Turma */}
        <Surface style={styles.headerCard} elevation={4}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{classInfo?.name || getString('class')}</Text>
                <Chip 
                  mode="flat"
                  style={[styles.modalityChip, { backgroundColor: getModalityColor(classInfo?.modality) }]}
                  textStyle={styles.modalityText}
                >
                  {classInfo?.modality || getString('modality')}
                </Chip>
              </View>
              <Avatar.Icon 
                size={60} 
                icon="school" 
                style={[styles.classAvatar, { backgroundColor: getModalityColor(classInfo?.modality) }]}
              />
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={24} color={COLORS.info[500]} />
                <Text style={styles.statNumber}>{students.length}</Text>
                <Text style={styles.statLabel}>Alunos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="time" size={24} color={COLORS.primary[500]} />
                <Text style={styles.statNumber}>{classInfo?.schedule?.length || 0}</Text>
                <Text style={styles.statLabel}>Horários</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="trophy" size={24} color={COLORS.warning[500]} />
                <Text style={styles.statNumber}>{classInfo?.level || getString('all')}</Text>
                <Text style={styles.statLabel}>Nível</Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Informações Detalhadas */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>📋 Informações</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={24} color={COLORS.info[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Instrutor</Text>
                <Text style={styles.infoValue}>
                  {classInfo?.instructorName || classInfo?.instructor || getString('notDefined')}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={24} color={COLORS.primary[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Horários</Text>
                <Text style={styles.infoValue}>
                  {formatSchedule(classInfo?.schedule) || classInfo?.scheduleText || getString('scheduleNotDefined')}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={24} color={COLORS.warning[500]} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Capacidade</Text>
                <Text style={styles.infoValue}>
                  {students.length} / {classInfo?.maxStudents || '∞'} alunos
                </Text>
              </View>
            </View>
            
            {classInfo?.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.infoLabel}>Descrição</Text>
                <Text style={styles.descriptionText}>{classInfo.description}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Botão Alunos */}
        <Card style={styles.studentsCard}>
          <Card.Content>
            <View style={styles.studentsHeader}>
              <View style={styles.studentsInfo}>
                <Text style={styles.sectionTitle}>👥 Alunos Matriculados</Text>
                <Text style={styles.studentsCount}>{students.length} aluno{students.length !== 1 ? 's' : ''}</Text>
              </View>
              <Button
                mode={showStudents ? "contained" : "outlined"}
                onPress={() => setShowStudents(!showStudents)}
                icon={showStudents ? "chevron-up" : "chevron-down"}
                style={styles.toggleButton}
              >
                {showStudents ? getString('hide') : 'Ver Alunos'}
              </Button>
            </View>
            
            {showStudents && (
              <View style={styles.studentsList}>
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <Surface key={student.id || index} style={styles.studentItem} elevation={1}>
                      <View style={styles.studentInfo}>
                        <Avatar.Text 
                          size={40} 
                          label={student.name?.charAt(0)?.toUpperCase() || 'A'}
                          style={styles.studentAvatar}
                        />
                        <View style={styles.studentDetails}>
                          <Text style={styles.studentName}>{student.name}</Text>
                          <Text style={styles.studentEmail}>{student.email}</Text>
                        </View>
                      </View>
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => navigation.navigate(getString('studentDetails'), { 
                          studentId: student.id, 
                          studentData: student 
                        })}
                        style={styles.studentButton}
                      >
                        Ver Perfil
                      </Button>
                    </Surface>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color={COLORS.gray[400]} />
                    <Text style={styles.emptyText}>Nenhum aluno matriculado</Text>
                    <Text style={styles.emptySubtext}>Os alunos aparecerão aqui quando se matricularem</Text>
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Ações Rápidas */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>⚡ Ações Rápidas</Text>
            
            <View style={styles.actionsGrid}>
              <Surface style={styles.actionItem} elevation={2}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate(getString('checkIns'), { 
                    classId: classId, 
                    className: classInfo?.name 
                  })}
                  style={[styles.actionButton, { backgroundColor: COLORS.info[500] }]}
                  contentStyle={styles.actionButtonContent}
                  labelStyle={styles.actionButtonLabel}
                >
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                  {"\n"}Check-ins
                </Button>
              </Surface>
              
              <Surface style={styles.actionItem} elevation={2}>
                <Button
                  mode="contained"
                  onPress={() => {
                    // Navegação condicional baseada no tipo de usuário
                    if (isAdmin()) {
                      navigation.navigate('ClassStudents', { classId: classId });
                    } else {
                      // Para instrutores, mostrar/ocultar lista de alunos na própria tela
                      setShowStudents(!showStudents);
                    }
                  }}
                  style={[styles.actionButton, { backgroundColor: COLORS.primary[500] }]}
                  contentStyle={styles.actionButtonContent}
                  labelStyle={styles.actionButtonLabel}
                >
                  <Ionicons name={showStudents ? "eye-off" : "eye"} size={20} color={COLORS.white} />
                  {"\n"}{isAdmin() ? 'Gerenciar' : (showStudents ? getString('hide') : 'Ver Alunos')}
                </Button>
              </Surface>
            </View>
            
            <Divider style={styles.actionDivider} />
            
            <Button
              mode="contained"
              onPress={handleDeleteClass}
              style={styles.deleteButton}
              contentStyle={styles.deleteButtonContent}
              icon="delete"
            >
              Excluir Turma
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
      
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={{
          backgroundColor: snackbar.type === 'success' ? COLORS.primary[500] : COLORS.error[500]
        }}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header Card Styles
  headerCard: {
    margin: SPACING.base,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
  },
  headerContent: {
    padding: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  classInfo: {
    flex: 1,
    marginRight: 16,
  },
  className: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  modalityChip: {
    alignSelf: 'flex-start',
    borderRadius: BORDER_RADIUS.lg,
  },
  modalityText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: FONT_SIZE.sm,
  },
  classAvatar: {
    backgroundColor: COLORS.info[500],
  },
  
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.background.light,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray[900],
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: 16,
  },
  
  // Details Card
  detailsCard: {
    margin: SPACING.base,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray[900],
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[900],
  },
  descriptionContainer: {
    marginTop: SPACING.sm,
  },
  descriptionText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  
  // Students Card
  studentsCard: {
    margin: SPACING.base,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentsInfo: {
    flex: 1,
  },
  studentsCount: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  toggleButton: {
    borderRadius: BORDER_RADIUS.md,
  },
  studentsList: {
    marginTop: 16,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    backgroundColor: COLORS.info[500],
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray[900],
  },
  studentEmail: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  studentButton: {
    borderRadius: BORDER_RADIUS.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[400],
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  
  // Actions Card
  actionsCard: {
    margin: SPACING.base,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionItem: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
  },
  actionButton: {
    borderRadius: BORDER_RADIUS.md,
    minHeight: 60,
  },
  actionButtonContent: {
    height: 60,
    flexDirection: 'column',
  },
  actionButtonLabel: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  actionDivider: {
    marginVertical: 16,
  },
  deleteButton: {
    backgroundColor: COLORS.error[500],
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: 0,
    maxWidth: '100%',
  },
  deleteButtonContent: {
    height: 48,
    paddingHorizontal: 16,
  },
});

export default ClassDetailsScreen;
