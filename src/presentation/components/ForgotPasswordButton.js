
import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';

const ForgotPasswordButton = ({ onPress, disabled = false, style }) => {
  const { currentTheme } = useThemeToggle();
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[{ alignSelf: 'flex-end' }, style]}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
        }}
      >
        <MaterialCommunityIcons 
          name="lock-question" 
          size={16} 
          color={COLORS.secondary[400]}
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            color: disabled ? COLORS.gray[300] : COLORS.secondary[400],
            fontSize: FONT_SIZE.base,
            fontWeight: FONT_WEIGHT.medium,
          }}
        >
          Esqueceu sua senha?
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ForgotPasswordButton;
