import React, { memo } from 'react';
import { View, StyleSheet, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, Text, Button, Card, ButtonProps } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

/**
 * Propriedades para FullScreenLoading
 */
interface FullScreenLoadingProps {
    /** Mensagem de carregamento */
    message?: string;
    /** Se deve mostrar o logo */
    showLogo?: boolean;
}

/**
 * Loading state para tela completa
 */
export const FullScreenLoading = memo<FullScreenLoadingProps>(({
    message = getString('loadingState'),
    showLogo = false
}) => (
    <View style={styles.fullScreenContainer}>
        {showLogo && (
            <Ionicons name="fitness-outline" size={48} color={COLORS.info[500]} style={styles.logo} />
        )}
        <ActivityIndicator size="large" color={COLORS.info[500]} />
        <Text style={styles.loadingText}>{message}</Text>
    </View>
));

/**
 * Propriedades para SectionLoading
 */
interface SectionLoadingProps {
    /** Mensagem de carregamento */
    message?: string;
    /** Tamanho do indicador */
    size?: 'small' | 'medium' | 'large' | number;
    /** Estilo adicional */
    style?: StyleProp<ViewStyle>;
}

/**
 * Loading state para seções
 */
export const SectionLoading = memo<SectionLoadingProps>(({
    message = getString('loadingState'),
    size = 'medium',
    style
}) => (
    <View style={[styles.sectionContainer, style]}>
        <ActivityIndicator size={size as any} color={COLORS.info[500]} />
        <Text style={styles.sectionText}>{message}</Text>
    </View>
));

/**
 * Loading state para listas (skeleton)
 */
export const ListItemSkeleton = memo(() => (
    <Card style={styles.skeletonCard}>
        <Card.Content style={styles.skeletonContent}>
            <View style={styles.skeletonRow}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonTextContainer}>
                    <View style={[styles.skeletonText, styles.skeletonTitle]} />
                    <View style={[styles.skeletonText, styles.skeletonSubtitle]} />
                </View>
            </View>
            <View style={styles.skeletonActions}>
                <View style={styles.skeletonButton} />
                <View style={styles.skeletonButton} />
            </View>
        </Card.Content>
    </Card>
));

/**
 * Propriedades para FormLoading
 */
interface FormLoadingProps {
    /** Mensagem de carregamento */
    message?: string;
}

/**
 * Loading state para formulários
 */
export const FormLoading = memo<FormLoadingProps>(({ message = getString('saving') }) => (
    <View style={styles.formLoadingContainer}>
        <ActivityIndicator size="small" color={COLORS.info[500]} />
        <Text style={styles.formLoadingText}>{message}</Text>
    </View>
));

/**
 * Propriedades para ErrorState
 */
interface ErrorStateProps {
    /** Título do erro */
    title?: string;
    /** Mensagem de erro */
    message?: string;
    /** Callback para tentar novamente */
    onRetry?: () => void;
    /** Se deve mostrar o ícone */
    showIcon?: boolean;
}

/**
 * Estado de erro consistente
 */
export const ErrorState = memo<ErrorStateProps>(({
    title = 'Ops! Algo deu errado',
    message = getString('dataLoadError'),
    onRetry,
    showIcon = true
}) => (
    <View style={styles.errorContainer}>
        {showIcon && (
            <Ionicons name="alert-circle-outline" size={48} color={COLORS.error[500]} style={styles.errorIcon} />
        )}
        <Text style={styles.errorTitle}>{title}</Text>
        <Text style={styles.errorMessage}>{message}</Text>
        {onRetry && (
            <Button
                mode="outlined"
                onPress={onRetry}
                style={styles.retryButton}
                icon="refresh"
            >
                Tentar Novamente
            </Button>
        )}
    </View>
));

/**
 * Propriedades para EmptyState
 */
interface EmptyStateProps {
    /** Título do estado vazio */
    title?: string;
    /** Mensagem do estado vazio */
    message?: string;
    /** Ícone (Ionicons) */
    icon?: keyof typeof Ionicons.glyphMap | string;
    /** Se deve mostrar ação */
    action?: boolean;
    /** Rótulo da ação */
    actionLabel?: string;
    /** Callback da ação */
    onAction?: () => void;
}

/**
 * Estado vazio consistente
 */
export const EmptyState = memo<EmptyStateProps>(({
    title = 'Nenhum item encontrado',
    message = 'Não há dados para exibir no momento.',
    icon = 'folder-open-outline',
    action,
    actionLabel = getString('add'),
    onAction
}) => (
    <View style={styles.emptyContainer}>
        <Ionicons name={icon as any} size={48} color={COLORS.gray[500]} style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
        {action && onAction && (
            <Button
                mode="contained"
                onPress={onAction}
                style={styles.actionButton}
                icon="plus"
            >
                {actionLabel}
            </Button>
        )}
    </View>
));

/**
 * Propriedades para ButtonLoading
 */
interface ButtonLoadingProps extends Omit<ButtonProps, 'loading' | 'children'> {
    /** Indica carregamento */
    loading?: boolean;
    /** Conteúdo do botão */
    children: React.ReactNode;
}

/**
 * Loading state para botões
 */
export const ButtonLoading = memo<ButtonLoadingProps>(({
    loading = false,
    children,
    disabled,
    ...props
}) => (
    <Button
        {...(props as any)}
        loading={loading}
        disabled={loading || disabled}
    >
        {children}
    </Button>
));

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.gray[100],
        paddingHorizontal: 20,
    },
    logo: {
        marginBottom: 20,
    },
    loadingText: {
        marginTop: SPACING.base,
        fontSize: FONT_SIZE.md,
        color: COLORS.text.secondary,
        textAlign: 'center',
    },
    sectionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    sectionText: {
        marginLeft: SPACING.md,
        fontSize: FONT_SIZE.base,
        color: COLORS.text.secondary,
    },
    skeletonCard: {
        marginHorizontal: 16,
        marginVertical: 8,
        elevation: 2,
        borderRadius: BORDER_RADIUS.md,
    },
    skeletonContent: {
        padding: SPACING.base,
    },
    skeletonRow: {
        flexDirection: 'row',
        marginBottom: SPACING.base,
    },
    skeletonAvatar: {
        width: 50,
        height: 50,
        borderRadius: BORDER_RADIUS.xs5,
        backgroundColor: COLORS.gray[300],
        marginRight: SPACING.md,
    },
    skeletonTextContainer: {
        flex: 1,
    },
    skeletonText: {
        backgroundColor: COLORS.gray[300],
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.sm,
    },
    skeletonTitle: {
        height: 16,
        width: '60%',
    },
    skeletonSubtitle: {
        height: 12,
        width: '40%',
    },
    skeletonActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    skeletonButton: {
        width: 80,
        height: 32,
        backgroundColor: COLORS.gray[300],
        borderRadius: BORDER_RADIUS.lg,
    },
    formLoadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.base,
    },
    formLoadingText: {
        marginLeft: SPACING.sm,
        fontSize: FONT_SIZE.base,
        color: COLORS.text.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: COLORS.gray[100],
    },
    errorIcon: {
        marginBottom: SPACING.base,
    },
    errorTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold as any,
        color: COLORS.text.primary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    errorMessage: {
        fontSize: FONT_SIZE.base,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    retryButton: {
        borderColor: COLORS.info[500],
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: COLORS.gray[100],
    },
    emptyIcon: {
        marginBottom: SPACING.base,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold as any,
        color: COLORS.text.primary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    emptyMessage: {
        fontSize: FONT_SIZE.base,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    actionButton: {
        backgroundColor: COLORS.primary[500],
    },
});

export default {
    FullScreenLoading,
    SectionLoading,
    ListItemSkeleton,
    FormLoading,
    ErrorState,
    EmptyState,
    ButtonLoading,
};
