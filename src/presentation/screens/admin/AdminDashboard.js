import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  RefreshControl,
  Animated,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  Card,
  Button,
  Avatar,
  Text,
  Modal,
  Portal,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafeIonicons, SafeMaterialCommunityIcons } from "@components/SafeIcon";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthFacade } from "@presentation/auth/AuthFacade";
import { academyFirestoreService } from "@infrastructure/services/academyFirestoreService";
import AnimatedCard from "@components/AnimatedCard";
import AnimatedButton from "@components/AnimatedButton";
import { useAnimation, ResponsiveUtils } from "@utils/animations";
import QRCodeGenerator from "@components/QRCodeGenerator";
import EnhancedErrorBoundary from "@components/EnhancedErrorBoundary";
import cacheService, {
  CACHE_KEYS,
  CACHE_TTL,
} from "@infrastructure/services/cacheService";
import { useScreenTracking, useUserActionTracking } from "@hooks/useAnalytics";
import DashboardSkeleton from "@components/skeletons/DashboardSkeleton";
import FreeGymScheduler from "@components/FreeGymScheduler";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  FONT_WEIGHT,
  GLASS,
  OPACITY,
  BORDER_WIDTH,
} from "@presentation/theme/designTokens";
import { hexToRgba } from "@shared/utils/colorUtils";
import { useOnboarding } from "@components/OnboardingTour";
import { useTheme } from "@contexts/ThemeContext";
import { useProfileTheme } from "../../../contexts/ProfileThemeContext";
// Modern Components
import { GlassCard, SectionHeader, IconContainer } from "@components/modern";

const AdminDashboard = ({ navigation }) => {
  const { getString, isDarkMode, theme } = useTheme();
  // Ensure profileTheme is correctly typed or handled if it comes from a context that doesn't strictly match the global theme
  const { theme: profileTheme } = useProfileTheme();
  const { user, userProfile, logout, academia } = useAuthFacade();
  const { animations, startEntryAnimation } = useAnimation();
  const scrollY = new Animated.Value(0);

  // Dynamic Styles
  const glassStyle = isDarkMode ? GLASS.premium : GLASS.light;
  const textColor = isDarkMode ? COLORS.white : COLORS.black;
  const secondaryTextColor = isDarkMode ? COLORS.text.secondary : COLORS.gray[800];

  // Updated Background Gradient to Deep Purple "Dark Glass" Theme
  const backgroundGradient = isDarkMode
    ? COLORS.gradients.deepPurple
    : COLORS.gradients.lightBackground;

  // Analytics tracking
  useScreenTracking("AdminDashboard", {
    academiaId: userProfile?.academiaId,
    userType: userProfile?.userType,
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
    quickStats: {},
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
      startTour("ADMIN_DASHBOARD");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(skeletonPulse, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: Platform.OS !== "web",
          }),
        ]),
      ).start();
    }
  }, [loading]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Buscar todos os alunos da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString("academyIdNotFound"));
        return;
      }

      // Usar cache inteligente para carregar dados do dashboard
      const cacheKey = CACHE_KEYS.DASHBOARD(academiaId);

      const dashboardStats = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log(
            "🔍 Buscando dados do dashboard (cache miss):",
            academiaId,
          );

          // Usar batch processing para carregar múltiplas coleções
          const [students, classes, payments, instructors, graduations] = await Promise.all([
            academyFirestoreService.getAll("students", academiaId),
            academyFirestoreService.getAll("classes", academiaId),
            academyFirestoreService.getAll("payments", academiaId),
            academyFirestoreService.getAll("instructors", academiaId),
            academyFirestoreService.getAll("graduations", academiaId),
          ]);

          // Salvar classes no estado para o calendário
          setClasses(classes);

          const activeStudents = students.filter((s) => s.isActive !== false);

          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();

          const monthlyPayments = payments.filter((p) => {
            const paymentDate = new Date(
              p.createdAt?.seconds ? p.createdAt.seconds * 1000 : p.createdAt,
            );
            return (
              paymentDate.getMonth() === currentMonth &&
              paymentDate.getFullYear() === currentYear
            );
          });

          const pendingPayments = payments.filter(
            (p) => p.status === "pending",
          ).length;
          const overduePayments = payments.filter(
            (p) => p.status === "overdue",
          ).length;

          const monthlyRevenue = monthlyPayments
            .filter((p) => p.status === "paid")
            .reduce((sum, p) => sum + (p.amount || 0), 0);

          // Função auxiliar para formatar tempo relativo
          const getRelativeTime = (timestamp) => {
            if (!timestamp) return "";
            const date = new Date(
              timestamp.seconds ? timestamp.seconds * 1000 : timestamp,
            );
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);

            if (diffInDays > 0) return `${diffInDays} ${getString("daysAgo")}`;
            if (diffInHours > 0) return `${diffInHours} ${getString("hoursAgo")}`;
            if (diffInMinutes > 0) return `${diffInMinutes} ${getString("minutesAgo") || "min atrás"}`;
            return getString("justNow") || "Agora mesmo";
          };

          // Buscar atividades recentes reais
          const recentActivities = [];

          // 1. Último aluno cadastrado
          const sortedStudents = [...students].sort((a, b) => {
            const timeA = a.createdAt?.seconds
              ? a.createdAt.seconds * 1000
              : new Date(a.createdAt || 0).getTime();
            const timeB = b.createdAt?.seconds
              ? b.createdAt.seconds * 1000
              : new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
          });

          if (sortedStudents.length > 0) {
            recentActivities.push({
              type: "new_student",
              message: `${getString("newStudentRegistered")}: ${sortedStudents[0].name.split(" ")[0]}`,
              time: getRelativeTime(sortedStudents[0].createdAt),
              icon: "account-plus",
            });
          } else {
            recentActivities.push({
              type: "new_student_empty",
              message: getString("noStudentsRegistered") || "Nenhum aluno cadastrado",
              time: "-",
              icon: "account-off",
            });
          }

          // 2. Último pagamento
          const sortedPayments = [...payments].sort((a, b) => {
            const timeA = a.createdAt?.seconds
              ? a.createdAt.seconds * 1000
              : new Date(a.createdAt || 0).getTime();
            const timeB = b.createdAt?.seconds
              ? b.createdAt.seconds * 1000
              : new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
          });

          if (sortedPayments.length > 0) {
            recentActivities.push({
              type: "payment",
              message: getString("paymentReceived"),
              time: getRelativeTime(sortedPayments[0].createdAt),
              icon: "cash-check",
            });
          } else {
            recentActivities.push({
              type: "payment_empty",
              message: getString("noPaymentAtTheMoment") || "Sem pagamento no momento",
              time: "-",
              icon: "cash-remove",
            });
          }

          // 3. Última graduação
          const sortedGraduations = [...graduations].sort((a, b) => {
            const timeA = a.createdAt?.seconds
              ? a.createdAt.seconds * 1000
              : new Date(a.createdAt || 0).getTime();
            const timeB = b.createdAt?.seconds
              ? b.createdAt.seconds * 1000
              : new Date(b.createdAt || 0).getTime();
            return timeB - timeA;
          });

          if (sortedGraduations.length > 0) {
            const gradStudent = students.find(s => s.id === sortedGraduations[0].studentId);
            const studentName = gradStudent ? gradStudent.name.split(" ")[0] : "";

            recentActivities.push({
              type: "graduation",
              message: `${getString("graduationRegistered")} ${studentName ? `(${studentName})` : ""}`,
              time: getRelativeTime(sortedGraduations[0].createdAt),
              icon: "trophy",
            });
          } else {
            recentActivities.push({
              type: "graduation_empty",
              message: getString("noGraduationRegistered") || "Nenhuma graduação registrada",
              time: "-",
              icon: "medal-outline",
            });
          }

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
              modalities: [...new Set(classes.map((c) => c.modality))].length,
            },
          };
        },
        CACHE_TTL.SHORT, // Cache por 2 minutos (dados do dashboard mudam frequentemente)
      );

      setDashboardData(dashboardStats);
      console.log("✅ Dashboard carregado com sucesso");

      // Track analytics
      trackFeatureUsage("dashboard_loaded", {
        totalStudents: dashboardStats.totalStudents,
        totalClasses: dashboardStats.totalClasses,
        academiaId,
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard admin:", error);
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
      trackButtonClick("logout");
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }, [logout, trackButtonClick]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: getString("currency"),
    }).format(value || 0);
  };

  const getActivityIcon = (type) => {
    const icons = {
      checkin: "account-check",
      payment: "cash",
      graduation: "medal",
      class: "school",
      fallback: "information",
    };
    return icons[type] || icons.fallback;
  };

  const getActivityColor = (type) => {
    const colors = {
      new_student: profileTheme.primary[500],
      payment: COLORS.info[500],
      graduation: COLORS.warning[300],
      class: COLORS.warning[500],
      announcement: profileTheme.secondary[500],
    };
    return colors[type] || COLORS.gray[500];
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

  // Memoized navigation handlers
  const handleNavigateToStudents = useCallback(() => {
    trackButtonClick("navigate_students");
    navigation.navigate("Students");
  }, [navigation, trackButtonClick]);

  const handleNavigateToClasses = useCallback(() => {
    trackButtonClick("navigate_classes");
    navigation.navigate("Classes");
  }, [navigation, trackButtonClick]);

  const handleNavigateToManagement = useCallback(() => {
    trackButtonClick("navigate_management");
    navigation.navigate("Management");
  }, [navigation, trackButtonClick]);

  const handleShowCalendar = useCallback(() => {
    trackButtonClick("show_calendar_modal");
    setShowCalendarModal(true);
  }, [trackButtonClick]);

  const handleShowQR = useCallback(() => {
    console.log("🔍 Abrindo QR Code - Academia:", academia);
    console.log("🔍 UserProfile academiaId:", userProfile?.academiaId);
    trackButtonClick("show_qr_code");
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
        console.error("🚨 Erro no AdminDashboard:", {
          error,
          errorInfo,
          errorId,
        });
      }}
      errorContext={{
        screen: "AdminDashboard",
        academiaId: userProfile?.academiaId,
      }}
    >
      <LinearGradient
        colors={backgroundGradient}
        style={{ flex: 1 }}
      >
        <SafeAreaView
          style={[styles.container, { backgroundColor: "transparent" }]}
        >
          {/* Modal Calendário */}
          <Portal>
            <Modal
              visible={showCalendarModal}
              onDismiss={() => setShowCalendarModal(false)}
              contentContainerStyle={styles.calendarModalContainer}
              dismissable={true}
            >
              <View style={styles.calendarModalHeader}>
                <Text style={styles.calendarModalTitle}>
                  {getString("classSchedule")}
                </Text>
                <Button onPress={() => setShowCalendarModal(false)}>
                  {getString("close")}
                </Button>
              </View>
              <View style={styles.calendarContainer}>
                <FreeGymScheduler
                  classes={classes}
                  onClassPress={(event) => {
                    setShowCalendarModal(false);
                    navigation.navigate("ClassDetails", {
                      classId: event.classId,
                      className: event.title,
                    });
                  }}
                  onCreateClass={() => {
                    console.log(
                      "🚀 Botão criar turma clicado no AdminDashboard",
                    );
                    setShowCalendarModal(false);
                    console.log("📱 Navegando para AddClass...");
                    navigation.getParent()?.navigate("AddClass");
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
              {academia?.id || userProfile?.academiaId ? (
                <QRCodeGenerator
                  academiaId={academia?.id || userProfile?.academiaId}
                  academiaNome={academia?.nome || getString("academy")}
                  academiaCodigo={academia?.codigo}
                  size={250}
                  showActions={true}
                />
              ) : (
                <View style={{ padding: SPACING.xl, alignItems: "center" }}>
                  <Text
                    style={{ color: COLORS.gray[500], textAlign: "center" }}
                  >
                    {getString("loadingAcademyInfo")}
                  </Text>
                </View>
              )}
            </Modal>
          </Portal>

          <Animated.ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.white}
              />
            }
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: Platform.OS !== "web" },
            )}
            scrollEventThrottle={16}
          >
            {/* Header moderno com gradiente */}
            <Animated.View style={[headerTransform]}>
              <View style={styles.headerContainer}>
                <LinearGradient
                  colors={[profileTheme.primary[600], COLORS.primary[800]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.headerGradient}
                >
                  <View style={styles.headerContentModern}>
                    <Animated.View
                      style={{ transform: [{ scale: animations.scaleAnim }] }}
                    >
                      <Avatar.Text
                        size={ResponsiveUtils.isTablet() ? 85 : 65}
                        label={userProfile?.name?.charAt(0) || "A"}
                        style={styles.avatarModern}
                        color={COLORS.white}
                      />
                    </Animated.View>
                    <View style={styles.headerTextModern}>
                      <Text style={styles.welcomeTextModern}>
                        {getString("hello")},{" "}
                        {userProfile?.name?.split(" ")[0] || getString("admin")}
                        ! 👋
                      </Text>
                      <Text style={styles.roleTextModern}>
                        {getString("academyAdministrator")}
                      </Text>
                      <View style={styles.statusBadge}>
                        <SafeMaterialCommunityIcons
                          name="circle"
                          size={8}
                          color={COLORS.success[400]}
                        />
                        <Text style={styles.statusText}>
                          {getString("online")}
                        </Text>
                      </View>
                      {/* Código da Academia */}
                      {academia?.codigo && (
                        <TouchableOpacity
                          style={styles.academiaCodeContainer}
                          onPress={handleShowQR}
                        >
                          <SafeMaterialCommunityIcons
                            name="qrcode"
                            size={16}
                            color={COLORS.white + "E6"}
                          />
                          <Text style={styles.academiaCodeText}>
                            {getString("code")}: {academia.codigo}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Animated.View style={{ opacity: animations.fadeAnim }}>
                      <TouchableOpacity onPress={handleShowQR}>
                        <SafeMaterialCommunityIcons
                          name="qrcode-scan"
                          size={24}
                          color={COLORS.white + "D9"}
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>

            {/* Estatísticas principais em cards com gradiente */}
            <View style={styles.statsContainer}>
              <Animated.View style={{ width: '48%', marginBottom: SPACING.md, opacity: animations.fadeAnim }}>
                <GlassCard
                  style={styles.glassStatCard}
                  variant="subtle"
                  padding={SPACING.md}
                >
                  <View style={styles.statContent}>
                    <IconContainer
                      icon="account-group"
                      family="MaterialCommunityIcons"
                      color={COLORS.info[400]}
                      size={24}
                      containerSize={40}
                    />
                    <Text style={styles.statNumber}>
                      {dashboardData.totalStudents}
                    </Text>
                    <Text style={styles.statLabel}>
                      {getString("totalStudents")}
                    </Text>
                  </View>
                </GlassCard>
              </Animated.View>

              <Animated.View style={{ width: '48%', marginBottom: SPACING.md, opacity: animations.fadeAnim }}>
                <GlassCard
                  style={styles.glassStatCard}
                  variant="subtle"
                  padding={SPACING.md}
                >
                  <View style={styles.statContent}>
                    <IconContainer
                      icon="account-check"
                      family="MaterialCommunityIcons"
                      color={COLORS.success[400]}
                      size={24}
                      containerSize={40}
                    />
                    <Text style={styles.statNumber}>
                      {dashboardData.activeStudents}
                    </Text>
                    <Text style={styles.statLabel}>
                      {getString("activeStudents")}
                    </Text>
                  </View>
                </GlassCard>
              </Animated.View>

              <Animated.View style={{ width: '48%', marginBottom: SPACING.md, opacity: animations.fadeAnim }}>
                <GlassCard
                  style={styles.glassStatCard}
                  variant="subtle"
                  padding={SPACING.md}
                >
                  <View style={styles.statContent}>
                    <IconContainer
                      icon="school-outline"
                      family="MaterialCommunityIcons"
                      color={COLORS.warning[400]}
                      size={24}
                      containerSize={40}
                    />
                    <Text style={styles.statNumber}>
                      {dashboardData.totalClasses}
                    </Text>
                    <Text style={styles.statLabel}>
                      {getString("classes")}
                    </Text>
                  </View>
                </GlassCard>
              </Animated.View>

              <Animated.View style={{ width: '48%', marginBottom: SPACING.md, opacity: animations.fadeAnim }}>
                <GlassCard
                  style={styles.glassStatCard}
                  variant="subtle"
                  padding={SPACING.md}
                >
                  <View style={styles.statContent}>
                    <IconContainer
                      icon="cash-multiple"
                      family="MaterialCommunityIcons"
                      color={COLORS.error[400]}
                      size={24}
                      containerSize={40}
                    />
                    <Text style={styles.statNumber}>
                      {dashboardData.pendingPayments}
                    </Text>
                    <Text style={styles.statLabel}>
                      {getString("pendingPaymentsCount")}
                    </Text>
                  </View>
                </GlassCard>
              </Animated.View>
            </View>

            {/* Financeiro */}
            {/* Financeiro */}
            <Animated.View style={{ opacity: animations.fadeAnim, marginBottom: SPACING.lg, transform: [{ translateY: animations.slideAnim }] }}>
              <GlassCard variant="card" padding={SPACING.lg}>
                <SectionHeader
                  emoji="💰"
                  title={getString("monthlyFinancials")}
                  textColor={COLORS.white}
                />

                <View style={styles.financialInfo}>
                  <View style={styles.revenueItem}>
                    <Text style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray[400], marginBottom: 4 }}>
                      {getString("monthlyRevenue")}
                    </Text>
                    <Text style={{ fontSize: FONT_SIZE.xxl, color: COLORS.white, fontWeight: 'bold' }}>
                      {formatCurrency(dashboardData.monthlyRevenue)}
                    </Text>
                  </View>

                  <Divider style={{ marginVertical: SPACING.md, backgroundColor: COLORS.gray[800] }} />

                  <View style={styles.paymentsRow}>
                    <View style={styles.paymentItem}>
                      <Text style={{ fontSize: FONT_SIZE.xl, color: COLORS.white, fontWeight: 'bold' }}>
                        {dashboardData.pendingPayments}
                      </Text>
                      <Text style={{ fontSize: FONT_SIZE.xs, color: COLORS.gray[400] }}>
                        {getString("pendingCount")}
                      </Text>
                    </View>

                    <View style={styles.paymentItem}>
                      <Text style={{ fontSize: FONT_SIZE.xl, color: COLORS.error[400], fontWeight: 'bold' }}>
                        {dashboardData.overduePayments}
                      </Text>
                      <Text style={{ fontSize: FONT_SIZE.xs, color: COLORS.gray[400] }}>
                        {getString("overdueCount")}
                      </Text>
                    </View>
                  </View>
                </View>

                <AnimatedButton
                  mode="outlined"
                  onPress={handleNavigateToManagement}
                  style={[
                    styles.viewReportsButton,
                    { borderColor: profileTheme.primary[400], marginTop: SPACING.md }
                  ]}
                  icon="chart-line"
                  textColor={profileTheme.primary[400]}
                >
                  {getString("accessManagementReports")}
                </AnimatedButton>
              </GlassCard>
            </Animated.View>

            {/* Ações Rápidas modernas */}
            <Animated.View style={{ opacity: animations.fadeAnim, marginBottom: SPACING.lg }}>
              <GlassCard variant="card" padding={SPACING.lg}>
                <SectionHeader
                  emoji="⚡"
                  title={getString("quickActions")}
                  subtitle={getString("quickActionsSubtitle")}
                  textColor={COLORS.white}
                  subtitleColor={COLORS.gray[400]}
                />

                <View style={[styles.modernQuickActions, { justifyContent: 'space-between' }]}>
                  {[
                    {
                      key: "students",
                      title: getString("students"),
                      icon: "account-group",
                      color: COLORS.info[400],
                      onPress: handleNavigateToStudents,
                    },
                    {
                      key: "classes",
                      title: getString("classes"),
                      icon: "school",
                      color: COLORS.success[400],
                      onPress: handleNavigateToClasses,
                    },
                    {
                      key: "calendar",
                      title: getString("calendar"),
                      icon: "calendar-month",
                      color: COLORS.secondary[400],
                      onPress: handleShowCalendar,
                    },
                    {
                      key: "settings",
                      title: getString("settings"),
                      icon: "cog",
                      color: COLORS.warning[400],
                      onPress: handleNavigateToManagement,
                    },
                  ].map((action) => (
                    <TouchableOpacity
                      key={action.key}
                      style={{ width: '48%', marginBottom: SPACING.md }}
                      onPress={action.onPress}
                    >
                      <GlassCard variant="subtle" padding={SPACING.md} style={{ alignItems: 'center' }}>
                        <IconContainer
                          icon={action.icon}
                          family="MaterialCommunityIcons"
                          color={action.color}
                          size={28}
                          containerSize={50}
                        />
                        <Text style={{ marginTop: SPACING.sm, color: COLORS.white, fontWeight: 'bold', textAlign: 'center' }}>
                          {action.title}
                        </Text>
                      </GlassCard>
                    </TouchableOpacity>
                  ))}
                </View>
              </GlassCard>
            </Animated.View>

            {/* Atividades Recentes */}
            <Animated.View style={{ opacity: animations.fadeAnim, marginBottom: SPACING.lg }}>
              <GlassCard variant="card" padding={SPACING.lg}>
                <SectionHeader
                  emoji="🕒"
                  title={getString("recentActivities")}
                  textColor={COLORS.white}
                />

                {dashboardData.recentActivities.map((activity, index) => (
                  <Animated.View
                    key={index}
                    style={{
                      opacity: animations.fadeAnim,
                      marginBottom: SPACING.md
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <IconContainer
                        icon={activity.icon || getActivityIcon(activity.type)}
                        family="MaterialCommunityIcons"
                        color={activity.color || getActivityColor(activity.type)} // Use dynamic color
                        size={20}
                        containerSize={36}
                      />
                      <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                        <Text style={{ fontSize: FONT_SIZE.md, color: COLORS.white }}>
                          {activity.message}
                        </Text>
                        <Text style={{ fontSize: FONT_SIZE.xs, color: COLORS.gray[400] }}>
                          {activity.time}
                        </Text>
                      </View>
                    </View>
                    {index < dashboardData.recentActivities.length - 1 && (
                      <Divider style={{ marginVertical: SPACING.sm, backgroundColor: COLORS.gray[800] }} />
                    )}
                  </Animated.View>
                ))}

                <AnimatedButton
                  mode="text"
                  onPress={() => {
                    /* Implementar histórico completo */
                  }}
                  style={styles.viewAllButton}
                  textColor={profileTheme.primary[400]}
                >
                  {getString("viewAllActivities")}
                </AnimatedButton>
              </GlassCard>
            </Animated.View>

            {/* Alertas e Notificações */}
            {(dashboardData.overduePayments > 0 ||
              dashboardData.pendingPayments > 5) && (
                <AnimatedCard delay={500} style={[styles.card, styles.alertCard]}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <SafeIonicons
                        name="warning-outline"
                        size={24}
                        color={COLORS.warning[400]}
                      />
                      <Text
                        style={[
                          styles.cardTitle,
                          {
                            fontSize: ResponsiveUtils.fontSize.medium,
                            color: textColor,
                          },
                        ]}
                      >
                        {getString("alerts")}
                      </Text>
                    </View>

                    {dashboardData.overduePayments > 0 && (
                      <Text
                        style={[
                          styles.alertText,
                          {
                            fontSize: ResponsiveUtils.fontSize.small,
                            color: textColor,
                          },
                        ]}
                      >
                        • {dashboardData.overduePayments}{" "}
                        {getString("paymentsOverdue")}
                      </Text>
                    )}

                    {dashboardData.pendingPayments > 5 && (
                      <Text
                        style={[
                          styles.alertText,
                          {
                            fontSize: ResponsiveUtils.fontSize.small,
                            color: textColor,
                          },
                        ]}
                      >
                        • {getString("manyPendingPayments")} (
                        {dashboardData.pendingPayments})
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
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  // Stats
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
    backgroundColor: GLASS.subtle.backgroundColor,
  },
  statContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  statNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    fontWeight: FONT_WEIGHT.medium,
  },
  // Header
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
  headerContentModern: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarModern: {
    backgroundColor: hexToRgba(COLORS.white, OPACITY.medium),
    borderWidth: BORDER_WIDTH.base,
    borderColor: hexToRgba(COLORS.white, OPACITY.medium),
  },
  headerTextModern: {
    marginLeft: ResponsiveUtils.spacing.md,
    flex: 1,
  },
  welcomeTextModern: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  roleTextModern: {
    fontSize: ResponsiveUtils.fontSize.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: hexToRgba(COLORS.white, 0.2),
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: "flex-start",
  },
  statusText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  academiaCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
    backgroundColor: COLORS.overlay.default,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: "flex-start",
  },
  academiaCodeText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.xs,
    fontFamily: "monospace",
  },

  // Cards
  card: {
    margin: ResponsiveUtils.spacing.md,
    marginTop: ResponsiveUtils.spacing.sm,
    // Glassmorphism
    backgroundColor: GLASS.premium.backgroundColor,
    borderColor: GLASS.premium.borderColor,
    borderWidth: 1,
    borderRadius: ResponsiveUtils.borderRadius.large,
    // Elevação
    ...Platform.select({
      ios: {
        shadowColor: GLASS.premium.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: `0 8px 32px 0 ${GLASS.premium.shadowColor}`,
        backdropFilter: GLASS.premium.backdropFilter,
      },
    }),
  },
  modernCard: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.md,
    // Glassmorphism
    backgroundColor: GLASS.premium.backgroundColor,
    borderColor: GLASS.premium.borderColor,
    borderWidth: 1,
    borderRadius: ResponsiveUtils.borderRadius.large,
    // Elevação
    ...Platform.select({
      ios: {
        shadowColor: GLASS.premium.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: `0 8px 32px 0 ${GLASS.premium.shadowColor}`,
        backdropFilter: GLASS.premium.backdropFilter,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ResponsiveUtils.spacing.md,
  },
  cardTitle: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginLeft: ResponsiveUtils.spacing.sm,
  },
  modernCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ResponsiveUtils.spacing.md,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: hexToRgba(COLORS.white, OPACITY.light),
    alignItems: "center",
    justifyContent: "center",
    marginRight: ResponsiveUtils.spacing.md,
  },
  modernCardTitle: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xxs,
  },
  modernCardSubtitle: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: COLORS.text.tertiary,
  },
  // Actions
  modernQuickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  actionCard: {
    borderRadius: ResponsiveUtils.borderRadius.medium,
    overflow: "hidden",
    marginBottom: 10,
  },
  actionGradient: {
    padding: ResponsiveUtils.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    height: 160,
  },
  actionTitle: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  modernActionButton: {
    width: "100%",
    marginTop: "auto",
  },
  // Financial
  financialInfo: {
    marginBottom: SPACING.md,
  },
  revenueItem: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  revenueLabel: {
    color: COLORS.text.tertiary,
    marginBottom: SPACING.xs,
  },
  revenueValue: {
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  divider: {
    backgroundColor: hexToRgba(COLORS.white, OPACITY.light),
    marginVertical: SPACING.md,
  },
  paymentsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  paymentItem: {
    alignItems: "center",
  },
  paymentNumber: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  paymentLabel: {
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  },
  viewReportsButton: {
    borderColor: hexToRgba(COLORS.white, OPACITY.medium),
    borderWidth: BORDER_WIDTH.thin,
  },
  // Activities
  viewAllButton: {
    marginTop: SPACING.sm,
  },
  // Alerts
  alertCard: {
    backgroundColor: hexToRgba(COLORS.warning[500], 0.1), // Orange tint
    borderColor: hexToRgba(COLORS.warning[500], 0.3),
  },
  alertText: {
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  // Modals
  calendarModalContainer: {
    backgroundColor: GLASS.premium.backgroundColor,
    margin: 20,
    borderRadius: BORDER_RADIUS.lg,
    height: "80%",
    overflow: "hidden",
    borderColor: GLASS.premium.borderColor,
    borderWidth: 1,
    ...Platform.select({
      web: {
        backdropFilter: GLASS.premium.backdropFilter,
      },
    }),
  },
  calendarModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: hexToRgba(COLORS.white, OPACITY.light),
  },
  calendarModalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  calendarContainer: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: GLASS.premium.backgroundColor,
    margin: 20,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderColor: GLASS.premium.borderColor,
    borderWidth: 1,
    ...Platform.select({
      web: {
        backdropFilter: GLASS.premium.backdropFilter,
      },
    }),
  },
});

export default AdminDashboard;
