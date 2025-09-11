import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { BaseDocument } from '../components/base-document';
import { Section, ValueRow, MetricCard, MetricGrid, Divider, Note } from '../components/pdf-sections';
import { formatCurrency, PDFReportData } from '../pdf-utils';
import { LifeInsuranceInputs, LifeInsuranceResults } from '@shared/schema';

interface LifeInsuranceReportProps {
  data: PDFReportData & {
    inputs: LifeInsuranceInputs;
    results: LifeInsuranceResults;
  };
}

export const LifeInsuranceReport: React.FC<LifeInsuranceReportProps> = ({ data }) => {
  const { inputs, results, generatedAt } = data;
  
  return (
    <BaseDocument
      title="Life Insurance Needs Analysis Report"
      subtitle="DIME Methodology Assessment"
      generatedAt={generatedAt}
    >
      {/* Executive Summary */}
      <Section title="Executive Summary">
        <MetricGrid>
          <MetricCard
            title="Recommended Coverage"
            value={results.dimeTotal}
            currency
            description="Total DIME calculation"
          />
          <MetricCard
            title="Current Coverage"
            value={inputs.currentInsurance}
            currency
            description="Existing life insurance"
          />
          <MetricCard
            title="Coverage Gap"
            value={results.additionalNeeded}
            currency
            description="Additional insurance needed"
          />
          <MetricCard
            title="Income Replacement"
            value={results.incomeReplacement}
            currency
            description={`${inputs.incomeYears} years of income`}
          />
        </MetricGrid>
      </Section>

      <Divider />

      {/* DIME Methodology Breakdown */}
      <Section title="DIME Methodology Calculation">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          The DIME method calculates life insurance needs based on four key financial components:
        </Text>
        
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2563eb' }}>
            D - Debt Coverage
          </Text>
          <ValueRow label="Total Outstanding Debt" value={inputs.totalDebt} currency />
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#6b7280' }}>
            Covers all existing debts to prevent burden on survivors.
          </Text>
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2563eb' }}>
            I - Income Replacement
          </Text>
          <ValueRow label="Annual Income" value={inputs.income} currency />
          <ValueRow label="Years of Coverage" value={`${inputs.incomeYears} years`} />
          <ValueRow label="Total Income Replacement" value={results.incomeReplacement} currency primary />
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#6b7280' }}>
            Replaces income to maintain family's standard of living.
          </Text>
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2563eb' }}>
            M - Mortgage Payoff
          </Text>
          <ValueRow label="Outstanding Mortgage Balance" value={inputs.mortgageBalance} currency />
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#6b7280' }}>
            Eliminates mortgage payments to reduce ongoing expenses.
          </Text>
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2563eb' }}>
            E - Education Fund
          </Text>
          <ValueRow label="Future Education Costs" value={inputs.educationCosts} currency />
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#6b7280' }}>
            Ensures children's education expenses are covered.
          </Text>
        </View>

        <View style={{ padding: 10, backgroundColor: '#f3f4f6', marginVertical: 10 }}>
          <ValueRow 
            label="Total DIME Calculation" 
            value={results.dimeTotal} 
            currency 
            highlight 
            primary 
          />
          <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 5 }}>
            Sum of Debt + Income + Mortgage + Education
          </Text>
        </View>
      </Section>

      <Divider />

      {/* Coverage Analysis */}
      <Section title="Coverage Gap Analysis">
        <ValueRow label="Recommended Coverage (DIME)" value={results.dimeTotal} currency />
        <ValueRow label="Current Life Insurance" value={inputs.currentInsurance} currency />
        <ValueRow 
          label={results.additionalNeeded > 0 ? "Additional Coverage Needed" : "Coverage Surplus"} 
          value={Math.abs(results.additionalNeeded)} 
          currency 
          highlight 
          success={results.additionalNeeded <= 0}
        />
        
        <Text style={{ fontSize: 10, marginTop: 10, color: '#374151' }}>
          {results.additionalNeeded > 0 ? (
            `You currently have a coverage gap of ${formatCurrency(results.additionalNeeded)}. Consider increasing your life insurance coverage to ensure your family's financial security.`
          ) : results.additionalNeeded < 0 ? (
            `You have adequate coverage with a surplus of ${formatCurrency(Math.abs(results.additionalNeeded))}. Your current coverage exceeds the calculated need.`
          ) : (
            "Your current coverage exactly matches the calculated need based on the DIME methodology."
          )}
        </Text>
      </Section>

      <Divider />

      {/* Types of Life Insurance */}
      <Section title="Life Insurance Options">
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Term Life Insurance
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Lower premiums, temporary coverage (10-30 years)
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Ideal for covering specific time periods (mortgage, children's education)
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#374151' }}>
            • No cash value, pure insurance protection
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Permanent Life Insurance
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Higher premiums, lifelong coverage
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Builds cash value that can be borrowed against
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#374151' }}>
            • Includes whole life, universal life, and variable life options
          </Text>
        </View>

        <Note>
          For most families, term life insurance provides adequate coverage at an affordable cost 
          during the years when financial protection is most critical.
        </Note>
      </Section>

      <Divider />

      {/* Optimization Recommendations */}
      <Section title="Recommendations & Next Steps">
        <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
          Based on your DIME analysis, consider these action items:
        </Text>
        
        {results.additionalNeeded > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 9, marginBottom: 3, fontWeight: 'bold', color: '#dc2626' }}>
              Priority: Address Coverage Gap
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
              • Shop for additional {formatCurrency(results.additionalNeeded)} in life insurance coverage
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
              • Consider term life insurance for cost-effective coverage
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
              • Get quotes from multiple insurance providers
            </Text>
          </View>
        )}
        
        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • Review and update beneficiary designations on all policies
        </Text>
        
        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • Consider the impact of inflation on future education and living costs
        </Text>
        
        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • Evaluate employer-provided life insurance as a starting point
        </Text>
        
        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • Review your coverage annually or after major life events
        </Text>
        
        <Text style={{ fontSize: 9, color: '#374151' }}>
          • Consult with a licensed insurance professional for personalized advice
        </Text>
      </Section>

      <Divider />

      {/* Important Disclaimers */}
      <Section title="Important Considerations">
        <Note>
          The DIME method provides a baseline estimate for life insurance needs. Your actual needs may 
          vary based on factors such as existing savings, Social Security survivor benefits, spouse's 
          income, family size, and personal financial goals. This analysis does not constitute 
          insurance advice - please consult with qualified insurance professionals.
        </Note>
        
        <Text style={{ fontSize: 8, marginTop: 8, color: '#6b7280' }}>
          Additional factors to consider: emergency fund adequacy, retirement savings goals, 
          estate planning objectives, and potential inheritance. Life insurance needs typically 
          decrease over time as debts are paid off and savings accumulate.
        </Text>
      </Section>
    </BaseDocument>
  );
};