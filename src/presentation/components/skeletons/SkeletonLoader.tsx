import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Platform, StyleProp, ViewStyle, DimensionValue } from 'react-native';

/**
 * Propriedades para o componente base SkeletonLoader
 */
interface SkeletonLoaderProps {
  /** Largura do esqueleto */
  width?: DimensionValue;
  /** Altura do esqueleto */
  height?: DimensionValue;
  /** Raio da borda */
  borderRadius?: number;
  /** Estilo adicional */
  style?: StyleProp<ViewStyle>;
  /** Indica se possui animação shimmer */
  animated?: boolean;
  /** Cor de fundo base */
  backgroundColor?: string;
  /** Cor do destaque da animação */
  highlightColor?: string;
}

/**
 * Componente base para skeleton loading com animação shimmer
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style = {},
  animated = true,
  backgroundColor = '#E1E9EE',
  highlightColor = '#F2F8FC'
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const shimmer = () => {
      shimmerAnimation.setValue(0);
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => shimmer());
    };

    shimmer();
  }, [animated, shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const skeletonStyle: StyleProp<ViewStyle> = [
    styles.skeleton,
    {
      width: width as any,
      height: height as any,
      borderRadius,
      backgroundColor,
    },
    style
  ];

  if (!animated) {
    return <View style={skeletonStyle} />;
  }

  return (
    <View style={skeletonStyle}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: highlightColor,
            transform: [{ translateX } as any],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
});

export default SkeletonLoader;
