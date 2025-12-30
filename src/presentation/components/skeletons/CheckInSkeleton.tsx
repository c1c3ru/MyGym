import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { COLORS, SPACING, BORDER_RADIUS } from '@presentation/theme/designTokens';

/**
 * Skeleton para a tela de Check-in
 */
const CheckInSkeleton: React.FC = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Header Stats Skeleton */}
            <View style={styles.statsContainer}>
                {[1, 2, 3].map((index) => (
                    <View key={index} style={styles.statCard}>
                        <SkeletonLoader width={40} height={40} borderRadius={20} />
                        <View style={styles.statContent}>
                            <SkeletonLoader width="80%" height={20} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="60%" height={14} />
                        </View>
                    </View>
                ))}
            </View>

            {/* Active Check-ins Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="50%" height={20} style={{ marginBottom: 16 }} />

                {[1, 2].map((index) => (
                    <View key={index} style={styles.checkInItem}>
                        <View style={styles.checkInHeader}>
                            <SkeletonLoader width="70%" height={18} />
                            <SkeletonLoader width={60} height={24} borderRadius={12} />
                        </View>
                        <SkeletonLoader width="50%" height={14} style={{ marginBottom: SPACING.sm }} />
                        <View style={styles.checkInActions}>
                            <SkeletonLoader width={80} height={32} borderRadius={16} />
                            <SkeletonLoader width={90} height={32} borderRadius={16} />
                        </View>
                    </View>
                ))}
            </View>

            {/* Quick Actions Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="40%" height={20} style={{ marginBottom: 16 }} />

                <View style={styles.actionsGrid}>
                    {[1, 2, 3, 4].map((index) => (
                        <View key={index} style={styles.actionCard}>
                            <SkeletonLoader width={48} height={48} borderRadius={24} />
                            <SkeletonLoader width="80%" height={16} style={{ marginTop: SPACING.sm }} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Recent Check-ins Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="45%" height={20} style={{ marginBottom: 16 }} />

                {[1, 2, 3, 4].map((index) => (
                    <View key={index} style={styles.recentItem}>
                        <SkeletonLoader width={32} height={32} borderRadius={16} />
                        <View style={styles.recentContent}>
                            <SkeletonLoader width="80%" height={16} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="60%" height={14} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="40%" height={12} />
                        </View>
                        <SkeletonLoader width={60} height={14} />
                    </View>
                ))}
            </View>

            {/* FAB Skeleton */}
            <View style={styles.fabContainer}>
                <SkeletonLoader width={56} height={56} borderRadius={28} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: SPACING.sm,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 4,
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
    checkInItem: {
        marginBottom: 16,
        padding: SPACING.md,
        backgroundColor: COLORS.background.light,
        borderRadius: BORDER_RADIUS.md,
    },
    checkInHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    checkInActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: '48%',
        alignItems: 'center',
        padding: SPACING.base,
        backgroundColor: COLORS.background.light,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        padding: SPACING.sm,
    },
    recentContent: {
        flex: 1,
        marginLeft: 12,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
});

export default CheckInSkeleton;
