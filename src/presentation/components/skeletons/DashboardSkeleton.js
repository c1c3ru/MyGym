import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { ResponsiveUtils } from '@utils/animations';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const DashboardSkeleton = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header Skeleton */}
      <View style={styles.headerContainer}>
        <SkeletonLoader 
          width="100%" 
          height={120} 
          borderRadius={ResponsiveUtils.borderRadius.large}
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
              borderRadius={ResponsiveUtils.borderRadius.medium}
            />
          </View>
        ))}
      </View>

      {/* Financial Card Skeleton */}
      <View style={styles.cardContainer}>
        <SkeletonLoader 
          width="100%" 
          height={200} 
          borderRadius={ResponsiveUtils.borderRadius.medium}
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
                borderRadius={ResponsiveUtils.borderRadius.medium}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Recent Activities Skeleton */}
      <View style={styles.cardContainer}>
        <SkeletonLoader width="50%" height={24} style={{ marginBottom: 16 }} />
        
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
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.lg,
  },
  headerSkeleton: {
    marginBottom: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.md,
  },
  statCard: {
    width: '48%',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  cardContainer: {
    margin: ResponsiveUtils.spacing.md,
    marginTop: ResponsiveUtils.spacing.sm,
    padding: ResponsiveUtils.spacing.md,
    backgroundColor: COLORS.white,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardSkeleton: {
    margin: 0,
  },
  quickActionsHeader: {
    marginBottom: ResponsiveUtils.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: ResponsiveUtils.isTablet() ? '31%' : '48%',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  activityContent: {
    flex: 1,
    marginLeft: ResponsiveUtils.spacing.md,
  },
});

export default DashboardSkeleton;
