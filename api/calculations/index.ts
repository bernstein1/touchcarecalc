import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_storage";
import { insertCalculationSessionSchema } from "@shared/schema";
import { z } from "zod";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    try {
      const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const data = insertCalculationSessionSchema.parse(payload);
      const session = await storage.createCalculationSession(data);
      res.status(200).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Failed to save calculation session" });
    }
    return;
  }

  res.setHeader("Allow", "POST");
  res.status(405).json({ message: "Method Not Allowed" });
}
