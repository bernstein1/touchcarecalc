import React from 'react';
import { Text } from '@react-pdf/renderer';
import { BaseDocument } from '../components/base-document';
import { Section, ValueRow, MetricCard, MetricGrid, Divider, Note } from '../components/pdf-sections';
import { formatCurrency, PDFReportData } from '../pdf-utils';
import { HSAInputs, HSAResults } from '@shared/schema';

interface HSAReportProps {
  data: PDFReportData & {
    inputs: HSAInputs;
    results: HSAResults;
  };
}

export const HSAReport: React.FC<HSAReportProps> = ({ data }) => {
  const { inputs, results, generatedAt } = data;
  const talkingPoints = data.additionalData?.narrative as
    | {
        compatibility?: string;
        employerSupport?: string;
        premiumOffsets?: string;
        cashflow?: string;
      }
    | undefined;
  const coverageText = inputs.coverage === 'family' ? 'Family' : 'Individual';

  return (
    <BaseDocument title="HSA Strategy Analysis" subtitle={`${coverageText} HDHP Coverage - Tax Year 2025`} generatedAt={generatedAt}>
      <Section title="Executive Summary">
        <MetricGrid>
          <MetricCard
            title="Annual Premium Savings"
            value={results.annualPremiumSavings}
            currency
            description="Budget freed by choosing the HDHP"
          />
          <MetricCard
            title="Tax Savings"
            value={results.taxSavings}
            currency
            description="Pre-tax payroll reduction"
          />
          <MetricCard
            title="Total HSA Funding"
            value={results.totalContribution}
            currency
            description="Employee and employer dollars combined"
          />
          <MetricCard
            title="Net Cashflow Advantage"
            value={results.netCashflowAdvantage}
            currency
            description="Premium gap + seed + tax savings − payroll"
          />
        </MetricGrid>
      </Section>

      <Divider />

      <Section title="HDHP & Contribution Details">
        <ValueRow label="Coverage Level" value={coverageText} />
        <ValueRow label="Participant Age" value={inputs.age} />
        <ValueRow label="Marginal Tax Rate" value={`${inputs.taxBracket}%`} />
        <ValueRow label="2025 Contribution Limit" value={results.annualContributionLimit} currency highlight />
        <ValueRow label="Employee Contribution" value={results.employeeContribution} currency />
        <ValueRow label="Employer Contribution" value={results.employerContribution} currency />
        <ValueRow label="Target Reserve" value={inputs.targetReserve} currency />
      </Section>

      <Divider />

      <Section title="Premium Comparison & Cashflow">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          HDHPs swap predictable copays for lower premiums. Redirect the premium gap and tax savings into the HSA so the
          deductible is covered when claims arrive.
        </Text>
        <ValueRow label="HDHP Monthly Premium" value={inputs.hdhpMonthlyPremium} currency />
        <ValueRow label="Alternative Plan Premium" value={inputs.altPlanMonthlyPremium} currency />
        <ValueRow label="Annual Premium Savings" value={results.annualPremiumSavings} currency primary />
        <ValueRow label="Tax Savings" value={results.taxSavings} currency />
        <ValueRow label="Employer Seed" value={results.employerContribution} currency />
        <ValueRow label="Net Cashflow Advantage" value={results.netCashflowAdvantage} currency highlight />
      </Section>

      {talkingPoints ? (
        <>
          <Divider />

          <Section title="HDHP Narrative Highlights">
            {talkingPoints.compatibility && (
              <Text style={{ fontSize: 9, marginBottom: 6, color: '#374151' }}>{`• ${talkingPoints.compatibility}`}</Text>
            )}
            {talkingPoints.employerSupport && (
              <Text style={{ fontSize: 9, marginBottom: 6, color: '#374151' }}>{`• ${talkingPoints.employerSupport}`}</Text>
            )}
            {talkingPoints.premiumOffsets && (
              <Text style={{ fontSize: 9, marginBottom: 6, color: '#374151' }}>{`• ${talkingPoints.premiumOffsets}`}</Text>
            )}
            {talkingPoints.cashflow && (
              <Text style={{ fontSize: 9, color: '#374151' }}>{`• ${talkingPoints.cashflow}`}</Text>
            )}
          </Section>
        </>
      ) : null}

      <Divider />

      <Section title="HSA Reserve Outlook">
        <ValueRow label="Projected Reserve" value={results.projectedReserve} currency primary />
        <ValueRow label="Target Reserve" value={inputs.targetReserve} currency />
        <ValueRow label="Reserve Shortfall" value={results.reserveShortfall} currency highlight />
        <Note>
          HDHPs depend on a stocked HSA to offset surprise bills. Direct premium savings into the account until the reserve
          matches your deductible, then invest additional dollars for future medical needs.
        </Note>
      </Section>

      <Divider />

      <Section title="Recommendations">
        <Text style={{ fontSize: 10, marginBottom: 6, color: '#374151' }}>
          Use these suggestions to keep your HDHP affordable and resilient:
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 4, color: '#374151' }}>
          • Set aside at least {formatCurrency(results.annualPremiumSavings / 12)} each month—the premium gap that should flow
          straight into the HSA.
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 4, color: '#374151' }}>
          • Revisit contributions mid-year if your HSA balance trails the target reserve after major claims.
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 4, color: '#374151' }}>
          • Once the reserve is fully funded, consider investing future HSA dollars for long-term growth.
        </Text>
        <Text style={{ fontSize: 9, color: '#374151' }}>
          • Keep receipts for qualified expenses so you can reimburse yourself later or document withdrawals for the IRS.
        </Text>
      </Section>
    </BaseDocument>
  );
};

export default HSAReport;
