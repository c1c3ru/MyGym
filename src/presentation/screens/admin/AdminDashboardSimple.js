import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const AdminDashboardSimple = ({ navigation }) => {
  console.log('🎯 AdminDashboardSimple renderizando...');
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard Admin</Text>
        <Text style={styles.subtitle}>Sistema funcionando!</Text>
        <Text style={styles.info}>Versão simplificada para teste</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: 'COLORS.warning[500]',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: 'COLORS.text.primary',
    marginBottom: 10,
  },
  info: {
    fontSize: FONT_SIZE.base,
    color: 'COLORS.text.secondary',
  },
});

export default AdminDashboardSimple;
