import { describe, it, expect } from 'vitest';
import { volumeForWorkout, volumeByMuscle } from './stats';
import type { Workout } from '../store/workout';

describe('stats', () => {
  it('computes total volume for a workout', () => {
    const w: Workout = {
      id: 'w1',
      startedAt: Date.now(),
      exercises: [
        { id: 'e1', name: 'Bench Press', sets: [
          { id: 's1', weight: 100, reps: 5, done: true },
          { id: 's2', weight: 100, reps: 5, done: false },
        ]},
        { id: 'e2', name: 'Squat', sets: [ { id: 's3', weight: 140, reps: 3, done: true } ]},
      ],
    };
    expect(volumeForWorkout(w)).toBe(100*5 + 140*3);
  });

  it('aggregates volume by muscle within a time window', () => {
    const now = Date.now();
    const history: Workout[] = [
      { id: 'w1', startedAt: now - 1_000, exercises: [ { id: 'e1', name: 'CustomMoveA', sets: [ { id: 's1', weight: 10, reps: 10, done: true } ] } ] },
      { id: 'w2', startedAt: now - 2_000, exercises: [ { id: 'e2', name: 'CustomMoveB', sets: [ { id: 's2', weight: 20, reps: 5, done: true } ] } ] },
    ];
    const by = volumeByMuscle(history, 7);
    // Unknown exercises map to "Other"
    expect(by.Other).toBe(10*10 + 20*5);
  });
});

