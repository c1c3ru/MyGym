import React from 'react';
import { View, ViewStyle, StyleSheet, Platform, StyleProp } from 'react-native';
import { useCurrentTheme } from '@presentation/theme/designTokens';
import { useTheme } from '@contexts/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'dark' | 'light' | 'medium' | 'heavy' | 'premium' | 'card' | 'modal' | 'subtle';
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    variant = 'dark'
}) => {
    const { isDarkMode } = useTheme();
    const theme = useCurrentTheme(isDarkMode);

    // Use the unified GLASS tokens with proper fallback
    const glassStyle = theme.glass?.[variant] || theme.glass?.dark || {
        backgroundColor: 'rgba(26, 26, 26, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
    };

    // Extract web-specific styles for backdrop-filter if on web
    const webStyle = Platform.OS === 'web' ? {
        backdropFilter: (glassStyle as any).backdropFilter || 'blur(10px)',
        WebkitBackdropFilter: (glassStyle as any).backdropFilter || 'blur(10px)',
    } : {};

    return (
        <View style={[
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
            },
            webStyle as any,
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
    },
});

export default GlassCard;
