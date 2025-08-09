import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  level: text("level").notNull().default("beginner"), // beginner, intermediate, advanced
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // chest, back, legs, shoulders, arms, core, cardio
  muscleGroups: text("muscle_groups").array().notNull(),
  equipment: text("equipment"),
  instructions: text("instructions"),
  tips: text("tips"),
});

export const workoutPlans = pgTable("workout_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  level: text("level").notNull(), // beginner, intermediate, advanced
  daysPerWeek: integer("days_per_week").notNull(),
  isTemplate: boolean("is_template").default(false),
  userId: varchar("user_id").references(() => users.id),
  exercises: jsonb("exercises").notNull(), // Array of {exerciseId, sets, reps, weight?, restTime?}
});

export const workoutSessions = pgTable("workout_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  workoutPlanId: varchar("workout_plan_id").references(() => workoutPlans.id),
  name: text("name").notNull(),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // in seconds
  totalVolume: real("total_volume").default(0),
  notes: text("notes"),
  rating: real("rating"), // 1-5 stars
});

export const workoutSets = pgTable("workout_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => workoutSessions.id),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps").notNull(),
  weight: real("weight"),
  restTime: integer("rest_time"), // in seconds
  completedAt: timestamp("completed_at").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true });
export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).omit({ id: true });
export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({ id: true });
export const insertWorkoutSetSchema = createInsertSchema(workoutSets).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type WorkoutSet = typeof workoutSets.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;
export type InsertWorkoutSet = z.infer<typeof insertWorkoutSetSchema>;

// Additional types for complex data
export type WorkoutPlanExercise = {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
};

export type WorkoutStats = {
  weeklyWorkouts: number;
  totalVolume: number;
  currentStreak: number;
  personalRecords: number;
};
