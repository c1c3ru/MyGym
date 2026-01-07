import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, Alert } from 'react-native';
import usePullToRefresh from '@hooks/usePullToRefresh';
import {
  FAB,
  Searchbar,
  Menu,
  Button,
  Text
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import firestoreService from '@infrastructure/services/firestoreService';
import StudentDisassociationDialog from '@components/StudentDisassociationDialog';
import EnhancedFlashList from '@components/EnhancedFlashList';
import StudentListItem from '@components/memoized/StudentListItem';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import batchFirestoreService from '@infrastructure/services/batchFirestoreService';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@infrastructure/services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import StudentListSkeleton from '@components/skeletons/StudentListSkeleton';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { getString } from "@utils/theme";

const AdminStudents = ({ navigation }) => {
  const { currentTheme } = useThemeToggle();

  const { user, userProfile, academia } = useAuthFacade();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDisassociationDialog, setShowDisassociationDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Analytics tracking
  useScreenTracking('AdminStudents', {
    academiaId: userProfile?.academiaId,
    userType: userProfile?.userType
  });
  const { trackButtonClick, trackSearch, trackFeatureUsage } = useUserActionTracking();

  // Define loadStudents before using it in usePullToRefresh
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);

      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      console.log('🏫 Academia ID:', academiaId);
      if (!academiaId) {
        console.error('❌ Academia ID não encontrado');
        setStudents([]);
        return;
      }

      // Usar cache inteligente para carregar alunos
      const cacheKey = CACHE_KEYS.STUDENTS(academiaId);

      const enrichedStudents = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando alunos na academia (cache miss):', academiaId);

          // Buscar alunos da academia usando subcoleção
          const studentsData = await academyFirestoreService.getAll('students', academiaId);
          console.log('👥 Alunos encontrados:', studentsData.length);

          // Se não há alunos, retornar array vazio
          if (!studentsData || studentsData.length === 0) {
            return [];
          }

          // Processar alunos de forma mais simples e rápida
          const enrichedData = await Promise.all(
            studentsData.map(async (student) => {
              try {
                // Validar se student.id existe
                if (!student?.id) {
                  return {
                    ...student,
                    paymentStatus: 'unknown',
                    totalPayments: 0,
                    modalities: []
                  };
                }

                // Usar Promise.race para adicionar timeout
                const enrichmentPromise = (async () => {
                  try {
                    // Buscar pagamentos do aluno (limitado aos últimos 10)
                    const payments = await academyFirestoreService.getWhere(
                      'payments',
                      'studentId',
                      '==',
                      student.id,
                      academiaId
                    );

                    const latestPayment = payments?.[0];

                    return {
                      ...student,
                      paymentStatus: latestPayment?.status || 'unknown',
                      lastPaymentDate: latestPayment?.createdAt,
                      totalPayments: payments?.length || 0,
                      modalities: student.modalities || []
                    };
                  } catch (error) {
                    console.warn(`⚠️ Erro ao enriquecer aluno ${student.id}:`, error.message);
                    return {
                      ...student,
                      paymentStatus: 'unknown',
                      totalPayments: 0,
                      modalities: student.modalities || []
                    };
                  }
                })();

                // Timeout de 5 segundos por aluno
                const timeoutPromise = new Promise((resolve) =>
                  setTimeout(() => resolve({
                    ...student,
                    paymentStatus: 'unknown',
                    totalPayments: 0,
                    modalities: student.modalities || []
                  }), 5000)
                );

                return await Promise.race([enrichmentPromise, timeoutPromise]);

              } catch (error) {
                console.error('❌ Erro ao processar aluno:', error);
                return {
                  ...student,
                  paymentStatus: 'unknown',
                  totalPayments: 0,
                  modalities: []
                };
              }
            })
          );

          return enrichedData;
        },
        CACHE_TTL.MEDIUM // Cache por 5 minutos
      );

      setStudents(enrichedStudents || []);
      console.log('✅ Alunos carregados com sucesso:', enrichedStudents?.length);

      // Track analytics
      trackFeatureUsage('students_list_loaded', {
        studentsCount: enrichedStudents?.length || 0,
        academiaId
      });

    } catch (error) {
      console.error('❌ Erro ao carregar alunos:', error);
      setStudents([]);
      Alert.alert('Erro', 'Não foi possível carregar a lista de alunos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.academiaId, academia?.id, trackFeatureUsage]);

  const { refreshing, onRefresh } = usePullToRefresh(loadStudents);

  // Memoized render function for FlashList
  const renderStudentItem = useCallback(({ item: student, index }) => (
    <StudentListItem
      key={student.id || index}
      student={student}
      index={index}
      onPress={handleStudentPress}
      onView={handleViewStudent}
      onEdit={handleEditStudent}
      onDelete={handleDeleteStudent}
    />
  ), []);

  // Key extractor for FlashList
  const keyExtractor = useCallback((item, index) => item.id || `student-${index}`, []);

  // Empty list component
  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="currentTheme.gray[300]" />
      <Text style={styles.emptyText}>{getString('noStudentsFound')}</Text>
      <Text style={styles.emptySubtext}>
        {searchQuery ? 'Tente ajustar os filtros de busca' : 'Adicione o primeiro aluno da academia'}
      </Text>
    </View>
  ), [searchQuery]);

  // Auto-refresh quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      loadStudents();
    }, [loadStudents])
  );

  // Memoized filter function
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.currentGraduation?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Track search analytics
      trackSearch(searchQuery, filtered.length, {
        context: 'students',
        academiaId: userProfile?.academiaId
      });
    }

    // Filtro por status
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(s => s.isActive !== false);
        break;
      case 'inactive':
        filtered = filtered.filter(s => s.isActive === false);
        break;
      case 'payment_ok':
        filtered = filtered.filter(s => s.paymentStatus === 'paid');
        break;
      case 'payment_pending':
        filtered = filtered.filter(s => s.paymentStatus === 'pending');
        break;
      case 'payment_overdue':
        filtered = filtered.filter(s => s.paymentStatus === 'overdue');
        break;
      default:
        break;
    }

    return filtered;
  }, [students, searchQuery, selectedFilter, trackSearch, userProfile?.academiaId]);

  // onRefresh is now provided by usePullToRefresh hook

  const handleStudentPress = (student) => {
    trackButtonClick('student_details', { studentId: student.id });
    navigation.navigate('StudentDetails', { studentId: student.id, studentData: student });
  };

  const handleViewStudent = (student) => {
    trackButtonClick('view_student', { studentId: student.id });
    navigation.navigate('StudentDetails', { studentId: student.id, studentData: student });
  };

  const handleAddStudent = () => {
    trackButtonClick('add_student');
    navigation.navigate('AddStudent', {
      onStudentAdded: (newStudent) => {
        console.log('🔄 Novo aluno adicionado, atualizando lista:', newStudent.name);

        // Invalidar cache de alunos
        const academiaId = userProfile?.academiaId || academia?.id;
        if (academiaId) {
          cacheService.invalidatePattern(`students:${academiaId})`);
        }

        // Adicionar o novo aluno à lista imediatamente
        setStudents(prevStudents => [newStudent, ...prevStudents]);

        // Também recarregar para garantir dados atualizados
        setTimeout(() => {
          loadStudents();
        }, 1000);
      }
    });
  };

  const handleEditStudent = (student) => {
    trackButtonClick('edit_student', { studentId: student.id });
    navigation.navigate('EditStudent', { studentId: student.id, studentData: student });
  };

  const handleDisassociateStudent = (student) => {
    setSelectedStudent(student);
    setShowDisassociationDialog(true);
  };

  const handleDeleteStudent = (student) => {
    Alert.alert(
      getString('confirmDelete'),
      `Tem certeza que deseja excluir o aluno ${student.name}?`,
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await firestoreService.delete('users', student.id);
              loadStudents();
              Alert.alert(getString('success'), 'Aluno excluído com sucesso');
            } catch (error) {
              Alert.alert(getString('error'), 'Não foi possível excluir o aluno');
            }
          }
        }
      ]
    );
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return COLORS.primary[500];
      case 'pending': return COLORS.warning[500];
      case 'overdue': return COLORS.error[500];
      default: return COLORS.gray[500];
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid': return getString('paymentUpToDate');
      case 'pending': return getString('paymentPending');
      case 'overdue': return getString('overdue');
      default: return getString('notAvailable');
    }
  };

  const getFilterText = (filter) => {
    const filters = {
      'all': getString('all'),
      'active': getString('active'),
      'inactive': getString('inactive'),
      'payment_ok': getString('paymentOK'),
      'payment_pending': getString('paymentPending'),
      'payment_overdue': getString('paymentOverdue')
    };
    return filters[filter] || getString('all');
  };

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro na tela AdminStudents:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'AdminStudents', academiaId: userProfile?.academiaId }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Searchbar
            placeholder="Buscar alunos..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />

          <View style={styles.filterRow}>
            <Menu
              visible={filterVisible}
              onDismiss={() => setFilterVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setFilterVisible(true)}
                  icon="filter"
                  style={styles.filterButton}
                >
                  {getFilterText(selectedFilter)}
                </Button>
              }
            >
              <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title="all" />
              <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title="active" />
              <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title="inactive" />
              <Menu.Item onPress={() => { setSelectedFilter('payment_ok'); setFilterVisible(false); }} title="paymentOK" />
              <Menu.Item onPress={() => { setSelectedFilter('payment_pending'); setFilterVisible(false); }} title="paymentPending" />
              <Menu.Item onPress={() => { setSelectedFilter('payment_overdue'); setFilterVisible(false); }} title="paymentOverdue" />
            </Menu>
          </View>
        </View>

        {loading ? (
          <StudentListSkeleton count={5} />
        ) : (
          <EnhancedFlashList
            data={filteredStudents}
            renderItem={renderStudentItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={200}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={renderEmptyList}
            emptyMessage="noStudentsFound"
            loadingMore={false}
            contentContainerStyle={styles.listContainer}
            accessible={true}
            accessibilityLabel={`Lista de ${filteredStudents.length} alunos`}
          />
        )}

        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('AddStudent')}
        />

        <StudentDisassociationDialog
          visible={showDisassociationDialog}
          student={selectedStudent}
          onDismiss={() => {
            setShowDisassociationDialog(false);
            setSelectedStudent(null);
          }}
          onConfirm={() => {
            setShowDisassociationDialog(false);
            setSelectedStudent(null);
            loadStudents();
          }}
        />
      </SafeAreaView>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.background.paper,
    paddingHorizontal: '4%',
    paddingVertical: SPACING.md,
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    width: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  filterButton: {
    borderColor: COLORS.warning[500],
  },
  studentCard: {
    marginVertical: SPACING.sm,
    elevation: 2,
    width: '100%',
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    width: '100%',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: COLORS.primary[500],
  },
  studentDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.md,
    marginBottom: 2,
    color: COLORS.card.premium.text,
  },
  studentEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.neutral.light,
    marginBottom: 2,
  },
  studentPhone: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.neutral.light,
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.md,
    width: '100%',
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
  },
  statusChip: {
    minHeight: 24,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary[500],
  },
  listContainer: {
    paddingHorizontal: '4%',
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default AdminStudents;
