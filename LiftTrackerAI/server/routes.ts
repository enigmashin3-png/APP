import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkoutSessionSchema, insertWorkoutSetSchema, insertWorkoutPlanSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/category/:category", async (req, res) => {
    try {
      const exercises = await storage.getExercisesByCategory(req.params.category);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises by category" });
    }
  });

  // Workout Plans
  app.get("/api/workout-plans", async (req, res) => {
    try {
      const { userId, templates } = req.query;
      let plans;
      
      if (templates === "true") {
        plans = await storage.getTemplateWorkoutPlans();
      } else {
        plans = await storage.getWorkoutPlans(userId as string);
      }
      
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  app.get("/api/workout-plans/:id", async (req, res) => {
    try {
      const plan = await storage.getWorkoutPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plan" });
    }
  });

  app.post("/api/workout-plans", async (req, res) => {
    try {
      const validation = insertWorkoutPlanSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid workout plan data", errors: validation.error.issues });
      }
      
      const plan = await storage.createWorkoutPlan(validation.data);
      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });

  app.patch("/api/workout-plans/:id", async (req, res) => {
    try {
      const planId = req.params.id;
      const updates = req.body;
      const updated = await storage.updateWorkoutPlan(planId, updates);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update workout plan" });
    }
  });

  app.delete("/api/workout-plans/:id", async (req, res) => {
    try {
      await storage.deleteWorkoutPlan(req.params.id);
      res.status(204).end();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete workout plan" });
    }
  });

  // Clone a template workout plan for a user. Requires query param userId
  app.post("/api/workout-plans/:id/clone", async (req, res) => {
    try {
      const templateId = req.params.id;
      const { userId } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: "userId query parameter is required" });
      }
      const cloned = await storage.cloneWorkoutPlan(templateId, userId);
      res.status(201).json(cloned);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to clone workout plan" });
    }
  });

  // Generate simple exercise suggestions for the user
  app.get("/api/workout-suggestions", async (req, res) => {
    try {
      const { userId, limit } = req.query;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: "userId query parameter is required" });
      }
      const suggestionLimit = limit ? parseInt(limit as string, 10) : undefined;
      const suggestions = await storage.getWorkoutPlanSuggestions(userId, suggestionLimit);
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to generate suggestions" });
    }
  });

  // Workout Sessions
  app.get("/api/workout-sessions", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const sessions = await storage.getWorkoutSessions(userId as string);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout sessions" });
    }
  });

  app.get("/api/workout-sessions/active/:userId", async (req, res) => {
    try {
      const session = await storage.getActiveWorkoutSession(req.params.userId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active workout session" });
    }
  });

  app.post("/api/workout-sessions", async (req, res) => {
    try {
      const validation = insertWorkoutSessionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid workout session data", errors: validation.error.issues });
      }
      
      const session = await storage.createWorkoutSession(validation.data);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to create workout session" });
    }
  });

  app.patch("/api/workout-sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateWorkoutSession(req.params.id, req.body);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update workout session" });
    }
  });

  // Workout Sets
  app.get("/api/workout-sets", async (req, res) => {
    try {
      const { sessionId, exerciseId, userId } = req.query;
      
      if (sessionId) {
        const sets = await storage.getWorkoutSets(sessionId as string);
        res.json(sets);
      } else if (exerciseId && userId) {
        const sets = await storage.getWorkoutSetsByExercise(exerciseId as string, userId as string);
        res.json(sets);
      } else {
        res.status(400).json({ message: "Either sessionId or (exerciseId + userId) is required" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout sets" });
    }
  });

  app.post("/api/workout-sets", async (req, res) => {
    try {
      const validation = insertWorkoutSetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid workout set data", errors: validation.error.issues });
      }
      
      const set = await storage.createWorkoutSet(validation.data);
      res.status(201).json(set);
    } catch (error) {
      res.status(500).json({ message: "Failed to create workout set" });
    }
  });

  // User Stats
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.params.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
