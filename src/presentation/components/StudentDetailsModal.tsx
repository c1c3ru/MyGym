import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    Platform,
    RefreshControl,
    Animated,
} from "react-native";
import { Text, Button, Avatar, Divider, IconButton, Snackbar } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@contexts/ThemeContext";
import { academyFirestoreService, academyClassService } from "@infrastructure/services/academyFirestoreService";
import { useAuthFacade } from "@presentation/auth/AuthFacade";
import EnhancedErrorBoundary from "@components/EnhancedErrorBoundary";
import { GlassCard } from "./modern";
import cacheService, {
    CACHE_KEYS,
    CACHE_TTL,
} from "@infrastructure/services/cacheService";
import { useUserActionTracking } from "@hooks/useAnalytics";
import StudentDetailsSkeleton from "@components/skeletons/StudentDetailsSkeleton";
import {
    COLORS,
    SPACING,
    FONT_SIZE,
    BORDER_RADIUS,
    FONT_WEIGHT,
} from "@presentation/theme/designTokens";
import { hexToRgba } from "@shared/utils/colorUtils";
import type { NavigationProp } from "@react-navigation/native";

interface StudentData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    isActive: boolean;
    createdAt: any;
    classIds?: string[];
    birthDate?: any;
    cpf?: string;
    currentGraduation?: string;
    currentPlan?: string;
    emergencyContact?: string;
    gender?: string;
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
    createdAt: any;
    [key: string]: any;
}

interface StudentDetailsModalProps {
    studentId: string;
    studentData?: StudentData | null;
    onClose: () => void;
    navigation?: NavigationProp<any>;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
    studentId,
    studentData: initialStudentData,
    onClose,
    navigation,
}) => {
    const { user, userProfile, academia, customClaims } = useAuthFacade();
    const { getString, isDarkMode, theme } = useTheme();
    const [studentInfo, setStudentInfo] = useState<StudentData | null>(
        initialStudentData || null,
    );
    const [studentClasses, setStudentClasses] = useState<ClassData[]>([]);
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [loading, setLoading] = useState(!initialStudentData);
    const [refreshing, setRefreshing] = useState(false);
    const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

    // Animações
    const slideAnim = useMemo(() => new Animated.Value(50), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);

    const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

    const colors = theme?.colors || COLORS;
    const textColor = isDarkMode ? COLORS.gray[100] : COLORS.gray[900];
    const backgroundColor = isDarkMode ? COLORS.gray[900] : COLORS.white;
    const surfaceColor = isDarkMode ? COLORS.gray[800] : COLORS.gray[50];

    useEffect(() => {
        // Animação de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();

        if (studentId) {
            loadStudentDetails();
        }
    }, [studentId]);

    const loadStudentDetails = useCallback(async () => {
        try {
            setLoading(true);

            const academiaId = userProfile?.academiaId || academia?.id;
            if (!academiaId) {
                console.error(getString("academyIdNotFound"));
                setSnackbar({ visible: true, message: getString("academyIdNotFound"), type: 'error' });
                return;
            }

            const cacheKey = CACHE_KEYS.STUDENT_DETAILS(academiaId, studentId);
            const userRole = userProfile?.userType || customClaims?.role;

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

                    // Fetch classes - instructors can only see their own classes
                    let allClasses: any[] = [];
                    try {
                        if (userRole === 'admin') {
                            allClasses = await academyFirestoreService.getAll("classes", academiaId);
                        } else if (userRole === 'instructor') {
                            // Instructors can only see their own classes
                            allClasses = await academyClassService.getClassesByInstructor(user?.id, academiaId);
                        }
                    } catch (error: any) {
                        console.warn("⚠️ Erro ao buscar classes:", error?.message || error);
                        // Continue with empty classes array
                    }

                    const userClasses = allClasses.filter(
                        (cls: any) =>
                            studentData?.classIds && studentData.classIds.includes(cls.id),
                    ) as ClassData[];

                    // Fetch payments - only admins can see payments
                    let userPayments: PaymentData[] = [];
                    try {
                        if (userRole === 'admin') {
                            const allPayments = await academyFirestoreService.getAll("payments", academiaId);
                            userPayments = (allPayments as PaymentData[])
                                .filter((payment) => payment.userId === studentId || payment.studentId === studentId)
                                .sort((a, b) => {
                                    const dateA = a.createdAt?.seconds
                                        ? new Date(a.createdAt.seconds * 1000)
                                        : new Date(a.createdAt);
                                    const dateB = b.createdAt?.seconds
                                        ? new Date(b.createdAt.seconds * 1000)
                                        : new Date(b.createdAt);
                                    return dateB.getTime() - dateA.getTime();
                                });
                        } else {
                            console.log("ℹ️ Usuário não é admin, pulando busca de pagamentos");
                        }
                    } catch (error: any) {
                        console.warn("⚠️ Erro ao buscar pagamentos:", error?.message || error);
                        // Continue with empty payments array
                    }

                    return {
                        studentInfo: studentData,
                        classes: userClasses,
                        payments: userPayments,
                    };
                },
                CACHE_TTL.MEDIUM,
            );

            setStudentInfo(studentDetails.studentInfo);
            setStudentClasses(studentDetails.classes);
            setPayments(studentDetails.payments);

            console.log("✅ Detalhes do estudante carregados com sucesso");

            trackFeatureUsage("student_details_loaded", {
                studentId,
                academiaId,
                classesCount: studentDetails.classes.length,
                paymentsCount: studentDetails.payments.length,
            });
        } catch (error: any) {
            console.error("Erro ao carregar detalhes do aluno:", error);
            const errorMessage = error?.message?.includes('permission')
                ? 'Sem permissão para acessar estes dados'
                : 'Erro ao carregar dados do aluno';
            setSnackbar({ visible: true, message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [
        studentId,
        userProfile?.academiaId,
        userProfile?.userType,
        academia?.id,
        user?.id,
        customClaims?.role,
        studentInfo,
        trackFeatureUsage,
        getString,
    ]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        const academiaId = userProfile?.academiaId || academia?.id;
        if (academiaId) {
            cacheService.invalidatePattern(
                `student_details:${academiaId}:${studentId}`,
            );
        }
        loadStudentDetails();
    }, [loadStudentDetails, userProfile?.academiaId, academia?.id, studentId]);

    const getPaymentStatusColor = useCallback((status: string) => {
        const colors: Record<string, string> = {
            paid: COLORS.success[500],
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
    }, [getString]);

    const formatCurrency = useCallback((value: any) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: getString("currency"),
        }).format(value || 0);
    }, [getString]);

    const handleEditStudent = useCallback(() => {
        trackButtonClick("edit_student", { studentId });
        if (navigation) {
            navigation.navigate("PhysicalEvaluation", {
                studentId,
                studentData: studentInfo,
            });
            onClose();
        }
    }, [navigation, studentId, studentInfo, trackButtonClick, onClose]);

    const handleAddGraduation = useCallback(() => {
        trackButtonClick("add_graduation", { studentId });
        if (navigation) {
            navigation.navigate("AddGraduation", {
                studentId,
                studentName: studentInfo?.name,
            });
            onClose();
        }
    }, [navigation, studentId, studentInfo?.name, trackButtonClick, onClose]);

    const handleViewClassDetails = useCallback(
        (classItem: any) => {
            trackButtonClick("view_class_details", {
                classId: classItem.id,
                studentId,
            });
            if (navigation) {
                navigation.navigate("ClassDetails", {
                    classId: classItem.id,
                    classData: classItem,
                });
                onClose();
            }
        },
        [navigation, studentId, trackButtonClick, onClose],
    );

    const handleViewAllPayments = useCallback(() => {
        trackButtonClick("view_all_payments", { studentId });
        if (navigation) {
            navigation.navigate("StudentPayments", { studentId });
            onClose();
        }
    }, [navigation, studentId, trackButtonClick, onClose]);

    const styles = useMemo(() => createStyles(backgroundColor, surfaceColor, textColor, isDarkMode), [backgroundColor, surfaceColor, textColor, isDarkMode]);

    if (loading && !studentInfo) {
        return (
            <Animated.View
                style={{
                    flex: 1,
                    backgroundColor,
                    opacity: fadeAnim,
                }}
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{getString("studentDetails")}</Text>
                    <IconButton icon="close" onPress={onClose} iconColor={textColor} />
                </View>
                <StudentDetailsSkeleton />
            </Animated.View>
        );
    }

    return (
        <EnhancedErrorBoundary
            onError={(error: Error, errorInfo: React.ErrorInfo, errorId: string) => {
                console.error("🚨 Erro no StudentDetailsModal:", {
                    error,
                    errorInfo,
                    errorId,
                });
            }}
            errorContext={{
                screen: "StudentDetailsModal",
                academiaId: userProfile?.academiaId,
                studentId,
            }}
        >
            <Animated.View
                style={{
                    flex: 1,
                    backgroundColor,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }}
            >
                {/* Header do Modal */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{getString("studentDetails")}</Text>
                    <IconButton icon="close" onPress={onClose} iconColor={textColor} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={COLORS.primary[500]}
                        />
                    }
                >
                    {/* Informações do Aluno */}
                    <GlassCard
                        style={styles.glassCard}
                        variant="card"
                        padding={0} // Padding handled by specific style if needed, or moved here
                    >
                        <View style={{ padding: SPACING.lg }}>
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
                                                    ? hexToRgba(COLORS.success[500], 0.15)
                                                    : hexToRgba(COLORS.error[500], 0.15),
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

                            <Text style={styles.sectionTitle}>📋 {getString("personalInfo")}</Text>

                            <View style={styles.infoSection}>
                                <View style={styles.infoRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name="call"
                                            size={20}
                                            color={COLORS.primary[500]}
                                        />
                                    </View>
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>{getString("phone")}</Text>
                                        <Text style={styles.infoText}>
                                            {studentInfo?.phone || getString("phoneNotInformed")}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.infoRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name="location"
                                            size={20}
                                            color={COLORS.primary[500]}
                                        />
                                    </View>
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>{getString("address")}</Text>
                                        <Text style={styles.infoText} numberOfLines={3}>
                                            {studentInfo?.address || getString("addressNotInformed")}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.infoRow}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons
                                            name="calendar"
                                            size={20}
                                            color={COLORS.primary[500]}
                                        />
                                    </View>
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>{getString("registeredAt")}</Text>
                                        <Text style={styles.infoText}>
                                            {formatDate(studentInfo?.createdAt)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </GlassCard>

                    {/* Turmas Matriculadas */}
                    <GlassCard
                        style={styles.glassCard}
                        variant="card"
                        padding={0} // Padding handled inside
                    >
                        <View style={{ padding: SPACING.lg }}>
                            <View style={styles.cardHeader}>
                                <View
                                    style={[
                                        styles.iconContainer,
                                        { backgroundColor: hexToRgba(COLORS.info[500], 0.15) },
                                    ]}
                                >
                                    <Ionicons name="school" size={24} color={COLORS.info[500]} />
                                </View>
                                <Text style={styles.cardTitle}>
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
                                                        { backgroundColor: hexToRgba(COLORS.secondary[500], 0.15) },
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name="fitness"
                                                        size={18}
                                                        color={COLORS.secondary[500]}
                                                    />
                                                </View>
                                                <View style={{ flex: 1 }}>
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
                    </GlassCard>

                    {/* Histórico de Pagamentos */}
                    <GlassCard
                        style={styles.glassCard}
                        variant="card"
                        padding={0} // Padding handled inside
                    >
                        <View style={{ padding: SPACING.lg }}>
                            <View style={styles.cardHeader}>
                                <View
                                    style={[
                                        styles.iconContainer,
                                        { backgroundColor: hexToRgba(COLORS.success[500], 0.15) },
                                    ]}
                                >
                                    <Ionicons name="card" size={24} color={COLORS.success[500]} />
                                </View>
                                <Text style={styles.cardTitle}>
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
                                                        { backgroundColor: hexToRgba(COLORS.gray[500], 0.15) },
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
                                                            hexToRgba(getPaymentStatusColor(payment.status), 0.15),
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
                    </GlassCard>

                    {/* Ações */}
                    <View style={styles.buttonContainer}>
                        <Button
                            mode="outlined"
                            onPress={onClose}
                            style={styles.button}
                            textColor={textColor}
                            contentStyle={{ paddingVertical: 8 }}
                        >
                            {getString("close")}
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleEditStudent}
                            style={[styles.button, { backgroundColor: COLORS.info[500] }]}
                            icon="pencil"
                            contentStyle={{ paddingVertical: 8 }}
                        >
                            {getString("editStudent")}
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleAddGraduation}
                            style={[styles.button, { backgroundColor: COLORS.primary[500] }]}
                            icon="trophy"
                            contentStyle={{ paddingVertical: 8 }}
                        >
                            {getString("addGraduation")}
                        </Button>
                    </View>

                    <View style={{ height: 60 }} />
                </ScrollView>

                <Snackbar
                    visible={snackbar.visible}
                    onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
                    duration={3000}
                    style={{
                        backgroundColor: snackbar.type === 'error' ? COLORS.error[600] : COLORS.success[600],
                        marginBottom: SPACING.lg
                    }}
                >
                    {snackbar.message}
                </Snackbar>
            </Animated.View>
        </EnhancedErrorBoundary>
    );
};

const createStyles = (backgroundColor: string, surfaceColor: string, textColor: string, isDarkMode: boolean) => StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? COLORS.gray[700] : COLORS.gray[200],
        backgroundColor: surfaceColor,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: `0 2px 8px ${hexToRgba(COLORS.black, 0.1)}`,
            },
        }),
    },
    headerTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: textColor,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    glassCard: {
        marginBottom: SPACING.lg,
        // Background, Border and Shadow handled by GlassCard component
    },
    studentHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.md,
    },
    avatar: {
        backgroundColor: COLORS.primary[500],
        borderWidth: 3,
        borderColor: isDarkMode ? COLORS.gray[700] : COLORS.white,
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
        color: textColor,
    },
    studentEmail: {
        fontSize: FONT_SIZE.sm,
        color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600],
        marginTop: 2,
    },
    statusBadge: {
        marginTop: SPACING.sm,
        alignSelf: "flex-start",
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    statusText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.bold,
        textTransform: "uppercase",
    },
    divider: {
        marginVertical: SPACING.md,
        backgroundColor: isDarkMode ? COLORS.gray[700] : COLORS.gray[200],
    },
    sectionTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        marginBottom: SPACING.md,
        color: textColor,
    },
    infoSection: {
        gap: SPACING.md,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: hexToRgba(COLORS.primary[500], 0.15),
        justifyContent: "center",
        alignItems: "center",
    },
    infoTextContainer: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    infoLabel: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.semibold,
        color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600],
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    infoText: {
        fontSize: FONT_SIZE.md,
        color: textColor,
        flexWrap: "wrap",
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
        color: textColor,
    },
    noDataText: {
        textAlign: "center",
        color: isDarkMode ? COLORS.gray[500] : COLORS.gray[500],
        fontStyle: "italic",
        padding: SPACING.lg,
    },
    listItem: {
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? COLORS.gray[700] : COLORS.gray[100],
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
        marginRight: SPACING.sm,
    },
    miniIconContainer: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.full,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.md,
    },
    listTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold,
        color: textColor,
    },
    listSubtitle: {
        fontSize: FONT_SIZE.sm,
        color: isDarkMode ? COLORS.gray[400] : COLORS.gray[500],
    },
    statusChip: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    viewAllButton: {
        marginTop: SPACING.md,
        borderColor: COLORS.primary[500],
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.lg,
        gap: SPACING.sm,
        flexWrap: 'wrap',
    },
    button: {
        flex: 1,
        minWidth: 100,
        borderRadius: BORDER_RADIUS.lg,
        elevation: 2,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: `0 2px 8px ${hexToRgba(COLORS.black, 0.1)}`,
            },
        }),
    },
});

export default StudentDetailsModal;
