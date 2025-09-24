import { renderHook, act } from '@testing-library/react-native';
import usePullToRefresh from '../usePullToRefresh';

describe('usePullToRefresh', () => {
  it('should initialize with refreshing false', () => {
    const mockOnRefresh = jest.fn();
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    expect(result.current.refreshing).toBe(false);
    expect(typeof result.current.onRefresh).toBe('function');
  });

  it('should set refreshing to true during refresh', async () => {
    const mockOnRefresh = jest.fn().mockResolvedValue();
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    act(() => {
      result.current.onRefresh();
    });

    expect(result.current.refreshing).toBe(true);
  });

  it('should set refreshing to false after refresh completes', async () => {
    const mockOnRefresh = jest.fn().mockResolvedValue();
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(result.current.refreshing).toBe(false);
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('should set refreshing to false even if refresh fails', async () => {
    const mockOnRefresh = jest.fn().mockRejectedValue(new Error('Refresh failed'));
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(result.current.refreshing).toBe(false);
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('should call onRefresh function when refresh is triggered', async () => {
    const mockOnRefresh = jest.fn().mockResolvedValue();
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });
});
