import { LifeInsuranceInputs, LifeInsuranceResults } from "@shared/schema";
import { Recommendation } from "@/components/recommendations/recommendation-card";

export function generateLifeInsuranceRecommendations(
  inputs: LifeInsuranceInputs,
  results: LifeInsuranceResults
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Calculate key metrics
  const need = results.adjustedNeed ?? results.dimeTotal;
  const gap = results.additionalNeeded;
  const coverageRatio = inputs.currentInsurance / need;

  // Recommendation 1: Coverage Adequacy Assessment
  if (gap === 0) {
    recommendations.push({
      level: "optimal",
      title: "Adequate Coverage",
      message: `Your current $${inputs.currentInsurance.toLocaleString()} in life insurance fully meets your calculated need of $${need.toLocaleString()}. Your family is well-protected against income loss.`,
      actions: [
        "Review coverage annually as your financial situation changes",
        "Increase coverage if you have more children or take on additional debt",
        "Consider term life insurance for cost-effective protection"
      ]
    });
  } else if (coverageRatio >= 0.75) {
    recommendations.push({
      level: "good",
      title: "Moderate Coverage Gap",
      message: `You have ${Math.round(coverageRatio * 100)}% of recommended coverage. Your family would need an additional $${gap.toLocaleString()} to fully replace income and cover obligations.`,
      actions: [
        `Consider adding $${gap.toLocaleString()} in term life insurance`,
        `This could cost approximately $${Math.round((gap / 100000) * 15)}-$${Math.round((gap / 100000) * 40)}/month depending on age and health`,
        "Start with employer-provided coverage if available at group rates"
      ]
    });
  } else if (coverageRatio >= 0.50) {
    recommendations.push({
      level: "warning",
      title: "Significant Coverage Gap",
      message: `You only have ${Math.round(coverageRatio * 100)}% of recommended coverage. A $${gap.toLocaleString()} shortfall could force your family to liquidate assets or significantly reduce their lifestyle.`,
      actions: [
        `Priority: Add $${gap.toLocaleString()} in life insurance coverage`,
        "Consider 20-30 year term policy to cover until children are independent",
        "Get quotes from at least 3 insurers to find best rates",
        "Employer group coverage is often the most affordable starting point"
      ]
    });
  } else if (coverageRatio < 0.50) {
    recommendations.push({
      level: "critical",
      title: "Critical Coverage Gap",
      message: `Your coverage is severely inadequate. With only ${Math.round(coverageRatio * 100)}% of recommended protection, your family would face significant financial hardship. The $${gap.toLocaleString()} gap is urgent.`,
      actions: [
        `URGENT: Secure at least $${Math.ceil((gap * 0.5) / 100000) * 100000} in additional coverage immediately`,
        "Apply for employer coverage during next open enrollment",
        "Consider term life insurance (most affordable for large coverage amounts)",
        "Work with a financial advisor to prioritize this protection",
        "Don't delay - insurability can change with health conditions"
      ]
    });
  }

  // Recommendation 2: Children-Specific Guidance
  if (inputs.childrenUnder18 && inputs.childrenUnder18 > 0) {
    const yearsUntilOldest = 18; // Simplified assumption
    const yearsOfSupport = Math.max(yearsUntilOldest, inputs.incomeYears);

    if (inputs.incomeYears < yearsUntilOldest + 4) {
      // Children likely won't be through college by end of income replacement period
      recommendations.push({
        level: "good",
        title: "Consider Extended Income Replacement",
        message: `With ${inputs.childrenUnder18} child${inputs.childrenUnder18 > 1 ? 'ren' : ''} under 18, consider extending income replacement to at least ${yearsUntilOldest + 4} years to cover through college graduation (ages 22-23).`,
        actions: [
          `Increase "Years of Income Replacement" to ${Math.max(20, yearsUntilOldest + 4)} years`,
          "This ensures children can complete education without financial stress",
          `Each additional ${5} years adds approximately $${(inputs.income * 5).toLocaleString()} to coverage need`
        ]
      });
    }

    // Child education cost validation
    if (inputs.educationCosts < 50000 * inputs.childrenUnder18) {
      const recommendedEducation = 100000 * inputs.childrenUnder18;
      recommendations.push({
        level: "good",
        title: "Education Cost Review",
        message: `Current education costs ($${inputs.educationCosts.toLocaleString()}) may be understated for ${inputs.childrenUnder18} child${inputs.childrenUnder18 > 1 ? 'ren' : ''}. Average 4-year public college costs approximately $100k per child.`,
        actions: [
          `Consider increasing education costs to at least $${recommendedEducation.toLocaleString()}`,
          "Factor in inflation - costs will be higher when children reach college age",
          "529 plans can supplement but life insurance ensures funds exist"
        ]
      });
    }
  }

  // Recommendation 3: Asset Offset Perspective
  if (inputs.currentAssets && inputs.currentAssets > 0) {
    const assetRatio = inputs.currentAssets / results.dimeTotal;

    if (assetRatio >= 0.3) {
      recommendations.push({
        level: "optimal",
        title: "Strong Asset Position",
        message: `Your $${inputs.currentAssets.toLocaleString()} in liquid assets provides significant financial security, reducing pure insurance need by ${Math.round(assetRatio * 100)}%. Your family has a safety cushion.`,
        actions: [
          "Your assets reduce insurance costs while maintaining protection",
          "Ensure assets remain liquid and accessible",
          "Review beneficiary designations on investment accounts"
        ]
      });
    } else if (assetRatio > 0) {
      recommendations.push({
        level: "good",
        title: "Asset Cushion Available",
        message: `Your $${inputs.currentAssets.toLocaleString()} in assets provides a helpful ${Math.round(assetRatio * 100)}% cushion, but you still need substantial life insurance to protect your family.`
      });
    }
  } else {
    recommendations.push({
      level: "warning",
      title: "No Asset Cushion",
      message: "With no current assets, your family would be entirely dependent on life insurance proceeds. This makes adequate coverage even more critical.",
      actions: [
        "Priority: Secure adequate life insurance immediately",
        "Build emergency savings (3-6 months expenses) as assets grow",
        "Consider disability insurance too - lost income while living is also a risk"
      ]
    });
  }

  // Recommendation 4: Living Expenses Validation
  if (inputs.monthlyLivingExpenses && inputs.monthlyLivingExpenses > 0) {
    const annualExpenses = inputs.monthlyLivingExpenses * 12;
    const expenseRatio = annualExpenses / inputs.income;

    if (expenseRatio > 0.7) {
      recommendations.push({
        level: "warning",
        title: "High Expense-to-Income Ratio",
        message: `Your living expenses (${Math.round(expenseRatio * 100)}% of income) are high. This makes income replacement even more critical, as your family has limited ability to reduce spending.`,
        actions: [
          "Consider maximum coverage duration (20-25 years)",
          "Your family has little room to cut expenses if income is lost",
          "Disability insurance is also important given tight cash flow"
        ]
      });
    }

    // Calculate if income replacement covers living expenses
    const totalIncomeReplacement = results.incomeReplacement;
    const totalLivingExpenses = annualExpenses * inputs.incomeYears;

    if (totalLivingExpenses > totalIncomeReplacement) {
      recommendations.push({
        level: "warning",
        title: "Living Expenses Exceed Income Replacement",
        message: `Your projected living expenses ($${totalLivingExpenses.toLocaleString()}) over ${inputs.incomeYears} years exceed the income replacement calculation. Consider using living expenses as the basis for coverage.`,
        actions: [
          "Our calculator automatically uses the higher of the two",
          "This ensures your family maintains their current lifestyle",
          `Total need adjusted to $${results.dimeTotal.toLocaleString()} to reflect expenses`
        ]
      });
    }
  }

  // Recommendation 5: Term Length Guidance
  if (inputs.incomeYears <= 10 && inputs.currentInsurance < need * 0.8) {
    recommendations.push({
      level: "good",
      title: "Consider Longer Coverage Period",
      message: `A ${inputs.incomeYears}-year policy is short-term protection. Most families need 15-30 years of coverage to reach retirement or children's independence.`,
      actions: [
        "10-year term is for temporary needs (paying off a specific loan)",
        "20-30 year term is typical for primary family protection",
        "Longer terms are only marginally more expensive when you're younger",
        "Can't extend later if health changes"
      ]
    });
  }

  // Return top 3 most relevant recommendations
  return recommendations.slice(0, 3);
}