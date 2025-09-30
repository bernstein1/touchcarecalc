import { HSAInputs, HSAResults } from "@shared/schema";
import { Recommendation, RecommendationLevel } from "@/components/recommendations/recommendation-card";

export function generateHSARecommendations(inputs: HSAInputs, results: HSAResults): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Calculate key metrics
  const totalAnticipatedExpenses = (inputs.anticipatedMedicalExpenses ?? 0) +
                                   (inputs.anticipatedDentalExpenses ?? 0) +
                                   (inputs.anticipatedVisionExpenses ?? 0);

  const relevantDeductible = inputs.coverage === 'family'
    ? inputs.planDeductibleFamily
    : inputs.planDeductibleIndividual;

  // Recommendation 1: Deductible Coverage Assessment
  if (relevantDeductible && relevantDeductible > 0) {
    const coverageRatio = (results.projectedReserve / relevantDeductible) * 100;

    if (coverageRatio >= 100) {
      recommendations.push({
        level: "optimal",
        title: "Excellent Deductible Protection",
        message: `Your projected HSA balance of $${results.projectedReserve.toLocaleString()} fully covers your $${relevantDeductible.toLocaleString()} deductible. You're well-positioned to handle large medical claims without financial stress.`,
        actions: [
          "Consider this your emergency medical fund",
          "Any unused balance rolls over year-over-year for future needs"
        ]
      });
    } else if (coverageRatio >= 75) {
      recommendations.push({
        level: "good",
        title: "Good Deductible Coverage",
        message: `Your projected HSA balance covers ${Math.round(coverageRatio)}% of your deductible. You have decent protection, but may want to increase contributions to reach full deductible coverage.`,
        actions: [
          `Increase annual contribution by $${Math.ceil((relevantDeductible - results.projectedReserve) / 100) * 100} to fully cover deductible`,
          "Review anticipated expenses to refine your target"
        ]
      });
    } else if (coverageRatio >= 50) {
      recommendations.push({
        level: "warning",
        title: "Moderate Deductible Gap",
        message: `Your HSA balance only covers ${Math.round(coverageRatio)}% of your $${relevantDeductible.toLocaleString()} deductible. If you face a major medical event, you'll need $${(relevantDeductible - results.projectedReserve).toLocaleString()} out-of-pocket.`,
        actions: [
          `Increase contribution to at least $${relevantDeductible.toLocaleString()} to cover deductible`,
          "Build your HSA balance gradually over 2-3 years if immediate increase isn't feasible",
          "Keep emergency savings available for medical costs"
        ]
      });
    } else {
      recommendations.push({
        level: "critical",
        title: "Significant Deductible Gap",
        message: `Your HSA balance will only cover ${Math.round(coverageRatio)}% of your deductible. Without additional savings, a major medical event could strain your finances significantly.`,
        actions: [
          `Critical: Increase contribution by $${(relevantDeductible - results.projectedReserve).toLocaleString()} to protect against high medical costs`,
          "Consider if the HDHP is the right plan choice given your financial situation",
          "Ensure you have emergency savings outside HSA for medical costs"
        ]
      });
    }
  }

  // Recommendation 2: Anticipated Expenses Coverage
  if (totalAnticipatedExpenses > 0) {
    const expensesCovered = results.projectedReserve >= totalAnticipatedExpenses;
    const combinedNeed = totalAnticipatedExpenses + (relevantDeductible ?? 0);

    if (expensesCovered && results.projectedReserve >= combinedNeed) {
      recommendations.push({
        level: "optimal",
        title: "Full Expense Coverage",
        message: `Your HSA will cover both your anticipated ${totalAnticipatedExpenses.toLocaleString()} in routine expenses and your deductible. This positions you well for both planned and unplanned care.`,
        actions: [
          "Track actual expenses monthly to stay on budget",
          "Save receipts for HSA reimbursements"
        ]
      });
    } else if (expensesCovered) {
      recommendations.push({
        level: "good",
        title: "Routine Expenses Covered",
        message: `Your HSA covers your anticipated $${totalAnticipatedExpenses.toLocaleString()} in routine expenses, but may fall short if you hit your deductible. Plan accordingly for larger medical events.`
      });
    } else {
      const shortfall = totalAnticipatedExpenses - results.projectedReserve;
      recommendations.push({
        level: "warning",
        title: "Expense Forecast Gap",
        message: `You've forecasted $${totalAnticipatedExpenses.toLocaleString()} in expenses, but your HSA will only have $${results.projectedReserve.toLocaleString()}. You'll need $${shortfall.toLocaleString()} from other sources.`,
        actions: [
          "Reduce anticipated expenses by delaying non-urgent care",
          `Increase HSA contribution by $${Math.ceil(shortfall / 100) * 100}`,
          "Budget for out-of-pocket costs beyond HSA balance"
        ]
      });
    }
  }

  // Recommendation 3: Tax Optimization
  if (results.taxSavings > 0) {
    const savingsRate = (results.taxSavings / results.employeeContribution) * 100;

    if (savingsRate >= 20) {
      recommendations.push({
        level: "optimal",
        title: "Strong Tax Savings",
        message: `You're saving $${Math.round(results.taxSavings).toLocaleString()} in taxes (${Math.round(savingsRate)}% of your contribution). Pre-tax HSA contributions are working efficiently for your tax bracket.`,
        actions: [
          "Consider maxing out your HSA contribution if financially feasible",
          `You could save up to $${Math.round((results.annualContributionLimit - results.employeeContribution) * (results.marginalRate / 100)).toLocaleString()} more in taxes by contributing the maximum`
        ]
      });
    }
  }

  // Recommendation 4: Premium Savings Strategy
  if (results.annualPremiumSavings > 0) {
    const premiumCoversContribution = results.annualPremiumSavings >= results.employeeContribution;

    if (premiumCoversContribution) {
      recommendations.push({
        level: "optimal",
        title: "Premium Savings Exceed Contribution",
        message: `Your HDHP saves you $${Math.round(results.annualPremiumSavings).toLocaleString()} vs. the alternative plan—more than your $${results.employeeContribution.toLocaleString()} HSA contribution. The HDHP strategy is cash-flow positive even before tax savings.`,
        actions: [
          "Redirect premium savings into HSA to build your reserve faster",
          "You're in an excellent position with this plan choice"
        ]
      });
    } else {
      recommendations.push({
        level: "good",
        title: "Premium Savings Help Offset Contribution",
        message: `Your HDHP saves $${Math.round(results.annualPremiumSavings).toLocaleString()} in premiums, covering ${Math.round((results.annualPremiumSavings / results.employeeContribution) * 100)}% of your HSA contribution.`
      });
    }
  }

  // Recommendation 5: Contribution Limit Utilization
  const utilizationRate = (results.totalContribution / results.annualContributionLimit) * 100;

  if (utilizationRate < 50 && results.marginalRate >= 22) {
    recommendations.push({
      level: "good",
      title: "Room for Tax-Advantaged Growth",
      message: `You're only using ${Math.round(utilizationRate)}% of your HSA contribution limit. In your ${results.marginalRate}% tax bracket, you could save an additional $${Math.round((results.annualContributionLimit - results.totalContribution) * (results.marginalRate / 100)).toLocaleString()} by maximizing contributions.`,
      actions: [
        `Consider increasing contribution toward the $${results.annualContributionLimit.toLocaleString()} limit`,
        "HSA is one of the most tax-advantaged accounts available (triple tax benefit)"
      ]
    });
  }

  // Return top 3 most relevant recommendations
  return recommendations.slice(0, 3);
}