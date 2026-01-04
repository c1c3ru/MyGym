import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import { useTheme } from '@contexts/ThemeContext';
import { getString } from "@utils/theme";


/**
 * Tela de carregamento
 * Exibida durante inicialização do aplicativo
 */
const LoadingScreen = () => {
  const { isDarkMode, getString } = useTheme();

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={COLORS.info[500]} style={styles.spinner} />
          <Text style={styles.title}>MyGym</Text>
          <Text style={styles.subtitle}>{getString('loading')}</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  spinner: {
    marginBottom: 20,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.info[500],
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
});

export default LoadingScreen;
