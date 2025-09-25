import { useState, useEffect } from "react";
import { ArrowLeft, Calculator, TrendingUp, DollarSign, PiggyBank, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { useLocation } from "wouter";
import { calculateRetirement, CONTRIBUTION_LIMITS } from "@/lib/calculations";
import { RetirementInputs, RetirementResults } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { usePDFExport } from "@/lib/pdf/use-pdf-export";

export default function RetirementCalculator() {
  const [, navigate] = useLocation();
  const { exportRetirementReport, isGenerating, error } = usePDFExport();
  
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
    bothSplitTraditional: 50,
  });

  const [results, setResults] = useState<RetirementResults>({
    finalBalance: 0,
    totalContributions: 0,
    employerContributions: 0,
    totalTraditionalContributions: 0,
    totalRothContributions: 0,
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

  const totalYears = results.yearlyProjections.length;
  const samplingStep = totalYears > 60 ? Math.ceil(totalYears / 60) : 1;
  const sampledProjections = results.yearlyProjections.filter((_, index) => index % samplingStep === 0 || index === totalYears - 1);

  const chartData = [
    {
      year: 0,
      age: inputs.currentAge,
      balance: inputs.currentSavings,
      contributions: 0,
    },
    ...sampledProjections.map((projection) => ({
      year: projection.year,
      age: projection.age,
      balance: projection.balance,
      contributions: projection.totalContribution,
    })),
  ];

  const maxBalance = chartData.length > 0 ? Math.max(...chartData.map((point) => point.balance)) : 0;
  const minAge = chartData.length > 0 ? Math.min(...chartData.map((point) => point.age)) : inputs.currentAge;
  const maxAge = chartData.length > 0 ? Math.max(...chartData.map((point) => point.age)) : inputs.retirementAge;
  const xDomain = minAge === maxAge ? [minAge, minAge + 1] : [minAge, maxAge];
  const yDomain = maxBalance > 0 ? [0, Math.ceil((maxBalance * 1.1) / 5000) * 5000] : [0, 5000];

  const totalEmployeeContribution = results.totalContributions;
  const effectiveTraditionalShare = totalEmployeeContribution > 0
    ? Math.round((results.totalTraditionalContributions / totalEmployeeContribution) * 100)
    : inputs.contributionType === 'traditional'
      ? 100
      : inputs.contributionType === 'both'
        ? inputs.bothSplitTraditional ?? 50
        : 0;
  const effectiveRothShare = totalEmployeeContribution > 0
    ? Math.max(0, 100 - effectiveTraditionalShare)
    : inputs.contributionType === 'roth'
      ? 100
      : inputs.contributionType === 'both'
        ? 100 - (inputs.bothSplitTraditional ?? 50)
        : 0;
  const sliderTraditionalShare = inputs.bothSplitTraditional ?? 50;
  const sliderRothShare = 100 - sliderTraditionalShare;
  const projectionYears = Math.max(results.yearlyProjections.length, 1);
  const annualTraditionalContribution = results.totalTraditionalContributions / projectionYears;
  const annualRothContribution = results.totalRothContributions / projectionYears;
  const yearsToRetirementValue = Math.max(inputs.retirementAge - inputs.currentAge, 1);

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
                  Current Age: {inputs.currentAge}
                <Tooltip content="Enter how old you are today. Your age tells the calculator how many years you have until retirement, when catch-up contribution limits start (age 50+), and how long your money has to grow before you begin withdrawals." />
                </Label>
                <Slider
                  value={[inputs.currentAge]}
                  onValueChange={(value) => updateInput('currentAge', value[0])}
                  max={70}
                  min={18}
                  step={1}
                  className="w-full"
                  data-testid="slider-current-age"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>18</span>
                  <span>70</span>
                </div>
              </div>

              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                  Retirement Age
                <Tooltip content="Choose the age when you expect to stop full-time work. This target controls how many years you have to save and when you may start drawing Social Security or tapping retirement accounts; retiring earlier means fewer saving years and more time spent living off your nest egg." />
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
                  <Tooltip content="Enter the amount you earn in salary each year before taxes and payroll deductions. The calculator multiplies this by your contribution percentage to estimate how much you are putting into the plan each paycheck." />
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
                  Current 401(k) Balance: ${inputs.currentSavings.toLocaleString()}
                  <Tooltip content="Type in the total balance you already have saved in this retirement account (and similar workplace plans). This serves as your starting point so the projection grows both what you have today and what you will contribute going forward." />
                </Label>
                <Slider
                  value={[inputs.currentSavings]}
                  onValueChange={(value) => updateInput('currentSavings', value[0])}
                  max={500000}
                  min={0}
                  step={1000}
                  className="w-full"
                  data-testid="slider-current-savings"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$0</span>
                  <span>$500,000</span>
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
                  <Tooltip content="Traditional 401(k) contributions come out of your paycheck before taxes, lowering today’s taxable income but creating taxable withdrawals later. Roth contributions are taxed now but can be withdrawn tax-free in retirement. Selecting 'Both' splits your ongoing contributions between the two approaches." />
                </Label>
                <RadioGroup
                  value={inputs.contributionType}
                  onValueChange={(value) => updateInput('contributionType', value as 'traditional' | 'roth' | 'both')}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className={`glass-input rounded-xl p-4 cursor-pointer transition-colors ${
                    inputs.contributionType === 'traditional' 
                      ? 'bg-primary/20 border-primary ring-2 ring-primary/50' 
                      : 'hover:bg-primary/10'
                  }`}>
                    <RadioGroupItem value="traditional" id="traditional" className="sr-only" />
                    <Label htmlFor="traditional" className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-primary text-xl mb-2">📊</div>
                        <div className="font-medium text-foreground">Traditional</div>
                        <div className="text-xs text-muted-foreground">Pre-tax contributions</div>
                      </div>
                    </Label>
                  </div>
                  <div className={`glass-input rounded-xl p-4 cursor-pointer transition-colors ${
                    inputs.contributionType === 'roth' 
                      ? 'bg-secondary/20 border-secondary ring-2 ring-secondary/50' 
                      : 'hover:bg-primary/10'
                  }`}>
                    <RadioGroupItem value="roth" id="roth" className="sr-only" />
                    <Label htmlFor="roth" className="cursor-pointer">
                      <div className="text-center">
                        <div className="text-secondary text-xl mb-2">🌱</div>
                        <div className="font-medium text-foreground">Roth</div>
                        <div className="text-xs text-muted-foreground">After-tax contributions</div>
                      </div>
                    </Label>
                  </div>
                  <div className={`glass-input rounded-xl p-4 cursor-pointer transition-colors ${
                    inputs.contributionType === 'both' 
                      ? 'bg-accent/20 border-accent ring-2 ring-accent/50' 
                      : 'hover:bg-primary/10'
                  }`}>
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
                {inputs.contributionType === 'both' && (
                  <div className="mt-6">
                    <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                      Traditional vs. Roth Split
                    </Label>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Traditional 0%</span>
                      <span>Roth 100%</span>
                    </div>
                    <Slider
                      value={[inputs.bothSplitTraditional ?? 50]}
                      onValueChange={(value) => updateInput('bothSplitTraditional', value[0])}
                      max={100}
                      min={0}
                      step={5}
                      disabled={inputs.employeeContribution === 0}
                      aria-label="Traditional contribution percentage"
                      className="w-full"
                      data-testid="slider-both-split"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Traditional {sliderTraditionalShare}%</span>
                      <span>Roth {sliderRothShare}%</span>
                    </div>
                    {inputs.employeeContribution === 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Increase your employee contribution to unlock the split slider.
                      </p>
                    )}
                    {inputs.employeeContribution > 0 && inputs.currentAge >= 50 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Catch-up contributions are treated as Traditional for tax savings.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Contribution Percentages */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Employee Contribution: {inputs.employeeContribution}%
                    <Tooltip content="Set the share of each paycheck you want the plan to contribute automatically. Many advisors suggest saving 10–15% of gross pay, but any percentage helps; the calculator multiplies this rate by your salary each year to project the dollars invested." />
                  </Label>
                  <Slider
                    value={[inputs.employeeContribution]}
                    onValueChange={(value) => updateInput('employeeContribution', value[0])}
                    max={50}
                    min={0}
                    step={0.5}
                    className="w-full"
                    data-testid="slider-employee-contribution"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground" data-testid="text-contribution-limit">
                    2025 Annual Limit: ${contributionLimit.toLocaleString()}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Tax Bracket
                    <Tooltip content="Select the tax bracket that applies to the top portion of your income. When you choose traditional contributions, the calculator uses this marginal rate to estimate how much federal tax you defer by saving pre-tax dollars." />
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
                    Employer Match: {inputs.employerMatch}%
                    <Tooltip content="Many employers add money to your account when you contribute. Enter the percentage your employer matches for each percentage point you save—for example, a 50% match means they contribute 0.5% for every 1% you put in." />
                  </Label>
                  <Slider
                    value={[inputs.employerMatch]}
                    onValueChange={(value) => updateInput('employerMatch', value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                    data-testid="slider-employer-match"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Match Cap: {inputs.employerMatchCap}%
                    <Tooltip content="Employers usually limit the match to a certain portion of your salary. If the cap is 6%, any contributions you make above 6% do not receive additional matching dollars. Enter that cap so the calculator stops the match once you hit the threshold." />
                  </Label>
                  <Slider
                    value={[inputs.employerMatchCap]}
                    onValueChange={(value) => updateInput('employerMatchCap', value[0])}
                    max={15}
                    min={0}
                    step={0.5}
                    className="w-full"
                    data-testid="slider-employer-match-cap"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>

              {/* Growth Assumptions */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Expected Annual Return: {inputs.expectedReturn}%
                    <Tooltip content="Choose the average annual investment return you want to model. Long-term stock-heavy portfolios have historically earned about 7–10% before fees, but actual results vary year to year. Use a conservative number if you prefer a cautious projection." />
                  </Label>
                  <Slider
                    value={[inputs.expectedReturn]}
                    onValueChange={(value) => updateInput('expectedReturn', value[0])}
                    max={15}
                    min={1}
                    step={0.1}
                    className="w-full"
                    data-testid="slider-expected-return"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1%</span>
                    <span>15%</span>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center text-sm font-medium text-foreground mb-2">
                    Annual Salary Growth: {inputs.salaryGrowth}%
                    <Tooltip content="Estimate how much your pay may rise each year from raises, promotions, and inflation. Higher salary growth means larger contributions over time because the same percentage of a bigger paycheck equals more dollars invested." />
                  </Label>
                  <Slider
                    value={[inputs.salaryGrowth]}
                    onValueChange={(value) => updateInput('salaryGrowth', value[0])}
                    max={10}
                    min={0}
                    step={0.1}
                    className="w-full"
                    data-testid="slider-salary-growth"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>10%</span>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Retirement Projection</h3>
              <Button
                onClick={() => exportRetirementReport(inputs, results)}
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
              <div className="text-xs text-muted-foreground">
                {inputs.contributionType === 'traditional' && '100% Traditional contributions'}
                {inputs.contributionType === 'roth' && '100% Roth contributions'}
                {inputs.contributionType === 'both' && (
                  <span>
                    Traditional ${results.totalTraditionalContributions.toLocaleString()} ({effectiveTraditionalShare}%){' | '}
                    Roth ${results.totalRothContributions.toLocaleString()} ({effectiveRothShare}%)
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Employer Match</span>
                <span className="text-lg font-semibold text-foreground" data-testid="result-employer-contributions">
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
              {inputs.contributionType === 'both' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Traditional Portion:</span>
                    <span className="text-foreground font-mono">
                      ${Math.round(annualTraditionalContribution).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Roth Portion:</span>
                    <span className="text-foreground font-mono">
                      ${Math.round(annualRothContribution).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
              {(inputs.contributionType === 'traditional' || results.taxSavings > 0) && (
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Tax Savings:</span>
                    <span className="text-foreground font-mono" data-testid="math-tax-savings">
                      ${Math.round(results.taxSavings / yearsToRetirementValue).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Growth Chart */}
          {chartData.length > 1 && (
            <GlassCard>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                <TrendingUp className="inline mr-2" size={20} />
                Growth Projection
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      type="number"
                      dataKey="age"
                      domain={xDomain}
                      allowDecimals={false}
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickFormatter={(value) => `Age ${value}`}
                      minTickGap={16}
                    />
                    <YAxis
                      domain={yDomain}
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip
                      cursor={{ stroke: "var(--accent)", strokeDasharray: "3 3" }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Balance"]}
                      labelFormatter={(label) => `Age ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}
          {chartData.length <= 1 && (
            <GlassCard>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                <TrendingUp className="inline mr-2" size={20} />
                Growth Projection
              </h3>
              <div className="text-sm text-muted-foreground">
                Adjust the current and retirement ages to generate a projection timeline.
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
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">TouchCare Retirement Guidance</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Projections assume even returns, no hardship withdrawals, and constant salary growth. Actual balances can change with market volatility, plan fees, loan activity, and contribution pauses.
              </p>
              <p>
                Confirm employer match percentages, vesting schedules, and contribution timing—many plans match per paycheck rather than annually. Catch-up contributions for individuals age 50+ add $7,500 to the 2025 limit and must be elected separately.
              </p>
              <p className="text-xs text-foreground">
                Educational tool only—TouchCare is not providing individualized investment, legal, or tax advice. Consult a fiduciary advisor before adjusting allocations or contribution elections.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
