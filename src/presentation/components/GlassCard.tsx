import React from 'react';
import { View, ViewStyle, StyleSheet, Platform, StyleProp } from 'react-native';
import { useCurrentTheme } from '@presentation/theme/designTokens';
import { useTheme } from '@contexts/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'heavy' | 'light' | 'card' | 'modal';
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    variant = 'default'
}) => {
    const { isDarkMode } = useTheme();
    const theme = useCurrentTheme(isDarkMode);
    // Fallback to default if glass property or variant doesn't exist (safety check)
    const glassStyle = theme.glass?.[variant] || theme.glass?.default || {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
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
