import React, { useState } from 'react';
import { View, ViewStyle, StyleSheet, Platform, StyleProp, Pressable, Animated } from 'react-native';
import { GLASS, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { useTheme } from '@contexts/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'light' | 'medium' | 'heavy' | 'card' | 'modal' | 'subtle' | 'dark' | 'premium'; // Added legacy variants
    padding?: number;
    margin?: number;
    marginBottom?: number;
    marginTop?: number;
    marginHorizontal?: number;
    borderRadius?: number;
    onPress?: () => void;
    pressable?: boolean;
    animated?: boolean;
}

/**
 * GlassCard Component
 * Modern glassmorphism card that adapts to light/dark themes
 * Supports press animations and multiple variants
 */
export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    variant = 'default',
    padding,
    margin,
    marginBottom,
    marginTop,
    marginHorizontal,
    borderRadius = BORDER_RADIUS.lg,
    onPress,
    pressable = false,
    animated = false,
}) => {
    const { isDarkMode } = useTheme();
    const [scaleAnim] = useState(new Animated.Value(1));

    // Select glass style based on theme
    const glassVariant = isDarkMode ? 'dark' : 'light';

    // Get the appropriate glass style
    // In dark mode, use dark glass effects
    // In light mode, use light glass effects
    let glassStyle;
    if (variant === 'default') {
        glassStyle = GLASS[glassVariant];
    } else {
        glassStyle = GLASS[variant] || GLASS[glassVariant];
    }

    // Extract web-specific styles for backdrop-filter
    const webStyle = Platform.OS === 'web' ? {
        backdropFilter: (glassStyle as any).backdropFilter || 'blur(10px)',
        WebkitBackdropFilter: (glassStyle as any).backdropFilter || 'blur(10px)',
    } : {};

    const handlePressIn = () => {
        if (animated || pressable) {
            Animated.spring(scaleAnim, {
                toValue: 0.98,
                useNativeDriver: true,
                tension: 100,
                friction: 5,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (animated || pressable) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 5,
            }).start();
        }
    };

    const containerStyle = [
        styles.container,
        {
            backgroundColor: glassStyle.backgroundColor,
            borderColor: glassStyle.borderColor,
            borderWidth: glassStyle.borderWidth,
            shadowColor: glassStyle.shadowColor,
            shadowOffset: glassStyle.shadowOffset,
            shadowOpacity: glassStyle.shadowOpacity,
            shadowRadius: glassStyle.shadowRadius,
            elevation: glassStyle.elevation,
            padding: padding,
            margin: margin,
            marginBottom: marginBottom,
            marginTop: marginTop,
            marginHorizontal: marginHorizontal,
            borderRadius: borderRadius,
        },
        webStyle as any,
        style
    ];

    if (onPress || pressable) {
        return (
            <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
                <Pressable
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={containerStyle}
                >
                    {children}
                </Pressable>
            </Animated.View>
        );
    }

    if (animated) {
        return (
            <Animated.View style={[containerStyle, { transform: [{ scale: scaleAnim }] }]}>
                {children}
            </Animated.View>
        );
    }

    return (
        <View style={containerStyle}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },
});

export default GlassCard;
