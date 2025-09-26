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
      value: `${formatCurrency(CONTRIBUTION_LIMITS.FSA)} you can pledge for eligible medical costs this plan year`,
    },
    {
      label: '"Use-it-or-lose-it" rule:',
      value: "Spend the money by the deadline or give it back—only carryover or a grace period protects leftovers",
    },
    {
      label: "Dependent-care FSA household limit (2025):",
      value: `${formatCurrency(FSA_LIMITS.dependentCare)} shared across the household for childcare or elder care reimbursements`,
    },
  ],
  commuter: [
    {
      label: "Transit limit (2025):",
      value: `You can set aside up to ${formatCurrency(CONTRIBUTION_LIMITS.COMMUTER_TRANSIT)} each month before taxes for transit fares, passes, and vanpools tied to your commute`,
    },
    {
      label: "Parking limit (2025):",
      value: `You can also save up to ${formatCurrency(CONTRIBUTION_LIMITS.COMMUTER_PARKING)} per month before taxes for parking next to work or a transit station`,
    },
  ],
  life: [
    {
      label: "Income replacement guide:",
      value:
        "A common rule of thumb is to target 10–15 times your annual income so your family can cover daily expenses, save for goals, and keep pace with inflation after you’re gone.",
    },
    {
      label: "Methodology explained:",
      value:
        "The DIME method totals Debt, ongoing Income needs, Mortgage payoff, and future Education costs to create a practical estimate of how much coverage keeps your household secure.",
    },
  ],
};
