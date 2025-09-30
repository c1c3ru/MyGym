import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

const CalendarSkeleton = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header Skeleton */}
      <View style={styles.headerContainer}>
        <SkeletonLoader width="60%" height={24} style={{ marginBottom: 8 }} />
        <View style={styles.viewModeButtons}>
          {[1, 2, 3].map((index) => (
            <SkeletonLoader key={index} width={60} height={32} borderRadius={16} style={{ marginRight: 8 }} />
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
                <SkeletonLoader width={60} height={16} style={{ marginBottom: 4 }} />
                <SkeletonLoader width={40} height={12} />
              </View>
            </View>
            
            <View style={styles.classContent}>
              <SkeletonLoader width="80%" height={18} style={{ marginBottom: 4 }} />
              <SkeletonLoader width="60%" height={14} style={{ marginBottom: 8 }} />
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
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewModeButtons: {
    flexDirection: 'row',
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
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  classTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  timeInfo: {
    marginLeft: 8,
  },
  classContent: {
    flex: 1,
    marginRight: 12,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});

export default CalendarSkeleton;
