import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Card,
  Button,
  Chip,
  Divider,
  Text,
  List,
  FAB,
  Searchbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthProvider';
import { academyFirestoreService, academyClassService, academyStudentService } from '@infrastructure/services/academyFirestoreService';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@infrastructure/services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import InstructorClassesSkeleton from '@components/skeletons/InstructorClassesSkeleton';
import { EnhancedFlashList } from '@components/EnhancedFlashList';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from '@utils/theme';

const InstructorClasses = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentCounts, setStudentCounts] = useState({});

  // Analytics tracking
  useScreenTracking('InstructorClasses', { 
    academiaId: userProfile?.academiaId,
    userType: 'instructor',
    instructorId: user?.uid 
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [searchQuery, classes]);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📚 Carregando turmas do instrutor:', user.id);
      
      if (!userProfile?.academiaId) {
        console.warn('⚠️ Usuário sem academiaId definido');
        setClasses([]);
        return;
      }
      
      // Verificar se user está disponível
      if (!user?.uid || !userProfile?.academiaId) {
        console.warn('⚠️ User ou userProfile não disponível ainda');
        setClasses([]);
        setLoading(false);
        return;
      }
      
      // Usar cache inteligente para turmas do instrutor
      const cacheKey = CACHE_KEYS.INSTRUCTOR_CLASSES(userProfile.academiaId, user.id);
      
      const classesData = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando turmas do instrutor (cache miss):', user.id);
          return await academyClassService.getClassesByInstructor(user.id, userProfile.academiaId, user?.email);
        },
        CACHE_TTL.MEDIUM // Cache por 5 minutos
      );
      
      const validClasses = Array.isArray(classesData) ? classesData : [];
      setClasses(validClasses);
      console.log('✅', validClasses.length, 'turmas encontradas');
      
      // Carregar contagem de alunos para cada turma
      await loadStudentCounts(validClasses);
      
      // Track analytics
      trackFeatureUsage('instructor_classes_loaded', {
        academiaId: userProfile.academiaId,
        instructorId: user.id,
        classesCount: validClasses.length
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar turmas:', error);
      setClasses([]);
      Alert.alert(getString('error'), 'Não foi possível carregar as turmas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id, userProfile?.academiaId, user?.email, trackFeatureUsage]);

  const loadStudentCounts = useCallback(async (classes) => {
    try {
      if (!userProfile?.academiaId) return;
      
      // Usar cache para contagens de alunos
      const cacheKey = CACHE_KEYS.CLASS_STUDENT_COUNTS(userProfile.academiaId, user.id);
      
      const counts = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando contagens de alunos (cache miss)');
          const countsData = {};
          
          // Usar Promise.all para carregar contagens em paralelo
          const countPromises = classes.map(async (classItem) => {
            try {
              const students = await academyStudentService.getStudentsByClass(classItem.id, userProfile.academiaId);
              return { classId: classItem.id, count: Array.isArray(students) ? students.length : 0 };
            } catch (error) {
              console.warn(`⚠️ Erro ao carregar alunos da turma ${classItem.id}:`, error);
              return { classId: classItem.id, count: 0 };
            }
          });
          
          const results = await Promise.all(countPromises);
          results.forEach(({ classId, count }) => {
            countsData[classId] = count;
          });
          
          return countsData;
        },
        CACHE_TTL.SHORT // Cache por 2 minutos (dados dinâmicos)
      );
      
      setStudentCounts(counts);
    } catch (error) {
      console.error('❌ Erro ao carregar contagens de alunos:', error);
    }
  }, [userProfile?.academiaId, user.id]);

  const filterClasses = useCallback(() => {
    if (!searchQuery) {
      setFilteredClasses(classes);
      return;
    }
    
    const filtered = classes.filter(classItem =>
      classItem.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      classItem.modality?.toLowerCase()?.includes(searchQuery.toLowerCase())
    );
    setFilteredClasses(filtered);
    
    // Track search analytics
    if (searchQuery) {
      trackFeatureUsage('instructor_classes_search', {
        query: searchQuery,
        resultsCount: filtered.length
      });
    }
  }, [searchQuery, classes, trackFeatureUsage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar caches
    if (userProfile?.academiaId) {
      cacheService.invalidatePattern(`instructor_classes:${userProfile.academiaId}:${user.id}`);
      cacheService.invalidatePattern(`class_student_counts:${userProfile.academiaId}`);
    }
    loadClasses();
  }, [loadClasses, userProfile?.academiaId, user.id]);

  const handleClassPress = useCallback((classItem) => {
    trackButtonClick('instructor_class_details', { classId: classItem.id });
    navigation.navigate('ClassDetails', { classId: classItem.id, classData: classItem });
  }, [navigation, trackButtonClick]);

  const handleCheckIns = useCallback((classItem) => {
    trackButtonClick('instructor_class_checkins', { classId: classItem.id });
    navigation.navigate('CheckIn', { 
      classId: classItem.id,
      className: classItem.name 
    });
  }, [navigation, trackButtonClick]);

  const handleAddClass = useCallback(() => {
    trackButtonClick('instructor_add_class');
    navigation.navigate(getString('addClassScreen'));
  }, [navigation, trackButtonClick]);

  const formatSchedule = useCallback((classItem) => {
    try {
      const schedule = classItem?.schedule;
      if (Array.isArray(schedule) && schedule.length > 0) {
        const days = [getString('sunday'), getString('monday'), getString('tuesday'), getString('wednesday'), getString('thursday'), getString('friday'), getString('saturday')];
        return schedule.map(s => 
          `${days[s.dayOfWeek]} ${String(s.hour ?? '').padStart(2, '0')}:${String(s.minute ?? 0).padStart(2, '0')}`
        ).join(', ');
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
  }, []);

  const renderClassCard = useCallback((classItem) => {
    const studentCount = studentCounts[classItem.id] || classItem.currentStudents || 0;
    
    return (
      <Card key={classItem.id} style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={[styles.className, styles.title]}>{classItem.name}</Text>
            <Chip 
              style={[styles.statusChip, { backgroundColor: classItem.status === 'active' ? COLORS.primary[500] : COLORS.warning[400] }]}
              textStyle={{ color: COLORS.white, fontSize: FONT_SIZE.sm }}
            >
              {classItem.status === 'active' ? 'Ativa' : 'Inativa'}
            </Chip>
          </View>
          
          <Paragraph style={styles.modalityText}>
            <Ionicons name="fitness-outline" size={16} color={COLORS.text.secondary} />
            {' '}{classItem.modality}
          </Paragraph>
          
          <View style={styles.classInfo}>
            <Text style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.text.secondary} />
              {' '}{formatSchedule(classItem)}
            </Text>
            
            <Text style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color={COLORS.text.secondary} />
              {' '}{studentCount}/{classItem.maxStudents || 0} alunos
            </Text>
            
            {classItem.price && (
              <Text style={styles.infoItem}>
                <Ionicons name="card-outline" size={16} color={COLORS.text.secondary} />
                {' '}R$ {classItem.price.toFixed(2)}
              </Text>
            )}
          </View>

          {classItem.description && (
            <Text style={[styles.description, styles.paragraph]}>{classItem.description}</Text>
          )}
        </Card.Content>
        
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="outlined" 
            onPress={() => handleClassPress(classItem)}
            style={styles.actionButton}
          >
            Detalhes
          </Button>
          <Button 
            mode="contained" 
            onPress={() => handleCheckIns(classItem)}
            style={styles.actionButton}
          >
            Check-ins
          </Button>
        </Card.Actions>
      </Card>
    );
  }, [studentCounts, formatSchedule, handleClassPress, handleCheckIns]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <InstructorClassesSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro no InstructorClasses:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'InstructorClasses', academiaId: userProfile?.academiaId, instructorId: user?.uid }}
    >
      <SafeAreaView style={styles.container}>
      <Searchbar
        placeholder="Buscar turmas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredClasses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color={COLORS.gray[400]} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'noClassesFound' : 'Nenhuma turma cadastrada'}
            </Text>
            {!searchQuery && (
              <Text style={styles.emptySubtext}>
                Entre em contato com o administrador para criar turmas
              </Text>
            )}
          </View>
        ) : (
          <EnhancedFlashList
            data={filteredClasses}
            renderItem={({ item }) => renderClassCard(item)}
            keyExtractor={(item) => item.id}
            estimatedItemSize={200}
            contentContainerStyle={{ padding: SPACING.base }}
          />
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Nova Turma"
        onPress={handleAddClass}
      />
      </SafeAreaView>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  searchbar: {
    margin: SPACING.base,
    marginBottom: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.base,
    paddingTop: 8,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  className: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  modalityText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  classInfo: {
    marginBottom: SPACING.md,
  },
  infoItem: {
    fontSize: FONT_SIZE.base,
    color: '#555',
    marginBottom: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    fontSize: FONT_SIZE.base,
    color: '#777',
    fontStyle: 'italic',
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 8,
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
    textAlign: 'center',
    marginTop: 16,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.base,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary[500],
  },
});

export default InstructorClasses;