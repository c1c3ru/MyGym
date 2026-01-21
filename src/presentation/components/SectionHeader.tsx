import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useTheme } from '@contexts/ThemeContext';

interface SectionHeaderProps {
    emoji?: string;
    title: string;
    subtitle?: string;
    marginTop?: number;
    marginBottom?: number;
    textColor?: string;
    subtitleColor?: string;
}

/**
 * Cabeçalho de seção com emoji opcional e suporte a tema
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
    emoji,
    title,
    subtitle,
    marginTop = SPACING.md,
    marginBottom = SPACING.md,
    textColor: customTextColor,
    subtitleColor: customSubtitleColor
}) => {
    const { isDarkMode } = useTheme();
    const textColor = customTextColor || (isDarkMode ? COLORS.white : COLORS.gray[900]);
    const subtitleColor = customSubtitleColor || (isDarkMode ? COLORS.gray[400] : COLORS.gray[600]);

    return (
        <View style={[styles.container, { marginTop, marginBottom }]}>
            <Text style={[styles.title, { color: textColor }]}>
                {emoji && `${emoji} `}{title}
            </Text>
            {subtitle && (
                <Text style={[styles.subtitle, { color: subtitleColor }]}>
                    {subtitle}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
    },
    subtitle: {
        fontSize: FONT_SIZE.sm,
        marginTop: SPACING.xs,
    },
});

export default SectionHeader;
