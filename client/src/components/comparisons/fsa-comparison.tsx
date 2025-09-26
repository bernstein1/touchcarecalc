import { useEffect, useState } from "react";
import { Calculator, TrendingDown, TrendingUp, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { calculateFSA, FSA_LIMITS } from "@/lib/calculations";
import { describeFilingStatus } from "@/lib/tax/brackets";
import type { FilingStatus, FSAInputs, FSAResults } from "@shared/schema";

const currency = (value: number) => `$${Math.round(value).toLocaleString()}`;

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: describeFilingStatus("single") },
  { value: "marriedJoint", label: describeFilingStatus("marriedJoint") },
  { value: "marriedSeparate", label: describeFilingStatus("marriedSeparate") },
  { value: "headOfHousehold", label: describeFilingStatus("headOfHousehold") },
];

type ExpenseBucketKey = "routineCare" | "plannedProcedures" | "pharmacy";

type FSAComparisonInputs = FSAInputs & {
  expenseBuckets?: Record<ExpenseBucketKey, number>;
};

interface ScenarioConfig {
  id: string;
  name: string;
  data: FSAComparisonInputs;
}

interface FSAComparisonProps {
  scenarios: ScenarioConfig[];
  onUpdateScenario: (scenarioId: string, data: FSAInputs) => void;
  onRemoveScenario: (scenarioId: string) => void;
}

const DEFAULT_BUCKETS: Record<ExpenseBucketKey, number> = {
  routineCare: 0,
  plannedProcedures: 0,
  pharmacy: 0,
};

export default function FSAComparison({ scenarios, onUpdateScenario, onRemoveScenario }: FSAComparisonProps) {
  const [scenarioResults, setScenarioResults] = useState<Record<string, FSAResults>>({});

  useEffect(() => {
    const computed: Record<string, FSAResults> = {};
    scenarios.forEach((scenario) => {
      computed[scenario.id] = calculateFSA(scenario.data);
    });
    setScenarioResults(computed);
  }, [scenarios]);

  const updateScenario = (scenarioId: string, updates: Partial<FSAComparisonInputs>) => {
    const scenario = scenarios.find((item) => item.id === scenarioId);
    if (!scenario) return;

    const nextData: FSAComparisonInputs = {
      ...scenario.data,
      ...updates,
    };

    onUpdateScenario(scenarioId, nextData);
  };

  const updateBucket = (scenarioId: string, bucket: ExpenseBucketKey, value: number) => {
    const scenario = scenarios.find((item) => item.id === scenarioId);
    if (!scenario) return;

    const buckets = {
      ...DEFAULT_BUCKETS,
      ...scenario.data.expenseBuckets,
      [bucket]: Math.max(value, 0),
    };

    const expectedEligibleExpenses = Object.values(buckets).reduce((total, amount) => total + amount, 0);

    const nextData: FSAComparisonInputs = {
      ...scenario.data,
      expenseBuckets: buckets,
      expectedEligibleExpenses,
    };

    onUpdateScenario(scenarioId, nextData);
  };

  const getBuckets = (scenario: ScenarioConfig) => ({
    ...DEFAULT_BUCKETS,
    ...scenario.data.expenseBuckets,
  });

  const getMetricIndicator = (value: number, bestValue: number, invert = false) => {
    const isBest = invert ? value <= bestValue : value >= bestValue;
    if (isBest) {
      return <TrendingUp className="text-green-500 ml-2" size={16} />;
    }

    const Icon = invert ? TrendingUp : TrendingDown;
    const iconColor = invert ? "text-amber-500" : "text-red-500";

    return <Icon className={`${iconColor} ml-2`} size={16} />;
  };

  if (scenarios.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <Calculator className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">
            Add Flexible Spending Account scenarios above to compare elections, grace periods, and how much money could be forfeited.
          </p>
        </div>
      </GlassCard>
    );
  }

  const summaryMetrics = scenarios.map((scenario) => {
    const results = scenarioResults[scenario.id];
    return {
      id: scenario.id,
      name: scenario.name,
      expectedUtilization: results?.expectedUtilization ?? 0,
      carryoverProtected: results?.carryoverProtected ?? 0,
      forfeitureRisk: results?.forfeitureRisk ?? 0,
      netBenefit: results?.netBenefit ?? 0,
      taxSavings: results?.taxSavings ?? 0,
      healthElection: scenario.data.healthElection,
    };
  });

  const bestExpectedUtilization = Math.max(...summaryMetrics.map((metric) => metric.expectedUtilization));
  const bestCarryover = Math.max(...summaryMetrics.map((metric) => metric.carryoverProtected));
  const lowestForfeiture = Math.min(...summaryMetrics.map((metric) => metric.forfeitureRisk));
  const bestNetBenefit = Math.max(...summaryMetrics.map((metric) => metric.netBenefit));

  return (
    <div className="space-y-8">
      <GlassCard>
        <h3 className="text-lg font-semibold text-foreground mb-6">FSA scenario snapshot</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Metric</th>
                {summaryMetrics.map((metric) => (
                  <th key={metric.id} className="text-center p-3 font-medium text-foreground">
                    {metric.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Health FSA election</td>
                {summaryMetrics.map((metric) => (
                  <td key={`election-${metric.id}`} className="p-3 text-center">
                    {currency(metric.healthElection)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Expected spending</td>
                {summaryMetrics.map((metric) => (
                  <td key={`util-${metric.id}`} className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-semibold text-foreground">{currency(metric.expectedUtilization)}</span>
                      {getMetricIndicator(metric.expectedUtilization, bestExpectedUtilization)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Carryover or grace protection</td>
                {summaryMetrics.map((metric) => (
                  <td key={`carryover-${metric.id}`} className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">{currency(metric.carryoverProtected)}</span>
                      {getMetricIndicator(metric.carryoverProtected, bestCarryover)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-3 font-medium text-foreground">Money at risk of forfeiture</td>
                {summaryMetrics.map((metric) => (
                  <td key={`forfeit-${metric.id}`} className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-semibold text-destructive">{currency(metric.forfeitureRisk)}</span>
                      {getMetricIndicator(metric.forfeitureRisk, lowestForfeiture, true)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-medium text-foreground">Net benefit after possible forfeiture</td>
                {summaryMetrics.map((metric) => (
                  <td key={`benefit-${metric.id}`} className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      <span className="text-lg font-semibold text-emerald-600">{currency(metric.netBenefit)}</span>
                      {getMetricIndicator(metric.netBenefit, bestNetBenefit)}
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
          const buckets = getBuckets(scenario);
          const carryoverMax = Math.min(scenario.data.healthElection, FSA_LIMITS.health);
          const gracePeriodDisplay = `${scenario.data.gracePeriodMonths.toFixed(1)} months`;

          return (
            <GlassCard key={scenario.id} className="space-y-6" analyticsId={`fsa-scenario-${scenario.id}`}>
              <div className="flex items-start justify-between border-b border-border pb-2">
                <div>
                  <h4 className="text-lg font-semibold text-foreground">{scenario.name}</h4>
                  <p className="text-xs text-muted-foreground">Outline expected bills and the rules that help you avoid losing funds</p>
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

              <div className="space-y-5">
                <div className="rounded-xl border border-border/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Health FSA election</Label>
                    <Tooltip
                      title="Election sizing"
                      content={
                        <p>
                          Choose an election that matches medical bills you can name now. Money above what you spend or keep under the rules goes back to the plan.
                        </p>
                      }
                    />
                  </div>
                  <Slider
                    value={[scenario.data.healthElection]}
                    onValueChange={(value) => updateScenario(scenario.id, { healthElection: value[0] })}
                    min={0}
                    max={FSA_LIMITS.health}
                    step={50}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>{currency(FSA_LIMITS.health)}</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground text-center">
                    {currency(scenario.data.healthElection)} elected
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Eligible expense buckets</Label>
                    <Tooltip
                      title="Track expected spending"
                      content={
                        <p>
                          Split your forecast into simple buckets. When most of the election is tied to real bills, you rely less on carryover or grace rules to save leftovers.
                        </p>
                      }
                    />
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Routine & preventive care</Label>
                      <Input
                        type="number"
                        min={0}
                        value={buckets.routineCare}
                        onChange={(event) => updateBucket(scenario.id, "routineCare", Number(event.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Planned procedures</Label>
                      <Input
                        type="number"
                        min={0}
                        value={buckets.plannedProcedures}
                        onChange={(event) => updateBucket(scenario.id, "plannedProcedures", Number(event.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Prescriptions & therapy</Label>
                      <Input
                        type="number"
                        min={0}
                        value={buckets.pharmacy}
                        onChange={(event) => updateBucket(scenario.id, "pharmacy", Number(event.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-primary/5 border border-dashed border-primary/40 p-3 text-xs text-muted-foreground">
                    <p>Expected eligible spend: {currency(scenario.data.expectedEligibleExpenses)}</p>
                    <p>Carryover or grace cushion: {currency(results?.carryoverProtected ?? 0)} • At risk of forfeiture: {currency(results?.forfeitureRisk ?? 0)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Carryover & grace rules</Label>
                    <Tooltip
                      title="Carryover and grace timing"
                      content={
                        <p>
                          Write down how much can roll forward and how long you have to spend last year's dollars. Extra time or rollover space lowers the chance of losing money.
                        </p>
                      }
                    />
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Carryover allowance</Label>
                      <Input
                        type="number"
                        min={0}
                        max={FSA_LIMITS.health}
                        value={scenario.data.planCarryover}
                        onChange={(event) => updateScenario(scenario.id, { planCarryover: Number(event.target.value) || 0 })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Up to {currency(carryoverMax)} may roll into the next plan year.</p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground">Grace period length</Label>
                      <Slider
                        value={[scenario.data.gracePeriodMonths]}
                        onValueChange={(value) => updateScenario(scenario.id, { gracePeriodMonths: Number(value[0].toFixed(1)) })}
                        min={0}
                        max={3}
                        step={0.5}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 months</span>
                        <span>3 months</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">You have {gracePeriodDisplay} to spend on last year's eligible expenses.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
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
                      Estimated marginal tax rate: <span className="font-semibold text-foreground">{scenarioResults[scenario.id]?.marginalRate ?? 0}%</span>. Each pre-tax dollar saves roughly this percentage in taxes.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Dependent-care FSA</Label>
                        <p className="text-xs text-muted-foreground">Money is reimbursed after you submit receipts for care</p>
                      </div>
                      <Switch
                        checked={scenario.data.includeDependentCare}
                        onCheckedChange={(checked) =>
                          updateScenario(scenario.id, {
                            includeDependentCare: checked,
                          })
                        }
                      />
                    </div>

                    {scenario.data.includeDependentCare ? (
                      <div className="grid gap-3">
                        <div>
                          <Label className="text-xs uppercase text-muted-foreground">Election amount</Label>
                          <Input
                            type="number"
                            min={0}
                            max={FSA_LIMITS.dependentCare}
                            value={scenario.data.dependentCareElection}
                            onChange={(event) =>
                              updateScenario(scenario.id, {
                                dependentCareElection: Number(event.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs uppercase text-muted-foreground">Expected expenses</Label>
                          <Input
                            type="number"
                            min={0}
                            value={scenario.data.expectedDependentCareExpenses}
                            onChange={(event) =>
                              updateScenario(scenario.id, {
                                expectedDependentCareExpenses: Number(event.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="rounded-lg bg-secondary/10 border border-dashed border-secondary/40 p-3 text-xs text-muted-foreground">
                          <p>Estimated tax savings: {currency(results?.dependentCareTaxSavings ?? 0)}</p>
                          <p>Money at risk of forfeiture: {currency(results?.dependentCareForfeitureRisk ?? 0)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertTriangle size={14} className="text-amber-500" />
                        <span>Enable dependent-care to compare how childcare reimbursements change your taxes.</span>
                      </div>
                    )}
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
