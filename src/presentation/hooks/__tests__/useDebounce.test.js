import { renderHook, act } from '@testing-library/react-native';
import { useDebounce, useDebouncedCallback } from '../useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'changed', delay: 300 });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('changed'); // Should now be changed
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    // Rapid changes
    rerender({ value: 'change1' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'change2' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'final' });
    
    // Should still be initial
    expect(result.current).toBe('initial');

    // Complete the debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('final');
  });
});

describe('useDebouncedCallback', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should debounce callback execution', () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => 
      useDebouncedCallback(mockCallback, 300)
    );

    // Call the debounced function multiple times
    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    // Callback should not have been called yet
    expect(mockCallback).not.toHaveBeenCalled();

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Callback should have been called once with last arguments
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('arg3');
  });

  it('should clear timeout on unmount', () => {
    const mockCallback = jest.fn();
    const { result, unmount } = renderHook(() => 
      useDebouncedCallback(mockCallback, 300)
    );

    act(() => {
      result.current('test');
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Callback should not be called after unmount
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
