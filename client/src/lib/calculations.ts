import { HSAInputs, HSAResults, FSAInputs, FSAResults, CommuterInputs, CommuterResults, LifeInsuranceInputs, LifeInsuranceResults } from "@shared/schema";
import { getMarginalTaxRate } from "@/lib/tax/brackets";

// 2025 limits and thresholds (IRS Revenue Procedure 2024-25 & 2024-40)
export const HSA_LIMITS = {
  individual: 4300,
  family: 8550,
  catchUp: 1000,
} as const;

export const FSA_LIMITS = {
  health: 3300, // Updated for 2025 (was 3200 in 2024)
  dependentCare: 5000,
} as const;

export const COMMUTER_LIMITS = {
  transit: 325, // Updated for 2025 (was 315 in 2024)
  parking: 325, // Updated for 2025 (was 315 in 2024)
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
    annualIncome,
    filingStatus,
    spouseHasHSA,
    spouseHSAContribution,
    anticipatedMedicalExpenses,
    anticipatedDentalExpenses,
    anticipatedVisionExpenses,
    planDeductibleIndividual,
    planDeductibleFamily,
    monthlyContributionBudget,
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

  const projectedReserve = employerContribution + employeeContributionUsed;
  const reserveShortfall = Math.max((targetReserve ?? 0) - projectedReserve, 0);

  const netCashflowAdvantage = annualPremiumSavings + employerContribution + taxSavings - employeeContributionUsed;

  // New validation logic
  const warnings: string[] = [];
  let spousalLimitWarning: string | undefined;

  // Check spousal HSA contribution limits (family max applies to household)
  if (spouseHasHSA && spouseHSAContribution && coverageLevel === 'family') {
    const combinedContributions = totalPlannedFunding + spouseHSAContribution;
    if (combinedContributions > HSA_LIMITS.family) {
      const excess = combinedContributions - HSA_LIMITS.family;
      spousalLimitWarning = `Combined household HSA contributions ($${combinedContributions.toLocaleString()}) exceed the family maximum of $${HSA_LIMITS.family.toLocaleString()} by $${excess.toLocaleString()}. You must reduce contributions to stay compliant.`;
      warnings.push(spousalLimitWarning);
    }
  }

  // Calculate total anticipated expenses
  const medical = anticipatedMedicalExpenses ?? 0;
  const dental = anticipatedDentalExpenses ?? 0;
  const vision = anticipatedVisionExpenses ?? 0;
  const totalAnticipatedExpenses = medical + dental + vision;

  // Calculate deductible coverage ratio
  let deductibleCoverageRatio: number | undefined;
  const relevantDeductible = coverageLevel === 'family' ? planDeductibleFamily : planDeductibleIndividual;
  if (relevantDeductible && relevantDeductible > 0) {
    deductibleCoverageRatio = (projectedReserve / relevantDeductible) * 100;
    if (deductibleCoverageRatio < 100) {
      warnings.push(`Your projected HSA balance ($${projectedReserve.toLocaleString()}) covers only ${Math.round(deductibleCoverageRatio)}% of your $${relevantDeductible.toLocaleString()} deductible. Consider increasing contributions.`);
    }
  }

  // Check monthly budget feasibility
  let monthlyBudgetFeasible: boolean | undefined;
  if (monthlyContributionBudget) {
    const annualBudget = monthlyContributionBudget * 12;
    monthlyBudgetFeasible = plannedEmployeeContribution <= annualBudget;
    if (!monthlyBudgetFeasible) {
      const shortfall = plannedEmployeeContribution - annualBudget;
      warnings.push(`Your planned contribution ($${plannedEmployeeContribution.toLocaleString()}) exceeds your monthly budget by $${shortfall.toLocaleString()} annually. Adjust to stay within budget.`);
    }
  }

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
    marginalRate,
    totalAnticipatedExpenses,
    deductibleCoverageRatio,
    monthlyBudgetFeasible,
    spousalLimitWarning,
    warnings: warnings.length > 0 ? warnings : undefined,
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
    payFrequency,
    includeLimitedPurposeFSA,
    lpfsaElection,
    lpfsaExpectedExpenses,
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

  // Calculate pay period breakdown
  let perPaycheckDeduction: number | undefined;
  let numberOfPaychecks: number | undefined;
  if (payFrequency) {
    switch (payFrequency) {
      case 'weekly':
        numberOfPaychecks = 52;
        break;
      case 'biweekly':
        numberOfPaychecks = 26;
        break;
      case 'semimonthly':
        numberOfPaychecks = 24;
        break;
      case 'monthly':
        numberOfPaychecks = 12;
        break;
    }
    perPaycheckDeduction = cappedHealthElection / numberOfPaychecks;
  }

  // Calculate LPFSA (Limited Purpose FSA) results
  let lpfsaTaxSavings: number | undefined;
  let lpfsaForfeitureRisk: number | undefined;
  let lpfsaNetBenefit: number | undefined;

  if (includeLimitedPurposeFSA && lpfsaElection !== undefined) {
    const cappedLPFSA = Math.min(Math.max(lpfsaElection, 0), FSA_LIMITS.health);
    const lpfsaUtilization = Math.min(cappedLPFSA, Math.max(lpfsaExpectedExpenses ?? 0, 0));
    lpfsaForfeitureRisk = Math.max(cappedLPFSA - lpfsaUtilization, 0);
    lpfsaTaxSavings = cappedLPFSA * (marginalRate / 100);
    lpfsaNetBenefit = lpfsaTaxSavings - lpfsaForfeitureRisk;
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
    perPaycheckDeduction,
    numberOfPaychecks,
    lpfsaTaxSavings,
    lpfsaForfeitureRisk,
    lpfsaNetBenefit,
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
  const {
    totalDebt,
    income,
    mortgageBalance,
    educationCosts,
    incomeYears,
    currentInsurance,
    currentAssets,
    childrenUnder18,
    monthlyLivingExpenses,
  } = inputs;

  // Base DIME calculation
  let incomeReplacement = income * incomeYears;

  // Adjust for living expenses if provided (more accurate than pure income replacement)
  let livingExpensesComponent: number | undefined;
  if (monthlyLivingExpenses && monthlyLivingExpenses > 0) {
    // Calculate living expenses for the income replacement period
    livingExpensesComponent = monthlyLivingExpenses * 12 * incomeYears;
    // Use the greater of income replacement or living expenses
    incomeReplacement = Math.max(incomeReplacement, livingExpensesComponent);
  }

  // Apply child education multiplier if children are present
  let childEducationMultiplier: number | undefined;
  if (childrenUnder18 && childrenUnder18 > 0) {
    // Add extra coverage for each child (rough estimate: $50k per child for future needs)
    childEducationMultiplier = childrenUnder18 * 50000;
  }

  // Calculate total DIME need
  const baseEducationCosts = educationCosts + (childEducationMultiplier ?? 0);
  const dimeTotal = totalDebt + incomeReplacement + mortgageBalance + baseEducationCosts;

  // Subtract current assets (liquid assets can offset insurance need)
  const assetOffset = currentAssets ?? 0;
  const adjustedNeed = Math.max(0, dimeTotal - assetOffset);

  // Calculate additional insurance needed
  const additionalNeeded = Math.max(0, adjustedNeed - currentInsurance);

  return {
    dimeTotal,
    additionalNeeded,
    incomeReplacement,
    adjustedNeed: assetOffset > 0 ? adjustedNeed : undefined,
    livingExpensesComponent,
    childEducationMultiplier,
  };
}

