import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('delays updating the value', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('b');
    vi.useRealTimers();
  });
});
