import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const LoginSkeleton = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header Skeleton */}
      <View style={styles.headerContainer}>
        <SkeletonLoader width="80%" height={32} style={{ marginBottom: SPACING.sm }} />
        <SkeletonLoader width="60%" height={18} />
      </View>

      {/* Login Form Skeleton */}
      <View style={styles.formContainer}>
        {/* Email Field */}
        <View style={styles.fieldContainer}>
          <SkeletonLoader width="30%" height={16} style={{ marginBottom: SPACING.sm }} />
          <SkeletonLoader width="100%" height={56} borderRadius={4} />
        </View>

        {/* Password Field */}
        <View style={styles.fieldContainer}>
          <SkeletonLoader width="25%" height={16} style={{ marginBottom: SPACING.sm }} />
          <SkeletonLoader width="100%" height={56} borderRadius={4} />
        </View>

        {/* Login Button */}
        <SkeletonLoader width="100%" height={48} borderRadius={24} style={{ marginTop: 16 }} />

        {/* Forgot Password */}
        <SkeletonLoader width="50%" height={16} style={{ marginTop: 16, alignSelf: 'center' }} />
      </View>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <SkeletonLoader width="100%" height={1} style={{ marginVertical: 24 }} />
        <SkeletonLoader width="20%" height={16} style={{ alignSelf: 'center', marginTop: -16, backgroundColor: COLORS.gray[100] }} />
      </View>

      {/* Social Login Buttons */}
      <View style={styles.socialContainer}>
        {[1, 2, 3].map((index) => (
          <SkeletonLoader key={index} width="100%" height={48} borderRadius={24} style={{ marginBottom: SPACING.md }} />
        ))}
      </View>

      {/* Register Link */}
      <View style={styles.registerContainer}>
        <SkeletonLoader width="70%" height={16} style={{ alignSelf: 'center' }} />
      </View>

      {/* Language Selector */}
      <View style={styles.languageContainer}>
        <SkeletonLoader width={120} height={32} borderRadius={16} style={{ alignSelf: 'center' }} />
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
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.xs0,
  },
  formContainer: {
    margin: SPACING.xl,
    padding: SPACING.xl,
    backgroundColor: 'COLORS.white',
    borderRadius: BORDER_RADIUS.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  dividerContainer: {
    marginHorizontal: 24,
    position: 'relative',
  },
  socialContainer: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  registerContainer: {
    marginTop: 24,
    marginHorizontal: 24,
  },
  languageContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
});

export default LoginSkeleton;
