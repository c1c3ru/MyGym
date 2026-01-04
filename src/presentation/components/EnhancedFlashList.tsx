import React, { memo, useMemo, useCallback } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { flashListConfig } from '@utils/performanceOptimizations';
import { COLORS, SPACING, FONT_SIZE } from '@presentation/theme/designTokens';

/**
 * Rodapé de carregamento para a lista
 */
const LoadingFooter = memo(() => (
    <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.info[500]} />
        <Text style={styles.loadingText}>Carregando mais...</Text>
    </View>
));

/**
 * Propriedades para o componente de lista vazia
 */
interface EmptyComponentProps {
    /** Mensagem a ser exibida quando a lista estiver vazia */
    message?: string;
}

/**
 * Componente exibido quando a lista está vazia
 */
const EmptyComponent = memo(({ message = 'Nenhum item encontrado' }: EmptyComponentProps) => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{message}</Text>
    </View>
));

/**
 * Propriedades para o componente EnhancedFlashList
 */
interface EnhancedFlashListProps<T> extends Omit<FlashListProps<T>, 'estimatedItemSize' | 'contentContainerStyle'> {
    /** Mensagem para o estado vazio padrão */
    emptyMessage?: string;
    /** Indica se está carregando mais itens (paginação) */
    loadingMore?: boolean;
    /** Tamanho estimado do item para otimização do FlashList */
    estimatedItemSize?: number;
    /** Estilo para o container da lista */
    contentContainerStyle?: FlashListProps<T>['contentContainerStyle'];
    /** Estilo para a lista */
    style?: StyleProp<ViewStyle>;
}

/**
 * Versão aprimorada do FlashList com comportamentos padrão de loading e empty state
 */
function EnhancedFlashListInner<T>({
    data,
    renderItem,
    keyExtractor,
    onEndReached,
    onEndReachedThreshold = 0.1,
    refreshing = false,
    onRefresh,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    emptyMessage,
    loadingMore = false,
    estimatedItemSize = 120,
    numColumns = 1,
    horizontal = false,
    showsVerticalScrollIndicator = false,
    showsHorizontalScrollIndicator = false,
    contentContainerStyle,
    style,
    accessible = true,
    accessibilityLabel,
    ...props
}: EnhancedFlashListProps<T>) {
    // Memoizar componentes para performance
    const memoizedRenderItem = useCallback((info: any) => {
        return renderItem ? renderItem(info) : null;
    }, [renderItem]);

    const memoizedKeyExtractor = useCallback((item: T, index: number) => {
        if (keyExtractor) return keyExtractor(item, index);
        return (item as any).id || (item as any).key || index.toString();
    }, [keyExtractor]);

    const memoizedListEmpty = useMemo(() => {
        if (ListEmptyComponent) return ListEmptyComponent;
        if (emptyMessage) return <EmptyComponent message={emptyMessage} />;
        return <EmptyComponent />;
    }, [ListEmptyComponent, emptyMessage]);

    const memoizedListFooter = useMemo(() => {
        if (ListFooterComponent) return ListFooterComponent;
        if (loadingMore) return <LoadingFooter />;
        return null;
    }, [ListFooterComponent, loadingMore]);

    // Configurações otimizadas para FlashList
    const optimizedConfig = useMemo(() => ({
        ...flashListConfig,
        estimatedItemSize,
    }), [estimatedItemSize]);

    return (
        <FlashList
            data={data}
            renderItem={memoizedRenderItem}
            keyExtractor={memoizedKeyExtractor}
            estimatedItemSize={optimizedConfig.estimatedItemSize}
            drawDistance={optimizedConfig.drawDistance as any}
            numColumns={numColumns}
            horizontal={horizontal}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={memoizedListFooter}
            ListEmptyComponent={memoizedListEmpty}
            contentContainerStyle={contentContainerStyle}
            style={[styles.defaultFlashList, style]}
            accessible={accessible}
            accessibilityLabel={accessibilityLabel || `Lista com ${data?.length || 0} itens`}
            {...props}
        />
    );
}

const EnhancedFlashList = memo(EnhancedFlashListInner) as typeof EnhancedFlashListInner;

const styles = StyleSheet.create({
    defaultFlashList: {
        flex: 1,
        minHeight: 200, // Altura mínima para evitar erro do FlashList
    },
    loadingFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.base,
    },
    loadingText: {
        marginLeft: SPACING.sm,
        color: COLORS.text.secondary,
        fontSize: FONT_SIZE.base,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.base,
    },
    emptyText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text.secondary,
        textAlign: 'center',
    },
});

export default EnhancedFlashList;
