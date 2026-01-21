import React, { useEffect, useMemo } from 'react';
import { Animated, View, ViewStyle, StyleProp } from 'react-native';
import { createStaggeredAnimation } from '@shared/utils/animationUtils';
import { ANIMATION } from '@presentation/theme/designTokens';

interface AnimatedListProps {
    children: React.ReactNode[];
    staggerDelay?: number;
    duration?: number;
    initialDelay?: number;
    style?: StyleProp<ViewStyle>;
    itemStyle?: StyleProp<ViewStyle>;
    animationType?: 'fade' | 'fadeSlide' | 'fadeScale';
}

/**
 * AnimatedList Component
 * Renders list items with staggered cascade animation
 * Perfect for cards, list items, and grid layouts
 */
const AnimatedList: React.FC<AnimatedListProps> = ({
    children,
    staggerDelay = 50,
    duration = ANIMATION.duration.normal,
    initialDelay = 0,
    style,
    itemStyle,
    animationType = 'fadeSlide',
}) => {
    const childrenArray = React.Children.toArray(children);

    // Create animated values for each item
    const animatedValues = useMemo(
        () => childrenArray.map(() => new Animated.Value(0)),
        [childrenArray.length]
    );

    const slideValues = useMemo(
        () => childrenArray.map(() => new Animated.Value(20)),
        [childrenArray.length]
    );

    const scaleValues = useMemo(
        () => childrenArray.map(() => new Animated.Value(0.95)),
        [childrenArray.length]
    );

    useEffect(() => {
        // Create staggered animations for all items
        const fadeAnimations = animatedValues.map((value, index) =>
            Animated.timing(value, {
                toValue: 1,
                duration,
                delay: initialDelay + index * staggerDelay,
                useNativeDriver: true,
            })
        );

        const slideAnimations = slideValues.map((value, index) =>
            Animated.spring(value, {
                toValue: 0,
                tension: 50,
                friction: 7,
                delay: initialDelay + index * staggerDelay,
                useNativeDriver: true,
            })
        );

        const scaleAnimations = scaleValues.map((value, index) =>
            Animated.spring(value, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: initialDelay + index * staggerDelay,
                useNativeDriver: true,
            })
        );

        // Start animations based on type
        if (animationType === 'fade') {
            Animated.parallel(fadeAnimations).start();
        } else if (animationType === 'fadeSlide') {
            Animated.parallel([...fadeAnimations, ...slideAnimations]).start();
        } else if (animationType === 'fadeScale') {
            Animated.parallel([...fadeAnimations, ...scaleAnimations]).start();
        }

        return () => {
            fadeAnimations.forEach(anim => anim.stop());
            slideAnimations.forEach(anim => anim.stop());
            scaleAnimations.forEach(anim => anim.stop());
        };
    }, [animatedValues, slideValues, scaleValues, staggerDelay, duration, initialDelay, animationType]);

    const getItemStyle = (index: number): Animated.AnimatedProps<ViewStyle> => {
        const baseStyle: any = {
            opacity: animatedValues[index],
        };

        if (animationType === 'fadeSlide') {
            baseStyle.transform = [{ translateY: slideValues[index] }];
        } else if (animationType === 'fadeScale') {
            baseStyle.transform = [{ scale: scaleValues[index] }];
        }

        return baseStyle;
    };

    return (
        <View style={style}>
            {childrenArray.map((child, index) => (
                <Animated.View
                    key={index}
                    style={[getItemStyle(index), itemStyle]}
                >
                    {child}
                </Animated.View>
            ))}
        </View>
    );
};

export default AnimatedList;
