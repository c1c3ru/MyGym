import React from 'react';
import { Button, ActivityIndicator } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const LoadingButton = ({ 
  loading, 
  children, 
  onPress, 
  disabled,
  mode = 'contained',
  style,
  ...props 
}) => {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={loading || disabled}
      style={[{ paddingVertical: SPACING.sm }, style]}
      {...props}
    >
      {loading ? <ActivityIndicator color="COLORS.COLORS.white" size="small" /> : children}
    </Button>
  );
};

export default LoadingButton;
