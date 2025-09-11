import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const calculationSessions = pgTable("calculation_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  calculatorType: text("calculator_type").notNull(), // 'hsa', 'commuter', 'life'
  inputData: text("input_data").notNull(), // JSON string of form inputs
  results: text("results").notNull(), // JSON string of calculation results
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertCalculationSessionSchema = createInsertSchema(calculationSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertCalculationSession = z.infer<typeof insertCalculationSessionSchema>;
export type CalculationSession = typeof calculationSessions.$inferSelect;

// Type definitions for calculator inputs and results
export interface HSAInputs {
  accountType: 'hsa' | 'fsa';
  coverage: 'individual' | 'family';
  income: number;
  contribution: number;
  taxBracket: number;
}

export interface HSAResults {
  actualContribution: number;
  taxSavings: number;
  effectiveCost: number;
  taxableIncome: number;
  contributionLimit: number;
}

export interface CommuterInputs {
  transitCost: number;
  parkingCost: number;
  taxBracket: number;
}

export interface CommuterResults {
  transitSavings: number;
  parkingSavings: number;
  totalSavings: number;
  annualTransit: number;
  annualParking: number;
  annualTotal: number;
}

export interface LifeInsuranceInputs {
  totalDebt: number;
  income: number;
  mortgageBalance: number;
  educationCosts: number;
  incomeYears: number;
  currentInsurance: number;
}

export interface LifeInsuranceResults {
  dimeTotal: number;
  additionalNeeded: number;
  incomeReplacement: number;
}
