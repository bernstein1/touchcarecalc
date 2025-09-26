import { CONTRIBUTION_LIMITS, FSA_LIMITS } from "@/lib/calculations";
import type { CalculatorId } from "./calculatorTheme";

export interface BenefitFact {
  label: string;
  value: string;
}

const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

export const BENEFIT_FACTS: Record<CalculatorId, BenefitFact[]> = {
  hsa: [
    { label: "HSA Individual Limit:", value: formatCurrency(CONTRIBUTION_LIMITS.HSA_INDIVIDUAL) },
    { label: "HSA Family Limit:", value: formatCurrency(CONTRIBUTION_LIMITS.HSA_FAMILY) },
    { label: "Employer seed allowed:", value: "Yes — contributions stack with payroll" },
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
  retirement: [
    { label: "2025 Limit:", value: formatCurrency(CONTRIBUTION_LIMITS.RETIREMENT_401K) },
    { label: "50+ Catch-up:", value: formatCurrency(CONTRIBUTION_LIMITS.RETIREMENT_TOTAL_WITH_CATCHUP) },
  ],
};
