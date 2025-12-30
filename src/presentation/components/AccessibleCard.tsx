import React, { memo } from 'react';
import { TouchableOpacity, type AccessibilityRole, type StyleProp, type ViewStyle } from 'react-native';
import { Card } from 'react-native-paper';
import { useAccessibility } from '@presentation/hooks/useAccessibility';

type AccessibleCardProps = {
  children?: React.ReactNode;
  onPress?: () => void;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole | 'text';
  isSelectable?: boolean;
  isSelected?: boolean;
  style?: StyleProp<ViewStyle>;
} & Record<string, any>;

const AccessibleCard = memo<AccessibleCardProps>(({
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

  const accessibilityProps: any = getAccessibilityProps({
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