/**
 * Fallback para ícones quando as fontes não carregam na web
 * Usa ícones Unicode como fallback
 */

import React from 'react';
import { Text, Platform, TextStyle } from 'react-native';
import { COLORS } from '@presentation/theme/designTokens';

// Mapeamento de ícones comuns para Unicode
// Ionicons
const iconFallbacksIon: Record<string, string> = {
  'home': '🏠',
  'home-outline': '🏠',
  'person': '👤',
  'person-outline': '👤',
  'people': '👥',
  'people-outline': '👥',
  'school': '🏫',
  'school-outline': '🏫',
  'fitness': '💪',
  'fitness-outline': '💪',
  'calendar': '📅',
  'calendar-outline': '📅',
  'stats-chart': '📊',
  'stats-chart-outline': '📊',
  'settings': '⚙️',
  'settings-outline': '⚙️',
  'notifications': '🔔',
  'notifications-outline': '🔔',
  'add': '➕',
  'add-outline': '➕',
  'remove': '➖',
  'remove-outline': '➖',
  'checkmark': '✅',
  'checkmark-outline': '✅',
  'close': '❌',
  'close-outline': '❌',
  'menu': '☰',
  'menu-outline': '☰',
  'search': '🔍',
  'search-outline': '🔍',
  'filter': '🔽',
  'filter-outline': '🔽',
  'eye': '👁️',
  'eye-outline': '👁️',
  'eye-off': '🙈',
  'eye-off-outline': '🙈',
  'mail': '📧',
  'mail-outline': '📧',
  'call': '📞',
  'call-outline': '📞',
  'location': '📍',
  'location-outline': '📍',
  'time': '⏰',
  'time-outline': '⏰',
  'card': '💳',
  'card-outline': '💳',
  'cash': '💰',
  'cash-outline': '💰',
  'trophy': '🏆',
  'trophy-outline': '🏆',
  'star': '⭐',
  'star-outline': '⭐',
  'heart': '❤️',
  'heart-outline': '❤️',
  'thumbs-up': '👍',
  'thumbs-up-outline': '👍',
  'warning': '⚠️',
  'warning-outline': '⚠️',
  'information': 'ℹ️',
  'information-outline': 'ℹ️',
  'help': '❓',
  'help-outline': '❓',
  'document': '📄',
  'document-outline': '📄',
  'folder': '📁',
  'folder-outline': '📁',
  'image': '🖼️',
  'image-outline': '🖼️',
  'camera': '📷',
  'camera-outline': '📷',
  'share': '📤',
  'share-outline': '📤',
  'download': '📥',
  'download-outline': '📥',
  'refresh': '🔄',
  'refresh-outline': '🔄',
  'sync': '🔄',
  'sync-outline': '🔄',
  'cloud': '☁️',
  'cloud-outline': '☁️',
  'wifi': '📶',
  'wifi-outline': '📶',
  'bluetooth': '📶',
  'bluetooth-outline': '📶',
  'battery-full': '🔋',
  'battery-outline': '🔋',
  'power': '⚡',
  'power-outline': '⚡',
  'lock-closed': '🔒',
  'lock-closed-outline': '🔒',
  'lock-open': '🔓',
  'lock-open-outline': '🔓',
  'key': '🔑',
  'key-outline': '🔑',
  'shield': '🛡️',
  'shield-outline': '🛡️',
  'bug': '🐛',
  'bug-outline': '🐛',
  'code': '💻',
  'code-outline': '💻',
  'terminal': '💻',
  'terminal-outline': '💻',
  'globe': '🌐',
  'globe-outline': '🌐',
  'link': '🔗',
  'link-outline': '🔗',
  'bookmark': '🔖',
  'bookmark-outline': '🔖',
  'flag': '🚩',
  'flag-outline': '🚩',
  'pin': '📌',
  'pin-outline': '📌',
  'compass': '🧭',
  'compass-outline': '🧭',
  'map': '🗺️',
  'map-outline': '🗺️',
  'car': '🚗',
  'car-outline': '🚗',
  'bus': '🚌',
  'bus-outline': '🚌',
  'train': '🚂',
  'train-outline': '🚂',
  'airplane': '✈️',
  'airplane-outline': '✈️',
  'boat': '🚤',
  'boat-outline': '🚤',
  'bicycle': '🚲',
  'bicycle-outline': '🚲',
  'walk': '🚶',
  'walk-outline': '🚶',
  'run': '🏃',
  'run-outline': '🏃',
  'accessibility': '♿',
  'accessibility-outline': '♿',
  'medical': '⚕️',
  'medical-outline': '⚕️',
  'bandage': '🩹',
  'bandage-outline': '🩹',
  'thermometer': '🌡️',
  'thermometer-outline': '🌡️',
  'pill': '💊',
  'pill-outline': '💊',
  'restaurant': '🍽️',
  'restaurant-outline': '🍽️',
  'cafe': '☕',
  'cafe-outline': '☕',
  'wine': '🍷',
  'wine-outline': '🍷',
  'beer': '🍺',
  'beer-outline': '🍺',
  'pizza': '🍕',
  'pizza-outline': '🍕',
  'ice-cream': '🍦',
  'ice-cream-outline': '🍦',
  'gift': '🎁',
  'gift-outline': '🎁',
  'balloon': '🎈',
  'balloon-outline': '🎈',
  'musical-notes': '🎵',
  'musical-notes-outline': '🎵',
  'headset': '🎧',
  'headset-outline': '🎧',
  'mic': '🎤',
  'mic-outline': '🎤',
  'videocam': '📹',
  'videocam-outline': '📹',
  'tv': '📺',
  'tv-outline': '📺',
  'radio': '📻',
  'radio-outline': '📻',
  'game-controller': '🎮',
  'game-controller-outline': '🎮',
  'dice': '🎲',
  'dice-outline': '🎲',
  'football': '⚽',
  'football-outline': '⚽',
  'basketball': '🏀',
  'basketball-outline': '🏀',
  'tennis': '🎾',
  'tennis-outline': '🎾',
  'baseball': '⚾',
  'baseball-outline': '⚾',
  'golf': '⛳',
  'golf-outline': '⛳',
  'bowling': '🎳',
  'bowling-outline': '🎳',
  'fishing': '🎣',
  'fishing-outline': '🎣',
  'hammer': '🔨',
  'hammer-outline': '🔨',
  'wrench': '🔧',
  'wrench-outline': '🔧',
  'screwdriver': '🪛',
  'screwdriver-outline': '🪛',
  'build': '🔧',
  'build-outline': '🔧',
  'construct': '🚧',
  'construct-outline': '🚧',
  'flash': '⚡',
  'flash-outline': '⚡',
  'flashlight': '🔦',
  'flashlight-outline': '🔦',
  'bulb': '💡',
  'bulb-outline': '💡',
  'sunny': '☀️',
  'sunny-outline': '☀️',
  'moon': '🌙',
  'moon-outline': '🌙',
  'partly-sunny': '⛅',
  'partly-sunny-outline': '⛅',
  'cloudy': '☁️',
  'cloudy-outline': '☁️',
  'rainy': '🌧️',
  'rainy-outline': '🌧️',
  'stormy': '⛈️',
  'stormy-outline': '⛈️',
  'snow': '❄️',
  'snow-outline': '❄️',
  'umbrella': '☂️',
  'umbrella-outline': '☂️',
};

// MaterialCommunityIcons
const iconFallbacksMci: Record<string, string> = {
  'account': '👤',
  'account-outline': '👤',
  'account-group': '👥',
  'account-group-outline': '👥',
  'home': '🏠',
  'home-outline': '🏠',
  'dumbbell': '🏋️',
  'weight-lifter': '🏋️',
  'run-fast': '🏃',
  'calendar-month': '📅',
  'chart-line': '📈',
  'cog': '⚙️',
  'bell': '🔔',
  'bell-outline': '🔔',
  'plus': '➕',
  'minus': '➖',
  'check': '✅',
  'close': '❌',
  'menu': '☰',
  'magnify': '🔍',
  'filter': '🔽',
  'eye': '👁️',
  'eye-off': '🙈',
  'email': '📧',
  'phone': '📞',
  'map-marker': '📍',
  'clock': '⏰',
  'credit-card': '💳',
  'cash': '💰',
  'trophy': '🏆',
  'star': '⭐',
  'heart': '❤️',
  'thumb-up': '👍',
  'alert': '⚠️',
  'information': 'ℹ️',
  'help-circle': '❓',
  'file-document': '📄',
  'folder': '📁',
  'image': '🖼️',
  'camera': '📷',
  'share': '📤',
  'download': '📥',
  'refresh': '🔄',
  'sync': '🔄',
  'cloud': '☁️',
  'wifi': '📶',
  'bluetooth': '📶',
  'battery': '🔋',
  'flash': '⚡',
  'lock': '🔒',
  'lock-open': '🔓',
  'key': '🔑',
  'shield': '🛡️',
  'bug': '🐛',
  'code-tags': '💻',
  'console': '💻',
  'web': '🌐',
  'link': '🔗',
  'bookmark': '🔖',
  'flag': '🚩',
  'pin': '📌',
  'compass': '🧭',
  'map': '🗺️',
  'car': '🚗',
  'bus': '🚌',
  'train': '🚂',
  'airplane': '✈️',
  'boat': '🚤',
  'bike': '🚲',
  'walk': '🚶',
  'run': '🏃',
  'wheelchair-accessibility': '♿',
  'medical-bag': '⚕️',
  'bandage': '🩹',
  'thermometer': '🌡️',
  'pill': '💊',
  'food': '🍽️',
  'coffee': '☕',
  'glass-wine': '🍷',
  'beer': '🍺',
  'pizza': '🍕',
  'ice-cream': '🍦',
  'gift': '🎁',
  'balloon': '🎈',
  'music-note': '🎵',
  'headphones': '🎧',
  'microphone': '🎤',
  'video': '📹',
  'television': '📺',
  'radio': '📻',
  'gamepad-variant': '🎮',
  'dice-6': '🎲',
  'soccer': '⚽',
  'basketball': '🏀',
  'tennis': '🎾',
  'baseball': '⚾',
  'golf': '⛳',
  'bowling': '🎳',
  'fishing': '🎣',
  'hammer': '🔨',
  'wrench': '🔧',
  'screwdriver': '🪛',
  'tools': '🔧',
  'construction': '🚧',
  'lightning-bolt': '⚡',
  'flashlight': '🔦',
  'lightbulb': '💡',
  'weather-sunny': '☀️',
  'weather-night': '🌙',
  'weather-partly-cloudy': '⛅',
  'weather-cloudy': '☁️',
  'weather-rainy': '🌧️',
  'weather-lightning': '⛈️',
  'weather-snowy': '❄️',
  'umbrella': '☂️'
};

// Merge final (MCI sobrescreve Ionicons quando há mesma chave)
const iconFallbacks: Record<string, string> = {
  ...iconFallbacksIon,
  ...iconFallbacksMci,
};

/**
 * Obtém um ícone fallback baseado no nome
 * @param {string} name - Nome do ícone
 * @returns {string} - Emoji fallback ou ícone genérico
 */
export const getIconFallback = (name: string | null | undefined): string => {
  if (!name) return '❓';
  
  const normalizedName = name.toLowerCase().replace(/-/g, '-');
  return iconFallbacks[normalizedName] || iconFallbacks[name] || '⚪';
};

/**
 * Componente de ícone com fallback automático
 */

type IconWithFallbackProps = {
  IconComponent: React.ComponentType<any>;
  name: string;
  size?: number;
  color?: string;
  style?: any;
  fallbackStyle?: TextStyle | TextStyle[];
  [key: string]: any;
};

export const IconWithFallback: React.FC<IconWithFallbackProps> = ({ 
  IconComponent,
  name,
  size = 24,
  color = COLORS.black,
  style = {},
  fallbackStyle = {},
  ...props
}) => {
  // No web, sempre usar fallback se houver problemas com fontes
  if (Platform.OS === 'web') {
    const [hasError, setHasError] = React.useState(false);
    
    if (hasError) {
      return (
        <Text 
          style={[
            { 
              fontSize: size, 
              color, 
              textAlign: 'center',
              lineHeight: size + 4
            }, 
            style, 
            fallbackStyle
          ]}
        >
          {getIconFallback(name)}
        </Text>
      );
    }
    
    try {
      return (
        <IconComponent 
          name={name} 
          size={size} 
          color={color} 
          style={style}
          onError={() => setHasError(true)}
          {...props} 
        />
      );
    } catch (error) {
      console.warn(`Erro ao carregar ícone ${name}:`, error);
      return (
        <Text 
          style={[
            { 
              fontSize: size, 
              color, 
              textAlign: 'center',
              lineHeight: size + 4
            }, 
            style, 
            fallbackStyle
          ]}
        >
          {getIconFallback(name)}
        </Text>
      );
    }
  }
  
  // Em outras plataformas, usar o ícone normalmente
  return (
    <IconComponent 
      name={name} 
      size={size} 
      color={color} 
      style={style}
      {...props} 
    />
  );
};

export default IconWithFallback;
