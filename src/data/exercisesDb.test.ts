import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadDbExercises } from './exercisesDb';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('exercisesDb', () => {
  it('returns [] when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('network'));
    const list = await loadDbExercises();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });

  it('returns [] when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: false, status: 404 } as any);
    const list = await loadDbExercises();
    expect(list.length).toBe(0);
  });
});

