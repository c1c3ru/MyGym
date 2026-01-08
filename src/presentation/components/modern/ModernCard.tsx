import React from 'react';
import { ViewStyle } from 'react-native';
import { Card } from 'react-native-paper';
import { GlassCard } from '../GlassCard';
import { SPACING } from '@presentation/theme/designTokens';

export interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  contentStyle?: ViewStyle;
  onPress?: () => void;
  testID?: string;
  variant?: 'dark' | 'light' | 'medium' | 'heavy' | 'premium' | 'card' | 'modal' | 'subtle';
}

/**
 * ModernCard - Componente de card moderno com glassmorphism
 * Agora usa GlassCard internamente para garantir consistência visual
 */
const ModernCard: React.FC<ModernCardProps> = ({
  children,
  style,
  contentStyle,
  onPress,
  testID,
  variant = 'card'
}) => {
  const containerStyle = Array.isArray(style) ? style : [style];

  return (
    <GlassCard variant={variant} style={containerStyle}>
      <Card
        onPress={onPress}
        testID={testID}
        style={{ backgroundColor: 'transparent', elevation: 0 }}
      >
        <Card.Content style={[{ padding: SPACING.base }, contentStyle]}>
          {children}
        </Card.Content>
      </Card>
    </GlassCard>
  );
};

export default ModernCard;
