import React, { useEffect, useMemo } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { entryAnimation, exitAnimation } from '@shared/utils/animationUtils';
import { ANIMATION } from '@presentation/theme/designTokens';

interface AnimatedScreenProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    animationType?: 'fade' | 'slide' | 'scale' | 'fadeSlide';
    duration?: number;
    delay?: number;
    onAnimationComplete?: () => void;
}

/**
 * AnimatedScreen Component
 * Automatically animates screen entry with fade and slide effects
 * Usage: <AnimatedScreen>{content}</AnimatedScreen>
 */
const AnimatedScreen: React.FC<AnimatedScreenProps> = ({
    children,
    style,
    animationType = 'fadeSlide',
    duration = ANIMATION.duration.normal,
    delay = 0,
    onAnimationComplete,
}) => {
    const fadeAnim = useMemo(() => new Animated.Value(0), []);
    const slideAnim = useMemo(() => new Animated.Value(50), []);
    const scaleAnim = useMemo(() => new Animated.Value(0.95), []);

    useEffect(() => {
        let animation: Animated.CompositeAnimation;

        switch (animationType) {
            case 'fade':
                animation = Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration,
                    delay,
                    useNativeDriver: true,
                });
                break;

            case 'slide':
                animation = Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 7,
                    delay,
                    useNativeDriver: true,
                });
                fadeAnim.setValue(1);
                break;

            case 'scale':
                animation = Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        tension: 50,
                        friction: 7,
                        delay,
                        useNativeDriver: true,
                    }),
                ]);
                break;

            case 'fadeSlide':
            default:
                animation = entryAnimation(fadeAnim, slideAnim, {
                    duration,
                    delay,
                    useNativeDriver: true,
                });
                break;
        }

        animation.start(() => {
            if (onAnimationComplete) {
                onAnimationComplete();
            }
        });

        return () => {
            animation.stop();
        };
    }, [animationType, duration, delay]);

    const animatedStyle: Animated.AnimatedProps<ViewStyle> = useMemo(() => {
        const baseStyle: any = {
            opacity: fadeAnim,
        };

        if (animationType === 'fadeSlide' || animationType === 'slide') {
            baseStyle.transform = [{ translateY: slideAnim }];
        }

        if (animationType === 'scale') {
            baseStyle.transform = [{ scale: scaleAnim }];
        }

        return baseStyle;
    }, [animationType, fadeAnim, slideAnim, scaleAnim]);

    return (
        <Animated.View style={[{ flex: 1 }, animatedStyle, style]}>
            {children}
        </Animated.View>
    );
};

export default AnimatedScreen;
