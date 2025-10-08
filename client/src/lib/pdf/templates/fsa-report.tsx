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
  const talkingPoints = data.additionalData?.narrative as
    | {
        electionSizing?: string;
        gracePeriod?: string;
        forfeiture?: string;
      }
    | undefined;

  return (
    <BaseDocument title="FSA Election Analysis" subtitle="Health & Dependent Care FSAs - Tax Year 2026" generatedAt={generatedAt}>
      <Section title="Executive Summary">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          This report breaks down your Flexible Spending Account choices in everyday language. Use it to confirm how much you elected, what you plan to spend, and how the use-it-or-lose-it rule could affect you.
        </Text>
        <MetricGrid>
          <MetricCard
            title="Health FSA Election"
            value={inputs.healthElection}
            currency
            description="Total dollars you promised to set aside this year"
          />
          <MetricCard
            title="Planned spending"
            value={results.expectedUtilization}
            currency
            description="What you expect to spend under plan rules"
          />
          <MetricCard
            title="Tax Savings"
            value={results.taxSavings}
            currency
            description="Estimated taxes you avoid with pre-tax dollars"
          />
          <MetricCard
            title="Money at risk"
            value={results.forfeitureRisk}
            currency
            description="Amount you could forfeit if left unspent"
          />
        </MetricGrid>
      </Section>

      <Divider />

      <Section title="What we used for the math">
        <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
          These are the numbers you entered or that apply to your plan. They drive the savings and forfeiture estimates in this report.
        </Text>
        <ValueRow label="Health FSA election (total pledged)" value={inputs.healthElection} currency />
        <ValueRow label="Expected eligible expenses" value={inputs.expectedEligibleExpenses} currency />
        <ValueRow label="Carryover allowance" value={inputs.planCarryover} currency />
        <ValueRow label="Grace period length" value={`${inputs.gracePeriodMonths.toFixed(1)} months`} />
        <ValueRow label="Household annual income" value={inputs.annualIncome} currency />
        <ValueRow label="Estimated marginal tax rate" value={`${results.marginalRate}%`} />
        <ValueRow label="Dependent-care FSA included" value={inputs.includeDependentCare ? 'Yes' : 'No'} />
        {inputs.includeDependentCare ? (
          <>
            <ValueRow label="Dependent-care election (household total)" value={inputs.dependentCareElection} currency />
            <ValueRow label="Expected dependent-care expenses" value={inputs.expectedDependentCareExpenses} currency />
          </>
        ) : null}
      </Section>

      <Divider />

      {talkingPoints ? (
        <Section title="Election Storyline">
          <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
            Here is the plain-language summary pulled from your inputs. Share these bullets with your benefits team or keep them for open enrollment notes.
          </Text>
          {talkingPoints.electionSizing && (
            <Text style={{ fontSize: 9, marginBottom: 6, color: '#374151' }}>{`• ${talkingPoints.electionSizing}`}</Text>
          )}
          {talkingPoints.gracePeriod && (
            <Text style={{ fontSize: 9, marginBottom: 6, color: '#374151' }}>{`• ${talkingPoints.gracePeriod}`}</Text>
          )}
          {talkingPoints.forfeiture && (
            <Text style={{ fontSize: 9, color: '#374151' }}>{`• ${talkingPoints.forfeiture}`}</Text>
          )}
        </Section>
      ) : null}

      <Divider />

      <Section title="Health FSA Forecast">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          Your health FSA election is ready on the first day of the plan year even if you have not paid in yet. Use the numbers below to see how well your election matches known bills and how much the use-it-or-lose-it rule might affect you.
        </Text>
        <ValueRow label="Election compared with expected bills" value={`${formatCurrency(inputs.healthElection)} / ${formatCurrency(inputs.expectedEligibleExpenses)}`} />
        <ValueRow label="Carryover or grace protection" value={results.carryoverProtected} currency />
        <ValueRow label="Money that could be forfeited" value={results.forfeitureRisk} currency highlight />
        <ValueRow label="Net benefit after possible forfeiture" value={results.netBenefit} currency primary />
      </Section>

      <Divider />

      {inputs.includeDependentCare ? (
        <Section title="Dependent-care FSA Snapshot">
          <ValueRow label="Election (shared household total)" value={inputs.dependentCareElection} currency />
          <ValueRow label="Expected dependent-care bills" value={inputs.expectedDependentCareExpenses} currency />
          <ValueRow label="Estimated tax savings" value={results.dependentCareTaxSavings} currency />
          <ValueRow label="Money that could be forfeited" value={results.dependentCareForfeitureRisk} currency highlight />
          <Note>
            Dependent-care FSA dollars build up each payday and are reimbursed only after you pay the provider. Submit
            receipts regularly and coordinate with your spouse so the household stays under the IRS limit.
          </Note>
        </Section>
      ) : null}

      <Divider />

      <Section title="Recommendations">
        <Text style={{ fontSize: 10, marginBottom: 6, color: '#374151' }}>
          Use these suggestions to fine-tune your election and stay aligned with plan rules:
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 4, color: '#374151' }}>• If expected expenses are lower than your election, lower the election or schedule eligible purchases before deadlines.</Text>
        <Text style={{ fontSize: 9, marginBottom: 4, color: '#374151' }}>• Submit claims during the year so reimbursements keep pace with spending and you are not rushing at year-end.</Text>
        <Text style={{ fontSize: 9, marginBottom: 4, color: '#374151' }}>• Coordinate with your spouse's benefits—only one person can have a full health FSA if the other contributes to an HSA alongside HDHP / CDHP coverage.</Text>
        <Text style={{ fontSize: 9, color: '#374151' }}>• Considering dental or vision costs? Confirm whether your employer offers a Limited Purpose FSA (LPFSA) that can pair with an HSA and HDHP / CDHP coverage for those expenses.</Text>
      </Section>
    </BaseDocument>
  );
};

export default FSAReport;
