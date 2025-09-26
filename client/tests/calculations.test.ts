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
      currentHSABalance: 0,
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

  it("credits the current HSA balance toward the projected reserve and shortfall", () => {
    const result = calculateHSA({
      coverage: "individual",
      age: 40,
      employeeContribution: 2000,
      employerSeed: 500,
      currentHSABalance: 1500,
      targetReserve: 4000,
      hdhpMonthlyPremium: 300,
      altPlanMonthlyPremium: 450,
      annualIncome: 90000,
      filingStatus: "single",
    });

    expect(result.currentHSABalance).toBe(1500);
    expect(result.projectedReserve).toBeCloseTo(1500 + result.employeeContribution + result.employerContribution);
    expect(result.reserveShortfall).toBe(Math.max(4000 - result.projectedReserve, 0));
  });

  it("shows no reserve shortfall when the existing balance already covers the target", () => {
    const result = calculateHSA({
      coverage: "individual",
      age: 30,
      employeeContribution: 0,
      employerSeed: 0,
      currentHSABalance: 2500,
      targetReserve: 2000,
      hdhpMonthlyPremium: 250,
      altPlanMonthlyPremium: 325,
      annualIncome: 60000,
      filingStatus: "single",
    });

    expect(result.projectedReserve).toBe(2500);
    expect(result.reserveShortfall).toBe(0);
    expect(result.netCashflowAdvantage).toBeCloseTo(result.annualPremiumSavings + result.taxSavings);
  });

  it("caps commuter transit at $315/mo", () => {
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
    expect(result.dependentCareTaxSavings).toBeCloseTo(FSA_LIMITS.dependentCare * (result.marginalRate / 100), 2);
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
