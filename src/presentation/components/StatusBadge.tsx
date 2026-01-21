import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';

interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'paid' | 'pending' | 'overdue' | 'success' | 'warning' | 'error' | 'info';
    label: string;
    style?: ViewStyle;
    size?: 'small' | 'medium' | 'large';
}

/**
 * Badge de status com cores e estilos padronizados
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    label,
    style,
    size = 'medium'
}) => {
    const getStatusColors = () => {
        switch (status) {
            case 'active':
            case 'paid':
            case 'success':
                return {
                    bg: hexToRgba(COLORS.success[500], 0.15),
                    text: COLORS.success[400], // Brighter for dark mode
                };
            case 'pending':
            case 'warning':
                return {
                    bg: hexToRgba(COLORS.warning[500], 0.15),
                    text: COLORS.warning[400], // Brighter for dark mode
                };
            case 'inactive':
            case 'overdue':
            case 'error':
                return {
                    bg: hexToRgba(COLORS.error[500], 0.15),
                    text: COLORS.error[400], // Brighter for dark mode
                };
            case 'info':
                return {
                    bg: hexToRgba(COLORS.info[500], 0.15),
                    text: COLORS.info[400], // Brighter for dark mode
                };
            default:
                return {
                    bg: hexToRgba(COLORS.gray[500], 0.15),
                    text: COLORS.gray[400], // Brighter for dark mode
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    paddingHorizontal: SPACING.xs,
                    paddingVertical: 2,
                    fontSize: FONT_SIZE.xs - 2,
                };
            case 'large':
                return {
                    paddingHorizontal: SPACING.md,
                    paddingVertical: 6,
                    fontSize: FONT_SIZE.sm,
                };
            default: // medium
                return {
                    paddingHorizontal: SPACING.sm,
                    paddingVertical: 4,
                    fontSize: FONT_SIZE.xs,
                };
        }
    };

    const colors = getStatusColors();
    const sizeStyles = getSizeStyles();

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: colors.bg,
                    paddingHorizontal: sizeStyles.paddingHorizontal,
                    paddingVertical: sizeStyles.paddingVertical,
                },
                style,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    {
                        color: colors.text,
                        fontSize: sizeStyles.fontSize,
                    },
                ]}
            >
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
        borderRadius: BORDER_RADIUS.full,
    },
    text: {
        fontWeight: FONT_WEIGHT.bold,
        textTransform: 'uppercase',
    },
});

export default StatusBadge;
