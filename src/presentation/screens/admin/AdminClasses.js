import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, Alert, Animated } from 'react-native';
import {
  Card,
  Button,
  FAB,
  Searchbar,
  Menu,
  Modal,
  Portal,
  Text
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService, academyStudentService } from '@infrastructure/services/academyFirestoreService';
import EnhancedFlashList from '@components/EnhancedFlashList';
import ClassListItem from '@components/memoized/ClassListItem';
import ClassListSkeleton from '@components/skeletons/ClassListSkeleton';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@infrastructure/services/cacheService';
import batchFirestoreService from '@infrastructure/services/batchFirestoreService';
import { firestoreService } from '@infrastructure/services/firestoreService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import { useClassCreationRateLimit } from '@hooks/useRateLimit';
import FreeGymScheduler from '@components/FreeGymScheduler';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, BORDER_WIDTH, GLASS } from '@presentation/theme/designTokens';
import { getDayNames } from '@shared/utils/dateHelpers';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import AddClassForm from '@screens/admin/AddClassScreen';
import EditClassForm from '@screens/admin/EditClassScreen';

const AdminClasses = ({ navigation }) => {
  const { currentTheme } = useThemeToggle();

  const { user, userProfile, academia } = useAuthFacade();
  const { getString, isDarkMode, theme } = useTheme();

  // Dynamic Styles
  const backgroundGradient = isDarkMode
    ? COLORS.gradients.deepPurple
    : COLORS.gradients.lightBackground;

  const textColor = theme.colors.text;
  const secondaryTextColor = theme.colors.textSecondary;
  const glassStyle = isDarkMode ? GLASS.premium : GLASS.light;

  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  // Animações para micro-interações
  const [fadeAnim] = useState(new Animated.Value(0));

  // Analytics tracking
  useScreenTracking('AdminClasses', {
    academiaId: userProfile?.academiaId,
    userType: userProfile?.userType
  });
  const { trackButtonClick, trackSearch, trackFeatureUsage } = useUserActionTracking();
  const { executeWithLimit: executeClassAction } = useClassCreationRateLimit();

  useEffect(() => {
    loadClasses();

    // Iniciar animação de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
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
        console.error(getString('academyIdNotFound'));
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
                      // Fallback hierárquico: Instrutor encontrado > Nome salvo na turma > userProfile se for o próprio > Não atribuído
                      instructorName: instructor?.name || classItem.instructorName || (classItem.instructorId === user?.id ? userProfile?.name : getString('noInstructor'))
                    };
                  } catch (error) {
                    return {
                      ...classItem,
                      currentStudents: 0,
                      students: [],
                      instructorName: classItem.instructorName || getString('noInstructor')
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
      console.error(getString('loadClassesError'), error);
      Alert.alert(getString('error'), getString('errorLoadingData'));
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

  const handleAddClass = useCallback(() => {
    trackButtonClick('add_class');

    // Invalidar cache de turmas
    const academiaId = userProfile?.academiaId || academia?.id;
    if (academiaId) {
      cacheService.invalidatePattern(`classes:${academiaId}`);
    }

    setShowAddClassModal(true); // Abre modal ao invés de navegar
  }, [trackButtonClick, userProfile?.academiaId, academia?.id]);

  const handleEditClass = useCallback((classItem) => {
    trackButtonClick('edit_class', { classId: classItem.id });
    setEditingClass(classItem);
    setShowEditClassModal(true);
  }, [trackButtonClick]);


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
    <Card style={[styles.emptyCard, { backgroundColor: glassStyle.backgroundColor, borderColor: glassStyle.borderColor, borderWidth: 1 }]}>
      <Card.Content style={styles.emptyContent}>
        <Ionicons name="school-outline" size={48} color={secondaryTextColor} />
        <Text style={[styles.emptyTitle, styles.title, { color: textColor }]}>{getString('noClassesFound')}</Text>
        <Text style={[styles.emptyText, styles.paragraph, { color: secondaryTextColor }]}>
          {searchQuery ?
            getString('noClassesFound') :
            getString('noClassesRegistered')
          }
        </Text>
      </Card.Content>
    </Card>
  ), [searchQuery, getString, textColor, secondaryTextColor, glassStyle]);

  const renderStatsCard = useCallback(() => {
    if (classes.length === 0) return null;

    return (
      <Card style={[styles.statsCard, { backgroundColor: glassStyle.backgroundColor, borderColor: glassStyle.borderColor, borderWidth: 1 }]}>
        <Card.Content>
          <Text style={[styles.statsTitle, styles.title, { color: textColor }]}>{getString('statsClassStats')}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>{classes.length}</Text>
              <Text style={[styles.statLabel, { color: secondaryTextColor }]}>{getString('total')}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {classes.filter(c => c.isActive !== false).length}
              </Text>
              <Text style={[styles.statLabel, { color: secondaryTextColor }]}>{getString('statsActiveClasses')}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {classes.reduce((sum, c) => sum + (c.currentStudents || 0), 0)}
              </Text>
              <Text style={[styles.statLabel, { color: secondaryTextColor }]}>{getString('totalStudents')}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {[...new Set(classes.map(c => c.modality))].length}
              </Text>
              <Text style={[styles.statLabel, { color: secondaryTextColor }]}>{getString('modalities')}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  }, [classes, getString, textColor, secondaryTextColor, glassStyle]);

  const handleDeleteClass = (classItem) => {
    Alert.alert(
      getString('confirmDeleteClass'),
      getString('confirmDeleteClassWithName', { className: classItem.name }),
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Remoção otimista da UI
              setClasses(prev => prev.filter(c => c.id !== classItem.id));
              await firestoreService.delete('classes', classItem.id);
              // Garantir sincronização com servidor
              loadClasses();
              Alert.alert(getString('success'), getString('classDeletedSuccess'));
            } catch (error) {
              // Em caso de erro, recarregar lista para reverter remoção otimista
              loadClasses();
              Alert.alert(getString('error'), getString('classDeleteError'));
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
        const days = getDayNames(getString);
        return schedule.map((s) => {
          const day = typeof s.dayOfWeek === 'number' ? days[s.dayOfWeek] : getString('day');
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
    if (!max) return COLORS.gray[500];
    const percentage = (current / max) * 100;
    if (percentage >= 90) return COLORS.error[500];
    if (percentage >= 70) return COLORS.warning[500];
    return COLORS.primary[500];
  };

  const getFilterText = (filter) => {
    const filters = {
      'all': getString('filterAllClasses'),
      'active': getString('filterActiveClasses'),
      'inactive': getString('filterInactiveClasses'),
      'full': getString('filterFullClasses'),
      'empty': getString('filterEmptyClasses'),
      'no_instructor': getString('filterNoInstructor')
    };
    return filters[filter] || getString('filterAllClasses');
  };

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro na tela AdminClasses:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'AdminClasses', academiaId: userProfile?.academiaId }}
    >
      <LinearGradient
        colors={backgroundGradient}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Searchbar
              placeholder={getString('search')}
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
                    textColor={isDarkMode ? COLORS.warning[400] : COLORS.warning[600]}
                  >
                    {getFilterText(selectedFilter)}
                  </Button>
                }
              >
                <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title={getString('filterAllClasses')} />
                <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title={getString('filterActiveClasses')} />
                <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title={getString('filterInactiveClasses')} />
                <Menu.Item onPress={() => { setSelectedFilter('full'); setFilterVisible(false); }} title={getString('filterFullClasses')} />
                <Menu.Item onPress={() => { setSelectedFilter('empty'); setFilterVisible(false); }} title={getString('filterEmptyClasses')} />
                <Menu.Item onPress={() => { setSelectedFilter('no_instructor'); setFilterVisible(false); }} title={getString('filterNoInstructor')} />
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
              showsVerticalScrollIndicator={true}
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
                <Text style={styles.calendarModalTitle}>{getString('classSchedule')}</Text>
                <Button onPress={() => setShowCalendarModal(false)}>{getString('close')}</Button>
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

          {/* Modal de Adicionar Turma */}
          <Portal>
            <Modal
              visible={showAddClassModal}
              onDismiss={() => setShowAddClassModal(false)}
              contentContainerStyle={{
                backgroundColor: theme.colors.background,
                margin: '2%',
                maxHeight: '96%',
                borderRadius: 12,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <AddClassForm
                onClose={() => setShowAddClassModal(false)}
                onSuccess={() => {
                  setShowAddClassModal(false);
                  loadClasses();
                }}
              />
            </Modal>
          </Portal>

          {/* Modal de Editar Turma */}
          <Portal>
            <Modal
              visible={showEditClassModal}
              onDismiss={() => {
                setShowEditClassModal(false);
                setEditingClass(null);
              }}
              contentContainerStyle={{
                backgroundColor: theme.colors.background,
                margin: '2%',
                maxHeight: '96%',
                borderRadius: 12,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {editingClass && (
                <EditClassForm
                  classId={editingClass.id}
                  classData={editingClass}
                  onClose={() => {
                    setShowEditClassModal(false);
                    setEditingClass(null);
                  }}
                  onSuccess={() => {
                    setShowEditClassModal(false);
                    setEditingClass(null);
                    loadClasses();
                  }}
                />
              )}
            </Modal>
          </Portal>
        </SafeAreaView>
      </LinearGradient>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: COLORS.white, // Removed hardcoded color
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: '4%',
    paddingVertical: SPACING.md,
    backgroundColor: 'transparent', // Make transparent
    elevation: 0, // Remove elevation to blend
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
  scrollView: {
    flex: 1,
  },
  classCard: {
    marginHorizontal: '4%',
    marginVertical: SPACING.sm,
    elevation: 2,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    width: '100%',
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
    marginLeft: SPACING.sm,
  },
  classDetails: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    width: '100%',
  },
  detailText: {
    marginLeft: SPACING.sm,
    color: COLORS.gray[500],
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
    width: '100%',
  },
  statusChip: {
    borderWidth: BORDER_WIDTH.base,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  classActions: {
    marginTop: SPACING.xs,
    width: '100%',
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    marginHorizontal: '4%',
    marginVertical: SPACING.md,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray[500],
  },
  statsCard: {
    marginHorizontal: '4%',
    marginVertical: SPACING.sm,
    elevation: 2,
    backgroundColor: COLORS.warning[50],
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.warning[500],
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.success[500],
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingBottom: 100,
  },
  calendarFab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 80,
    backgroundColor: COLORS.info[500],
  },
  calendarModalContainer: {
    backgroundColor: COLORS.card.elevated.background,
    marginHorizontal: '5%',
    marginVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    flex: 1,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[300],
  },
  calendarModalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.black,
  },
  calendarContainer: {
    flex: 1,
    padding: SPACING.sm,
  },
});

export default AdminClasses;
