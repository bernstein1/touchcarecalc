import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { BaseDocument } from '../components/base-document';
import { Section, ValueRow, MetricCard, MetricGrid, Divider, Note } from '../components/pdf-sections';
import { formatCurrency, formatPercentage, PDFReportData } from '../pdf-utils';
import { HSAInputs, HSAResults } from '@shared/schema';

interface HSAReportProps {
  data: PDFReportData & {
    inputs: HSAInputs;
    results: HSAResults;
  };
}

export const HSAReport: React.FC<HSAReportProps> = ({ data }) => {
  const { inputs, results, generatedAt } = data;
  
  const accountTypeText = inputs.accountType.toUpperCase();
  const coverageText = inputs.coverage === 'family' ? 'Family' : 'Individual';
  
  return (
    <BaseDocument
      title={`${accountTypeText} Benefits Analysis Report`}
      subtitle={`${coverageText} Coverage - Tax Year 2025`}
      generatedAt={generatedAt}
    >
      {/* Executive Summary */}
      <Section title="Executive Summary">
        <MetricGrid>
          <MetricCard
            title="Annual Tax Savings"
            value={results.taxSavings}
            currency
            description="Pre-tax benefit reduction"
          />
          <MetricCard
            title="Effective Cost"
            value={results.effectiveCost}
            currency
            description="After-tax contribution cost"
          />
          <MetricCard
            title="Annual Contribution"
            value={results.actualContribution}
            currency
            description="Applied to account"
          />
          <MetricCard
            title="Savings Rate"
            value={(results.taxSavings / results.actualContribution) * 100}
            percentage
            description="Tax savings percentage"
          />
        </MetricGrid>
      </Section>

      <Divider />

      {/* Account Configuration */}
      <Section title="Account Configuration">
        <ValueRow label="Account Type" value={accountTypeText} />
        <ValueRow label="Coverage Level" value={coverageText} />
        <ValueRow label="Annual Income" value={inputs.income} currency />
        <ValueRow label="Tax Bracket" value={`${inputs.taxBracket}%`} />
        <ValueRow 
          label="2025 Contribution Limit" 
          value={results.contributionLimit} 
          currency 
          highlight 
        />
      </Section>

      <Divider />

      {/* Detailed Calculations */}
      <Section title="Tax Benefit Calculations">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          This section shows how your {accountTypeText} contribution reduces your taxable income and saves on taxes.
        </Text>
        
        <ValueRow label="Desired Annual Contribution" value={inputs.contribution} currency />
        <ValueRow label="Maximum Allowed (2025)" value={results.contributionLimit} currency />
        <ValueRow 
          label="Actual Contribution" 
          value={results.actualContribution} 
          currency 
          primary 
        />
        
        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 5 }}>Tax Impact:</Text>
          <ValueRow label="Gross Income" value={inputs.income} currency />
          <ValueRow label="Less: Pre-tax Contribution" value={`-${formatCurrency(results.actualContribution)}`} />
          <ValueRow 
            label="Taxable Income" 
            value={results.taxableIncome} 
            currency 
            highlight 
          />
          <ValueRow 
            label="Tax Savings ({inputs.taxBracket}%)" 
            value={results.taxSavings} 
            currency 
            success 
          />
        </View>

        <ValueRow 
          label="Your Effective Cost" 
          value={results.effectiveCost} 
          currency 
          highlight 
          primary 
        />
      </Section>

      <Divider />

      {/* Account Type Benefits */}
      <Section title={`${accountTypeText} Key Benefits`}>
        {inputs.accountType === 'hsa' ? (
          <View>
            <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
              Health Savings Accounts offer triple tax advantages:
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
              • Tax-deductible contributions reduce current taxable income
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
              • Tax-free growth on investments within the account
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
              • Tax-free withdrawals for qualified medical expenses
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 8, color: '#374151' }}>
              • After age 65: penalty-free withdrawals for any purpose (taxed as income)
            </Text>
            <Note>
              HSA requires enrollment in a High Deductible Health Plan (HDHP). 
              Unused funds roll over annually with no "use it or lose it" provision.
            </Note>
          </View>
        ) : (
          <View>
            <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
              Flexible Spending Accounts provide immediate tax savings:
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
              • Pre-tax payroll deductions reduce current taxable income
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
              • Full annual amount available at plan year start
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
              • Wide range of eligible medical and dependent care expenses
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 8, color: '#374151' }}>
              • Lower contribution limit than HSA but immediate access
            </Text>
            <Note>
              FSA follows "use it or lose it" rules. Plan carefully to avoid losing unused funds. 
              Some plans offer a grace period or small carryover amount.
            </Note>
          </View>
        )}
      </Section>

      <Divider />

      {/* Recommendations */}
      <Section title="Recommendations">
        <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
          Based on your inputs, here are optimization strategies:
        </Text>
        
        {results.actualContribution < results.contributionLimit && (
          <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
            • Consider increasing your contribution to maximize tax savings. 
            Additional {formatCurrency(results.contributionLimit - results.actualContribution)} could 
            save approximately {formatCurrency((results.contributionLimit - results.actualContribution) * (inputs.taxBracket / 100))} 
            in taxes.
          </Text>
        )}
        
        {inputs.accountType === 'hsa' && (
          <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
            • Consider investing HSA funds for long-term growth if you have adequate cash reserves for current medical expenses.
          </Text>
        )}
        
        <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
          • Keep records of all qualified expenses for tax purposes and potential audits.
        </Text>
        
        <Text style={{ fontSize: 9, color: '#374151' }}>
          • Review your contribution amount annually as income and tax brackets may change.
        </Text>
      </Section>
    </BaseDocument>
  );
};