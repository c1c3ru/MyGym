
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { 
  Card, 
  Chip, 
  Divider,
  List,
  Avatar,
  Text as PaperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@contexts/AuthProvider';
import { announcementService } from '@services/firestoreService';
import { academyFirestoreService } from '@services/academyFirestoreService';
import AnimatedCard from '@components/AnimatedCard';
import AnimatedButton from '@components/AnimatedButton';
import { ResponsiveUtils } from '@utils/animations';
import { Ionicons } from '@expo/vector-icons';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import StudentDashboardSkeleton from '@components/skeletons/StudentDashboardSkeleton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const StudentDashboard = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const [nextClasses, setNextClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    graduationStatus: 'Faixa Branca',
    nextEvaluation: '2 meses',
    totalClasses: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics tracking
  useScreenTracking('StudentDashboard', { 
    academiaId: userProfile?.academiaId,
    userType: 'student',
    studentId: user?.uid 
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!userProfile?.academiaId || !user?.uid) {
        console.warn('⚠️ Usuário sem academiaId ou uid definido');
        return;
      }

      // Usar cache inteligente para dados do dashboard do estudante
      const cacheKey = CACHE_KEYS.STUDENT_DASHBOARD(userProfile.academiaId, user.uid);
      
      const studentData = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando dados do dashboard do estudante (cache miss):', user.uid);
          
          // Usar Promise.all para carregar dados em paralelo
          const [userClasses, userAnnouncements, studentProfile] = await Promise.all([
            academyFirestoreService.getWhere('classes', 'studentIds', 'array-contains', user.uid, userProfile.academiaId).catch(() => []),
            announcementService.getActiveAnnouncements('student').catch(() => []),
            academyFirestoreService.getById('students', user.uid, userProfile.academiaId).catch(() => null)
          ]);
          
          // Processar próximas aulas
          const today = new Date();
          const nextClasses = userClasses
            .filter(cls => cls.status === 'active')
            .map(cls => ({
              id: cls.id,
              name: cls.name,
              time: cls.schedule?.[0]?.time || '00:00',
              date: 'Hoje', // Simplificado - em produção calcular baseado no schedule
              instructor: cls.instructorName || 'Instrutor'
            }))
            .slice(0, 3);
          
          // Formatar anúncios
          const formattedAnnouncements = userAnnouncements.map(announcement => ({
            id: announcement.id,
            title: announcement.title,
            message: announcement.message,
            date: formatDate(announcement.createdAt),
            priority: announcement.priority || 0
          }));
          
          // Dados do dashboard
          const dashboardInfo = {
            graduationStatus: studentProfile?.currentBelt || studentProfile?.currentGraduation || 'Faixa Branca',
            nextEvaluation: studentProfile?.nextEvaluationDate || '2 meses', // Usar dados do backend
            totalClasses: userClasses.length,
            attendanceRate: studentProfile?.attendanceRate || 0 // Usar dados reais do backend
          };
          
          return {
            nextClasses,
            announcements: formattedAnnouncements,
            dashboardData: dashboardInfo
          };
        },
        CACHE_TTL.SHORT // Cache por 2 minutos (dados dinâmicos)
      );
      
      setNextClasses(studentData.nextClasses);
      setAnnouncements(studentData.announcements);
      setDashboardData(studentData.dashboardData);
      
      // Track analytics
      trackFeatureUsage('student_dashboard_loaded', {
        academiaId: userProfile.academiaId,
        studentId: user.uid,
        classesCount: studentData.nextClasses.length,
        announcementsCount: studentData.announcements.length
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard do estudante:', error);
      // Em caso de erro, exibe dados padrão
      setAnnouncements([{
        id: 'error',
        title: 'Erro ao carregar',
        message: 'Não foi possível carregar os dados. Tente novamente mais tarde.',
        date: 'Agora',
        isError: true
      }]);
    } finally {
      setLoading(false);
      setLoadingAnnouncements(false);
      setRefreshing(false);
    }
  }, [user?.uid, userProfile?.academiaId, trackFeatureUsage]);

  // Carregar anúncios do Firestore
  const loadAnnouncements = useCallback(async () => {
    try {
      setLoadingAnnouncements(true);
      
      // Invalidar cache de anúncios
      if (userProfile?.academiaId) {
        cacheService.invalidatePattern(`student_dashboard:${userProfile.academiaId}:${user.uid}`);
      }
      
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao recarregar anúncios:', error);
    }
  }, [loadDashboardData, userProfile?.academiaId, user?.uid]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache
    if (userProfile?.academiaId) {
      cacheService.invalidatePattern(`student_dashboard:${userProfile.academiaId}:${user.uid}`);
    }
    loadDashboardData();
  }, [loadDashboardData, userProfile?.academiaId, user.uid]);

  // Função para formatar a data do anúncio
  const formatDate = useCallback((date) => {
    if (!date) return 'Data desconhecida';
    
    try {
      const now = new Date();
      const announcementDate = date.toDate ? date.toDate() : new Date(date);
      const diffTime = Math.abs(now - announcementDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `Há ${diffDays} dias`;
      
      return announcementDate.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data desconhecida';
    }
  }, []);

  // Handlers memoizados
  const handleViewCalendar = useCallback(() => {
    trackButtonClick('view_calendar');
    if (navigation) {
      navigation.navigate('Calendar');
    } else {
      Alert.alert('Info', 'Funcionalidade em desenvolvimento');
    }
  }, [navigation, trackButtonClick]);

  const handleCheckIn = useCallback(() => {
    trackButtonClick('quick_checkin');
    if (navigation) {
      navigation.navigate('CheckIn');
    } else {
      Alert.alert('Info', 'Check-in em desenvolvimento');
    }
  }, [navigation, trackButtonClick]);

  const handlePayments = useCallback(() => {
    trackButtonClick('quick_payments');
    if (navigation) {
      navigation.navigate('Payments');
    } else {
      Alert.alert('Info', 'Pagamentos em desenvolvimento');
    }
  }, [navigation, trackButtonClick]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StudentDashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro no StudentDashboard:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'StudentDashboard', academiaId: userProfile?.academiaId, studentId: user?.uid }}
    >
      <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
        {/* Header de Boas-vindas */}
        <AnimatedCard style={styles.welcomeCard} animationType="fadeIn" delay={0}>
          <Card.Content style={styles.welcomeContent}>
            <Avatar.Icon 
              size={ResponsiveUtils?.isTablet?.() ? 80 : 60} 
              icon="account" 
              style={styles.avatar}
            />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>
                Olá, {userProfile?.name || 'Aluno'}!
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Bem-vindo de volta à academia
              </Text>
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Status da Graduação */}
        <AnimatedCard style={styles.card} animationType="slideInRight" delay={100}>
          <Card.Content>
            <Text style={styles.cardTitle}>Status da Graduação</Text>
            <View style={styles.graduationStatus}>
              <Chip 
                icon="trophy" 
                mode="outlined"
                style={styles.graduationChip}
              >
                {dashboardData.graduationStatus}
              </Chip>
              <Text style={styles.graduationText}>
                Próxima avaliação em {dashboardData.nextEvaluation}
              </Text>
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Próximas Aulas */}
        <AnimatedCard style={styles.card} animationType="fadeIn" delay={200}>
          <Card.Content>
            <Text style={styles.cardTitle}>Próximas Aulas</Text>
            {nextClasses.length > 0 ? (
              nextClasses.map((classItem, index) => (
                <List.Item
                  key={classItem.id}
                  title={classItem.name}
                  description={`${classItem.date} às ${classItem.time} - ${classItem.instructor}`}
                  left={props => <List.Icon {...props} icon="calendar" />}
                  style={styles.listItem}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                Nenhuma aula agendada
              </Text>
            )}
            
            <AnimatedButton 
              mode="text" 
              onPress={handleViewCalendar}
              style={styles.viewAllButton}
            >
              Ver Calendário Completo
            </AnimatedButton>
          </Card.Content>
        </AnimatedCard>

        {/* Avisos e Comunicados */}
        <AnimatedCard style={styles.card} animationType="scaleIn" delay={300}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Avisos</Text>
              <AnimatedButton
                icon="refresh"
                mode="text"
                onPress={loadAnnouncements}
                loading={loadingAnnouncements}
                compact
                style={styles.refreshButton}
              >
                {loadingAnnouncements ? '' : 'Atualizar'}
              </AnimatedButton>
            </View>
            
            {loadingAnnouncements ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="COLORS.info[500]" />
                <Text style={styles.loadingText}>Carregando avisos...</Text>
              </View>
            ) : announcements.length > 0 ? (
              <View style={styles.announcementsContainer}>
                {announcements.map((announcement, index) => (
                  <View 
                    key={announcement.id} 
                    style={[
                      styles.announcementItem,
                      announcement.priority > 0 && styles.highPriorityAnnouncement
                    ]}
                  >
                    {announcement.priority > 0 && (
                      <View style={styles.priorityBadge}>
                        <Ionicons name="alert-circle" size={16} color={COLORS.warning[400]} />
                        <Text style={styles.priorityText}>Importante</Text>
                      </View>
                    )}
                    <Text style={styles.announcementTitle}>
                      {announcement.title}
                    </Text>
                    <Text style={styles.announcementMessage}>
                      {announcement.message}
                    </Text>
                    <View style={styles.announcementFooter}>
                      <Text style={styles.announcementDate}>
                        {announcement.date}
                      </Text>
                      {announcement.isRead && (
                        <Ionicons name="checkmark-done" size={16} color="COLORS.primary[500]" />
                      )}
                    </View>
                    {index < announcements.length - 1 && <Divider style={styles.announcementDivider} />}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={48} color={COLORS.gray[400]} />
                <Text style={styles.emptyText}>
                  Nenhum aviso no momento
                </Text>
              </View>
            )}
          </Card.Content>
        </AnimatedCard>

        {/* Ações Rápidas */}
        <AnimatedCard style={styles.card} animationType="bounceIn" delay={400}>
          <Card.Content>
            <Text style={styles.cardTitle}>Ações Rápidas</Text>
            <View style={styles.quickActions}>
              <AnimatedButton
                mode="outlined"
                icon="calendar-check"
                onPress={handleCheckIn}
                style={styles.quickActionButton}
              >
                Check-in
              </AnimatedButton>
              
              <AnimatedButton
                mode="outlined"
                icon="credit-card"
                onPress={handlePayments}
                style={styles.quickActionButton}
              >
                Pagamentos
              </AnimatedButton>
            </View>
          </Card.Content>
        </AnimatedCard>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: ResponsiveUtils?.spacing?.sm || 8,
    paddingBottom: ResponsiveUtils?.spacing?.xl || 32,
  },
  welcomeCard: {
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
    backgroundColor: COLORS.info[500],
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeText: {
    marginLeft: ResponsiveUtils?.spacing?.md || 16,
    flex: 1,
  },
  welcomeTitle: {
    color: COLORS.white,
    fontSize: ResponsiveUtils?.fontSize?.large || 20,
    fontWeight: FONT_WEIGHT.bold,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: ResponsiveUtils?.fontSize?.small || 14,
  },
  card: {
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
  },
  cardTitle: {
    fontSize: ResponsiveUtils?.fontSize?.large || 18,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: ResponsiveUtils?.spacing?.md || 12,
    color: COLORS.info[500],
  },
  graduationStatus: {
    alignItems: 'center',
  },
  graduationChip: {
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
  },
  graduationText: {
    textAlign: 'center',
    color: COLORS.text.secondary,
  },
  emptyText: {
    color: COLORS.gray[600],
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.base,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.gray[600],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  refreshButton: {
    margin: 0,
    padding: 0,
  },
  announcementsContainer: {
    maxHeight: 400,
  },
  announcementItem: {
    paddingVertical: SPACING.md,
    position: 'relative',
  },
  highPriorityAnnouncement: {
    backgroundColor: COLORS.warning[50],
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: -8,
    paddingHorizontal: SPACING.sm,
    paddingTop: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  priorityText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.warning[600],
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  announcementTitle: {
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginBottom: ResponsiveUtils?.spacing?.xs || 4,
  },
  announcementMessage: {
    color: COLORS.text.secondary,
    marginBottom: ResponsiveUtils?.spacing?.xs || 4,
  },
  announcementDate: {
    color: COLORS.gray[500],
    fontSize: ResponsiveUtils?.fontSize?.small || 12,
  },
  announcementDivider: {
    marginTop: ResponsiveUtils?.spacing?.md || 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: ResponsiveUtils?.spacing?.sm || 8,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: ResponsiveUtils?.spacing?.xs || 4,
  },
});

export default StudentDashboard;
