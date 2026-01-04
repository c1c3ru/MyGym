import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { COLORS, SPACING, BORDER_RADIUS } from '@presentation/theme/designTokens';

/**
 * Skeleton para a tela de Calendário
 */
const CalendarSkeleton: React.FC = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: SPACING.lg }}>
            {/* Header Skeleton */}
            <View style={styles.headerContainer}>
                <SkeletonLoader width="60%" height={24} style={{ marginBottom: SPACING.sm }} />
                <View style={styles.viewModeButtons}>
                    {[1, 2, 3].map((index) => (
                        <SkeletonLoader key={index} width={60} height={32} borderRadius={16} style={{ marginRight: SPACING.sm }} />
                    ))}
                </View>
            </View>

            {/* Calendar Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="100%" height={300} borderRadius={8} />
            </View>

            {/* Selected Date Classes Skeleton */}
            <View style={styles.cardContainer}>
                <View style={styles.dayHeader}>
                    <SkeletonLoader width="70%" height={20} />
                    <SkeletonLoader width={60} height={24} borderRadius={12} />
                </View>

                {[1, 2, 3].map((index) => (
                    <View key={index} style={styles.classItem}>
                        <View style={styles.classTime}>
                            <SkeletonLoader width={40} height={40} borderRadius={20} />
                            <View style={styles.timeInfo}>
                                <SkeletonLoader width={60} height={16} style={{ marginBottom: SPACING.xs }} />
                                <SkeletonLoader width={40} height={12} />
                            </View>
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
    headerContainer: {
        padding: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewModeButtons: {
        flexDirection: 'row',
    },
    cardContainer: {
        margin: SPACING.md,
        marginTop: SPACING.sm,
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    classItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
    },
    classTime: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    timeInfo: {
        marginLeft: SPACING.sm,
    },
    classContent: {
        flex: 1,
        marginRight: SPACING.md,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
});

export default CalendarSkeleton;
