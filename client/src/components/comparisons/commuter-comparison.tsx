import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Calculator, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { calculateCommuter, CONTRIBUTION_LIMITS } from "@/lib/calculations";
import { describeFilingStatus } from "@/lib/tax/brackets";
import { CommuterInputs, CommuterResults, FilingStatus } from "@shared/schema";

interface CommuterScenario {
  id: string;
  name: string;
  inputs: CommuterInputs;
  results: CommuterResults;
}

interface CommuterComparisonProps {
  scenarios: Array<{
    id: string;
    name: string;
    data: CommuterInputs;
  }>;
  onUpdateScenario: (scenarioId: string, data: CommuterInputs) => void;
  onRemoveScenario: (scenarioId: string) => void;
}

export default function CommuterComparison({ scenarios, onUpdateScenario, onRemoveScenario }: CommuterComparisonProps) {
  const [scenarioResults, setScenarioResults] = useState<Record<string, CommuterResults>>({});

  const filingStatusOptions: { value: FilingStatus; label: string }[] = [
    { value: "single", label: describeFilingStatus("single") },
    { value: "marriedJoint", label: describeFilingStatus("marriedJoint") },
    { value: "marriedSeparate", label: describeFilingStatus("marriedSeparate") },
    { value: "headOfHousehold", label: describeFilingStatus("headOfHousehold") },
  ];

  // Calculate results for all scenarios
  useEffect(() => {
    const newResults: Record<string, CommuterResults> = {};
    scenarios.forEach(scenario => {
      newResults[scenario.id] = calculateCommuter(scenario.data);
    });
    setScenarioResults(newResults);
  }, [scenarios]);

  const updateScenarioInput = (scenarioId: string, key: keyof CommuterInputs, value: any) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      const updatedData = { ...scenario.data, [key]: value };
      onUpdateScenario(scenarioId, updatedData);
    }
  };

  const getBestValue = (metric: string, values: number[]) => {
    // For commuter benefits, higher savings are always better
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
          <p className="text-muted-foreground">Add scenarios above to start comparing commuter benefits.</p>
        </div>
      </GlassCard>
    );
  }

  const totalSavingsValues = scenarios.map(s => scenarioResults[s.id]?.totalSavings || 0);
  const transitSavingsValues = scenarios.map(s => scenarioResults[s.id]?.transitSavings || 0);
  const parkingSavingsValues = scenarios.map(s => scenarioResults[s.id]?.parkingSavings || 0);

  const bestTotalSavings = getBestValue('totalSavings', totalSavingsValues);
  const bestTransitSavings = getBestValue('transitSavings', transitSavingsValues);
  const bestParkingSavings = getBestValue('parkingSavings', parkingSavingsValues);

  return (
    <div className="space-y-8">
      {/* Results Comparison Table */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-foreground mb-6">Savings You Keep Each Year</h3>
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
                <td className="p-3 font-medium text-foreground">Annual Transit Savings</td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.transitSavings || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`transit-savings-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-semibold text-green-600">${Math.round(value).toLocaleString()}</span>
                        {getValueIndicator(value, bestTransitSavings, 'transitSavings')}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Annual Parking Savings</td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.parkingSavings || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`parking-savings-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-semibold text-green-600">${Math.round(value).toLocaleString()}</span>
                        {getValueIndicator(value, bestParkingSavings, 'parkingSavings')}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Total Annual Savings</td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.totalSavings || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`total-savings-${scenario.id}`}>
                      <div className="flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">${Math.round(value).toLocaleString()}</span>
                        {getValueIndicator(value, bestTotalSavings, 'totalSavings')}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Additional Results Details */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-foreground mb-6">What You Spend On Commuting</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Details</th>
                {scenarios.map(scenario => (
                  <th key={scenario.id} className="text-center p-3 font-medium text-foreground">
                    {scenario.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Annual Transit Spending</td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.annualTransit || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`annual-transit-${scenario.id}`}>
                      <span className="text-foreground">${value.toLocaleString()}</span>
                    </td>
                  );
                })}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Annual Parking Spending</td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.annualParking || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`annual-parking-${scenario.id}`}>
                      <span className="text-foreground">${value.toLocaleString()}</span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Total Annual Spending</td>
                {scenarios.map(scenario => {
                  const result = scenarioResults[scenario.id];
                  const value = result?.annualTotal || 0;
                  return (
                    <td key={scenario.id} className="p-3 text-center" data-testid={`annual-total-${scenario.id}`}>
                      <span className="font-semibold text-foreground">${value.toLocaleString()}</span>
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

              {/* Monthly Transit Cost */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-3">
                  Monthly Transit Cost
                  <Tooltip content="Eligible expenses are the bus, train, subway, ferry, or employer vanpool rides you take to get to work. In 2026 you can move up to $340 per month from your paycheck before taxes for these rides; extra costs are paid with normal taxed pay." />
                </Label>
                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      className="glass-input pl-8"
                      value={scenario.data.transitCost}
                      onChange={(e) => updateScenarioInput(scenario.id, 'transitCost', parseFloat(e.target.value) || 0)}
                      max={CONTRIBUTION_LIMITS.COMMUTER_TRANSIT}
                      data-testid={`input-transit-${scenario.id}`}
                    />
                  </div>
                  <div>
                    <Slider
                      value={[scenario.data.transitCost]}
                      onValueChange={(value) => updateScenarioInput(scenario.id, 'transitCost', value[0])}
                      max={CONTRIBUTION_LIMITS.COMMUTER_TRANSIT}
                      min={0}
                      step={5}
                      className="w-full"
                      data-testid={`slider-transit-${scenario.id}`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>$0</span>
                      <span>${CONTRIBUTION_LIMITS.COMMUTER_TRANSIT}/month tax-free cap</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Parking Cost */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-3">
                  Monthly Parking Cost
                  <Tooltip content="Eligible parking means spots connected to your commute, like the lot at your office or the garage by the train station. You can set aside up to $340 per month before taxes in 2026; parking beyond that amount is treated like regular pay." />
                </Label>
                <div className="space-y-3">
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      className="glass-input pl-8"
                      value={scenario.data.parkingCost}
                      onChange={(e) => updateScenarioInput(scenario.id, 'parkingCost', parseFloat(e.target.value) || 0)}
                      max={CONTRIBUTION_LIMITS.COMMUTER_PARKING}
                      data-testid={`input-parking-${scenario.id}`}
                    />
                  </div>
                  <div>
                    <Slider
                      value={[scenario.data.parkingCost]}
                      onValueChange={(value) => updateScenarioInput(scenario.id, 'parkingCost', value[0])}
                      max={CONTRIBUTION_LIMITS.COMMUTER_PARKING}
                      min={0}
                      step={5}
                      className="w-full"
                      data-testid={`slider-parking-${scenario.id}`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>$0</span>
                      <span>${CONTRIBUTION_LIMITS.COMMUTER_PARKING}/month tax-free cap</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Income & Filing */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Household annual income</Label>
                  <Input
                    type="number"
                    className="glass-input"
                    min={0}
                    value={scenario.data.annualIncome}
                    onChange={(event) => updateScenarioInput(scenario.id, 'annualIncome', Number(event.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Filing status</Label>
                  <Select
                    value={scenario.data.filingStatus ?? 'single'}
                    onValueChange={(value: FilingStatus) => updateScenarioInput(scenario.id, 'filingStatus', value)}
                  >
                    <SelectTrigger className="glass-input" data-testid={`select-tax-bracket-${scenario.id}`}>
                      <SelectValue placeholder="Select filing status" />
                    </SelectTrigger>
                    <SelectContent>
                      {filingStatusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated marginal tax rate:{' '}
                  <span className="font-semibold text-foreground">{scenarioResults[scenario.id]?.marginalRate ?? 0}%</span>
                </p>
              </div>

              {/* Quick Summary */}
              <div className="bg-background/50 rounded-lg p-4 space-y-2">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Monthly Snapshot</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Transit:</span>
                    <span className="font-medium">${scenario.data.transitCost}/month</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Parking:</span>
                    <span className="font-medium">${scenario.data.parkingCost}/month</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-1">
                    <span>Total:</span>
                    <span className="font-semibold">${scenario.data.transitCost + scenario.data.parkingCost}/month</span>
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
