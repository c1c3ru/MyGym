import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { COLORS, SPACING, BORDER_RADIUS } from '@presentation/theme/designTokens';

/**
 * Skeleton para a tela de Dashboard do Instrutor
 */
const InstructorDashboardSkeleton: React.FC = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Header Gradient Skeleton */}
            <View style={styles.headerContainer}>
                <SkeletonLoader width="100%" height={120} borderRadius={12} />
            </View>

            {/* Stats Cards Skeleton */}
            <View style={styles.statsContainer}>
                {[1, 2, 3, 4].map((index) => (
                    <View key={index} style={styles.statCard}>
                        <SkeletonLoader width={48} height={48} borderRadius={24} />
                        <View style={styles.statContent}>
                            <SkeletonLoader width="80%" height={24} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="60%" height={16} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="40%" height={12} />
                        </View>
                    </View>
                ))}
            </View>

            {/* Today's Classes Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="50%" height={20} style={{ marginBottom: 16 }} />

                {[1, 2, 3].map((index) => (
                    <View key={index} style={styles.classItem}>
                        <View style={styles.classTime}>
                            <SkeletonLoader width={60} height={40} borderRadius={8} />
                        </View>
                        <View style={styles.classContent}>
                            <SkeletonLoader width="80%" height={18} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="60%" height={14} style={{ marginBottom: SPACING.sm }} />
                            <SkeletonLoader width="40%" height={12} />
                        </View>
                        <SkeletonLoader width={80} height={32} borderRadius={16} />
                    </View>
                ))}
            </View>

            {/* My Classes Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="40%" height={20} style={{ marginBottom: 16 }} />

                <View style={styles.classesGrid}>
                    {[1, 2, 3, 4].map((index) => (
                        <View key={index} style={styles.classCard}>
                            <SkeletonLoader width="100%" height={100} borderRadius={8} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Announcements Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="35%" height={20} style={{ marginBottom: 16 }} />

                {[1, 2].map((index) => (
                    <View key={index} style={styles.announcementItem}>
                        <SkeletonLoader width={24} height={24} borderRadius={12} />
                        <View style={styles.announcementContent}>
                            <SkeletonLoader width="90%" height={16} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="70%" height={14} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="30%" height={12} />
                        </View>
                    </View>
                ))}
            </View>

            {/* Quick Actions Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="40%" height={20} style={{ marginBottom: 16 }} />

                <View style={styles.actionsContainer}>
                    {[1, 2, 3].map((index) => (
                        <SkeletonLoader key={index} width="30%" height={40} borderRadius={20} />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    headerContainer: {
        margin: SPACING.base,
        marginBottom: SPACING.sm,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: SPACING.sm,
    },
    statCard: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statContent: {
        marginLeft: 12,
        flex: 1,
    },
    cardContainer: {
        margin: SPACING.base,
        marginTop: SPACING.sm,
        padding: SPACING.base,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    classItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        padding: SPACING.md,
        backgroundColor: COLORS.background.light,
        borderRadius: BORDER_RADIUS.md,
    },
    classTime: {
        marginRight: 12,
    },
    classContent: {
        flex: 1,
        marginRight: 12,
    },
    classesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    classCard: {
        width: '48%',
        marginBottom: SPACING.md,
    },
    announcementItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
        padding: SPACING.sm,
    },
    announcementContent: {
        marginLeft: 12,
        flex: 1,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default InstructorDashboardSkeleton;
