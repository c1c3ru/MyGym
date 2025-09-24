import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { useAccessibility } from '../presentation/hooks/useAccessibility';

const AccessibleCard = memo(({
  children,
  onPress,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  isSelectable = false,
  isSelected = false,
  style,
  ...props
}) => {
  const { getAccessibilityProps, announceForAccessibility } = useAccessibility();

  const handlePress = () => {
    if (onPress) {
      if (accessibilityLabel) {
        announceForAccessibility(`${accessibilityLabel} selecionado`);
      }
      onPress();
    }
  };

  const accessibilityProps = getAccessibilityProps({
    label: accessibilityLabel,
    hint: accessibilityHint || (onPress ? 'Toque duas vezes para interagir' : undefined),
    role: onPress ? accessibilityRole : 'text',
    isSelected: isSelectable ? isSelected : undefined
  });

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        {...accessibilityProps}
        style={style}
      >
        <Card {...props}>
          {children}
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <Card
      style={style}
      {...(accessible ? accessibilityProps : {})}
      {...props}
    >
      {children}
    </Card>
  );
});

AccessibleCard.displayName = 'AccessibleCard';

export default AccessibleCard;