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
      subtitle="Life Insurance Needs Assessment"
      generatedAt={generatedAt}
    >
      {/* Executive Summary */}
      <Section title="Executive Summary">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          This report estimates how much life insurance could help your family stay financially secure if you were no longer
          here. It walks through major goals—paying off debt, replacing income, clearing your mortgage, and covering education—
          to translate insurance jargon into everyday numbers.
        </Text>
        <MetricGrid>
          <MetricCard
            title="Recommended Coverage"
            value={results.dimeTotal}
            currency
            description="Combined total of Debt, Income, Mortgage, and Education"
          />
          <MetricCard
            title="Current Coverage"
            value={inputs.currentInsurance}
            currency
            description="Life insurance that would pay out today"
          />
          <MetricCard
            title="Coverage Gap"
            value={results.additionalNeeded}
            currency
            description="What’s still needed after subtracting current coverage"
          />
          <MetricCard
            title="Income Replacement"
            value={results.incomeReplacement}
            currency
            description={`${inputs.incomeYears} years of your paycheck for your family`}
          />
        </MetricGrid>
      </Section>

      <Divider />

      {/* DIME Methodology Breakdown */}
      <Section title="Coverage Calculation Breakdown">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          We estimate coverage by lining up major financial goals in plain language—pay off debts, replace lost income, remove housing costs,
          and fund future schooling. The pages below walk through each section.
        </Text>
        
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2563eb' }}>
            Debt Coverage
          </Text>
          <ValueRow label="Total Outstanding Debt" value={inputs.totalDebt} currency />
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#6b7280' }}>
            Pays off credit cards, auto loans, student loans, and other balances so loved ones are not left with monthly bills.
          </Text>
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2563eb' }}>
            Income Replacement
          </Text>
          <ValueRow label="Annual Income" value={inputs.income} currency />
          <ValueRow label="Years of Coverage" value={`${inputs.incomeYears} years`} />
          <ValueRow label="Total Income Replacement" value={results.incomeReplacement} currency primary />
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#6b7280' }}>
            Provides paychecks your family can rely on while they adjust, continue saving, and meet daily expenses.
          </Text>
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2563eb' }}>
            Mortgage Payoff
          </Text>
          <ValueRow label="Outstanding Mortgage Balance" value={inputs.mortgageBalance} currency />
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#6b7280' }}>
            Clears remaining housing loans so your household can stay in the home without a large monthly payment.
          </Text>
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2563eb' }}>
            Education Fund
          </Text>
          <ValueRow label="Future Education Costs" value={inputs.educationCosts} currency />
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#6b7280' }}>
            Sets aside money for college, trade school, or other education goals so plans stay on track.
          </Text>
        </View>

        <View style={{ padding: 10, backgroundColor: '#f3f4f6', marginVertical: 10 }}>
          <ValueRow 
            label="Total coverage target" 
            value={results.dimeTotal} 
            currency 
            highlight 
            primary 
          />
          <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 5 }}>
            Sum of Debt + Income replacement + Mortgage + Education. This is the total amount of protection the calculator suggests.
          </Text>
        </View>
      </Section>

      <Divider />

      {/* Coverage Analysis */}
      <Section title="Coverage Gap Analysis">
        <ValueRow label="Recommended Coverage Target" value={results.dimeTotal} currency />
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
            `You currently have a coverage gap of ${formatCurrency(results.additionalNeeded)}. Adding this amount of coverage would let your family pay debts, replace income, and pursue future goals without financial strain.`
          ) : results.additionalNeeded < 0 ? (
            `You have a coverage surplus of ${formatCurrency(Math.abs(results.additionalNeeded))}. Your existing policies already exceed what the calculator suggests, so you could review whether the extra protection still fits your goals.`
          ) : (
            "Your current coverage matches the DIME estimate. Continue reviewing it each year or after major life changes."
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
            • Provides coverage for a set period (commonly 10–30 years) with lower premiums.
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Works well for needs that end over time, such as mortgages or raising children.
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#374151' }}>
            • Pure protection—no savings or investment component.
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Permanent Life Insurance
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Offers lifelong coverage with higher premiums.
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Builds cash value that you can borrow from or withdraw.
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#374151' }}>
            • Includes whole life, universal life, and variable life options.
          </Text>
        </View>

        <Note>
          For most families, term life insurance delivers the most coverage for the money during the years when financial
          protection is most critical.
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
              • Shop for about {formatCurrency(results.additionalNeeded)} in added life insurance coverage.
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
              • Consider term life insurance for cost-effective coverage.
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
              • Get quotes from multiple insurance providers.
            </Text>
          </View>
        )}

        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • Review and update beneficiary designations on all policies.
        </Text>

        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • Consider the impact of inflation on future education and living costs.
        </Text>

        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • Evaluate employer-provided life insurance as a starting point.
        </Text>

        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • Review your coverage annually or after major life events.
        </Text>

        <Text style={{ fontSize: 9, color: '#374151' }}>
          • Consult with a licensed insurance professional for personalized advice.
        </Text>
      </Section>

      <Divider />

      {/* Important Disclaimers */}
      <Section title="Important Considerations">
        <Note>
          The DIME method offers a helpful baseline, but your actual needs may vary based on savings, Social Security survivor
          benefits, your spouse’s income, family size, and personal financial goals. This report is educational—please consult a
          licensed professional before making policy decisions.
        </Note>

        <Text style={{ fontSize: 8, marginTop: 8, color: '#6b7280' }}>
          Also think about emergency savings, retirement accounts, estate-planning wishes, and any inheritance you expect. As
          debts shrink and savings grow, the amount of life insurance you need often decreases.
        </Text>
      </Section>
    </BaseDocument>
  );
};
