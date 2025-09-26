import type { FilingStatus } from "@shared/schema";

export interface TaxBracketThreshold {
  upTo: number | null;
  rate: number;
}

export const TAX_BRACKETS_2025: Record<FilingStatus, TaxBracketThreshold[]> = {
  single: [
    { upTo: 11_600, rate: 10 },
    { upTo: 47_150, rate: 12 },
    { upTo: 100_525, rate: 22 },
    { upTo: 191_950, rate: 24 },
    { upTo: 243_725, rate: 32 },
    { upTo: 609_350, rate: 35 },
    { upTo: null, rate: 37 },
  ],
  marriedJoint: [
    { upTo: 23_200, rate: 10 },
    { upTo: 94_300, rate: 12 },
    { upTo: 201_050, rate: 22 },
    { upTo: 383_900, rate: 24 },
    { upTo: 487_450, rate: 32 },
    { upTo: 731_200, rate: 35 },
    { upTo: null, rate: 37 },
  ],
  marriedSeparate: [
    { upTo: 11_600, rate: 10 },
    { upTo: 47_150, rate: 12 },
    { upTo: 100_525, rate: 22 },
    { upTo: 191_950, rate: 24 },
    { upTo: 243_725, rate: 32 },
    { upTo: 365_600, rate: 35 },
    { upTo: null, rate: 37 },
  ],
  headOfHousehold: [
    { upTo: 16_550, rate: 10 },
    { upTo: 63_100, rate: 12 },
    { upTo: 100_500, rate: 22 },
    { upTo: 191_950, rate: 24 },
    { upTo: 243_700, rate: 32 },
    { upTo: 609_350, rate: 35 },
    { upTo: null, rate: 37 },
  ],
};

export function getMarginalTaxRate(
  annualIncome: number | undefined,
  filingStatus: FilingStatus | undefined
): number {
  if (!Number.isFinite(annualIncome ?? NaN) || (annualIncome ?? 0) <= 0) {
    return 0;
  }

  const status: FilingStatus = filingStatus ?? 'single';
  const income = Math.max(annualIncome ?? 0, 0);
  const brackets = TAX_BRACKETS_2025[status];

  for (const bracket of brackets) {
    if (bracket.upTo === null || income <= bracket.upTo) {
      return bracket.rate;
    }
  }

  return brackets[brackets.length - 1]?.rate ?? 0;
}

export function describeFilingStatus(status: FilingStatus): string {
  switch (status) {
    case 'single':
      return 'Single';
    case 'marriedJoint':
      return 'Married filing jointly';
    case 'marriedSeparate':
      return 'Married filing separately';
    case 'headOfHousehold':
      return 'Head of household';
    default:
      return status;
  }
}
