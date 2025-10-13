import React, { Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

// Componente de loading para telas lazy
const LazyLoadingFallback = ({ message = getString('loadingState') }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={COLORS.info[500]} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

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
    marginTop: 16,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
});

export { LazyLoadingFallback, withLazyLoading };
export default LazyLoadingFallback;
