import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

/**
 * Skeleton para lista de turmas
 */
const ClassListSkeleton = ({ count = 4 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <ClassCardSkeleton key={index} />
      ))}
    </View>
  );
};

/**
 * Skeleton para card individual de turma
 */
const ClassCardSkeleton = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <SkeletonLoader width="60%" height={18} style={styles.title} />
          <SkeletonLoader width="40%" height={14} style={styles.modality} />
        </View>
        <SkeletonLoader width={24} height={24} borderRadius={12} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <SkeletonLoader width={16} height={16} borderRadius={8} />
          <SkeletonLoader width="30%" height={14} style={styles.detailText} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonLoader width={16} height={16} borderRadius={8} />
          <SkeletonLoader width="50%" height={14} style={styles.detailText} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonLoader width={16} height={16} borderRadius={8} />
          <SkeletonLoader width="25%" height={14} style={styles.detailText} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.studentsInfo}>
          <SkeletonLoader width={60} height={12} style={styles.studentsLabel} />
          <SkeletonLoader width={30} height={14} style={styles.studentsCount} />
        </View>
        <SkeletonLoader width={80} height={32} borderRadius={16} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  modality: {
    marginBottom: 0,
  },
  details: {
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  studentsInfo: {
    flex: 1,
  },
  studentsLabel: {
    marginBottom: 4,
  },
  studentsCount: {
    marginBottom: 0,
  },
});

export default ClassListSkeleton;
