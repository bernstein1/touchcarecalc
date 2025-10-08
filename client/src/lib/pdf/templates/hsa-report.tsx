import React from 'react';
import { Text } from '@react-pdf/renderer';
import { BaseDocument } from '../components/base-document';
import { Section, ValueRow, MetricCard, MetricGrid, Divider, Note } from '../components/pdf-sections';
import { formatCurrency, PDFReportData } from '../pdf-utils';
import { HSA_LIMITS } from '@/lib/calculations';
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
  const totalSavingsThisYear = results.annualPremiumSavings + results.taxSavings;
  const familyLimitDisplay = formatCurrency(HSA_LIMITS.family);
  const familyLimitWithCatchUpDisplay = formatCurrency(HSA_LIMITS.family + HSA_LIMITS.catchUp);
  const projectedReserve = results.projectedReserve ?? 0;
  const targetSavingsGoal = inputs.targetReserve ?? 0;
  const reserveProgressLabel =
    targetSavingsGoal > 0
      ? `${formatCurrency(Math.min(projectedReserve, targetSavingsGoal))} of ${formatCurrency(targetSavingsGoal)}`
      : formatCurrency(projectedReserve);
  const reserveShortfall =
    targetSavingsGoal > 0 ? Math.max(targetSavingsGoal - projectedReserve, 0) : 0;

  return (
    <BaseDocument title="HSA Strategy Analysis" subtitle={`${coverageText} HDHP / CDHP Coverage - Tax Year 2026`} generatedAt={generatedAt}>
      <Section title="Executive Summary">
        <MetricGrid>
          <MetricCard
            title="Annual premium savings redirected (HDHP / CDHP)"
            value={results.annualPremiumSavings}
            currency
            description="Money saved on premiums by choosing the HDHP / CDHP plan"
          />
          <MetricCard
            title="Tax Savings"
            value={results.taxSavings}
            currency
            description="Taxes avoided because HSA deposits come out before tax"
          />
          <MetricCard
            title="Your total savings this year (HDHP / CDHP)"
            value={totalSavingsThisYear}
            currency
            description="Premium savings plus tax savings available to fund your HSA"
          />
          <MetricCard
            title="Net Cashflow Advantage"
            value={results.netCashflowAdvantage}
            currency
            description="Premium savings plus employer contributions and tax savings minus your deposits"
          />
        </MetricGrid>
      </Section>

      <Divider />

      <Section title="Plan and contribution details">
        <ValueRow label="Coverage Level" value={coverageText} />
        <ValueRow label="Participant Age" value={inputs.age} />
        <ValueRow label="Household Annual Income" value={inputs.annualIncome} currency />
        <ValueRow label="Marginal Tax Rate" value={`${results.marginalRate}%`} />
        <ValueRow label="2026 Contribution Limit" value={results.annualContributionLimit} currency highlight />
        <ValueRow label="Employee Contribution" value={results.employeeContribution} currency />
        <ValueRow label="Employer Contribution" value={results.employerContribution} currency />
        <ValueRow label="Target savings goal" value={inputs.targetReserve} currency />
        <ValueRow label="HSA balance progress" value={reserveProgressLabel} />
        <Note>
          {inputs.coverage === 'family'
            ? `The ${familyLimitDisplay} family limit applies to family HDHP / CDHP coverage and reaches ${familyLimitWithCatchUpDisplay} with the age 55+ catch-up.`
            : `The ${familyLimitDisplay} family limit applies only to family HDHP / CDHP coverage. If an individual is not on a family plan, they cannot contribute this amount.`}
        </Note>
      </Section>

      <Divider />

      <Section title="Premium comparison and cash flow">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          A high-deductible or consumer driven health plan (HDHP / CDHP) trades copays for lower premiums. Redirect the premium difference and tax
          savings into the health savings account (HSA) so the deductible is ready when medical bills show up.
        </Text>
        <ValueRow label="HDHP / CDHP Monthly Premium" value={inputs.hdhpMonthlyPremium} currency />
        <ValueRow label="Alternative Plan Premium" value={inputs.altPlanMonthlyPremium} currency />
        <ValueRow label="Annual premium savings redirected (HDHP / CDHP)" value={results.annualPremiumSavings} currency primary />
        <ValueRow label="Tax Savings" value={results.taxSavings} currency />
        <ValueRow label="Your total savings this year (HDHP / CDHP)" value={totalSavingsThisYear} currency />
        <ValueRow label="Employer Contribution" value={results.employerContribution} currency />
        <ValueRow label="Net Cashflow Advantage" value={results.netCashflowAdvantage} currency highlight />
      </Section>

      {talkingPoints ? (
        <>
          <Divider />

          <Section title="Plain-language highlights">
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
        <ValueRow label="Projected HSA balance" value={projectedReserve} currency primary />
        <ValueRow label="Target savings goal" value={targetSavingsGoal} currency />
        <ValueRow label="Shortfall to target savings goal" value={reserveShortfall} currency highlight />
        <ValueRow label="Balance progress" value={reserveProgressLabel} />
        <Note>
          HDHP / CDHP plans depend on a stocked HSA to offset surprise bills. Direct premium savings into the account until your balance
          reaches the target savings goal (often the HDHP / CDHP deductible), then invest extra dollars for future medical needs.
        </Note>
      </Section>

      <Divider />

      <Section title="Recommendations">
        <Text style={{ fontSize: 10, marginBottom: 6, color: '#374151' }}>
          Use these suggestions to keep your HDHP / CDHP affordable and resilient:
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
