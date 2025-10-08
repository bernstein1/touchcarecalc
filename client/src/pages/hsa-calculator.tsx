import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calculator, Download, PiggyBank, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import PreTaxExplainer from "@/components/education/pre-tax-explainer";
import CollapsibleSection from "@/components/ui/collapsible-section";
import RecommendationCard from "@/components/recommendations/recommendation-card";
import { generateHSARecommendations } from "@/lib/recommendations/hsa-recommendations";
import { usePrintContext } from "@/context/print-context";
import HSAPrintSummary from "@/components/print/hsa-print-summary";

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
  spouseHasHSA: false,
  spouseHSAContribution: 0,
  anticipatedMedicalExpenses: 0,
  anticipatedDentalExpenses: 0,
  anticipatedVisionExpenses: 0,
  planDeductibleIndividual: 0,
  planDeductibleFamily: 0,
  monthlyContributionBudget: 0,
  hsaMotivation: "affordability",
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
  const { setPrintHandler } = usePrintContext();

  const [inputs, setInputs] = useState<HSAInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<HSAResults>(() => calculateHSA(DEFAULT_INPUTS));

  useEffect(() => {
    setResults(calculateHSA(inputs));
  }, [inputs]);

  const contributionLimit = useMemo(() => getContributionLimit(inputs), [inputs]);
  const marginalRate = results.marginalRate ?? getMarginalTaxRate(inputs.annualIncome, inputs.filingStatus);
  const recommendations = useMemo(() => generateHSARecommendations(inputs, results), [inputs, results]);

  const updateInput = <K extends keyof HSAInputs>(key: K, value: HSAInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const premiumDifference = results.annualPremiumSavings;
  const totalSavingsThisYear = results.annualPremiumSavings + results.taxSavings;
  const reserveProgress = results.projectedReserve;
  const targetReserveAmount = inputs.targetReserve ?? 0;
  const reserveProgressPercent = targetReserveAmount > 0 ? Math.min(100, (reserveProgress / targetReserveAmount) * 100) : undefined;
  const reserveShortfall = targetReserveAmount > 0 ? Math.max(targetReserveAmount - reserveProgress, 0) : 0;
  const reserveProgressLabel = targetReserveAmount > 0
    ? `${formatCurrency(Math.min(reserveProgress, targetReserveAmount))} of ${formatCurrency(targetReserveAmount)}`
    : formatCurrency(reserveProgress);
  const familyEligible = inputs.coverage === "family";
  const familyLimitWarning = !familyEligible
    ? "If an individual is not on a family plan, they cannot contribute this amount."
    : undefined;
  const familyLimitDisplay = formatCurrency(HSA_LIMITS.family);
  const familyLimitWithCatchUpDisplay = formatCurrency(HSA_LIMITS.family + HSA_LIMITS.catchUp);
  const individualLimitDisplay = formatCurrency(HSA_LIMITS.individual);
  const sliderHelperText = inputs.coverage === "family"
    ? `Pre-tax payroll dollars you plan to contribute into your HSA. The 2026 family HDHP / CDHP limit is ${familyLimitDisplay} (or ${familyLimitWithCatchUpDisplay} if you're 55 or older).`
    : `Pre-tax payroll dollars you plan to contribute into your HSA. The 2026 individual limit is ${individualLimitDisplay}. Only family HDHP / CDHP coverage qualifies for the ${familyLimitDisplay} family limit (or ${familyLimitWithCatchUpDisplay} with the age 55+ catch-up).`;

  const handlePrintSummary = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    setPrintHandler(handlePrintSummary);
    return () => setPrintHandler(null);
  }, [handlePrintSummary, setPrintHandler]);

  return (
    <Fragment>
      <div className="space-y-8 print-hidden" data-analytics-id="page-hsa-calculator">
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
              Use this guide to see how a high-deductible or consumer driven health plan (HDHP / CDHP) works with a health savings account (HSA).
              HDHP / CDHP plans usually skip copays, so you pay the early bills out of pocket. We will show how premiums, payroll
              deposits, and any employer help can build an HSA cushion before those bills arrive.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Updated for 2026</p>
          <p className="text-xs text-muted-foreground">IRS Rev. Proc. 2025-19</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/unnamed.png" alt="TouchCare" className="h-10 w-10 rounded-full object-cover" />
            <p className="text-sm font-medium text-foreground max-w-xs">Connect with a TouchCare Specialist for additional questions or support</p>
          </div>
          <a
            href="https://touchcare.com/ask"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <span>TouchCare Member Portal</span>
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <PreTaxExplainer variant="inline" showExamples={true} />

          <CollapsibleSection
            title="Key HSA Facts"
            defaultOpen={false}
          >
            <GlassCard className="space-y-4">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <p><strong className="text-foreground">Unused funds roll over year-over-year:</strong> Unlike FSAs, any unused HSA balance carries forward indefinitely—no use-it-or-lose-it deadlines.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">⏱</span>
                  <p><strong className="text-foreground">Funds availability:</strong> Money you contribute into your HSA becomes available once it is distributed to your account. Check with your HSA administrator for timing.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">🏥</span>
                  <p><strong className="text-foreground">HDHP / CDHP requirement:</strong> You must be enrolled in a qualified high-deductible or consumer driven health plan to contribute to an HSA, and you cannot fund it if you also participate in a general-purpose medical FSA.</p>
                </div>
              </div>
            </GlassCard>
          </CollapsibleSection>

          <GlassCard className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Confirm HDHP / CDHP eligibility</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed space-y-2">
                  <span className="block">
                    If you intend to contribute to an HSA account, make sure the health insurance plan you choose is a qualified High Deductible Health Plan or Consumer Driven Health Plan (HDHP / CDHP) — only these plans allow you to participate in an HSA funding arrangement.
                  </span>
                  <span className="block">
                    HDHP / CDHP health plans typically trade predictable copays for lower premiums and higher out-of-pocket costs, so check that the coverage works for your household and that your HSA balance (or budget) can handle unexpected expenses. If you have questions about how HDHP / CDHP plans work, please contact TouchCare for additional assistance.
                  </span>
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
                  Coverage level <span className="ml-2 text-xs text-primary font-semibold">Required</span>
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
                        <div className="font-medium text-foreground">Individual (Self-Only) HDHP / CDHP Coverage</div>
                        <div className="text-xs text-muted-foreground">Applies when you’re the only person covered under the plan.</div>
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
                        <div className="font-medium text-foreground">Family HDHP / CDHP Coverage</div>
                        <div className="text-xs text-muted-foreground">Applies when your plan also covers a spouse and/or dependents.</div>
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

                {/* Medicare Enrollment Check */}
                <div className="rounded-lg border-2 border-border bg-background/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="medicare-enrolled" className="text-sm font-medium text-foreground">
                      Are you enrolled in Medicare?
                    </Label>
                    <input
                      id="medicare-enrolled"
                      type="checkbox"
                      checked={inputs.enrolledInMedicare || false}
                      onChange={(e) => updateInput("enrolledInMedicare", e.target.checked)}
                      className="h-4 w-4"
                    />
                  </div>
                  {inputs.enrolledInMedicare && (
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2">
                      <p className="text-sm text-amber-900 font-medium">
                        ⚠️ Once a Medicare plan is active, you can no longer contribute to an HSA account.
                      </p>
                      <p className="text-xs text-amber-800">
                        You can still use what’s already in your account for most Medicare or out-of-pocket, qualified healthcare costs — like Parts B and D or Medicare Advantage premiums — but HSA funds cannot be used to pay for Medigap plans.
                      </p>
                      <p className="text-xs text-amber-700 mt-2">
                        Note: Medicare coverage can start retroactively, so check your dates carefully to avoid contributions that will need to be redacted. If you do make an error by continuing to contribute to your HSA, your HSA administrator can help make corrections.
                      </p>
                    </div>
                  )}
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
                      prefix="$"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center text-sm font-medium text-foreground mb-2">Tax filing status</Label>
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
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      Estimated tax bracket: <span className="font-semibold text-foreground">{marginalRate}%</span>
                    </p>
                    <p>
                      This means you may pay about {marginalRate}¢ in federal income tax for every additional $1 you earn.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
              <p className="font-medium text-primary">
                2026 family HSA contribution limit: {familyLimitDisplay}
              </p>
              <p className="text-muted-foreground mt-1 leading-relaxed">
                Only households enrolled in family HDHP / CDHP coverage can contribute this full amount. If you are 55 or older, the IRS catch-up raises the ceiling to {familyLimitWithCatchUpDisplay}.
              </p>
              {familyLimitWarning ? (
                <p className="text-xs font-semibold text-amber-600 mt-2">
                  {familyLimitWarning}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">
                  Remember: both your own and employer contributions count toward this family limit, with an extra {formatCurrency(HSA_LIMITS.catchUp)} catch-up once you turn 55.
                </p>
              )}
            </div>
          </GlassCard>

          {inputs.coverage === "family" && (
            <CollapsibleSection
              title="Family HSA Contributions"
              subtitle="Required if your spouse also has an HSA"
              badge="Important"
              defaultOpen={true}
            >
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-4">
                <p className="text-sm text-blue-900 font-medium mb-2">Family HSA Contribution Rules</p>
                <p className="text-xs text-blue-800">
                  If both spouses have HDHP / CDHP coverage and each opens an HSA, the total amount you can contribute together can’t be more than the IRS family limit of {formatCurrency(HSA_LIMITS.family)}.
                </p>
                <p className="text-xs text-blue-800 mt-2">
                  This limit includes all contributions — both your own and any employer contributions from either spouse’s employer. Together, you may choose how to split the total between your accounts.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="spouse-has-hsa" className="text-sm font-medium text-foreground">
                    Does your spouse also have an HSA through their employer?
                  </Label>
                  <input
                    id="spouse-has-hsa"
                    type="checkbox"
                    checked={inputs.spouseHasHSA}
                    onChange={(e) => updateInput("spouseHasHSA", e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                {inputs.spouseHasHSA && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="spouse-contribution" className="text-sm font-medium text-foreground mb-2">
                        Spouse's annual HSA employee contribution
                      </Label>
                      <Input
                        id="spouse-contribution"
                        type="number"
                        min={0}
                        value={inputs.spouseHSAContribution ?? 0}
                        onChange={(event) => updateInput("spouseHSAContribution", Number(event.target.value) || 0)}
                        prefix="$"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Amount your spouse contributes from their paycheck
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="spouse-employer-contribution" className="text-sm font-medium text-foreground mb-2">
                        Spouse's employer HSA contribution
                      </Label>
                      <Input
                        id="spouse-employer-contribution"
                        type="number"
                        min={0}
                        value={inputs.spouseEmployerHSAContribution ?? 0}
                        onChange={(event) => updateInput("spouseEmployerHSAContribution", Number(event.target.value) || 0)}
                        prefix="$"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Amount spouse's employer contributes to their HSA
                      </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <p className="text-sm text-amber-900 font-medium">
                        Combined family total: {formatCurrency((inputs.employeeContribution || 0) + (inputs.employerSeed || 0) + (inputs.spouseHSAContribution || 0) + (inputs.spouseEmployerHSAContribution || 0))}
                      </p>
                      <p className="text-xs text-amber-800 mt-1">
                        This must not exceed {formatCurrency(HSA_LIMITS.family)} for family coverage.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          <CollapsibleSection
            title="Refine Your Estimate"
            subtitle="Add anticipated expenses and plan details for more accurate recommendations"
            badge="Optional"
            defaultOpen={false}
          >
            <GlassCard className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Anticipated medical expenses</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    Estimate your expected out-of-pocket costs for the plan year across medical, dental, and vision
                    categories. This helps size your HSA contributions to match real healthcare needs.
                  </p>
                </div>
                <Tooltip
                  title="Why track expenses?"
                  content={
                    <p>
                      Understanding your anticipated medical costs helps you determine whether your HSA balance will cover
                      your deductible and everyday healthcare bills before you face a large claim.
                    </p>
                  }
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="medical-expenses" className="text-sm font-medium text-foreground mb-2">
                    Medical expenses
                  </Label>
                  <Input
                    id="medical-expenses"
                    type="number"
                    min={0}
                    value={inputs.anticipatedMedicalExpenses ?? 0}
                    onChange={(event) => updateInput("anticipatedMedicalExpenses", Number(event.target.value) || 0)}
                    prefix="$"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Doctor visits, prescriptions, procedures
                  </p>
                </div>
                <div>
                  <Label htmlFor="dental-expenses" className="text-sm font-medium text-foreground mb-2">
                    Dental expenses
                  </Label>
                  <Input
                    id="dental-expenses"
                    type="number"
                    min={0}
                    value={inputs.anticipatedDentalExpenses ?? 0}
                    onChange={(event) => updateInput("anticipatedDentalExpenses", Number(event.target.value) || 0)}
                    prefix="$"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cleanings, fillings, orthodontics
                  </p>
                </div>
                <div>
                  <Label htmlFor="vision-expenses" className="text-sm font-medium text-foreground mb-2">
                    Vision expenses
                  </Label>
                  <Input
                    id="vision-expenses"
                    type="number"
                    min={0}
                    value={inputs.anticipatedVisionExpenses ?? 0}
                    onChange={(event) => updateInput("anticipatedVisionExpenses", Number(event.target.value) || 0)}
                    prefix="$"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Exams, glasses, contacts
                  </p>
                </div>
              </div>

              {results.totalAnticipatedExpenses && results.totalAnticipatedExpenses > 0 && (
                <div className="rounded-xl border border-border p-4">
                  <p className="text-sm text-muted-foreground">Total anticipated expenses</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(results.totalAnticipatedExpenses)}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan-deductible" className="text-sm font-medium text-foreground mb-2">
                    Health Insurance Plan Deductible
                  </Label>
                  <Input
                    id="plan-deductible"
                    type="number"
                    min={0}
                    value={inputs.coverage === "family" ? inputs.planDeductibleFamily ?? 0 : inputs.planDeductibleIndividual ?? 0}
                    onChange={(event) =>
                      inputs.coverage === "family"
                        ? updateInput("planDeductibleFamily", Number(event.target.value) || 0)
                        : updateInput("planDeductibleIndividual", Number(event.target.value) || 0)
                    }
                    prefix="$"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Individual or family deductible, based on who is covered under your plan.
                  </p>
                </div>
                <div>
                  <Label htmlFor="monthly-budget" className="text-sm font-medium text-foreground mb-2">
                    Monthly HSA contribution budget (optional)
                  </Label>
                  <Input
                    id="monthly-budget"
                    type="number"
                    min={0}
                    value={inputs.monthlyContributionBudget ?? 0}
                    onChange={(event) => updateInput("monthlyContributionBudget", Number(event.target.value) || 0)}
                    prefix="$"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    How much can you comfortably contribute per month to your HSA without straining your budget?
                  </p>
                </div>
              </div>
            </GlassCard>
          </CollapsibleSection>

          <GlassCard className="space-y-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Plan your HSA deposits</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Decide how much you’ll contribute from each paycheck and include how much your employer will add. Together, these deposits should create a cushion to cover your plan’s deductible without straining your monthly budget.
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
              helperText={sliderHelperText}
              focusLabel="Target deductible coverage"
            />

            {familyLimitWarning ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-xs text-amber-900" role="alert">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Family limit reminder</p>
                  <p>{familyLimitWarning}</p>
                </div>
              </div>
            ) : null}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="employer-seed" className="flex items-center text-sm font-medium text-foreground mb-2">
                  Your employer's annual HSA contribution
                  <Tooltip
                    content="Money your employer contributes to your HSA. This counts toward your annual IRS contribution limit. Include all employer contributions whether they arrive upfront or through paycheck matching."
                  />
                </Label>
                <Input
                  id="employer-seed"
                  type="number"
                  min={0}
                  value={inputs.employerSeed}
                  onChange={(event) => updateInput("employerSeed", Number(event.target.value) || 0)}
                  prefix="$"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Employer contributions count toward the annual IRS HSA limits
                </p>
              </div>
              <div>
                  <Label htmlFor="target-reserve" className="flex items-center text-sm font-medium text-foreground mb-2">
                    HSA Savings Goal
                  <Tooltip
                    title="What is a target reserve?"
                    content="Your target reserve is the HSA balance you want to maintain to cover unexpected medical expenses. Most people aim for an amount that covers their HDHP / CDHP deductible so they're financially prepared if they face maximum out-of-pocket costs in a given year. This cushion gives you peace of mind and prevents the need to pay large medical bills out of regular income."
                  />
                </Label>
                <Input
                  id="target-reserve"
                  type="number"
                  min={0}
                  value={inputs.targetReserve}
                  onChange={(event) => updateInput("targetReserve", Number(event.target.value) || 0)}
                  prefix="$"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: Set this to your HDHP / CDHP deductible amount
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Compare monthly premiums</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Enter the monthly amount you would pay for each health plan. Because HDHP / CDHP plans often cost less per month, you can use the money you save on premiums to grow your HSA balance.
                </p>
              </div>
              <Tooltip
                title="Why compare premiums?"
                content={
                  <p>
                    The monthly premium difference between plans represents money you can redirect to your HSA. For example, if your HDHP / CDHP costs $200/month and a traditional plan costs $350/month, you save $150 monthly ($1,800 annually) that can go toward building your HSA reserve.
                  </p>
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="hdhp-premium" className="text-sm font-medium text-foreground mb-2">
                  Monthly employee premium for HDHP / CDHP plan
                </Label>
                <Input
                  id="hdhp-premium"
                  type="number"
                  min={0}
                  value={inputs.hdhpMonthlyPremium}
                  onChange={(event) => updateInput("hdhpMonthlyPremium", Number(event.target.value) || 0)}
                  prefix="$"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your monthly paycheck deduction for the HDHP / CDHP plan
                </p>
              </div>
              <div>
                <Label htmlFor="alt-premium" className="text-sm font-medium text-foreground mb-2">
                  Monthly employee premium for alternative health plan
                </Label>
                <Input
                  id="alt-premium"
                  type="number"
                  min={0}
                  value={inputs.altPlanMonthlyPremium}
                  onChange={(event) => updateInput("altPlanMonthlyPremium", Number(event.target.value) || 0)}
                  prefix="$"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your monthly paycheck deduction for the PPO or HMO plan
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Calculator className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-foreground">Ready for claim season</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <span className="block">
                Tip: Most HDHP / CDHP plans don’t have copays for doctor visits or prescriptions. When you see in-network providers, you’ll pay the discounted price your insurance company has contracted with them until you reach your deductible.
              </span>
              <span className="block">
                Your HSA funds can help cover those costs. Revisit your plan during open enrollment or if your medical needs shift during the year.
              </span>
            </p>
          </GlassCard>
        </div>

        <div className="space-y-8 md:sticky md:top-8 md:self-start">
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">HSA impact highlights</h3>
              <PiggyBank className="text-primary" />
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">Annual premium savings redirected (HDHP / CDHP)</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(premiumDifference)}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Total yearly difference between your HDHP / CDHP premium and the alternative plan premium that you can move into your HSA.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-4">
                <p className="text-sm text-muted-foreground">HSA balance progress</p>
                <p className="text-2xl font-bold text-emerald-600">{reserveProgressLabel}</p>
                {reserveProgressPercent !== undefined ? (
                  <>
                    <Progress value={reserveProgressPercent} className="mt-3 h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {reserveShortfall > 0
                        ? `You're ${formatCurrency(reserveShortfall)} short of your target savings goal.`
                        : "You've reached your target savings goal."}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">
                    Set a target savings goal to track progress toward your cushion.
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Your total savings this year (HDHP / CDHP)</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSavingsThisYear)}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Premium savings plus tax savings you can redirect toward your HSA or other goals.
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

          {results.warnings && results.warnings.length > 0 && (
            <GlassCard className="space-y-4 border-amber-300/40 bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-foreground">Important Notices</h3>
              </div>
              <div className="space-y-3">
                {results.warnings.map((warning, index) => (
                  <div key={index} className="rounded-lg bg-white/50 border border-amber-300/40 p-3">
                    <p className="text-sm text-foreground">{warning}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Smart Recommendations */}
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Personalized Recommendations</h3>
              {recommendations.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))}
            </div>
          ) : null}

          <ShowMathSection
            title="How the numbers add up"
            focusLabel="Understanding your HSA strategy"
            description="See how premium savings, tax benefits, and employer contributions work together to build your HSA balance."
            items={[
              {
                label: "Annual premium savings redirected (HDHP / CDHP)",
                value: formatCurrency(results.annualPremiumSavings),
                helperText: "Yearly savings from choosing the HDHP / CDHP over the alternative plan",
                accent: "primary",
              },
              {
                label: "Tax savings on contributions",
                value: formatCurrency(results.taxSavings),
                helperText: `Taxes avoided on HSA contributions at your ${marginalRate}% tax rate`,
                accent: "success",
              },
              {
                label: "Employer contribution",
                value: formatCurrency(results.employerContribution),
                helperText: "Additional funds your employer adds to your HSA",
              },
              {
                label: "HSA balance progress",
                value: `${formatCurrency(results.projectedReserve)} of ${formatCurrency(inputs.targetReserve)}`,
                helperText:
                  results.reserveShortfall > 0
                    ? `You're ${formatCurrency(results.reserveShortfall)} short of your target savings goal`
                    : "You're on track to meet your target savings goal",
                accent: results.reserveShortfall > 0 ? "warning" : "success",
              },
              {
                label: "Your total savings this year (HDHP / CDHP)",
                value: formatCurrency(totalSavingsThisYear),
                helperText: "Premium savings plus tax savings available to fund your HSA.",
                accent: "success",
              },
            ]}
          />
        </div>
      </div>
    </div>
    <HSAPrintSummary inputs={inputs} results={results} recommendations={recommendations} />
    </Fragment>
  );
}
