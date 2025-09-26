import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { BaseDocument } from '../components/base-document';
import { Section, ValueRow, MetricCard, MetricGrid, Divider, Note } from '../components/pdf-sections';
import { formatCurrency, ComparisonReportData } from '../pdf-utils';
import { calculateHSA, calculateFSA, calculateCommuter, calculateLifeInsurance } from '@/lib/calculations';
import { HSAResults, FSAResults, CommuterResults, LifeInsuranceResults } from '@shared/schema';

type ComparisonScenarioResults = HSAResults | FSAResults | CommuterResults | LifeInsuranceResults;
type ComparisonScenarioWithResults = Omit<ComparisonReportData['scenarios'][number], 'results'> & {
  results: ComparisonScenarioResults;
};

interface ComparisonReportProps {
  data: ComparisonReportData;
}

export const ComparisonReport: React.FC<ComparisonReportProps> = ({ data }) => {
  const { calculatorType, scenarios, generatedAt } = data;
  
  const getCalculatorTitle = (type: string) => {
    switch (type) {
      case 'hsa': return 'HSA Strategy';
      case 'fsa': return 'FSA Election';
      case 'commuter': return 'Commuter Benefits';
      case 'life-insurance': return 'Life Insurance Needs';
      default: return 'Financial Planning';
    }
  };

  const getCalculatorDescription = (type: string) => {
    switch (type) {
      case 'hsa': return 'Compare HDHP premium offsets, employer contributions, and deductible reserves';
      case 'fsa': return 'Compare election sizing, grace-period timing, and forfeiture exposure';
      case 'commuter': return 'Compare pre-tax transportation benefit scenarios';
      case 'life-insurance': return 'Compare life insurance coverage need scenarios';
      default: return 'Compare financial planning scenarios';
    }
  };

  // Calculate results for each scenario
  const scenariosWithResults: ComparisonScenarioWithResults[] = scenarios.map(scenario => {
    let results: ComparisonScenarioResults;
    switch (calculatorType) {
      case 'hsa':
        results = calculateHSA(scenario.inputs) as HSAResults;
        break;
      case 'fsa':
        results = calculateFSA(scenario.inputs) as FSAResults;
        break;
      case 'commuter':
        results = calculateCommuter(scenario.inputs) as CommuterResults;
        break;
      case 'life-insurance':
        results = calculateLifeInsurance(scenario.inputs) as LifeInsuranceResults;
        break;
      default:
        // Fallback with basic structure
        results = { totalSavings: 0, taxSavings: 0 } as any;
    }
    return { ...scenario, results };
  });

  const renderHSAComparison = () => (
    <View>
      <Section title="Tax Savings Comparison">
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
            Annual tax savings, existing balances, and reserve outlook for each scenario:
          </Text>
          {scenariosWithResults.map((scenario, index) => {
            const hsaResults = scenario.results as HSAResults;
            return (
              <View key={index} style={{ marginBottom: 10, padding: 8, backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#1f2937' }}>
                  {scenario.name}
                </Text>
                <ValueRow label="Account Type" value={(scenario.inputs.accountType ?? 'hsa').toUpperCase()} />
                <ValueRow label="Coverage" value={scenario.inputs.coverage === 'family' ? 'Family' : 'Individual'} />
                <ValueRow label="Household Annual Income" value={scenario.inputs.annualIncome} currency />
                <ValueRow label="Marginal Tax Rate" value={`${hsaResults.marginalRate}%`} />
                <ValueRow label="Annual Contribution" value={hsaResults.totalContribution ?? hsaResults.actualContribution ?? 0} currency />
                <ValueRow label="Tax Savings" value={hsaResults.taxSavings} currency success />
                <ValueRow label="Effective Cost" value={hsaResults.effectiveCost ?? 0} currency primary />
                <ValueRow label="Current HSA Balance" value={hsaResults.currentHSABalance ?? scenario.inputs.currentHSABalance ?? 0} currency />
                <ValueRow label="Projected Reserve (with current balance)" value={hsaResults.projectedReserve} currency />
                <ValueRow label="Reserve Shortfall" value={hsaResults.reserveShortfall} currency highlight />
              </View>
            );
          })}
        </View>
      </Section>
    </View>
  );

  const renderFSAComparison = () => (
    <View>
      <Section title="Use-It-or-Lose-It Outlook">
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
            Health and dependent-care FSA projections for each scenario:
          </Text>
          {scenariosWithResults.map((scenario, index) => {
            const fsaResults = scenario.results as FSAResults;
            return (
              <View key={index} style={{ marginBottom: 10, padding: 8, backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#1f2937' }}>
                  {scenario.name}
                </Text>
                <ValueRow label="Health FSA Election" value={scenario.inputs.healthElection} currency />
                <ValueRow label="Expected Utilisation" value={fsaResults.expectedUtilization} currency primary />
                <ValueRow label="Carryover Protected" value={fsaResults.carryoverProtected} currency />
                <ValueRow label="Household Annual Income" value={scenario.inputs.annualIncome} currency />
                <ValueRow label="Marginal Tax Rate" value={`${fsaResults.marginalRate}%`} />
                <ValueRow label="Grace Period Months" value={(scenario.inputs.gracePeriodMonths ?? 0).toFixed(1)} />
                <ValueRow label="Forfeiture Risk" value={fsaResults.forfeitureRisk} currency highlight />
                <ValueRow label="Net Benefit" value={fsaResults.netBenefit} currency success />
                {scenario.inputs.includeDependentCare ? (
                  <ValueRow
                    label="Dependent-care Tax Savings"
                    value={fsaResults.dependentCareTaxSavings}
                    currency
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      </Section>
    </View>
  );

  const renderCommuterComparison = () => (
    <View>
      <Section title="Transportation Savings Comparison">
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
            Annual pre-tax transportation savings for each scenario:
          </Text>
          {scenariosWithResults.map((scenario, index) => {
            const commuterResults = scenario.results as CommuterResults;
            return (
              <View key={index} style={{ marginBottom: 10, padding: 8, backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#1f2937' }}>
                  {scenario.name}
                </Text>
                <ValueRow label="Monthly Transit Cost" value={scenario.inputs.transitCost} currency />
                <ValueRow label="Monthly Parking Cost" value={scenario.inputs.parkingCost} currency />
                <ValueRow label="Household Annual Income" value={scenario.inputs.annualIncome} currency />
                <ValueRow label="Marginal Tax Rate" value={`${commuterResults.marginalRate}%`} />
                <ValueRow label="Transit Savings" value={commuterResults.transitSavings} currency />
                <ValueRow label="Parking Savings" value={commuterResults.parkingSavings} currency />
                <ValueRow label="Total Annual Savings" value={commuterResults.totalSavings} currency success />
              </View>
            );
          })}
        </View>
      </Section>
    </View>
  );

  const renderLifeInsuranceComparison = () => (
    <View>
      <Section title="Coverage Needs Comparison">
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
            Life insurance coverage recommendations using DIME methodology:
          </Text>
          {scenariosWithResults.map((scenario, index) => {
            const lifeResults = scenario.results as LifeInsuranceResults;
            return (
              <View key={index} style={{ marginBottom: 10, padding: 8, backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, color: '#1f2937' }}>
                  {scenario.name}
                </Text>
                <ValueRow label="Annual Income" value={scenario.inputs.income} currency />
                <ValueRow label="Total Debt" value={scenario.inputs.totalDebt} currency />
                <ValueRow label="Mortgage Balance" value={scenario.inputs.mortgageBalance} currency />
                <ValueRow label="Education Costs" value={scenario.inputs.educationCosts} currency />
                <ValueRow label="DIME Total" value={lifeResults.dimeTotal} currency primary />
                <ValueRow label="Current Insurance" value={scenario.inputs.currentInsurance} currency />
                <ValueRow 
                  label={lifeResults.additionalNeeded > 0 ? "Additional Needed" : "Coverage Surplus"} 
                  value={Math.abs(lifeResults.additionalNeeded)} 
                  currency 
                  success={lifeResults.additionalNeeded <= 0}
                />
              </View>
            );
          })}
        </View>
      </Section>
    </View>
  );

  const renderSummaryComparison = () => {
    if (scenariosWithResults.length === 0) {
      return null;
    }

    const getBestMetric = (scenario: ComparisonScenarioWithResults) => {
      switch (calculatorType) {
        case 'hsa': return (scenario.results as HSAResults).taxSavings;
        case 'fsa': return (scenario.results as FSAResults).netBenefit;
        case 'commuter': return (scenario.results as CommuterResults).totalSavings;
        case 'life-insurance': return (scenario.results as LifeInsuranceResults).dimeTotal;
        default: return 0;
      }
    };

    const bestScenario = scenariosWithResults.reduce<ComparisonScenarioWithResults>((best, current) => {
      return getBestMetric(current) > getBestMetric(best) ? current : best;
    }, scenariosWithResults[0]);

    const getMetricName = () => {
      switch (calculatorType) {
        case 'hsa': return 'Highest Tax Savings';
        case 'fsa': return 'Highest Net Benefit';
        case 'commuter': return 'Highest Total Savings';
        case 'life-insurance': return 'Highest Coverage Need';
        default: return 'Best Scenario';
      }
    };

    const getMetricValue = (scenario: ComparisonScenarioWithResults) => {
      switch (calculatorType) {
        case 'hsa': return (scenario.results as HSAResults).taxSavings;
        case 'fsa': return (scenario.results as FSAResults).netBenefit;
        case 'commuter': return (scenario.results as CommuterResults).totalSavings;
        case 'life-insurance': return (scenario.results as LifeInsuranceResults).dimeTotal;
        default: return 0;
      }
    };

    return (
      <Section title="Summary Analysis">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          Quick overview of scenario comparison results:
        </Text>
        
        <MetricGrid>
          <MetricCard
            title="Total Scenarios"
            value={scenarios.length}
            description="Compared scenarios"
          />
          <MetricCard
            title={getMetricName()}
            value={getMetricValue(bestScenario)}
            currency={calculatorType !== 'life-insurance'}
            description={bestScenario.name}
          />
        </MetricGrid>

        <View style={{ marginTop: 15, padding: 10, backgroundColor: '#f0f9ff' }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5, color: '#1e40af' }}>
            🏆 Recommended Scenario: {bestScenario.name}
          </Text>
          <Text style={{ fontSize: 9, color: '#374151' }}>
            {calculatorType === 'hsa' && `Provides the highest annual tax savings of ${formatCurrency((bestScenario.results as HSAResults).taxSavings)}.`}
            {calculatorType === 'fsa' && `Balances election sizing with carryover rules for a net benefit of ${formatCurrency((bestScenario.results as FSAResults).netBenefit)}.`}
            {calculatorType === 'commuter' && `Delivers the highest total annual savings of ${formatCurrency((bestScenario.results as CommuterResults).totalSavings)} on transportation costs.`}
            {calculatorType === 'life-insurance' && `Indicates the highest coverage need of ${formatCurrency((bestScenario.results as LifeInsuranceResults).dimeTotal)} based on the DIME methodology.`}
          </Text>
        </View>
      </Section>
    );
  };

  return (
    <BaseDocument
      title={`${getCalculatorTitle(calculatorType)} Comparison Report`}
      subtitle={getCalculatorDescription(calculatorType)}
      generatedAt={generatedAt}
    >
      {/* Summary */}
      {renderSummaryComparison()}

      <Divider />

      {/* Detailed Comparison by Calculator Type */}
      {calculatorType === 'hsa' && renderHSAComparison()}
      {calculatorType === 'fsa' && renderFSAComparison()}
      {calculatorType === 'commuter' && renderCommuterComparison()}
      {calculatorType === 'life-insurance' && renderLifeInsuranceComparison()}

      <Divider />

      {/* Scenario Input Details */}
      <Section title="Scenario Input Details">
        <Text style={{ fontSize: 10, marginBottom: 10, color: '#374151' }}>
          Detailed input parameters for each compared scenario:
        </Text>
        
        {scenarios.map((scenario, index) => (
          <View key={index} style={{ marginBottom: 15, padding: 8, backgroundColor: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#1f2937' }}>
              {scenario.name} - Input Parameters
            </Text>

            {Object.entries(scenario.inputs).map(([key, value]: [string, unknown]) => {
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                return Object.entries(value as Record<string, unknown>).map(([nestedKey, nestedValue]) => {
                  const nestedLabel = `${label} - ${nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`;
                  const nestedFormatted = typeof nestedValue === 'number'
                    ? (nestedKey.toLowerCase().includes('month') || nestedKey.toLowerCase().includes('rate')
                        ? nestedValue.toString()
                        : formatCurrency(nestedValue))
                    : String(nestedValue);
                  return (
                    <ValueRow
                      key={`${key}.${nestedKey}`}
                      label={nestedLabel}
                      value={nestedFormatted}
                    />
                  );
                });
              }
              const formattedValue = typeof value === 'number'
                ? (key.includes('Cost') || key.includes('Income') || key.includes('Salary') || key.includes('Debt') || key.includes('Balance') || key.includes('Savings') ? formatCurrency(value) : value.toString())
                : String(value);

              return (
                <ValueRow
                  key={key}
                  label={label}
                  value={formattedValue}
                />
              );
            })}
          </View>
        ))}
      </Section>

      <Divider />

      {/* General Recommendations */}
      <Section title="Analysis & Recommendations">
        <Text style={{ fontSize: 10, marginBottom: 8, color: '#374151' }}>
          Based on your scenario comparison, consider these strategic insights:
        </Text>
        
        <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
          • Review the recommended scenario but consider your personal circumstances and constraints
        </Text>
        
        <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
          • Consider hybrid approaches that combine beneficial elements from multiple scenarios
        </Text>
        
        <Text style={{ fontSize: 9, marginBottom: 5, color: '#374151' }}>
          • Regularly reassess your strategy as life circumstances and financial goals change
        </Text>
        
        <Text style={{ fontSize: 9, color: '#374151' }}>
          • Consult with qualified financial professionals for personalized advice
        </Text>
        
        <Note>
          This comparison analysis is based on current inputs and assumptions. Results may vary 
          based on changing regulations, market conditions, and personal circumstances. Use this 
          information as a starting point for financial planning discussions.
        </Note>
      </Section>
    </BaseDocument>
  );
};