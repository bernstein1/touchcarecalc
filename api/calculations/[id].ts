import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../_storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  if (typeof id !== "string") {
    res.status(400).json({ message: "Invalid session id" });
    return;
  }

  const session = await storage.getCalculationSession(id);
  if (!session) {
    res.status(404).json({ message: "Calculation session not found" });
    return;
  }

  res.status(200).json(session);
}
