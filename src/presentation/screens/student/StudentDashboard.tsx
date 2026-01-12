import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Platform
} from 'react-native';
import {
    Chip,
    Divider,
    List,
    Avatar,
    Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { academyFirestoreService, academyAnnouncementService } from '@infrastructure/services/academyFirestoreService';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@infrastructure/services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import { useOnboarding } from '@components/OnboardingTour';
import { useTheme } from '@contexts/ThemeContext';

import ModernCard from '@components/modern/ModernCard';
import AnimatedButton from '@components/AnimatedButton';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import StudentDashboardSkeleton from '@components/skeletons/StudentDashboardSkeleton';

import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import { hexToRgba } from '@shared/utils/colorUtils';
import { useProfileTheme } from '../../../contexts/ProfileThemeContext';

const AnimatedModernCard: React.FC<{
    children: React.ReactNode;
    delay?: number;
    variant?: string;
    style?: any;
}> = ({ children, delay = 0, variant = 'card', style = {} }) => {
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
                transform: [{ translateY: slideAnim as any }]
            }}
        >
            <ModernCard variant={variant as any} style={[styles.card, style]}>
                {children}
            </ModernCard>
        </Animated.View>
    );
};

const StudentDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user, userProfile } = useAuthFacade();
    const { getString, isDarkMode } = useTheme();
    const { theme: profileTheme } = useProfileTheme(); // 🎨 Tema dinâmico por perfil


    const [nextClasses, setNextClasses] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [dashboardData, setDashboardData] = useState<any>({
        nextEvaluation: '2 meses',
        totalClasses: 0,
        attendanceRate: 0
    });

    const [loading, setLoading] = useState(true);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

                    const formattedAnnouncements = (userAnnouncements as any[]).map((ann: any) => ({
                        id: ann.id,
                        title: ann.title,
                        message: ann.message,
                        date: formatDate(ann.createdAt),
                        priority: ann.priority || 0
                    }));

                    const dashboardInfo = {
                        graduationStatus: studentProfile?.currentBelt || studentProfile?.currentGraduation || getString('whiteBelt'),
                        nextEvaluation: studentProfile?.nextEvaluationDate || '2 meses',
                        totalClasses: userClasses.length,
                        attendanceRate: studentProfile?.attendanceRate || 0
                    };

                    return { nextClasses, announcements: formattedAnnouncements, dashboardData: dashboardInfo };
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

    if (loading) {
        return <SafeAreaView style={styles.skeletonContainer}><StudentDashboardSkeleton /></SafeAreaView>;
    }

    return (
        <EnhancedErrorBoundary errorContext={{ screen: 'StudentDashboard', academiaId: userProfile?.academiaId, studentId: user?.id }}>
            <LinearGradient
                colors={profileTheme.gradients.hero as any}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={COLORS.primary[500]}
                            />
                        }
                    >
                        {/* Header / Welcome Banner */}
                        <AnimatedModernCard delay={0} variant="premium">
                            <View style={styles.welcomeBanner}>
                                <Avatar.Text
                                    size={64}
                                    label={userProfile?.name?.charAt(0) || 'U'}
                                    style={styles.avatar}
                                    labelStyle={styles.avatarLabel}
                                />
                                <View style={styles.welcomeInfo}>
                                    <Text style={styles.greetingText}>
                                        {getString('hello')}, {userProfile?.name?.split(' ')[0] || getString('student')}!
                                    </Text>
                                    <Text style={styles.welcomeBackText}>
                                        {getString('welcomeBackToAcademy')}
                                    </Text>
                                </View>
                            </View>
                        </AnimatedModernCard>

                        {/* Graduation Status */}
                        <AnimatedModernCard delay={100}>
                            <View>
                                <View style={styles.cardHeader}>
                                    <Ionicons name="trophy-outline" size={24} color={profileTheme.primary[500]} />
                                    <Text style={[styles.cardTitle, { color: profileTheme.primary[500] }]}>{getString('graduationStatus')}</Text>
                                </View>
                                <View style={styles.graduationContent}>
                                    <Chip
                                        mode="flat"
                                        style={[styles.beltChip, {
                                            backgroundColor: hexToRgba(profileTheme.primary[500], 0.1),
                                            borderColor: profileTheme.primary[500]
                                        }]}
                                        textStyle={[styles.beltChipText, { color: profileTheme.primary[500] }]}
                                    >
                                        {dashboardData.graduationStatus}
                                    </Chip>
                                    <Text style={styles.graduationSubtext}>
                                        {getString('nextEvaluationIn')} {dashboardData.nextEvaluation}
                                    </Text>
                                </View>
                            </View>
                        </AnimatedModernCard>

                        {/* Upcoming Classes */}
                        <AnimatedModernCard delay={200}>
                            <View>
                                <View style={styles.cardHeader}>
                                    <Ionicons name="calendar-outline" size={24} color={profileTheme.primary[500]} />
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
                                            left={props => <List.Icon {...props} icon="bookmark-outline" color={COLORS.info[500]} />}
                                            style={styles.listItem}
                                        />
                                    ))
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>{getString('noClassesScheduled')}</Text>
                                    </View>
                                )}

                                <AnimatedButton
                                    mode="text"
                                    onPress={() => navigation.navigate('Calendar')}
                                    style={styles.viewMoreBtn}
                                    textColor={COLORS.info[400]}
                                >
                                    {getString('viewFullCalendar')}
                                </AnimatedButton>
                            </View>
                        </AnimatedModernCard>

                        {/* Announcements */}
                        <AnimatedModernCard delay={300}>
                            <View>
                                <View style={styles.cardHeader}>
                                    <Ionicons name="megaphone-outline" size={24} color={profileTheme.primary[500]} />
                                    <Text style={styles.cardTitle}>{getString('announcements')}</Text>
                                    <ActivityIndicator
                                        animating={loadingAnnouncements}
                                        size="small"
                                        color={profileTheme.primary[500]}
                                        style={{ opacity: loadingAnnouncements ? 1 : 0 }}
                                    />
                                </View>

                                {announcements.length > 0 ? (
                                    announcements.map((ann, idx) => (
                                        <View key={ann.id} style={styles.announcementBox}>
                                            <View style={styles.announcementHeader}>
                                                <Text style={styles.annTitle}>{ann.title}</Text>
                                                <Text style={styles.annDate}>{ann.date}</Text>
                                            </View>
                                            <Text style={styles.annMsg}>{ann.message}</Text>
                                            {idx < announcements.length - 1 && <Divider style={styles.annDivider} />}
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="notifications-off-outline" size={40} color={COLORS.gray[700]} />
                                        <Text style={styles.emptyText}>{getString('noAnnouncementsNow')}</Text>
                                    </View>
                                )}
                            </View>
                        </AnimatedModernCard>

                        {/* Quick Actions */}
                        <AnimatedModernCard delay={400}>
                            <View>
                                <View style={styles.cardHeader}>
                                    <Ionicons name="flash-outline" size={24} color={profileTheme.primary[500]} />
                                    <Text style={styles.cardTitle}>{getString('quickActions')}</Text>
                                </View>
                                <View style={styles.actionsGrid}>
                                    <AnimatedButton
                                        mode="contained"
                                        icon="qrcode-scan"
                                        onPress={() => navigation.navigate('CheckIn')}
                                        style={styles.actionButton}
                                    >
                                        {getString('checkIn')}
                                    </AnimatedButton>
                                    <AnimatedButton
                                        mode="outlined"
                                        icon="credit-card"
                                        onPress={() => navigation.navigate('Payments')}
                                        style={styles.actionButton}
                                        textColor={COLORS.primary[400]}
                                    >
                                        {getString('payments')}
                                    </AnimatedButton>
                                </View>
                            </View>
                        </AnimatedModernCard>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </EnhancedErrorBoundary>
    );
};

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flex: 1 },
    skeletonContainer: { flex: 1, backgroundColor: COLORS.background.default },
    scrollView: { flex: 1 },
    scrollContent: {
        padding: SPACING.base,
        paddingBottom: SPACING.huge
    },
    card: {
        marginBottom: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
    },
    welcomeBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs
    },
    avatar: {
        backgroundColor: COLORS.primary[500],
        elevation: 4
    },
    avatarLabel: {
        fontWeight: 'bold',
        color: COLORS.white
    },
    welcomeInfo: {
        marginLeft: SPACING.md,
        flex: 1
    },
    greetingText: {
        fontSize: FONT_SIZE.xl,
        fontWeight: 'bold',
        color: COLORS.white,
        letterSpacing: -0.5
    },
    welcomeBackText: {
        fontSize: FONT_SIZE.sm,
        color: hexToRgba(COLORS.white, 0.67),
        marginTop: 2
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        gap: SPACING.sm
    },
    cardTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '700',
        color: COLORS.primary[500],
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        flex: 1
    },
    graduationContent: {
        alignItems: 'center',
        paddingVertical: SPACING.sm
    },
    beltChip: {
        backgroundColor: hexToRgba(COLORS.primary[500], 0.1),
        borderColor: COLORS.primary[500],
        borderWidth: 1,
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.md
    },
    beltChipText: {
        color: COLORS.primary[500],
        fontWeight: 'bold',
        fontSize: FONT_SIZE.md
    },
    graduationSubtext: {
        color: COLORS.gray[500],
        fontSize: FONT_SIZE.sm
    },
    listItem: {
        paddingHorizontal: 0,
        marginVertical: -4
    },
    classTitle: {
        fontSize: FONT_SIZE.base,
        fontWeight: '600',
        color: COLORS.white
    },
    classDesc: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[400]
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
        fontSize: FONT_SIZE.base,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        marginRight: SPACING.sm
    },
    annDate: {
        fontSize: 10,
        color: COLORS.gray[600],
        textTransform: 'uppercase'
    },
    annMsg: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[300],
        lineHeight: 20
    },
    annDivider: {
        marginVertical: SPACING.md,
        backgroundColor: hexToRgba(COLORS.white, 0.08)
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        opacity: 0.8
    },
    emptyText: {
        color: COLORS.gray[600],
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
