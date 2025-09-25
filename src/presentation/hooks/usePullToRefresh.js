import { useState, useCallback } from 'react';

export const usePullToRefresh = (onRefresh) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      // Swallow errors to avoid unhandled rejections in UI; state will still reset
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return { refreshing, onRefresh: handleRefresh };
};

export default usePullToRefresh;
