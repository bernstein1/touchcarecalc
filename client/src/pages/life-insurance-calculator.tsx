import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calculator, Lightbulb, TrendingUp, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { useLocation } from "wouter";
import { calculateLifeInsurance } from "@/lib/calculations";
import { LifeInsuranceInputs, LifeInsuranceResults } from "@shared/schema";
import { usePDFExport } from "@/lib/pdf/use-pdf-export";
import RecommendationCard from "@/components/recommendations/recommendation-card";
import { generateLifeInsuranceRecommendations } from "@/lib/recommendations/life-recommendations";
import CollapsibleSection from "@/components/ui/collapsible-section";
import { usePrintContext } from "@/context/print-context";
import LifePrintSummary from "@/components/print/life-print-summary";

export default function LifeInsuranceCalculator() {
  const [, navigate] = useLocation();
  const { exportLifeInsuranceReport, isGenerating, error } = usePDFExport();
  const { setPrintHandler } = usePrintContext();
  
  const [inputs, setInputs] = useState<LifeInsuranceInputs>({
    totalDebt: 250000,
    income: 75000,
    mortgageBalance: 200000,
    educationCosts: 100000,
    incomeYears: 10,
    currentInsurance: 50000,
    currentAssets: 0,
    childrenUnder18: 0,
    monthlyLivingExpenses: 0,
  });

  const [results, setResults] = useState<LifeInsuranceResults>({
    dimeTotal: 0,
    additionalNeeded: 0,
    incomeReplacement: 0,
  });

  useEffect(() => {
    const calculatedResults = calculateLifeInsurance(inputs);
    setResults(calculatedResults);
  }, [inputs]);

  const recommendations = useMemo(() => generateLifeInsuranceRecommendations(inputs, results), [inputs, results]);

  const updateInput = (key: keyof LifeInsuranceInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handlePrintSummary = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    setPrintHandler(handlePrintSummary);
    return () => setPrintHandler(null);
  }, [handlePrintSummary, setPrintHandler]);

  return (
    <Fragment>
      <div className="space-y-8 print-hidden">
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
              Life Insurance Needs Calculator
            </h2>
            <p className="text-muted-foreground">
              Estimate how much life insurance could support your family by walking through the DIME method—adding together
              outstanding debts, income replacement, mortgage payoff, and future education goals.
            </p>
          </div>
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
        <div className="md:col-span-2 space-y-6">
          <CollapsibleSection
            title="General Life Insurance Guidance"
            subtitle="Industry best practices"
            defaultOpen={false}
          >
            <GlassCard>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="text-accent mt-1" size={16} />
                  <div>
                    <div className="font-medium text-foreground">Term vs Whole Life</div>
                    <div className="text-xs text-muted-foreground">Term life typically offers the most coverage for the lowest cost during the years your family relies on your income.</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="text-accent mt-1" size={16} />
                  <div>
                    <div className="font-medium text-foreground">Regular Reviews</div>
                    <div className="text-xs text-muted-foreground">Revisit this calculation every year or after milestones like a home purchase, new child, or job change.</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="text-accent mt-1" size={16} />
                  <div>
                    <div className="font-medium text-foreground">Professional Advice</div>
                    <div className="text-xs text-muted-foreground">A licensed advisor can help translate these estimates into the right policy type and coverage amount.</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </CollapsibleSection>

          <GlassCard>
            <h3 className="text-xl font-semibold text-foreground mb-6">Step-by-step DIME calculation</h3>
            <p className="text-sm text-muted-foreground mb-8">
              Follow the DIME method in order: Debt, Income replacement, Mortgage, and Education. Each step builds your total coverage need.
            </p>

            <div className="space-y-8">
              {/* DIME Method Inputs - Now Sequential */}
              <div className="space-y-6">
                {/* D - Debt */}
                <div className="border-l-4 border-primary pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-primary">D</span>
                    <Label className="flex items-center text-lg font-semibold text-foreground">
                      Debt: ${inputs.totalDebt.toLocaleString()}
                      <Tooltip content="Add up every debt your household would still owe if you passed away today—credit cards, auto loans, student loans, personal loans, and any other balances that do not disappear at death." />
                    </Label>
                  </div>
                  <Slider
                    value={[inputs.totalDebt]}
                    onValueChange={(value) => updateInput('totalDebt', value[0])}
                    max={5000000}
                    min={0}
                    step={5000}
                    className="w-full"
                    data-testid="slider-total-debt"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>$5M</span>
                  </div>
                </div>

                {/* I - Income */}
                <div className="border-l-4 border-emerald-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-emerald-500">I</span>
                    <Label className="flex items-center text-lg font-semibold text-foreground">
                      Income Replacement
                      <Tooltip content="Enter your annual income and how many years your family would need support. We'll calculate based on either salary or living expenses—whichever provides better coverage." />
                    </Label>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2">Annual Income</Label>
                      <Input
                        type="number"
                        className="glass-input"
                        value={inputs.income}
                        onChange={(e) => updateInput('income', parseFloat(e.target.value) || 0)}
                        data-testid="input-income"
                        prefix="$"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2">Years of Support</Label>
                      <Select value={inputs.incomeYears.toString()} onValueChange={(value) => updateInput('incomeYears', parseFloat(value))}>
                        <SelectTrigger className="glass-input" data-testid="select-income-years">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 years</SelectItem>
                          <SelectItem value="15">15 years</SelectItem>
                          <SelectItem value="20">20 years</SelectItem>
                          <SelectItem value="25">25 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm text-muted-foreground mb-2">
                      Monthly Living Expenses: ${inputs.monthlyLivingExpenses?.toLocaleString() ?? 0}
                      <span className="text-xs ml-2">(Optional - for more accurate calculation)</span>
                    </Label>
                    <Slider
                      value={[inputs.monthlyLivingExpenses ?? 0]}
                      onValueChange={(value) => updateInput('monthlyLivingExpenses', value[0])}
                      max={15000}
                      min={0}
                      step={100}
                      className="w-full"
                      data-testid="slider-monthly-expenses"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>$0</span>
                      <span>$15k/mo</span>
                    </div>
                  </div>
                </div>

                {/* M - Mortgage */}
                <div className="border-l-4 border-amber-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-amber-500">M</span>
                    <Label className="flex items-center text-lg font-semibold text-foreground">
                      Mortgage: ${inputs.mortgageBalance.toLocaleString()}
                      <Tooltip content="Include the remaining balance on your primary home's mortgage. Paying this off keeps your family in the home without monthly payments." />
                    </Label>
                  </div>
                  <Slider
                    value={[inputs.mortgageBalance]}
                    onValueChange={(value) => updateInput('mortgageBalance', value[0])}
                    max={5000000}
                    min={0}
                    step={5000}
                    className="w-full"
                    data-testid="slider-mortgage-balance"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>$5M</span>
                  </div>
                </div>

                {/* E - Education */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-blue-500">E</span>
                    <Label className="flex items-center text-lg font-semibold text-foreground">
                      Education: ${inputs.educationCosts.toLocaleString()}
                      <Tooltip content="Estimate future education expenses like college tuition, trade school, or private K-12 tuition for your dependents." />
                    </Label>
                  </div>
                  <Slider
                    value={[inputs.educationCosts]}
                    onValueChange={(value) => updateInput('educationCosts', value[0])}
                    max={1000000}
                    min={0}
                    step={5000}
                    className="w-full"
                    data-testid="slider-education-costs"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>$1M</span>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm text-muted-foreground mb-2">
                      Children Under 18
                      <Tooltip content="Number of children currently under age 18. Each adds approximately $50,000 to education coverage." />
                    </Label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateInput('childrenUnder18', Math.max(0, (inputs.childrenUnder18 ?? 0) - 1))}
                        className="h-10 w-10"
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center">
                        <span className="text-2xl font-bold text-foreground">{inputs.childrenUnder18 ?? 0}</span>
                        <p className="text-xs text-muted-foreground">children</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateInput('childrenUnder18', (inputs.childrenUnder18 ?? 0) + 1)}
                        className="h-10 w-10"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assets & Current Insurance */}
              <div className="space-y-6 pt-6 border-t border-border">
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Current Liquid Assets: ${inputs.currentAssets?.toLocaleString() ?? 0}
                    <Tooltip content="Include savings and investment accounts your family could access immediately. These offset your insurance need." />
                  </Label>
                  <Slider
                    value={[inputs.currentAssets ?? 0]}
                    onValueChange={(value) => updateInput('currentAssets', value[0])}
                    max={1000000}
                    min={0}
                    step={5000}
                    className="w-full"
                    data-testid="slider-current-assets"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>$1M</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2">
                    Current Life Insurance: ${inputs.currentInsurance.toLocaleString()}
                    <Tooltip content="Enter the total life insurance that would pay out today, including employer plans and any personal policies. We'll subtract this amount so you only see the potential shortfall." />
                  </Label>
                  <Slider
                    value={[inputs.currentInsurance]}
                    onValueChange={(value) => updateInput('currentInsurance', value[0])}
                    max={5000000}
                    min={0}
                    step={10000}
                    className="w-full"
                    data-testid="slider-current-insurance"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>$2,000,000</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Results */}
        <div className="space-y-6 md:sticky md:top-8 md:self-start">
          <GlassCard>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Coverage Needed</h3>
              <Button
                onClick={() => exportLifeInsuranceReport(inputs, results)}
                disabled={isGenerating}
                className="flex items-center space-x-2"
                data-testid="button-export-pdf"
              >
                <Download size={16} />
                <span>{isGenerating ? 'Generating...' : 'Export PDF'}</span>
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center text-muted-foreground">
                  DIME Total
                  <Tooltip content="This is the combined total of Debt, Income replacement, Mortgage payoff, and Education goals—the full amount that would keep your household on track." />
                </span>
                <span className="text-lg font-semibold text-primary" data-testid="result-dime-total">
                  ${results.dimeTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Coverage</span>
                <span className="text-lg font-semibold text-muted-foreground" data-testid="result-current">
                  ${inputs.currentInsurance.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center text-foreground font-medium">
                    Additional Needed
                    <Tooltip content="Also called your coverage gap, this is how much more life insurance may be needed beyond what you already have to meet the DIME total." />
                  </span>
                  <span className="text-xl font-bold text-accent" data-testid="result-additional-needed">
                    ${results.additionalNeeded.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  If this number is above zero, consider adding that amount of coverage so your family can pay debts, replace
                  income, and pursue future goals without financial strain.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Smart Recommendations */}
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Personalized Recommendations</h3>
              {recommendations.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))}
            </div>
          ) : null}

          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              <Calculator className="inline mr-2" size={20} />
              Enhanced DIME Breakdown
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              The DIME acronym stands for Debt, Income, Mortgage, and Education. We've enhanced this with your current assets,
              children count, and living expenses for a more personalized coverage estimate.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground"><strong>D</strong>ebt:</span>
                <span className="text-foreground font-mono" data-testid="math-debt">
                  ${inputs.totalDebt.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground"><strong>I</strong>ncome ({inputs.incomeYears}yr):</span>
                <span className="text-foreground font-mono" data-testid="math-income">
                  ${results.incomeReplacement.toLocaleString()}
                </span>
              </div>
              {results.livingExpensesComponent && results.livingExpensesComponent > inputs.income * inputs.incomeYears && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground pl-4">↳ Based on living expenses</span>
                  <span className="text-muted-foreground font-mono">
                    (${inputs.monthlyLivingExpenses?.toLocaleString()}/mo × {inputs.incomeYears}yr)
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground"><strong>M</strong>ortgage:</span>
                <span className="text-foreground font-mono" data-testid="math-mortgage">
                  ${inputs.mortgageBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground"><strong>E</strong>ducation:</span>
                <span className="text-foreground font-mono" data-testid="math-education">
                  ${inputs.educationCosts.toLocaleString()}
                </span>
              </div>
              {results.childEducationMultiplier && results.childEducationMultiplier > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground pl-4">↳ Child support buffer</span>
                  <span className="text-muted-foreground font-mono">
                    +${results.childEducationMultiplier.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DIME Total:</span>
                  <span className="text-primary font-mono" data-testid="math-total">
                    ${results.dimeTotal.toLocaleString()}
                  </span>
                </div>
              </div>
              {inputs.currentAssets && inputs.currentAssets > 0 && (
                <>
                  <div className="flex justify-between text-emerald-600">
                    <span>Less: Current Assets</span>
                    <span className="font-mono">-${inputs.currentAssets.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-dashed border-border pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">Adjusted Need:</span>
                      <span className="text-primary font-mono">
                        ${results.adjustedNeed?.toLocaleString() ?? results.dimeTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">TouchCare Coverage Guidance</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                The DIME framework adds together outstanding debts, income replacement, mortgage payoff, and education goals to estimate coverage. It is a starting point and does not include Social Security survivor benefits, investment assets, or estate-planning nuances.
              </p>
              <p>
                Review beneficiaries annually and after major life events. Many households revisit coverage every 24 months or when income changes by more than 10%.
              </p>
              <p className="text-xs text-foreground">
                TouchCare provides educational guidance only. For policy selection or underwriting, consult a licensed insurance professional or financial advisor.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
    <LifePrintSummary inputs={inputs} results={results} />
  </Fragment>
  );
}
