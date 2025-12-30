import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { COLORS, SPACING, BORDER_RADIUS } from '@presentation/theme/designTokens';

/**
 * Skeleton para a tela de Dashboard do Estudante
 */
const StudentDashboardSkeleton: React.FC = () => {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Welcome Card Skeleton */}
            <View style={styles.welcomeCard}>
                <View style={styles.welcomeContent}>
                    <SkeletonLoader width={60} height={60} borderRadius={30} />
                    <View style={styles.welcomeText}>
                        <SkeletonLoader width="80%" height={24} style={{ marginBottom: SPACING.sm }} />
                        <SkeletonLoader width="60%" height={16} />
                    </View>
                </View>
            </View>

            {/* Graduation Status Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="50%" height={20} style={{ marginBottom: 16 }} />
                <View style={styles.graduationStatus}>
                    <SkeletonLoader width={100} height={32} borderRadius={16} style={{ marginBottom: SPACING.sm }} />
                    <SkeletonLoader width="70%" height={16} />
                </View>
            </View>

            {/* Next Classes Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="40%" height={20} style={{ marginBottom: 16 }} />

                {[1, 2].map((index) => (
                    <View key={index} style={styles.classItem}>
                        <SkeletonLoader width={24} height={24} borderRadius={12} />
                        <View style={styles.classContent}>
                            <SkeletonLoader width="80%" height={18} style={{ marginBottom: SPACING.xs }} />
                            <SkeletonLoader width="90%" height={14} />
                        </View>
                    </View>
                ))}

                <SkeletonLoader width="60%" height={16} style={{ marginTop: SPACING.md }} />
            </View>

            {/* Announcements Skeleton */}
            <View style={styles.cardContainer}>
                <View style={styles.sectionHeader}>
                    <SkeletonLoader width="30%" height={20} />
                    <SkeletonLoader width={80} height={32} borderRadius={16} />
                </View>

                {[1, 2].map((index) => (
                    <View key={index} style={styles.announcementItem}>
                        <SkeletonLoader width="90%" height={16} style={{ marginBottom: SPACING.sm }} />
                        <SkeletonLoader width="100%" height={14} style={{ marginBottom: SPACING.sm }} />
                        <SkeletonLoader width="100%" height={14} style={{ marginBottom: SPACING.sm }} />
                        <SkeletonLoader width="40%" height={12} />
                    </View>
                ))}
            </View>

            {/* Quick Actions Skeleton */}
            <View style={styles.cardContainer}>
                <SkeletonLoader width="40%" height={20} style={{ marginBottom: 16 }} />

                <View style={styles.quickActions}>
                    <SkeletonLoader width="45%" height={40} borderRadius={20} />
                    <SkeletonLoader width="45%" height={40} borderRadius={20} />
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
    welcomeCard: {
        margin: SPACING.sm,
        padding: SPACING.base,
        backgroundColor: COLORS.info[500],
        borderRadius: BORDER_RADIUS.md,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    welcomeContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    welcomeText: {
        marginLeft: 16,
        flex: 1,
    },
    cardContainer: {
        margin: SPACING.sm,
        padding: SPACING.base,
        backgroundColor: COLORS.white,
        borderRadius: BORDER_RADIUS.md,
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    graduationStatus: {
        alignItems: 'center',
    },
    classItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    classContent: {
        marginLeft: 12,
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    announcementItem: {
        marginBottom: 16,
        paddingVertical: SPACING.md,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default StudentDashboardSkeleton;
