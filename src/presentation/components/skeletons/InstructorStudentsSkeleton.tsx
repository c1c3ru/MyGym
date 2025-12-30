import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { COLORS, SPACING, BORDER_RADIUS } from '@presentation/theme/designTokens';

/**
 * Skeleton para a tela de Alunos do Instrutor
 */
const InstructorStudentsSkeleton: React.FC = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Search Bar Skeleton */}
            <View style={styles.searchContainer}>
                <SkeletonLoader width="100%" height={48} borderRadius={24} />
            </View>

            {/* Filter Bar Skeleton */}
            <View style={styles.filterContainer}>
                <SkeletonLoader width={80} height={32} borderRadius={16} />
                <SkeletonLoader width={100} height={32} borderRadius={16} />
                <SkeletonLoader width={90} height={32} borderRadius={16} />
            </View>

            {/* Student Cards Skeleton */}
            {[1, 2, 3, 4, 5, 6].map((index) => (
                <View key={index} style={styles.cardContainer}>
                    {/* Student Header */}
                    <View style={styles.studentHeader}>
                        <SkeletonLoader width={60} height={60} borderRadius={30} />
                        <View style={styles.studentInfo}>
                            <SkeletonLoader width="80%" height={20} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="60%" height={16} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="40%" height={14} />
                        </View>
                        <SkeletonLoader width={60} height={24} borderRadius={12} />
                    </View>

                    {/* Student Details */}
                    <View style={styles.detailsContainer}>
                        {[1, 2, 3].map((detailIndex) => (
                            <View key={detailIndex} style={styles.detailRow}>
                                <SkeletonLoader width={16} height={16} borderRadius={8} />
                                <SkeletonLoader width="70%" height={14} style={{ marginLeft: 8 }} />
                            </View>
                        ))}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <SkeletonLoader width={80} height={32} borderRadius={16} />
                        <SkeletonLoader width={100} height={32} borderRadius={16} />
                        <SkeletonLoader width={90} height={32} borderRadius={16} />
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray[100],
    },
    searchContainer: {
        margin: SPACING.base,
        marginBottom: SPACING.sm,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
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
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    studentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    detailsContainer: {
        marginBottom: SPACING.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
});

export default InstructorStudentsSkeleton;
