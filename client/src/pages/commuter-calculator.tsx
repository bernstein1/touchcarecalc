import { useState, useEffect } from "react";
import { ArrowLeft, Calculator, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { useLocation } from "wouter";
import { calculateCommuter } from "@/lib/calculations";
import { getMarginalTaxRate, describeFilingStatus } from "@/lib/tax/brackets";
import { CommuterInputs, CommuterResults, FilingStatus } from "@shared/schema";
import { usePDFExport } from "@/lib/pdf/use-pdf-export";

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: describeFilingStatus("single") },
  { value: "marriedJoint", label: describeFilingStatus("marriedJoint") },
  { value: "marriedSeparate", label: describeFilingStatus("marriedSeparate") },
  { value: "headOfHousehold", label: describeFilingStatus("headOfHousehold") },
];

export default function CommuterCalculator() {
  const [, navigate] = useLocation();
  const { exportCommuterReport, isGenerating, error } = usePDFExport();
  
  const [inputs, setInputs] = useState<CommuterInputs>({
    transitCost: 200,
    parkingCost: 150,
    annualIncome: 85000,
    filingStatus: "single",
  });

  const [results, setResults] = useState<CommuterResults>({
    transitSavings: 0,
    parkingSavings: 0,
    totalSavings: 0,
    annualTransit: 0,
    annualParking: 0,
    annualTotal: 0,
    marginalRate: 0,
  });

  useEffect(() => {
    const calculatedResults = calculateCommuter(inputs);
    setResults(calculatedResults);
  }, [inputs]);

  const updateInput = <K extends keyof CommuterInputs>(key: K, value: CommuterInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const marginalRate = results.marginalRate ?? getMarginalTaxRate(inputs.annualIncome, inputs.filingStatus);

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
              Commuter Benefits Calculator
            </h2>
            <p className="text-muted-foreground">Calculate pre-tax savings on transit and parking</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard>
            <h3 className="text-xl font-semibold text-foreground mb-6">Commute Expenses</h3>
            
            <div className="space-y-8">
              {/* Transit Expenses */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                  Monthly Transit Costs: ${inputs.transitCost}
                  <Tooltip content="Eligible expenses are the rides the IRS says count for this benefit—monthly passes, pay-per-ride fares, or employer vanpools you use to get to work. You can move up to $340 per month in 2026 from your paycheck before taxes for these costs; anything over that comes out after tax." />
                </Label>
                <Slider
                  value={[inputs.transitCost]}
                  onValueChange={(value) => updateInput('transitCost', value[0])}
                  max={500}
                  min={0}
                  step={5}
                  className="w-full"
                  data-testid="slider-transit-cost"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$0</span>
                  <span>$500</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  2026 monthly limit (the most you can set aside before taxes): $340
                </div>
              </div>

              {/* Parking Expenses */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                  Monthly Parking Costs: ${inputs.parkingCost}
                  <Tooltip content="Eligible parking means spaces tied to getting to work, like a garage at your office or lot at the train station. In 2026 you can shield up to $340 per month from taxes for this parking; paying more than that means the extra is taxed like normal pay." />
                </Label>
                <Slider
                  value={[inputs.parkingCost]}
                  onValueChange={(value) => updateInput('parkingCost', value[0])}
                  max={500}
                  min={0}
                  step={5}
                  className="w-full"
                  data-testid="slider-parking-cost"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$0</span>
                  <span>$500</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  2026 monthly limit (tax-free cap): $340
                </div>
              </div>

              {/* Tax Information */}
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
                    onChange={(event) => updateInput('annualIncome', Number(event.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground mb-2">Filing status</Label>
                  <Select
                    value={inputs.filingStatus ?? 'single'}
                    onValueChange={(value: FilingStatus) => updateInput('filingStatus', value)}
                  >
                    <SelectTrigger className="glass-input" data-testid="select-tax-bracket">
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
          </GlassCard>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <GlassCard>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Annual Savings</h3>
              <Button
                onClick={() => exportCommuterReport(inputs, results)}
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
                <span className="text-muted-foreground">Transit Savings</span>
                <span className="text-lg font-semibold text-foreground" data-testid="result-transit-savings">
                  ${Math.round(results.transitSavings).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Parking Savings</span>
                <span className="text-lg font-semibold text-foreground" data-testid="result-parking-savings">
                  ${Math.round(results.parkingSavings).toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Total Tax Savings</span>
                  <span className="text-xl font-bold text-primary" data-testid="result-total-savings">
                    ${Math.round(results.totalSavings).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              <Calculator className="inline mr-2" size={20} />
              Breakdown
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Transit:</span>
                <span className="text-foreground font-mono" data-testid="math-transit">
                  ${inputs.transitCost}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Parking:</span>
                <span className="text-foreground font-mono" data-testid="math-parking">
                  ${inputs.parkingCost}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Annual Total:</span>
                <span className="text-foreground font-mono" data-testid="math-total">
                  ${results.annualTotal.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Rate:</span>
                  <span className="text-foreground font-mono" data-testid="math-rate">
                    {marginalRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Savings:</span>
                  <span className="text-foreground font-mono" data-testid="math-savings">
                    ${Math.round(results.totalSavings).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">TouchCare Transit Guidance</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                A monthly limit is the most you can move from your paycheck before taxes. For 2026 that limit is $340 for transit and another $340 for parking. Money above those caps still pays for your commute, it just isn't tax-free.
              </p>
              <p>
                Eligible expenses are the commute costs tied directly to getting to work, like transit passes, vanpools, or parking next to your job or station. Substantiation simply means showing proof—usually uploading a receipt or pass—so keep those records handy and send them in within your plan’s deadline.
              </p>
              <div className="space-y-1">
                <p className="font-medium text-foreground text-xs uppercase tracking-wide">Quick steps</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                  <li>Estimate your average monthly transit and parking costs.</li>
                  <li>Enroll through your employer’s commuter program and choose amounts up to the monthly limits.</li>
                  <li>Use the benefit card or submit receipts so your expenses stay tax-free.</li>
                </ol>
              </div>
              <p className="text-xs text-foreground">
                Use this illustration for planning only. Your employer’s commuter benefit rules, local taxes, and deadlines will control the final details.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
