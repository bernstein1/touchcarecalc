import { FSAInputs, FSAResults } from "@shared/schema";
import { Recommendation } from "@/components/recommendations/recommendation-card";

export function generateFSARecommendations(inputs: FSAInputs, results: FSAResults): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Recommendation 1: Forfeiture Risk Assessment
  if (results.forfeitureRisk > 0) {
    const riskPercentage = (results.forfeitureRisk / results.cappedHealthElection) * 100;

    if (riskPercentage >= 30) {
      recommendations.push({
        level: "critical",
        title: "High Forfeiture Risk",
        message: `You're at risk of losing $${results.forfeitureRisk.toLocaleString()} (${Math.round(riskPercentage)}% of your election). Your expected expenses are significantly lower than your election amount.`,
        actions: [
          `Reduce election to $${Math.ceil(inputs.expectedEligibleExpenses / 100) * 100} to match forecasted expenses`,
          "Over-electing costs you real money due to use-it-or-lose-it rules",
          "Schedule any planned procedures before year-end if already enrolled"
        ]
      });
    } else if (riskPercentage >= 15) {
      recommendations.push({
        level: "warning",
        title: "Moderate Forfeiture Risk",
        message: `You may forfeit $${results.forfeitureRisk.toLocaleString()} (${Math.round(riskPercentage)}% of election). Your carryover and grace period protection isn't enough to save all unused funds.`,
        actions: [
          "Consider reducing next year's election by $" + Math.ceil(results.forfeitureRisk / 100) * 100,
          "Schedule dental/vision appointments to use remaining funds",
          "Stock up on eligible items (contacts, glasses, OTC medications)"
        ]
      });
    } else if (riskPercentage > 0) {
      recommendations.push({
        level: "good",
        title: "Low Forfeiture Risk",
        message: `Small potential forfeiture of $${results.forfeitureRisk.toLocaleString()} (${Math.round(riskPercentage)}%). Your carryover/grace period provides good protection. This is a reasonable buffer for planning uncertainty.`
      });
    }
  } else if (results.forfeitureRisk === 0 && inputs.expectedEligibleExpenses > 0) {
    // Perfect match or slightly under-elected
    const utilizationRate = (inputs.expectedEligibleExpenses / results.cappedHealthElection) * 100;

    if (utilizationRate >= 95) {
      recommendations.push({
        level: "optimal",
        title: "Well-Balanced Election",
        message: `Your election matches your expected expenses perfectly. You're maximizing tax savings while minimizing forfeiture risk. This is optimal FSA planning.`,
        actions: [
          "Track expenses monthly to ensure you stay on budget",
          "Keep receipts for all FSA purchases"
        ]
      });
    }
  }

  // Recommendation 2: Carryover vs Grace Period Optimization
  if (inputs.planCarryover > 0 || inputs.gracePeriodMonths > 0) {
    const protection = results.carryoverProtected;
    const unprotected = results.forfeitureRisk;

    if (protection > 0 && unprotected === 0) {
      recommendations.push({
        level: "optimal",
        title: "Strong FSA Protection",
        message: `Your plan's ${inputs.planCarryover > 0 ? `$${inputs.planCarryover} carryover` : `${inputs.gracePeriodMonths}-month grace period`} will protect all unused funds. You have flexibility to carry forward $${protection.toLocaleString()}.`,
        actions: [
          "You can safely elect slightly above expected expenses",
          "Use the extra time to schedule appointments"
        ]
      });
    }
  } else if (inputs.healthElection > 1000) {
    recommendations.push({
      level: "warning",
      title: "No Rollover Protection",
      message: `Your plan has neither carryover nor grace period. Every dollar must be spent by December 31st or you lose it. This makes accurate forecasting critical.`,
      actions: [
        "Be conservative with election - only elect what you're certain you'll spend",
        "Plan major expenses (glasses, dental work) for Q4 to use remaining funds",
        "Ask HR if your plan will add carryover/grace period next year"
      ]
    });
  }

  // Recommendation 3: Dependent Care FSA Assessment
  if (inputs.includeDependentCare && results.dependentCareForfeitureRisk > 0) {
    const dcRiskPercentage = (results.dependentCareForfeitureRisk / inputs.dependentCareElection) * 100;

    if (dcRiskPercentage >= 20) {
      recommendations.push({
        level: "warning",
        title: "Dependent Care FSA Over-Election",
        message: `Your dependent care FSA may forfeit $${results.dependentCareForfeitureRisk.toLocaleString()}. Remember: dependent care FSA reimburses after expenses are incurred (unlike health FSA front-loading).`,
        actions: [
          `Reduce election to $${inputs.expectedDependentCareExpenses} to match actual expenses`,
          "Only elect what you're certain to spend - no carryover allowed on DCFSA"
        ]
      });
    }
  }

  // Recommendation 4: LPFSA Opportunity (if they have an HSA)
  if (!inputs.includeLimitedPurposeFSA) {
    recommendations.push({
      level: "good",
      title: "Consider Limited Purpose FSA",
      message: "If you have an HSA, you can pair it with a Limited Purpose FSA (LPFSA) for dental and vision expenses. This gives you front-loaded funds for predictable expenses while keeping HSA eligibility.",
      actions: [
        "LPFSA covers dental cleanings, fillings, orthodontics, glasses, contacts",
        "Strategy: Use LPFSA for planned dental/vision, save HSA for medical emergencies",
        "Enable 'Limited Purpose FSA' section above to explore this option"
      ]
    });
  }

  // Recommendation 5: Pay Period Impact
  if (results.perPaycheckDeduction && results.numberOfPaychecks) {
    const monthlyImpact = (results.perPaycheckDeduction * results.numberOfPaychecks) / 12;

    if (monthlyImpact > 300) {
      recommendations.push({
        level: "good",
        title: "Paycheck Impact",
        message: `Your FSA will reduce monthly take-home pay by approximately $${Math.round(monthlyImpact)} (${results.numberOfPaychecks} paychecks × $${Math.round(results.perPaycheckDeduction)} each). Make sure your budget can absorb this reduction.`,
        actions: [
          "Remember: You get access to full election on day 1",
          "Deductions spread evenly over the year to pay it back",
          "Net impact is positive due to tax savings"
        ]
      });
    }
  }

  // Recommendation 6: Tax Savings Perspective
  if (results.netBenefit > 0) {
    const benefitPercentage = (results.netBenefit / results.cappedHealthElection) * 100;

    if (benefitPercentage >= 20) {
      recommendations.push({
        level: "optimal",
        title: "Strong Tax Benefit",
        message: `After accounting for potential forfeiture, you're netting $${results.netBenefit.toLocaleString()} in tax savings (${Math.round(benefitPercentage)}% benefit). Your FSA is working efficiently.`,
        actions: [
          "This confirms FSA is a good choice for your situation",
          "Continue tracking expenses to maintain this advantage"
        ]
      });
    }
  }

  // Return top 3 most relevant recommendations
  return recommendations.slice(0, 3);
}