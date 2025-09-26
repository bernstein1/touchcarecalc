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
      label: "Individual contribution limit (2025):",
      value: `${formatCurrency(CONTRIBUTION_LIMITS.HSA_INDIVIDUAL)} for self-only HDHP coverage, plus a $1,000 catch-up once you turn 55`,
    },
    {
      label: "Family contribution limit (2025):",
      value: `${formatCurrency(CONTRIBUTION_LIMITS.HSA_FAMILY)} when your HDHP covers family members, plus the same $1,000 catch-up after age 55`,
    },
    {
      label: "Employer contributions:",
      value: "Stack on top of your own deposits—confirm whether the money arrives upfront or through paycheck matching",
    },
  ],
  fsa: [
    {
      label: "Health FSA annual limit (2025):",
      value: `${formatCurrency(CONTRIBUTION_LIMITS.FSA)} max you can elect for health expenses in 2025`,
    },
    {
      label: '"Use-it-or-lose-it" rule:',
      value: "Only a carryover or grace period saves leftover dollars from the use-it-or-lose-it rule",
    },
    {
      label: "Dependent-care FSA household limit (2025):",
      value: `${formatCurrency(FSA_LIMITS.dependentCare)} per household for dependent-care expenses like childcare or elder care`,
    },
  ],
  commuter: [
    {
      label: "Transit limit (2025):",
      value: `Set aside up to ${formatCurrency(CONTRIBUTION_LIMITS.COMMUTER_TRANSIT)} per month pre-tax for transit fares, passes, or vanpools tied to your commute`,
    },
    {
      label: "Parking limit (2025):",
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
