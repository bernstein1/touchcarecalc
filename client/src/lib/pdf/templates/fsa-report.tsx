import React from 'react';
import { Text } from '@react-pdf/renderer';
import { BaseDocument } from '../components/base-document';
import { Section, ValueRow, MetricCard, MetricGrid, Divider, Note } from '../components/pdf-sections';
import { formatCurrency, PDFReportData } from '../pdf-utils';
import { FSAInputs, FSAResults } from '@shared/schema';

interface FSAReportProps {
  data: PDFReportData & {
    inputs: FSAInputs;
    results: FSAResults;
  };
}

export const FSAReport: React.FC<FSAReportProps> = ({ data }) => {
  const { inputs, results, generatedAt } = data;

  return (
    <BaseDocument title="FSA Election Analysis" subtitle="Health & Dependent Care FSAs - Tax Year 2025" generatedAt={generatedAt}>
      <Section title="Executive Summary">
        <MetricGrid>
          <MetricCard
            title="Health FSA Election"
            value={inputs.healthElection}
            currency
            description="Total annual amount elected"
          />
          <MetricCard
            title="Expected Utilisation"
            value={results.expectedUtilization}
            currency
            description="Projected spend within plan rules"
          />
          <MetricCard
            title="Tax Savings"
            value={results.taxSavings}
            currency
            description="Payroll tax reduction"
          />
          <MetricCard
            title="Forfeiture Risk"
            value={results.forfeitureRisk}
            currency
            description="Potential unused balance"
          />
        </MetricGrid>
      </Section>

      <Divider />

      <Section title="Plan Inputs">
        <ValueRow label="Health FSA Election" value={inputs.healthElection} currency />
        <ValueRow label="Expected Eligible Expenses" value={inputs.expectedEligibleExpenses} currency />
        <ValueRow label="Carryover Allowance" value={inputs.planCarryover} currency />
        <ValueRow label="Grace Period" value={`${inputs.gracePeriodMonths.toFixed(1)} months`} />
        <ValueRow label="Marginal Tax Rate" value={`${inputs.taxBracket}%`} />
        <ValueRow label="Dependent-care Included" value={inputs.includeDependentCare ? 'Yes' : 'No'} />
        {inputs.includeDependentCare ? (
          <>
            <ValueRow label="Dependent-care Election" value={inputs.dependentCareElection} currency />
            <ValueRow label="Expected Dependent-care Expenses" value={inputs.expectedDependentCareExpenses} currency />
          </>
        ) : null}
      </Section>

      <Divider />

      <Section title="Health FSA Forecast">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          Health FSA dollars are available at the start of the plan year. Align your election with known procedures and
          everyday copays to minimise forfeiture risk.
        </Text>
        <ValueRow label="Election vs. Expected Spend" value={`${formatCurrency(inputs.healthElection)} / ${formatCurrency(inputs.expectedEligibleExpenses)}`} />
        <ValueRow label="Carryover Protected" value={results.carryoverProtected} currency />
        <ValueRow label="Potential Forfeiture" value={results.forfeitureRisk} currency highlight />
        <ValueRow label="Net Benefit (Tax Savings − Risk)" value={results.netBenefit} currency primary />
      </Section>

      <Divider />

      {inputs.includeDependentCare ? (
        <Section title="Dependent-care FSA Snapshot">
          <ValueRow label="Election" value={inputs.dependentCareElection} currency />
          <ValueRow label="Expected Expenses" value={inputs.expectedDependentCareExpenses} currency />
          <ValueRow label="Tax Savings" value={results.dependentCareTaxSavings} currency />
          <ValueRow label="Potential Forfeiture" value={results.dependentCareForfeitureRisk} currency highlight />
          <Note>
            Dependent-care FSAs reimburse as you contribute. Submit receipts regularly to avoid leaving reimbursements on
            the table, and coordinate with your spouse so household elections stay within IRS limits.
          </Note>
        </Section>
      ) : null}

      <Divider />

      <Section title="Recommendations">
        <Text style={{ fontSize: 10, marginBottom: 6, color: '#374151' }}>
          Use these suggestions to fine-tune your election and stay aligned with plan rules:
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 4, color: '#374151' }}>
          • If expected expenses are lower than your election, reduce the election or plan eligible purchases before the
          year closes.
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 4, color: '#374151' }}>
          • Track reimbursements throughout the year to keep cash flowing and avoid a rush during the grace period.
        </Text>
        <Text style={{ fontSize: 9, color: '#374151' }}>
          • Coordinate health FSAs with HSAs or copay-based plans—only one spouse can elect a full health FSA if the other
          contributes to an HSA.
        </Text>
      </Section>
    </BaseDocument>
  );
};

export default FSAReport;
