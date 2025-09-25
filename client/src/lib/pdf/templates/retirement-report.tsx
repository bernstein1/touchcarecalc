import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { BaseDocument } from '../components/base-document';
import { Section, ValueRow, MetricCard, MetricGrid, Divider, Note } from '../components/pdf-sections';
import { formatCurrency, formatPercentage, PDFReportData } from '../pdf-utils';
import { RetirementInputs, RetirementResults } from '@shared/schema';

interface RetirementReportProps {
  data: PDFReportData & {
    inputs: RetirementInputs;
    results: RetirementResults;
  };
}

export const RetirementReport: React.FC<RetirementReportProps> = ({ data }) => {
  const { inputs, results, generatedAt } = data;

  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const catchupEligible = inputs.currentAge >= 50;
  const currentLimit = catchupEligible ? 30500 : 23000;
  const sliderTraditionalShare = inputs.bothSplitTraditional ?? 50;
  const effectiveTraditionalShare = results.totalContributions > 0
    ? Math.round((results.totalTraditionalContributions / results.totalContributions) * 100)
    : sliderTraditionalShare;
  const effectiveRothShare = Math.max(0, 100 - effectiveTraditionalShare);
  const contributionTypeLabel = inputs.contributionType === 'both'
    ? 'Traditional + Roth'
    : inputs.contributionType === 'traditional'
      ? 'Traditional (Pre-tax)'
      : 'Roth (After-tax)';
  const contributionMixDescription = inputs.contributionType === 'both'
    ? `Traditional ${effectiveTraditionalShare}% / Roth ${effectiveRothShare}% mix`
    : contributionTypeLabel;
  const sliderMixDescription = `Traditional ${sliderTraditionalShare}% / Roth ${100 - sliderTraditionalShare}%`;
  const taxSavingsDescription = results.taxSavings > 0
    ? contributionMixDescription
    : inputs.contributionType === 'roth'
      ? 'Roth contributions are taxed now, so no current tax savings'
      : contributionMixDescription;

  return (
    <BaseDocument
      title="401(k) Retirement Planning Report"
      subtitle={`${yearsToRetirement}-Year Projection Analysis`}
      generatedAt={generatedAt}
    >
      {/* Executive Summary */}
      <Section title="Executive Summary">
        <MetricGrid>
          <MetricCard
            title="Projected Balance"
            value={results.finalBalance}
            currency
            description={`At age ${inputs.retirementAge}`}
          />
          <MetricCard
            title="Total Contributions"
            value={results.totalContributions + results.employerContributions}
            currency
            description="Employee + Employer"
          />
          <MetricCard
            title="Investment Growth"
            value={results.investmentGrowth}
            currency
            description="Compound interest earned"
          />
          <MetricCard
            title="Annual Tax Savings"
            value={results.taxSavings}
            currency
            description={taxSavingsDescription}
          />
        </MetricGrid>
      </Section>

      <Divider />

      {/* Personal Profile */}
      <Section title="Personal Profile & Timeline">
        <ValueRow label="Current Age" value={`${inputs.currentAge} years`} />
        <ValueRow label="Planned Retirement Age" value={`${inputs.retirementAge} years`} />
        <ValueRow label="Years to Retirement" value={`${yearsToRetirement} years`} />
        <ValueRow label="Current Salary" value={inputs.currentSalary} currency />
        <ValueRow label="Current 401(k) Balance" value={inputs.currentSavings} currency />
        <ValueRow label="Expected Annual Salary Growth" value={inputs.salaryGrowth} percentage />
        <ValueRow label="Expected Annual Return" value={inputs.expectedReturn} percentage />
      </Section>

      <Divider />

      {/* Contribution Strategy */}
      <Section title="Contribution Strategy">
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Employee Contribution Details
          </Text>
          <ValueRow label="Contribution Percentage" value={`${inputs.employeeContribution}%`} />
          <ValueRow label="Current Monthly Contribution" value={results.monthlyContribution} currency />
          <ValueRow label="Contribution Type" value={contributionTypeLabel} />
          {inputs.contributionType === 'both' && (
            <>
              <ValueRow label="Selected Split" value={sliderMixDescription} />
              <ValueRow label="Effective Allocation" value={`Traditional ${effectiveTraditionalShare}% / Roth ${effectiveRothShare}%`} />
            </>
          )}
          <ValueRow label="2025 Annual Limit" value={currentLimit} currency />
          {catchupEligible && (
            <Text style={{ fontSize: 9, color: '#059669', marginTop: 5 }}>
              ✓ Age 50+ catch-up contribution eligible (+$7,500)
            </Text>
          )}
        </View>

        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Employer Match Details
          </Text>
          <ValueRow label="Employer Match Rate" value={`${inputs.employerMatch}%`} />
          <ValueRow label="Match Cap" value={`${inputs.employerMatchCap}% of salary`} />
          <ValueRow label="Annual Employer Contribution" value={results.employerContributions / yearsToRetirement} currency />
        </View>

        {results.taxSavings > 0 && (
          <View style={{ padding: 10, backgroundColor: '#f3f4f6', marginVertical: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5, color: '#1f2937' }}>
              Tax Benefits (Traditional 401k)
            </Text>
            <ValueRow label="Annual Tax Savings" value={results.taxSavings} currency />
            <ValueRow label="Effective Tax Rate" value={inputs.taxBracket} percentage />
            <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 5 }}>
              Traditional contributions reduce current taxable income
            </Text>
          </View>
        )}
      </Section>

      <Divider />

      {/* Detailed Projections */}
      <Section title="Growth Projection Breakdown">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          This analysis assumes consistent contributions with salary growth and compound returns over {yearsToRetirement} years.
        </Text>
        
        <ValueRow label="Starting Balance" value={inputs.currentSavings} currency />
        <ValueRow label="Total Employee Contributions" value={results.totalContributions} currency />
        {inputs.contributionType === 'both' && (
          <>
            <ValueRow label="Traditional Portion" value={results.totalTraditionalContributions} currency />
            <ValueRow label="Roth Portion" value={results.totalRothContributions} currency />
          </>
        )}
        <ValueRow label="Total Employer Contributions" value={results.employerContributions} currency />
        <ValueRow label="Investment Growth" value={results.investmentGrowth} currency primary />
        <ValueRow 
          label="Final Projected Balance" 
          value={results.finalBalance} 
          currency 
          highlight 
          success 
        />

        <View style={{ marginTop: 15 }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
            Key Growth Drivers:
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Compound Interest: ${results.investmentGrowth.toLocaleString()} ({formatPercentage((results.investmentGrowth / results.finalBalance) * 100)} of total)
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Your Contributions: ${results.totalContributions.toLocaleString()} ({formatPercentage((results.totalContributions / results.finalBalance) * 100)} of total)
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Employer Match: ${results.employerContributions.toLocaleString()} ({formatPercentage((results.employerContributions / results.finalBalance) * 100)} of total)
          </Text>
          <Text style={{ fontSize: 9, color: '#374151' }}>
            • Starting Balance: ${inputs.currentSavings.toLocaleString()} ({formatPercentage((inputs.currentSavings / results.finalBalance) * 100)} of total)
          </Text>
        </View>
      </Section>

      <Divider />

      {/* Milestone Projections */}
      <Section title="Key Milestones">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          Important milestones in your retirement journey:
        </Text>
        
        {results.yearlyProjections.length > 0 && (
          <View>
            {/* Show projections for key years */}
            {[5, 10, 15, 20, 25].map(yearMark => {
              const projection = results.yearlyProjections.find((p: { year: number; balance: number }) => p.year === yearMark);
              if (projection && yearMark <= yearsToRetirement) {
                return (
                  <ValueRow 
                    key={yearMark}
                    label={`Year ${yearMark} (Age ${inputs.currentAge + yearMark})`} 
                    value={projection.balance} 
                    currency 
                  />
                );
              }
              return null;
            }).filter(Boolean)}
          </View>
        )}
      </Section>

      <Divider />

      {/* Retirement Income Estimates */}
      <Section title="Retirement Income Projections">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          Estimated annual income from your 401(k) in retirement using common withdrawal strategies:
        </Text>
        
        <ValueRow 
          label="4% Rule (Conservative)" 
          value={results.finalBalance * 0.04} 
          currency 
          description="Safe withdrawal rate"
        />
        <ValueRow 
          label="5% Withdrawal" 
          value={results.finalBalance * 0.05} 
          currency 
          description="Moderate withdrawal rate"
        />
        <ValueRow 
          label="3.5% Rule (Very Conservative)" 
          value={results.finalBalance * 0.035} 
          currency 
          description="Ultra-safe withdrawal rate"
        />
        
        <Note>
          The 4% rule suggests withdrawing 4% annually from retirement savings. These are estimates only 
          and actual withdrawal rates should be determined with a financial advisor based on your 
          complete retirement picture including Social Security, pensions, and other assets.
        </Note>
      </Section>

      <Divider />

      {/* Optimization Recommendations */}
      <Section title="Optimization Strategies">
        <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
          Consider these strategies to maximize your retirement savings:
        </Text>
        
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5, color: '#1f2937' }}>
            Contribution Optimization:
          </Text>
          {(inputs.employeeContribution / 100) * inputs.currentSalary < currentLimit && (
            <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
              • Consider increasing contributions to reach the ${currentLimit.toLocaleString()} annual limit
            </Text>
          )}
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Increase contributions by 1% annually or with salary raises
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
            • Maximize employer match - it's "free money" with immediate 100% return
          </Text>
        </View>

        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5, color: '#1f2937' }}>
            Investment Strategy:
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Consider age-appropriate asset allocation (stocks vs. bonds)
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Review and rebalance investments annually
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
            • Minimize investment fees to maximize long-term growth
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5, color: '#1f2937' }}>
            Additional Considerations:
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Supplement with IRA contributions if eligible
          </Text>
          <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
            • Consider Roth vs. Traditional based on current and expected retirement tax rates
          </Text>
          <Text style={{ fontSize: 9, color: '#374151' }}>
            • Plan for healthcare costs and consider HSA as additional retirement vehicle
          </Text>
        </View>
      </Section>

      <Divider />

      {/* Important Assumptions */}
      <Section title="Calculation Assumptions & Disclaimers">
        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
          This analysis is based on the following assumptions:
        </Text>
        
        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • Consistent annual contributions with {formatPercentage(inputs.salaryGrowth)} salary growth
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • {formatPercentage(inputs.expectedReturn)} annual investment return (compounded annually)
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • Current employer match policy remains unchanged
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 3, color: '#374151' }}>
          • No withdrawals or loans against the account
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 8, color: '#374151' }}>
          • Tax rates and contribution limits remain at current levels
        </Text>
        
        <Note>
          This projection is for illustrative purposes only and does not guarantee future performance. 
          Actual returns will vary due to market volatility, economic conditions, and policy changes. 
          Consider consulting with a qualified financial advisor for personalized retirement planning.
        </Note>
      </Section>
    </BaseDocument>
  );
};