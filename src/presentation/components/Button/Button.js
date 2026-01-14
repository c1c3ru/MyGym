import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';
import { Button as PaperButton, Text } from 'react-native-paper';
import { Logger } from '@utils/logger';
import styles from './Button.styles';
import { useTheme } from "@contexts/ThemeContext";

/**
 * Componente Button reutilizável seguindo melhores práticas
 * @param {Object} props - Props do componente
 * @param {string} props.title - Texto do botão
 * @param {Function} props.onPress - Função executada ao pressionar
 * @param {string} props.variant - Variante do botão (primary, secondary, outline)
 * @param {string} props.size - Tamanho do botão (small, medium, large)
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {boolean} props.loading - Se o botão está carregando
 * @param {string} props.testID - ID para testes
 */
const Button = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  testID,
  ...props
}) => {
  const { getString } = useTheme();
  const handlePress = () => {
    if (disabled || loading) return;

    Logger.debug(`Button pressed: ${title || 'Unnamed button'}`);
    onPress?.();
  };

  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
  ];

  const textStyle = [
    styles.text,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      <Text style={textStyle}>
        {loading ? getString('loadingState') : title}
      </Text>
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

export default Button;
