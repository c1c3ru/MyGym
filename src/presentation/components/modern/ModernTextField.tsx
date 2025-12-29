import React from 'react';
import { Platform, StyleSheet, ViewStyle } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';

export interface ModernTextFieldProps extends TextInputProps {
  containerStyle?: ViewStyle | ViewStyle[];
}

const ModernTextField: React.FC<ModernTextFieldProps> = ({ containerStyle, style, ...props }) => {
  const container = Array.isArray(containerStyle) ? containerStyle : [containerStyle];
  return (
    <TextInput
      {...props}
      mode={props.mode || 'outlined'}
      style={[styles.base, styles.glassNative, Platform.OS === 'web' ? ({ backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } as any) : {}, style, ...container]}
      outlineStyle={styles.outline}
    />
  );
};

const styles = StyleSheet.create<{ base: ViewStyle; outline: ViewStyle; glassNative: ViewStyle }>({
  base: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  outline: {
    borderRadius: 12,
  },
  glassNative: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});

export default ModernTextField;
