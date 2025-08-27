import test from 'node:test';
import assert from 'node:assert/strict';
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
  assert.equal(plan.isTemplate, false);
});
