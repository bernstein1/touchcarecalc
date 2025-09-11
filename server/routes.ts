import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCalculationSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Save calculation session
  app.post("/api/calculations", async (req, res) => {
    try {
      const sessionData = insertCalculationSessionSchema.parse(req.body);
      const session = await storage.createCalculationSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save calculation session" });
      }
    }
  });

  // Get calculation session by ID
  app.get("/api/calculations/:id", async (req, res) => {
    try {
      const session = await storage.getCalculationSession(req.params.id);
      if (!session) {
        res.status(404).json({ message: "Calculation session not found" });
        return;
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve calculation session" });
    }
  });

  // Get calculation sessions by type
  app.get("/api/calculations/type/:type", async (req, res) => {
    try {
      const sessions = await storage.getCalculationSessionsByType(req.params.type);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve calculation sessions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
