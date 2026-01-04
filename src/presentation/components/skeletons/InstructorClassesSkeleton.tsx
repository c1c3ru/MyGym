import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { COLORS, SPACING, BORDER_RADIUS } from '@presentation/theme/designTokens';

/**
 * Skeleton para a tela de Turmas do Instrutor
 */
const InstructorClassesSkeleton: React.FC = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: SPACING.lg }}>
            {/* Search Bar Skeleton */}
            <View style={styles.searchContainer}>
                <SkeletonLoader width="100%" height={48} borderRadius={24} />
            </View>

            {/* Class Cards Skeleton */}
            {[1, 2, 3, 4, 5].map((index) => (
                <View key={index} style={styles.cardContainer}>
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                        <SkeletonLoader width="70%" height={24} />
                        <SkeletonLoader width={60} height={28} borderRadius={14} />
                    </View>

                    {/* Modality */}
                    <View style={styles.modalityContainer}>
                        <SkeletonLoader width={16} height={16} borderRadius={8} />
                        <SkeletonLoader width="40%" height={16} style={{ marginLeft: SPACING.sm }} />
                    </View>

                    {/* Class Info */}
                    <View style={styles.infoContainer}>
                        {[1, 2, 3].map((infoIndex) => (
                            <View key={infoIndex} style={styles.infoRow}>
                                <SkeletonLoader width={16} height={16} borderRadius={8} />
                                <SkeletonLoader width="60%" height={14} style={{ marginLeft: SPACING.sm }} />
                            </View>
                        ))}
                    </View>

                    {/* Description */}
                    <SkeletonLoader width="90%" height={14} style={{ marginTop: SPACING.sm }} />
                    <SkeletonLoader width="60%" height={14} style={{ marginTop: SPACING.xs }} />

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <SkeletonLoader width={80} height={36} borderRadius={18} />
                        <SkeletonLoader width={90} height={36} borderRadius={18} />
                    </View>
                </View>
            ))}

            {/* FAB Skeleton */}
            <View style={styles.fabContainer}>
                <SkeletonLoader width={120} height={56} borderRadius={28} />
            </View>
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    modalityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    infoContainer: {
        marginBottom: SPACING.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: SPACING.base,
        gap: SPACING.sm,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
});

export default InstructorClassesSkeleton;
