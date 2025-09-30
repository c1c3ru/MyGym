import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

/**
 * Skeleton para lista de estudantes
 */
const StudentListSkeleton = ({ count = 5 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <StudentCardSkeleton key={index} />
      ))}
    </View>
  );
};

/**
 * Skeleton para card individual de estudante
 */
const StudentCardSkeleton = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <SkeletonLoader 
            width={50} 
            height={50} 
            borderRadius={25}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <SkeletonLoader width="70%" height={16} style={styles.name} />
            <SkeletonLoader width="90%" height={12} style={styles.email} />
            <SkeletonLoader width="60%" height={12} style={styles.phone} />
          </View>
        </View>
        <SkeletonLoader width={24} height={24} borderRadius={12} />
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <SkeletonLoader width={40} height={12} style={styles.statLabel} />
          <SkeletonLoader width={60} height={24} borderRadius={12} style={styles.statChip} />
        </View>
        <View style={styles.statItem}>
          <SkeletonLoader width={60} height={12} style={styles.statLabel} />
          <SkeletonLoader width={50} height={14} style={styles.statValue} />
        </View>
        <View style={styles.statItem}>
          <SkeletonLoader width={70} height={12} style={styles.statLabel} />
          <SkeletonLoader width={20} height={14} style={styles.statValue} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actions}>
        <SkeletonLoader width={80} height={32} borderRadius={16} style={styles.actionButton} />
        <SkeletonLoader width={60} height={32} borderRadius={16} style={styles.actionButton} />
        <SkeletonLoader width={90} height={32} borderRadius={16} style={styles.actionButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'COLORS.white',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    marginBottom: SPACING.xs,
  },
  email: {
    marginBottom: SPACING.xs,
  },
  phone: {
    marginBottom: 0,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    marginBottom: SPACING.xs,
  },
  statChip: {
    marginTop: SPACING.xs,
  },
  statValue: {
    marginTop: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});

export default StudentListSkeleton;
