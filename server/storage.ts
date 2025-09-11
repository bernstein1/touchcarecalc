import { type CalculationSession, type InsertCalculationSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCalculationSession(id: string): Promise<CalculationSession | undefined>;
  createCalculationSession(session: InsertCalculationSession): Promise<CalculationSession>;
  getCalculationSessionsByType(calculatorType: string): Promise<CalculationSession[]>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, CalculationSession>;

  constructor() {
    this.sessions = new Map();
  }

  async getCalculationSession(id: string): Promise<CalculationSession | undefined> {
    return this.sessions.get(id);
  }

  async createCalculationSession(insertSession: InsertCalculationSession): Promise<CalculationSession> {
    const id = randomUUID();
    const session: CalculationSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getCalculationSessionsByType(calculatorType: string): Promise<CalculationSession[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.calculatorType === calculatorType,
    );
  }
}

export const storage = new MemStorage();
