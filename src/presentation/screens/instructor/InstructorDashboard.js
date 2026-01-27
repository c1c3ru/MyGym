import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Animated,
  RefreshControl,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Avatar,
  Chip,
  Divider,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthFacade } from "@presentation/auth/AuthFacade";
import { useTheme } from "@contexts/ThemeContext";
import {
  academyFirestoreService,
  academyClassService,
  academyStudentService,
  academyAnnouncementService,
} from "@infrastructure/services/academyFirestoreService";
import AnimatedButton from "@components/AnimatedButton";
import { useAnimation, ResponsiveUtils } from "@utils/animations";
import EnhancedErrorBoundary from "@components/EnhancedErrorBoundary";
import cacheService, {
  CACHE_KEYS,
  CACHE_TTL,
} from "@infrastructure/services/cacheService";
import { useScreenTracking, useUserActionTracking } from "@hooks/useAnalytics";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  FONT_WEIGHT,
  OPACITY,
  GLASS,
} from "@presentation/theme/designTokens";
import { getDayNames } from "@shared/utils/dateHelpers";
import { hexToRgba } from "@shared/utils/colorUtils";
import { useOnboarding } from "@components/OnboardingTour";
import { useProfileTheme } from "../../../contexts/ProfileThemeContext";
import GlassCard from "@components/GlassCard";
import SectionHeader from "@components/SectionHeader";
import IconContainer from "@components/IconContainer";

const InstructorDashboard = ({ navigation }) => {
  const { theme: profileTheme } = useProfileTheme(); // 🎨 Tema Roxo/Verde
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
    upcomingClasses: [],
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Analytics tracking
  useScreenTracking("InstructorDashboard", {
    academiaId: userProfile?.academiaId,
    userType: "instructor",
    instructorId: user?.uid,
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
      startTour("INSTRUCTOR_CHECKIN");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Recarregar dados sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 InstructorDashboard ganhou foco - recarregando dados...");
      loadDashboardData();
      loadAnnouncements();
    }, []),
  );

  // Carregar anúncios do Firestore com cache
  const loadAnnouncements = useCallback(async () => {
    try {
      setLoadingAnnouncements(true);

      if (!userProfile?.academiaId) {
        console.warn("⚠️ Usuário sem academiaId definido");
        setAnnouncements([]);
        return;
      }

      // Usar cache para anúncios
      const cacheKey = CACHE_KEYS.ANNOUNCEMENTS(
        userProfile.academiaId,
        "instructor",
      );

      const userAnnouncements = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log(
            "🔍 Buscando anúncios do instrutor (cache miss):",
            userProfile.academiaId,
          );
          return await academyAnnouncementService.getActiveAnnouncements(
            userProfile.academiaId,
            "instructor",
          );
        },
        CACHE_TTL.SHORT, // Cache por 2 minutos
      );

      // Formatar dados para exibição
      const formattedAnnouncements = userAnnouncements.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        date: formatDate(announcement.createdAt),
        priority: announcement.priority || 0,
      }));

      setAnnouncements(formattedAnnouncements);

      // Track analytics
      trackFeatureUsage("instructor_announcements_loaded", {
        academiaId: userProfile.academiaId,
        announcementsCount: formattedAnnouncements.length,
      });
    } catch (error) {
      console.error(getString("errorLoadingAnnouncements"), error);
      // Em caso de erro, exibe uma mensagem genérica
      setAnnouncements([
        {
          id: "error",
          title: getString("errorLoadingData"),
          message: getString("couldNotLoadAnnouncements"),
          date: getString("now"),
          isError: true,
        },
      ]);
    } finally {
      setLoadingAnnouncements(false);
    }
  }, [userProfile?.academiaId, getString, trackFeatureUsage]);

  // Função para abrir detalhes do aviso
  const handleAnnouncementPress = useCallback((announcement) => {
    setSelectedAnnouncement(announcement);
    setShowAnnouncementModal(true);
    trackButtonClick('view_announcement', { announcementId: announcement.id });
  }, [trackButtonClick]);

  // Função para excluir aviso
  const handleDeleteAnnouncement = useCallback(async (announcementId) => {
    try {
      Alert.alert(
        getString('confirmDelete'),
        getString('confirmDeleteAnnouncement').replace('{title}', selectedAnnouncement?.title || ''),
        [
          {
            text: getString('cancel'),
            style: 'cancel'
          },
          {
            text: getString('delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await academyAnnouncementService.deleteAnnouncement(
                  announcementId,
                  userProfile.academiaId
                );

                // Atualizar lista
                setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
                setShowAnnouncementModal(false);

                // Invalidar cache
                if (userProfile?.academiaId) {
                  cacheService.invalidatePattern(`announcements:${userProfile.academiaId}`);
                }

                Alert.alert(getString('success'), getString('announcementDeletedSuccess'));
              } catch (error) {
                console.error('Erro ao excluir aviso:', error);
                Alert.alert(getString('error'), getString('deleteError'));
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao preparar exclusão:', error);
    }
  }, [selectedAnnouncement, userProfile?.academiaId, getString, trackButtonClick]);

  // Função para formatar a data do anúncio
  const formatDate = useCallback(
    (date) => {
      if (!date) return getString("unknownDate");

      try {
        const now = new Date();
        const announcementDate = date.toDate ? date.toDate() : new Date(date);
        const diffTime = Math.abs(now - announcementDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return getString("today");
        if (diffDays === 1) return getString("yesterday");
        if (diffDays < 7)
          return getString("daysAgo").replace("{days}", diffDays);

        return announcementDate.toLocaleDateString("pt-BR");
      } catch (error) {
        console.error(getString("errorFormattingDate"), error);
        return getString("unknownDate");
      }
    },
    [getString],
  );

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Verificar se o usuário está logado
      if (!user?.uid) {
        console.warn("⚠️ Usuário não está logado ou uid não disponível");
        setLoading(false);
        return;
      }

      console.log(getString("loadingInstructorDashboard"), user.id);

      // Verificar se o usuário tem academiaId
      if (!userProfile?.academiaId) {
        console.warn("⚠️ Usuário sem academiaId definido");
        setDashboardData({
          myClasses: [],
          todayClasses: [],
          totalStudents: 0,
          activeCheckIns: 0,
          recentGraduations: [],
          upcomingClasses: [],
        });
        setLoading(false);
        return;
      }

      // Buscar turmas do professor com tratamento de erro
      let instructorClasses = [];
      try {
        // Verificar se user está disponível
        if (!user?.uid || !userProfile?.academiaId) {
          console.warn("⚠️ User ou userProfile não disponível ainda");
          return;
        }

        console.log(
          "🔍 Buscando turmas para instrutor:",
          user.id,
          "na academia:",
          userProfile.academiaId,
        );
        instructorClasses = await academyClassService.getClassesByInstructor(
          user.id,
          userProfile.academiaId,
          user?.email,
        );
        console.log("✅ Turmas encontradas:", instructorClasses.length);
        if (instructorClasses.length > 0) {
          console.log(
            "📋 Detalhes das turmas:",
            instructorClasses.map((c) => ({
              id: c.id,
              name: c.name,
              instructorId: c.instructorId,
              instructorName: c.instructorName,
            })),
          );
        }
      } catch (classError) {
        console.error("❌ Erro ao buscar turmas:", classError);
        instructorClasses = [];
      }

      // Buscar alunos do professor com tratamento de erro
      let instructorStudents = [];
      try {
        instructorStudents =
          await academyStudentService.getStudentsByInstructor(
            user.id,
            userProfile.academiaId,
          );
        console.log(
          getString("studentsLoaded").replace(
            "{count}",
            instructorStudents.length,
          ),
        );
      } catch (studentError) {
        console.warn(getString("errorSearchingStudents"), studentError);
        instructorStudents = [];
      }

      // Filtrar aulas de hoje
      const today = new Date().getDay();
      const todayClasses = instructorClasses.filter((classItem) =>
        classItem.schedule?.some((s) => s.dayOfWeek === today),
      );

      // Buscar check-ins ativos (hoje)
      let activeCheckIns = 0;
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const allCheckIns = await academyFirestoreService.getAll('checkIns', userProfile.academiaId);
        activeCheckIns = allCheckIns.filter(checkIn => {
          const checkInDate = checkIn.timestamp?.toDate ? checkIn.timestamp.toDate() : new Date(checkIn.timestamp);
          return checkInDate >= todayStart;
        }).length;
      } catch (checkInError) {
        console.warn('⚠️ Erro ao buscar check-ins:', checkInError);
        activeCheckIns = 0;
      }

      // Graduações recentes (últimos 30 dias)
      let recentGraduations = [];
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const allGraduations = await academyFirestoreService.getAll('graduations', userProfile.academiaId);
        recentGraduations = allGraduations
          .filter(grad => {
            const gradDate = grad.date?.toDate ? grad.date.toDate() : new Date(grad.date);
            return gradDate >= thirtyDaysAgo;
          })
          .sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateB - dateA;
          })
          .slice(0, 5)
          .map(grad => ({
            studentName: grad.studentName || getString('unknownStudent'),
            graduation: grad.belt || grad.graduation || getString('notSpecified'),
            modality: grad.modality || getString('notSpecified'),
            date: grad.date?.toDate ? grad.date.toDate() : new Date(grad.date)
          }));
      } catch (gradError) {
        console.warn('⚠️ Erro ao buscar graduações:', gradError);
        recentGraduations = [];
      }

      // Próximas aulas
      const upcomingClasses = instructorClasses.slice(0, 3);

      setDashboardData({
        myClasses: instructorClasses,
        todayClasses,
        totalStudents: instructorStudents.length,
        activeCheckIns,
        recentGraduations,
        upcomingClasses,
      });

      console.log(getString("instructorDashboardLoaded"));
    } catch (error) {
      console.error(getString("generalErrorLoadingDashboard"), error);
      // Em caso de erro total, definir dados vazios para evitar crash
      setDashboardData({
        myClasses: [],
        todayClasses: [],
        totalStudents: 0,
        activeCheckIns: 0,
        recentGraduations: [],
        upcomingClasses: [],
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
      cacheService.invalidatePattern(
        `instructor_dashboard:${userProfile.academiaId}`,
      );
      cacheService.invalidatePattern(`announcements:${userProfile.academiaId}`);
    }
    loadDashboardData();
    loadAnnouncements();
  }, [loadDashboardData, loadAnnouncements, userProfile?.academiaId]);

  const formatTime = (hour, minute = 0) => {
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  };

  const getDayName = (dayNumber) => {
    const days = getDayNames(getString);
    return days[dayNumber] || getString("notAvailable");
  };

  const headerTransform = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [0, -20],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error("🚨 Erro no InstructorDashboard:", {
          error,
          errorInfo,
          errorId,
        });
      }}
      errorContext={{
        screen: "InstructorDashboard",
        academiaId: userProfile?.academiaId,
        instructorId: user?.uid,
      }}
    >
      <LinearGradient
        colors={COLORS.gradients.deepPurple}
        locations={[0, 0.4, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView
          style={[styles.container, { backgroundColor: "transparent" }]}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false },
            )}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[profileTheme.primary[400]]}
                tintColor={profileTheme.primary[400]}
                progressBackgroundColor={COLORS.gray[900]}
              />
            }
            contentContainerStyle={{ paddingBottom: SPACING.xl }}
          >
            {/* Header Moderno com Gradiente */}
            <Animated.View style={[headerTransform]}>
              <View style={styles.headerContainer}>
                <LinearGradient
                  colors={[
                    profileTheme.primary[500],
                    profileTheme.primary[600],
                    profileTheme.primary[700],
                  ]}
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
                        label={userProfile?.name?.charAt(0) || "P"}
                        style={styles.avatar}
                      />
                    </Animated.View>
                    <View style={styles.headerText}>
                      <Text style={[styles.welcomeText, { color: profileTheme.text.primary }]}>
                        {getString("hello")},{" "}
                        {userProfile?.name?.split(" ")[0] || "Professor"}! 👋
                      </Text>
                      <Text style={[styles.roleText, { color: profileTheme.text.secondary }]}>
                        {userProfile?.specialties?.join(" • ") ||
                          getString("martialArtsInstructor")}
                      </Text>
                      <View style={styles.statusBadge}>
                        <MaterialCommunityIcons
                          name="circle"
                          size={8}
                          color={profileTheme.primary[500]}
                        />
                        <Text style={[styles.statusText, { color: profileTheme.text.primary }]}>
                          {getString("online")}
                        </Text>
                      </View>
                    </View>
                    <Animated.View style={{ opacity: animations.fadeAnim }}>
                      <MaterialCommunityIcons
                        name="account-star"
                        size={24}
                        color={profileTheme.text.primary}
                      />
                    </Animated.View>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>

            {/* Cards de Estatísticas Modernos */}
            <View style={styles.statsContainer}>
              <Animated.View style={{ width: '48%', opacity: animations.fadeAnim }}>
                <GlassCard
                  style={styles.glassStatCard}
                  variant="subtle"
                  padding={SPACING.md}
                  marginBottom={SPACING.md}
                >
                  <View style={styles.statContent}>
                    <IconContainer
                      icon="school-outline"
                      color={profileTheme.primary[400]}
                      size={24}
                      containerSize={40}
                    />
                    <Text style={[styles.statNumber, { color: profileTheme.text.primary }]}>
                      {dashboardData.myClasses.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: profileTheme.text.secondary }]}>{getString("myClasses")}</Text>
                  </View>
                </GlassCard>
              </Animated.View>

              <Animated.View style={{ width: '48%', opacity: animations.fadeAnim }}>
                <GlassCard
                  style={styles.glassStatCard}
                  variant="subtle"
                  padding={SPACING.md}
                  marginBottom={SPACING.md}
                >
                  <View style={styles.statContent}>
                    <IconContainer
                      icon="account-group"
                      family="MaterialCommunityIcons"
                      color={COLORS.info[400]}
                      size={24}
                      containerSize={40}
                    />
                    <Text style={[styles.statNumber, { color: profileTheme.text.primary }]}>
                      {dashboardData.totalStudents}
                    </Text>
                    <Text style={[styles.statLabel, { color: profileTheme.text.secondary }]}>
                      {getString("totalStudents")}
                    </Text>
                  </View>
                </GlassCard>
              </Animated.View>

              <Animated.View style={{ width: '48%', opacity: animations.fadeAnim }}>
                <GlassCard
                  style={styles.glassStatCard}
                  variant="subtle"
                  padding={SPACING.md}
                  marginBottom={SPACING.md}
                >
                  <View style={styles.statContent}>
                    <IconContainer
                      icon="calendar-today"
                      family="MaterialCommunityIcons"
                      color={COLORS.warning[400]}
                      size={24}
                      containerSize={40}
                    />
                    <Text style={[styles.statNumber, { color: profileTheme.text.primary }]}>
                      {dashboardData.todayClasses.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: profileTheme.text.secondary }]}>
                      {getString("classesToday")}
                    </Text>
                  </View>
                </GlassCard>
              </Animated.View>

              <Animated.View style={{ width: '48%', opacity: animations.fadeAnim }}>
                <GlassCard
                  style={styles.glassStatCard}
                  variant="subtle"
                  padding={SPACING.md}
                  marginBottom={SPACING.md}
                >
                  <View style={styles.statContent}>
                    <IconContainer
                      icon="check-circle"
                      family="MaterialCommunityIcons"
                      color={COLORS.secondary[400]}
                      size={24}
                      containerSize={40}
                    />
                    <Text style={[styles.statNumber, { color: profileTheme.text.primary }]}>
                      {dashboardData.activeCheckIns}
                    </Text>
                    <Text style={[styles.statLabel, { color: profileTheme.text.secondary }]}>{getString("checkIns")}</Text>
                  </View>
                </GlassCard>
              </Animated.View>
            </View>

            {/* Timeline de Aulas Hoje */}
            <Animated.View style={{ opacity: animations.fadeAnim, transform: [{ translateY: animations.fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <GlassCard variant="card" padding={SPACING.lg} marginBottom={SPACING.lg}>
                <SectionHeader
                  emoji="🕒"
                  title={getString("todaySchedule")}
                  subtitle={`${dashboardData.todayClasses.length} ${getString("classesScheduled")}`}
                  textColor={profileTheme.text.primary}
                  subtitleColor={profileTheme.text.secondary}
                />

                {dashboardData.todayClasses.length > 0 ? (
                  <View style={styles.timelineContainer}>
                    {dashboardData.todayClasses.map((classItem, index) => (
                      <Animated.View
                        key={index}
                        style={[
                          styles.timelineItem,
                          { opacity: animations.fadeAnim },
                        ]}
                      >
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineContent}>
                          <View style={styles.timelineHeader}>
                            <Text style={[styles.timelineTitle, { color: profileTheme.text.primary }]}>
                              {classItem.name}
                            </Text>
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
                              <MaterialCommunityIcons
                                name="clock"
                                size={16}
                                color={profileTheme.text.secondary}
                              />
                              <Text style={[styles.timelineText, { color: profileTheme.text.secondary }]}>
                                {classItem.schedule
                                  ?.map(
                                    (s) => `${formatTime(s.hour, s.minute)}`,
                                  )
                                  .join(", ")}
                              </Text>
                            </View>

                            <View style={styles.timelineInfo}>
                              <MaterialCommunityIcons
                                name="account-multiple"
                                size={16}
                                color={profileTheme.text.secondary}
                              />
                              <Text style={[styles.timelineText, { color: profileTheme.text.secondary }]}>
                                {classItem.currentStudents || 0}/
                                {classItem.maxCapacity ||
                                  getString("notAvailable")}{" "}
                                {getString("students")}
                              </Text>
                            </View>
                          </View>

                          <AnimatedButton
                            mode="contained"
                            onPress={() =>
                              navigation.navigate("Classes", {
                                classId: classItem.id,
                              })
                            }
                            style={styles.timelineButton}
                            compact
                            buttonColor={profileTheme.primary[600]}
                            textColor={profileTheme.background.paper}
                          >
                            {getString("manageClass")}
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
                    <MaterialCommunityIcons
                      name="calendar-blank"
                      size={48}
                      color={profileTheme.text.disabled}
                    />
                    <Text style={[styles.emptyStateText, { color: profileTheme.text.secondary }]}>
                      {getString("noClassesToday")}
                    </Text>
                    <Text style={[styles.emptyStateSubtext, { color: profileTheme.text.disabled }]}>
                      {getString("planNextClasses")}
                    </Text>
                  </View>
                )}
              </GlassCard>
            </Animated.View>

            {/* Ações Rápidas Modernizadas */}
            <Animated.View style={{ opacity: animations.fadeAnim, transform: [{ translateY: animations.fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <GlassCard variant="card" padding={SPACING.lg} marginBottom={SPACING.lg}>
                <SectionHeader
                  emoji="⚡"
                  title={getString("quickActions")}
                  subtitle={getString("directAccessFunctionalities")}
                  textColor={profileTheme.text.primary}
                  subtitleColor={profileTheme.text.secondary}
                />

                <View style={styles.modernQuickActions}>
                  <Animated.View style={{ width: '48%', marginBottom: SPACING.md }}>
                    <GlassCard variant="subtle" padding={SPACING.md} style={{ height: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ alignItems: 'center' }}>
                        <IconContainer
                          icon="calendar-plus"
                          family="MaterialCommunityIcons"
                          color={profileTheme.primary[400]}
                          size={28}
                          containerSize={48}
                        />
                        <Text style={[styles.actionTitle, { color: profileTheme.text.primary }]}>
                          {getString("scheduleClasses")}
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: profileTheme.text.secondary }]}>
                          {getString("addClassesToYourClasses")}
                        </Text>
                      </View>
                      <AnimatedButton
                        mode="contained"
                        onPress={() => {
                          if (dashboardData.myClasses?.length > 0) {
                            navigation.navigate("ScheduleClasses", {
                              classes: dashboardData.myClasses,
                            });
                          } else {
                            Alert.alert(
                              getString("noClassesTitle"),
                              getString("needOneClassToSchedule"),
                              [
                                { text: getString("cancel"), style: "cancel" },
                                {
                                  text: getString("createClassAction"),
                                  onPress: () => navigation.navigate("AddClass"),
                                },
                              ],
                            );
                          }
                        }}
                        style={styles.modernActionButton}
                        buttonColor={profileTheme.primary[600]}
                        textColor={COLORS.white}
                        compact
                      >
                        {getString("scheduleAction")}
                      </AnimatedButton>
                    </GlassCard>
                  </Animated.View>

                  <Animated.View style={{ width: '48%', marginBottom: SPACING.md }}>
                    <GlassCard variant="subtle" padding={SPACING.md} style={{ height: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ alignItems: 'center' }}>
                        <IconContainer
                          icon="qrcode-scan"
                          family="MaterialCommunityIcons"
                          color={COLORS.info[400]}
                          size={28}
                          containerSize={48}
                        />
                        <Text style={styles.actionTitle}>
                          {getString("checkIn")}
                        </Text>
                        <Text style={styles.actionSubtitle}>
                          {getString("digitalAttendance")}
                        </Text>
                      </View>
                      <AnimatedButton
                        mode="contained"
                        onPress={() => navigation.navigate("checkIn")}
                        style={styles.modernActionButton}
                        buttonColor={COLORS.info[600]}
                        textColor={COLORS.white}
                        compact
                      >
                        {getString("open")}
                      </AnimatedButton>
                    </GlassCard>
                  </Animated.View>

                  <Animated.View style={{ width: '48%', marginBottom: SPACING.md }}>
                    <GlassCard variant="subtle" padding={SPACING.md} style={{ height: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ alignItems: 'center' }}>
                        <IconContainer
                          icon="chart-line"
                          family="MaterialCommunityIcons"
                          color={COLORS.secondary[400]}
                          size={28}
                          containerSize={48}
                        />
                        <Text style={styles.actionTitle}>
                          {getString("reports")}
                        </Text>
                        <Text style={styles.actionSubtitle}>
                          {getString("dataAnalysis")}
                        </Text>
                      </View>
                      <AnimatedButton
                        mode="contained"
                        onPress={() => navigation.navigate("Relatorios")}
                        style={styles.modernActionButton}
                        buttonColor={COLORS.secondary[600]}
                        textColor={COLORS.white}
                        compact
                      >
                        {getString("view")}
                      </AnimatedButton>
                    </GlassCard>
                  </Animated.View>
                </View>
              </GlassCard>
            </Animated.View>

            {/* Avisos e Comunicados */}
            <Animated.View style={{ opacity: animations.fadeAnim, transform: [{ translateY: animations.fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <GlassCard variant="card" padding={SPACING.lg} marginBottom={SPACING.lg}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm }}>
                  <SectionHeader
                    emoji="📢"
                    title={getString("announcements")}
                    subtitle={getString("importantCommunications")}
                    marginTop={0}
                    marginBottom={0}
                    textColor={COLORS.white}
                    subtitleColor={COLORS.gray[300]}
                  />
                  <AnimatedButton
                    icon="refresh"
                    mode="text"
                    onPress={loadAnnouncements}
                    loading={loadingAnnouncements}
                    compact
                    style={{ margin: 0 }}
                    textColor={profileTheme.primary[400]}
                  >
                    {loadingAnnouncements ? "" : getString("update")}
                  </AnimatedButton>
                </View>

                {loadingAnnouncements ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      size="small"
                      color={profileTheme.primary[400]}
                    />
                    <Text style={styles.loadingText}>
                      {getString("loadingAnnouncements")}
                    </Text>
                  </View>
                ) : announcements.length > 0 ? (
                  <View style={styles.announcementsContainer}>
                    {announcements.map((announcement, index) => (
                      <View
                        key={announcement.id}
                        style={[
                          styles.announcementItem,
                          announcement.priority > 0 &&
                          styles.highPriorityAnnouncement,
                        ]}
                      >
                        <TouchableOpacity
                          onPress={() => handleAnnouncementPress(announcement)}
                          style={{ flex: 1 }}
                          activeOpacity={0.7}
                        >
                          {announcement.priority > 0 && (
                            <View style={styles.priorityBadge}>
                              <MaterialCommunityIcons
                                name="alert-circle"
                                size={16}
                                color={COLORS.warning[400]}
                              />
                              <Text style={styles.priorityText}>
                                {getString("important")}
                              </Text>
                            </View>
                          )}
                          <Text style={[styles.announcementTitle, { color: profileTheme.text.primary }]}>
                            {announcement.title}
                          </Text>
                          <Text style={[styles.announcementMessage, { color: profileTheme.text.secondary }]} numberOfLines={2}>
                            {announcement.message}
                          </Text>
                          <View style={styles.announcementFooter}>
                            <Text style={[styles.announcementDate, { color: profileTheme.text.hint }]}>
                              {announcement.date}
                            </Text>
                            {announcement.isRead && (
                              <MaterialCommunityIcons
                                name="check-all"
                                size={16}
                                color={profileTheme.primary[400]}
                              />
                            )}
                          </View>
                        </TouchableOpacity>

                        {/* Botão de exclusão rápida */}
                        <TouchableOpacity
                          onPress={() => handleDeleteAnnouncement(announcement.id)}
                          style={styles.deleteAnnouncementButton}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <MaterialCommunityIcons
                            name="delete-outline"
                            size={20}
                            color={COLORS.error[400]}
                          />
                        </TouchableOpacity>

                        {index < announcements.length - 1 && (
                          <Divider style={styles.announcementDivider} />
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons
                      name="bell-off-outline"
                      size={48}
                      color={COLORS.gray[600]}
                    />
                    <Text style={styles.emptyStateText}>
                      {getString("noAnnouncementsNow")}
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      {getString("notifyNewCommunications")}
                    </Text>
                  </View>
                )}
              </GlassCard>
            </Animated.View>

            {/* Graduações Recentes */}

            <Animated.View style={{ opacity: animations.fadeAnim, transform: [{ translateY: animations.fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <GlassCard variant="card" padding={SPACING.lg} marginBottom={SPACING.lg}>
                <SectionHeader
                  emoji="🏆"
                  title={getString("recentGraduations")}
                  textColor={COLORS.white}
                />

                {dashboardData.recentGraduations.length > 0 ? (
                  dashboardData.recentGraduations.map((graduation, index) => (
                    <Animated.View
                      key={index}
                      style={{
                        opacity: animations.fadeAnim,
                        marginBottom: SPACING.md,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconContainer
                          icon="trophy"
                          color={COLORS.warning[400]}
                          size={24}
                          containerSize={40}
                        />
                        <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                          <Text style={{ fontSize: FONT_SIZE.md, color: COLORS.white, fontWeight: 'bold' }}>
                            {`${graduation.studentName} - ${graduation.graduation}`}
                          </Text>
                          <Text style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray[400] }}>
                            {`${graduation.modality} • ${graduation.date.toLocaleDateString("pt-BR")}`}
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  ))
                ) : (
                  <View style={{ alignItems: 'center', padding: SPACING.lg, justifyContent: 'center' }}>
                    <MaterialCommunityIcons
                      name="trophy-outline"
                      size={48}
                      color={hexToRgba(COLORS.gray[500], 0.3)}
                    />
                    <Text
                      style={[
                        styles.emptyText,
                        {
                          fontSize: FONT_SIZE.sm,
                          color: COLORS.gray[500],
                          marginTop: SPACING.md,
                          textAlign: 'center'
                        },
                      ]}
                    >
                      {getString("noRecentGraduations")}
                    </Text>
                  </View>
                )}

                <AnimatedButton
                  mode="text"
                  onPress={() => {
                    /* Implementar histórico completo */
                  }}
                  style={styles.viewAllButton}
                  textColor={profileTheme.primary[400]}
                >
                  {getString("viewAllGraduations")}
                </AnimatedButton>
              </GlassCard>
            </Animated.View>

            {/* Próximas Aulas */}
            <Animated.View style={{ opacity: animations.fadeAnim, transform: [{ translateY: animations.fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
              <GlassCard variant="card" padding={SPACING.lg} marginBottom={SPACING.lg}>
                <SectionHeader
                  emoji="📅"
                  title={getString("upcomingClasses")}
                  textColor={COLORS.white}
                />

                {dashboardData.upcomingClasses.length > 0 ? (
                  dashboardData.upcomingClasses.map((classItem, index) => (
                    <Animated.View
                      key={index}
                      style={{
                        opacity: animations.fadeAnim,
                        marginBottom: SPACING.md,
                        backgroundColor: hexToRgba(COLORS.white, 0.05),
                        borderRadius: BORDER_RADIUS.md,
                        padding: SPACING.md,
                        borderLeftWidth: 3,
                        borderLeftColor: COLORS.info[500]
                      }}
                    >
                      <Text
                        style={{
                          fontSize: FONT_SIZE.md,
                          fontWeight: 'bold',
                          color: COLORS.white,
                          marginBottom: SPACING.xs
                        }}
                      >
                        {classItem.name}
                      </Text>

                      <View style={{ marginTop: SPACING.xs }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Ionicons name="time-outline" size={14} color={hexToRgba(COLORS.white, 0.6)} />
                          <Text style={{ color: hexToRgba(COLORS.white, 0.6), marginLeft: 4, fontSize: FONT_SIZE.sm }}>
                            {classItem.schedule?.[0]
                              ? `${getDayName(classItem.schedule[0].dayOfWeek)} ${formatTime(classItem.schedule[0].hour)}`
                              : getString("scheduleNotDefined")}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="people-outline" size={14} color={hexToRgba(COLORS.white, 0.6)} />
                          <Text style={{ color: hexToRgba(COLORS.white, 0.6), marginLeft: 4, fontSize: FONT_SIZE.sm }}>
                            {classItem.modality}
                          </Text>
                        </View>
                      </View>

                      <AnimatedButton
                        mode="outlined"
                        onPress={() =>
                          navigation.navigate("Classes", {
                            classId: classItem.id,
                          })
                        }
                        style={{ marginTop: SPACING.sm, borderColor: profileTheme.primary[400] }}
                        compact
                        textColor={profileTheme.primary[400]}
                      >
                        {getString("viewDetails")}
                      </AnimatedButton>
                    </Animated.View>
                  ))
                ) : (
                  <Text
                    style={[
                      styles.emptyText,
                      { fontSize: ResponsiveUtils.fontSize.small },
                    ]}
                  >
                    {getString("noUpcomingClasses")}
                  </Text>
                )}

                <AnimatedButton
                  mode="outlined"
                  onPress={() => navigation.navigate("Classes")}
                  style={styles.viewAllButton}
                  textColor={COLORS.white}
                >
                  {getString("viewAllClasses")}
                </AnimatedButton>
              </GlassCard>
            </Animated.View>
          </ScrollView>

          {/* Modal de Detalhes do Aviso */}
          <Modal
            visible={showAnnouncementModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowAnnouncementModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowAnnouncementModal(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                style={[styles.modalContent, { backgroundColor: profileTheme.background.paper }]}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <MaterialCommunityIcons
                      name="bullhorn"
                      size={24}
                      color={profileTheme.primary[500]}
                    />
                    <Text style={[styles.modalTitle, { color: profileTheme.text.primary }]}>
                      {getString('announcements')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowAnnouncementModal(false)}
                    style={styles.closeButton}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color={profileTheme.text.secondary}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {selectedAnnouncement?.priority > 0 && (
                    <View style={[styles.priorityBadgeLarge, { backgroundColor: hexToRgba(COLORS.warning[400], 0.1) }]}>
                      <MaterialCommunityIcons
                        name="alert-circle"
                        size={20}
                        color={COLORS.warning[400]}
                      />
                      <Text style={[styles.priorityTextLarge, { color: COLORS.warning[400] }]}>
                        {getString('important')}
                      </Text>
                    </View>
                  )}

                  <Text style={[styles.announcementTitleLarge, { color: profileTheme.text.primary }]}>
                    {selectedAnnouncement?.title}
                  </Text>

                  <Text style={[styles.announcementMessageLarge, { color: profileTheme.text.secondary }]}>
                    {selectedAnnouncement?.message}
                  </Text>

                  <View style={styles.announcementMetadata}>
                    <View style={styles.metadataItem}>
                      <MaterialCommunityIcons
                        name="calendar"
                        size={16}
                        color={profileTheme.text.hint}
                      />
                      <Text style={[styles.metadataText, { color: profileTheme.text.hint }]}>
                        {selectedAnnouncement?.date}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <AnimatedButton
                    mode="outlined"
                    onPress={() => setShowAnnouncementModal(false)}
                    style={[styles.modalButton, { borderColor: profileTheme.text.disabled }]}
                    textColor={profileTheme.text.secondary}
                  >
                    {getString('close')}
                  </AnimatedButton>
                  <AnimatedButton
                    mode="contained"
                    onPress={() => handleDeleteAnnouncement(selectedAnnouncement?.id)}
                    style={styles.modalButton}
                    buttonColor={COLORS.error[500]}
                    icon="delete"
                  >
                    {getString('delete')}
                  </AnimatedButton>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </SafeAreaView>
      </LinearGradient>
    </EnhancedErrorBoundary >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  // Header moderno
  headerContainer: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.lg,
    borderRadius: ResponsiveUtils.borderRadius.large,
    overflow: "hidden",
    ...ResponsiveUtils.elevation,
  },
  headerGradient: {
    padding: ResponsiveUtils.spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: hexToRgba(COLORS.white, 0.2),
    borderWidth: 2,
    borderColor: hexToRgba(COLORS.white, 0.3),
  },
  headerText: {
    marginLeft: ResponsiveUtils.spacing.md,
    flex: 1,
  },
  welcomeText: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.xs,
  },
  roleText: {
    fontSize: ResponsiveUtils.fontSize.medium,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: hexToRgba(COLORS.white, 0.15),
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },

  // Cards de estatísticas modernos
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.md,
  },
  glassStatCard: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    // Background controlled by GlassCard variant
    // backgroundColor: Platform.OS === 'web' ? 'rgba(20, 20, 30, 0.4)' : 'rgba(255, 255, 255, 0.05)',
  },
  statContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  statNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    textAlign: "center",
    marginTop: SPACING.xs,
  },

  // Ações rápidas modernizadas
  modernQuickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: FONT_SIZE.sm,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  modernActionButton: {
    borderRadius: BORDER_RADIUS.lg,
    width: "100%",
    marginTop: SPACING.sm,
  },

  // Timeline
  timelineContainer: {
    marginTop: ResponsiveUtils.spacing.md,
  },
  timelineItem: {
    flexDirection: "row",
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
    backgroundColor: hexToRgba(COLORS.white, 0.05),
    borderRadius: ResponsiveUtils.borderRadius.medium,
    padding: ResponsiveUtils.spacing.md,
    borderColor: hexToRgba(COLORS.white, 0.1),
    borderWidth: 1,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  timelineTitle: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
    flex: 1,
  },
  modernChip: {
    backgroundColor: hexToRgba(COLORS.info[500], 0.2), // Info color transparent
    borderColor: hexToRgba(COLORS.info[500], 0.3),
    borderWidth: 1,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.info[300], // Lighter info color
  },
  timelineDetails: {
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  timelineInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  timelineText: {
    fontSize: FONT_SIZE.base,
    marginLeft: SPACING.xs,
  },
  timelineButton: {
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: "flex-start",
  },
  timelineLine: {
    position: "absolute",
    left: 5,
    top: 18,
    bottom: -ResponsiveUtils.spacing.md,
    width: 2,
    backgroundColor: hexToRgba(COLORS.gray[500], 0.2),
  },

  // Estados vazios
  emptyState: {
    alignItems: "center",
    padding: ResponsiveUtils.spacing.xl,
  },
  emptyStateText: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: ResponsiveUtils.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: ResponsiveUtils.fontSize.small,
    textAlign: "center",
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
    alignItems: "center",
    justifyContent: "center",
    padding: ResponsiveUtils.spacing.md,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: ResponsiveUtils.fontSize.small,
  },
  announcementsContainer: {
    maxHeight: 400,
    marginTop: ResponsiveUtils.spacing.sm,
  },
  announcementItem: {
    paddingVertical: ResponsiveUtils.spacing.sm,
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  deleteAnnouncementButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: hexToRgba(COLORS.error[500], 0.1),
    alignSelf: "flex-start",
    marginTop: SPACING.xs,
  },
  highPriorityAnnouncement: {
    backgroundColor: hexToRgba(COLORS.warning[500], OPACITY.light),
    borderRadius: ResponsiveUtils.borderRadius.small,
    marginHorizontal: -ResponsiveUtils.spacing.sm,
    paddingHorizontal: ResponsiveUtils.spacing.sm,
    paddingTop: ResponsiveUtils.spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning[500],
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: hexToRgba(COLORS.warning[500], OPACITY.medium),
    paddingHorizontal: ResponsiveUtils.spacing.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: "flex-start",
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  priorityText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.warning[300],
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  announcementTitle: {
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: ResponsiveUtils.spacing.xs,
    fontSize: ResponsiveUtils.fontSize.medium,
  },
  announcementMessage: {
    marginBottom: ResponsiveUtils.spacing.xs,
    fontSize: ResponsiveUtils.fontSize.small,
    lineHeight: 20,
  },
  announcementFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: ResponsiveUtils.spacing.xs,
  },
  announcementDate: {
    fontSize: ResponsiveUtils.fontSize.small,
  },
  announcementDivider: {
    marginTop: ResponsiveUtils.spacing.md,
    backgroundColor: hexToRgba(COLORS.gray[500], 0.2),
  },

  // Estilos legados mantidos para compatibilidade (atualizados para dark)
  card: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.sm,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    backgroundColor: hexToRgba(COLORS.gray[500], 0.05),
    borderColor: hexToRgba(COLORS.gray[500], 0.1),
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ResponsiveUtils.spacing.md,
  },
  cardTitle: {
    marginLeft: ResponsiveUtils.spacing.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  classItem: {
    marginBottom: ResponsiveUtils.spacing.md,
    padding: ResponsiveUtils.spacing.sm,
    backgroundColor: hexToRgba(COLORS.gray[500], 0.05),
    borderRadius: ResponsiveUtils.borderRadius.small,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  className: {
    fontWeight: FONT_WEIGHT.bold,
    flex: 1,
  },
  modalityChip: {
    marginLeft: ResponsiveUtils.spacing.sm,
  },
  classDetails: {
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  classTime: {
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  classCapacity: {
  },
  classButton: {
    marginTop: ResponsiveUtils.spacing.sm,
  },
  quickActions: {
    flexDirection: ResponsiveUtils.isTablet() ? "row" : "column",
    justifyContent: "space-between",
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  quickActionButton: {
    flex: ResponsiveUtils.isTablet() ? 1 : undefined,
    marginHorizontal: ResponsiveUtils.isTablet()
      ? ResponsiveUtils.spacing.xs
      : 0,
    marginBottom: ResponsiveUtils.isTablet() ? 0 : ResponsiveUtils.spacing.sm,
  },
  logoutContainer: {
    marginTop: ResponsiveUtils.spacing.lg,
    alignItems: "center",
  },
  logoutButton: {
    width: ResponsiveUtils.isTablet() ? "40%" : "60%",
    borderColor: COLORS.error[500],
  },
  upcomingClass: {
    marginBottom: ResponsiveUtils.spacing.sm,
    padding: ResponsiveUtils.spacing.sm,
    backgroundColor: hexToRgba(COLORS.gray[500], 0.05),
    borderRadius: ResponsiveUtils.borderRadius.small,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning[500],
  },
  upcomingClassName: {
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  upcomingClassInfo: {
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: ResponsiveUtils.spacing.md,
  },
  divider: {
    marginVertical: ResponsiveUtils.spacing.sm,
    backgroundColor: hexToRgba(COLORS.gray[500], 0.2),
  },
  viewAllButton: {
    marginTop: ResponsiveUtils.spacing.sm,
  },

  // Modal de Avisos
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay.darker,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: hexToRgba(COLORS.gray[500], 0.2),
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalBody: {
    padding: SPACING.lg,
    maxHeight: 400,
  },
  priorityBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  priorityTextLarge: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  announcementTitleLarge: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  announcementMessageLarge: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  announcementMetadata: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: hexToRgba(COLORS.gray[500], 0.2),
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metadataText: {
    fontSize: FONT_SIZE.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: hexToRgba(COLORS.gray[500], 0.2),
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default InstructorDashboard;
