/**
 * Componente SafeIcon - Ícones com fallback automático para web
 * Resolve problemas de carregamento de fontes de ícones
 */

import React from 'react';
import { COLORS } from '@presentation/theme/designTokens';
import { Platform, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { IconWithFallback } from '@utils/iconFallback';
import { useThemeToggle } from '@presentation/contexts/ThemeToggleContext';

// Componente para Ionicons com fallback
type IconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle | ViewStyle>;
} & Record<string, any>;

export const SafeIonicons: React.FC<IconProps> = ({ name, size = 24, color = COLORS.black, style = {}, ...props }) => {
  const { currentTheme } = useThemeToggle();
  
  return (
    <IconWithFallback
      IconComponent={Ionicons}
      name={name}
      size={size}
      color={color}
      style={style}
      {...props}
    />
  );
};

// Componente para MaterialCommunityIcons com fallback
export const SafeMaterialCommunityIcons: React.FC<IconProps> = ({ name, size = 24, color = COLORS.black, style = {}, ...props }) => {
  return (
    <IconWithFallback
      IconComponent={MaterialCommunityIcons}
      name={name}
      size={size}
      color={color}
      style={style}
      {...props}
    />
  );
};

// Componente genérico que detecta o tipo de ícone automaticamente
export const SafeIcon: React.FC<IconProps & { type?: 'ionicons' | 'material-community' }> = ({ 
  type = 'ionicons', 
  name, 
  size = 24, 
  color = COLORS.black, 
  style = {}, 
  ...props 
}) => {
  const IconComponent = type === 'material-community' 
    ? MaterialCommunityIcons 
    : Ionicons;
    
  return (
    <IconWithFallback
      IconComponent={IconComponent}
      name={name}
      size={size}
      color={color}
      style={style}
      {...props}
    />
  );
};

// Exportar componentes individuais
export { IconWithFallback };

// Exportar como padrão o SafeIcon
export default SafeIcon;
