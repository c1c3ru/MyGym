import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleProp, ViewStyle } from 'react-native';
import { Card } from 'react-native-paper';
import { ShadowUtils } from '@utils/animations';
import { SPACING, BORDER_RADIUS } from '@presentation/theme/designTokens';

/**
 * Propriedades para o componente AnimatedCard
 */
interface AnimatedCardProps {
    /** Conteúdo do card */
    children: React.ReactNode;
    /** Estilo adicional para o Card */
    style?: StyleProp<ViewStyle>;
    /** Tipo de sombra/elevação */
    elevation?: keyof typeof ShadowUtils;
    /** Tipo de animação de entrada */
    animationType?: 'fadeIn' | 'scaleIn' | 'slideInRight';
    /** Atraso para início da animação */
    delay?: number;
    /** Outras propriedades passadas para o Card da react-native-paper */
    [key: string]: any;
}

/**
 * Componente de Card com animações de entrada e sombras pré-definidas
 */
const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    style,
    elevation = 'light',
    animationType = 'fadeIn',
    delay = 0,
    ...props
}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: Platform.OS !== 'web',
        }).start();
    }, [delay, animatedValue]);

    const getAnimationStyle = (): StyleProp<ViewStyle> => {
        switch (animationType) {
            case 'fadeIn':
                return {
                    opacity: animatedValue as any,
                    transform: [{
                        translateY: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                        }) as any,
                    }],
                };
            case 'scaleIn':
                return {
                    opacity: animatedValue as any,
                    transform: [{
                        scale: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1],
                        }) as any,
                    }],
                };
            case 'slideInRight':
                return {
                    opacity: animatedValue as any,
                    transform: [{
                        translateX: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                        }) as any,
                    }],
                };
            default:
                return { opacity: animatedValue as any };
        }
    };

    const shadowStyle = ShadowUtils[elevation] || ShadowUtils.light;

    return (
        <Animated.View style={[getAnimationStyle()]}>
            <Card
                style={[
                    shadowStyle as any,
                    {
                        margin: SPACING.sm,
                        borderRadius: BORDER_RADIUS.md,
                    },
                    style
                ]}
                {...props}
            >
                {children}
            </Card>
        </Animated.View>
    );
};

export default AnimatedCard;
