import React from 'react';
import { Platform, StyleSheet, ViewStyle } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, ELEVATION } from '@presentation/theme/designTokens';

export interface ModernButtonProps extends ButtonProps {
  containerStyle?: ViewStyle | ViewStyle[];
}

const ModernButton: React.FC<ModernButtonProps> = ({ containerStyle, style, children, ...props }) => {
  const container = Array.isArray(containerStyle) ? containerStyle : [containerStyle];
  return (
    <Button
      {...props}
      style={[
        styles.base,
        styles.glassNative,
        Platform.OS === 'web' ? ({ backdropFilter: 'blur(6px)', boxShadow: '0 6px 18px rgba(0,0,0,0.12)' } as any) : {},
        style,
        ...container,
      ]}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create<{ base: ViewStyle; glassNative: ViewStyle }>({
  base: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  glassNative: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
});

export default ModernButton;
