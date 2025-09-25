import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl
} from 'react-native';
import { 
  Card, 
  Text, 
  Button, 
  Avatar,
  Badge,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@services/academyFirestoreService';
import { useAuth } from '@contexts/AuthProvider';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@services/cacheService';
import batchFirestoreService from '@services/batchFirestoreService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import StudentDetailsSkeleton from '@components/skeletons/StudentDetailsSkeleton';

const StudentDetailsScreen = ({ route, navigation }) => {
  const { studentId } = route.params;
  const { user, userProfile, academia } = useAuth();
  const { getString } = useTheme();
  const [studentInfo, setStudentInfo] = useState(route.params.studentData || null);
  const [studentClasses, setStudentClasses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(!route.params.studentData);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics tracking
  useScreenTracking('StudentDetailsScreen', { 
    academiaId: userProfile?.academiaId,
    studentId,
    userType: userProfile?.userType 
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  useEffect(() => {
    if (studentId) {
      loadStudentDetails();
    }
  }, [studentId]);

  const loadStudentDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error('Academia ID não encontrado');
        return;
      }

      // Usar cache inteligente para dados do estudante
      const cacheKey = CACHE_KEYS.STUDENT_DETAILS(academiaId, studentId);
      
      const studentDetails = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando detalhes do estudante (cache miss):', studentId);
          
          let studentData = studentInfo;
          if (!studentData) {
            studentData = await academyFirestoreService.getById('users', studentId);
          }
          
          // Usar batch processing para carregar dados relacionados
          const [allClasses, allPayments] = await Promise.all([
            academyFirestoreService.getAll('classes', academiaId),
            academyFirestoreService.getAll('payments', academiaId)
          ]);
          
          // Filtrar turmas do aluno
          const userClasses = allClasses.filter(cls => 
            studentData?.classIds && studentData.classIds.includes(cls.id)
          );
          
          // Filtrar pagamentos do aluno
          const userPayments = allPayments
            .filter(payment => payment.userId === studentId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          return {
            studentInfo: studentData,
            classes: userClasses,
            payments: userPayments
          };
        },
        CACHE_TTL.MEDIUM // Cache por 5 minutos
      );

      setStudentInfo(studentDetails.studentInfo);
      setStudentClasses(studentDetails.classes);
      setPayments(studentDetails.payments);
      
      console.log('✅ Detalhes do estudante carregados com sucesso');
      
      // Track analytics
      trackFeatureUsage('student_details_loaded', {
        studentId,
        academiaId,
        classesCount: studentDetails.classes.length,
        paymentsCount: studentDetails.payments.length
      });
      
    } catch (error) {
      console.error('Erro ao carregar detalhes do aluno:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId, userProfile?.academiaId, academia?.id, studentInfo, trackFeatureUsage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache para forçar refresh
    const academiaId = userProfile?.academiaId || academia?.id;
    if (academiaId) {
      cacheService.invalidatePattern(`student_details:${academiaId}:${studentId}`);
    }
    loadStudentDetails();
  }, [loadStudentDetails, userProfile?.academiaId, academia?.id, studentId]);

  // Memoized utility functions
  const getPaymentStatusColor = useCallback((status) => {
    const colors = {
      'paid': '#4CAF50',
      'pending': '#FF9800',
      'overdue': '#F44336'
    };
    return colors[status] || '#666';
  }, []);

  const getPaymentStatusText = useCallback((status) => {
    const texts = {
      'paid': 'Pago',
      'pending': 'Pendente',
      'overdue': 'Atrasado'
    };
    return texts[status] || status;
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return 'Data não disponível';
    const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
  }, []);

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }, []);

  // Memoized navigation handlers
  const handleEditStudent = useCallback(() => {
    trackButtonClick('edit_student', { studentId });
    navigation.navigate('EditStudent', { 
      studentId, 
      studentData: studentInfo 
    });
  }, [navigation, studentId, studentInfo, trackButtonClick]);

  const handleAddGraduation = useCallback(() => {
    trackButtonClick('add_graduation', { studentId });
    navigation.navigate('AddGraduation', { 
      studentId, 
      studentName: studentInfo?.name 
    });
  }, [navigation, studentId, studentInfo?.name, trackButtonClick]);

  const handleViewClassDetails = useCallback((classItem) => {
    trackButtonClick('view_class_details', { classId: classItem.id, studentId });
    navigation.navigate('ClassDetails', { 
      classId: classItem.id, 
      classData: classItem 
    });
  }, [navigation, studentId, trackButtonClick]);

  const handleViewAllPayments = useCallback(() => {
    trackButtonClick('view_all_payments', { studentId });
    navigation.navigate('StudentPayments', { studentId });
  }, [navigation, studentId, trackButtonClick]);

  if (loading && !studentInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <StudentDetailsSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro no StudentDetailsScreen:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'StudentDetailsScreen', academiaId: userProfile?.academiaId, studentId }}
    >
      <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Informações do Aluno */}
        <Card style={styles.card}>
          <View style={styles.studentHeader}>
            <Avatar.Text 
              size={80} 
              label={studentInfo?.name?.charAt(0) || 'A'}
              style={styles.avatar}
            />
            <View style={styles.studentInfo}>
              <Text variant="headlineSmall" style={styles.studentName}>{studentInfo?.name || 'Aluno'}</Text>
              <Text style={styles.studentEmail}>{studentInfo?.email}</Text>
              <Text style={[
                styles.statusBadge,
                { color: studentInfo?.isActive ? '#4CAF50' : '#F44336' }
              ]}>
                {studentInfo?.isActive ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color="#666" />
              <Text style={styles.infoText}>
                {studentInfo?.phone || 'Telefone não informado'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.infoText}>
                {studentInfo?.address || 'Endereço não informado'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.infoText}>
                Cadastrado em: {formatDate(studentInfo?.createdAt)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Turmas Matriculadas */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="school" size={24} color="#2196F3" />
            <Text variant="titleMedium" style={styles.cardTitle}>Turmas Matriculadas</Text>
          </View>
          
          {studentClasses.length > 0 ? (
            studentClasses.map((classItem, index) => (
              <Card.Content key={classItem.id || index}>
                <View style={styles.listItemContent}>
                  <View style={styles.listItemLeft}>
                    <Ionicons name="fitness" size={20} color="#666" style={styles.listIcon} />
                    <View>
                      <Text style={styles.listTitle}>{classItem.name}</Text>
                      <Text style={styles.listSubtitle}>{classItem.modality}</Text>
                    </View>
                  </View>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleViewClassDetails(classItem)}
                  >
                    Detalhes
                  </Button>
                </View>
              </Card.Content>
            ))
          ) : (
            <Text style={styles.noDataText}>
              Nenhuma turma matriculada
            </Text>
          )}
        </Card>

        {/* Histórico de Pagamentos */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={24} color="#4CAF50" />
            <Text variant="titleMedium" style={styles.cardTitle}>Histórico de Pagamentos</Text>
          </View>
          
          {payments.length > 0 ? (
            payments.slice(0, 5).map((payment, index) => (
              <Card.Content key={payment.id || index}>
                <View style={styles.listItemContent}>
                  <View style={styles.listItemLeft}>
                    <Ionicons name="receipt" size={20} color="#666" style={styles.listIcon} />
                    <View>
                      <Text style={styles.listTitle}>
                        {formatCurrency(payment.amount)}
                      </Text>
                      <Text style={styles.listSubtitle}>
                        {formatDate(payment.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text style={{
                    color: getPaymentStatusColor(payment.status),
                    fontWeight: 'bold'
                  }}>
                    {getPaymentStatusText(payment.status)}
                  </Text>
                </View>
              </Card.Content>
            ))
          ) : (
            <Text style={styles.noDataText}>
              Nenhum pagamento registrado
            </Text>
          )}
          
          {payments.length > 5 && (
            <Button
              mode="outlined"
              onPress={handleViewAllPayments}
              style={styles.viewAllButton}
            >
              Ver Todos os Pagamentos
            </Button>
          )}
        </Card>

        {/* Ações */}
        <Card style={styles.card}>
          <Text variant="titleMedium" style={styles.cardTitle}>Ações</Text>
          
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={handleEditStudent}
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              icon="pencil"
            >
              Editar Aluno
            </Button>
            
            <Button
              mode="contained"
              onPress={handleAddGraduation}
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              icon="trophy"
            >
              {getString('addGraduation')}
            </Button>
          </View>
        </Card>
      </ScrollView>
      </SafeAreaView>
    </EnhancedErrorBoundary>
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
  },
  card: {
    margin: 16,
    marginTop: 8,
    ...Platform.select({

      ios: {},

      android: {

        elevation: 4,

      },

      web: {

        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',

      },

    }),
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#2196F3',
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
  },
  studentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  listItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listIcon: {
    marginRight: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  listSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  viewAllButton: {
    marginTop: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    width: '48%',
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});

export default StudentDetailsScreen;
