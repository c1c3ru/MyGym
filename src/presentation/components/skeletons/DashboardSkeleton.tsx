import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { ResponsiveUtils } from '@utils/animations';
import { COLORS, SPACING } from '@presentation/theme/designTokens';

/**
 * Skeleton para a tela de Dashboard principal
 */
const DashboardSkeleton: React.FC = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: SPACING.lg }}>
            {/* Header Skeleton */}
            <View style={styles.headerContainer}>
                <SkeletonLoader
                    width="100%"
                    height={120}
                    borderRadius={ResponsiveUtils.borderRadius?.large || 12}
                    style={styles.headerSkeleton}
                />
            </View>

            {/* Stats Cards Skeleton */}
            <View style={styles.statsContainer}>
                {[1, 2, 3, 4].map((index) => (
                    <View key={index} style={styles.statCard}>
                        <SkeletonLoader
                            width="100%"
                            height={120}
                            borderRadius={ResponsiveUtils.borderRadius?.medium || 8}
                        />
                    </View>
                ))}
            </View>

            {/* Financial Card Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader
                    width="100%"
                    height={200}
                    borderRadius={ResponsiveUtils.borderRadius?.medium || 8}
                    style={styles.cardSkeleton}
                />
            </View>

            {/* Quick Actions Skeleton */}
            <View style={styles.cardContainer}>
                <View style={styles.quickActionsHeader}>
                    <SkeletonLoader width="40%" height={24} style={{ marginBottom: SPACING.sm }} />
                    <SkeletonLoader width="70%" height={16} />
                </View>

                <View style={styles.quickActionsGrid}>
                    {[1, 2, 3, 4].map((index) => (
                        <View key={index} style={styles.actionCard}>
                            <SkeletonLoader
                                width="100%"
                                height={140}
                                borderRadius={ResponsiveUtils.borderRadius?.medium || 8}
                            />
                        </View>
                    ))}
                </View>
            </View>

            {/* Recent Activities Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="50%" height={24} style={{ marginBottom: SPACING.md }} />

                {[1, 2, 3].map((index) => (
                    <View key={index} style={styles.activityItem}>
                        <SkeletonLoader width={40} height={40} borderRadius={20} />
                        <View style={styles.activityContent}>
                            <SkeletonLoader width="80%" height={16} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="40%" height={12} />
                        </View>
                    </View>
                ))}
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
        margin: ResponsiveUtils.spacing?.md || 16,
        marginBottom: ResponsiveUtils.spacing?.lg || 24,
    },
    headerSkeleton: {
        marginBottom: 0,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: ResponsiveUtils.spacing?.md || 16,
        marginBottom: ResponsiveUtils.spacing?.md || 16,
    },
    statCard: {
        width: '48%',
        marginBottom: ResponsiveUtils.spacing?.md || 16,
    },
    cardContainer: {
        margin: ResponsiveUtils.spacing?.md || 16,
        marginTop: ResponsiveUtils.spacing?.sm || 8,
        padding: ResponsiveUtils.spacing?.md || 16,
        backgroundColor: COLORS.white,
        borderRadius: ResponsiveUtils.borderRadius?.medium || 8,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardSkeleton: {
        margin: SPACING.none,
    },
    quickActionsHeader: {
        marginBottom: ResponsiveUtils.spacing?.md || 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: ResponsiveUtils.isTablet?.() ? '31%' : '48%',
        marginBottom: ResponsiveUtils.spacing?.sm || 8,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: ResponsiveUtils.spacing?.md || 16,
    },
    activityContent: {
        flex: 1,
        marginLeft: ResponsiveUtils.spacing?.md || 16,
    },
});

export default DashboardSkeleton;
