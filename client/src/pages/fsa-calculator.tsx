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
              A Flexible Spending Account lets you choose an annual election, get the full balance on day one, and pay
              back the money through paychecks. This planner explains how the use-it-or-lose-it rule, carryovers, and
              grace periods work so you only set aside what you can spend.
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
                <h3 className="text-xl font-semibold text-foreground">Plan your yearly election</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Decide how much money to promise to the health FSA for the year. You can swipe the card or request a
                  reimbursement for the full election even if only a few paychecks have been taken so far. Match that
                  upfront access with real appointments such as braces, prescriptions, or therapy visits.
                </p>
              </div>
              <Tooltip
                title="Explain the election"
                content={
                  <p>
                    Your election is the total dollars you promise to spend through the health FSA. The plan front-loads
                    that money, so you can use all of it at once and repay it over the rest of the year. Keep that loan in
                    mind when you size the election.
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
                  Add up copays, deductibles, glasses, dental work—any health bill you expect to pay out of pocket this year.
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
                  Estimated marginal tax rate: <span className="font-semibold text-foreground">{marginalRate}%</span>. Every FSA dollar avoids taxes at roughly this rate.
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
                      Enter how much your plan lets you roll into the next year. If your plan only offers a grace period,
                      set the carryover to 0 and adjust the months slider instead.
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
                      helperText="Months after the plan year when you can still swipe your FSA card for last year's bills."
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
                <h3 className="text-xl font-semibold text-foreground">Add dependent-care savings</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  A dependent-care FSA covers daycare, summer camp, after-school programs, and certain elder care. It has
                  its own household limit and also follows a use-it-or-lose-it rule, so line up the election with invoices
                  you already pay.
                </p>
              </div>
              <Tooltip
                title="How this account pays you back"
                content={
                  <p>
                    Families share one dependent-care FSA limit of {currency(FSA_LIMITS.dependentCare)}. Money builds each
                    payday and can only be reimbursed after you have paid for care, so submit receipts often.
                  </p>
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Include dependent-care FSA</p>
                <p className="text-xs text-muted-foreground">
                  Turn this on if you expect to pay child or elder care that qualifies for pre-tax reimbursement.
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
                    Include daycare, preschool, day camps, after-school programs, or qualified elder care costs for this year.
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
                  Estimated taxes avoided because your election comes out of your paycheck before taxes.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-4">
                <p className="text-sm text-muted-foreground">Protected by carryover/grace</p>
                <p className="text-2xl font-bold text-emerald-500">{currency(results.carryoverProtected)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dollars that should survive the use-it-or-lose-it rule because of your carryover or grace period.
                </p>
              </div>
              <div className="rounded-xl border border-amber-300/40 bg-amber-500/10 p-4">
                <p className="text-sm text-muted-foreground">Potential forfeiture risk</p>
                <p className="text-2xl font-bold text-amber-500">{currency(results.forfeitureRisk)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Money you might lose back to the plan if you do not spend it by the deadline.
                </p>
              </div>
              {inputs.includeDependentCare ? (
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Dependent-care tax savings</p>
                  <p className="text-2xl font-bold text-foreground">{currency(results.dependentCareTaxSavings)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Withheld before taxes so you are reimbursed for childcare or elder care bills.
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
            description="See how your planned bills line up with your election, the carryover cushion, and any money at risk of being lost."
            items={[
              {
                label: "Health FSA election vs. forecast",
                value: `${currency(inputs.healthElection)} elected / ${currency(inputs.expectedEligibleExpenses)} planned`,
                helperText:
                  results.expectedUtilization < inputs.healthElection
                    ? `${currency(inputs.healthElection - results.expectedUtilization)} could be lost unless your carryover or grace period saves it.`
                    : "Your election matches the care you expect to receive, so little should be forfeited.",
                accent: results.expectedUtilization < inputs.healthElection ? "warning" : "success",
              },
              {
                label: "Carryover and grace protection",
                value: `${currency(results.carryoverProtected)} protected`,
                helperText: "Shows how much of any leftover balance should roll or stay available into the next year.",
                accent: "primary",
              },
              {
                label: "Net benefit after forfeiture",
                value: currency(results.netBenefit),
                helperText:
                  results.netBenefit >= 0
                    ? "If this is positive, your tax savings beat the dollars you might forfeit."
                    : "If this is negative, lower the election or plan qualified spending before deadlines.",
                accent: results.netBenefit >= 0 ? "success" : "warning",
              },
              ...(inputs.includeDependentCare
                ? ([
                    {
                      label: "Dependent-care election vs. bills",
                      value: `${currency(inputs.dependentCareElection)} elected / ${currency(inputs.expectedDependentCareExpenses)} planned`,
                      helperText:
                        results.dependentCareForfeitureRisk > 0
                          ? `${currency(results.dependentCareForfeitureRisk)} could be lost—double-check invoices or lower the election.`
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
              Check how your health plan handles deductibles and copays before locking in an election. Track
              reimbursements during the year so money does not sit unused, and ask HR if carryover or grace rules change
              before you re-enroll.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
