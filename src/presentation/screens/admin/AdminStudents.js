import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, Alert, Platform } from 'react-native';
import usePullToRefresh from '@hooks/usePullToRefresh';
import {
  FAB,
  Searchbar,
  Menu,
  Button,
  Text
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, GLASS } from '@presentation/theme/designTokens';
import { useTheme } from '@contexts/ThemeContext';
import { getAuthGradient } from '@presentation/theme/authTheme';

const AdminStudents = ({ navigation }) => {
  const { getString, isDarkMode, theme } = useTheme();

  // Dynamic Styles
  const backgroundGradient = isDarkMode
    ? [COLORS.gray[800], COLORS.gray[900], COLORS.black]
    : [COLORS.gray[100], COLORS.gray[50], COLORS.white];

  const textColor = theme.colors.text;
  const secondaryTextColor = theme.colors.textSecondary;
  const glassStyle = isDarkMode ? GLASS.premium : GLASS.light;

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
    console.log('📥 loadStudents chamado - iniciando carregamento');
    try {
      setLoading(true);
      console.log('⏳ Loading definido como true');

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
          console.log('🔍 Buscando dados da academia (cache miss):', academiaId);

          // 1. Buscar todos os alunos, turmas e pagamentos em paralelo
          const [studentsData, allClasses, allPayments] = await Promise.all([
            academyFirestoreService.getAll('students', academiaId),
            academyFirestoreService.getAll('classes', academiaId),
            academyFirestoreService.getAll('payments', academiaId)
          ]);

          console.log(`👥 Dados carregados: ${studentsData.length} alunos, ${allClasses.length} turmas, ${allPayments.length} pagamentos`);

          if (!studentsData || studentsData.length === 0) {
            return [];
          }

          // 2. Criar mapas para busca rápida em memória
          const paymentsByStudent = allPayments.reduce((acc, p) => {
            if (!acc[p.studentId]) acc[p.studentId] = [];
            acc[p.studentId].push(p);
            return acc;
          }, {});

          const classesMap = allClasses.reduce((acc, c) => {
            acc[c.id] = c;
            return acc;
          }, {});

          // 3. Enriquecer dados dos alunos em memória (sem novas requisições)
          const enrichedData = studentsData.map(student => {
            // Obter pagamentos do aluno
            const studentPayments = paymentsByStudent[student.id] || [];
            const latestPayment = studentPayments[0]; // Já vem ordenado por createdAt desc do getAll

            // Obter modalidades das turmas do aluno
            const studentModalities = (student.classIds || [])
              .map(classId => classesMap[classId]?.modality)
              .filter(Boolean);

            const uniqueModalities = [...new Set(studentModalities)];

            return {
              ...student,
              paymentStatus: latestPayment?.status || 'unknown',
              lastPaymentDate: latestPayment?.createdAt,
              totalPayments: studentPayments.length,
              modalities: uniqueModalities
            };
          });

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
      console.log('✅ Finalizando loadStudents - definindo loading como false');
      setLoading(false);
    }
  }, [userProfile?.academiaId, academia?.id, trackFeatureUsage]);

  const { refreshing, onRefresh } = usePullToRefresh(loadStudents);

  // Handler functions - defined before renderStudentItem to avoid initialization errors
  const handleStudentPress = useCallback((student) => {
    trackButtonClick('student_details', { studentId: student.id });
    navigation.navigate('StudentDetails', { studentId: student.id, studentData: student });
  }, [trackButtonClick, navigation]);

  const handleViewStudent = useCallback((student) => {
    trackButtonClick('view_student', { studentId: student.id });
    navigation.navigate('StudentDetails', { studentId: student.id, studentData: student });
  }, [trackButtonClick, navigation]);

  const handleEditStudent = useCallback((student) => {
    trackButtonClick('edit_student', { studentId: student.id });
    navigation.navigate('EditStudent', { studentId: student.id, studentData: student });
  }, [trackButtonClick, navigation]);

  const handleDeleteStudent = useCallback((student) => {
    Alert.alert(
      getString('confirmDelete'),
      getString('confirmDeleteStudent').replace('{name}', student.name),
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const academiaId = userProfile?.academiaId || academia?.id;
              if (academiaId) {
                await academyFirestoreService.delete('students', student.id, academiaId);
                loadStudents();
                Alert.alert(getString('success'), getString('studentDeletedSuccess'));
              } else {
                Alert.alert(getString('error'), getString('error'));
              }
            } catch (error) {
              Alert.alert(getString('error'), getString('studentDeleteError'));
            }
          }
        }
      ]
    );
  }, [loadStudents, getString]);

  const handleDisassociateStudent = useCallback((student) => {
    setSelectedStudent(student);
    setShowDisassociationDialog(true);
  }, []);

  const handleAddStudent = useCallback(() => {
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
  }, [trackButtonClick, navigation, userProfile?.academiaId, academia?.id, loadStudents]);

  // Memoized render function for FlashList
  const renderStudentItem = useCallback(({ item: student, index }) => {
    console.log('🎨 renderStudentItem chamado para:', student.name, 'index:', index);
    return (
      <StudentListItem
        key={student.id || index}
        student={student}
        index={index}
        onPress={handleStudentPress}
        onView={handleViewStudent}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudent}
      />
    );
  }, [handleStudentPress, handleViewStudent, handleEditStudent, handleDeleteStudent]);

  // Key extractor for FlashList
  const keyExtractor = useCallback((item, index) => item.id || `student-${index}`, []);

  // Empty list component
  const renderEmptyList = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={secondaryTextColor} />
      <Text style={[styles.emptyText, { color: textColor }]}>{getString('noStudentsFound')}</Text>
      <Text style={[styles.emptySubtext, { color: secondaryTextColor }]}>
        {searchQuery ? getString('adjustSearchFilters') : getString('addFirstStudent')}
      </Text>
    </View>
  ), [searchQuery, getString, textColor, secondaryTextColor]);

  // Carregar dados quando o componente montar
  useEffect(() => {
    console.log('🚀 AdminStudents useEffect executado - chamando loadStudents');
    loadStudents();
  }, []); // Array vazio = executa apenas uma vez no mount

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
      <LinearGradient
        colors={backgroundGradient}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Searchbar
              placeholder={getString('searchStudents')}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={[styles.searchbar, {
                backgroundColor: glassStyle.backgroundColor,
                borderColor: glassStyle.borderColor
              }]}
              inputStyle={{ color: textColor }}
              iconColor={secondaryTextColor}
              placeholderTextColor={isDarkMode ? COLORS.gray[500] : COLORS.gray[400]}
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
                    style={[styles.filterButton, {
                      backgroundColor: glassStyle.backgroundColor,
                      borderColor: glassStyle.borderColor
                    }]}
                    textColor={isDarkMode ? COLORS.primary[400] : COLORS.primary[600]}
                  >
                    {getFilterText(selectedFilter)}
                  </Button>
                }
              >
                <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title={getString('all')} />
                <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title={getString('active')} />
                <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title={getString('inactive')} />
                <Menu.Item onPress={() => { setSelectedFilter('payment_ok'); setFilterVisible(false); }} title={getString('paymentOK')} />
                <Menu.Item onPress={() => { setSelectedFilter('payment_pending'); setFilterVisible(false); }} title={getString('paymentPending')} />
                <Menu.Item onPress={() => { setSelectedFilter('payment_overdue'); setFilterVisible(false); }} title={getString('paymentOverdue')} />
              </Menu>
            </View>
          </View>


          <View style={{ flex: 1, minHeight: 400 }}>
            {(() => {
              console.log('🔍 AdminStudents render state:', {
                loading,
                studentsCount: students.length,
                filteredCount: filteredStudents.length
              });

              if (loading) {
                return <StudentListSkeleton count={5} />;
              }

              return (
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
              );
            })()}
          </View>

          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() => navigation.navigate('AddStudent')}
            color={COLORS.white}
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
      </LinearGradient>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: '4%',
    paddingVertical: SPACING.md,
    backgroundColor: 'transparent',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: GLASS.premium.backgroundColor,
    marginBottom: SPACING.sm,
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: GLASS.premium.borderColor,
    ...Platform.select({
      web: {
        backdropFilter: GLASS.premium.backdropFilter,
      }
    })
  },
  searchInput: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  filterButton: {
    borderColor: COLORS.primary[500],
    backgroundColor: GLASS.premium.backgroundColor,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary[500],
    borderRadius: BORDER_RADIUS.full,
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
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontWeight: FONT_WEIGHT.bold,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.tertiary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});

export default AdminStudents;
