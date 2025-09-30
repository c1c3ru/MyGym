import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const ReportsSkeleton = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header Skeleton */}
      <View style={styles.headerContainer}>
        <SkeletonLoader width="60%" height={28} style={{ marginBottom: SPACING.sm }} />
        <SkeletonLoader width="80%" height={16} />
      </View>

      {/* Stats Card Skeleton */}
      <View style={styles.cardContainer}>
        <SkeletonLoader width="50%" height={20} style={{ marginBottom: 16 }} />
        
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4].map((index) => (
            <View key={index} style={styles.statItem}>
              <SkeletonLoader width={48} height={48} borderRadius={24} />
              <View style={styles.statContent}>
                <SkeletonLoader width="80%" height={20} style={{ marginBottom: SPACING.xs }} />
                <SkeletonLoader width="60%" height={12} style={{ marginBottom: SPACING.xs }} />
                <SkeletonLoader width="40%" height={10} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Revenue Chart Skeleton */}
      <View style={styles.cardContainer}>
        <SkeletonLoader width="40%" height={20} style={{ marginBottom: 16 }} />
        <SkeletonLoader width="100%" height={200} borderRadius={8} />
      </View>

      {/* Top Classes Skeleton */}
      <View style={styles.cardContainer}>
        <SkeletonLoader width="45%" height={20} style={{ marginBottom: 16 }} />
        
        {[1, 2, 3].map((index) => (
          <View key={index} style={styles.listItem}>
            <SkeletonLoader width={40} height={40} borderRadius={20} />
            <View style={styles.listItemContent}>
              <SkeletonLoader width="70%" height={16} style={{ marginBottom: SPACING.xs }} />
              <SkeletonLoader width="50%" height={14} />
            </View>
            <SkeletonLoader width={30} height={16} />
          </View>
        ))}
      </View>

      {/* Recent Activities Skeleton */}
      <View style={styles.cardContainer}>
        <SkeletonLoader width="50%" height={20} style={{ marginBottom: 16 }} />
        
        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.activityItem}>
            <SkeletonLoader width={24} height={24} borderRadius={12} />
            <View style={styles.activityContent}>
              <SkeletonLoader width="80%" height={14} style={{ marginBottom: SPACING.xs }} />
              <SkeletonLoader width="40%" height={12} />
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons Skeleton */}
      <View style={styles.cardContainer}>
        <SkeletonLoader width="30%" height={20} style={{ marginBottom: 16 }} />
        
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
  headerContainer: {
    padding: SPACING.base,
    marginBottom: SPACING.xs,
  },
  cardContainer: {
    margin: SPACING.base,
    marginTop: SPACING.sm,
    padding: SPACING.base,
    backgroundColor: 'COLORS.white',
    borderRadius: BORDER_RADIUS.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 16,
    padding: SPACING.md,
    backgroundColor: 'COLORS.background.light',
    borderRadius: BORDER_RADIUS.md,
  },
  statContent: {
    marginLeft: 12,
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  listItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ReportsSkeleton;
