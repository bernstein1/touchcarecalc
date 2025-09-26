import { useEffect, useState } from "react";
import { Calculator, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { calculateHSA, HSA_LIMITS } from "@/lib/calculations";
import { describeFilingStatus } from "@/lib/tax/brackets";
import type { FilingStatus, HSAInputs, HSAResults } from "@shared/schema";

interface HSAComparisonProps {
  scenarios: Array<{
    id: string;
    name: string;
    data: HSAInputs;
  }>;
  onUpdateScenario: (scenarioId: string, data: HSAInputs) => void;
  onRemoveScenario: (scenarioId: string) => void;
}

const currency = (value: number) => `$${Math.round(value).toLocaleString()}`;

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: describeFilingStatus("single") },
  { value: "marriedJoint", label: describeFilingStatus("marriedJoint") },
  { value: "marriedSeparate", label: describeFilingStatus("marriedSeparate") },
  { value: "headOfHousehold", label: describeFilingStatus("headOfHousehold") },
];

export default function HSAComparison({ scenarios, onUpdateScenario, onRemoveScenario }: HSAComparisonProps) {
  const [scenarioResults, setScenarioResults] = useState<Record<string, HSAResults>>({});

  useEffect(() => {
    const next: Record<string, HSAResults> = {};
    scenarios.forEach((scenario) => {
      next[scenario.id] = calculateHSA(scenario.data);
    });
    setScenarioResults(next);
  }, [scenarios]);

  const updateScenario = (scenarioId: string, updates: Partial<HSAInputs>) => {
    const scenario = scenarios.find((item) => item.id === scenarioId);
    if (!scenario) return;

    const nextData: HSAInputs = {
      ...scenario.data,
      ...updates,
    };

    onUpdateScenario(scenarioId, nextData);
  };

  const getContributionLimit = (inputs: HSAInputs) => {
    const baseLimit = inputs.coverage === "family" ? HSA_LIMITS.family : HSA_LIMITS.individual;
    const catchUp = inputs.age >= 55 ? HSA_LIMITS.catchUp : 0;
    return baseLimit + catchUp;
  };

  const getIndicator = (value: number, bestValue: number, invert = false) => {
    const isBest = invert ? value <= bestValue : value >= bestValue;
    if (isBest) {
      return <TrendingUp className="text-green-500 ml-2" size={16} />;
    }

    const Icon = invert ? TrendingUp : TrendingDown;
    const color = invert ? "text-amber-500" : "text-red-500";
    return <Icon className={`${color} ml-2`} size={16} />;
  };

  if (scenarios.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <Calculator className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">
            Add HSA scenarios above to compare plan costs, HSA deposits, and savings in everyday language.
          </p>
        </div>
      </GlassCard>
    );
  }

  const summary = scenarios.map((scenario) => {
    const results = scenarioResults[scenario.id];
    return {
      id: scenario.id,
      name: scenario.name,
      premiumSavings: results?.annualPremiumSavings ?? 0,
      employerSeed: results?.employerContribution ?? 0,
      projectedReserve: results?.projectedReserve ?? 0,
      reserveGap: results?.reserveShortfall ?? 0,
      currentBalanceApplied: results?.appliedCurrentBalance ?? 0,
      netAdvantage: results?.netCashflowAdvantage ?? 0,
      employeeContribution: results?.employeeContribution ?? 0,
    };
  });

  const bestPremium = Math.max(...summary.map((item) => item.premiumSavings));
  const bestSeed = Math.max(...summary.map((item) => item.employerSeed));
  const bestReserve = Math.max(...summary.map((item) => item.projectedReserve));
  const bestExistingBalance = Math.max(...summary.map((item) => item.currentBalanceApplied));
  const lowestGap = Math.min(...summary.map((item) => item.reserveGap));
  const bestAdvantage = Math.max(...summary.map((item) => item.netAdvantage));

  return (
    <div className="space-y-8">
      <GlassCard>
        <h3 className="text-lg font-semibold text-foreground mb-6">Compare plan savings and HSA funding</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">What we are measuring</th>
                {summary.map((scenario) => (
                  <th key={scenario.id} className="text-center p-3 font-medium text-foreground">
                    {scenario.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Yearly premium savings versus the other plan</td>
                {summary.map((scenario) => (
                  <td key={`premium-${scenario.id}`} className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">{currency(scenario.premiumSavings)}</span>
                      {getIndicator(scenario.premiumSavings, bestPremium)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Employer HSA contribution</td>
                {summary.map((scenario) => (
                  <td key={`seed-${scenario.id}`} className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-semibold text-emerald-600">{currency(scenario.employerSeed)}</span>
                      {getIndicator(scenario.employerSeed, bestSeed)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Existing HSA dollars applied</td>
                {summary.map((scenario) => (
                  <td key={`current-${scenario.id}`} className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-semibold text-foreground">{currency(scenario.currentBalanceApplied)}</span>
                      {getIndicator(scenario.currentBalanceApplied, bestExistingBalance)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Estimated HSA balance after contributions</td>
                {summary.map((scenario) => (
                  <td key={`reserve-${scenario.id}`} className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-semibold text-foreground">{currency(scenario.projectedReserve)}</span>
                      {getIndicator(scenario.projectedReserve, bestReserve)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Estimated shortfall to your reserve goal</td>
                {summary.map((scenario) => (
                  <td key={`gap-${scenario.id}`} className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <span
                        className={`text-lg font-semibold ${scenario.reserveGap === 0 ? "text-emerald-600" : "text-destructive"}`}
                      >
                        {scenario.reserveGap === 0 ? "Goal met" : currency(scenario.reserveGap)}
                      </span>
                      {getIndicator(scenario.reserveGap, lowestGap, true)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Money left after savings and deposits</td>
                {summary.map((scenario) => (
                  <td key={`advantage-${scenario.id}`} className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-semibold text-emerald-600">{currency(scenario.netAdvantage)}</span>
                      {getIndicator(scenario.netAdvantage, bestAdvantage)}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(scenarios.length, 3)}, 1fr)` }}>
        {scenarios.map((scenario) => {
          const results = scenarioResults[scenario.id];
          const contributionLimit = getContributionLimit(scenario.data);
          const coverageLabel = scenario.data.coverage === "family" ? "Family" : "Individual";

          return (
            <GlassCard key={scenario.id} className="space-y-6" analyticsId={`hsa-scenario-${scenario.id}`}>
              <div className="flex items-start justify-between border-b border-border pb-2">
                <div>
                  <h4 className="text-lg font-semibold text-foreground">{scenario.name}</h4>
                  <p className="text-xs text-muted-foreground">{coverageLabel} HDHP scenario overview</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveScenario(scenario.id)}
                  aria-label={`Remove scenario ${scenario.name}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="grid gap-5">
                <div className="rounded-xl border border-border/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Coverage & age</Label>
                    <Tooltip
                      title="HDHP compatibility"
                      content={
                        <p>
                          Your coverage level and age decide how much the IRS lets you put in an HSA. Confirm the medical plan
                          counts as an HDHP before relying on these results.
                        </p>
                      }
                    />
                  </div>
                  <RadioGroup
                    value={scenario.data.coverage}
                    onValueChange={(value) => updateScenario(scenario.id, { coverage: value as "individual" | "family" })}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div
                      className={`glass-input rounded-lg p-3 cursor-pointer transition-colors text-xs ${
                        scenario.data.coverage === "individual" ? "bg-primary/20 border-primary ring-1 ring-primary/50" : "hover:bg-primary/10"
                      }`}
                    >
                      <RadioGroupItem value="individual" id={`coverage-individual-${scenario.id}`} className="sr-only" />
                      <Label htmlFor={`coverage-individual-${scenario.id}`} className="cursor-pointer">
                        <div className="text-center">
                          <div className="text-primary text-lg mb-1">👤</div>
                          <div className="font-medium text-foreground text-xs">Individual</div>
                        </div>
                      </Label>
                    </div>
                    <div
                      className={`glass-input rounded-lg p-3 cursor-pointer transition-colors text-xs ${
                        scenario.data.coverage === "family" ? "bg-primary/20 border-primary ring-1 ring-primary/50" : "hover:bg-primary/10"
                      }`}
                    >
                      <RadioGroupItem value="family" id={`coverage-family-${scenario.id}`} className="sr-only" />
                      <Label htmlFor={`coverage-family-${scenario.id}`} className="cursor-pointer">
                        <div className="text-center">
                          <div className="text-primary text-lg mb-1">👨‍👩‍👧‍👦</div>
                          <div className="font-medium text-foreground text-xs">Family</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Participant age</Label>
                      <Input
                        type="number"
                        min={18}
                        value={scenario.data.age}
                        onChange={(event) => updateScenario(scenario.id, { age: Number(event.target.value) || 0 })}
                      />
                    </div>
                    <div className="rounded-lg bg-primary/5 border border-dashed border-primary/40 p-3 text-xs text-muted-foreground">
                      <p>2025 limit: {currency(contributionLimit)}</p>
                      <p>{scenario.data.age >= 55 ? "Includes the $1,000 catch-up for age 55+" : "Add $1,000 more once you turn 55"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Premium comparison</Label>
                    <Tooltip
                      title="Premium offsets"
                      content={
                        <p>
                          Track how much cheaper the HDHP is each month. Redirect that savings to your HSA so the deductible is
                          covered before any claims arrive.
                        </p>
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">HDHP monthly premium</Label>
                      <Input
                        type="number"
                        min={0}
                        value={scenario.data.hdhpMonthlyPremium}
                        onChange={(event) => updateScenario(scenario.id, { hdhpMonthlyPremium: Number(event.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Alternative plan premium</Label>
                      <Input
                        type="number"
                        min={0}
                        value={scenario.data.altPlanMonthlyPremium}
                        onChange={(event) => updateScenario(scenario.id, { altPlanMonthlyPremium: Number(event.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-secondary/10 border border-dashed border-secondary/40 p-3 text-xs text-muted-foreground">
                    <p>Annual premium savings: {currency(results?.annualPremiumSavings ?? 0)}</p>
                    <p>Money left after inflows and deposits: {currency(results?.netCashflowAdvantage ?? 0)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Build the deductible reserve</Label>
                    <Tooltip
                      title="Employer contributions"
                      content={
                        <p>
                          Employer contributions can bridge the deductible faster. Combine them with your payroll deposits to
                          reach the reserve target before high-cost claims appear.
                        </p>
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Employer contribution</Label>
                      <Input
                        type="number"
                        min={0}
                        value={scenario.data.employerSeed}
                        onChange={(event) => updateScenario(scenario.id, { employerSeed: Number(event.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Target reserve</Label>
                      <Input
                        type="number"
                        min={0}
                        value={scenario.data.targetReserve}
                        onChange={(event) => updateScenario(scenario.id, { targetReserve: Number(event.target.value) || 0 })}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <Label className="text-xs uppercase text-muted-foreground">Current HSA balance</Label>
                        <Input
                          type="number"
                          min={0}
                          value={scenario.data.currentBalance ?? 0}
                          onChange={(event) => updateScenario(scenario.id, { currentBalance: Number(event.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                        <div>
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Apply existing balance</p>
                          <p className="text-[11px] text-muted-foreground">
                            Turn off if you want to keep invested HSA dollars out of this year's deductible plan.
                          </p>
                        </div>
                        <Switch
                          checked={scenario.data.useCurrentBalance ?? true}
                          onCheckedChange={(checked) => updateScenario(scenario.id, { useCurrentBalance: checked })}
                          aria-label="Toggle applying current HSA balance"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground">Employee contribution</Label>
                    <Slider
                      value={[scenario.data.employeeContribution]}
                      onValueChange={(value) => updateScenario(scenario.id, { employeeContribution: value[0] })}
                      min={0}
                      max={contributionLimit}
                      step={50}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>$0</span>
                      <span>{currency(contributionLimit)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Payroll contributions planned: {currency(scenario.data.employeeContribution)} • Employer contribution:
                      {" "}
                      {currency(results?.employerContribution ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Projected reserve (incl. current balance): {currency(results?.projectedReserve ?? 0)} • Applied today:
                      {" "}
                      {currency(results?.appliedCurrentBalance ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {results?.reserveShortfall === 0 && (scenario.data.targetReserve ?? 0) > 0
                        ? `Goal met—you're already at ${currency(scenario.data.targetReserve ?? 0)}.`
                        : `Difference from your goal: ${currency(results?.reserveShortfall ?? 0)}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-foreground">Household annual income</Label>
                      <Input
                        type="number"
                        min={0}
                        value={scenario.data.annualIncome}
                        onChange={(event) => updateScenario(scenario.id, { annualIncome: Number(event.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">Filing status</Label>
                      <Select
                        value={scenario.data.filingStatus ?? 'single'}
                        onValueChange={(value: FilingStatus) => updateScenario(scenario.id, { filingStatus: value })}
                      >
                        <SelectTrigger className="glass-input">
                          <SelectValue placeholder="Select filing status" />
                        </SelectTrigger>
                        <SelectContent>
                          {FILING_STATUS_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Estimated marginal tax rate: <span className="font-semibold text-foreground">{results?.marginalRate ?? 0}%</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground">
                    <p>Tax savings: {currency(results?.taxSavings ?? 0)}</p>
                    <p>Estimated after-tax cost of the HDHP: {currency(results?.effectiveCost ?? 0)}</p>
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
