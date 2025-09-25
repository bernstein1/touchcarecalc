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
      bothSplitTraditional: 50,
    });

    expect(result.yearlyProjections).toHaveLength(5);
    expect(result.finalBalance).toBeGreaterThan(result.totalContributions);
  });

  it("splits traditional and roth contributions based on the slider", () => {
    const result = calculateRetirement({
      currentAge: 30,
      retirementAge: 31,
      currentSalary: 100000,
      currentSavings: 0,
      employeeContribution: 10,
      employerMatch: 0,
      employerMatchCap: 0,
      expectedReturn: 5,
      salaryGrowth: 0,
      contributionType: "both",
      taxBracket: 22,
      bothSplitTraditional: 60,
    });

    expect(result.totalContributions).toBeCloseTo(10000, 0);
    expect(result.totalTraditionalContributions).toBeCloseTo(6000, 0);
    expect(result.totalRothContributions).toBeCloseTo(4000, 0);
    expect(result.taxSavings).toBeCloseTo(1320, 0);
  });

  it("routes catch-up contributions to the traditional side in both mode", () => {
    const result = calculateRetirement({
      currentAge: 50,
      retirementAge: 51,
      currentSalary: 120000,
      currentSavings: 0,
      employeeContribution: 30,
      employerMatch: 0,
      employerMatchCap: 0,
      expectedReturn: 5,
      salaryGrowth: 0,
      contributionType: "both",
      taxBracket: 24,
      bothSplitTraditional: 40,
    });

    expect(result.totalContributions).toBe(30500);
    expect(result.totalTraditionalContributions).toBe(16700);
    expect(result.totalRothContributions).toBe(13800);
    expect(result.taxSavings).toBeCloseTo(16700 * 0.24, 0);
  });

  it("keeps roth-only contributions from creating tax savings", () => {
    const result = calculateRetirement({
      currentAge: 30,
      retirementAge: 31,
      currentSalary: 90000,
      currentSavings: 0,
      employeeContribution: 10,
      employerMatch: 0,
      employerMatchCap: 0,
      expectedReturn: 5,
      salaryGrowth: 0,
      contributionType: "roth",
      taxBracket: 22,
    });

    expect(result.totalTraditionalContributions).toBe(0);
    expect(result.totalRothContributions).toBeCloseTo(9000, 0);
    expect(result.taxSavings).toBe(0);
  });
});
