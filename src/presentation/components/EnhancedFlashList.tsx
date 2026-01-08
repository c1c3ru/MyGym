import React, { memo, useMemo, useCallback } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { View, StyleSheet, ViewStyle, StyleProp, Platform, FlatList } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { flashListConfig } from '@utils/performanceOptimizations';
import { COLORS, SPACING, FONT_SIZE } from '@presentation/theme/designTokens';

const styles = StyleSheet.create({
    defaultFlashList: {
        flex: 1,
        width: '100%',
    },
    loadingFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.md,
    },
    loadingText: {
        marginLeft: SPACING.sm,
        color: COLORS.gray[500],
        fontSize: FONT_SIZE.base,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    emptyText: {
        fontSize: FONT_SIZE.md,
        color: COLORS.gray[500],
        textAlign: 'center',
    },
});

const LoadingFooter = memo(() => (
    <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.info[500]} />
        <Text style={styles.loadingText}>Carregando mais...</Text>
    </View>
));

interface EmptyComponentProps {
    message?: string;
}

const EmptyComponent = memo(({ message = 'Nenhum item encontrado' }: EmptyComponentProps) => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{message}</Text>
    </View>
));

interface EnhancedFlashListProps<T> extends Omit<FlashListProps<T>, 'estimatedItemSize' | 'contentContainerStyle'> {
    emptyMessage?: string;
    loadingMore?: boolean;
    estimatedItemSize?: number;
    contentContainerStyle?: FlashListProps<T>['contentContainerStyle'];
    style?: StyleProp<ViewStyle>;
}

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

    const optimizedConfig = useMemo(() => ({
        ...flashListConfig,
        estimatedItemSize,
    }), [estimatedItemSize]);

    if (Platform.OS === 'web') {
        return (
            <View style={[styles.defaultFlashList, style]}>
                <FlatList
                    data={data}
                    renderItem={memoizedRenderItem}
                    keyExtractor={memoizedKeyExtractor}
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
                    accessible={accessible}
                    accessibilityLabel={accessibilityLabel || `Lista com ${data?.length || 0} itens`}
                />
            </View>
        );
    }

    return (
        <View style={[styles.defaultFlashList, style]}>
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
                accessible={accessible}
                accessibilityLabel={accessibilityLabel || `Lista com ${data?.length || 0} itens`}
                {...props}
            />
        </View>
    );
}

const EnhancedFlashList = memo(EnhancedFlashListInner) as typeof EnhancedFlashListInner;


export default EnhancedFlashList;
