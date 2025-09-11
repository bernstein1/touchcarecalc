import { useState, useEffect } from "react";
import { ArrowLeft, Calculator, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { useLocation } from "wouter";
import { calculateHSA, CONTRIBUTION_LIMITS } from "@/lib/calculations";
import { HSAInputs, HSAResults } from "@shared/schema";

export default function HSACalculator() {
  const [, navigate] = useLocation();
  
  const [inputs, setInputs] = useState<HSAInputs>({
    accountType: 'hsa',
    coverage: 'individual',
    income: 75000,
    contribution: 3000,
    taxBracket: 22,
  });

  const [results, setResults] = useState<HSAResults>({
    actualContribution: 0,
    taxSavings: 0,
    effectiveCost: 0,
    taxableIncome: 0,
    contributionLimit: 0,
  });

  useEffect(() => {
    const calculatedResults = calculateHSA(inputs);
    setResults(calculatedResults);
  }, [inputs]);

  const updateInput = (key: keyof HSAInputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const getLimitText = () => {
    const accountTypeText = inputs.accountType.toUpperCase();
    const coverageText = inputs.coverage === 'family' ? 'Family' : 'Individual';
    return `2025 ${coverageText} ${accountTypeText} Limit: $${results.contributionLimit.toLocaleString()}`;
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
              HSA/FSA Calculator
            </h2>
            <p className="text-muted-foreground">Calculate your health savings account tax benefits</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Updated for 2025</p>
          <p className="text-xs text-muted-foreground">IRS Publication 969</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard>
            <h3 className="text-xl font-semibold text-foreground mb-6">Account Information</h3>
            
            {/* Account Type */}
            <div className="mb-8">
              <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                Account Type
                <Tooltip content="HSA requires high-deductible health plan. FSA has 'use it or lose it' rules." />
              </Label>
              <RadioGroup
                value={inputs.accountType}
                onValueChange={(value) => updateInput('accountType', value as 'hsa' | 'fsa')}
                className="grid grid-cols-2 gap-4"
              >
                <div className={`glass-input rounded-xl p-4 cursor-pointer transition-colors ${
                  inputs.accountType === 'hsa' 
                    ? 'bg-primary/20 border-primary ring-2 ring-primary/50' 
                    : 'hover:bg-primary/10'
                }`}>
                  <RadioGroupItem value="hsa" id="hsa" className="sr-only" />
                  <Label htmlFor="hsa" className="cursor-pointer">
                    <div className="text-center">
                      <div className="text-primary text-2xl mb-2">💗</div>
                      <div className="font-medium text-foreground">HSA</div>
                      <div className="text-xs text-muted-foreground">Health Savings Account</div>
                    </div>
                  </Label>
                </div>
                <div className={`glass-input rounded-xl p-4 cursor-pointer transition-colors ${
                  inputs.accountType === 'fsa' 
                    ? 'bg-secondary/20 border-secondary ring-2 ring-secondary/50' 
                    : 'hover:bg-primary/10'
                }`}>
                  <RadioGroupItem value="fsa" id="fsa" className="sr-only" />
                  <Label htmlFor="fsa" className="cursor-pointer">
                    <div className="text-center">
                      <div className="text-secondary text-2xl mb-2">📋</div>
                      <div className="font-medium text-foreground">FSA</div>
                      <div className="text-xs text-muted-foreground">Flexible Spending Account</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Coverage Level */}
            <div className="mb-8">
              <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                Coverage Level
                <Tooltip content="Family coverage includes spouse and dependents. Individual is self-only." />
              </Label>
              <RadioGroup
                value={inputs.coverage}
                onValueChange={(value) => updateInput('coverage', value as 'individual' | 'family')}
                className="grid grid-cols-2 gap-4"
              >
                <div className={`glass-input rounded-xl p-4 cursor-pointer transition-colors ${
                  inputs.coverage === 'individual' 
                    ? 'bg-primary/20 border-primary ring-2 ring-primary/50' 
                    : 'hover:bg-primary/10'
                }`}>
                  <RadioGroupItem value="individual" id="individual" className="sr-only" />
                  <Label htmlFor="individual" className="cursor-pointer">
                    <div className="text-center">
                      <div className="text-primary text-xl mb-2">👤</div>
                      <div className="font-medium text-foreground">Individual</div>
                      <div className="text-xs text-muted-foreground">Self-only coverage</div>
                    </div>
                  </Label>
                </div>
                <div className={`glass-input rounded-xl p-4 cursor-pointer transition-colors ${
                  inputs.coverage === 'family' 
                    ? 'bg-primary/20 border-primary ring-2 ring-primary/50' 
                    : 'hover:bg-primary/10'
                }`}>
                  <RadioGroupItem value="family" id="family" className="sr-only" />
                  <Label htmlFor="family" className="cursor-pointer">
                    <div className="text-center">
                      <div className="text-primary text-xl mb-2">👨‍👩‍👧‍👦</div>
                      <div className="font-medium text-foreground">Family</div>
                      <div className="text-xs text-muted-foreground">Spouse + dependents</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Financial Information */}
            <div className="space-y-6">
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Annual Income
                  <Tooltip content="Your gross annual salary before taxes and deductions." />
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

              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Planned Annual Contribution: ${inputs.contribution.toLocaleString()}
                  <Tooltip content="Amount you plan to contribute annually. Cannot exceed IRS limits." />
                </Label>
                <Slider
                  value={[inputs.contribution]}
                  onValueChange={(value) => updateInput('contribution', value[0])}
                  max={results.contributionLimit}
                  min={0}
                  step={50}
                  className="w-full"
                  data-testid="slider-contribution"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$0</span>
                  <span>${results.contributionLimit.toLocaleString()}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground" data-testid="text-contribution-limit">
                  {getLimitText()}
                </div>
              </div>

              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Tax Bracket
                  <Tooltip content="Your marginal federal tax rate. State taxes may provide additional savings." />
                </Label>
                <Select value={inputs.taxBracket.toString()} onValueChange={(value) => updateInput('taxBracket', parseFloat(value))}>
                  <SelectTrigger className="glass-input" data-testid="select-tax-bracket">
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
            </div>
          </GlassCard>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Quick Results */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">Tax Savings Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Annual Contribution</span>
                <span className="text-lg font-semibold text-foreground" data-testid="result-contribution">
                  ${results.actualContribution.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Federal Tax Savings</span>
                <span className="text-lg font-semibold text-secondary" data-testid="result-savings">
                  ${Math.round(results.taxSavings).toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Effective Cost</span>
                  <span className="text-xl font-bold text-primary" data-testid="result-cost">
                    ${Math.round(results.effectiveCost).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Show the Math */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              <Calculator className="inline mr-2" size={20} />
              Show the Math
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Income:</span>
                <span className="text-foreground font-mono" data-testid="math-income">
                  ${inputs.income.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">HSA Contribution:</span>
                <span className="text-foreground font-mono" data-testid="math-contribution">
                  - ${results.actualContribution.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxable Income:</span>
                <span className="text-foreground font-mono" data-testid="math-taxable">
                  ${results.taxableIncome.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Rate:</span>
                  <span className="text-foreground font-mono" data-testid="math-rate">
                    {inputs.taxBracket}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Savings:</span>
                  <span className="text-secondary font-mono" data-testid="math-savings">
                    ${Math.round(results.taxSavings).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Benefits Breakdown */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">Additional Benefits</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Check className="text-secondary mt-1" size={16} />
                <div>
                  <div className="font-medium text-foreground">Tax-Free Growth</div>
                  <div className="text-xs text-muted-foreground">Earnings grow without taxes</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="text-secondary mt-1" size={16} />
                <div>
                  <div className="font-medium text-foreground">Triple Tax Advantage</div>
                  <div className="text-xs text-muted-foreground">Deductible, growth, and withdrawals</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="text-secondary mt-1" size={16} />
                <div>
                  <div className="font-medium text-foreground">No Required Minimum</div>
                  <div className="text-xs text-muted-foreground">Unlike traditional retirement accounts</div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
