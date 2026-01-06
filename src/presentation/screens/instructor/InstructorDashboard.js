import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions, RefreshControl, Platform, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Card,
  Button,
  Avatar,
  Chip,
  Divider,
  Text,
  Surface,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService, academyClassService, academyStudentService, academyAnnouncementService } from '@infrastructure/services/academyFirestoreService';
import AnimatedCard from '@components/AnimatedCard';
import AnimatedButton from '@components/AnimatedButton';
import { useAnimation, ResponsiveUtils } from '@utils/animations';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@infrastructure/services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import InstructorDashboardSkeleton from '@components/skeletons/InstructorDashboardSkeleton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useOnboarding } from '@components/OnboardingTour';

const InstructorDashboard = ({ navigation }) => {
  const { user, userProfile } = useAuthFacade();
  const { getString } = useTheme();
  const { animations, startEntryAnimation } = useAnimation();
  const scrollY = new Animated.Value(0);

  const [dashboardData, setDashboardData] = useState({
    myClasses: [],
    todayClasses: [],
    totalStudents: 0,
    activeCheckIns: 0,
    recentGraduations: [],
    upcomingClasses: []
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics tracking
  useScreenTracking('InstructorDashboard', {
    academiaId: userProfile?.academiaId,
    userType: 'instructor',
    instructorId: user?.uid
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  // Onboarding
  const { startTour } = useOnboarding();

  useEffect(() => {
    loadDashboardData();
    loadAnnouncements();
    startEntryAnimation();

    // Iniciar tour após carregar dados
    const timer = setTimeout(() => {
      startTour('INSTRUCTOR_CHECKIN');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Recarregar dados sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 InstructorDashboard ganhou foco - recarregando dados...');
      loadDashboardData();
      loadAnnouncements();
    }, [])
  );

  // Carregar anúncios do Firestore com cache
  const loadAnnouncements = useCallback(async () => {
    try {
      setLoadingAnnouncements(true);

      if (!userProfile?.academiaId) {
        console.warn('⚠️ Usuário sem academiaId definido');
        setAnnouncements([]);
        return;
      }

      // Usar cache para anúncios
      const cacheKey = CACHE_KEYS.ANNOUNCEMENTS(userProfile.academiaId, 'instructor');

      const userAnnouncements = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando anúncios do instrutor (cache miss):', userProfile.academiaId);
          return await academyAnnouncementService.getActiveAnnouncements(userProfile.academiaId, 'instructor');
        },
        CACHE_TTL.SHORT // Cache por 2 minutos
      );

      // Formatar dados para exibição
      const formattedAnnouncements = userAnnouncements.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        date: formatDate(announcement.createdAt),
        priority: announcement.priority || 0
      }));

      setAnnouncements(formattedAnnouncements);

      // Track analytics
      trackFeatureUsage('instructor_announcements_loaded', {
        academiaId: userProfile.academiaId,
        announcementsCount: formattedAnnouncements.length
      });

    } catch (error) {
      console.error(getString('errorLoadingAnnouncements'), error);
      // Em caso de erro, exibe uma mensagem genérica
      setAnnouncements([{
        id: 'error',
        title: getString('errorLoadingData'),
        message: getString('couldNotLoadAnnouncements'),
        date: getString('now'),
        isError: true
      }]);
    } finally {
      setLoadingAnnouncements(false);
    }
  }, [userProfile?.academiaId, getString, trackFeatureUsage]);

  // Função para formatar a data do anúncio
  const formatDate = useCallback((date) => {
    if (!date) return getString('unknownDate');

    try {
      const now = new Date();
      const announcementDate = date.toDate ? date.toDate() : new Date(date);
      const diffTime = Math.abs(now - announcementDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return getString('today');
      if (diffDays === 1) return getString('yesterday');
      if (diffDays < 7) return getString('daysAgo').replace('{days}', diffDays);

      return announcementDate.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error(getString('errorFormattingDate'), error);
      return getString('unknownDate');
    }
  }, [getString]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Verificar se o usuário está logado
      if (!user?.uid) {
        console.warn('⚠️ Usuário não está logado ou uid não disponível');
        setLoading(false);
        return;
      }

      console.log(getString('loadingInstructorDashboard'), user.id);

      // Verificar se o usuário tem academiaId
      if (!userProfile?.academiaId) {
        console.warn('⚠️ Usuário sem academiaId definido');
        setDashboardData({
          myClasses: [],
          todayClasses: [],
          totalStudents: 0,
          activeCheckIns: 0,
          recentGraduations: [],
          upcomingClasses: []
        });
        setLoading(false);
        return;
      }

      // Buscar turmas do professor com tratamento de erro
      let instructorClasses = [];
      try {
        // Verificar se user está disponível
        if (!user?.uid || !userProfile?.academiaId) {
          console.warn('⚠️ User ou userProfile não disponível ainda');
          return;
        }

        console.log('🔍 Buscando turmas para instrutor:', user.id, 'na academia:', userProfile.academiaId);
        instructorClasses = await academyClassService.getClassesByInstructor(user.id, userProfile.academiaId, user?.email);
        console.log('✅ Turmas encontradas:', instructorClasses.length);
        if (instructorClasses.length > 0) {
          console.log('📋 Detalhes das turmas:', instructorClasses.map(c => ({
            id: c.id,
            name: c.name,
            instructorId: c.instructorId,
            instructorName: c.instructorName
          })));
        }
      } catch (classError) {
        console.error('❌ Erro ao buscar turmas:', classError);
        instructorClasses = [];
      }

      // Buscar alunos do professor com tratamento de erro
      let instructorStudents = [];
      try {
        instructorStudents = await academyStudentService.getStudentsByInstructor(user.id, userProfile.academiaId);
        console.log(getString('studentsLoaded').replace('{count}', instructorStudents.length));
      } catch (studentError) {
        console.warn(getString('errorSearchingStudents'), studentError);
        instructorStudents = [];
      }

      // Filtrar aulas de hoje
      const today = new Date().getDay();
      const todayClasses = instructorClasses.filter(classItem =>
        classItem.schedule?.some(s => s.dayOfWeek === today)
      );

      // Buscar check-ins ativos (simulado)
      const activeCheckIns = 0; // Implementar lógica real

      // Graduações recentes (simulado)
      const recentGraduations = [
        {
          studentName: 'João Silva',
          graduation: getString('blueBelt'),
          modality: getString('jiujitsu'),
          date: new Date()
        }
      ];

      // Próximas aulas
      const upcomingClasses = instructorClasses.slice(0, 3);

      setDashboardData({
        myClasses: instructorClasses,
        todayClasses,
        totalStudents: instructorStudents.length,
        activeCheckIns,
        recentGraduations,
        upcomingClasses
      });

      console.log(getString('instructorDashboardLoaded'));
    } catch (error) {
      console.error(getString('generalErrorLoadingDashboard'), error);
      // Em caso de erro total, definir dados vazios para evitar crash
      setDashboardData({
        myClasses: [],
        todayClasses: [],
        totalStudents: 0,
        activeCheckIns: 0,
        recentGraduations: [],
        upcomingClasses: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, userProfile?.academiaId, getString, trackFeatureUsage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar caches
    if (userProfile?.academiaId) {
      cacheService.invalidatePattern(`instructor_dashboard:${userProfile.academiaId}`);
      cacheService.invalidatePattern(`announcements:${userProfile.academiaId}`);
    }
    loadDashboardData();
    loadAnnouncements();
  }, [loadDashboardData, loadAnnouncements, userProfile?.academiaId]);

  const formatTime = (hour, minute = 0) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getDayName = (dayNumber) => {
    const days = [getString('sunday'), getString('monday'), getString('tuesday'), getString('wednesday'), getString('thursday'), getString('friday'), getString('saturday')];
    return days[dayNumber] || getString('notAvailable');
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

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro no InstructorDashboard:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'InstructorDashboard', academiaId: userProfile?.academiaId, instructorId: user?.uid }}
    >
      <LinearGradient
        colors={['#1E1E1E', '#121212', '#000000']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary[500]]}
                tintColor={COLORS.primary[500]}
              />
            }
          >
            {/* Header Moderno com Gradiente */}
            <Animated.View style={[headerTransform]}>
              <View style={styles.headerContainer}>
                <LinearGradient
                  colors={[COLORS.primary[500], COLORS.primary[600], COLORS.primary[700]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.headerGradient}
                >
                  <View style={styles.headerContent}>
                    <Animated.View
                      style={{
                        transform: [{ scale: animations.scaleAnim }],
                      }}
                    >
                      <Avatar.Text
                        size={ResponsiveUtils.isTablet() ? 85 : 65}
                        label={userProfile?.name?.charAt(0) || 'P'}
                        style={styles.avatar}
                      />
                    </Animated.View>
                    <View style={styles.headerText}>
                      <Text style={styles.welcomeText}>
                        {getString('hello')}, {userProfile?.name?.split(' ')[0] || 'Professor'}! 👋
                      </Text>
                      <Text style={styles.roleText}>
                        {userProfile?.specialties?.join(' • ') || getString('martialArtsInstructor')}
                      </Text>
                      <View style={styles.statusBadge}>
                        <MaterialCommunityIcons name="circle" size={8} color={COLORS.primary[500]} />
                        <Text style={styles.statusText}>{getString('online')}</Text>
                      </View>
                    </View>
                    <Animated.View style={{ opacity: animations.fadeAnim }}>
                      <MaterialCommunityIcons
                        name="account-star"
                        size={24}
                        color={COLORS.white}
                      />
                    </Animated.View>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>

            {/* Cards de Estatísticas Modernos */}
            <View style={styles.statsContainer}>
              <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                  style={styles.statGradient}
                >
                  <MaterialCommunityIcons name="school-outline" size={32} color={COLORS.primary[400]} />
                  <Text style={styles.statNumber}>{dashboardData.myClasses.length}</Text>
                  <Text style={styles.statLabel}>{getString('myClasses')}</Text>
                </LinearGradient>
              </Animated.View>

              <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                  style={styles.statGradient}
                >
                  <MaterialCommunityIcons name="account-group" size={32} color={COLORS.info[400]} />
                  <Text style={styles.statNumber}>{dashboardData.totalStudents}</Text>
                  <Text style={styles.statLabel}>{getString('totalStudents')}</Text>
                </LinearGradient>
              </Animated.View>

              <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                  style={styles.statGradient}
                >
                  <MaterialCommunityIcons name="calendar-today" size={32} color={COLORS.warning[400]} />
                  <Text style={styles.statNumber}>{dashboardData.todayClasses.length}</Text>
                  <Text style={styles.statLabel}>{getString('classesToday')}</Text>
                </LinearGradient>
              </Animated.View>

              <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                  style={styles.statGradient}
                >
                  <MaterialCommunityIcons name="check-circle" size={32} color={COLORS.secondary[400]} />
                  <Text style={styles.statNumber}>{dashboardData.activeCheckIns}</Text>
                  <Text style={styles.statLabel}>{getString('checkIns')}</Text>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Timeline de Aulas Hoje */}
            <AnimatedCard delay={200} style={styles.modernCard}>
              <Card.Content>
                <View style={styles.modernCardHeader}>
                  <View style={styles.headerIconContainer}>
                    <MaterialCommunityIcons name="clock-time-four" size={24} color={COLORS.info[400]} />
                  </View>
                  <View>
                    <Text style={styles.modernCardTitle}>{getString('todaySchedule')}</Text>
                    <Text style={styles.modernCardSubtitle}>
                      {dashboardData.todayClasses.length} {getString('classesScheduled')}
                    </Text>
                  </View>
                </View>

                {dashboardData.todayClasses.length > 0 ? (
                  <View style={styles.timelineContainer}>
                    {dashboardData.todayClasses.map((classItem, index) => (
                      <Animated.View
                        key={index}
                        style={[
                          styles.timelineItem,
                          { opacity: animations.fadeAnim }
                        ]}
                      >
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineContent}>
                          <View style={styles.timelineHeader}>
                            <Text style={styles.timelineTitle}>{classItem.name}</Text>
                            <Chip
                              mode="flat"
                              style={styles.modernChip}
                              textStyle={styles.chipText}
                            >
                              {classItem.modality}
                            </Chip>
                          </View>

                          <View style={styles.timelineDetails}>
                            <View style={styles.timelineInfo}>
                              <MaterialCommunityIcons name="clock" size={16} color={COLORS.gray[400]} />
                              <Text style={styles.timelineText}>
                                {classItem.schedule?.map(s =>
                                  `${formatTime(s.hour, s.minute)}`
                                ).join(', ')}
                              </Text>
                            </View>

                            <View style={styles.timelineInfo}>
                              <MaterialCommunityIcons name="account-multiple" size={16} color={COLORS.gray[400]} />
                              <Text style={styles.timelineText}>
                                {classItem.currentStudents || 0}/{classItem.maxCapacity || getString('notAvailable')} {getString('students')}
                              </Text>
                            </View>
                          </View>

                          <AnimatedButton
                            mode="contained"
                            onPress={() => navigation.navigate(getString('classes'), { classId: classItem.id })}
                            style={styles.timelineButton}
                            compact
                            buttonColor={COLORS.primary[600]}
                            textColor={COLORS.white}
                          >
                            {getString('manageClass')}
                          </AnimatedButton>
                        </View>
                        {index < dashboardData.todayClasses.length - 1 && (
                          <View style={styles.timelineLine} />
                        )}
                      </Animated.View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="calendar-blank" size={48} color={COLORS.gray[600]} />
                    <Text style={styles.emptyStateText}>{getString('noClassesToday')}</Text>
                    <Text style={styles.emptyStateSubtext}>{getString('planNextClasses')}</Text>
                  </View>
                )}
              </Card.Content>
            </AnimatedCard>

            {/* Ações Rápidas Modernizadas */}
            <AnimatedCard delay={300} style={styles.modernCard}>
              <Card.Content>
                <View style={styles.modernCardHeader}>
                  <View style={styles.headerIconContainer}>
                    <MaterialCommunityIcons name="lightning-bolt" size={24} color={COLORS.warning[400]} />
                  </View>
                  <View>
                    <Text style={styles.modernCardTitle}>{getString('quickActions')}</Text>
                    <Text style={styles.modernCardSubtitle}>{getString('directAccessFunctionalities')}</Text>
                  </View>
                </View>

                <View style={styles.modernQuickActions}>
                  <Animated.View style={[styles.actionCard, { opacity: animations.fadeAnim }]}>
                    <View style={styles.actionGradient}>
                      <MaterialCommunityIcons name="calendar-plus" size={28} color={COLORS.primary[400]} />
                      <Text style={styles.actionTitle}>{getString('scheduleClasses')}</Text>
                      <Text style={styles.actionSubtitle}>{getString('addClassesToYourClasses')}</Text>
                      <AnimatedButton
                        mode="contained"
                        onPress={() => {
                          if (dashboardData.classes?.length > 0) {
                            navigation.navigate('ScheduleClasses', {
                              classes: dashboardData.classes
                            });
                          } else {
                            Alert.alert(
                              getString('noClassesTitle'),
                              getString('needOneClassToSchedule'),
                              [
                                { text: getString('cancel'), style: 'cancel' },
                                { text: getString('createClassAction'), onPress: () => navigation.navigate(getString('addClassScreen')) }
                              ]
                            );
                          }
                        }}
                        style={styles.modernActionButton}
                        buttonColor={COLORS.primary[600]}
                        textColor={COLORS.white}
                        compact
                      >
                        {getString('scheduleAction')}
                      </AnimatedButton>
                    </View>
                  </Animated.View>

                  <Animated.View style={[styles.actionCard, { opacity: animations.fadeAnim }]}>
                    <View style={styles.actionGradient}>
                      <MaterialCommunityIcons name="qrcode-scan" size={28} color={COLORS.info[400]} />
                      <Text style={styles.actionTitle}>{getString('checkIn')}</Text>
                      <Text style={styles.actionSubtitle}>{getString('digitalAttendance')}</Text>
                      <AnimatedButton
                        mode="contained"
                        onPress={() => navigation.navigate('CheckIn')}
                        style={styles.modernActionButton}
                        buttonColor={COLORS.info[600]}
                        textColor={COLORS.white}
                        compact
                      >
                        {getString('open')}
                      </AnimatedButton>
                    </View>
                  </Animated.View>

                  <Animated.View style={[styles.actionCard, { opacity: animations.fadeAnim, marginTop: 10 }]}>
                    <View style={styles.actionGradient}>
                      <MaterialCommunityIcons name="chart-line" size={28} color={COLORS.secondary[400]} />
                      <Text style={styles.actionTitle}>{getString('reports')}</Text>
                      <Text style={styles.actionSubtitle}>{getString('dataAnalysis')}</Text>
                      <AnimatedButton
                        mode="contained"
                        onPress={() => navigation.navigate('Relatorios')}
                        style={styles.modernActionButton}
                        buttonColor={COLORS.secondary[600]}
                        textColor={COLORS.white}
                        compact
                      >
                        {getString('view')}
                      </AnimatedButton>
                    </View>
                  </Animated.View>
                </View>
              </Card.Content>
            </AnimatedCard>

            {/* Avisos e Comunicados */}
            <AnimatedCard delay={350} style={styles.modernCard}>
              <Card.Content>
                <View style={styles.modernCardHeader}>
                  <View style={styles.headerIconContainer}>
                    <MaterialCommunityIcons name="bullhorn" size={24} color={COLORS.error[400]} />
                  </View>
                  <View style={styles.headerTitleContainer}>
                    <Text style={styles.modernCardTitle}>{getString('announcements')}</Text>
                    <Text style={styles.modernCardSubtitle}>{getString('importantCommunications')}</Text>
                  </View>
                  <AnimatedButton
                    icon="refresh"
                    mode="text"
                    onPress={loadAnnouncements}
                    loading={loadingAnnouncements}
                    compact
                    style={styles.refreshButton}
                    textColor={COLORS.primary[400]}
                  >
                    {loadingAnnouncements ? '' : getString('update')}
                  </AnimatedButton>
                </View>

                {loadingAnnouncements ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary[400]} />
                    <Text style={styles.loadingText}>{getString('loadingAnnouncements')}</Text>
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
                            <MaterialCommunityIcons name="alert-circle" size={16} color={COLORS.warning[400]} />
                            <Text style={styles.priorityText}>{getString('important')}</Text>
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
                            <MaterialCommunityIcons name="check-all" size={16} color={COLORS.primary[400]} />
                          )}
                        </View>
                        {index < announcements.length - 1 && <Divider style={styles.announcementDivider} />}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="bell-off-outline" size={48} color={COLORS.gray[600]} />
                    <Text style={styles.emptyStateText}>{getString('noAnnouncementsNow')}</Text>
                    <Text style={styles.emptyStateSubtext}>{getString('notifyNewCommunications')}</Text>
                  </View>
                )}
              </Card.Content>
            </AnimatedCard>

            {/* Graduações Recentes */}
            <AnimatedCard delay={400} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Ionicons name="trophy-outline" size={24} color={COLORS.warning[400]} />
                  <Text style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                    {getString('recentGraduations')}
                  </Text>
                </View>

                {dashboardData.recentGraduations.length > 0 ? (
                  dashboardData.recentGraduations.map((graduation, index) => (
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
                        title={`${graduation.studentName} - ${graduation.graduation}`}
                        description={`${graduation.modality} • ${graduation.date.toLocaleDateString('pt-BR')}`}
                        titleStyle={{ fontSize: ResponsiveUtils.fontSize.medium, color: COLORS.white }}
                        descriptionStyle={{ fontSize: ResponsiveUtils.fontSize.small, color: COLORS.gray[400] }}
                        left={() => <List.Icon icon="trophy" color={COLORS.warning[400]} />}
                      />
                    </Animated.View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    {getString('noRecentGraduations')}
                  </Text>
                )}

                <AnimatedButton
                  mode="text"
                  onPress={() => {/* Implementar histórico completo */ }}
                  style={styles.viewAllButton}
                  textColor={COLORS.primary[400]}
                >
                  {getString('viewAllGraduations')}
                </AnimatedButton>
              </Card.Content>
            </AnimatedCard>

            {/* Próximas Aulas */}
            <AnimatedCard delay={500} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Ionicons name="calendar-outline" size={24} color={COLORS.warning[400]} />
                  <Text style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                    {getString('upcomingClasses')}
                  </Text>
                </View>

                {dashboardData.upcomingClasses.length > 0 ? (
                  dashboardData.upcomingClasses.map((classItem, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.upcomingClass,
                        {
                          opacity: animations.fadeAnim,
                          transform: [{
                            translateY: animations.slideAnim.interpolate({
                              inputRange: [-50, 0],
                              outputRange: [-15, 0],
                            })
                          }]
                        }
                      ]}
                    >
                      <Text style={[styles.upcomingClassName, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                        {classItem.name}
                      </Text>
                      <Text style={[styles.upcomingClassInfo, { fontSize: ResponsiveUtils.fontSize.small }]}>
                        {classItem.modality} • {classItem.schedule?.[0] ?
                          `${getDayName(classItem.schedule[0].dayOfWeek)} ${formatTime(classItem.schedule[0].hour)}`
                          : getString('scheduleNotDefined')}
                      </Text>
                      {index < dashboardData.upcomingClasses.length - 1 && (
                        <Divider style={styles.divider} />
                      )}
                    </Animated.View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    {getString('noUpcomingClasses')}
                  </Text>
                )}

                <AnimatedButton
                  mode="outlined"
                  onPress={() => navigation.navigate(getString('classes'))}
                  style={styles.viewAllButton}
                  textColor={COLORS.white}
                >
                  {getString('viewAllClasses')}
                </AnimatedButton>
              </Card.Content>
            </AnimatedCard>
          </ScrollView>
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
  // Header moderno
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerText: {
    marginLeft: ResponsiveUtils.spacing.md,
    flex: 1,
  },
  welcomeText: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  roleText: {
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

  // Cards de estatísticas modernos
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  statGradient: {
    padding: ResponsiveUtils.spacing.md,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZE.base,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  // Cards modernos (Glassmorphism)
  modernCard: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.large,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    overflow: 'hidden',
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
    marginBottom: SPACING.xs,
  },
  modernCardSubtitle: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Ações rápidas modernizadas
  modernQuickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: ResponsiveUtils.spacing.sm,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  actionGradient: {
    padding: ResponsiveUtils.spacing.md,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  actionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modernActionButton: {
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
  },

  // Timeline
  timelineContainer: {
    marginTop: ResponsiveUtils.spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary[500],
    marginTop: 6,
    marginRight: ResponsiveUtils.spacing.md,
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: ResponsiveUtils.borderRadius.medium,
    padding: ResponsiveUtils.spacing.md,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timelineTitle: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    flex: 1,
  },
  modernChip: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)', // Info color transparent
    borderColor: 'rgba(33, 150, 243, 0.3)',
    borderWidth: 1,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    color: '#64B5F6', // Lighter info color
  },
  timelineDetails: {
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  timelineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  timelineText: {
    fontSize: FONT_SIZE.base,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: SPACING.xs,
  },
  timelineButton: {
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'flex-start',
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 18,
    bottom: -ResponsiveUtils.spacing.md,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Estados vazios
  emptyState: {
    alignItems: 'center',
    padding: ResponsiveUtils.spacing.xl,
  },
  emptyStateText: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: ResponsiveUtils.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  // Estilos para avisos
  headerTitleContainer: {
    flex: 1,
  },
  refreshButton: {
    margin: SPACING.none,
    padding: SPACING.none,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: ResponsiveUtils.spacing.md,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: ResponsiveUtils.fontSize.small,
  },
  announcementsContainer: {
    maxHeight: 400,
    marginTop: ResponsiveUtils.spacing.sm,
  },
  announcementItem: {
    paddingVertical: ResponsiveUtils.spacing.sm,
    position: 'relative',
  },
  highPriorityAnnouncement: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)', // Warning color transparent
    borderRadius: ResponsiveUtils.borderRadius.small,
    marginHorizontal: -ResponsiveUtils.spacing.sm,
    paddingHorizontal: ResponsiveUtils.spacing.sm,
    paddingTop: ResponsiveUtils.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning[500],
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    paddingHorizontal: ResponsiveUtils.spacing.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'flex-start',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  priorityText: {
    fontSize: FONT_SIZE.sm,
    color: '#FFB74D', // Lighter warning color
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  announcementTitle: {
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.white,
    marginBottom: ResponsiveUtils.spacing.xs,
    fontSize: ResponsiveUtils.fontSize.medium,
  },
  announcementMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: ResponsiveUtils.spacing.xs,
    fontSize: ResponsiveUtils.fontSize.small,
    lineHeight: 20,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: ResponsiveUtils.spacing.xs,
  },
  announcementDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: ResponsiveUtils.fontSize.small,
  },
  announcementDivider: {
    marginTop: ResponsiveUtils.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Estilos legados mantidos para compatibilidade (atualizados para dark)
  card: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.sm,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  cardTitle: {
    marginLeft: ResponsiveUtils.spacing.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: ResponsiveUtils.spacing.xs,
    color: COLORS.white,
  },
  classItem: {
    marginBottom: ResponsiveUtils.spacing.md,
    padding: ResponsiveUtils.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: ResponsiveUtils.borderRadius.small,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  className: {
    fontWeight: FONT_WEIGHT.bold,
    flex: 1,
    color: COLORS.white,
  },
  modalityChip: {
    marginLeft: ResponsiveUtils.spacing.sm,
  },
  classDetails: {
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  classTime: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  classCapacity: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  classButton: {
    marginTop: ResponsiveUtils.spacing.sm,
  },
  quickActions: {
    flexDirection: ResponsiveUtils.isTablet() ? 'row' : 'column',
    justifyContent: 'space-between',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  quickActionButton: {
    flex: ResponsiveUtils.isTablet() ? 1 : undefined,
    marginHorizontal: ResponsiveUtils.isTablet() ? ResponsiveUtils.spacing.xs : 0,
    marginBottom: ResponsiveUtils.isTablet() ? 0 : ResponsiveUtils.spacing.sm,
  },
  logoutContainer: {
    marginTop: ResponsiveUtils.spacing.lg,
    alignItems: 'center',
  },
  logoutButton: {
    width: ResponsiveUtils.isTablet() ? '40%' : '60%',
    borderColor: COLORS.error[500],
  },
  upcomingClass: {
    marginBottom: ResponsiveUtils.spacing.sm,
    padding: ResponsiveUtils.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: ResponsiveUtils.borderRadius.small,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning[500],
  },
  upcomingClassName: {
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: ResponsiveUtils.spacing.xs,
    color: COLORS.white,
  },
  upcomingClassInfo: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
    marginVertical: ResponsiveUtils.spacing.md,
  },
  divider: {
    marginVertical: ResponsiveUtils.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewAllButton: {
    marginTop: ResponsiveUtils.spacing.sm,
  },
});

export default InstructorDashboard;
