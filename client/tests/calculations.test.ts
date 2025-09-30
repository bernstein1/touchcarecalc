import { describe, it, expect } from "vitest";
import {
  calculateHSA,
  calculateFSA,
  calculateCommuter,
  calculateLifeInsurance,
  HSA_LIMITS,
  FSA_LIMITS,
  COMMUTER_LIMITS,
} from "@/lib/calculations";

describe("calculator math", () => {
  it("caps HSA contributions, applies catch-up, and surfaces premium savings", () => {
    const result = calculateHSA({
      coverage: "family",
      age: 57,
      employeeContribution: 9000,
      employerSeed: 1000,
      hdhpMonthlyPremium: 300,
      altPlanMonthlyPremium: 500,
      targetReserve: 6000,
      annualIncome: 185000,
      filingStatus: "marriedJoint",
    });

    expect(result.annualContributionLimit).toBe(HSA_LIMITS.family + HSA_LIMITS.catchUp);
    expect(result.totalContribution).toBe(result.annualContributionLimit);
    expect(result.catchUpContribution).toBe(HSA_LIMITS.catchUp);
    expect(result.marginalRate).toBeGreaterThan(0);
    expect(result.taxSavings).toBeCloseTo(result.employeeContribution * (result.marginalRate / 100), 2);
    expect(result.annualPremiumSavings).toBeCloseTo((500 - 300) * 12);
  });

  it("caps commuter transit at $340/mo (2026 limit)", () => {
    const result = calculateCommuter({ transitCost: 500, parkingCost: 250, annualIncome: 90000, filingStatus: "single" });
    expect(result.annualTransit).toBe(COMMUTER_LIMITS.transit * 12);
    expect(result.totalSavings).toBeCloseTo(
      result.annualTransit * (result.marginalRate / 100) + result.annualParking * (result.marginalRate / 100),
      2
    );
  });

  it("estimates FSA forfeiture risk with carryover and grace period protections", () => {
    const result = calculateFSA({
      healthElection: 3500,
      expectedEligibleExpenses: 2800,
      planCarryover: 500,
      gracePeriodMonths: 2,
      includeDependentCare: true,
      dependentCareElection: 6000,
      expectedDependentCareExpenses: 4000,
      annualIncome: 165000,
      filingStatus: "marriedJoint",
    });

    expect(result.cappedHealthElection).toBe(FSA_LIMITS.health);
    expect(result.forfeitureRisk).toBeGreaterThanOrEqual(0);
    expect(result.marginalRate).toBeGreaterThan(0);
    expect(result.taxSavings).toBeCloseTo(FSA_LIMITS.health * (result.marginalRate / 100), 2);
    // Dependent care election is 6000, which is under the 2026 limit of 7500, so tax savings should be based on 6000
    expect(result.dependentCareTaxSavings).toBeCloseTo(6000 * (result.marginalRate / 100), 2);
    expect(result.dependentCareForfeitureRisk).toBeCloseTo(6000 - 4000, 2);
  });

  it("computes DIME coverage", () => {
    const result = calculateLifeInsurance({
      totalDebt: 50000,
      income: 80000,
      mortgageBalance: 200000,
      educationCosts: 120000,
      incomeYears: 10,
      currentInsurance: 100000,
    });

    expect(result.dimeTotal).toBe(50000 + 80000 * 10 + 200000 + 120000);
    expect(result.additionalNeeded).toBeGreaterThan(0);
  });

  it("handles high debt and mortgage balances up to $5M", () => {
    const result = calculateLifeInsurance({
      totalDebt: 5_000_000,
      income: 120000,
      mortgageBalance: 5_000_000,
      educationCosts: 250000,
      incomeYears: 15,
      currentInsurance: 500000,
    });

    const expectedIncomeReplacement = 120000 * 15;
    const expectedDimeTotal = 5_000_000 + expectedIncomeReplacement + 5_000_000 + 250000;

    expect(result.dimeTotal).toBe(expectedDimeTotal);
    expect(result.additionalNeeded).toBe(expectedDimeTotal - 500000);
  });

});
