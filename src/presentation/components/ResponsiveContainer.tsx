import React from 'react';
import { View, ScrollView, ViewStyle, StyleProp } from 'react-native';
import { useResponsive } from '@hooks/useResponsive';
import { COLORS } from '@presentation/theme/designTokens';

/**
 * Propriedades para o componente ResponsiveContainer
 */
interface ResponsiveContainerProps {
    /** Conteúdo do container */
    children: React.ReactNode;
    /** Indica se o container deve ser rolável */
    scrollable?: boolean;
    /** Estilo adicional para o View/ScrollView externo */
    style?: StyleProp<ViewStyle>;
    /** Estilo adicional para o View/ScrollView interno que limita a largura */
    contentContainerStyle?: StyleProp<ViewStyle>;
    /** Indica se deve aplicar padding padrão */
    padding?: boolean;
    /** Outras propriedades passadas para o View ou ScrollView */
    [key: string]: any;
}

/**
 * Container responsivo que ajusta a largura máxima e o padding com base no dispositivo
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
    children,
    scrollable = false,
    style = {},
    contentContainerStyle = {},
    padding = true,
    ...props
}) => {
    const { isMobile, isTablet } = useResponsive();

    const getContainerStyle = (): StyleProp<ViewStyle> => {
        const baseStyle: ViewStyle = {
            flex: 1,
            backgroundColor: COLORS.gray[100],
        };

        if (padding) {
            baseStyle.paddingHorizontal = isMobile ? 16 : isTablet ? 24 : 32;
            baseStyle.paddingVertical = isMobile ? 16 : 20;
        }

        return [baseStyle, style];
    };

    const getContentStyle = (): StyleProp<ViewStyle> => {
        const baseContentStyle: ViewStyle = {
            maxWidth: isMobile ? '100%' : isTablet ? 768 : 1024,
            alignSelf: 'center',
            width: '100%',
        };

        return [baseContentStyle, contentContainerStyle];
    };

    if (scrollable) {
        return (
            <ScrollView
                style={getContainerStyle()}
                contentContainerStyle={getContentStyle()}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                {...props}
            >
                {children}
            </ScrollView>
        );
    }

    return (
        <View style={getContainerStyle()} {...props}>
            <View style={getContentStyle()}>
                {children}
            </View>
        </View>
    );
};

export default ResponsiveContainer;
