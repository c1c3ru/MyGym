import { Animated, Easing } from 'react-native';
import { ANIMATION } from '@presentation/theme/designTokens';

/**
 * Animation Utilities for MyGym
 * Smooth animations following the glassmorphism design system
 */

export interface AnimationConfig {
    duration?: number;
    delay?: number;
    easing?: any;
    useNativeDriver?: boolean;
}

export interface StaggerConfig extends AnimationConfig {
    staggerDelay?: number;
    itemCount?: number;
}

/**
 * Fade In Animation
 * Smoothly fades in an element from 0 to 1 opacity
 */
export const fadeIn = (
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.normal,
        delay = 0,
        easing = Easing.out(Easing.ease),
        useNativeDriver = true,
    } = config;

    return Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver,
    });
};

/**
 * Fade Out Animation
 * Smoothly fades out an element from 1 to 0 opacity
 */
export const fadeOut = (
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.normal,
        delay = 0,
        easing = Easing.in(Easing.ease),
        useNativeDriver = true,
    } = config;

    return Animated.timing(animatedValue, {
        toValue: 0,
        duration,
        delay,
        easing,
        useNativeDriver,
    });
};

/**
 * Slide Up Animation
 * Slides element up from below with spring physics
 */
export const slideUp = (
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.normal,
        delay = 0,
        useNativeDriver = true,
    } = config;

    return Animated.spring(animatedValue, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay,
        useNativeDriver,
    });
};

/**
 * Slide Down Animation
 * Slides element down
 */
export const slideDown = (
    animatedValue: Animated.Value,
    distance: number = 50,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.normal,
        delay = 0,
        useNativeDriver = true,
    } = config;

    return Animated.spring(animatedValue, {
        toValue: distance,
        tension: 50,
        friction: 7,
        delay,
        useNativeDriver,
    });
};

/**
 * Scale Animation
 * Scales element from 0.95 to 1 (subtle zoom in)
 */
export const scaleIn = (
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.normal,
        delay = 0,
        easing = Easing.out(Easing.back(1.1)),
        useNativeDriver = true,
    } = config;

    return Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver,
    });
};

/**
 * Press Animation
 * Subtle scale down for button press feedback
 */
export const pressScale = (
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.fast,
        useNativeDriver = true,
    } = config;

    return Animated.timing(animatedValue, {
        toValue: 0.98,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver,
    });
};

/**
 * Release Animation
 * Returns to normal scale after press
 */
export const releaseScale = (
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.fast,
        useNativeDriver = true,
    } = config;

    return Animated.spring(animatedValue, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver,
    });
};

/**
 * Staggered Animation
 * Creates a cascading effect for list items
 */
export const createStaggeredAnimation = (
    animatedValues: Animated.Value[],
    config: StaggerConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.normal,
        staggerDelay = 50,
        easing = Easing.out(Easing.ease),
        useNativeDriver = true,
    } = config;

    const animations = animatedValues.map((value, index) =>
        Animated.timing(value, {
            toValue: 1,
            duration,
            delay: index * staggerDelay,
            easing,
            useNativeDriver,
        })
    );

    return Animated.parallel(animations);
};

/**
 * Entry Animation
 * Combined fade in + slide up for screen/modal entry
 */
export const entryAnimation = (
    fadeValue: Animated.Value,
    slideValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.normal,
        delay = 0,
        useNativeDriver = true,
    } = config;

    return Animated.parallel([
        Animated.timing(fadeValue, {
            toValue: 1,
            duration,
            delay,
            easing: Easing.out(Easing.ease),
            useNativeDriver,
        }),
        Animated.spring(slideValue, {
            toValue: 0,
            tension: 50,
            friction: 7,
            delay,
            useNativeDriver,
        }),
    ]);
};

/**
 * Exit Animation
 * Combined fade out + slide down for screen/modal exit
 */
export const exitAnimation = (
    fadeValue: Animated.Value,
    slideValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.fast,
        useNativeDriver = true,
    } = config;

    return Animated.parallel([
        Animated.timing(fadeValue, {
            toValue: 0,
            duration,
            easing: Easing.in(Easing.ease),
            useNativeDriver,
        }),
        Animated.timing(slideValue, {
            toValue: 50,
            duration,
            easing: Easing.in(Easing.ease),
            useNativeDriver,
        }),
    ]);
};

/**
 * Pulse Animation
 * Subtle pulsing effect for attention
 */
export const pulse = (
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.slow,
        useNativeDriver = true,
    } = config;

    return Animated.loop(
        Animated.sequence([
            Animated.timing(animatedValue, {
                toValue: 1.05,
                duration: duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver,
            }),
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: duration / 2,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver,
            }),
        ])
    );
};

/**
 * Shimmer Animation
 * Loading shimmer effect
 */
export const shimmer = (
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.slower,
        useNativeDriver = true,
    } = config;

    return Animated.loop(
        Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver,
        })
    );
};

/**
 * Rotate Animation
 * Continuous rotation
 */
export const rotate = (
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        duration = ANIMATION.duration.slowest,
        useNativeDriver = true,
    } = config;

    return Animated.loop(
        Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver,
        })
    );
};

/**
 * Bounce Animation
 * Bouncy entrance effect
 */
export const bounce = (
    animatedValue: Animated.Value,
    config: AnimationConfig = {}
): Animated.CompositeAnimation => {
    const {
        delay = 0,
        useNativeDriver = true,
    } = config;

    return Animated.spring(animatedValue, {
        toValue: 1,
        tension: 100,
        friction: 3,
        delay,
        useNativeDriver,
    });
};

/**
 * Interpolate rotation
 * Converts animated value to rotation degrees
 */
export const interpolateRotation = (animatedValue: Animated.Value) => {
    return animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
};

/**
 * Interpolate shimmer position
 * For shimmer loading effect
 */
export const interpolateShimmer = (animatedValue: Animated.Value) => {
    return animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-1, 1],
    });
};

/**
 * Create staggered list animations
 * Returns array of animated values for list items
 */
export const createListAnimations = (itemCount: number) => {
    return Array.from({ length: itemCount }, () => new Animated.Value(0));
};

/**
 * Animate list entry with stagger
 */
export const animateListEntry = (
    animatedValues: Animated.Value[],
    staggerDelay: number = 50
) => {
    const animations = animatedValues.map((value, index) =>
        Animated.parallel([
            Animated.timing(value, {
                toValue: 1,
                duration: ANIMATION.duration.normal,
                delay: index * staggerDelay,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ])
    );

    Animated.stagger(staggerDelay, animations).start();
};

export default {
    fadeIn,
    fadeOut,
    slideUp,
    slideDown,
    scaleIn,
    pressScale,
    releaseScale,
    createStaggeredAnimation,
    entryAnimation,
    exitAnimation,
    pulse,
    shimmer,
    rotate,
    bounce,
    interpolateRotation,
    interpolateShimmer,
    createListAnimations,
    animateListEntry,
};
