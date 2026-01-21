import React from 'react';
import { Button, ActivityIndicator, type ButtonProps } from 'react-native-paper';
import { COLORS, SPACING } from '@presentation/theme/designTokens';
import { type StyleProp, type ViewStyle } from 'react-native';

type LoadingButtonProps = Omit<ButtonProps, 'children' | 'loading' | 'style'> & {
  loading?: boolean;
  disabled?: boolean;
  mode?: ButtonProps['mode'];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const LoadingButton: React.FC<LoadingButtonProps> = ({ 
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
      {loading ? <ActivityIndicator color={COLORS.white} size="small" /> : children}
    </Button>
  );
};

export default LoadingButton;
