
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, Animated, Dimensions, Platform, TouchableOpacity } from 'react-native';
import {
  Card,
  Button,
  Avatar,
  Text,
  List,
  Modal,
  Portal,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeIonicons, SafeMaterialCommunityIcons } from '@components/SafeIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import AnimatedCard from '@components/AnimatedCard';
import AnimatedButton from '@components/AnimatedButton';
import { useAnimation, ResponsiveUtils } from '@utils/animations';
import QRCodeGenerator from '@components/QRCodeGenerator';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@infrastructure/services/cacheService';
import batchFirestoreService from '@infrastructure/services/batchFirestoreService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import DashboardSkeleton from '@components/skeletons/DashboardSkeleton';
import FreeGymScheduler from '@components/FreeGymScheduler';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useOnboarding } from '@components/OnboardingTour';
import { getString } from "@utils/theme";

const AdminDashboard = ({ navigation }) => {
  const { user, userProfile, logout, academia } = useAuthFacade();
  const { animations, startEntryAnimation } = useAnimation();
  const scrollY = new Animated.Value(0);

  // Analytics tracking
  useScreenTracking('AdminDashboard', {
    academiaId: userProfile?.academiaId,
    userType: userProfile?.userType
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalClasses: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    recentActivities: [],
    quickStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [classes, setClasses] = useState([]);

  // Skeleton pulse for loading state
  const [skeletonPulse] = useState(new Animated.Value(0.6));

  // Onboarding
  const { startTour } = useOnboarding();

  useEffect(() => {
    loadDashboardData();
    startEntryAnimation();

    // Iniciar tour após carregar dados
    const timer = setTimeout(() => {
      startTour('ADMIN_DASHBOARD');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonPulse, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(skeletonPulse, { toValue: 0.6, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
        ])
      ).start();
    }
  }, [loading]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar todos os alunos da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }

      // Usar cache inteligente para carregar dados do dashboard
      const cacheKey = CACHE_KEYS.DASHBOARD(academiaId);

      const dashboardStats = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando dados do dashboard (cache miss):', academiaId);

          // Usar batch processing para carregar múltiplas coleções
          const [students, classes, payments, instructors] = await Promise.all([
            academyFirestoreService.getAll('students', academiaId),
            academyFirestoreService.getAll('classes', academiaId),
            academyFirestoreService.getAll('payments', academiaId),
            academyFirestoreService.getAll('instructors', academiaId)
          ]);

          // Salvar classes no estado para o calendário
          setClasses(classes);

          const activeStudents = students.filter(s => s.isActive !== false);

          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();

          const monthlyPayments = payments.filter(p => {
            const paymentDate = new Date(p.createdAt?.seconds ? p.createdAt.seconds * 1000 : p.createdAt);
            return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
          });

          const pendingPayments = payments.filter(p => p.status === 'pending').length;
          const overduePayments = payments.filter(p => p.status === 'overdue').length;

          const monthlyRevenue = monthlyPayments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

          // Buscar atividades recentes (simulado - em produção viria do Firestore)
          const recentActivities = [
            {
              type: 'new_student',
              message: getString('newStudentRegistered'),
              time: `2 ${getString('hoursAgo')}`,
              icon: 'person-add'
            },
            {
              type: 'payment',
              message: getString('paymentReceived'),
              time: `4 ${getString('hoursAgo')}`,
              icon: 'card'
            },
            {
              type: 'graduation',
              message: getString('graduationRegistered'),
              time: `1 ${getString('daysAgo')}`,
              icon: 'trophy'
            }
          ];

          return {
            totalStudents: students.length,
            activeStudents: activeStudents.length,
            totalClasses: classes.length,
            monthlyRevenue,
            pendingPayments,
            overduePayments,
            recentActivities,
            quickStats: {
              instructors: instructors.length,
              modalities: [...new Set(classes.map(c => c.modality))].length
            }
          };
        },
        CACHE_TTL.SHORT // Cache por 2 minutos (dados do dashboard mudam frequentemente)
      );

      setDashboardData(dashboardStats);
      console.log('✅ Dashboard carregado com sucesso');

      // Track analytics
      trackFeatureUsage('dashboard_loaded', {
        totalStudents: dashboardStats.totalStudents,
        totalClasses: dashboardStats.totalClasses,
        academiaId
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard admin:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.academiaId, academia?.id, trackFeatureUsage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache do dashboard para forçar refresh
    const academiaId = userProfile?.academiaId || academia?.id;
    if (academiaId) {
      cacheService.invalidatePattern(`dashboard:${academiaId}`);
    }
    loadDashboardData();
  }, [loadDashboardData, userProfile?.academiaId, academia?.id]);

  const handleLogout = useCallback(async () => {
    try {
      trackButtonClick('logout');
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [logout, trackButtonClick]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: getString('currency')
    }).format(value || 0);
  };

  const getActivityIcon = (type) => {
    const icons = {
      checkin: 'account-check',
      payment: 'cash',
      graduation: 'medal',
      class: 'school',
      fallback: 'information'
    };
    return icons[type] || icons.fallback;
  };

  const getActivityColor = (type) => {
    const colors = {
      'new_student': COLORS.primary[500],
      'payment': COLORS.info[500],
      'graduation': COLORS.warning[300],
      'class': COLORS.warning[500],
      'announcement': COLORS.secondary[500]
    };
    return colors[type] || COLORS.gray[500];
  };

  const headerTransform = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [0, -20],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  // Memoized navigation handlers
  const handleNavigateToStudents = useCallback(() => {
    trackButtonClick('navigate_students');
    navigation.navigate('Students');
  }, [navigation, trackButtonClick]);

  const handleNavigateToClasses = useCallback(() => {
    trackButtonClick('navigate_classes');
    navigation.navigate('Classes');
  }, [navigation, trackButtonClick]);

  const handleNavigateToManagement = useCallback(() => {
    trackButtonClick('navigate_management');
    navigation.navigate('Management');
  }, [navigation, trackButtonClick]);

  const handleShowCalendar = useCallback(() => {
    trackButtonClick('show_calendar_modal');
    setShowCalendarModal(true);
  }, [trackButtonClick]);

  const handleShowQR = useCallback(() => {
    console.log('🔍 Abrindo QR Code - Academia:', academia);
    console.log('🔍 UserProfile academiaId:', userProfile?.academiaId);
    trackButtonClick('show_qr_code');
    setShowQRModal(true);
  }, [trackButtonClick, academia, userProfile]);

  // Render skeletons while loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro no AdminDashboard:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'AdminDashboard', academiaId: userProfile?.academiaId }}
    >
      <LinearGradient
        colors={['#1E1E1E', '#121212', '#000000']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
          {/* Modal Calendário */}
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
                    console.log('🚀 Botão criar turma clicado no AdminDashboard');
                    setShowCalendarModal(false);
                    console.log('📱 Navegando para AddClass...');
                    navigation.navigate('addClassScreen');
                  }}
                  navigation={navigation}
                />
              </View>
            </Modal>

            {/* Modal QR Code */}
            <Modal
              visible={showQRModal}
              onDismiss={() => setShowQRModal(false)}
              contentContainerStyle={styles.modalContainer}
            >
              {(academia?.id || userProfile?.academiaId) ? (
                <QRCodeGenerator
                  academiaId={academia?.id || userProfile?.academiaId}
                  academiaNome={academia?.nome || getString('academy')}
                  academiaCodigo={academia?.codigo}
                  size={250}
                  showActions={true}
                />
              ) : (
                <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
                  <Text style={{ color: COLORS.gray[500], textAlign: 'center' }}>
                    {getString('loadingAcademyInfo')}
                  </Text>
                </View>
              )}
            </Modal>
          </Portal>

          <Animated.ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.white} />
            }
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: Platform.OS !== 'web' }
            )}
            scrollEventThrottle={16}
          >
            {/* Header moderno com gradiente */}
            <Animated.View style={[headerTransform]}>
              <View style={styles.headerContainer}>
                <LinearGradient
                  colors={[COLORS.primary[600], COLORS.primary[800]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.headerGradient}
                >
                  <View style={styles.headerContentModern}>
                    <Animated.View style={{ transform: [{ scale: animations.scaleAnim }] }}>
                      <Avatar.Text
                        size={ResponsiveUtils.isTablet() ? 85 : 65}
                        label={userProfile?.name?.charAt(0) || 'A'}
                        style={styles.avatarModern}
                        color={COLORS.white}
                      />
                    </Animated.View>
                    <View style={styles.headerTextModern}>
                      <Text style={styles.welcomeTextModern}>
                        {getString('hello')}, {userProfile?.name?.split(' ')[0] || getString('admin')}! 👋
                      </Text>
                      <Text style={styles.roleTextModern}>
                        {getString('academyAdministrator')}
                      </Text>
                      <View style={styles.statusBadge}>
                        <SafeMaterialCommunityIcons name="circle" size={8} color={COLORS.success[400]} />
                        <Text style={styles.statusText}>{getString('online')}</Text>
                      </View>
                      {/* Código da Academia */}
                      {academia?.codigo && (
                        <TouchableOpacity
                          style={styles.academiaCodeContainer}
                          onPress={handleShowQR}
                        >
                          <SafeMaterialCommunityIcons name="qrcode" size={16} color={COLORS.white + 'E6'} />
                          <Text style={styles.academiaCodeText}>
                            {getString('code')}: {academia.codigo}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Animated.View style={{ opacity: animations.fadeAnim }}>
                      <TouchableOpacity onPress={handleShowQR}>
                        <SafeMaterialCommunityIcons
                          name="qrcode-scan"
                          size={24}
                          color={COLORS.white + 'D9'}
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>

            {/* Estatísticas principais em cards com gradiente */}
            <View style={styles.statsContainer}>
              <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient colors={['rgba(33, 150, 243, 0.8)', 'rgba(33, 150, 243, 0.4)']} style={styles.statGradient}>
                  <SafeMaterialCommunityIcons name="account-group" size={32} color={COLORS.white} />
                  <Text style={styles.statNumberModern}>{dashboardData.totalStudents}</Text>
                  <Text style={styles.statLabelModern}>{getString('totalStudents')}</Text>
                </LinearGradient>
              </Animated.View>

              <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient colors={['rgba(76, 175, 80, 0.8)', 'rgba(76, 175, 80, 0.4)']} style={styles.statGradient}>
                  <SafeMaterialCommunityIcons name="account-check" size={32} color={COLORS.white} />
                  <Text style={styles.statNumberModern}>{dashboardData.activeStudents}</Text>
                  <Text style={styles.statLabelModern}>{getString('activeStudents')}</Text>
                </LinearGradient>
              </Animated.View>

              <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient colors={['rgba(255, 152, 0, 0.8)', 'rgba(255, 152, 0, 0.4)']} style={styles.statGradient}>
                  <SafeMaterialCommunityIcons name="school-outline" size={32} color={COLORS.white} />
                  <Text style={styles.statNumberModern}>{dashboardData.totalClasses}</Text>
                  <Text style={styles.statLabelModern}>{getString('classes')}</Text>
                </LinearGradient>
              </Animated.View>

              <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient colors={['rgba(156, 39, 176, 0.8)', 'rgba(156, 39, 176, 0.4)']} style={styles.statGradient}>
                  <SafeMaterialCommunityIcons name="cash-multiple" size={32} color={COLORS.white} />
                  <Text style={styles.statNumberModern}>{dashboardData.pendingPayments}</Text>
                  <Text style={styles.statLabelModern}>{getString('pendingPaymentsCount')}</Text>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Financeiro */}
            <AnimatedCard delay={200} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <SafeIonicons name="cash-outline" size={24} color={COLORS.success[400]} />
                  <Text style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                    {getString('monthlyFinancials')}
                  </Text>
                </View>

                <View style={styles.financialInfo}>
                  <Animated.View
                    style={[
                      styles.revenueItem,
                      {
                        opacity: animations.fadeAnim,
                        transform: [{ translateY: animations.slideAnim }],
                      }
                    ]}
                  >
                    <Text style={[styles.revenueLabel, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                      {getString('monthlyRevenue')}
                    </Text>
                    <Text style={[styles.revenueValue, { fontSize: ResponsiveUtils.fontSize.extraLarge }]}>
                      {formatCurrency(dashboardData.monthlyRevenue)}
                    </Text>
                  </Animated.View>

                  <Divider style={styles.divider} />

                  <View style={styles.paymentsRow}>
                    <View style={styles.paymentItem}>
                      <Text style={[styles.paymentNumber, { fontSize: ResponsiveUtils.fontSize.large }]}>
                        {dashboardData.pendingPayments}
                      </Text>
                      <Text style={[styles.paymentLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                        {getString('pendingCount')}
                      </Text>
                    </View>

                    <View style={styles.paymentItem}>
                      <Text style={[
                        styles.paymentNumber,
                        {
                          color: COLORS.error[400],
                          fontSize: ResponsiveUtils.fontSize.large
                        }
                      ]}>
                        {dashboardData.overduePayments}
                      </Text>
                      <Text style={[styles.paymentLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                        {getString('overdueCount')}
                      </Text>
                    </View>
                  </View>
                </View>

                <AnimatedButton
                  mode="outlined"
                  onPress={handleNavigateToManagement}
                  style={styles.viewReportsButton}
                  icon="chart-line"
                  textColor={COLORS.white}
                >
                  {getString('accessManagementReports')}
                </AnimatedButton>
              </Card.Content>
            </AnimatedCard>

            {/* Ações Rápidas modernas */}
            <AnimatedCard delay={300} style={styles.modernCard}>
              <Card.Content>
                <View style={styles.modernCardHeader}>
                  <View style={styles.headerIconContainer}>
                    <SafeMaterialCommunityIcons name="lightning-bolt" size={24} color={COLORS.warning[400]} />
                  </View>
                  <View>
                    <Text style={styles.modernCardTitle}>{getString('quickActions')}</Text>
                    <Text style={styles.modernCardSubtitle}>{getString('quickActionsSubtitle')}</Text>
                  </View>
                </View>

                <View style={styles.modernQuickActions}>
                  {
                    [
                      { key: 'students', title: getString('students'), subtitle: getString('manageStudentsSubtitle'), icon: 'account-group', colors: ['rgba(33, 150, 243, 0.8)', 'rgba(33, 150, 243, 0.4)'], onPress: handleNavigateToStudents },
                      { key: 'classes', title: getString('classes'), subtitle: getString('manageClassesSubtitle'), icon: 'school', colors: ['rgba(76, 175, 80, 0.8)', 'rgba(76, 175, 80, 0.4)'], onPress: handleNavigateToClasses },
                      { key: 'calendar', title: getString('calendar'), subtitle: getString('viewSchedule'), icon: 'calendar-month', colors: ['rgba(156, 39, 176, 0.8)', 'rgba(156, 39, 176, 0.4)'], onPress: handleShowCalendar },
                      { key: 'settings', title: getString('settings'), subtitle: getString('settingsManagement'), icon: 'cog', colors: ['rgba(255, 152, 0, 0.8)', 'rgba(255, 152, 0, 0.4)'], onPress: handleNavigateToManagement },
                    ].map((action, idx) => (
                      <Animated.View key={action.key} style={[styles.actionCard, { opacity: animations.fadeAnim, width: ResponsiveUtils.isTablet() ? '31%' : '48%' }]}>
                        <LinearGradient colors={action.colors} style={styles.actionGradient}>
                          <SafeMaterialCommunityIcons name={action.icon} size={28} color={COLORS.white} />
                          <Text style={styles.actionTitle}>{action.title}</Text>
                          <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                          <AnimatedButton
                            mode="contained"
                            onPress={action.onPress}
                            style={styles.modernActionButton}
                            buttonColor={'rgba(255, 255, 255, 0.2)'}
                            textColor={COLORS.white}
                            compact
                          >
                            {getString('open')}
                          </AnimatedButton>
                        </LinearGradient>
                      </Animated.View>
                    ))}
                </View>
              </Card.Content>
            </AnimatedCard>

            {/* Atividades Recentes */}
            <AnimatedCard delay={400} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <SafeIonicons name="time-outline" size={24} color={COLORS.gray[400]} />
                  <Text style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                    {getString('recentActivities')}
                  </Text>
                </View>

                {dashboardData.recentActivities.map((activity, index) => (
                  <Animated.View
                    key={index}
                    style={{
                      opacity: animations.fadeAnim,
                      transform: [{
                        translateX: animations.slideAnim.interpolate({
                          inputRange: [-50, 0],
                          outputRange: [-30, 0],
                        })
                      }]
                    }}
                  >
                    <List.Item
                      title={activity.message}
                      description={activity.time}
                      titleStyle={{ fontSize: ResponsiveUtils.fontSize.medium, color: COLORS.white }}
                      descriptionStyle={{ fontSize: ResponsiveUtils.fontSize.small, color: COLORS.gray[400] }}
                      left={() => (
                        <List.Icon
                          icon={getActivityIcon(activity.type)}
                          color={getActivityColor(activity.type)}
                        />
                      )}
                    />
                    {index < dashboardData.recentActivities.length - 1 && <Divider style={styles.divider} />}
                  </Animated.View>
                ))}

                <AnimatedButton
                  mode="text"
                  onPress={() => {/* Implementar histórico completo */ }}
                  style={styles.viewAllButton}
                  textColor={COLORS.primary[400]}
                >
                  {getString('viewAllActivities')}
                </AnimatedButton>
              </Card.Content>
            </AnimatedCard>

            {/* Alertas e Notificações */}
            {(dashboardData.overduePayments > 0 || dashboardData.pendingPayments > 5) && (
              <AnimatedCard delay={500} style={[styles.card, styles.alertCard]}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <SafeIonicons name="warning-outline" size={24} color={COLORS.warning[400]} />
                    <Text style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                      {getString('alerts')}
                    </Text>
                  </View>

                  {dashboardData.overduePayments > 0 && (
                    <Text style={[styles.alertText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                      • {dashboardData.overduePayments} {getString('paymentsOverdue')}
                    </Text>
                  )}

                  {dashboardData.pendingPayments > 5 && (
                    <Text style={[styles.alertText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                      • {getString('manyPendingPayments')} ({dashboardData.pendingPayments})
                    </Text>
                  )}
                </Card.Content>
              </AnimatedCard>
            )}
          </Animated.ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background for glassmorphism
  },
  scrollView: {
    flex: 1,
  },
  // Header
  headerContainer: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.lg,
    borderRadius: ResponsiveUtils.borderRadius.large,
    overflow: 'hidden',
    ...ResponsiveUtils.elevation,
  },
  headerGradient: {
    padding: ResponsiveUtils.spacing.lg,
  },
  headerContentModern: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarModern: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTextModern: {
    marginLeft: ResponsiveUtils.spacing.md,
    flex: 1,
  },
  welcomeTextModern: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  roleTextModern: {
    fontSize: ResponsiveUtils.fontSize.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  academiaCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  academiaCodeText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.xs,
    fontFamily: 'monospace',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.md,
  },
  statCard: {
    width: '48%',
    marginBottom: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    overflow: 'hidden',
    // Glassmorphism
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    // Elevação para profundidade
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statGradient: {
    padding: ResponsiveUtils.spacing.md,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  statNumberModern: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  statLabelModern: {
    fontSize: FONT_SIZE.base,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  // Cards
  card: {
    margin: ResponsiveUtils.spacing.md,
    marginTop: ResponsiveUtils.spacing.sm,
    // Glassmorphism
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: ResponsiveUtils.borderRadius.large,
    // Elevação
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modernCard: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.md,
    // Glassmorphism
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: ResponsiveUtils.borderRadius.large,
    // Elevação
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  cardTitle: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginLeft: ResponsiveUtils.spacing.sm,
  },
  modernCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ResponsiveUtils.spacing.md,
  },
  modernCardTitle: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginBottom: 2,
  },
  modernCardSubtitle: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  // Actions
  modernQuickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionCard: {
    borderRadius: ResponsiveUtils.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: 10,
  },
  actionGradient: {
    padding: ResponsiveUtils.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
  },
  actionTitle: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  modernActionButton: {
    width: '100%',
    marginTop: 'auto',
  },
  // Financial
  financialInfo: {
    marginBottom: SPACING.md,
  },
  revenueItem: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  revenueLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.xs,
  },
  revenueValue: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.md,
  },
  paymentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  paymentItem: {
    alignItems: 'center',
  },
  paymentNumber: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  paymentLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: SPACING.xs,
  },
  viewReportsButton: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  // Activities
  viewAllButton: {
    marginTop: SPACING.sm,
  },
  // Alerts
  alertCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)', // Orange tint
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  alertText: {
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  // Modals
  calendarModalContainer: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    borderRadius: BORDER_RADIUS.lg,
    height: '80%',
    overflow: 'hidden',
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  calendarModalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  calendarContainer: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
});


export default AdminDashboard;
