import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { COLORS, SPACING, BORDER_RADIUS } from '@presentation/theme/designTokens';

/**
 * Skeleton para a tela de Relatórios
 */
const ReportsSkeleton: React.FC = () => {
    const skeletonBg = 'rgba(255, 255, 255, 0.05)';
    const skeletonHighlight = 'rgba(255, 255, 255, 0.1)';

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: SPACING.lg }}>
            {/* Header Skeleton */}
            <View style={styles.headerContainer}>
                <SkeletonLoader width="60%" height={28} style={{ marginBottom: SPACING.sm }} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                <SkeletonLoader width="80%" height={16} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
            </View>

            {/* Stats Card Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="50%" height={20} style={{ marginBottom: SPACING.md }} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />

                <View style={styles.statsGrid}>
                    {[1, 2, 3, 4].map((index) => (
                        <View key={index} style={styles.statItem}>
                            <SkeletonLoader width={48} height={48} borderRadius={24} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                            <View style={styles.statContent}>
                                <SkeletonLoader width="80%" height={20} style={{ marginBottom: SPACING.xs }} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                                <SkeletonLoader width="60%" height={12} style={{ marginBottom: SPACING.xs }} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                                <SkeletonLoader width="40%" height={10} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Revenue Chart Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="40%" height={20} style={{ marginBottom: SPACING.md }} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                <SkeletonLoader width="100%" height={200} borderRadius={8} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
            </View>

            {/* Top Classes Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="45%" height={20} style={{ marginBottom: SPACING.md }} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />

                {[1, 2, 3].map((index) => (
                    <View key={index} style={styles.listItem}>
                        <SkeletonLoader width={40} height={40} borderRadius={20} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                        <View style={styles.listItemContent}>
                            <SkeletonLoader width="70%" height={16} style={{ marginBottom: SPACING.xs }} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                            <SkeletonLoader width="50%" height={14} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                        </View>
                        <SkeletonLoader width={30} height={16} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                    </View>
                ))}
            </View>

            {/* Recent Activities Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="50%" height={20} style={{ marginBottom: SPACING.md }} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />

                {[1, 2, 3, 4].map((index) => (
                    <View key={index} style={styles.activityItem}>
                        <SkeletonLoader width={24} height={24} borderRadius={12} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                        <View style={styles.activityContent}>
                            <SkeletonLoader width="80%" height={14} style={{ marginBottom: SPACING.xs }} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                            <SkeletonLoader width="40%" height={12} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                        </View>
                    </View>
                ))}
            </View>

            {/* Action Buttons Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="30%" height={20} style={{ marginBottom: SPACING.md }} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />

                <View style={styles.actionsContainer}>
                    <SkeletonLoader width="48%" height={40} borderRadius={20} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                    <SkeletonLoader width="48%" height={40} borderRadius={20} backgroundColor={skeletonBg} highlightColor={skeletonHighlight} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background.default,
    },
    headerContainer: {
        padding: SPACING.md,
        marginBottom: SPACING.xs,
    },
    cardContainer: {
        margin: SPACING.md,
        marginTop: SPACING.sm,
        padding: SPACING.md,
        backgroundColor: 'rgba(30, 30, 30, 0.5)',
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: SPACING.md,
        padding: SPACING.md,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: BORDER_RADIUS.md,
    },
    statContent: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    listItemContent: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    activityContent: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default ReportsSkeleton;
