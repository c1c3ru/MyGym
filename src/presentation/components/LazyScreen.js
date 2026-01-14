import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useTheme } from "@contexts/ThemeContext";

// Componente de loading para telas lazy
const LazyLoadingFallback = ({ message }) => {
  const { getString } = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.info[500]} />
      <Text style={styles.text}>{message || getString('loadingState')}</Text>
    </View>
  );
};

// HOC para criar telas lazy com fallback
const withLazyLoading = (Component, loadingMessage) => {
  return React.forwardRef((props, ref) => (
    <Suspense fallback={<LazyLoadingFallback message={loadingMessage} />}>
      <Component {...props} ref={ref} />
    </Suspense>
  ));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  text: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[500],
  },
});

export { LazyLoadingFallback, withLazyLoading };
export default LazyLoadingFallback;
