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
import { CommuterInputs, CommuterResults } from "@shared/schema";
import { usePDFExport } from "@/lib/pdf/use-pdf-export";

export default function CommuterCalculator() {
  const [, navigate] = useLocation();
  const { exportCommuterReport, isGenerating, error } = usePDFExport();
  
  const [inputs, setInputs] = useState<CommuterInputs>({
    transitCost: 200,
    parkingCost: 150,
    taxBracket: 22,
  });

  const [results, setResults] = useState<CommuterResults>({
    transitSavings: 0,
    parkingSavings: 0,
    totalSavings: 0,
    annualTransit: 0,
    annualParking: 0,
    annualTotal: 0,
  });

  useEffect(() => {
    const calculatedResults = calculateCommuter(inputs);
    setResults(calculatedResults);
  }, [inputs]);

  const updateInput = (key: keyof CommuterInputs, value: number) => {
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
                  <Tooltip content="Include what you spend each month on eligible public transportation—subways, buses, commuter rail, ferries, and qualified employer-sponsored vanpools. Federal rules cap the tax-free benefit at $315 per month in 2025, so amounts above that limit must be paid with after-tax dollars." />
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
                  2025 Monthly Limit: $315
                </div>
              </div>

              {/* Parking Expenses */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                  Monthly Parking Costs: ${inputs.parkingCost}
                  <Tooltip content="Add the average you pay to park at or near your workplace or a transit station. The IRS allows up to $315 per month in 2025 to be excluded from taxes when the parking space is tied to your commute; general street parking or mileage reimbursement is not covered." />
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
                  2025 Monthly Limit: $315
                </div>
              </div>

              {/* Tax Information */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2">Tax Bracket</Label>
                <Select value={inputs.taxBracket.toString()} onValueChange={(value) => updateInput('taxBracket', parseFloat(value))}>
                  <SelectTrigger className="glass-input" data-testid="select-tax-bracket">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="22">22% - Income $44,725 - $95,375</SelectItem>
                    <SelectItem value="24">24% - Income $95,375 - $182,050</SelectItem>
                    <SelectItem value="32">32% - Income $182,050 - $231,250</SelectItem>
                  </SelectContent>
                </Select>
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
                    {inputs.taxBracket}%
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
                Pre-tax commuter benefits are capped at $315 per month for transit and $315 for parking in 2025 (IRS Rev. Proc. 2024-45). Savings shown assume payroll deductions and no local taxes.
              </p>
              <p>
                Submit eligible receipts promptly—many plans require substantiation within 180 days. Parking reimbursements often cover rideshare to transit hubs but not mileage to your office.
              </p>
              <p className="text-xs text-foreground">
                Use this illustration for planning only. Final eligibility, ordering windows, and rollover rules are determined by your employer’s plan document and local ordinances.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
