import React from 'react';
import { View, Platform, StyleSheet, ViewStyle } from 'react-native';
import { Card } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, ELEVATION } from '@presentation/theme/designTokens';

export interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  contentStyle?: ViewStyle;
  onPress?: () => void;
  testID?: string;
}

const ModernCard: React.FC<ModernCardProps> = ({ children, style, contentStyle, onPress, testID }) => {
  const containerStyle = Array.isArray(style) ? style : [style];
  return (
    <Card
      onPress={onPress}
      testID={testID}
      style={[
        styles.base,
        styles.glassNative,
        // Estilos web específicos (não tipados em RN):
        Platform.OS === 'web' ? ({ backdropFilter: 'blur(10px)', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' } as any) : {},
        ...containerStyle,
      ]}
    >
      <Card.Content style={[styles.content, contentStyle]}>{children}</Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create<{ base: ViewStyle; content: ViewStyle; glassNative: ViewStyle }>({
  base: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  content: {
    padding: 16,
  },
  glassNative: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
});

export default ModernCard;
