import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calculator, Download, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { useLocation } from "wouter";
import { calculateHSA, HSA_LIMITS } from "@/lib/calculations";
import { getMarginalTaxRate, describeFilingStatus } from "@/lib/tax/brackets";
import { HSAInputs, HSAResults, FilingStatus } from "@shared/schema";
import { usePDFExport } from "@/lib/pdf/use-pdf-export";
import DecisionSlider from "@/components/calculators/decision-slider";
import ShowMathSection from "@/components/calculators/show-math";

const DEFAULT_INPUTS: HSAInputs = {
  accountType: "hsa",
  coverage: "individual",
  age: 38,
  employeeContribution: 3200,
  hdhpMonthlyPremium: 330,
  altPlanMonthlyPremium: 515,
  employerSeed: 750,
  targetReserve: 4000,
  annualIncome: 85000,
  filingStatus: "single",
};

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: describeFilingStatus("single") },
  { value: "marriedJoint", label: describeFilingStatus("marriedJoint") },
  { value: "marriedSeparate", label: describeFilingStatus("marriedSeparate") },
  { value: "headOfHousehold", label: describeFilingStatus("headOfHousehold") },
];

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString()}`;

const getContributionLimit = (inputs: HSAInputs) => {
  const baseLimit = inputs.coverage === "family" ? HSA_LIMITS.family : HSA_LIMITS.individual;
  const catchUp = inputs.age >= 55 ? HSA_LIMITS.catchUp : 0;
  return baseLimit + catchUp;
};

export default function HSACalculator() {
  const [, navigate] = useLocation();
  const { exportHSAReport, isGenerating, error } = usePDFExport();

  const [inputs, setInputs] = useState<HSAInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<HSAResults>(() => calculateHSA(DEFAULT_INPUTS));

  useEffect(() => {
    setResults(calculateHSA(inputs));
  }, [inputs]);

  const contributionLimit = useMemo(() => getContributionLimit(inputs), [inputs]);
  const marginalRate = results.marginalRate ?? getMarginalTaxRate(inputs.annualIncome, inputs.filingStatus);

  const updateInput = <K extends keyof HSAInputs>(key: K, value: HSAInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const premiumDifference = results.annualPremiumSavings;
  const reserveProgress = results.projectedReserve;

  return (
    <div className="space-y-8" data-analytics-id="page-hsa-calculator">
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
              HSA Strategy Planner
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Use this guide to see how a high-deductible health plan (HDHP) works with a health savings account (HSA).
              HDHPs usually skip copays, so you pay the early bills out of pocket. We will show how premiums, payroll
              deposits, and any employer help can build an HSA cushion before those bills arrive.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Updated for 2025</p>
          <p className="text-xs text-muted-foreground">IRS Publication 969</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Confirm HDHP eligibility</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Make sure the plan you are choosing counts as an HDHP so you can fund an HSA. These plans trade
                  predictable copays for lower premiums, so double-check that the coverage fits your household and that
                  your HSA can handle unexpected bills.
                </p>
              </div>
              <Tooltip
                title="Why eligibility matters"
                content={
                  <p>
                    You can only add money to an HSA while you have a qualified high-deductible health plan. The IRS sets
                    your yearly limit by your coverage level and age, and people 55 or older can contribute an extra
                    $1,000 catch-up amount.
                  </p>
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-3">
                  Coverage level
                </Label>
                <RadioGroup
                  value={inputs.coverage}
                  onValueChange={(value) => updateInput("coverage", value as "individual" | "family")}
                  className="grid grid-cols-2 gap-3"
                >
                  <div
                    className={`glass-input rounded-xl p-4 cursor-pointer transition-colors ${
                      inputs.coverage === "individual"
                        ? "bg-primary/20 border-primary ring-2 ring-primary/50"
                        : "hover:bg-primary/10"
                    }`}
                  >
                    <RadioGroupItem value="individual" id="coverage-individual" className="sr-only" />
                    <Label htmlFor="coverage-individual" className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-primary text-xl mb-2">👤</div>
                        <div className="font-medium text-foreground">Individual</div>
                        <div className="text-xs text-muted-foreground">Self-only HDHP coverage</div>
                      </div>
                    </Label>
                  </div>
                  <div
                    className={`glass-input rounded-xl p-4 cursor-pointer transition-colors ${
                      inputs.coverage === "family"
                        ? "bg-primary/20 border-primary ring-2 ring-primary/50"
                        : "hover:bg-primary/10"
                    }`}
                  >
                    <RadioGroupItem value="family" id="coverage-family" className="sr-only" />
                    <Label htmlFor="coverage-family" className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-primary text-xl mb-2">👨‍👩‍👧‍👦</div>
                        <div className="font-medium text-foreground">Family</div>
                        <div className="text-xs text-muted-foreground">Includes spouse and/or dependents</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="age" className="flex items-center text-sm font-medium text-foreground mb-2">
                    Your age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min={18}
                    value={inputs.age}
                    onChange={(event) => updateInput("age", Number(event.target.value) || 0)}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="annual-income" className="flex items-center text-sm font-medium text-foreground mb-2">
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
                    <Label className="flex items-center text-sm font-medium text-foreground mb-2">Filing status</Label>
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
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
              <p className="font-medium text-primary">
                2025 contribution room: {formatCurrency(contributionLimit)}
              </p>
              <p className="text-muted-foreground mt-1">
                This includes the base limit of {formatCurrency(inputs.coverage === "family" ? HSA_LIMITS.family : HSA_LIMITS.individual)}
                and {inputs.age >= 55 ? "a $1,000 catch-up contribution available after age 55." : "an extra $1,000 catch-up contribution once you reach age 55."}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="space-y-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Plan your HSA deposits</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Decide how much to send from your paycheck and how much your employer adds. Together these deposits
                  should build a cushion that can handle the plan deductible without wrecking your monthly budget.
                </p>
              </div>
              <Tooltip
                title="Why the slider matters"
                content={
                  <p>
                    Every pre-tax dollar you contribute avoids taxes today and grows the reserve you can tap when a large
                    medical bill arrives. Adjust the slider to balance take-home pay with peace of mind.
                  </p>
                }
              />
            </div>

            <DecisionSlider
              id="employee-contribution"
              label="Your annual HSA contribution"
              value={inputs.employeeContribution}
              min={0}
              max={contributionLimit}
              step={100}
              onChange={(value) => updateInput("employeeContribution", value)}
              helperText={`Pre-tax payroll dollars you will direct into the HSA. Limited to ${formatCurrency(
                contributionLimit
              )} based on your eligibility.`}
              focusLabel="Target deductible coverage"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="employer-seed" className="text-sm font-medium text-foreground mb-2">
                  Employer contribution
                </Label>
                <Input
                  id="employer-seed"
                  type="number"
                  min={0}
                  value={inputs.employerSeed}
                  onChange={(event) => updateInput("employerSeed", Number(event.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Add any money your employer places in the HSA, whether it shows up at the start of the year or in
                  matching deposits.
                </p>
              </div>
              <div>
                <Label htmlFor="target-reserve" className="text-sm font-medium text-foreground mb-2">
                  Desired HSA reserve
                </Label>
                <Input
                  id="target-reserve"
                  type="number"
                  min={0}
                  value={inputs.targetReserve}
                  onChange={(event) => updateInput("targetReserve", Number(event.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Aim for an amount that covers your HDHP deductible or whatever balance would let you sleep at night.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Compare monthly premiums</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Stack the HDHP premium against the copay-friendly plan you are replacing. The monthly difference becomes
                  the cash you can redirect into the HSA for future medical bills.
                </p>
              </div>
              <Tooltip
                title="Premium comparison"
                content={
                  <p>
                    HDHP premiums are typically lower each month. Multiply that gap by twelve to see how much money you free
                    up to send into your HSA for medical expenses.
                  </p>
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="hdhp-premium" className="text-sm font-medium text-foreground mb-2">
                  HDHP monthly premium
                </Label>
                <Input
                  id="hdhp-premium"
                  type="number"
                  min={0}
                  value={inputs.hdhpMonthlyPremium}
                  onChange={(event) => updateInput("hdhpMonthlyPremium", Number(event.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="alt-premium" className="text-sm font-medium text-foreground mb-2">
                  Alternative plan premium
                </Label>
                <Input
                  id="alt-premium"
                  type="number"
                  min={0}
                  value={inputs.altPlanMonthlyPremium}
                  onChange={(event) => updateInput("altPlanMonthlyPremium", Number(event.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Use the PPO or copay-style plan you are weighing against the HDHP.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">HSA impact highlights</h3>
              <PiggyBank className="text-primary" />
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">Annual premium savings redirected</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(premiumDifference)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total yearly difference between your HDHP premium and the alternative plan premium.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-4">
                <p className="text-sm text-muted-foreground">Projected HSA reserve after contributions</p>
                <p className="text-2xl font-bold text-emerald-500">{formatCurrency(reserveProgress)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Employer contributions plus your pre-tax deposits available to handle medical surprises.
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Net cashflow advantage</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(results.netCashflowAdvantage)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The amount you keep after combining premium savings, employer contributions, and tax savings, then
                  subtracting your payroll deposits.
                </p>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => exportHSAReport(inputs, results)}
              disabled={isGenerating}
            >
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating report..." : "Download HSA report"}
            </Button>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </GlassCard>

          <ShowMathSection
            title="See how the dollars work"
            focusLabel="Premium savings vs. deductible readiness"
            description="Trace how lower premiums, tax savings, and employer contributions come together to keep your HDHP affordable while you build a deductible-sized buffer."
            items={[
              {
                label: "Annual premium gap",
                value: formatCurrency(results.annualPremiumSavings),
                helperText: "What you pocket by choosing the HDHP instead of the richer copay plan.",
                accent: "primary",
              },
              {
                label: "Pre-tax contribution tax savings",
                value: formatCurrency(results.taxSavings),
                helperText: `Every dollar you defer avoids tax at ${marginalRate}% now.`,
                accent: "success",
              },
              {
                label: "Employer dollars",
                value: formatCurrency(results.employerContribution),
                helperText: "Money your employer adds to the HSA to boost your medical safety net.",
              },
              {
                label: "Projected reserve vs. goal",
                value: `${formatCurrency(results.projectedReserve)} of ${formatCurrency(inputs.targetReserve)}`,
                helperText:
                  results.reserveShortfall > 0
                    ? `${formatCurrency(results.reserveShortfall)} shy of your target—consider raising contributions or lowering the deductible exposure.`
                    : "You are on pace to meet or exceed the reserve you want ready for a worst-case bill.",
                accent: results.reserveShortfall > 0 ? "warning" : "success",
              },
              {
                label: "Net cashflow advantage",
                value: formatCurrency(results.netCashflowAdvantage),
                helperText:
                  results.netCashflowAdvantage >= 0
                    ? "Positive numbers mean the HDHP/HSA combo leaves more money in your pocket across the year."
                    : "A negative value means payroll contributions outweigh the premium savings—double-check affordability.",
                accent: results.netCashflowAdvantage >= 0 ? "success" : "warning",
              },
            ]}
          />

          <GlassCard className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Calculator className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-foreground">Ready for claim season</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Remember: HDHPs rarely include copays for office visits or prescriptions. Expect to pay the negotiated rate
              until you hit the deductible, then lean on your HSA balance. Revisit this plan after open enrollment or if
              your medical usage changes during the year.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
