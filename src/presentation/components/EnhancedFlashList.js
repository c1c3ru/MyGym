import React, { memo, useMemo, useCallback } from 'react';
import { FlashList } from '@shopify/flash-list';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { flashListConfig } from '@utils/performanceOptimizations';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const LoadingFooter = memo(() => (
  <View style={styles.loadingFooter}>
    <ActivityIndicator size="small" color="COLORS.info[500]" />
    <Text style={styles.loadingText}>Carregando mais...</Text>
  </View>
));

const EmptyComponent = memo(({ message = 'Nenhum item encontrado' }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
));

const EnhancedFlashList = memo(({
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
}) => {
  // Memoizar componentes para performance
  const memoizedRenderItem = useCallback((info) => {
    return renderItem(info);
  }, [renderItem]);

  const memoizedKeyExtractor = useCallback((item, index) => {
    return keyExtractor ? keyExtractor(item, index) : item.id || index.toString();
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
      getItemType={optimizedConfig.getItemType}
      drawDistance={optimizedConfig.drawDistance}
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
      style={style}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || `Lista com ${data?.length || 0} itens`}
      {...props}
    />
  );
});

EnhancedFlashList.displayName = 'EnhancedFlashList';

const styles = StyleSheet.create({
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
  },
  loadingText: {
    marginLeft: 8,
    color: COLORS.text.secondary,
    fontSize: FONT_SIZE.base,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xs0,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default EnhancedFlashList;