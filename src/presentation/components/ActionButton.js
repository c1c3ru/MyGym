import React, { memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { PROFILE_COLORS, STATUS_COLORS, APP_COLORS } from '@shared/constants/colors';

const ActionButton = ({ 
  mode = 'outlined', 
  icon, 
  children, 
  onPress, 
  style, 
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  ...props 
}) => {
  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          contained: PROFILE_COLORS.student.gradient,
          outlined: PROFILE_COLORS.student.primary,
          text: mode === 'contained' ? APP_COLORS.white : PROFILE_COLORS.student.primary
        };
      case 'success':
        return {
          contained: STATUS_COLORS.successGradient,
          outlined: STATUS_COLORS.success,
          text: mode === 'contained' ? APP_COLORS.white : STATUS_COLORS.success
        };
      case 'warning':
        return {
          contained: STATUS_COLORS.warningGradient,
          outlined: STATUS_COLORS.warning,
          text: mode === 'contained' ? APP_COLORS.white : STATUS_COLORS.warning
        };
      case 'danger':
        return {
          contained: STATUS_COLORS.errorGradient,
          outlined: STATUS_COLORS.error,
          text: mode === 'contained' ? APP_COLORS.white : STATUS_COLORS.error
        };
      case 'secondary':
        return {
          contained: PROFILE_COLORS.admin.gradient,
          outlined: PROFILE_COLORS.admin.primary,
          text: mode === 'contained' ? APP_COLORS.white : PROFILE_COLORS.admin.primary
        };
      default:
        return {
          contained: PROFILE_COLORS.student.gradient,
          outlined: PROFILE_COLORS.student.primary,
          text: mode === 'contained' ? APP_COLORS.white : PROFILE_COLORS.student.primary
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          minHeight: 32,
          paddingHorizontal: 12,
          fontSize: 12,
          iconSize: 16
        };
      case 'large':
        return {
          minHeight: 48,
          paddingHorizontal: 24,
          fontSize: 16,
          iconSize: 24
        };
      default: // medium
        return {
          minHeight: 40,
          paddingHorizontal: 16,
          fontSize: 14,
          iconSize: 20
        };
    }
  };

  const colors = getButtonColors();
  const sizeStyles = getSizeStyles();

  if (mode === 'contained') {
    return (
      <View style={[styles.gradientContainer, style, { minHeight: sizeStyles.minHeight }]}>
        <LinearGradient
          colors={disabled ? [APP_COLORS.gray[300], APP_COLORS.gray[400]] : colors.contained}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Button
            mode="text"
            icon={icon}
            iconSize={sizeStyles.iconSize}
            onPress={onPress}
            loading={loading}
            disabled={disabled}
            labelStyle={[
              styles.gradientButtonText, 
              { fontSize: sizeStyles.fontSize }
            ]}
            contentStyle={[
              styles.gradientButtonContent,
              { paddingHorizontal: sizeStyles.paddingHorizontal }
            ]}
            style={styles.gradientButton}
            {...props}
          >
            {children}
          </Button>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Button
      mode={mode}
      icon={icon}
      iconSize={sizeStyles.iconSize}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      buttonColor={mode === 'outlined' ? 'transparent' : undefined}
      textColor={disabled ? APP_COLORS.gray[400] : colors.text}
      style={[
        styles.button,
        mode === 'outlined' && {
          borderColor: disabled ? APP_COLORS.gray[300] : colors.outlined,
          borderWidth: 1.5
        },
        { minHeight: sizeStyles.minHeight },
        style
      ]}
      labelStyle={[
        styles.buttonText,
        { fontSize: sizeStyles.fontSize }
      ]}
      contentStyle={[
        styles.buttonContent,
        { paddingHorizontal: sizeStyles.paddingHorizontal }
      ]}
      {...props}
    >
      {children}
    </Button>
  );
};

// Componente para grupo de botões de ação
const ActionButtonGroup = memo(({ children, style, direction = 'row' }) => {
  return (
    <View style={[
      styles.buttonGroup,
      direction === 'column' ? styles.buttonGroupColumn : styles.buttonGroupRow,
      style
    ]}>
      {children}
    </View>
  );
});

// Componente para botão de ação flutuante melhorado
export const FloatingActionButton = ({ icon, label, onPress, variant = 'primary', style }) => {
  const getColors = () => {
    switch (variant) {
      case 'success': return STATUS_COLORS.successGradient;
      case 'warning': return STATUS_COLORS.warningGradient;
      case 'danger': return STATUS_COLORS.errorGradient;
      case 'secondary': return PROFILE_COLORS.admin.gradient;
      default: return PROFILE_COLORS.student.gradient;
    }
  };

  return (
    <View style={[styles.fabContainer, style]}>
      <LinearGradient
        colors={getColors()}
        style={styles.fabGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Button
          mode="text"
          icon={icon}
          onPress={onPress}
          labelStyle={styles.fabText}
          contentStyle={styles.fabContent}
          style={styles.fab}
        >
          {label}
        </Button>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    }),
  },
  buttonText: {
    fontWeight: '600',
  },
  buttonContent: {
    height: '100%',
  },
  gradientContainer: {
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
      },
      default: {
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      }
    }),
  },
  gradient: {
    borderRadius: 8,
    flex: 1,
  },
  gradientButton: {
    borderRadius: 8,
    backgroundColor: 'transparent',
    margin: 0,
  },
  gradientButtonText: {
    color: APP_COLORS.white,
    fontWeight: '600',
  },
  gradientButtonContent: {
    height: '100%',
  },
  buttonGroup: {
    gap: 8,
  },
  buttonGroupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buttonGroupColumn: {
    flexDirection: 'column',
  },
  fabContainer: {
    borderRadius: 28,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
      },
      default: {
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }
    }),
  },
  fabGradient: {
    borderRadius: 28,
    minHeight: 56,
  },
  fab: {
    borderRadius: 28,
    backgroundColor: 'transparent',
    margin: 0,
  },
  fabText: {
    color: APP_COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  fabContent: {
    height: 56,
    paddingHorizontal: 16,
  },
});

// Memoized components for performance
const MemoizedActionButton = memo(ActionButton);
export { ActionButtonGroup };

export default MemoizedActionButton;