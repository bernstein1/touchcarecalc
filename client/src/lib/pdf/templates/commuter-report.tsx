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
      <Section title="2025 Benefit Limits & Tax Calculations">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          Federal law allows pre-tax deductions for qualified transportation expenses up to monthly limits.
        </Text>
        
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Transit Benefits (Bus, Train, Subway, Ferry, Vanpool)
          </Text>
          <ValueRow label="Your Monthly Transit Cost" value={inputs.transitCost} currency />
          <ValueRow label="2025 Monthly Limit" value={315} currency />
          <ValueRow 
            label="Eligible Monthly Amount" 
            value={Math.min(inputs.transitCost, 315)} 
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
            Parking Benefits (Workplace Parking)
          </Text>
          <ValueRow label="Your Monthly Parking Cost" value={inputs.parkingCost} currency />
          <ValueRow label="2025 Monthly Limit" value={315} currency />
          <ValueRow 
            label="Eligible Monthly Amount" 
            value={Math.min(inputs.parkingCost, 315)} 
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
      <Section title="Eligible Transportation Expenses">
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Qualified Transit Expenses Include:
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Bus, subway, train, and ferry fares
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Vanpool transportation to/from work
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Transit passes and tokens
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#374151' }}>
            • Stored value cards for transit systems
          </Text>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Qualified Parking Expenses Include:
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Parking at or near your workplace
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Parking at transit facilities for commuting
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 8, color: '#374151' }}>
            • Monthly or daily parking fees
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#dc2626' }}>
            Non-Eligible Expenses:
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Tolls and gas for personal vehicles
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Parking for personal errands or appointments
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Vehicle maintenance, insurance, or loan payments
          </Text>
          <Text style={{ fontSize: 9, color: '#374151' }}>
            • Rides from personal car services (Uber, Lyft)
          </Text>
        </View>
      </Section>

      <Divider />

      {/* Optimization Recommendations */}
      <Section title="Optimization Recommendations">
        <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
          Maximize your commuter benefit savings with these strategies:
        </Text>
        
        {inputs.transitCost > 315 && (
          <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
            • Your transit costs ({formatCurrency(inputs.transitCost)}) exceed the monthly limit. 
            Consider if any expenses could be restructured to maximize the {formatCurrency(315)} monthly benefit.
          </Text>
        )}
        
        {inputs.parkingCost > 315 && (
          <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
            • Your parking costs ({formatCurrency(inputs.parkingCost)}) exceed the monthly limit. 
            You'll save the maximum {formatCurrency((315 * (results.marginalRate / 100)) * 12)} annually on parking.
          </Text>
        )}
        
        {inputs.transitCost < 315 && inputs.parkingCost < 315 && (
          <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
            • You're well within both benefit limits. Consider if you have any additional eligible 
            transportation expenses that could be included.
          </Text>
        )}
        
        <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
          • Enroll during your company's open enrollment period or when starting employment.
        </Text>
        
        <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
          • Keep receipts and documentation for all commuter expenses in case of audit.
        </Text>
        
        <Text style={{ fontSize: 9, color: '#374151' }}>
          • Review your commuting patterns annually as routes and costs may change.
        </Text>
      </Section>

      <Divider />

      {/* Important Notes */}
      <Section title="Important Program Details">
        <Note>
          Commuter benefits are typically offered through employer-sponsored programs and may have 
          different enrollment periods and rules. The pre-tax deduction reduces both federal income 
          taxes and Social Security/Medicare taxes in most cases. State tax treatment may vary.
        </Note>
        
        <Text style={{ fontSize: 8, marginTop: 8, color: '#6b7280' }}>
          Benefits shown are based on 2025 IRS limits and your current tax bracket. Actual savings 
          may vary based on total income, state taxes, and other deductions. Consult your HR department 
          or tax advisor for specific program details and eligibility requirements.
        </Text>
      </Section>
    </BaseDocument>
  );
};