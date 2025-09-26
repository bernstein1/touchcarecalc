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
      value: `${formatCurrency(CONTRIBUTION_LIMITS.HSA_INDIVIDUAL)} plus an extra $1,000 once you turn 55`,
    },
    {
      label: "Family contribution limit (2025):",
      value: `${formatCurrency(CONTRIBUTION_LIMITS.HSA_FAMILY)} plus the $1,000 age-55 catch-up allowance`,
    },
    {
      label: "Employer contributions:",
      value: "Allowed on top of your deposits—confirm whether the money arrives upfront or through matching",
    },
  ],
  fsa: [
    { label: "Health FSA Limit:", value: formatCurrency(CONTRIBUTION_LIMITS.FSA) },
    { label: "Use-it-or-lose-it:", value: "Forfeit amounts beyond carryover/grace" },
    { label: "Dependent Care Max:", value: formatCurrency(FSA_LIMITS.dependentCare) },
  ],
  commuter: [
    { label: "Transit Limit:", value: `${formatCurrency(CONTRIBUTION_LIMITS.COMMUTER_TRANSIT)}/month` },
    { label: "Parking Limit:", value: `${formatCurrency(CONTRIBUTION_LIMITS.COMMUTER_PARKING)}/month` },
  ],
  life: [
    { label: "Income Replacement:", value: "10-15x Annual" },
    { label: "Method:", value: "DIME Analysis" },
  ],
};
