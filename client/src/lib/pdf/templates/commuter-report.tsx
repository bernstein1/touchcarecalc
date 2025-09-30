import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { BaseDocument } from '../components/base-document';
import { Section, ValueRow, MetricCard, MetricGrid, Divider, Note } from '../components/pdf-sections';
import { formatCurrency, PDFReportData } from '../pdf-utils';
import { CommuterInputs, CommuterResults } from '@shared/schema';

interface CommuterReportProps {
  data: PDFReportData & {
    inputs: CommuterInputs;
    results: CommuterResults;
  };
}

export const CommuterReport: React.FC<CommuterReportProps> = ({ data }) => {
  const { inputs, results, generatedAt } = data;
  
  return (
    <BaseDocument
      title="Commuter Benefits Analysis Report"
      subtitle="Pre-Tax Transportation Savings - Tax Year 2025"
      generatedAt={generatedAt}
    >
      {/* Executive Summary */}
      <Section title="Executive Summary">
        <MetricGrid>
          <MetricCard
            title="Total Annual Savings"
            value={results.totalSavings}
            currency
            description="Combined transit + parking tax savings"
          />
          <MetricCard
            title="Transit Savings"
            value={results.transitSavings}
            currency
            description="Annual pre-tax transit benefit"
          />
          <MetricCard
            title="Parking Savings"
            value={results.parkingSavings}
            currency
            description="Annual pre-tax parking benefit"
          />
          <MetricCard
            title="Monthly Benefit"
            value={results.totalSavings / 12}
            currency
            description="Average monthly tax savings"
          />
        </MetricGrid>
      </Section>

      <Divider />

      {/* Current Commute Profile */}
      <Section title="Current Commute Profile">
        <ValueRow label="Monthly Transit Costs" value={inputs.transitCost} currency />
        <ValueRow label="Monthly Parking Costs" value={inputs.parkingCost} currency />
        <ValueRow label="Total Monthly Commute" value={inputs.transitCost + inputs.parkingCost} currency highlight />
        <ValueRow label="Household Annual Income" value={inputs.annualIncome} currency />
        <ValueRow label="Marginal Tax Rate" value={`${results.marginalRate}%`} />
      </Section>

      <Divider />

      {/* 2025 Benefit Limits and Calculations */}
      <Section title="How the 2025 Limits Work">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          A monthly limit is the most you can move from your paycheck before taxes. For 2025 the IRS lets you set aside up to
          {` ${formatCurrency(325)}`} for transit and another {` ${formatCurrency(325)}`} for parking each month.
        </Text>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Transit rides that count (bus, train, subway, ferry, vanpool)
          </Text>
          <ValueRow label="Your Monthly Transit Cost" value={inputs.transitCost} currency />
          <ValueRow label="2025 monthly limit" value={325} currency />
          <ValueRow
            label="Amount you can set aside before taxes"
            value={Math.min(inputs.transitCost, 325)}
            currency
            primary
          />
          <ValueRow label="Annual Transit Benefit" value={results.annualTransit} currency />
          <ValueRow
            label={`Annual Tax Savings (${results.marginalRate}%)`}
            value={results.transitSavings}
            currency
            success
          />
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Parking that counts (garage or lot tied to your commute)
          </Text>
          <ValueRow label="Your Monthly Parking Cost" value={inputs.parkingCost} currency />
          <ValueRow label="2025 monthly limit" value={325} currency />
          <ValueRow
            label="Amount you can set aside before taxes"
            value={Math.min(inputs.parkingCost, 325)}
            currency
            primary
          />
          <ValueRow label="Annual Parking Benefit" value={results.annualParking} currency />
          <ValueRow
            label={`Annual Tax Savings (${results.marginalRate}%)`}
            value={results.parkingSavings}
            currency
            success
          />
        </View>

        <ValueRow 
          label="Total Annual Benefit" 
          value={results.annualTotal} 
          currency 
          highlight 
        />
        <ValueRow 
          label="Total Annual Tax Savings" 
          value={results.totalSavings} 
          currency 
          highlight 
          success 
        />
      </Section>

      <Divider />

      {/* Eligible Expenses */}
      <Section title="What Counts as an Eligible Expense">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          Eligible expenses are the commute costs directly tied to getting to work. Keep your passes and receipts—substantiation
          just means you may need to show that proof to your benefit administrator.
        </Text>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Covered transit examples
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>• Bus, subway, train, and ferry fares</Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>• Employer-sponsored or public vanpools</Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>• Monthly passes, tokens, or stored-value cards you use to commute</Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Covered parking examples
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>• Parking garages or lots next to your workplace</Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>• Parking at a transit hub you use for your commute</Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>• Monthly or daily parking passes bought for work travel</Text>
        </View>

        <View>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#dc2626' }}>
            These do not qualify
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>• Gas, tolls, or mileage for your personal car</Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>• Parking used for errands, entertainment, or personal appointments</Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>• Car payments, maintenance, or insurance</Text>
          <Text style={{ fontSize: 9, color: '#374151' }}>• Rideshare trips not connected to a vanpool program</Text>
        </View>
      </Section>

      <Divider />

      {/* Optimization Recommendations */}
      <Section title="Next Steps to Use the Benefit">
        <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
          Follow these plain-language steps to keep your commute tax savings on track:
        </Text>

        <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
          1. Confirm your monthly transit and parking costs. If they are above {formatCurrency(325)}, you will still get the
          maximum tax-free amount and pay the rest with normal taxed pay.
        </Text>

        <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
          2. Enroll or update your election through your employer's commuter program and pick amounts up to the monthly limits.
          Adjust during open enrollment or when your costs change.
        </Text>

        <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
          3. Use the benefit card or submit receipts quickly. Substantiation is simply proving the expense was for your commute,
          so upload tickets, invoices, or parking statements as you receive them.
        </Text>

        <Text style={{ fontSize: 9, color: '#374151' }}>
          4. Recheck your commute once or twice a year to make sure the deduction still matches your real costs.
        </Text>
      </Section>

      <Divider />

      {/* Important Notes */}
      <Section title="Important Program Details">
        <Note>
          Commuter benefits come through your employer, so enrollment windows, payment cards, and deadlines can differ. The
          pre-tax deduction usually lowers federal income and Social Security/Medicare taxes, but some states tax the benefit.
        </Note>

        <Text style={{ fontSize: 8, marginTop: 8, color: '#6b7280' }}>
          The savings in this report use the 2025 IRS limits and the tax rate you entered. Your results can change if your pay or
          state rules are different. Check with your HR team or a tax professional for the exact steps to join and stay compliant.
        </Text>
      </Section>
    </BaseDocument>
  );
};