import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';

export type IconFamily = 'Ionicons' | 'MaterialCommunityIcons';

interface IconContainerProps {
    icon: string;
    family?: IconFamily;
    color?: string;
    backgroundColor?: string;
    size?: number;
    containerSize?: number;
    onPress?: () => void;
}

/**
 * Container de ícone com background colorido e opcional interação
 */
const IconContainer: React.FC<IconContainerProps> = ({
    icon,
    family = 'Ionicons',
    color = COLORS.primary[500],
    backgroundColor,
    size = 20,
    containerSize = 40,
    onPress
}) => {
    const bgColor = backgroundColor || hexToRgba(color, 0.3); // Increased opacity for dark mode

    const IconComponent = family === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

    const content = (
        <View style={[styles.container, { width: containerSize, height: containerSize, backgroundColor: bgColor }]}>
            <IconComponent name={icon as any} size={size} color={color} />
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default IconContainer;
