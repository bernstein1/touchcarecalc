import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Calculator, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { calculateRetirement, CONTRIBUTION_LIMITS } from "@/lib/calculations";
import { RetirementInputs, RetirementResults } from "@shared/schema";

interface RetirementComparisonProps {
  scenarios: Array<{
    id: string;
    name: string;
    data: RetirementInputs;
  }>;
  onUpdateScenario: (scenarioId: string, data: RetirementInputs) => void;
  onRemoveScenario: (scenarioId: string) => void;
}

export default function RetirementComparison({ scenarios, onUpdateScenario, onRemoveScenario }: RetirementComparisonProps) {
  const [scenarioResults, setScenarioResults] = useState<Record<string, RetirementResults>>({});

  // Calculate results for all scenarios
  useEffect(() => {
    const newResults: Record<string, RetirementResults> = {};
    scenarios.forEach(scenario => {
      newResults[scenario.id] = calculateRetirement(scenario.data);
    });
    setScenarioResults(newResults);
  }, [scenarios]);

  const updateScenarioInput = (scenarioId: string, key: keyof RetirementInputs, value: any) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      const updatedData = { ...scenario.data, [key]: value };
      onUpdateScenario(scenarioId, updatedData);
    }
  };

  const getBestValue = (metric: string, values: number[]) => {
    // For retirement, higher values are generally better (more savings, higher balance)
    return Math.max(...values);
  };

  const getValueIndicator = (value: number, bestValue: number, metric: string) => {
    if (value === bestValue) {
      return <TrendingUp className="text-green-500 ml-2" size={16} />;
    }
    return value > (bestValue * 0.9) ? 
      <TrendingUp className="text-green-500 ml-2" size={16} /> : 
      <TrendingDown className="text-red-500 ml-2" size={16} />;
  };

  if (scenarios.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <Calculator className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">Add scenarios above to start comparing retirement planning strategies.</p>
        </div>
      </GlassCard>
    );
  }

  const finalBalanceValues = scenarios.map(s => scenarioResults[s.id]?.finalBalance || 0);
  const totalContributionsValues = scenarios.map(s => scenarioResults[s.id]?.totalContributions || 0);
  const investmentGrowthValues = scenarios.map(s => scenarioResults[s.id]?.investmentGrowth || 0);
  const taxSavingsValues = scenarios.map(s => scenarioResults[s.id]?.taxSavings || 0);

  const bestFinalBalance = getBestValue('finalBalance', finalBalanceValues);
  const bestTotalContributions = getBestValue('totalContributions', totalContributionsValues);
  const bestInvestmentGrowth = getBestValue('investmentGrowth', investmentGrowthValues);
  const bestTaxSavings = getBestValue('taxSavings', taxSavingsValues);

  return (
    <div className="space-y-8">
      {/* Results Comparison Table */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-foreground mb-6">Retirement Projection Results</h3>
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
                  Final Balance at Retirement
                  <div className="text-xs text-muted-foreground font-normal">Age {scenarios[0]?.data.retirementAge}</div>
                </td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.finalBalance || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`final-balance-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">${value.toLocaleString()}</span>
                        {getValueIndicator(value, bestFinalBalance, 'finalBalance')}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">
                  Total Employee Contributions
                </td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.totalContributions || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`total-contributions-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-semibold text-secondary">${value.toLocaleString()}</span>
                        {getValueIndicator(value, bestTotalContributions, 'totalContributions')}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">
                  Investment Growth
                  <div className="text-xs text-muted-foreground font-normal">Compound interest earnings</div>
                </td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.investmentGrowth || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`investment-growth-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-semibold text-green-600">${value.toLocaleString()}</span>
                        {getValueIndicator(value, bestInvestmentGrowth, 'investmentGrowth')}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">
                  Lifetime Tax Savings
                  <div className="text-xs text-muted-foreground font-normal">Traditional contributions only</div>
                </td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.taxSavings || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`tax-savings-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-semibold text-accent">${value.toLocaleString()}</span>
                        {getValueIndicator(value, bestTaxSavings, 'taxSavings')}
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
          const contributionLimit = scenario.data.currentAge >= 50 ? 
            CONTRIBUTION_LIMITS.RETIREMENT_TOTAL_WITH_CATCHUP : 
            CONTRIBUTION_LIMITS.RETIREMENT_401K;
          
          return (
            <GlassCard key={scenario.id} className="space-y-6">
              <div className="flex items-start justify-between border-b border-border pb-2">
                <h4 className="text-lg font-semibold text-foreground" data-testid={`scenario-title-${scenario.id}`}>
                  {scenario.name}
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveScenario(scenario.id)}
                  aria-label={`Remove scenario ${scenario.name}`}
                  data-testid={`button-remove-scenario-${scenario.id}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              {/* Age Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Current Age
                  </Label>
                  <Input
                    type="number"
                    className="glass-input"
                    value={scenario.data.currentAge}
                    onChange={(e) => updateScenarioInput(scenario.id, 'currentAge', parseFloat(e.target.value) || 0)}
                    min={18}
                    max={100}
                    data-testid={`input-current-age-${scenario.id}`}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Retirement Age
                  </Label>
                  <Input
                    type="number"
                    className="glass-input"
                    value={scenario.data.retirementAge}
                    onChange={(e) => updateScenarioInput(scenario.id, 'retirementAge', parseFloat(e.target.value) || 0)}
                    min={50}
                    max={80}
                    data-testid={`input-retirement-age-${scenario.id}`}
                  />
                </div>
              </div>

              {/* Current Salary */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Current Annual Salary
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    className="glass-input pl-8"
                    value={scenario.data.currentSalary}
                    onChange={(e) => updateScenarioInput(scenario.id, 'currentSalary', parseFloat(e.target.value) || 0)}
                    data-testid={`input-salary-${scenario.id}`}
                  />
                </div>
              </div>

              {/* Current Savings */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Current 401(k) Balance
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    className="glass-input pl-8"
                    value={scenario.data.currentSavings}
                    onChange={(e) => updateScenarioInput(scenario.id, 'currentSavings', parseFloat(e.target.value) || 0)}
                    data-testid={`input-savings-${scenario.id}`}
                  />
                </div>
              </div>

              {/* Employee Contribution Percentage */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Employee Contribution: {scenario.data.employeeContribution}%
                </Label>
                <Slider
                  value={[scenario.data.employeeContribution]}
                  onValueChange={(value) => updateScenarioInput(scenario.id, 'employeeContribution', value[0])}
                  max={50}
                  min={0}
                  step={0.5}
                  className="w-full"
                  data-testid={`slider-employee-contribution-${scenario.id}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Employer Match */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Employer Match %
                  </Label>
                  <Input
                    type="number"
                    className="glass-input"
                    value={scenario.data.employerMatch}
                    onChange={(e) => updateScenarioInput(scenario.id, 'employerMatch', parseFloat(e.target.value) || 0)}
                    step="0.1"
                    max="200"
                    data-testid={`input-employer-match-${scenario.id}`}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Match Cap %
                  </Label>
                  <Input
                    type="number"
                    className="glass-input"
                    value={scenario.data.employerMatchCap}
                    onChange={(e) => updateScenarioInput(scenario.id, 'employerMatchCap', parseFloat(e.target.value) || 0)}
                    step="0.5"
                    max="50"
                    data-testid={`input-match-cap-${scenario.id}`}
                  />
                </div>
              </div>

              {/* Growth Assumptions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Expected Return: {scenario.data.expectedReturn}%
                  </Label>
                  <Slider
                    value={[scenario.data.expectedReturn]}
                    onValueChange={(value) => updateScenarioInput(scenario.id, 'expectedReturn', value[0])}
                    max={15}
                    min={3}
                    step={0.1}
                    className="w-full"
                    data-testid={`slider-expected-return-${scenario.id}`}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Salary Growth: {scenario.data.salaryGrowth}%
                  </Label>
                  <Slider
                    value={[scenario.data.salaryGrowth]}
                    onValueChange={(value) => updateScenarioInput(scenario.id, 'salaryGrowth', value[0])}
                    max={8}
                    min={0}
                    step={0.1}
                    className="w-full"
                    data-testid={`slider-salary-growth-${scenario.id}`}
                  />
                </div>
              </div>

              {/* Contribution Type */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-3 block">
                  Contribution Type
                </Label>
                <RadioGroup
                  value={scenario.data.contributionType}
                  onValueChange={(value) => updateScenarioInput(scenario.id, 'contributionType', value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className={`glass-input rounded-lg p-3 cursor-pointer transition-colors ${
                    scenario.data.contributionType === 'traditional' 
                      ? 'bg-primary/20 border-primary ring-1 ring-primary/50' 
                      : 'hover:bg-primary/10'
                  }`}>
                    <RadioGroupItem value="traditional" id={`traditional-${scenario.id}`} className="sr-only" />
                    <Label htmlFor={`traditional-${scenario.id}`} className="cursor-pointer">
                      <div className="text-center">
                        <div className="font-medium text-foreground text-sm">Traditional (Pre-tax)</div>
                        <div className="text-xs text-muted-foreground">Tax deferred contributions</div>
                      </div>
                    </Label>
                  </div>
                  <div className={`glass-input rounded-lg p-3 cursor-pointer transition-colors ${
                    scenario.data.contributionType === 'roth' 
                      ? 'bg-secondary/20 border-secondary ring-1 ring-secondary/50' 
                      : 'hover:bg-primary/10'
                  }`}>
                    <RadioGroupItem value="roth" id={`roth-${scenario.id}`} className="sr-only" />
                    <Label htmlFor={`roth-${scenario.id}`} className="cursor-pointer">
                      <div className="text-center">
                        <div className="font-medium text-foreground text-sm">Roth (After-tax)</div>
                        <div className="text-xs text-muted-foreground">Tax-free growth and withdrawals</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Tax Bracket */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Current Tax Bracket
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

              {/* Quick Summary */}
              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Projection Summary</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Years to Retirement:</span>
                    <span className="font-medium">{scenario.data.retirementAge - scenario.data.currentAge} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Contribution:</span>
                    <span className="font-medium">${(scenarioResults[scenario.id]?.monthlyContribution || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employer Contribution:</span>
                    <span className="font-medium">${(scenarioResults[scenario.id]?.employerContributions || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 font-semibold">
                    <span>Projected Balance:</span>
                    <span className="text-primary">${(scenarioResults[scenario.id]?.finalBalance || 0).toLocaleString()}</span>
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
