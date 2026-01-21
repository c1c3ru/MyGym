import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
} from "react-native";
import { Text, Button, Avatar, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@contexts/ThemeContext";
import { academyFirestoreService } from "@infrastructure/services/academyFirestoreService";
import { useAuth } from "@contexts/AuthProvider";
import EnhancedErrorBoundary from "@components/EnhancedErrorBoundary";
import cacheService, {
  CACHE_KEYS,
  CACHE_TTL,
} from "@infrastructure/services/cacheService";
import { useScreenTracking, useUserActionTracking } from "@hooks/useAnalytics";
import StudentDetailsSkeleton from "@components/skeletons/StudentDetailsSkeleton";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  FONT_WEIGHT,
} from "@presentation/theme/designTokens";
import { hexToRgba } from "@shared/utils/colorUtils";
import { useThemeToggle } from "@contexts/ThemeToggleContext";
import { getAuthGradient } from "@presentation/theme/authTheme";
import type { NavigationProp, RouteProp } from "@react-navigation/native";

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: any; // Can be improved if we know the exact Firestore Timestamp type, but 'any' or Custom type solves the error for now if strictly handled below
  classIds?: string[];
  [key: string]: any;
}

interface ClassData {
  id: string;
  name: string;
  modality: string;
  [key: string]: any;
}

interface PaymentData {
  id: string;
  userId: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  createdAt: any; // Firestore Timestamp
  [key: string]: any;
}

type StudentDetailsRouteParams = {
  StudentDetails: {
    studentId: string;
    studentData?: StudentData | null;
  };
};

interface StudentDetailsScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<StudentDetailsRouteParams, "StudentDetails">;
}

const StudentDetailsScreen: React.FC<StudentDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { currentTheme } = useThemeToggle();

  const { studentId, studentData: initialStudentData } = route.params;
  const { user, userProfile, academia } = useAuth();
  const { getString, isDarkMode } = useTheme();
  const [studentInfo, setStudentInfo] = useState<StudentData | null>(
    initialStudentData || null,
  );
  const [studentClasses, setStudentClasses] = useState<ClassData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(!initialStudentData);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics tracking
  useScreenTracking("StudentDetailsScreen", {
    academiaId: userProfile?.academiaId,
    studentId,
    userType: userProfile?.userType,
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  useEffect(() => {
    if (studentId) {
      loadStudentDetails();
    }
  }, [studentId]);

  useEffect(() => {
    navigation.setOptions({
      title: getString("studentDetails"),
    });
  }, [navigation, getString]);

  const loadStudentDetails = useCallback(async () => {
    try {
      setLoading(true);

      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString("academyIdNotFound"));
        return;
      }

      // Usar cache inteligente para dados do estudante
      const cacheKey = CACHE_KEYS.STUDENT_DETAILS(academiaId, studentId);

      const studentDetails = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log(
            "🔍 Buscando detalhes do estudante (cache miss):",
            studentId,
          );

          let studentData = studentInfo;
          if (!studentData) {
            studentData = (await academyFirestoreService.getById(
              "users",
              studentId,
            )) as StudentData;
          }

          // Usar batch processing para carregar dados relacionados
          const [allClasses, allPayments] = await Promise.all([
            academyFirestoreService.getAll("classes", academiaId),
            academyFirestoreService.getAll("payments", academiaId),
          ]);

          // Filtrar turmas do aluno
          const userClasses = allClasses.filter(
            (cls) =>
              studentData?.classIds && studentData.classIds.includes(cls.id),
          );

          // Filtrar pagamentos do aluno
          const userPayments = (allPayments as PaymentData[])
            .filter((payment) => payment.userId === studentId)
            .sort((a, b) => {
              const dateA = a.createdAt?.seconds
                ? new Date(a.createdAt.seconds * 1000)
                : new Date(a.createdAt);
              const dateB = b.createdAt?.seconds
                ? new Date(b.createdAt.seconds * 1000)
                : new Date(b.createdAt);
              return dateB.getTime() - dateA.getTime();
            });

          return {
            studentInfo: studentData,
            classes: userClasses,
            payments: userPayments,
          };
        },
        CACHE_TTL.MEDIUM, // Cache por 5 minutos
      );

      setStudentInfo(studentDetails.studentInfo);
      setStudentClasses(studentDetails.classes);
      setPayments(studentDetails.payments);

      console.log("✅ Detalhes do estudante carregados com sucesso");

      // Track analytics
      trackFeatureUsage("student_details_loaded", {
        studentId,
        academiaId,
        classesCount: studentDetails.classes.length,
        paymentsCount: studentDetails.payments.length,
      });
    } catch (error) {
      console.error("Erro ao carregar detalhes do aluno:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    studentId,
    userProfile?.academiaId,
    academia?.id,
    studentInfo,
    trackFeatureUsage,
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache para forçar refresh
    const academiaId = userProfile?.academiaId || academia?.id;
    if (academiaId) {
      cacheService.invalidatePattern(
        `student_details:${academiaId}:${studentId}`,
      );
    }
    loadStudentDetails();
  }, [loadStudentDetails, userProfile?.academiaId, academia?.id, studentId]);

  // Memoized utility functions
  const getPaymentStatusColor = useCallback((status: string) => {
    const colors: Record<string, string> = {
      paid: COLORS.primary[500],
      pending: COLORS.warning[500],
      overdue: COLORS.error[500],
    };
    return colors[status] || COLORS.gray[500];
  }, []);

  const getPaymentStatusText = useCallback(
    (status: string) => {
      const texts: Record<string, string> = {
        paid: getString("paid"),
        pending: getString("paymentPending"),
        overdue: getString("overdue"),
      };
      return texts[status] || status;
    },
    [getString],
  );

  const formatDate = useCallback((date: any) => {
    if (!date) return getString("dataNotAvailable");
    const dateObj = date.seconds
      ? new Date(date.seconds * 1000)
      : new Date(date);
    return dateObj.toLocaleDateString("pt-BR");
  }, []);

  const formatCurrency = useCallback((value: any) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: getString("currency"),
    }).format(value || 0);
  }, []);

  // Memoized navigation handlers
  const handleEditStudent = useCallback(() => {
    trackButtonClick("edit_student", { studentId });
    navigation.navigate("PhysicalEvaluation", {
      studentId,
      studentData: studentInfo,
    });
  }, [navigation, studentId, studentInfo, trackButtonClick]);

  const handleAddGraduation = useCallback(() => {
    trackButtonClick("add_graduation", { studentId });
    navigation.navigate("AddGraduation", {
      studentId,
      studentName: studentInfo?.name,
    });
  }, [navigation, studentId, studentInfo?.name, trackButtonClick]);

  const handleViewClassDetails = useCallback(
    (classItem: any) => {
      trackButtonClick("view_class_details", {
        classId: classItem.id,
        studentId,
      });
      navigation.navigate("ClassDetails", {
        classId: classItem.id,
        classData: classItem,
      });
    },
    [navigation, studentId, trackButtonClick],
  );

  const handleViewAllPayments = useCallback(() => {
    trackButtonClick("view_all_payments", { studentId });
    navigation.navigate("StudentPayments", { studentId });
  }, [navigation, studentId, trackButtonClick]);

  if (loading && !studentInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <StudentDetailsSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <EnhancedErrorBoundary
      onError={(error: Error, errorInfo: React.ErrorInfo, errorId: string) => {
        console.error("🚨 Erro no StudentDetailsScreen:", {
          error,
          errorInfo,
          errorId,
        });
      }}
      errorContext={{
        screen: "StudentDetailsScreen",
        academiaId: userProfile?.academiaId,
        studentId,
      }}
    >
      <LinearGradient
        colors={getAuthGradient(isDarkMode) as any}
        style={[
          styles.container,
          {
            minHeight: 0,
            height: Platform.OS === 'web' ? '100vh' : '100%',
            overflow: 'hidden'
          } as any
        ]}
      >
        <SafeAreaView style={[styles.safeArea, { minHeight: 0 }]}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.scrollContent, { minHeight: '101%' }]}
            alwaysBounceVertical={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary[500]}
              />
            }
          >
            {/* Informações do Aluno */}
            <View style={styles.glassCard}>
              <View style={styles.studentHeader}>
                <Avatar.Text
                  size={80}
                  label={studentInfo?.name?.charAt(0) || "A"}
                  style={styles.avatar}
                  labelStyle={styles.avatarText}
                />
                <View style={styles.studentInfo}>
                  <Text variant="headlineSmall" style={styles.studentName}>
                    {studentInfo?.name || getString("student")}
                  </Text>
                  <Text style={styles.studentEmail}>{studentInfo?.email}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: studentInfo?.isActive
                          ? COLORS.success[100]
                          : COLORS.error[100],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: studentInfo?.isActive
                            ? COLORS.success[700]
                            : COLORS.error[700],
                        },
                      ]}
                    >
                      {studentInfo?.isActive
                        ? getString("active")
                        : getString("inactive")}
                    </Text>
                  </View>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="call"
                      size={20}
                      color={COLORS.primary[500]}
                    />
                  </View>
                  <Text style={styles.infoText} numberOfLines={2} ellipsizeMode="tail">
                    {studentInfo?.phone || getString("phoneNotInformed")}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="location"
                      size={20}
                      color={COLORS.primary[500]}
                    />
                  </View>
                  <Text style={styles.infoText} numberOfLines={3} ellipsizeMode="tail">
                    {studentInfo?.address || getString("addressNotInformed")}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="calendar"
                      size={20}
                      color={COLORS.primary[500]}
                    />
                  </View>
                  <Text style={styles.infoText} numberOfLines={2} ellipsizeMode="tail">
                    {getString("registeredAt")}:{" "}
                    {formatDate(studentInfo?.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Turmas Matriculadas */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: COLORS.info[100] },
                  ]}
                >
                  <Ionicons name="school" size={24} color={COLORS.info[500]} />
                </View>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {getString("enrolledClasses")}
                </Text>
              </View>

              {studentClasses.length > 0 ? (
                studentClasses.map((classItem, index) => (
                  <View key={classItem.id || index} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <View style={styles.listItemLeft}>
                        <View
                          style={[
                            styles.miniIconContainer,
                            { backgroundColor: COLORS.secondary[100] },
                          ]}
                        >
                          <Ionicons
                            name="fitness"
                            size={18}
                            color={COLORS.secondary[500]}
                          />
                        </View>
                        <View>
                          <Text style={styles.listTitle}>{classItem.name}</Text>
                          <Text style={styles.listSubtitle}>
                            {classItem.modality}
                          </Text>
                        </View>
                      </View>
                      <Button
                        mode="text"
                        compact
                        onPress={() => handleViewClassDetails(classItem)}
                        textColor={COLORS.primary[500]}
                      >
                        {getString("details")}
                      </Button>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>
                  {getString("noClassesEnrolled")}
                </Text>
              )}
            </View>

            {/* Histórico de Pagamentos */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: COLORS.success[100] },
                  ]}
                >
                  <Ionicons name="card" size={24} color={COLORS.success[500]} />
                </View>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {getString("paymentHistory")}
                </Text>
              </View>

              {payments.length > 0 ? (
                payments.slice(0, 5).map((payment, index) => (
                  <View key={payment.id || index} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <View style={styles.listItemLeft}>
                        <View
                          style={[
                            styles.miniIconContainer,
                            { backgroundColor: COLORS.gray[100] },
                          ]}
                        >
                          <Ionicons
                            name="receipt"
                            size={18}
                            color={COLORS.gray[600]}
                          />
                        </View>
                        <View>
                          <Text style={styles.listTitle}>
                            {formatCurrency(payment.amount)}
                          </Text>
                          <Text style={styles.listSubtitle}>
                            {formatDate(payment.createdAt)}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor:
                              getPaymentStatusColor(payment.status) + "20",
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: getPaymentStatusColor(payment.status),
                            fontWeight: FONT_WEIGHT.bold,
                            fontSize: FONT_SIZE.xs,
                          }}
                        >
                          {getPaymentStatusText(payment.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>
                  {getString("noPaymentsRegistered")}
                </Text>
              )}

              {payments.length > 5 && (
                <Button
                  mode="outlined"
                  onPress={handleViewAllPayments}
                  style={styles.viewAllButton}
                  textColor={COLORS.primary[500]}
                >
                  {getString("viewAllPayments")}
                </Button>
              )}
            </View>

            {/* Ações */}
            <View style={styles.glassCard}>
              <Text
                variant="titleMedium"
                style={[styles.cardTitle, { marginBottom: SPACING.md }]}
              >
                {getString("actions")}
              </Text>

              <View style={styles.actionsContainer}>
                <Button
                  mode="contained"
                  onPress={handleEditStudent}
                  style={[
                    styles.actionButton,
                    { backgroundColor: COLORS.info[500] },
                  ]}
                  icon="pencil"
                >
                  {getString("editStudent")}
                </Button>

                <Button
                  mode="contained"
                  onPress={handleAddGraduation}
                  style={[
                    styles.actionButton,
                    { backgroundColor: COLORS.primary[500] },
                  ]}
                  icon="trophy"
                >
                  {getString("addGraduation")}
                </Button>
              </View>
            </View>
          </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  glassCard: {
    margin: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: hexToRgba(COLORS.white, 0.9),
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.white, 0.5),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 8px 32px 0 ${hexToRgba(COLORS.special.premium, 0.15)}`,
        backdropFilter: "blur(10px)",
      },
    }),
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatar: {
    backgroundColor: COLORS.primary[500],
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.xxl,
  },
  studentInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray[900],
  },
  studentEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  statusBadge: {
    marginTop: SPACING.sm,
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: "uppercase",
  },
  divider: {
    marginVertical: SPACING.md,
    backgroundColor: COLORS.gray[200],
  },
  infoSection: {
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    marginLeft: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[800],
    flex: 1,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  cardTitle: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray[900],
  },
  noDataText: {
    textAlign: "center",
    color: COLORS.gray[500],
    fontStyle: "italic",
    padding: SPACING.lg,
  },
  listItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  listItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  miniIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  listTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray[900],
  },
  listSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
  },
  statusChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  viewAllButton: {
    marginTop: SPACING.md,
    borderColor: COLORS.primary[500],
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
});

export default StudentDetailsScreen;
