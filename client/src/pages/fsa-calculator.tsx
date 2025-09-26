import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ClipboardList, Download, Wallet } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import DecisionSlider from "@/components/calculators/decision-slider";
import ShowMathSection from "@/components/calculators/show-math";
import { calculateFSA, FSA_LIMITS } from "@/lib/calculations";
import { getMarginalTaxRate, describeFilingStatus } from "@/lib/tax/brackets";
import { FSAInputs, FSAResults, FilingStatus } from "@shared/schema";
import { usePDFExport } from "@/lib/pdf/use-pdf-export";

const DEFAULT_INPUTS: FSAInputs = {
  healthElection: 2600,
  expectedEligibleExpenses: 2400,
  planCarryover: 640,
  gracePeriodMonths: 2,
  includeDependentCare: true,
  dependentCareElection: 4000,
  expectedDependentCareExpenses: 3600,
  annualIncome: 85000,
  filingStatus: "single",
};

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: describeFilingStatus("single") },
  { value: "marriedJoint", label: describeFilingStatus("marriedJoint") },
  { value: "marriedSeparate", label: describeFilingStatus("marriedSeparate") },
  { value: "headOfHousehold", label: describeFilingStatus("headOfHousehold") },
];

const currency = (value: number) => `$${Math.round(value).toLocaleString()}`;

export default function FSACalculator() {
  const [, navigate] = useLocation();
  const { exportFSAReport, isGenerating, error } = usePDFExport();

  const [inputs, setInputs] = useState<FSAInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<FSAResults>(() => calculateFSA(DEFAULT_INPUTS));

  useEffect(() => {
    setResults(calculateFSA(inputs));
  }, [inputs]);

  const carryoverCeiling = useMemo(() => Math.min(inputs.planCarryover, inputs.healthElection), [inputs.planCarryover, inputs.healthElection]);
  const marginalRate = results.marginalRate ?? getMarginalTaxRate(inputs.annualIncome, inputs.filingStatus);

  const updateInput = <K extends keyof FSAInputs>(key: K, value: FSAInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8" data-analytics-id="page-fsa-calculator">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            className="glass-effect p-3 rounded-xl hover:bg-muted transition-colors"
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="text-foreground" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
              FSA Election Forecaster
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Forecast medical and dependent-care expenses so you can elect the right FSA amounts. FSAs give you the
              full-year election on day one, but unused dollars are forfeited—pair the upfront access with realistic
              expense planning.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Updated for 2025</p>
          <p className="text-xs text-muted-foreground">IRS Notice 2024-87</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Plan-year blueprint</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Choose how much to lock into your health FSA and map out when those dollars will be needed. Because the
                  entire election is available on the first day of the plan year, align your forecast with surgeries,
                  pregnancies, therapy, or prescriptions you know are coming.
                </p>
              </div>
              <Tooltip
                title="Front-loaded access"
                content={
                  <p>
                    Health FSA elections are front-loaded—you can spend the full annual amount early in the plan year even
                    though you have only contributed a few pay periods. Plan for that float while keeping forfeiture risk in
                    check.
                  </p>
                }
              />
            </div>

            <DecisionSlider
              id="health-election"
              label="Health FSA election"
              value={inputs.healthElection}
              min={0}
              max={FSA_LIMITS.health}
              step={50}
              onChange={(value) => updateInput("healthElection", value)}
              helperText={`The IRS cap for 2025 is ${currency(FSA_LIMITS.health)}. Elect only what you expect to use within the plan year.`}
              focusLabel="Project annual spend"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="expected-expenses" className="text-sm font-medium text-foreground mb-2">
                  Expected eligible expenses
                </Label>
                <Input
                  id="expected-expenses"
                  type="number"
                  min={0}
                  value={inputs.expectedEligibleExpenses}
                  onChange={(event) => updateInput("expectedEligibleExpenses", Number(event.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Add up copays, deductibles, glasses, dental work—anything your health plan does not fully cover.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="annual-income" className="text-sm font-medium text-foreground mb-2">
                    Household annual income
                  </Label>
                  <Input
                    id="annual-income"
                    type="number"
                    min={0}
                    value={inputs.annualIncome}
                    onChange={(event) => updateInput("annualIncome", Number(event.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2">Filing status</Label>
                  <Select
                    value={inputs.filingStatus ?? "single"}
                    onValueChange={(value: FilingStatus) => updateInput("filingStatus", value)}
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
                  Estimated marginal tax rate: <span className="font-semibold text-foreground">{marginalRate}%</span>
                </p>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2">Carryover or grace period</Label>
                  <div className="space-y-3 rounded-xl border border-border/60 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Carryover allowance</span>
                      <span className="font-semibold text-foreground">{currency(carryoverCeiling)}</span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={FSA_LIMITS.health}
                      value={inputs.planCarryover}
                      onChange={(event) => updateInput("planCarryover", Number(event.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your plan's carryover allowance. If you have a grace period instead, set carryover to 0 and use
                      the months slider below.
                    </p>
                    <DecisionSlider
                      id="grace-period"
                      label="Grace period length"
                      value={inputs.gracePeriodMonths}
                      min={0}
                      max={3}
                      step={0.5}
                      formatValue={(value) => `${value.toFixed(1)} months`}
                      onChange={(value) => updateInput("gracePeriodMonths", value)}
                      helperText="How long after the plan year ends you can spend leftover dollars on prior-year expenses."
                      focusLabel="Plan-year timing"
                    />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Dependent-care coordination</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  If you have daycare, after-school, or elder-care bills, coordinate the dependent-care FSA alongside the
                  medical FSA. The benefit is capped separately and follows the same use-it-or-lose-it rules.
                </p>
              </div>
              <Tooltip
                title="Limits work differently"
                content={
                  <p>
                    Dependent-care FSA dollars are shared per household and capped at {currency(FSA_LIMITS.dependentCare)}.
                    Elections are not available upfront—funds accumulate as you contribute through payroll.
                  </p>
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Include dependent-care FSA</p>
                <p className="text-xs text-muted-foreground">
                  Toggle on if you plan to set aside pre-tax dollars for child or elder care expenses.
                </p>
              </div>
              <Switch
                checked={inputs.includeDependentCare}
                onCheckedChange={(checked) => updateInput("includeDependentCare", checked)}
              />
            </div>

            {inputs.includeDependentCare ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <DecisionSlider
                    id="dependent-care-election"
                    label="Dependent-care election"
                    value={inputs.dependentCareElection}
                    min={0}
                    max={FSA_LIMITS.dependentCare}
                    step={100}
                    onChange={(value) => updateInput("dependentCareElection", value)}
                    helperText={`Household maximum is ${currency(FSA_LIMITS.dependentCare)} per year.`}
                    focusLabel="Align with invoices"
                  />
                </div>
                <div>
                  <Label htmlFor="dependent-care-expenses" className="text-sm font-medium text-foreground mb-2">
                    Expected dependent-care expenses
                  </Label>
                  <Input
                    id="dependent-care-expenses"
                    type="number"
                    min={0}
                    value={inputs.expectedDependentCareExpenses}
                    onChange={(event) => updateInput("expectedDependentCareExpenses", Number(event.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Include daycare, preschool, or qualified elder care costs you expect this year.
                  </p>
                </div>
              </div>
            ) : null}
          </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">FSA decision dashboard</h3>
              <Wallet className="text-primary" />
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">Health FSA tax savings</p>
                <p className="text-2xl font-bold text-primary">{currency(results.taxSavings)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Immediate payroll tax reduction from your health FSA election.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-4">
                <p className="text-sm text-muted-foreground">Protected by carryover/grace</p>
                <p className="text-2xl font-bold text-emerald-500">{currency(results.carryoverProtected)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount likely saved from forfeiture thanks to your plan's safety net.
                </p>
              </div>
              <div className="rounded-xl border border-amber-300/40 bg-amber-500/10 p-4">
                <p className="text-sm text-muted-foreground">Potential forfeiture risk</p>
                <p className="text-2xl font-bold text-amber-500">{currency(results.forfeitureRisk)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dollars at risk if spending runs below your election after grace/carryover buffers.
                </p>
              </div>
              {inputs.includeDependentCare ? (
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Dependent-care tax savings</p>
                  <p className="text-2xl font-bold text-foreground">{currency(results.dependentCareTaxSavings)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Withheld pre-tax to offset childcare or elder care invoices.
                  </p>
                </div>
              ) : null}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => exportFSAReport(inputs, results)}
              disabled={isGenerating}
            >
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating report..." : "Download FSA report"}
            </Button>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </GlassCard>

          <ShowMathSection
            title="Show the math"
            focusLabel="Forecast vs. IRS limits"
            description="Compare what you plan to spend with what you elected so you can avoid forfeiting dollars while still enjoying the front-loaded access an FSA provides."
            items={[
              {
                label: "Health FSA election vs. forecast",
                value: `${currency(inputs.healthElection)} elected / ${currency(inputs.expectedEligibleExpenses)} planned`,
                helperText:
                  results.expectedUtilization < inputs.healthElection
                    ? `${currency(inputs.healthElection - results.expectedUtilization)} may go unused unless carryover or a grace period saves it.`
                    : "Your election matches the care you expect to receive—low forfeiture risk.",
                accent: results.expectedUtilization < inputs.healthElection ? "warning" : "success",
              },
              {
                label: "Carryover + grace coverage",
                value: `${currency(results.carryoverProtected)} protected`,
                helperText: "Set expectations for how much of any leftover funds your plan rules will allow you to keep.",
                accent: "primary",
              },
              {
                label: "Net benefit after forfeiture",
                value: currency(results.netBenefit),
                helperText:
                  results.netBenefit >= 0
                    ? "Positive numbers mean tax savings outpace potential forfeitures."
                    : "If the number is negative, trim your election or accelerate eligible spending.",
                accent: results.netBenefit >= 0 ? "success" : "warning",
              },
              ...(inputs.includeDependentCare
                ? ([
                    {
                      label: "Dependent-care election vs. bills",
                      value: `${currency(inputs.dependentCareElection)} elected / ${currency(inputs.expectedDependentCareExpenses)} planned`,
                      helperText:
                        results.dependentCareForfeitureRisk > 0
                          ? `${currency(results.dependentCareForfeitureRisk)} could be forfeited—double-check invoices or reduce the election.`
                          : "Your dependent-care election is covered by expected expenses.",
                      accent: results.dependentCareForfeitureRisk > 0 ? "warning" : "success",
                    },
                  ] as const)
                : []),
            ]}
          />

          <GlassCard className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <ClipboardList className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-foreground">Coordinate with your health plan</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              FSAs pair best with copay-based medical plans or HDHPs where you limit contributions. Track reimbursements
              through the year so you do not leave money in the account at year end, and revisit elections if your plan
              switches between carryover and grace period provisions.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
