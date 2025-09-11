import { useState, useEffect } from "react";
import { ArrowLeft, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "@/components/glass-card";
import Tooltip from "@/components/tooltip";
import { useLocation } from "wouter";
import { calculateCommuter } from "@/lib/calculations";
import { CommuterInputs, CommuterResults } from "@shared/schema";

export default function CommuterCalculator() {
  const [, navigate] = useLocation();
  
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
                  Monthly Transit Costs
                  <Tooltip content="Includes bus, subway, train, ferry, and vanpool costs. 2025 limit: $315/month." />
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    className="glass-input pl-8"
                    value={inputs.transitCost}
                    onChange={(e) => updateInput('transitCost', parseFloat(e.target.value) || 0)}
                    data-testid="input-transit-cost"
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  2025 Monthly Limit: $315
                </div>
              </div>

              {/* Parking Expenses */}
              <div>
                <Label className="flex items-center text-sm font-medium text-foreground mb-4">
                  Monthly Parking Costs
                  <Tooltip content="Includes workplace parking fees and related expenses. 2025 limit: $315/month." />
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    className="glass-input pl-8"
                    value={inputs.parkingCost}
                    onChange={(e) => updateInput('parkingCost', parseFloat(e.target.value) || 0)}
                    data-testid="input-parking-cost"
                  />
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
            <h3 className="text-lg font-semibold text-foreground mb-4">Annual Savings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Transit Savings</span>
                <span className="text-lg font-semibold text-secondary" data-testid="result-transit-savings">
                  ${Math.round(results.transitSavings).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Parking Savings</span>
                <span className="text-lg font-semibold text-secondary" data-testid="result-parking-savings">
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
                  <span className="text-secondary font-mono" data-testid="math-savings">
                    ${Math.round(results.totalSavings).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
