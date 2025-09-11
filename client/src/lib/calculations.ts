import { HSAInputs, HSAResults, CommuterInputs, CommuterResults, LifeInsuranceInputs, LifeInsuranceResults } from "@shared/schema";

// 2025 contribution limits
export const CONTRIBUTION_LIMITS = {
  HSA_INDIVIDUAL: 4300,
  HSA_FAMILY: 8550,
  FSA: 3200,
  COMMUTER_TRANSIT: 315, // monthly
  COMMUTER_PARKING: 315, // monthly
};

export function calculateHSA(inputs: HSAInputs): HSAResults {
  const { accountType, coverage, income, contribution, taxBracket } = inputs;
  
  let limit = CONTRIBUTION_LIMITS.HSA_INDIVIDUAL;
  if (accountType === 'hsa' && coverage === 'family') {
    limit = CONTRIBUTION_LIMITS.HSA_FAMILY;
  } else if (accountType === 'fsa') {
    limit = CONTRIBUTION_LIMITS.FSA;
  }
  
  const actualContribution = Math.min(contribution, limit);
  const taxSavings = actualContribution * (taxBracket / 100);
  const effectiveCost = actualContribution - taxSavings;
  const taxableIncome = income - actualContribution;
  
  return {
    actualContribution,
    taxSavings,
    effectiveCost,
    taxableIncome,
    contributionLimit: limit,
  };
}

export function calculateCommuter(inputs: CommuterInputs): CommuterResults {
  const { transitCost, parkingCost, taxBracket } = inputs;
  
  const actualTransit = Math.min(transitCost, CONTRIBUTION_LIMITS.COMMUTER_TRANSIT);
  const actualParking = Math.min(parkingCost, CONTRIBUTION_LIMITS.COMMUTER_PARKING);
  
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
