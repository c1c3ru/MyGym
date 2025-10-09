/**
 * Componente SafeIcon - Ícones com fallback automático para web
 * Resolve problemas de carregamento de fontes de ícones
 */

import React from 'react';
import { Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { IconWithFallback } from '@utils/iconFallback';
import { useThemeToggle } from '@contexts/ThemeToggleContext';

// Componente para Ionicons com fallback
export const SafeIonicons = ({ name, size = 24, color = 'currentTheme.black', style = {}, ...props }) => {
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
export const SafeMaterialCommunityIcons = ({ name, size = 24, color = 'currentTheme.black', style = {}, ...props }) => {
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
export const SafeIcon = ({ 
  type = 'ionicons', 
  name, 
  size = 24, 
  color = 'currentTheme.black', 
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
