import React from 'react';
import { Animated, Platform, ViewStyle, StyleProp } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';
import { ShadowUtils } from '@utils/animations';
import { BORDER_RADIUS } from '@presentation/theme/designTokens';

/**
 * Propriedades para o componente AnimatedButton
 */
interface AnimatedButtonProps extends Omit<ButtonProps, 'elevation'> {
    /** Elevação da sombra customizada */
    elevation?: keyof typeof ShadowUtils;
    /** Estilo adicional para o container animado */
    style?: StyleProp<ViewStyle>;
}

/**
 * Botão com animações de escala e opacidade ao pressionar
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    children,
    style,
    onPress,
    mode = 'contained',
    disabled = false,
    loading = false,
    elevation = 'light',
    ...props
}) => {
    const scaleValue = React.useRef(new Animated.Value(1)).current;
    const fadeValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (disabled || loading) return;

        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 0.95,
                useNativeDriver: Platform.OS !== 'web',
                tension: 300,
                friction: 10,
            }),
            Animated.timing(fadeValue, {
                toValue: 0.8,
                duration: 100,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start();
    };

    const handlePressOut = () => {
        if (disabled || loading) return;

        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 1,
                useNativeDriver: Platform.OS !== 'web',
                tension: 300,
                friction: 10,
            }),
            Animated.timing(fadeValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start();
    };

    const shadowStyle = ShadowUtils[elevation] || ShadowUtils.light;

    return (
        <Animated.View
            style={[
                {
                    transform: [{ scale: scaleValue as any }],
                    opacity: fadeValue as any,
                },
                mode === 'contained' ? shadowStyle : {},
            ]}
        >
            <Button
                mode={mode}
                onPress={onPress}
                disabled={disabled}
                loading={loading}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    {
                        borderRadius: BORDER_RADIUS.md,
                        marginVertical: 4,
                    },
                    style
                ] as any}
                {...(props as any)}
            >
                {children}
            </Button>
        </Animated.View>
    );
};

export default AnimatedButton;
