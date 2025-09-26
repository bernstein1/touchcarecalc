import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const calculationSessions = pgTable("calculation_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  calculatorType: text("calculator_type").notNull(), // 'hsa', 'fsa', 'commuter', 'life'
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
export type FilingStatus = 'single' | 'marriedJoint' | 'marriedSeparate' | 'headOfHousehold';

export interface HSAInputs {
  coverage: 'individual' | 'family';
  age: number;
  employeeContribution: number;
  hdhpMonthlyPremium: number;
  altPlanMonthlyPremium: number;
  employerSeed: number;
  targetReserve: number;
  currentBalance: number;
  useCurrentBalance?: boolean;
  annualIncome: number;
  filingStatus?: FilingStatus;
  // Legacy fields supported for backward compatibility with existing UI state
  accountType?: 'hsa' | 'fsa';
  income?: number;
  contribution?: number;
  /** @deprecated */
  taxBracket?: number;
}

export interface HSAResults {
  annualContributionLimit: number;
  catchUpContribution: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  taxSavings: number;
  annualPremiumSavings: number;
  netCashflowAdvantage: number;
  projectedReserve: number;
  reserveShortfall: number;
  startingBalance: number;
  appliedCurrentBalance: number;
  marginalRate: number;
  // Legacy fields still consumed by the UI and reports
  actualContribution?: number;
  contributionLimit?: number;
  effectiveCost?: number;
  taxableIncome?: number;
}

export interface FSAInputs {
  healthElection: number;
  expectedEligibleExpenses: number;
  planCarryover: number;
  gracePeriodMonths: number;
  includeDependentCare: boolean;
  dependentCareElection: number;
  expectedDependentCareExpenses: number;
  annualIncome: number;
  filingStatus?: FilingStatus;
  /** @deprecated */
  taxBracket?: number;
}

export interface FSAResults {
  cappedHealthElection: number;
  expectedUtilization: number;
  carryoverProtected: number;
  forfeitureRisk: number;
  taxSavings: number;
  netBenefit: number;
  dependentCareTaxSavings: number;
  dependentCareForfeitureRisk: number;
  marginalRate: number;
}

export interface CommuterInputs {
  transitCost: number;
  parkingCost: number;
  annualIncome: number;
  filingStatus?: FilingStatus;
  /** @deprecated */
  taxBracket?: number;
}

export interface CommuterResults {
  transitSavings: number;
  parkingSavings: number;
  totalSavings: number;
  annualTransit: number;
  annualParking: number;
  annualTotal: number;
  marginalRate: number;
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
