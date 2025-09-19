import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../../_storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { type } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  if (typeof type !== "string") {
    res.status(400).json({ message: "Invalid calculator type" });
    return;
  }

  const sessions = await storage.getCalculationSessionsByType(type);
  res.status(200).json(sessions);
}
