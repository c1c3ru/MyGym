import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

const StudentDetailsSkeleton = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Student Header Card Skeleton */}
      <View style={styles.cardContainer}>
        <View style={styles.headerContainer}>
          <SkeletonLoader width={80} height={80} borderRadius={40} />
          <View style={styles.headerInfo}>
            <SkeletonLoader width="80%" height={24} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="40%" height={14} />
          </View>
        </View>
        
        <View style={styles.divider} />
        
        {/* Info rows */}
        {[1, 2, 3].map((index) => (
          <View key={index} style={styles.infoRow}>
            <SkeletonLoader width={20} height={20} borderRadius={10} />
            <SkeletonLoader width="70%" height={16} style={{ marginLeft: 12 }} />
          </View>
        ))}
      </View>

      {/* Classes Card Skeleton */}
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <SkeletonLoader width={24} height={24} borderRadius={12} />
          <SkeletonLoader width="40%" height={20} style={{ marginLeft: 8 }} />
        </View>
        
        {[1, 2].map((index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <SkeletonLoader width={20} height={20} borderRadius={10} />
              <View style={styles.listItemContent}>
                <SkeletonLoader width="60%" height={16} style={{ marginBottom: 4 }} />
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
          <SkeletonLoader width="50%" height={20} style={{ marginLeft: 8 }} />
        </View>
        
        {[1, 2, 3].map((index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <SkeletonLoader width={20} height={20} borderRadius={10} />
              <View style={styles.listItemContent}>
                <SkeletonLoader width="50%" height={16} style={{ marginBottom: 4 }} />
                <SkeletonLoader width="30%" height={14} />
              </View>
            </View>
            <SkeletonLoader width={60} height={16} />
          </View>
        ))}
      </View>

      {/* Actions Card Skeleton */}
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
    backgroundColor: '#f5f5f5',
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default StudentDetailsSkeleton;
