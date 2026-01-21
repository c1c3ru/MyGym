import React, { useMemo, useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface AnimatedScreenProps {
    children: React.ReactNode;
    duration?: number;
    delay?: number;
}

/**
 * Wrapper que adiciona animações de entrada automáticas (fade + slide)
 */
const AnimatedScreen: React.FC<AnimatedScreenProps> = ({
    children,
    duration = 300,
    delay = 0
}) => {
    const slideAnim = useMemo(() => new Animated.Value(50), []);
    const fadeAnim = useMemo(() => new Animated.Value(0), []);

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                })
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, [duration, delay]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default AnimatedScreen;
