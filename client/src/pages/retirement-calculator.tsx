import { useState, useEffect } from "react";
import { ArrowLeft, Calculator, TrendingUp, DollarSign, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { useLocation } from "wouter";
import { calculateRetirement, CONTRIBUTION_LIMITS } from "@/lib/calculations";
import { RetirementInputs, RetirementResults } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export default function RetirementCalculator() {
  const [, navigate] = useLocation();
  
  const [inputs, setInputs] = useState<RetirementInputs>({
    currentAge: 30,
    retirementAge: 65,
    currentSalary: 75000,
    currentSavings: 10000,
    employeeContribution: 10,
    employerMatch: 50,
    employerMatchCap: 6,
    expectedReturn: 7,
    salaryGrowth: 3,
    contributionType: 'traditional',
    taxBracket: 22,
  });

  const [results, setResults] = useState<RetirementResults>({
    finalBalance: 0,
    totalContributions: 0,
    employerContributions: 0,
    investmentGrowth: 0,
    monthlyContribution: 0,
    yearlyProjections: [],
    taxSavings: 0,
  });

  useEffect(() => {
    const calculatedResults = calculateRetirement(inputs);
    setResults(calculatedResults);
  }, [inputs]);

  const updateInput = (key: keyof RetirementInputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const contributionLimit = inputs.currentAge >= 50 ? 
    CONTRIBUTION_LIMITS.RETIREMENT_TOTAL_WITH_CATCHUP : 
    CONTRIBUTION_LIMITS.RETIREMENT_401K;

  const chartData = results.yearlyProjections.slice(0, Math.min(20, results.yearlyProjections.length)).map(projection => ({
    year: projection.year,
    age: projection.age,
    balance: projection.balance,
    contributions: projection.totalContribution
  }));

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
              401(k) Retirement Calculator
            </h2>
            <p className="text-muted-foreground">Plan your retirement with compound interest projections</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">2025 Contribution Limits</p>
          <p className="text-xs text-muted-foreground">Under 50: $23,000 | 50+: $30,500</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <GlassCard>
            <h3 className="text-xl font-semibold text-foreground mb-6">Personal Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Current Age
                  <Tooltip content="Your current age affects contribution limits and time to retirement." />
                </Label>
                <Input
                  type="number"
                  className="glass-input"
                  value={inputs.currentAge}
                  onChange={(e) => updateInput('currentAge', parseFloat(e.target.value) || 0)}
                  data-testid="input-current-age"
                />
              </div>

              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Retirement Age
                  <Tooltip content="The age at which you plan to retire. Full Social Security benefits start at 67." />
                </Label>
                <Select value={inputs.retirementAge.toString()} onValueChange={(value) => updateInput('retirementAge', parseFloat(value))}>
                  <SelectTrigger className="glass-input" data-testid="select-retirement-age">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="62">62 - Early retirement</SelectItem>
                    <SelectItem value="65">65 - Traditional retirement</SelectItem>
                    <SelectItem value="67">67 - Full Social Security</SelectItem>
                    <SelectItem value="70">70 - Maximum Social Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Current Annual Salary
                  <Tooltip content="Your current gross annual income before taxes and deductions." />
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    className="glass-input pl-8"
                    value={inputs.currentSalary}
                    onChange={(e) => updateInput('currentSalary', parseFloat(e.target.value) || 0)}
                    data-testid="input-current-salary"
                  />
                </div>
              </div>

              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Current 401(k) Balance
                  <Tooltip content="The current value of your 401(k) or retirement savings accounts." />
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    className="glass-input pl-8"
                    value={inputs.currentSavings}
                    onChange={(e) => updateInput('currentSavings', parseFloat(e.target.value) || 0)}
                    data-testid="input-current-savings"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Contribution Settings */}
          <GlassCard>
            <h3 className="text-xl font-semibold text-foreground mb-6">Contribution Settings</h3>
            
            <div className="space-y-8">
              {/* Contribution Type */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                  Contribution Type
                  <Tooltip content="Traditional contributions are pre-tax, Roth are after-tax but grow tax-free." />
                </Label>
                <RadioGroup
                  value={inputs.contributionType}
                  onValueChange={(value) => updateInput('contributionType', value as 'traditional' | 'roth' | 'both')}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="glass-input rounded-xl p-4 cursor-pointer hover:bg-primary/10 transition-colors">
                    <RadioGroupItem value="traditional" id="traditional" className="sr-only" />
                    <Label htmlFor="traditional" className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-primary text-xl mb-2">📊</div>
                        <div className="font-medium text-foreground">Traditional</div>
                        <div className="text-xs text-muted-foreground">Pre-tax contributions</div>
                      </div>
                    </Label>
                  </div>
                  <div className="glass-input rounded-xl p-4 cursor-pointer hover:bg-primary/10 transition-colors">
                    <RadioGroupItem value="roth" id="roth" className="sr-only" />
                    <Label htmlFor="roth" className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-secondary text-xl mb-2">🌱</div>
                        <div className="font-medium text-foreground">Roth</div>
                        <div className="text-xs text-muted-foreground">After-tax contributions</div>
                      </div>
                    </Label>
                  </div>
                  <div className="glass-input rounded-xl p-4 cursor-pointer hover:bg-primary/10 transition-colors">
                    <RadioGroupItem value="both" id="both" className="sr-only" />
                    <Label htmlFor="both" className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-accent text-xl mb-2">⚖️</div>
                        <div className="font-medium text-foreground">Both</div>
                        <div className="text-xs text-muted-foreground">Mixed strategy</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Contribution Percentages */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Employee Contribution (%)
                    <Tooltip content="Percentage of salary you contribute to your 401(k). Most experts recommend at least 10-15%." />
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      className="glass-input pr-8"
                      value={inputs.employeeContribution}
                      onChange={(e) => updateInput('employeeContribution', parseFloat(e.target.value) || 0)}
                      data-testid="input-employee-contribution"
                    />
                    <span className="absolute right-4 top-3 text-muted-foreground">%</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground" data-testid="text-contribution-limit">
                    2025 Annual Limit: ${contributionLimit.toLocaleString()}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Tax Bracket
                    <Tooltip content="Your marginal federal tax rate. Used to calculate tax savings for traditional contributions." />
                  </Label>
                  <Select value={inputs.taxBracket.toString()} onValueChange={(value) => updateInput('taxBracket', parseFloat(value))}>
                    <SelectTrigger className="glass-input" data-testid="select-tax-bracket">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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

              {/* Employer Match */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Employer Match (%)
                    <Tooltip content="How much your employer matches for each 1% you contribute. Common matches are 50% or 100%." />
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      className="glass-input pr-8"
                      value={inputs.employerMatch}
                      onChange={(e) => updateInput('employerMatch', parseFloat(e.target.value) || 0)}
                      data-testid="input-employer-match"
                    />
                    <span className="absolute right-4 top-3 text-muted-foreground">%</span>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Match Cap (%)
                    <Tooltip content="Maximum contribution percentage that qualifies for employer match. Often 3-6% of salary." />
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      className="glass-input pr-8"
                      value={inputs.employerMatchCap}
                      onChange={(e) => updateInput('employerMatchCap', parseFloat(e.target.value) || 0)}
                      data-testid="input-employer-match-cap"
                    />
                    <span className="absolute right-4 top-3 text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              {/* Growth Assumptions */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Expected Annual Return (%)
                    <Tooltip content="Historical stock market average is around 7-10%. Conservative estimates use 6-7%." />
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      className="glass-input pr-8"
                      value={inputs.expectedReturn}
                      onChange={(e) => updateInput('expectedReturn', parseFloat(e.target.value) || 0)}
                      data-testid="input-expected-return"
                    />
                    <span className="absolute right-4 top-3 text-muted-foreground">%</span>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Annual Salary Growth (%)
                    <Tooltip content="Expected annual salary increases. Historical average is 2-4% including inflation." />
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      className="glass-input pr-8"
                      value={inputs.salaryGrowth}
                      onChange={(e) => updateInput('salaryGrowth', parseFloat(e.target.value) || 0)}
                      data-testid="input-salary-growth"
                    />
                    <span className="absolute right-4 top-3 text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Quick Results */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">Retirement Projection</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Final Balance</span>
                <span className="text-lg font-semibold text-primary" data-testid="result-final-balance">
                  ${results.finalBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Your Contributions</span>
                <span className="text-lg font-semibold text-foreground" data-testid="result-total-contributions">
                  ${results.totalContributions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Employer Match</span>
                <span className="text-lg font-semibold text-secondary" data-testid="result-employer-contributions">
                  ${results.employerContributions.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Investment Growth</span>
                  <span className="text-xl font-bold text-accent" data-testid="result-investment-growth">
                    ${results.investmentGrowth.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Show the Math */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              <Calculator className="inline mr-2" size={20} />
              Monthly Breakdown
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Contribution:</span>
                <span className="text-foreground font-mono" data-testid="math-monthly">
                  ${Math.round(results.monthlyContribution).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Years to Retirement:</span>
                <span className="text-foreground font-mono" data-testid="math-years">
                  {inputs.retirementAge - inputs.currentAge}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Return:</span>
                <span className="text-foreground font-mono" data-testid="math-return">
                  {inputs.expectedReturn}%
                </span>
              </div>
              {inputs.contributionType === 'traditional' && (
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Tax Savings:</span>
                    <span className="text-secondary font-mono" data-testid="math-tax-savings">
                      ${Math.round(results.taxSavings / (inputs.retirementAge - inputs.currentAge)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Growth Chart */}
          {chartData.length > 0 && (
            <GlassCard>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                <TrendingUp className="inline mr-2" size={20} />
                Growth Projection
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="age" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {/* Key Insights */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">Key Insights</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <DollarSign className="text-accent mt-1" size={16} />
                <div>
                  <div className="font-medium text-foreground">Compound Interest</div>
                  <div className="text-xs text-muted-foreground">
                    Investment growth represents {((results.investmentGrowth / results.finalBalance) * 100).toFixed(0)}% of final balance
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <PiggyBank className="text-accent mt-1" size={16} />
                <div>
                  <div className="font-medium text-foreground">Employer Match</div>
                  <div className="text-xs text-muted-foreground">
                    Free money worth ${results.employerContributions.toLocaleString()} total
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="text-accent mt-1" size={16} />
                <div>
                  <div className="font-medium text-foreground">Time Factor</div>
                  <div className="text-xs text-muted-foreground">
                    Starting early gives more time for compound growth
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}