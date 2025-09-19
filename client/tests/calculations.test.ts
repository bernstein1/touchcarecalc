import { describe, it, expect } from "vitest";
import {
  calculateHSA,
  calculateCommuter,
  calculateLifeInsurance,
  calculateRetirement,
  CONTRIBUTION_LIMITS,
} from "@/lib/calculations";

describe("calculator math", () => {
  it("caps HSA contributions to the IRS limit", () => {
    const result = calculateHSA({
      accountType: "hsa",
      coverage: "individual",
      income: 75000,
      contribution: 10000,
      taxBracket: 22,
    });

    expect(result.actualContribution).toBe(CONTRIBUTION_LIMITS.HSA_INDIVIDUAL);
    expect(result.taxSavings).toBeCloseTo(CONTRIBUTION_LIMITS.HSA_INDIVIDUAL * 0.22, 2);
  });

  it("caps commuter transit at $315/mo", () => {
    const result = calculateCommuter({ transitCost: 500, parkingCost: 250, taxBracket: 22 });
    expect(result.annualTransit).toBe(CONTRIBUTION_LIMITS.COMMUTER_TRANSIT * 12);
    expect(result.totalSavings).toBeCloseTo(result.annualTransit * 0.22 + result.annualParking * 0.22, 2);
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

  it("returns yearly projections for retirement", () => {
    const result = calculateRetirement({
      currentAge: 30,
      retirementAge: 35,
      currentSalary: 100000,
      currentSavings: 10000,
      employeeContribution: 10,
      employerMatch: 50,
      employerMatchCap: 6,
      expectedReturn: 5,
      salaryGrowth: 3,
      contributionType: "traditional",
      taxBracket: 22,
    });

    expect(result.yearlyProjections).toHaveLength(5);
    expect(result.finalBalance).toBeGreaterThan(result.totalContributions);
  });
});
