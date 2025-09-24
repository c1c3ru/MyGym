import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, Alert } from 'react-native';
import usePullToRefresh from '../../hooks/usePullToRefresh';
import { 
  FAB,
  Searchbar,
  Menu,
  Button,
  Text
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthFacade } from '../../auth/AuthFacade';
import { academyFirestoreService } from '../../../infrastructure/services/academyFirestoreService';
import firestoreService from '../../../infrastructure/services/firestoreService';
import StudentDisassociationDialog from '../../components/StudentDisassociationDialog';
import EnhancedFlashList from '../../components/EnhancedFlashList';
import StudentListItem from '../../components/memoized/StudentListItem';
import EnhancedErrorBoundary from '../../components/EnhancedErrorBoundary';
import batchFirestoreService from '../../../infrastructure/services/batchFirestoreService';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '../../../infrastructure/services/cacheService';
import { useScreenTracking, useUserActionTracking } from '../../hooks/useAnalytics';
import StudentListSkeleton from '../../components/skeletons/StudentListSkeleton';
import { useFocusEffect } from '@react-navigation/native';

const AdminStudents = ({ navigation }) => {
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

          // Usar batch processing para enriquecer dados dos alunos
          const enrichedData = await batchFirestoreService.batchProcessQuery(
            'students',
            async (studentsBatch) => {
              return Promise.all(
                studentsBatch.map(async (student) => {
                  try {
                    // Validar se student.id existe antes de fazer a query
                    if (!student?.id) {
                      return {
                        ...student,
                        paymentStatus: 'unknown',
                        totalPayments: 0
                      };
                    }

                    // Buscar pagamentos do aluno
                    const payments = await academyFirestoreService.getWhere('payments', 'studentId', '==', student.id, academiaId);
                    
                    const latestPayment = payments[0];
                    return {
                      ...student,
                      paymentStatus: latestPayment?.status || 'unknown',
                      lastPaymentDate: latestPayment?.createdAt,
                      totalPayments: payments.length
                    };
                  } catch (error) {
                    return {
                      ...student,
                      paymentStatus: 'unknown',
                      totalPayments: 0
                    };
                  }
                })
              );
            },
            { batchSize: 50 },
            academiaId
          );

          return enrichedData.flat();
        },
        CACHE_TTL.MEDIUM // Cache por 5 minutos
      );

      setStudents(enrichedStudents || []);
      console.log('✅ Alunos carregados com sucesso');
      
      // Track analytics
      trackFeatureUsage('students_list_loaded', {
        studentsCount: enrichedStudents?.length || 0,
        academiaId
      });

    } catch (error) {
      console.error('❌ Erro ao carregar alunos:', error);
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
      <Ionicons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Nenhum aluno encontrado</Text>
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
          cacheService.invalidatePattern(`students:${academiaId}`);
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
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o aluno ${student.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await firestoreService.delete('users', student.id);
              loadStudents();
              Alert.alert('Sucesso', 'Aluno excluído com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o aluno');
            }
          }
        }
      ]
    );
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Em dia';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Atrasado';
      default: return 'N/A';
    }
  };

  const getFilterText = (filter) => {
    const filters = {
      'all': 'Todos',
      'active': 'Ativos',
      'inactive': 'Inativos',
      'payment_ok': 'Pagamento OK',
      'payment_pending': 'Pagamento Pendente',
      'payment_overdue': 'Pagamento Atrasado'
    };
    return filters[filter] || 'Todos';
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
              <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title="Todos" />
              <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title="Ativos" />
              <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title="Inativos" />
              <Menu.Item onPress={() => { setSelectedFilter('payment_ok'); setFilterVisible(false); }} title="Pagamento OK" />
              <Menu.Item onPress={() => { setSelectedFilter('payment_pending'); setFilterVisible(false); }} title="Pagamento Pendente" />
              <Menu.Item onPress={() => { setSelectedFilter('payment_overdue'); setFilterVisible(false); }} title="Pagamento Atrasado" />
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
            emptyMessage="Nenhum aluno encontrado"
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    borderColor: '#FF9800',
  },
  studentCard: {
    marginVertical: 8,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#FF9800',
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  studentPhone: {
    fontSize: 12,
    color: '#999',
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusChip: {
    height: 24,
  },
  divider: {
    marginVertical: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF9800',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AdminStudents;
