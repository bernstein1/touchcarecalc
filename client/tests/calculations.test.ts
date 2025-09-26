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
      taxBracket: 24,
    });

    expect(result.annualContributionLimit).toBe(HSA_LIMITS.family + HSA_LIMITS.catchUp);
    expect(result.totalContribution).toBe(result.annualContributionLimit);
    expect(result.catchUpContribution).toBe(HSA_LIMITS.catchUp);
    expect(result.taxSavings).toBeCloseTo(result.employeeContribution * 0.24, 2);
    expect(result.annualPremiumSavings).toBeCloseTo((500 - 300) * 12);
  });

  it("caps commuter transit at $315/mo", () => {
    const result = calculateCommuter({ transitCost: 500, parkingCost: 250, taxBracket: 22 });
    expect(result.annualTransit).toBe(COMMUTER_LIMITS.transit * 12);
    expect(result.totalSavings).toBeCloseTo(result.annualTransit * 0.22 + result.annualParking * 0.22, 2);
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
      taxBracket: 24,
    });

    expect(result.cappedHealthElection).toBe(FSA_LIMITS.health);
    expect(result.forfeitureRisk).toBeGreaterThanOrEqual(0);
    expect(result.taxSavings).toBeCloseTo(FSA_LIMITS.health * 0.24, 2);
    expect(result.dependentCareTaxSavings).toBeCloseTo(FSA_LIMITS.dependentCare * 0.24, 2);
    expect(result.dependentCareForfeitureRisk).toBeCloseTo(FSA_LIMITS.dependentCare - 4000, 2);
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
