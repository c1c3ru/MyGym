import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Button as PaperButton, Text } from 'react-native-paper';
import { useAccessibility } from '@hooks/useAccessibility';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const AccessibleButton = memo(({
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
  const accessibilityProps = accessibilityAction 
    ? getButtonAccessibilityProps(accessibilityAction, accessibilityContext)
    : {
        accessible: true,
        accessibilityLabel: accessibilityLabel || children,
        accessibilityHint: accessibilityHint || 'Toque duas vezes para executar esta ação',
        accessibilityRole: 'button',
        accessibilityState: {
          disabled: disabled || loading,
          busy: loading
        }
      };

  const buttonStyles = [
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
      icon={icon}
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
    paddingHorizontal: 24,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default AccessibleButton;