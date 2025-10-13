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
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { getString } from '@shared/utils/theme';

const StudentDetailsScreen = ({ route, navigation }) => {
  const { currentTheme } = useThemeToggle();
  
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
        console.error(getString('academyIdNotFound'));
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
      'paid': COLORS.primary[500],
      'pending': COLORS.warning[500],
      'overdue': COLORS.error[500]
    };
    return colors[status] || COLORS.text.secondary;
  }, []);

  const getPaymentStatusText = useCallback((status) => {
    const texts = {
      'paid': getString('paid'),
      'pending': getString('paymentPending'),
      'overdue': getString('overdue')
    };
    return texts[status] || status;
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return getString('dataNotAvailable');
    const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
  }, []);

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: getString('currency')
    }).format(value || 0);
  }, []);

  // Memoized navigation handlers
  const handleEditStudent = useCallback(() => {
    trackButtonClick('edit_student', { studentId });
    navigation.navigate(getString('editStudent'), { 
      studentId, 
      studentData: studentInfo 
    });
  }, [navigation, studentId, studentInfo, trackButtonClick]);

  const handleAddGraduation = useCallback(() => {
    trackButtonClick('add_graduation', { studentId });
    navigation.navigate(getString('addGraduationScreen'), { 
      studentId, 
      studentName: studentInfo?.name 
    });
  }, [navigation, studentId, studentInfo?.name, trackButtonClick]);

  const handleViewClassDetails = useCallback((classItem) => {
    trackButtonClick('view_class_details', { classId: classItem.id, studentId });
    navigation.navigate(getString('classDetailsScreen'), { 
      classId: classItem.id, 
      classData: classItem 
    });
  }, [navigation, studentId, trackButtonClick]);

  const handleViewAllPayments = useCallback(() => {
    trackButtonClick('view_all_payments', { studentId });
    navigation.navigate(getString('studentPayments'), { studentId });
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
              <Text variant="headlineSmall" style={styles.studentName}>{studentInfo?.name || getString('student')}</Text>
              <Text style={styles.studentEmail}>{studentInfo?.email}</Text>
              <Text style={[
                styles.statusBadge,
                { color: studentInfo?.isActive ? COLORS.primary[500] : COLORS.error[500] }
              ]}>
                {studentInfo?.isActive ? 'active' : getString('inactive')}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={COLORS.text.secondary} />
              <Text style={styles.infoText}>
                {studentInfo?.phone || getString('phoneNotInformed')}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={COLORS.text.secondary} />
              <Text style={styles.infoText}>
                {studentInfo?.address || 'Endereço não informado'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={COLORS.text.secondary} />
              <Text style={styles.infoText}>
                Cadastrado em: {formatDate(studentInfo?.createdAt)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Turmas Matriculadas */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="school" size={24} color={COLORS.info[500]} />
            <Text variant="titleMedium" style={styles.cardTitle}>Turmas Matriculadas</Text>
          </View>
          
          {studentClasses.length > 0 ? (
            studentClasses.map((classItem, index) => (
              <Card.Content key={classItem.id || index}>
                <View style={styles.listItemContent}>
                  <View style={styles.listItemLeft}>
                    <Ionicons name="fitness" size={20} color={COLORS.text.secondary} style={styles.listIcon} />
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
            <Ionicons name="card" size={24} color={COLORS.primary[500]} />
            <Text variant="titleMedium" style={styles.cardTitle}>Histórico de Pagamentos</Text>
          </View>
          
          {payments.length > 0 ? (
            payments.slice(0, 5).map((payment, index) => (
              <Card.Content key={payment.id || index}>
                <View style={styles.listItemContent}>
                  <View style={styles.listItemLeft}>
                    <Ionicons name="receipt" size={20} color={COLORS.text.secondary} style={styles.listIcon} />
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
                    fontWeight: FONT_WEIGHT.bold
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
              style={[styles.actionButton, { backgroundColor: COLORS.info[500] }]}
              icon="pencil"
            >
              Editar Aluno
            </Button>
            
            <Button
              mode="contained"
              onPress={handleAddGraduation}
              style={[styles.actionButton, { backgroundColor: COLORS.primary[500] }]}
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
    backgroundColor: COLORS.gray[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: SPACING.base,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px currentTheme.black + "1A"',
      },
    }),
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: COLORS.info[500],
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.semibold,
  },
  studentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  studentEmail: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  statusBadge: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    marginTop: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  infoText: {
    marginLeft: 12,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: FONT_SIZE.lg,
  },
  noDataText: {
    textAlign: 'center',
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    padding: SPACING.lg,
  },
  listItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[300],
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
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  listSubtitle: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
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
    borderRadius: BORDER_RADIUS.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});

export default StudentDetailsScreen;
