export type CalculatorId = "hsa" | "commuter" | "life" | "retirement";

export const CALCULATOR_THEME: Record<CalculatorId, { bgClass: string }> = {
  hsa: { bgClass: "bg-[#00768B]" },
  commuter: { bgClass: "bg-[#26317D]" },
  life: { bgClass: "bg-[#F3716C]" },
  retirement: { bgClass: "bg-[#2B3785]" },
};
