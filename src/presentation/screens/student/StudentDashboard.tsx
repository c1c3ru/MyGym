import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Animated,
    Platform,
    TouchableOpacity
} from 'react-native';
import {
    Chip,
    Divider,
    List,
    Avatar,
    Text,
    Card,
    Button,
    ActivityIndicator,
    Modal,
    Portal,
    IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { academyFirestoreService, academyAnnouncementService } from '@infrastructure/services/academyFirestoreService';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@infrastructure/services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import { useOnboarding } from '@components/OnboardingTour';
import { useTheme } from '@contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import StudentDashboardSkeleton from '@components/skeletons/StudentDashboardSkeleton';
import CheckInModalContent from '@screens/student/CheckInModalContent';
import { getGraduationEligibility } from '@shared/utils/graduationRules';

import { SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '@presentation/theme/designTokens';

const AnimatedCard: React.FC<{
    children: React.ReactNode;
    delay?: number;
    style?: any;
    colors: any;
}> = ({ children, delay = 0, style, colors }) => {
    const slideAnim = useRef(new Animated.Value(20)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 500,
                delay,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start();
    }, [delay, slideAnim, opacityAnim]);

    return (
        <Animated.View
            style={{
                opacity: opacityAnim,
                transform: [{ translateY: slideAnim as any }],
                marginBottom: SPACING.md
            }}
        >
            <Card style={[{ borderRadius: BORDER_RADIUS.md, elevation: 2 }, { backgroundColor: colors.surface }, style]}>
                <Card.Content>
                    {children}
                </Card.Content>
            </Card>
        </Animated.View>
    );
};

const StudentDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user, userProfile, academia } = useAuthFacade();
    const { getString, theme } = useTheme();
    const colors = theme.colors;

    const styles = useMemo(() => createStyles(colors), [colors]);

    const [nextClasses, setNextClasses] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [dashboardData, setDashboardData] = useState<any>({
        nextEvaluation: '2 ' + getString('months'),
        totalClasses: 0,
        attendanceRate: 0
    });

    const [loading, setLoading] = useState(true);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal States
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

    // Analytics
    useScreenTracking('StudentDashboard', {
        academiaId: userProfile?.academiaId,
        userType: 'student',
        studentId: user?.id
    });
    const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

    // Onboarding
    const { startTour } = useOnboarding() as any;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loading) {
                startTour('STUDENT_DASHBOARD');
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [loading, startTour]);

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            if (!userProfile?.academiaId || !user?.id) return;

            const cacheKey = CACHE_KEYS.STUDENT_DASHBOARD(userProfile.academiaId, user.id);

            const studentData = await cacheService.getOrSet(
                cacheKey,
                async () => {
                    const [userClasses, userAnnouncements, studentProfile] = await Promise.all([
                        academyFirestoreService.getWhere('classes', 'studentIds', 'array-contains', user.id, userProfile.academiaId).catch(() => []),
                        (academyAnnouncementService as any).getActiveAnnouncements(userProfile.academiaId, 'student').catch(() => []),
                        (academyFirestoreService.getById('students', user.id, userProfile.academiaId) as Promise<any>).catch(() => null)
                    ]);

                    const nextClasses = userClasses
                        .filter((cls: any) => cls.status === 'active')
                        .map((cls: any) => ({
                            id: cls.id,
                            name: cls.name,
                            time: cls.schedule?.[0]?.time || '00:00',
                            date: getString('today'),
                            instructor: cls.instructorName || getString('instructor')
                        }))
                        .slice(0, 3);

                    // --- INÍCIO: Notificações Automáticas (Client-side) ---
                    const currentDate = new Date();
                    const syntheticAnnouncements: any[] = [];

                    // 1. Verificação de Aniversário
                    if (studentProfile?.birthDate) {
                        try {
                            const dob = studentProfile.birthDate.toDate ? studentProfile.birthDate.toDate() : new Date(studentProfile.birthDate);

                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
                            thisYearBday.setHours(0, 0, 0, 0);

                            if (thisYearBday < today) {
                                thisYearBday.setFullYear(today.getFullYear() + 1);
                            }

                            const diffTime = thisYearBday.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays === 0) {
                                syntheticAnnouncements.push({
                                    id: 'auto-bday-today',
                                    title: '🎉 Feliz Aniversário!',
                                    message: `Parabéns ${userProfile.name}! Toda a equipe deseja um dia incrível e muitas conquistas no tatame! Oss!`,
                                    date: getString('today'),
                                    priority: 10,
                                    isAuto: true
                                });
                            } else if (diffDays <= 7) {
                                syntheticAnnouncements.push({
                                    id: 'auto-bday-soon',
                                    title: '🎂 Aniversário Chegando!',
                                    message: `Faltam ${diffDays} dias para o seu aniversário! Prepare-se para comemorar!`,
                                    date: thisYearBday.toLocaleDateString('pt-BR'),
                                    priority: 5,
                                    isAuto: true
                                });
                            }
                        } catch (e) {
                            console.error('Erro ao calcular aniversário', e);
                        }
                    }

                    // 2. Verificação de Graduação
                    if (studentProfile?.currentBelt) {
                        try {
                            const lastGradDate = studentProfile.lastGraduationDate
                                ? (studentProfile.lastGraduationDate.toDate ? studentProfile.lastGraduationDate.toDate() : new Date(studentProfile.lastGraduationDate))
                                : (studentProfile.createdAt?.toDate ? studentProfile.createdAt.toDate() : new Date(studentProfile.createdAt || Date.now()));

                            const modality = studentProfile.modality || (academia as any)?.modality || 'Jiu-Jitsu';
                            const eligibility = getGraduationEligibility(modality, studentProfile.currentBelt, lastGradDate);

                            if (eligibility) {
                                if (eligibility.isEligible) {
                                    syntheticAnnouncements.push({
                                        id: 'auto-grad-eligible',
                                        title: '🥋 Nova Faixa à Vista?',
                                        message: `Segundo as regras da federação, você já cumpriu o tempo na faixa atual. Consulte seu professor!`,
                                        date: getString('today'),
                                        priority: 8,
                                        isAuto: true
                                    });
                                } else if (eligibility.isClose) {
                                    syntheticAnnouncements.push({
                                        id: 'auto-grad-soon',
                                        title: '⏳ Quase lá!',
                                        message: `Falta 1 mês para o tempo mínimo na faixa atual. Foco total!`,
                                        date: getString('thisMonth'),
                                        priority: 6,
                                        isAuto: true
                                    });
                                }
                            }
                        } catch (e) {
                            console.error('Erro ao calcular graduação', e);
                        }
                    }
                    // --- FIM: Notificações Automáticas ---

                    const formattedAnnouncements = (userAnnouncements as any[]).map((ann: any) => ({
                        id: ann.id,
                        title: ann.title,
                        message: ann.message || ann.content || ann.description || '',
                        date: formatDate(ann.createdAt),
                        priority: ann.priority || 0
                    }));

                    const allAnnouncements = [...syntheticAnnouncements, ...formattedAnnouncements];
                    allAnnouncements.sort((a, b) => b.priority - a.priority);

                    // Filtrar avisos lidos localmente
                    const readAnnouncementsJson = await AsyncStorage.getItem(`read_announcements_${user.id}`);
                    const readAnnouncements = readAnnouncementsJson ? JSON.parse(readAnnouncementsJson) : [];

                    const filteredAnnouncements = allAnnouncements.filter((ann: any) => !readAnnouncements.includes(ann.id));

                    const dashboardInfo = {
                        graduationStatus: studentProfile?.currentBelt || studentProfile?.currentGraduation || getString('whiteBelt'),
                        nextEvaluation: studentProfile?.nextEvaluationDate || ('2 ' + getString('months')),
                        totalClasses: userClasses.length,
                        attendanceRate: studentProfile?.attendanceRate || 0
                    };

                    return { nextClasses, announcements: filteredAnnouncements, dashboardData: dashboardInfo };
                },
                CACHE_TTL.SHORT
            );

            setNextClasses(studentData.nextClasses);
            setAnnouncements(studentData.announcements);
            setDashboardData(studentData.dashboardData);

            trackFeatureUsage('student_dashboard_loaded', {
                academiaId: userProfile.academiaId,
                studentId: user.id
            });

        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
        } finally {
            setLoading(false);
            setLoadingAnnouncements(false);
            setRefreshing(false);
        }
    }, [user?.id, userProfile?.academiaId, getString, trackFeatureUsage]);

    const formatDate = useCallback((date: any) => {
        if (!date) return getString('unknownDate');
        try {
            const now = new Date();
            const announcementDate = date.toDate ? date.toDate() : new Date(date);
            const diffTime = Math.abs(now.getTime() - announcementDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return getString('today');
            if (diffDays === 1) return getString('yesterday');
            return announcementDate.toLocaleDateString('pt-BR');
        } catch (error) {
            return getString('unknownDate');
        }
    }, [getString]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        if (userProfile?.academiaId && user?.id) {
            cacheService.invalidatePattern(`student_dashboard:${userProfile.academiaId}:${user.id}`);
        }
        loadDashboardData();
    }, [loadDashboardData, userProfile?.academiaId, user?.id]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const handleCloseAnnouncement = async () => {
        if (selectedAnnouncement && user?.id) {
            try {
                // Marcar como lido localmente
                const readAnnouncementsJson = await AsyncStorage.getItem(`read_announcements_${user.id}`);
                const readAnnouncements = readAnnouncementsJson ? JSON.parse(readAnnouncementsJson) : [];

                if (!readAnnouncements.includes(selectedAnnouncement.id)) {
                    const newReadAnnouncements = [...readAnnouncements, selectedAnnouncement.id];
                    await AsyncStorage.setItem(`read_announcements_${user.id}`, JSON.stringify(newReadAnnouncements));

                    // Atualizar lista removendo o item lido
                    setAnnouncements(prev => prev.filter(a => a.id !== selectedAnnouncement.id));
                }
            } catch (error) {
                console.error('Error marking announcement as read:', error);
            }
        }
        setSelectedAnnouncement(null);
    };

    if (loading) {
        return <SafeAreaView style={styles.skeletonContainer}><StudentDashboardSkeleton /></SafeAreaView>;
    }

    return (
        <EnhancedErrorBoundary errorContext={{ screen: 'StudentDashboard', academiaId: userProfile?.academiaId, studentId: user?.id }}>
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {/* Header / Welcome Banner */}
                    <AnimatedCard delay={0} colors={colors}>
                        <View style={styles.welcomeBanner}>
                            <Avatar.Text
                                size={56}
                                label={userProfile?.name?.charAt(0) || 'U'}
                                style={{ backgroundColor: colors.primary }}
                                labelStyle={{ color: colors.onPrimary }}
                            />
                            <View style={styles.welcomeInfo}>
                                <Text style={styles.greetingText}>
                                    {getString('hello')}, {userProfile?.name?.split(' ')[0] || getString('student')}!
                                </Text>
                                <Text style={styles.academyNameText}>
                                    🏛️ {(userProfile as any)?.academiaName || academia?.name || getString('academy')}
                                </Text>
                                <Text style={styles.welcomeBackText}>
                                    {getString('welcomeBackToAcademy')}
                                </Text>
                            </View>
                        </View>
                    </AnimatedCard>

                    {/* Graduation Status */}
                    <AnimatedCard delay={100} colors={colors}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="trophy-outline" size={24} color={colors.primary} />
                            <Text style={styles.cardTitle}>{getString('graduationStatus')}</Text>
                        </View>
                        <View style={styles.graduationContent}>
                            <Chip
                                mode="outlined"
                                style={[styles.beltChip, { borderColor: colors.primary }]}
                                textStyle={[styles.beltChipText, { color: colors.primary }]}
                            >
                                {dashboardData.graduationStatus}
                            </Chip>
                            <Text style={styles.graduationSubtext}>
                                {getString('nextEvaluationIn')} {dashboardData.nextEvaluation}
                            </Text>
                        </View>
                    </AnimatedCard>

                    {/* Upcoming Classes */}
                    <AnimatedCard delay={200} colors={colors}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                            <Text style={styles.cardTitle}>{getString('upcomingClasses')}</Text>
                        </View>

                        {nextClasses.length > 0 ? (
                            nextClasses.map((cls, idx) => (
                                <List.Item
                                    key={cls.id}
                                    title={cls.name}
                                    titleStyle={styles.classTitle}
                                    description={`${cls.date} ${getString('at')} ${cls.time} • ${cls.instructor}`}
                                    descriptionStyle={styles.classDesc}
                                    left={props => <List.Icon {...props} icon="bookmark-outline" color={colors.primary} />}
                                    style={styles.listItem}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>{getString('noClassesScheduled')}</Text>
                            </View>
                        )}

                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('Calendar')}
                            style={styles.viewMoreBtn}
                            textColor={colors.primary}
                        >
                            {getString('viewFullCalendar')}
                        </Button>
                    </AnimatedCard>

                    {/* Announcements */}
                    <AnimatedCard delay={300} colors={colors}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="megaphone-outline" size={24} color={colors.primary} />
                            <Text style={styles.cardTitle}>{getString('announcements')}</Text>
                            <ActivityIndicator
                                animating={loadingAnnouncements}
                                size="small"
                                color={colors.primary}
                                style={{ opacity: loadingAnnouncements ? 1 : 0 }}
                            />
                        </View>

                        {announcements.length > 0 ? (
                            announcements.map((ann, idx) => (
                                <TouchableOpacity
                                    key={ann.id}
                                    onPress={() => setSelectedAnnouncement(ann)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.announcementBox}>
                                        <View style={styles.announcementHeader}>
                                            <Text style={styles.annTitle}>{ann.title}</Text>
                                            <Text style={styles.annDate}>{ann.date}</Text>
                                        </View>
                                        <Text style={styles.annMsg} numberOfLines={2}>{ann.message}</Text>
                                        {idx < announcements.length - 1 && <Divider style={styles.annDivider} />}
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="notifications-off-outline" size={40} color={colors.onSurfaceVariant} />
                                <Text style={styles.emptyText}>{getString('noAnnouncementsNow')}</Text>
                            </View>
                        )}
                    </AnimatedCard>

                    {/* Quick Actions */}
                    <AnimatedCard delay={400} colors={colors}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="flash-outline" size={24} color={colors.primary} />
                            <Text style={styles.cardTitle}>{getString('quickActions')}</Text>
                        </View>
                        <View style={styles.actionsGrid}>
                            <Button
                                mode="contained"
                                icon="qrcode-scan"
                                onPress={() => setShowCheckInModal(true)}
                                style={styles.actionButton}
                                buttonColor={colors.primary}
                                textColor={colors.onPrimary}
                            >
                                {getString('checkIn')}
                            </Button>
                            <Button
                                mode="outlined"
                                icon="credit-card"
                                onPress={() => navigation.navigate('Payments')}
                                style={styles.actionButton}
                                textColor={colors.primary}
                                theme={{ colors: { outline: colors.primary } }}
                            >
                                {getString('payments')}
                            </Button>
                        </View>
                    </AnimatedCard>
                </ScrollView>
            </SafeAreaView>

            {/* Modais */}
            <Portal>
                {/* Modal de Check-In */}
                <Modal
                    visible={showCheckInModal}
                    onDismiss={() => setShowCheckInModal(false)}
                    contentContainerStyle={{
                        backgroundColor: 'transparent', // O CheckInModalContent tem seu próprio background/container
                        padding: 20,
                        margin: 20,
                    }}
                >
                    <CheckInModalContent onClose={() => setShowCheckInModal(false)} />
                </Modal>

                {/* Modal de Detalhes do Aviso */}
                <Modal
                    visible={!!selectedAnnouncement}
                    onDismiss={handleCloseAnnouncement}
                    contentContainerStyle={{
                        backgroundColor: colors.surface,
                        padding: 20,
                        margin: 20,
                        borderRadius: BORDER_RADIUS.md,
                        maxWidth: 500,
                        alignSelf: 'center',
                        width: '90%',
                        elevation: 5,
                        zIndex: 9999
                    }}
                >
                    {selectedAnnouncement && (
                        <View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md }}>
                                <Text style={{ fontSize: FONT_SIZE.xl, fontWeight: 'bold', flex: 1, color: colors.onSurface }}>
                                    {selectedAnnouncement.title}
                                </Text>
                                <IconButton
                                    icon="close"
                                    size={20}
                                    onPress={handleCloseAnnouncement}
                                    style={{ margin: 0, marginTop: -5, marginRight: -10 }}
                                />
                            </View>

                            <Text style={{ color: colors.onSurfaceVariant, fontSize: FONT_SIZE.sm, marginBottom: SPACING.lg }}>
                                {selectedAnnouncement.date}
                            </Text>

                            <ScrollView style={{ maxHeight: 300 }}>
                                <Text style={{ fontSize: FONT_SIZE.md, lineHeight: 24, color: colors.onSurface }}>
                                    {selectedAnnouncement.message}
                                </Text>
                            </ScrollView>

                            <Button
                                mode="contained"
                                onPress={handleCloseAnnouncement}
                                style={{ marginTop: SPACING.lg, alignSelf: 'flex-end' }}
                            >
                                {getString('close')}
                            </Button>
                        </View>
                    )}
                </Modal>
            </Portal>

        </EnhancedErrorBoundary>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    skeletonContainer: {
        flex: 1,
        backgroundColor: colors.background
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.md,
        paddingBottom: SPACING.xl
    },
    card: {
        borderRadius: BORDER_RADIUS.md,
        elevation: 2,
    },
    welcomeBanner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    welcomeInfo: {
        marginLeft: SPACING.md,
        flex: 1
    },
    greetingText: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: colors.onSurface,
    },
    welcomeBackText: {
        fontSize: FONT_SIZE.sm,
        color: colors.onSurfaceVariant,
        marginTop: 2
    },
    academyNameText: {
        fontSize: FONT_SIZE.base,
        color: colors.primary,
        fontWeight: '600',
        marginTop: 2
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        gap: SPACING.sm
    },
    cardTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: '700',
        color: colors.onSurface,
        flex: 1
    },
    graduationContent: {
        alignItems: 'center',
        paddingVertical: SPACING.sm
    },
    beltChip: {
        marginBottom: SPACING.sm,
    },
    beltChipText: {
        fontWeight: 'bold',
        fontSize: FONT_SIZE.md
    },
    graduationSubtext: {
        color: colors.onSurfaceVariant,
        fontSize: FONT_SIZE.sm
    },
    listItem: {
        paddingHorizontal: 0,
    },
    classTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: colors.onSurface
    },
    classDesc: {
        fontSize: FONT_SIZE.sm,
        color: colors.onSurfaceVariant
    },
    viewMoreBtn: {
        alignSelf: 'center',
        marginTop: SPACING.sm
    },
    announcementBox: {
        marginBottom: SPACING.sm
    },
    announcementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4
    },
    annTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: 'bold',
        color: colors.onSurface,
        flex: 1,
        marginRight: SPACING.sm
    },
    annDate: {
        fontSize: 12,
        color: colors.onSurfaceVariant,
        textTransform: 'uppercase'
    },
    annMsg: {
        fontSize: FONT_SIZE.sm,
        color: colors.onSurfaceVariant,
        lineHeight: 20
    },
    annDivider: {
        marginVertical: SPACING.md,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    emptyText: {
        color: colors.onSurfaceVariant,
        fontSize: FONT_SIZE.sm,
        marginTop: SPACING.sm,
        textAlign: 'center'
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: SPACING.sm,
        paddingTop: SPACING.xs
    },
    actionButton: {
        flex: 1
    }
});

export default StudentDashboard;
