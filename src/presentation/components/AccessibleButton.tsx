import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Button as PaperButton, type ButtonProps } from 'react-native-paper';
import { useAccessibility } from '@presentation/hooks/useAccessibility';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

type AccessibleButtonProps = Omit<ButtonProps, 'style' | 'children' | 'onPress' | 'icon'> & {
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | string;
  size?: 'small' | 'medium' | 'large';
  accessibilityAction?: string;
  accessibilityContext?: string;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode | string;
};

const AccessibleButton = memo<AccessibleButtonProps>(({
  children,
  onPress,
  mode = 'contained',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  accessibilityLabel,
  accessibilityHint,
  accessibilityAction,
  accessibilityContext = '',
  style,
  ...props
}) => {
  const { getButtonAccessibilityProps, announceForAccessibility } = useAccessibility();

  const handlePress = () => {
    if (loading || disabled) return;
    
    // Anunciar ação para screen readers
    if (accessibilityLabel) {
      announceForAccessibility(`${accessibilityLabel} pressionado`);
    }
    
    onPress?.();
  };

  // Gerar props de acessibilidade automaticamente
  const accessibilityProps: any = accessibilityAction 
    ? getButtonAccessibilityProps(accessibilityAction, accessibilityContext)
    : {
        accessible: true,
        accessibilityLabel: accessibilityLabel || undefined,
        accessibilityHint: accessibilityHint || 'Toque duas vezes para executar esta ação',
        accessibilityRole: 'button',
        accessibilityState: {
          disabled: disabled || loading,
          busy: loading
        }
      };

  const buttonStyles: any = [
    styles.button,
    size === 'small' && styles.smallButton,
    size === 'large' && styles.largeButton,
    disabled && styles.disabled,
    style
  ];

  return (
    <PaperButton
      mode={mode}
      onPress={handlePress}
      disabled={disabled || loading}
      loading={loading}
      icon={icon as any}
      style={buttonStyles}
      {...accessibilityProps}
      {...props}
    >
      {children}
    </PaperButton>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
  },
  smallButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  largeButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default AccessibleButton;