import { HSAInputs, HSAResults, CommuterInputs, CommuterResults, LifeInsuranceInputs, LifeInsuranceResults, RetirementInputs, RetirementResults } from "@shared/schema";

// 2025 contribution limits
export const CONTRIBUTION_LIMITS = {
  HSA_INDIVIDUAL: 4300,
  HSA_FAMILY: 8550,
  FSA: 3200,
  COMMUTER_TRANSIT: 315, // monthly
  COMMUTER_PARKING: 315, // monthly
  RETIREMENT_401K: 23000, // under 50
  RETIREMENT_401K_CATCHUP: 7500, // age 50+
  RETIREMENT_TOTAL_WITH_CATCHUP: 30500, // under 50 + catch-up
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
    taxBracket
  } = inputs;

  const yearsToRetirement = retirementAge - currentAge;
  const monthlyReturn = expectedReturn / 100 / 12;
  // Check contribution limits
  const contributionLimit = currentAge >= 50 ? 
    CONTRIBUTION_LIMITS.RETIREMENT_TOTAL_WITH_CATCHUP : 
    CONTRIBUTION_LIMITS.RETIREMENT_401K;

  const baseContributionLimit = CONTRIBUTION_LIMITS.RETIREMENT_401K;
  const catchUpAllowance = Math.max(0, contributionLimit - baseContributionLimit);

  const getTraditionalContribution = (amount: number) => {
    switch (contributionType) {
      case 'traditional':
        return amount;
      case 'roth':
        return 0;
      case 'both': {
        const basePortion = Math.min(amount, baseContributionLimit);
        const catchUpPortion = Math.min(Math.max(amount - baseContributionLimit, 0), catchUpAllowance);
        const blendedTraditional = basePortion * 0.5;
        // Treat catch-up contributions as traditional for tax-savings purposes
        return blendedTraditional + catchUpPortion;
      }
      default:
        return amount;
    }
  };
  
  let balance = currentSavings;
  let totalEmployeeContributions = 0;
  let totalEmployerContributions = 0;
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

    const traditionalContribution = getTraditionalContribution(employeeContribAnnual);

    // Calculate employer match
    const matchPercentage = Math.min(employeeContribution, employerMatchCap);
    const employerContribAnnual = (matchPercentage / 100) * currentSalaryWorking * (employerMatch / 100);
    
    const totalAnnualContrib = employeeContribAnnual + employerContribAnnual;
    
    // Calculate tax savings for traditional contributions
    let annualTaxSavings = 0;
    if (traditionalContribution > 0) {
      annualTaxSavings = traditionalContribution * (taxBracket / 100);
    }

    // Calculate balance growth with monthly compounding
    let yearEndBalance = balance;
    const monthlyContrib = totalAnnualContrib / 12;
    
    for (let month = 1; month <= 12; month++) {
      yearEndBalance = yearEndBalance * (1 + monthlyReturn) + monthlyContrib;
    }
    
    balance = yearEndBalance;
    totalEmployeeContributions += employeeContribAnnual;
    totalEmployerContributions += employerContribAnnual;
    
    yearlyProjections.push({
      year,
      age: currentAge + year,
      salary: Math.round(currentSalaryWorking),
      employeeContribution: Math.round(employeeContribAnnual),
      employerContribution: Math.round(employerContribAnnual),
      totalContribution: Math.round(totalAnnualContrib),
      balance: Math.round(balance),
      taxSavings: Math.round(annualTaxSavings)
    });
  }
  
  const totalTaxSavings = yearlyProjections.reduce((sum, projection) => sum + projection.taxSavings, 0);
  const investmentGrowth = balance - currentSavings - totalEmployeeContributions - totalEmployerContributions;
  const monthlyContribution = totalEmployeeContributions / 12 / yearsToRetirement;
  
  return {
    finalBalance: Math.round(balance),
    totalContributions: Math.round(totalEmployeeContributions),
    employerContributions: Math.round(totalEmployerContributions),
    investmentGrowth: Math.round(investmentGrowth),
    monthlyContribution: Math.round(monthlyContribution),
    yearlyProjections,
    taxSavings: Math.round(totalTaxSavings)
  };
}
