import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { COLORS, SPACING, BORDER_RADIUS } from '@presentation/theme/designTokens';

/**
 * Skeleton para a tela de Detalhes do Estudante
 */
const StudentDetailsSkeleton: React.FC = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: SPACING.lg }}>
            {/* Student Header Card Skeleton */}
            <View style={styles.cardContainer}>
                <View style={styles.headerContainer}>
                    <SkeletonLoader width={80} height={80} borderRadius={40} />
                    <View style={styles.headerInfo}>
                        <SkeletonLoader width="80%" height={24} style={{ marginBottom: SPACING.sm }} />
                        <SkeletonLoader width="60%" height={16} style={{ marginBottom: SPACING.sm }} />
                        <SkeletonLoader width="40%" height={14} />
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Info rows */}
                {[1, 2, 3].map((index) => (
                    <View key={index} style={styles.infoRow}>
                        <SkeletonLoader width={20} height={20} borderRadius={10} />
                        <SkeletonLoader width="70%" height={16} style={{ marginLeft: SPACING.md }} />
                    </View>
                ))}
            </View>

            {/* Classes Card Skeleton */}
            <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                    <SkeletonLoader width={24} height={24} borderRadius={12} />
                    <SkeletonLoader width="40%" height={20} style={{ marginLeft: SPACING.sm }} />
                </View>

                {[1, 2].map((index) => (
                    <View key={index} style={styles.listItem}>
                        <View style={styles.listItemLeft}>
                            <SkeletonLoader width={20} height={20} borderRadius={10} />
                            <View style={styles.listItemContent}>
                                <SkeletonLoader width="60%" height={16} style={{ marginBottom: SPACING.xs }} />
                                <SkeletonLoader width="40%" height={14} />
                            </View>
                        </View>
                        <SkeletonLoader width={70} height={32} borderRadius={16} />
                    </View>
                ))}
            </View>

            {/* Payments Card Skeleton */}
            <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                    <SkeletonLoader width={24} height={24} borderRadius={12} />
                    <SkeletonLoader width="50%" height={20} style={{ marginLeft: SPACING.sm }} />
                </View>

                {[1, 2, 3].map((index) => (
                    <View key={index} style={styles.listItem}>
                        <View style={styles.listItemLeft}>
                            <SkeletonLoader width={20} height={20} borderRadius={10} />
                            <View style={styles.listItemContent}>
                                <SkeletonLoader width="50%" height={16} style={{ marginBottom: SPACING.xs }} />
                                <SkeletonLoader width="30%" height={14} />
                            </View>
                        </View>
                        <SkeletonLoader width={60} height={16} />
                    </View>
                ))}
            </View>

            {/* Actions Card Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="30%" height={20} style={{ marginBottom: SPACING.md }} />

                <View style={styles.actionsContainer}>
                    <SkeletonLoader width="48%" height={40} borderRadius={20} />
                    <SkeletonLoader width="48%" height={40} borderRadius={20} />
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
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    headerInfo: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray[300],
        marginVertical: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    listItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    listItemContent: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default StudentDetailsSkeleton;
