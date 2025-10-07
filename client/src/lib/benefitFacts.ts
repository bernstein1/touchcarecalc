import { CONTRIBUTION_LIMITS, FSA_LIMITS } from "@/lib/calculations";
import type { CalculatorId } from "./calculatorTheme";

export interface BenefitFact {
  label: string;
  value: string;
}

const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

export const BENEFIT_FACTS: Record<CalculatorId, BenefitFact[]> = {
  hsa: [
    {
      label: "Individual contribution limit (2026):",
      value: `${formatCurrency(CONTRIBUTION_LIMITS.HSA_INDIVIDUAL)} for self-only HDHP / CDHP coverage, plus a $1,000 catch-up once you turn 55`,
    },
    {
      label: "Family contribution limit (2026):",
      value: `${formatCurrency(CONTRIBUTION_LIMITS.HSA_FAMILY)} when your HDHP / CDHP covers family members, plus the same $1,000 catch-up after age 55. This limit applies to the entire household—if an individual is not on a family plan, they cannot contribute this amount.`,
    },
    {
      label: "Unused funds roll over year-over-year:",
      value: "Unlike FSAs, any unused HSA balance carries forward indefinitely—no use-it-or-lose-it deadlines. Build your medical safety net over time.",
    },
    {
      label: "Funds availability:",
      value: "Money you contribute becomes available once it's distributed to your HSA account. Check with your HSA provider for distribution timing.",
    },
    {
      label: "HDHP / CDHP requirement:",
      value: "HSAs are only compatible with qualified high-deductible or consumer driven health plans (HDHP / CDHP). You cannot contribute to an HSA while also enrolled in a general-purpose medical FSA.",
    },
    {
      label: "Employer contributions:",
      value: "Stack on top of your own deposits (and count toward the household limit)—confirm whether the money arrives upfront or through paycheck matching.",
    },
  ],
  fsa: [
    {
      label: "Health FSA annual limit (2026):",
      value: `${formatCurrency(CONTRIBUTION_LIMITS.FSA)} max you can elect for health expenses in 2026`,
    },
    {
      label: '"Use-it-or-lose-it" rule:',
      value: "Only a carryover or grace period saves leftover dollars from the use-it-or-lose-it rule—unlike HSAs, FSA funds don't automatically roll over.",
    },
    {
      label: "Front-loaded but amortized:",
      value: "Your full election is available on day one, but you pay it back through equal paycheck deductions over the year.",
    },
    {
      label: "Limited Purpose FSA (LPFSA):",
      value: "If you have an HSA, you can pair it with an LPFSA to cover dental and vision expenses pre-tax without breaking HSA compatibility rules. Limited Purpose FSAs are not available through every organization—review your benefits guide, platform, or enrollment solution to confirm whether your company offers an LPFSA.",
    },
    {
      label: "Dependent-care FSA household limit (2026):",
      value: `${formatCurrency(FSA_LIMITS.dependentCare)} per household for dependent-care expenses like childcare or elder care. Reimbursed after care is provided.`,
    },
  ],
  commuter: [
    {
      label: "Transit limit (2026):",
      value: `Set aside up to ${formatCurrency(CONTRIBUTION_LIMITS.COMMUTER_TRANSIT)} per month pre-tax for transit fares, passes, or vanpools tied to your commute`,
    },
    {
      label: "Parking limit (2026):",
      value: `Save up to ${formatCurrency(CONTRIBUTION_LIMITS.COMMUTER_PARKING)} per month pre-tax for parking next to work or your transit station`,
    },
  ],
  life: [
    {
      label: "Income replacement guide:",
      value:
        "Aim for roughly 10–15 times your annual income so your family can cover everyday expenses, keep saving, and stay ahead of inflation.",
    },
    {
      label: "Methodology explained:",
      value:
        "The DIME method combines Debt, Income replacement, Mortgage payoff, and Education costs to size coverage that keeps your household secure.",
    },
  ],
};
