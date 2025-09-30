import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

const InstructorClassesSkeleton = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
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
            <SkeletonLoader width="40%" height={16} style={{ marginLeft: 8 }} />
          </View>

          {/* Class Info */}
          <View style={styles.infoContainer}>
            {[1, 2, 3].map((infoIndex) => (
              <View key={infoIndex} style={styles.infoRow}>
                <SkeletonLoader width={16} height={16} borderRadius={8} />
                <SkeletonLoader width="60%" height={14} style={{ marginLeft: 8 }} />
              </View>
            ))}
          </View>

          {/* Description */}
          <SkeletonLoader width="90%" height={14} style={{ marginTop: 8 }} />
          <SkeletonLoader width="60%" height={14} style={{ marginTop: 4 }} />

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
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    margin: 16,
    marginBottom: 8,
  },
  cardContainer: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default InstructorClassesSkeleton;
