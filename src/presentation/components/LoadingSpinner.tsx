import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

type LoadingSpinnerProps = {
  size?: 'small' | 'large' | number;
  color?: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  color = COLORS.info[500], 
  message = getString('loadingState'), 
  style 
}) => {
  return (
    <View style={[styles.container, style]} accessible={true} accessibilityLabel={message}>
      <ActivityIndicator 
        size={size} 
        color={color} 
        accessibilityHint="Aguarde enquanto os dados são carregados"
      />
      {message && (
        <Text style={styles.message} accessible={true}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  message: {
    marginTop: SPACING.base,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default LoadingSpinner;