import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { calculateHSA, CONTRIBUTION_LIMITS } from "@/lib/calculations";
import { HSAInputs, HSAResults } from "@shared/schema";

interface HSAScenario {
  id: string;
  name: string;
  inputs: HSAInputs;
  results: HSAResults;
}

interface HSAComparisonProps {
  scenarios: Array<{
    id: string;
    name: string;
    data: HSAInputs;
  }>;
  onUpdateScenario: (scenarioId: string, data: HSAInputs) => void;
}

export default function HSAComparison({ scenarios, onUpdateScenario }: HSAComparisonProps) {
  const [scenarioResults, setScenarioResults] = useState<Record<string, HSAResults>>({});

  // Calculate results for all scenarios
  useEffect(() => {
    const newResults: Record<string, HSAResults> = {};
    scenarios.forEach(scenario => {
      newResults[scenario.id] = calculateHSA(scenario.data);
    });
    setScenarioResults(newResults);
  }, [scenarios]);

  const updateScenarioInput = (scenarioId: string, key: keyof HSAInputs, value: any) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      const updatedData = { ...scenario.data, [key]: value };
      onUpdateScenario(scenarioId, updatedData);
    }
  };

  const getBestValue = (metric: string, values: number[]) => {
    switch (metric) {
      case 'taxSavings':
      case 'actualContribution':
        return Math.max(...values);
      case 'effectiveCost':
        return Math.min(...values);
      default:
        return Math.max(...values);
    }
  };

  const getValueIndicator = (value: number, bestValue: number, metric: string) => {
    if (value === bestValue) {
      return <TrendingUp className="text-green-500 ml-2" size={16} />;
    }
    const isBetter = metric === 'effectiveCost' ? value < bestValue : value > bestValue;
    return isBetter ? 
      <TrendingUp className="text-green-500 ml-2" size={16} /> : 
      <TrendingDown className="text-red-500 ml-2" size={16} />;
  };

  const getLimitText = (inputs: HSAInputs) => {
    const limit = inputs.accountType === 'hsa' && inputs.coverage === 'family' 
      ? CONTRIBUTION_LIMITS.HSA_FAMILY 
      : inputs.accountType === 'fsa' 
        ? CONTRIBUTION_LIMITS.FSA 
        : CONTRIBUTION_LIMITS.HSA_INDIVIDUAL;
    
    const accountTypeText = inputs.accountType.toUpperCase();
    const coverageText = inputs.coverage === 'family' ? 'Family' : 'Individual';
    return `2025 ${coverageText} ${accountTypeText} Limit: $${limit.toLocaleString()}`;
  };

  if (scenarios.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <Calculator className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">Add scenarios above to start comparing HSA/FSA benefits.</p>
        </div>
      </GlassCard>
    );
  }

  const taxSavingsValues = scenarios.map(s => scenarioResults[s.id]?.taxSavings || 0);
  const effectiveCostValues = scenarios.map(s => scenarioResults[s.id]?.effectiveCost || 0);
  const contributionValues = scenarios.map(s => scenarioResults[s.id]?.actualContribution || 0);

  const bestTaxSavings = getBestValue('taxSavings', taxSavingsValues);
  const bestEffectiveCost = getBestValue('effectiveCost', effectiveCostValues);
  const bestContribution = getBestValue('actualContribution', contributionValues);

  return (
    <div className="space-y-8">
      {/* Results Comparison Table */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-foreground mb-6">Results Comparison</h3>
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
                <td className="p-3 font-medium text-foreground">Annual Contribution</td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.actualContribution || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`contribution-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-semibold">${value.toLocaleString()}</span>
                        {getValueIndicator(value, bestContribution, 'actualContribution')}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Tax Savings</td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.taxSavings || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`tax-savings-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-semibold text-green-600">${Math.round(value).toLocaleString()}</span>
                        {getValueIndicator(value, bestTaxSavings, 'taxSavings')}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Effective Cost</td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.effectiveCost || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`effective-cost-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">${Math.round(value).toLocaleString()}</span>
                        {getValueIndicator(value, bestEffectiveCost, 'effectiveCost')}
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
          const results = scenarioResults[scenario.id];
          const contributionLimit = results?.contributionLimit || CONTRIBUTION_LIMITS.HSA_INDIVIDUAL;
          
          return (
            <GlassCard key={scenario.id} className="space-y-6">
              <h4 className="text-lg font-semibold text-foreground border-b border-border pb-2" data-testid={`scenario-title-${scenario.id}`}>
                {scenario.name}
              </h4>

              {/* Account Type */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-3">
                  Account Type
                  <Tooltip content="HSA requires high-deductible health plan. FSA has 'use it or lose it' rules." />
                </Label>
                <RadioGroup
                  value={scenario.data.accountType}
                  onValueChange={(value) => updateScenarioInput(scenario.id, 'accountType', value as 'hsa' | 'fsa')}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className={`glass-input rounded-lg p-3 cursor-pointer transition-colors text-xs ${
                    scenario.data.accountType === 'hsa' 
                      ? 'bg-primary/20 border-primary ring-1 ring-primary/50' 
                      : 'hover:bg-primary/10'
                  }`}>
                    <RadioGroupItem value="hsa" id={`hsa-${scenario.id}`} className="sr-only" />
                    <Label htmlFor={`hsa-${scenario.id}`} className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-primary text-lg mb-1">💗</div>
                        <div className="font-medium text-foreground text-xs">HSA</div>
                      </div>
                    </Label>
                  </div>
                  <div className={`glass-input rounded-lg p-3 cursor-pointer transition-colors text-xs ${
                    scenario.data.accountType === 'fsa' 
                      ? 'bg-secondary/20 border-secondary ring-1 ring-secondary/50' 
                      : 'hover:bg-primary/10'
                  }`}>
                    <RadioGroupItem value="fsa" id={`fsa-${scenario.id}`} className="sr-only" />
                    <Label htmlFor={`fsa-${scenario.id}`} className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-secondary text-lg mb-1">📋</div>
                        <div className="font-medium text-foreground text-xs">FSA</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Coverage Level */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-3">
                  Coverage
                  <Tooltip content="Family coverage includes spouse and dependents." />
                </Label>
                <RadioGroup
                  value={scenario.data.coverage}
                  onValueChange={(value) => updateScenarioInput(scenario.id, 'coverage', value as 'individual' | 'family')}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className={`glass-input rounded-lg p-3 cursor-pointer transition-colors text-xs ${
                    scenario.data.coverage === 'individual' 
                      ? 'bg-primary/20 border-primary ring-1 ring-primary/50' 
                      : 'hover:bg-primary/10'
                  }`}>
                    <RadioGroupItem value="individual" id={`individual-${scenario.id}`} className="sr-only" />
                    <Label htmlFor={`individual-${scenario.id}`} className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-primary text-sm mb-1">👤</div>
                        <div className="font-medium text-foreground text-xs">Individual</div>
                      </div>
                    </Label>
                  </div>
                  <div className={`glass-input rounded-lg p-3 cursor-pointer transition-colors text-xs ${
                    scenario.data.coverage === 'family' 
                      ? 'bg-primary/20 border-primary ring-1 ring-primary/50' 
                      : 'hover:bg-primary/10'
                  }`}>
                    <RadioGroupItem value="family" id={`family-${scenario.id}`} className="sr-only" />
                    <Label htmlFor={`family-${scenario.id}`} className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-primary text-sm mb-1">👨‍👩‍👧‍👦</div>
                        <div className="font-medium text-foreground text-xs">Family</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Income */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Annual Income
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

              {/* Contribution */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Annual Contribution: ${scenario.data.contribution.toLocaleString()}
                </Label>
                <Slider
                  value={[scenario.data.contribution]}
                  onValueChange={(value) => updateScenarioInput(scenario.id, 'contribution', value[0])}
                  max={contributionLimit}
                  min={0}
                  step={50}
                  className="w-full"
                  data-testid={`slider-contribution-${scenario.id}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$0</span>
                  <span>${contributionLimit.toLocaleString()}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {getLimitText(scenario.data)}
                </div>
              </div>

              {/* Tax Bracket */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Tax Bracket
                </Label>
                <Select value={scenario.data.taxBracket.toString()} onValueChange={(value) => updateScenarioInput(scenario.id, 'taxBracket', parseFloat(value))}>
                  <SelectTrigger className="glass-input" data-testid={`select-tax-bracket-${scenario.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10% - Income up to $11,000</SelectItem>
                    <SelectItem value="12">12% - Income $11,000 - $44,725</SelectItem>
                    <SelectItem value="22">22% - Income $44,725 - $95,375</SelectItem>
                    <SelectItem value="24">24% - Income $95,375 - $182,050</SelectItem>
                    <SelectItem value="32">32% - Income $182,050 - $231,250</SelectItem>
                    <SelectItem value="35">35% - Income $231,250 - $578,125</SelectItem>
                    <SelectItem value="37">37% - Income over $578,125</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}