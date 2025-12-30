import React, { memo } from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';

/**
 * Variantes de cores suportadas pelo ActionButton
 */
export type ActionButtonVariant = 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline' | 'info';

/**
 * Tamanhos suportados pelo ActionButton
 */
export type ActionButtonSize = 'small' | 'medium' | 'large';

/**
 * Propriedades para o componente ActionButton
 */
interface ActionButtonProps extends Omit<ButtonProps, 'children' | 'size' | 'mode'> {
    /** Modo de exibição: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal' */
    mode?: ButtonProps['mode'];
    /** Nome do ícone (MaterialCommunityIcons) */
    icon?: keyof typeof MaterialCommunityIcons.glyphMap | string;
    /** Conteúdo do botão */
    children: React.ReactNode;
    /** Variante de cor */
    variant?: ActionButtonVariant;
    /** Tamanho do botão */
    size?: ActionButtonSize;
    /** Indica carregamento */
    loading?: boolean;
    /** Indica desabilitado */
    disabled?: boolean;
    /** Estilo adicional */
    style?: StyleProp<ViewStyle>;
}

const ActionButton: React.FC<ActionButtonProps> = ({
    mode = 'outlined',
    icon,
    children,
    onPress,
    style,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    ...props
}) => {
    const { currentTheme } = useThemeToggle();

    const getButtonColors = () => {
        switch (variant) {
            case 'primary':
                return {
                    contained: [COLORS.primary[500], COLORS.primary[700]],
                    outlined: COLORS.primary[600],
                    text: mode === 'contained' ? COLORS.white : COLORS.primary[700]
                };
            case 'success':
                return {
                    contained: [COLORS.success[500], COLORS.success[700]],
                    outlined: COLORS.success[600],
                    text: mode === 'contained' ? COLORS.white : COLORS.success[700]
                };
            case 'warning':
                return {
                    contained: [COLORS.warning[500], COLORS.warning[700]],
                    outlined: COLORS.warning[600],
                    text: mode === 'contained' ? COLORS.white : COLORS.warning[800]
                };
            case 'danger':
                return {
                    contained: [COLORS.error[500], COLORS.error[700]],
                    outlined: COLORS.error[600],
                    text: mode === 'contained' ? COLORS.white : COLORS.error[700]
                };
            case 'secondary':
                return {
                    contained: [COLORS.gray[600], COLORS.gray[800]],
                    outlined: COLORS.gray[600],
                    text: mode === 'contained' ? COLORS.white : COLORS.gray[800]
                };
            case 'outline':
            case 'info':
                return {
                    contained: [COLORS.info[500], COLORS.info[700]],
                    outlined: COLORS.info[600],
                    text: mode === 'contained' ? COLORS.white : COLORS.info[700]
                };
            default:
                return {
                    contained: [COLORS.primary[500], COLORS.primary[700]],
                    outlined: COLORS.primary[600],
                    text: mode === 'contained' ? COLORS.white : COLORS.primary[700]
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    minHeight: 36,
                    paddingHorizontal: SPACING.md,
                    fontSize: FONT_SIZE.sm,
                    iconSize: 24
                };
            case 'large':
                return {
                    minHeight: 52,
                    paddingHorizontal: SPACING.xl,
                    fontSize: FONT_SIZE.lg,
                    iconSize: 32
                };
            default: // medium
                return {
                    minHeight: 44,
                    paddingHorizontal: SPACING.lg,
                    fontSize: FONT_SIZE.base,
                    iconSize: 28
                };
        }
    };

    const colors = getButtonColors();
    const sizeStyles = getSizeStyles();

    // Criar ícone customizado com tamanho forçado
    const customIcon = icon ? (iconProps: { size: number; color: string }) => (
        <MaterialCommunityIcons
            name={icon as any}
            size={sizeStyles.iconSize}
            color={mode === 'contained' ? COLORS.white : colors.text}
        />
    ) : undefined;

    if (mode === 'contained') {
        return (
            <View style={[styles.gradientContainer, style, { minHeight: sizeStyles.minHeight }]}>
                <LinearGradient
                    colors={(disabled ? [COLORS.gray[300], COLORS.gray[400]] : colors.contained) as [string, string, ...string[]]}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Button
                        mode="text"
                        icon={customIcon as any}
                        onPress={onPress}
                        loading={loading}
                        disabled={disabled}
                        labelStyle={[
                            styles.gradientButtonText,
                            { fontSize: sizeStyles.fontSize }
                        ]}
                        contentStyle={[
                            styles.gradientButtonContent,
                            { paddingHorizontal: sizeStyles.paddingHorizontal }
                        ]}
                        style={styles.gradientButton}
                        {...(props as any)}
                    >
                        {children}
                    </Button>
                </LinearGradient>
            </View>
        );
    }

    return (
        <Button
            mode={mode as any}
            icon={customIcon as any}
            onPress={onPress}
            loading={loading}
            disabled={disabled}
            buttonColor={mode === 'outlined' ? 'transparent' : undefined}
            textColor={disabled ? COLORS.gray[400] : colors.text}
            style={[
                styles.button,
                mode === 'outlined' && {
                    borderColor: disabled ? COLORS.gray[300] : colors.outlined,
                    borderWidth: 2
                },
                { minHeight: sizeStyles.minHeight },
                style
            ] as any}
            labelStyle={[
                styles.buttonText,
                { fontSize: sizeStyles.fontSize }
            ]}
            contentStyle={[
                styles.buttonContent,
                { paddingHorizontal: sizeStyles.paddingHorizontal }
            ]}
            {...(props as any)}
        >
            {children}
        </Button>
    );
};

/**
 * Propriedades para ActionButtonGroup
 */
interface ActionButtonGroupProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    direction?: 'row' | 'column';
}

/**
 * Componente para grupo de botões de ação
 */
export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = memo(({ children, style, direction = 'row' }) => {
    return (
        <View style={[
            styles.buttonGroup,
            direction === 'column' ? styles.buttonGroupColumn : styles.buttonGroupRow,
            style
        ]}>
            {children}
        </View>
    );
});

/**
 * Propriedades para FloatingActionButton
 */
interface FloatingActionButtonProps {
    icon: string;
    label?: string;
    onPress: () => void;
    variant?: ActionButtonVariant;
    style?: StyleProp<ViewStyle>;
}

/**
 * Componente para botão de ação flutuante melhorado com gradiente
 */
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ icon, label, onPress, variant = 'primary', style }) => {
    const getColors = () => {
        switch (variant) {
            case 'success': return [COLORS.success[500], COLORS.success[700]];
            case 'warning': return [COLORS.warning[500], COLORS.warning[700]];
            case 'danger': return [COLORS.error[500], COLORS.error[700]];
            case 'secondary': return [COLORS.gray[600], COLORS.gray[800]];
            default: return [COLORS.primary[500], COLORS.primary[700]];
        }
    };

    return (
        <View style={[styles.fabContainer, style]}>
            <LinearGradient
                colors={getColors() as [string, string, ...string[]]}
                style={styles.fabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Button
                    mode="text"
                    icon={icon}
                    onPress={onPress}
                    labelStyle={styles.fabText}
                    contentStyle={styles.fabContent}
                    style={styles.fab}
                >
                    {label}
                </Button>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: BORDER_RADIUS.md,
        ...Platform.select({
            web: {
                // @ts-ignore
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            },
            default: {
                elevation: 2,
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }
        }),
    },
    buttonText: {
        fontWeight: '600',
    },
    buttonContent: {
        height: '100%',
    },
    gradientContainer: {
        borderRadius: BORDER_RADIUS.md,
        ...Platform.select({
            web: {
                // @ts-ignore
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            },
            default: {
                elevation: 3,
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
            }
        }),
    },
    gradient: {
        borderRadius: BORDER_RADIUS.md,
        flex: 1,
    },
    gradientButton: {
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'transparent',
        margin: 0,
    },
    gradientButtonText: {
        color: COLORS.white,
        fontWeight: '600',
    },
    gradientButtonContent: {
        height: '100%',
    },
    buttonGroup: {
        gap: SPACING.sm,
    },
    buttonGroupRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    buttonGroupColumn: {
        flexDirection: 'column',
    },
    fabContainer: {
        borderRadius: BORDER_RADIUS.md,
        ...Platform.select({
            web: {
                // @ts-ignore
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            },
            default: {
                elevation: 6,
                shadowColor: COLORS.black,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            }
        }),
    },
    fabGradient: {
        borderRadius: BORDER_RADIUS.md,
        minHeight: 56,
    },
    fab: {
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'transparent',
        margin: 0,
    },
    fabText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: FONT_SIZE.md,
    },
    fabContent: {
        height: 56,
        paddingHorizontal: SPACING.base,
    },
});

const MemoizedActionButton = memo(ActionButton) as unknown as React.FC<ActionButtonProps>;
export default MemoizedActionButton;
