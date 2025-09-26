import { HSAInputs, HSAResults, FSAInputs, FSAResults, CommuterInputs, CommuterResults, LifeInsuranceInputs, LifeInsuranceResults, RetirementInputs, RetirementResults } from "@shared/schema";

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

export const RETIREMENT_LIMITS = {
  employee: 23000,
  catchUp: 7500,
} as const;

// Backward-compatible map used by portions of the UI that still reference the consolidated constants object.
export const CONTRIBUTION_LIMITS = {
  HSA_INDIVIDUAL: HSA_LIMITS.individual,
  HSA_FAMILY: HSA_LIMITS.family,
  FSA: FSA_LIMITS.health,
  COMMUTER_TRANSIT: COMMUTER_LIMITS.transit,
  COMMUTER_PARKING: COMMUTER_LIMITS.parking,
  RETIREMENT_401K: RETIREMENT_LIMITS.employee,
  RETIREMENT_401K_CATCHUP: RETIREMENT_LIMITS.catchUp,
  RETIREMENT_TOTAL_WITH_CATCHUP: RETIREMENT_LIMITS.employee + RETIREMENT_LIMITS.catchUp,
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
    taxBracket,
  } = inputs;

  const coverageLevel = coverage ?? 'individual';
  const ageValue = age ?? 0;

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

  const taxSavings = employeeContributionUsed * (taxBracket / 100);
  const hdhpPremium = hdhpMonthlyPremium ?? 0;
  const altPremium = altPlanMonthlyPremium ?? hdhpPremium;
  const annualPremiumSavings = (altPremium - hdhpPremium) * 12;

  const projectedReserve = employerContribution + employeeContributionUsed;
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
    taxBracket,
  } = inputs;

  const cappedHealthElection = Math.min(Math.max(healthElection, 0), FSA_LIMITS.health);

  const monthlyEligibleSpend = expectedEligibleExpenses / 12;
  const gracePeriodUtilization = Math.max(monthlyEligibleSpend * Math.max(gracePeriodMonths, 0), 0);
  const expectedUtilization = Math.min(
    cappedHealthElection,
    Math.max(expectedEligibleExpenses + gracePeriodUtilization, 0)
  );

  const carryoverProtected = Math.min(Math.max(planCarryover, 0), Math.max(cappedHealthElection - expectedUtilization, 0));
  const forfeitureRisk = Math.max(cappedHealthElection - expectedUtilization - carryoverProtected, 0);

  const taxSavings = cappedHealthElection * (taxBracket / 100);
  const netBenefit = taxSavings - forfeitureRisk;

  let dependentCareTaxSavings = 0;
  let dependentCareForfeitureRisk = 0;

  if (includeDependentCare) {
    const cappedDependentCareElection = Math.min(Math.max(dependentCareElection, 0), FSA_LIMITS.dependentCare);
    const dependentCareUtilization = Math.min(cappedDependentCareElection, Math.max(expectedDependentCareExpenses, 0));
    dependentCareForfeitureRisk = Math.max(cappedDependentCareElection - dependentCareUtilization, 0);
    dependentCareTaxSavings = cappedDependentCareElection * (taxBracket / 100);
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
  };
}

export function calculateCommuter(inputs: CommuterInputs): CommuterResults {
  const { transitCost, parkingCost, taxBracket } = inputs;

  const actualTransit = Math.min(transitCost, COMMUTER_LIMITS.transit);
  const actualParking = Math.min(parkingCost, COMMUTER_LIMITS.parking);
  
  const annualTransit = actualTransit * 12;
  const annualParking = actualParking * 12;
  const annualTotal = annualTransit + annualParking;
  
  const transitSavings = annualTransit * (taxBracket / 100);
  const parkingSavings = annualParking * (taxBracket / 100);
  const totalSavings = transitSavings + parkingSavings;
  
  return {
    transitSavings,
    parkingSavings,
    totalSavings,
    annualTransit,
    annualParking,
    annualTotal,
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

export function calculateRetirement(inputs: RetirementInputs): RetirementResults {
  const {
    currentAge,
    retirementAge,
    currentSalary,
    currentSavings,
    employeeContribution,
    employerMatch,
    employerMatchCap,
    expectedReturn,
    salaryGrowth,
    contributionType,
    taxBracket,
    bothSplitTraditional = 50
  } = inputs;

  const yearsToRetirement = retirementAge - currentAge;
  const monthlyReturn = expectedReturn / 100 / 12;
  // Check contribution limits
  const baseContributionLimit = RETIREMENT_LIMITS.employee;
  const catchUpAllowance = currentAge >= 50 ? RETIREMENT_LIMITS.catchUp : 0;
  const contributionLimit = baseContributionLimit + catchUpAllowance;

  const clampedTraditionalSplit = Math.min(Math.max(bothSplitTraditional, 0), 100) / 100;

  let balance = currentSavings;
  let totalEmployeeContributions = 0;
  let totalEmployerContributions = 0;
  let totalTraditionalContributions = 0;
  let totalRothContributions = 0;
  const yearlyProjections = [];

  let currentSalaryWorking = currentSalary;

  for (let year = 1; year <= yearsToRetirement; year++) {
    // Calculate annual salary for this year
    const yearlyGrowthRate = salaryGrowth / 100;
    currentSalaryWorking = currentSalaryWorking * (1 + yearlyGrowthRate);
    
    // Calculate employee contribution
    const employeeContribAnnual = Math.min(
      (employeeContribution / 100) * currentSalaryWorking,
      contributionLimit
    );

    let traditionalContribution = 0;
    let rothContribution = 0;

    if (contributionType === 'traditional') {
      traditionalContribution = employeeContribAnnual;
    } else if (contributionType === 'roth') {
      rothContribution = employeeContribAnnual;
    } else {
      const basePortion = Math.min(employeeContribAnnual, baseContributionLimit);
      const catchUpPortion = Math.min(Math.max(employeeContribAnnual - baseContributionLimit, 0), catchUpAllowance);
      const baseTraditional = basePortion * clampedTraditionalSplit;
      traditionalContribution = baseTraditional + catchUpPortion;
      rothContribution = Math.max(employeeContribAnnual - traditionalContribution, 0);
    }

    // Calculate employer match
    const matchPercentage = Math.min(employeeContribution, employerMatchCap);
    const employerContribAnnual = (matchPercentage / 100) * currentSalaryWorking * (employerMatch / 100);

    const totalAnnualContrib = employeeContribAnnual + employerContribAnnual;
    
    // Calculate tax savings for traditional contributions
    const annualTaxSavings = traditionalContribution > 0
      ? traditionalContribution * (taxBracket / 100)
      : 0;

    // Calculate balance growth with monthly compounding
    let yearEndBalance = balance;
    const monthlyContrib = totalAnnualContrib / 12;

    for (let month = 1; month <= 12; month++) {
      yearEndBalance = yearEndBalance * (1 + monthlyReturn) + monthlyContrib;
    }
    
    balance = yearEndBalance;
    totalEmployeeContributions += employeeContribAnnual;
    totalEmployerContributions += employerContribAnnual;
    totalTraditionalContributions += traditionalContribution;
    totalRothContributions += rothContribution;

    yearlyProjections.push({
      year,
      age: currentAge + year,
      salary: Math.round(currentSalaryWorking),
      employeeContribution: Math.round(employeeContribAnnual),
      employerContribution: Math.round(employerContribAnnual),
      totalContribution: Math.round(totalAnnualContrib),
      balance: Math.round(balance),
      taxSavings: Math.round(annualTaxSavings),
      traditionalContribution: Math.round(traditionalContribution),
      rothContribution: Math.round(rothContribution)
    });
  }

  const totalTaxSavings = yearlyProjections.reduce((sum, projection) => sum + projection.taxSavings, 0);
  const investmentGrowth = balance - currentSavings - totalEmployeeContributions - totalEmployerContributions;
  const monthlyContribution = yearsToRetirement > 0
    ? totalEmployeeContributions / 12 / yearsToRetirement
    : 0;
  
  return {
    finalBalance: Math.round(balance),
    totalContributions: Math.round(totalEmployeeContributions),
    employerContributions: Math.round(totalEmployerContributions),
    totalTraditionalContributions: Math.round(totalTraditionalContributions),
    totalRothContributions: Math.round(totalRothContributions),
    investmentGrowth: Math.round(investmentGrowth),
    monthlyContribution: Math.round(monthlyContribution),
    yearlyProjections,
    taxSavings: Math.round(totalTaxSavings)
  };
}
