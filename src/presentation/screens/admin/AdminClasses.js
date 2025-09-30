import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, RefreshControl, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  FAB,
  Searchbar,
  Menu,
  Modal,
  Portal,
  Text
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService, academyClassService, academyStudentService } from '@services/academyFirestoreService';
import EnhancedFlashList from '@components/EnhancedFlashList';
import ClassListItem from '@components/memoized/ClassListItem';
import ClassListSkeleton from '@components/skeletons/ClassListSkeleton';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@services/cacheService';
import batchFirestoreService from '@services/batchFirestoreService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import { useClassCreationRateLimit } from '@hooks/useRateLimit';
import FreeGymScheduler from '@components/FreeGymScheduler';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const AdminClasses = ({ navigation }) => {
  const { user, userProfile, academia } = useAuth();
  const { getString } = useTheme();
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Analytics tracking
  useScreenTracking('AdminClasses', { 
    academiaId: userProfile?.academiaId,
    userType: userProfile?.userType 
  });
  const { trackButtonClick, trackSearch, trackFeatureUsage } = useUserActionTracking();
  const { executeWithLimit: executeClassAction } = useClassCreationRateLimit();

  useEffect(() => {
    loadClasses();
  }, []);

  // Recarregar sempre que a tela ganhar foco (ex.: após excluir turma e voltar)
  useFocusEffect(
    React.useCallback(() => {
      loadClasses();
    }, [])
  );

  // Memoized filter function
  const filteredClasses = useMemo(() => {
    let filtered = classes;

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(classItem =>
        classItem.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.modality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classItem.instructorName?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Track search analytics
      trackSearch(searchQuery, filtered.length, {
        context: 'classes',
        academiaId: userProfile?.academiaId
      });
    }

    // Filtro por status
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(c => c.isActive !== false);
        break;
      case 'inactive':
        filtered = filtered.filter(c => c.isActive === false);
        break;
      case 'full':
        filtered = filtered.filter(c => c.currentStudents >= (c.maxCapacity || 999));
        break;
      case 'empty':
        filtered = filtered.filter(c => c.currentStudents === 0);
        break;
      case 'no_instructor':
        filtered = filtered.filter(c => !c.instructorId);
        break;
      default:
        break;
    }

    return filtered;
  }, [classes, searchQuery, selectedFilter, trackSearch, userProfile?.academiaId]);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error('Academia ID não encontrado');
        return;
      }

      // Usar cache inteligente para carregar turmas
      const cacheKey = CACHE_KEYS.CLASSES(academiaId);
      
      const classesWithDetails = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando turmas na academia (cache miss):', academiaId);
          
          // Buscar turmas da academia usando subcoleção
          const allClasses = await academyFirestoreService.getAll('classes', academiaId);
          
          // Usar batch processing para enriquecer dados das turmas
          const enrichedClasses = await batchFirestoreService.batchProcessQuery(
            'classes',
            async (classesBatch) => {
              return Promise.all(
                classesBatch.map(async (classItem) => {
                  try {
                    // Buscar alunos da turma
                    const students = await academyStudentService.getStudentsByClass(classItem.id, academiaId);
                    
                    // Buscar dados do instrutor na subcoleção de instrutores
                    const instructor = classItem.instructorId ? 
                      await academyFirestoreService.getById('instructors', classItem.instructorId, academiaId) : null;
                    
                    return {
                      ...classItem,
                      currentStudents: students.length,
                      students: students,
                      instructorName: instructor?.name || getString('notAssigned')
                    };
                  } catch (error) {
                    return {
                      ...classItem,
                      currentStudents: 0,
                      students: [],
                      instructorName: getString('notAssigned')
                    };
                  }
                })
              );
            },
            { batchSize: 30 },
            academiaId
          );

          return enrichedClasses.flat();
        },
        CACHE_TTL.MEDIUM // Cache por 5 minutos
      );
      
      setClasses(classesWithDetails || []);
      console.log('✅ Turmas carregadas com sucesso');
      
      // Track analytics
      trackFeatureUsage('classes_list_loaded', {
        classesCount: classesWithDetails?.length || 0,
        academiaId
      });

    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      Alert.alert(getString('error'), getString('errorLoadingClasses'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.academiaId, academia?.id, getString, trackFeatureUsage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadClasses();
  }, [loadClasses]);

  const handleClassPress = useCallback((classItem) => {
    trackButtonClick('class_details', { classId: classItem.id });
    
    // Navegar para o AdminStack pai para acessar ClassDetails
    const adminStackNav = navigation.getParent && navigation.getParent('AdminStack');
    if (adminStackNav && typeof adminStackNav.navigate === 'function') {
      adminStackNav.navigate('ClassDetails', { classId: classItem.id, classData: classItem });
      return;
    }
    // Fallback: tentar navegar pelo parent
    const parentNav = navigation.getParent && navigation.getParent();
    if (parentNav && typeof parentNav.navigate === 'function') {
      parentNav.navigate('ClassDetails', { classId: classItem.id, classData: classItem });
      return;
    }
    // Fallback final
    navigation.navigate('ClassDetails', { classId: classItem.id, classData: classItem });
  }, [navigation, trackButtonClick]);

  const handleAddClass = useCallback(async () => {
    trackButtonClick('add_class');
    
    const result = await executeClassAction(async () => {
      // Invalidar cache de turmas
      const academiaId = userProfile?.academiaId || academia?.id;
      if (academiaId) {
        await cacheService.invalidatePattern(`classes:${academiaId}`);
      }
      
      // Tenta navegar através do navigator do Stack pai, usando o ID definido
      const adminStackNav = navigation.getParent && navigation.getParent('AdminStack');
      if (adminStackNav && typeof adminStackNav.navigate === 'function') {
        adminStackNav.navigate('AddClass');
        return;
      }
      // Fallback 1: subir um nível (Tab) e depois tentar o Stack acima
      const parentNav = navigation.getParent && navigation.getParent();
      const grandParentNav = parentNav && parentNav.getParent ? parentNav.getParent() : null;
      if (grandParentNav && typeof grandParentNav.navigate === 'function') {
        grandParentNav.navigate('AddClass');
        return;
      }
      if (parentNav && typeof parentNav.navigate === 'function') {
        parentNav.navigate('AddClass');
        return;
      }
      // Fallback final
      navigation.navigate('AddClass');
    });

    if (result.blocked) {
      Alert.alert('Ação Bloqueada', 'Muitas criações de turma. Aguarde alguns minutos.');
    }
  }, [navigation, trackButtonClick, executeClassAction, userProfile?.academiaId, academia?.id]);

  const handleEditClass = useCallback((classItem) => {
    trackButtonClick('edit_class', { classId: classItem.id });
    
    // Navegar para o AdminStack pai para acessar EditClass
    const adminStackNav = navigation.getParent && navigation.getParent('AdminStack');
    if (adminStackNav && typeof adminStackNav.navigate === 'function') {
      adminStackNav.navigate('EditClass', { classId: classItem.id, classData: classItem });
      return;
    }
    // Fallback: tentar navegar pelo parent
    const parentNav = navigation.getParent && navigation.getParent();
    if (parentNav && typeof parentNav.navigate === 'function') {
      parentNav.navigate('EditClass', { classId: classItem.id, classData: classItem });
      return;
    }
    // Fallback final
    navigation.navigate('EditClass', { classId: classItem.id, classData: classItem });
  }, [navigation, trackButtonClick]);

  // Memoized render functions
  const renderClassItem = useCallback(({ item: classItem, index }) => (
    <ClassListItem
      key={classItem.id || index}
      classItem={classItem}
      index={index}
      onPress={handleClassPress}
      onEdit={handleEditClass}
      onView={handleClassPress}
      getString={getString}
    />
  ), [handleClassPress, handleEditClass, getString]);

  const keyExtractor = useCallback((item, index) => item.id || `class-${index}`, []);

  const renderEmptyList = useCallback(() => (
    <Card style={styles.emptyCard}>
      <Card.Content style={styles.emptyContent}>
        <Ionicons name="school-outline" size={48} color="#ccc" />
        <Title style={styles.emptyTitle}>{getString('noClassesFound')}</Title>
        <Paragraph style={styles.emptyText}>
          {searchQuery ? 
            getString('noMatchingClasses') : 
            getString('noClassesRegistered')
          }
        </Paragraph>
      </Card.Content>
    </Card>
  ), [searchQuery, getString]);

  const renderStatsCard = useCallback(() => {
    if (classes.length === 0) return null;
    
    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.statsTitle}>{getString('classStatistics')}</Title>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{classes.length}</Text>
              <Text style={styles.statLabel}>{getString('total')}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {classes.filter(c => c.isActive !== false).length}
              </Text>
              <Text style={styles.statLabel}>{getString('activeClasses')}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {classes.reduce((sum, c) => sum + (c.currentStudents || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>{getString('totalStudents')}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {[...new Set(classes.map(c => c.modality))].length}
              </Text>
              <Text style={styles.statLabel}>{getString('modalities')}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  }, [classes, getString]);

  const handleDeleteClass = (classItem) => {
    Alert.alert(
      getString('confirmDeletion'),
      getString('confirmDeleteClass').replace('{className}', classItem.name),
      [
        { text: getString('cancel'), style: 'cancel' },
        { 
          text: getString('delete'), 
          style: 'destructive',
          onPress: async () => {
            try {
              // Remoção otimista da UI
              setClasses(prev => prev.filter(c => c.id !== classItem.id));
              setFilteredClasses(prev => prev.filter(c => c.id !== classItem.id));
              await firestoreService.delete('classes', classItem.id);
              // Garantir sincronização com servidor
              loadClasses();
              Alert.alert(getString('success'), getString('classDeletedSuccess'));
            } catch (error) {
              // Em caso de erro, recarregar lista para reverter remoção otimista
              loadClasses();
              Alert.alert(getString('error'), getString('errorDeletingClass'));
            }
          }
        }
      ]
    );
  };

  const formatSchedule = (classItem) => {
    // Suporta novo formato (array de objetos), legado (string) e scheduleText
    try {
      const schedule = classItem?.schedule;
      if (Array.isArray(schedule) && schedule.length > 0) {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return schedule.map((s) => {
          const day = typeof s.dayOfWeek === 'number' ? days[s.dayOfWeek] : 'Dia';
          const hour = (s.hour ?? '').toString().padStart(2, '0');
          const minute = (s.minute ?? 0).toString().padStart(2, '0');
          return `${day} ${hour}:${minute}`;
        }).join(', ');
      }
      if (typeof schedule === 'string' && schedule.trim()) {
        return schedule.trim();
      }
      if (typeof classItem?.scheduleText === 'string' && classItem.scheduleText.trim()) {
        return classItem.scheduleText.trim();
      }
      return getString('scheduleNotDefined');
    } catch (e) {
      return getString('scheduleNotDefined');
    }
  };

  const getCapacityColor = (current, max) => {
    if (!max) return 'COLORS.text.secondary';
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'COLORS.error[500]';
    if (percentage >= 70) return 'COLORS.warning[500]';
    return 'COLORS.primary[500]';
  };

  const getFilterText = (filter) => {
    const filters = {
      'all': getString('allClasses'),
      'active': getString('activeClasses'),
      'inactive': getString('inactiveClasses'),
      'full': getString('fullClasses'),
      'empty': getString('emptyClasses'),
      'no_instructor': getString('noInstructor')
    };
    return filters[filter] || getString('allClasses');
  };

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro na tela AdminClasses:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'AdminClasses', academiaId: userProfile?.academiaId }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Searchbar
            placeholder={getString('searchClasses')}
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
              <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title={getString('allClasses')} />
              <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title={getString('activeClasses')} />
              <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title={getString('inactiveClasses')} />
              <Menu.Item onPress={() => { setSelectedFilter('full'); setFilterVisible(false); }} title={getString('fullClasses')} />
              <Menu.Item onPress={() => { setSelectedFilter('empty'); setFilterVisible(false); }} title={getString('emptyClasses')} />
              <Menu.Item onPress={() => { setSelectedFilter('no_instructor'); setFilterVisible(false); }} title={getString('noInstructor')} />
            </Menu>
          </View>
        </View>

        {loading ? (
          <ClassListSkeleton count={4} />
        ) : (
          <EnhancedFlashList
            data={filteredClasses}
            renderItem={renderClassItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={250}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={renderEmptyList}
            ListFooterComponent={renderStatsCard}
            emptyMessage={getString('noClassesFound')}
            contentContainerStyle={styles.listContainer}
            accessible={true}
            accessibilityLabel={`Lista de ${filteredClasses.length} turmas`}
          />
        )}

        <FAB
          style={styles.fab}
          icon="plus"
          label={getString('newClass')}
          onPress={handleAddClass}
        />
        
        <FAB
          style={styles.calendarFab}
          icon="calendar-month"
          onPress={() => setShowCalendarModal(true)}
        />

        {/* Modal do Calendário */}
        <Portal>
          <Modal
            visible={showCalendarModal}
            onDismiss={() => setShowCalendarModal(false)}
            contentContainerStyle={styles.calendarModalContainer}
            dismissable={true}
          >
          <View style={styles.calendarModalHeader}>
            <Text style={styles.calendarModalTitle}>Cronograma das Turmas</Text>
            <Button onPress={() => setShowCalendarModal(false)}>Fechar</Button>
          </View>
          <View style={styles.calendarContainer}>
            <FreeGymScheduler
              classes={classes}
              onClassPress={(event) => {
                setShowCalendarModal(false);
                navigation.navigate('ClassDetails', { 
                  classId: event.classId,
                  className: event.title 
                });
              }}
              onCreateClass={() => {
                console.log('🚀 Botão criar turma clicado no AdminClasses');
                setShowCalendarModal(false);
                console.log('📱 Navegando para AddClass...');
                navigation.navigate('AddClass');
              }}
              navigation={navigation}
            />
          </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  header: {
    padding: SPACING.base,
    backgroundColor: 'COLORS.COLORS.white',
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: COLORS.gray[100],
    marginBottom: SPACING.sm,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    borderColor: 'COLORS.warning[500]',
  },
  scrollView: {
    flex: 1,
  },
  classCard: {
    margin: SPACING.base,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  className: {
    fontSize: FONT_SIZE.lg,
    flex: 1,
  },
  modalityChip: {
    marginLeft: 8,
  },
  classDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    marginLeft: 8,
    color: 'COLORS.text.secondary',
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  statusChip: {
    borderWidth: 1,
    marginRight: 8,
    marginBottom: SPACING.xs,
  },
  divider: {
    marginVertical: 12,
  },
  classActions: {
    marginTop: SPACING.xs,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    margin: SPACING.base,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: 'COLORS.text.secondary',
  },
  statsCard: {
    margin: SPACING.base,
    marginTop: SPACING.sm,
    elevation: 2,
    backgroundColor: COLORS.warning[50],
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: 'COLORS.warning[500]',
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: 'COLORS.text.secondary',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.base,
    right: 0,
    bottom: 0,
    backgroundColor: 'COLORS.warning[500]',
  },
  listContainer: {
    paddingHorizontal: 0,
  },
  calendarFab: {
    position: 'absolute',
    margin: SPACING.base,
    right: 0,
    bottom: 80, // Acima do FAB principal
    backgroundColor: 'COLORS.info[500]',
  },
  calendarModalContainer: {
    backgroundColor: 'COLORS.COLORS.white',
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    maxHeight: '90%',
    flex: 1,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: 'COLORS.gray[300]',
  },
  calendarModalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: 'COLORS.text.primary',
  },
  calendarContainer: {
    flex: 1,
    padding: SPACING.sm,
  },
});

export default AdminClasses;
