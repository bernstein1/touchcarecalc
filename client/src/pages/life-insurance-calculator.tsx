import { useState, useEffect } from "react";
import { ArrowLeft, Calculator, Lightbulb, TrendingUp, Users } from "lucide-react";
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

export default function LifeInsuranceCalculator() {
  const [, navigate] = useLocation();
  
  const [inputs, setInputs] = useState<LifeInsuranceInputs>({
    totalDebt: 250000,
    income: 75000,
    mortgageBalance: 200000,
    educationCosts: 100000,
    incomeYears: 10,
    currentInsurance: 50000,
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

  const updateInput = (key: keyof LifeInsuranceInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
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
            <p className="text-muted-foreground">Determine adequate coverage using DIME methodology</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard>
            <h3 className="text-xl font-semibold text-foreground mb-6">Financial Information</h3>
            
            <div className="space-y-8">
              {/* DIME Method Inputs */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Debt */}
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                    Total Debt: ${inputs.totalDebt.toLocaleString()}
                    <Tooltip content="Include mortgage, credit cards, loans, and other debts your family would need to pay." />
                  </Label>
                  <Slider
                    value={[inputs.totalDebt]}
                    onValueChange={(value) => updateInput('totalDebt', value[0])}
                    max={1000000}
                    min={0}
                    step={5000}
                    className="w-full"
                    data-testid="slider-total-debt"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>$1,000,000</span>
                  </div>
                </div>

                {/* Income */}
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                    Annual Income
                    <Tooltip content="Your gross annual income that would need to be replaced for your family." />
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      className="glass-input pl-8"
                      value={inputs.income}
                      onChange={(e) => updateInput('income', parseFloat(e.target.value) || 0)}
                      data-testid="input-income"
                    />
                  </div>
                </div>

                {/* Mortgage */}
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                    Mortgage Balance: ${inputs.mortgageBalance.toLocaleString()}
                    <Tooltip content="Outstanding mortgage balance that could be paid off to reduce family expenses." />
                  </Label>
                  <Slider
                    value={[inputs.mortgageBalance]}
                    onValueChange={(value) => updateInput('mortgageBalance', value[0])}
                    max={1000000}
                    min={0}
                    step={5000}
                    className="w-full"
                    data-testid="slider-mortgage-balance"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>$1,000,000</span>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                    Future Education Costs: ${inputs.educationCosts.toLocaleString()}
                    <Tooltip content="Estimated costs for children's education, including college expenses." />
                  </Label>
                  <Slider
                    value={[inputs.educationCosts]}
                    onValueChange={(value) => updateInput('educationCosts', value[0])}
                    max={500000}
                    min={0}
                    step={5000}
                    className="w-full"
                    data-testid="slider-education-costs"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>$500,000</span>
                  </div>
                </div>
              </div>

              {/* Additional Parameters */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2">Years of Income Replacement</Label>
                  <Select value={inputs.incomeYears.toString()} onValueChange={(value) => updateInput('incomeYears', parseFloat(value))}>
                    <SelectTrigger className="glass-input" data-testid="select-income-years">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 years</SelectItem>
                      <SelectItem value="15">15 years</SelectItem>
                      <SelectItem value="20">20 years</SelectItem>
                      <SelectItem value="25">25 years (until retirement)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2">
                    Current Life Insurance: ${inputs.currentInsurance.toLocaleString()}
                  </Label>
                  <Slider
                    value={[inputs.currentInsurance]}
                    onValueChange={(value) => updateInput('currentInsurance', value[0])}
                    max={2000000}
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
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">Coverage Needed</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">DIME Total</span>
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
                  <span className="text-foreground font-medium">Additional Needed</span>
                  <span className="text-xl font-bold text-accent" data-testid="result-additional-needed">
                    ${results.additionalNeeded.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              <Calculator className="inline mr-2" size={20} />
              DIME Breakdown
            </h3>
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
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Need:</span>
                  <span className="text-primary font-mono" data-testid="math-total">
                    ${results.dimeTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">Recommendations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <Lightbulb className="text-accent mt-1" size={16} />
                <div>
                  <div className="font-medium text-foreground">Term vs Whole Life</div>
                  <div className="text-xs text-muted-foreground">Consider term life for temporary needs</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="text-accent mt-1" size={16} />
                <div>
                  <div className="font-medium text-foreground">Regular Reviews</div>
                  <div className="text-xs text-muted-foreground">Update calculations annually</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="text-accent mt-1" size={16} />
                <div>
                  <div className="font-medium text-foreground">Professional Advice</div>
                  <div className="text-xs text-muted-foreground">Consult with insurance professional</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
