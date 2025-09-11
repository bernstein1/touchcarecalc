import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { calculateLifeInsurance } from "@/lib/calculations";
import { LifeInsuranceInputs, LifeInsuranceResults } from "@shared/schema";

interface LifeInsuranceComparisonProps {
  scenarios: Array<{
    id: string;
    name: string;
    data: LifeInsuranceInputs;
  }>;
  onUpdateScenario: (scenarioId: string, data: LifeInsuranceInputs) => void;
}

export default function LifeInsuranceComparison({ scenarios, onUpdateScenario }: LifeInsuranceComparisonProps) {
  const [scenarioResults, setScenarioResults] = useState<Record<string, LifeInsuranceResults>>({});

  // Calculate results for all scenarios
  useEffect(() => {
    const newResults: Record<string, LifeInsuranceResults> = {};
    scenarios.forEach(scenario => {
      newResults[scenario.id] = calculateLifeInsurance(scenario.data);
    });
    setScenarioResults(newResults);
  }, [scenarios]);

  const updateScenarioInput = (scenarioId: string, key: keyof LifeInsuranceInputs, value: any) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      const updatedData = { ...scenario.data, [key]: value };
      onUpdateScenario(scenarioId, updatedData);
    }
  };

  const getValueIndicator = (value: number, values: number[], isHigherBetter: boolean = true) => {
    const sortedValues = [...values].sort((a, b) => isHigherBetter ? b - a : a - b);
    const bestValue = sortedValues[0];
    const worstValue = sortedValues[sortedValues.length - 1];
    
    if (value === bestValue) {
      return <TrendingUp className="text-green-500 ml-2" size={16} />;
    } else if (value === worstValue && values.length > 2) {
      return <TrendingDown className="text-red-500 ml-2" size={16} />;
    }
    return null;
  };

  if (scenarios.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <Calculator className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">Add scenarios above to start comparing life insurance needs.</p>
        </div>
      </GlassCard>
    );
  }

  const dimeTotalValues = scenarios.map(s => scenarioResults[s.id]?.dimeTotal || 0);
  const additionalNeededValues = scenarios.map(s => scenarioResults[s.id]?.additionalNeeded || 0);
  const incomeReplacementValues = scenarios.map(s => scenarioResults[s.id]?.incomeReplacement || 0);

  return (
    <div className="space-y-8">
      {/* Results Comparison Table */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-foreground mb-6">DIME Analysis Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Metric</th>
                {scenarios.map(scenario => (
                  <th key={scenario.id} className="text-center p-3 font-medium text-foreground" data-testid={`header-${scenario.id}`}>
                    {scenario.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">
                  Total DIME Coverage Need
                  <div className="text-xs text-muted-foreground font-normal">Debt + Income + Mortgage + Education</div>
                </td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.dimeTotal || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`dime-total-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">${value.toLocaleString()}</span>
                        {getValueIndicator(value, dimeTotalValues, false)}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">
                  Income Replacement Value
                  <div className="text-xs text-muted-foreground font-normal">Annual Income × Years</div>
                </td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.incomeReplacement || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`income-replacement-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-semibold text-secondary">${value.toLocaleString()}</span>
                        {getValueIndicator(value, incomeReplacementValues, false)}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">
                  Additional Coverage Needed
                  <div className="text-xs text-muted-foreground font-normal">DIME Total - Current Coverage</div>
                </td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.additionalNeeded || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`additional-needed-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className={`text-xl font-bold ${value > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          ${value > 0 ? value.toLocaleString() : '0'}
                        </span>
                        {value > 0 && getValueIndicator(value, additionalNeededValues, false)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Side-by-Side Parameter Controls */}
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(scenarios.length, 3)}, 1fr)` }}>
        {scenarios.map(scenario => {
          return (
            <GlassCard key={scenario.id} className="space-y-6">
              <h4 className="text-lg font-semibold text-foreground border-b border-border pb-2" data-testid={`scenario-title-${scenario.id}`}>
                {scenario.name}
              </h4>

              {/* Annual Income */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Annual Income
                  <Tooltip content="Your current gross annual income before taxes." />
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    className="glass-input pl-8"
                    value={scenario.data.income}
                    onChange={(e) => updateScenarioInput(scenario.id, 'income', parseFloat(e.target.value) || 0)}
                    data-testid={`input-income-${scenario.id}`}
                  />
                </div>
              </div>

              {/* Income Replacement Years */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Income Replacement Years: {scenario.data.incomeYears}
                </Label>
                <Slider
                  value={[scenario.data.incomeYears]}
                  onValueChange={(value) => updateScenarioInput(scenario.id, 'incomeYears', value[0])}
                  max={30}
                  min={1}
                  step={1}
                  className="w-full"
                  data-testid={`slider-income-years-${scenario.id}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 year</span>
                  <span>30 years</span>
                </div>
              </div>

              {/* Total Debt */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Total Debt (excluding mortgage)
                  <Tooltip content="Credit cards, car loans, student loans, and other debts excluding mortgage." />
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    className="glass-input pl-8"
                    value={scenario.data.totalDebt}
                    onChange={(e) => updateScenarioInput(scenario.id, 'totalDebt', parseFloat(e.target.value) || 0)}
                    data-testid={`input-total-debt-${scenario.id}`}
                  />
                </div>
              </div>

              {/* Mortgage Balance */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Mortgage Balance
                  <Tooltip content="Remaining balance on your primary mortgage." />
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    className="glass-input pl-8"
                    value={scenario.data.mortgageBalance}
                    onChange={(e) => updateScenarioInput(scenario.id, 'mortgageBalance', parseFloat(e.target.value) || 0)}
                    data-testid={`input-mortgage-${scenario.id}`}
                  />
                </div>
              </div>

              {/* Education Costs */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Future Education Costs
                  <Tooltip content="Estimated costs for children's college education or other educational expenses." />
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    className="glass-input pl-8"
                    value={scenario.data.educationCosts}
                    onChange={(e) => updateScenarioInput(scenario.id, 'educationCosts', parseFloat(e.target.value) || 0)}
                    data-testid={`input-education-${scenario.id}`}
                  />
                </div>
              </div>

              {/* Current Insurance */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Current Life Insurance Coverage
                  <Tooltip content="Your existing life insurance coverage amount." />
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    className="glass-input pl-8"
                    value={scenario.data.currentInsurance}
                    onChange={(e) => updateScenarioInput(scenario.id, 'currentInsurance', parseFloat(e.target.value) || 0)}
                    data-testid={`input-current-insurance-${scenario.id}`}
                  />
                </div>
              </div>

              {/* DIME Breakdown */}
              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">DIME Breakdown</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Debt:</span>
                    <span className="font-medium">${scenario.data.totalDebt.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income ({scenario.data.incomeYears}yr):</span>
                    <span className="font-medium">${(scenario.data.income * scenario.data.incomeYears).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mortgage:</span>
                    <span className="font-medium">${scenario.data.mortgageBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Education:</span>
                    <span className="font-medium">${scenario.data.educationCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 font-semibold">
                    <span>Total Need:</span>
                    <span>${(scenario.data.totalDebt + scenario.data.income * scenario.data.incomeYears + scenario.data.mortgageBalance + scenario.data.educationCosts).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}