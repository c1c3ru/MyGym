import React from 'react';
import { Image, type ImageProps, type StyleProp, type ImageStyle } from 'react-native';

// Componente de imagem otimizado - usando Image padrão por compatibilidade
// TODO: Adicionar react-native-fast-image quando compatível com React 19
type OptimizedImageProps = Omit<ImageProps, 'style'> & { style?: StyleProp<ImageStyle> };

const OptimizedImage: React.FC<OptimizedImageProps> = ({ source, style, resizeMode = 'contain', ...props }) => {
  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      {...props}
    />
  );
};

export default OptimizedImage;
