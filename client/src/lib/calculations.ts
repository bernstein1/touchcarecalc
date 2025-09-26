import { HSAInputs, HSAResults, FSAInputs, FSAResults, CommuterInputs, CommuterResults, LifeInsuranceInputs, LifeInsuranceResults } from "@shared/schema";
import { getMarginalTaxRate } from "@/lib/tax/brackets";

// 2025 limits and thresholds
export const HSA_LIMITS = {
  individual: 4300,
  family: 8550,
  catchUp: 1000,
} as const;

export const FSA_LIMITS = {
  health: 3200,
  dependentCare: 5000,
} as const;

export const COMMUTER_LIMITS = {
  transit: 315,
  parking: 315,
} as const;

// Backward-compatible map used by portions of the UI that still reference the consolidated constants object.
export const CONTRIBUTION_LIMITS = {
  HSA_INDIVIDUAL: HSA_LIMITS.individual,
  HSA_FAMILY: HSA_LIMITS.family,
  FSA: FSA_LIMITS.health,
  COMMUTER_TRANSIT: COMMUTER_LIMITS.transit,
  COMMUTER_PARKING: COMMUTER_LIMITS.parking,
} as const;

export function calculateHSA(inputs: HSAInputs): HSAResults {
  const {
    coverage,
    age,
    employeeContribution,
    hdhpMonthlyPremium,
    altPlanMonthlyPremium,
    employerSeed,
    targetReserve,
    currentHSABalance,
    annualIncome,
    filingStatus,
  } = inputs;

  const coverageLevel = coverage ?? 'individual';
  const ageValue = age ?? 0;

  const marginalRate = inputs.taxBracket ?? getMarginalTaxRate(annualIncome, filingStatus);

  const baseLimit = coverageLevel === 'family' ? HSA_LIMITS.family : HSA_LIMITS.individual;
  const catchUpAllowance = ageValue >= 55 ? HSA_LIMITS.catchUp : 0;
  const annualContributionLimit = baseLimit + catchUpAllowance;

  const plannedEmployeeContribution = Math.max(employeeContribution ?? inputs.contribution ?? 0, 0);
  const plannedEmployerContribution = Math.max(employerSeed ?? 0, 0);
  const totalPlannedFunding = plannedEmployeeContribution + plannedEmployerContribution;
  const totalContribution = Math.min(totalPlannedFunding, annualContributionLimit);

  // Back into how much of the contribution bucket is filled by the employee vs. employer
  const employerContribution = Math.min(plannedEmployerContribution, totalContribution);
  const employeeContributionUsed = Math.max(totalContribution - employerContribution, 0);

  const catchUpContribution = Math.max(Math.min(totalContribution - baseLimit, catchUpAllowance), 0);

  const taxSavings = employeeContributionUsed * (marginalRate / 100);
  const hdhpPremium = hdhpMonthlyPremium ?? 0;
  const altPremium = altPlanMonthlyPremium ?? hdhpPremium;
  const annualPremiumSavings = (altPremium - hdhpPremium) * 12;

  const startingBalance = Math.max(currentHSABalance ?? 0, 0);
  const projectedReserve = startingBalance + employerContribution + employeeContributionUsed;
  const reserveShortfall = Math.max((targetReserve ?? 0) - projectedReserve, 0);

  const netCashflowAdvantage = annualPremiumSavings + employerContribution + taxSavings - employeeContributionUsed;

  return {
    annualContributionLimit,
    catchUpContribution,
    employeeContribution: employeeContributionUsed,
    employerContribution,
    totalContribution,
    taxSavings,
    annualPremiumSavings,
    netCashflowAdvantage,
    projectedReserve,
    reserveShortfall,
    currentHSABalance: startingBalance,
    marginalRate,
    actualContribution: totalContribution,
    contributionLimit: annualContributionLimit,
    effectiveCost: employeeContributionUsed - taxSavings,
    taxableIncome: inputs.income !== undefined ? inputs.income - employeeContributionUsed : undefined,
  };
}

export function calculateFSA(inputs: FSAInputs): FSAResults {
  const {
    healthElection,
    expectedEligibleExpenses,
    planCarryover,
    gracePeriodMonths,
    includeDependentCare,
    dependentCareElection,
    expectedDependentCareExpenses,
    annualIncome,
    filingStatus,
  } = inputs;

  const marginalRate = inputs.taxBracket ?? getMarginalTaxRate(annualIncome, filingStatus);

  const cappedHealthElection = Math.min(Math.max(healthElection, 0), FSA_LIMITS.health);

  const monthlyEligibleSpend = expectedEligibleExpenses / 12;
  const gracePeriodUtilization = Math.max(monthlyEligibleSpend * Math.max(gracePeriodMonths, 0), 0);
  const expectedUtilization = Math.min(
    cappedHealthElection,
    Math.max(expectedEligibleExpenses + gracePeriodUtilization, 0)
  );

  const carryoverProtected = Math.min(Math.max(planCarryover, 0), Math.max(cappedHealthElection - expectedUtilization, 0));
  const forfeitureRisk = Math.max(cappedHealthElection - expectedUtilization - carryoverProtected, 0);

  const taxSavings = cappedHealthElection * (marginalRate / 100);
  const netBenefit = taxSavings - forfeitureRisk;

  let dependentCareTaxSavings = 0;
  let dependentCareForfeitureRisk = 0;

  if (includeDependentCare) {
    const cappedDependentCareElection = Math.min(Math.max(dependentCareElection, 0), FSA_LIMITS.dependentCare);
    const dependentCareUtilization = Math.min(cappedDependentCareElection, Math.max(expectedDependentCareExpenses, 0));
    dependentCareForfeitureRisk = Math.max(cappedDependentCareElection - dependentCareUtilization, 0);
    dependentCareTaxSavings = cappedDependentCareElection * (marginalRate / 100);
  }

  return {
    cappedHealthElection,
    expectedUtilization,
    carryoverProtected,
    forfeitureRisk,
    taxSavings,
    netBenefit,
    dependentCareTaxSavings,
    dependentCareForfeitureRisk,
    marginalRate,
  };
}

export function calculateCommuter(inputs: CommuterInputs): CommuterResults {
  const { transitCost, parkingCost, annualIncome, filingStatus } = inputs;

  const marginalRate = inputs.taxBracket ?? getMarginalTaxRate(annualIncome, filingStatus);

  const actualTransit = Math.min(transitCost, COMMUTER_LIMITS.transit);
  const actualParking = Math.min(parkingCost, COMMUTER_LIMITS.parking);

  const annualTransit = actualTransit * 12;
  const annualParking = actualParking * 12;
  const annualTotal = annualTransit + annualParking;

  const transitSavings = annualTransit * (marginalRate / 100);
  const parkingSavings = annualParking * (marginalRate / 100);
  const totalSavings = transitSavings + parkingSavings;

  return {
    transitSavings,
    parkingSavings,
    totalSavings,
    annualTransit,
    annualParking,
    annualTotal,
    marginalRate,
  };
}

export function calculateLifeInsurance(inputs: LifeInsuranceInputs): LifeInsuranceResults {
  const { totalDebt, income, mortgageBalance, educationCosts, incomeYears, currentInsurance } = inputs;
  
  const incomeReplacement = income * incomeYears;
  const dimeTotal = totalDebt + incomeReplacement + mortgageBalance + educationCosts;
  const additionalNeeded = Math.max(0, dimeTotal - currentInsurance);
  
  return {
    dimeTotal,
    additionalNeeded,
    incomeReplacement,
  };
}

