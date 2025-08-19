import { 
  type User, type InsertUser,
  type Exercise, type InsertExercise,
  type WorkoutPlan, type InsertWorkoutPlan,
  type WorkoutSession, type InsertWorkoutSession,
  type WorkoutSet, type InsertWorkoutSet,
  type WorkoutStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Exercises
  getExercises(): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  
  // Workout Plans
  getWorkoutPlans(userId?: string): Promise<WorkoutPlan[]>;
  getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined>;
  getTemplateWorkoutPlans(): Promise<WorkoutPlan[]>;
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;

  /**
   * Update an existing workout plan. Partial updates are allowed and undefined
   * values will be ignored. Throws if the plan does not exist.
   */
  updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan>;

  /**
   * Permanently remove a workout plan. Does nothing if the plan does not exist.
   */
  deleteWorkoutPlan(id: string): Promise<void>;

  /**
   * Clone a template workout plan for a user. This will copy the exercises and
   * metadata from the template plan, mark it as a non‑template plan and assign
   * it to the specified user. Returns the newly created plan. Throws if the
   * template does not exist or is not marked as a template.
   */
  cloneWorkoutPlan(templateId: string, userId: string): Promise<WorkoutPlan>;

  /**
   * Generate simple exercise suggestions for a user. The current implementation
   * inspects the user's recent workout history and returns exercises that
   * haven't been logged recently. Limiting the number of suggestions is
   * supported via the optional `limit` argument.
   */
  getWorkoutPlanSuggestions(userId: string, limit?: number): Promise<Exercise[]>;
  
  // Workout Sessions
  getWorkoutSessions(userId: string): Promise<WorkoutSession[]>;
  getWorkoutSession(id: string): Promise<WorkoutSession | undefined>;
  getActiveWorkoutSession(userId: string): Promise<WorkoutSession | undefined>;
  createWorkoutSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  updateWorkoutSession(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession>;
  
  // Workout Sets
  getWorkoutSets(sessionId: string): Promise<WorkoutSet[]>;
  getWorkoutSetsByExercise(exerciseId: string, userId: string): Promise<WorkoutSet[]>;
  createWorkoutSet(set: InsertWorkoutSet): Promise<WorkoutSet>;
  
  // Stats
  getUserStats(userId: string): Promise<WorkoutStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private exercises: Map<string, Exercise> = new Map();
  private workoutPlans: Map<string, WorkoutPlan> = new Map();
  private workoutSessions: Map<string, WorkoutSession> = new Map();
  private workoutSets: Map<string, WorkoutSet> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed exercises
    const exerciseData = [
      { name: "Bench Press", category: "chest", muscleGroups: ["chest", "triceps", "shoulders"], equipment: "barbell", instructions: "Lie on bench, lower bar to chest, press up", tips: "Keep feet flat on floor, maintain arch" },
      { name: "Squat", category: "legs", muscleGroups: ["quadriceps", "glutes", "hamstrings"], equipment: "barbell", instructions: "Stand with bar on back, squat down, stand up", tips: "Keep knees aligned with toes" },
      { name: "Deadlift", category: "back", muscleGroups: ["hamstrings", "glutes", "back"], equipment: "barbell", instructions: "Lift bar from floor to standing", tips: "Keep back straight, hinge at hips" },
      { name: "Pull-ups", category: "back", muscleGroups: ["lats", "biceps"], equipment: "pull-up bar", instructions: "Hang from bar, pull up until chin over bar", tips: "Full range of motion" },
      { name: "Push-ups", category: "chest", muscleGroups: ["chest", "triceps", "shoulders"], equipment: "bodyweight", instructions: "Lower chest to floor, push up", tips: "Keep body straight" },
      { name: "Overhead Press", category: "shoulders", muscleGroups: ["shoulders", "triceps"], equipment: "barbell", instructions: "Press bar overhead from shoulders", tips: "Keep core tight" },
    ];

    exerciseData.forEach(ex => {
      const exercise: Exercise = { id: randomUUID(), ...ex };
      this.exercises.set(exercise.id, exercise);
    });

    // Seed template workout plans
    const planData = [
      {
        name: "Push Pull Legs",
        description: "6 days • Upper/Lower split",
        level: "intermediate",
        daysPerWeek: 6,
        isTemplate: true,
        exercises: [
          { exerciseId: Array.from(this.exercises.values())[0].id, sets: 4, reps: 8, restTime: 180 },
          { exerciseId: Array.from(this.exercises.values())[4].id, sets: 3, reps: 12, restTime: 120 },
        ]
      },
      {
        name: "Full Body Strength",
        description: "3 days • Compound movements",
        level: "beginner",
        daysPerWeek: 3,
        isTemplate: true,
        exercises: [
          { exerciseId: Array.from(this.exercises.values())[1].id, sets: 3, reps: 8, restTime: 180 },
          { exerciseId: Array.from(this.exercises.values())[0].id, sets: 3, reps: 8, restTime: 180 },
        ]
      },
      {
        name: "HIIT Cardio",
        description: "4 days • High intensity",
        level: "advanced",
        daysPerWeek: 4,
        isTemplate: true,
        exercises: [
          { exerciseId: Array.from(this.exercises.values())[4].id, sets: 5, reps: 20, restTime: 60 },
        ]
      }
    ];

    planData.forEach(plan => {
      const workoutPlan: WorkoutPlan = { id: randomUUID(), userId: null, ...plan };
      this.workoutPlans.set(workoutPlan.id, workoutPlan);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      level: insertUser.level || "beginner"
    };
    this.users.set(id, user);
    return user;
  }

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(ex => ex.category === category);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = { 
      ...insertExercise, 
      id,
      equipment: insertExercise.equipment || null,
      instructions: insertExercise.instructions || null,
      tips: insertExercise.tips || null
    };
    this.exercises.set(id, exercise);
    return exercise;
  }

  // Workout Plans
  async getWorkoutPlans(userId?: string): Promise<WorkoutPlan[]> {
    if (userId) {
      return Array.from(this.workoutPlans.values()).filter(plan => plan.userId === userId);
    }
    return Array.from(this.workoutPlans.values());
  }

  async getWorkoutPlan(id: string): Promise<WorkoutPlan | undefined> {
    return this.workoutPlans.get(id);
  }

  async getTemplateWorkoutPlans(): Promise<WorkoutPlan[]> {
    return Array.from(this.workoutPlans.values()).filter(plan => plan.isTemplate);
  }

  async createWorkoutPlan(insertPlan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const id = randomUUID();
    const plan: WorkoutPlan = {
      ...insertPlan,
      id,
      userId: insertPlan.userId ?? null,
      description: insertPlan.description ?? null,
      isTemplate: insertPlan.isTemplate ?? false
    };
    this.workoutPlans.set(id, plan);
    return plan;
  }

  async updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const existing = this.workoutPlans.get(id);
    if (!existing) {
      throw new Error("Workout plan not found");
    }

    // We deliberately avoid overwriting undefined fields to preserve existing data.
    const updated: WorkoutPlan = { ...existing, ...updates };

    // Ensure userId and isTemplate remain consistent. If updates explicitly
    // include null or undefined, fallback to existing values.
    updated.userId = updates.userId !== undefined ? updates.userId : existing.userId;
    updated.isTemplate = updates.isTemplate !== undefined ? updates.isTemplate : existing.isTemplate;

    this.workoutPlans.set(id, updated);
    return updated;
  }

  async deleteWorkoutPlan(id: string): Promise<void> {
    this.workoutPlans.delete(id);
  }

  async cloneWorkoutPlan(templateId: string, userId: string): Promise<WorkoutPlan> {
    const template = this.workoutPlans.get(templateId);
    if (!template) {
      throw new Error("Template workout plan not found");
    }
    if (!template.isTemplate) {
      throw new Error("Workout plan is not a template");
    }
    const id = randomUUID();
    const cloned: WorkoutPlan = {
      ...template,
      id,
      userId,
      isTemplate: false,
    };
    this.workoutPlans.set(id, cloned);
    return cloned;
  }

  async getWorkoutPlanSuggestions(userId: string, limit: number = 3): Promise<Exercise[]> {
    // Fetch user's workout history
    const sessions = await this.getWorkoutSessions(userId);
    // Gather exercise IDs logged in the last 7 days
    const now = new Date();
    const recentCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentExerciseIds = new Set<string>();
    for (const session of sessions) {
      if (!session.completedAt || new Date(session.completedAt) < recentCutoff) continue;
      const sets = Array.from(this.workoutSets.values()).filter(s => s.sessionId === session.id);
      sets.forEach(set => recentExerciseIds.add(set.exerciseId));
    }

    // Filter exercises that haven't been used recently
    const unusedExercises = Array.from(this.exercises.values())
      .filter(ex => !recentExerciseIds.has(ex.id));

    // If there aren't enough unused exercises, fall back to random selection
    const pool = unusedExercises.length > 0 ? unusedExercises : Array.from(this.exercises.values());

    // Shuffle and pick the first `limit` exercises
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  }

  // Workout Sessions
  async getWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
    return Array.from(this.workoutSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  async getWorkoutSession(id: string): Promise<WorkoutSession | undefined> {
    return this.workoutSessions.get(id);
  }

  async getActiveWorkoutSession(userId: string): Promise<WorkoutSession | undefined> {
    return Array.from(this.workoutSessions.values())
      .find(session => session.userId === userId && !session.completedAt);
  }

  async createWorkoutSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    const id = randomUUID();
    const session: WorkoutSession = { 
      ...insertSession, 
      id,
      workoutPlanId: insertSession.workoutPlanId || null,
      completedAt: insertSession.completedAt || null,
      duration: insertSession.duration || null,
      totalVolume: insertSession.totalVolume || null,
      notes: insertSession.notes || null,
      rating: insertSession.rating || null
    };
    this.workoutSessions.set(id, session);
    return session;
  }

  async updateWorkoutSession(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const session = this.workoutSessions.get(id);
    if (!session) throw new Error("Session not found");
    
    const updated = { ...session, ...updates };
    this.workoutSessions.set(id, updated);
    return updated;
  }

  // Workout Sets
  async getWorkoutSets(sessionId: string): Promise<WorkoutSet[]> {
    return Array.from(this.workoutSets.values())
      .filter(set => set.sessionId === sessionId)
      .sort((a, b) => a.setNumber - b.setNumber);
  }

  async getWorkoutSetsByExercise(exerciseId: string, userId: string): Promise<WorkoutSet[]> {
    const userSessions = await this.getWorkoutSessions(userId);
    const sessionIds = userSessions.map(s => s.id);
    
    return Array.from(this.workoutSets.values())
      .filter(set => set.exerciseId === exerciseId && sessionIds.includes(set.sessionId))
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  async createWorkoutSet(insertSet: InsertWorkoutSet): Promise<WorkoutSet> {
    const id = randomUUID();
    const set: WorkoutSet = { 
      ...insertSet, 
      id,
      weight: insertSet.weight || null,
      restTime: insertSet.restTime || null
    };
    this.workoutSets.set(id, set);
    return set;
  }

  // Stats
  async getUserStats(userId: string): Promise<WorkoutStats> {
    const sessions = await this.getWorkoutSessions(userId);
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyWorkouts = sessions.filter(s => 
      s.completedAt && new Date(s.completedAt) >= weekStart
    ).length;

    const totalVolume = sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0);

    // Calculate streak (simplified)
    let currentStreak = 0;
    const completedSessions = sessions.filter(s => s.completedAt).sort((a, b) => 
      new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    );
    
    for (const session of completedSessions) {
      const daysDiff = Math.floor((now.getTime() - new Date(session.completedAt!).getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) currentStreak++;
      else break;
    }

    return {
      weeklyWorkouts,
      totalVolume: Math.round(totalVolume),
      currentStreak,
      personalRecords: 3 // Simplified
    };
  }
}

export const storage = new MemStorage();
