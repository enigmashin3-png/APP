import { test, expect } from 'vitest';
import { MemStorage } from './storage';
import type { InsertWorkoutPlan } from '../shared/schema';

test('createWorkoutPlan retains false isTemplate value', async () => {
  const storage = new MemStorage();
  const data: InsertWorkoutPlan = {
    name: 'Test Plan',
    level: 'beginner',
    daysPerWeek: 3,
    exercises: [],
    isTemplate: false,
  };

  const plan = await storage.createWorkoutPlan(data);
  expect(plan.isTemplate).toBe(false);
});
