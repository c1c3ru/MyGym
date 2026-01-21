import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';
import { useTheme } from '@contexts/ThemeContext';

type StatusType = 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' | 'info';

interface StatusBadgeProps {
    status: StatusType;
    label: string;
    icon?: string;
    size?: 'small' | 'medium' | 'large';
    style?: StyleProp<ViewStyle>;
    showIcon?: boolean;
}

/**
 * StatusBadge Component
 * Modern status badge with glassmorphism and color-coded backgrounds
 * Automatically adapts to light/dark themes
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    label,
    icon,
    size = 'medium',
    style,
    showIcon = true,
}) => {
    const { isDarkMode } = useTheme();

    // Get status color based on type
    const getStatusColor = (): string => {
        switch (status) {
            case 'active':
            case 'success':
                return COLORS.success[500];
            case 'inactive':
                return COLORS.gray[500];
            case 'pending':
            case 'warning':
                return COLORS.warning[500];
            case 'error':
                return COLORS.error[500];
            case 'info':
                return COLORS.info[500];
            default:
                return COLORS.gray[500];
        }
    };

    // Get icon based on status
    const getStatusIcon = (): string => {
        if (icon) return icon;

        switch (status) {
            case 'active':
                return 'check-circle';
            case 'inactive':
                return 'circle-outline';
            case 'pending':
                return 'clock-outline';
            case 'success':
                return 'check-circle';
            case 'error':
                return 'alert-circle';
            case 'warning':
                return 'alert';
            case 'info':
                return 'information';
            default:
                return 'circle';
        }
    };

    const statusColor = getStatusColor();
    const statusIcon = getStatusIcon();

    // Size configurations
    const sizeConfig = {
        small: {
            paddingHorizontal: SPACING.sm,
            paddingVertical: 4,
            fontSize: FONT_SIZE.xs,
            iconSize: 12,
        },
        medium: {
            paddingHorizontal: SPACING.md,
            paddingVertical: 6,
            fontSize: FONT_SIZE.sm,
            iconSize: 14,
        },
        large: {
            paddingHorizontal: SPACING.base,
            paddingVertical: 8,
            fontSize: FONT_SIZE.base,
            iconSize: 16,
        },
    };

    const config = sizeConfig[size];

    const badgeStyle: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: config.paddingHorizontal,
        paddingVertical: config.paddingVertical,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: hexToRgba(statusColor, isDarkMode ? 0.15 : 0.1),
        borderWidth: 1,
        borderColor: hexToRgba(statusColor, isDarkMode ? 0.3 : 0.2),
    };

    const textStyle: TextStyle = {
        fontSize: config.fontSize,
        fontWeight: FONT_WEIGHT.medium,
        color: isDarkMode ? statusColor : COLORS.text.primary,
        marginLeft: showIcon ? SPACING.xs : 0,
    };

    return (
        <View style={[badgeStyle, style]}>
            {showIcon && (
                <MaterialCommunityIcons
                    name={statusIcon as any}
                    size={config.iconSize}
                    color={statusColor}
                />
            )}
            <Text style={textStyle}>{label}</Text>
        </View>
    );
};

export default StatusBadge;
