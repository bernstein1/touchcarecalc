import { useState } from "react";
import { ArrowLeft, Plus, GitCompare, HeartPulse, Bus, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/glass-card";
import HSAComparison from "@/components/comparisons/hsa-comparison";
import CommuterComparison from "@/components/comparisons/commuter-comparison";
import LifeInsuranceComparison from "@/components/comparisons/life-insurance-comparison";
import RetirementComparison from "@/components/comparisons/retirement-comparison";
import { useLocation } from "wouter";

type CalculatorType = 'hsa' | 'commuter' | 'life-insurance' | 'retirement';
type Scenario = {
  id: string;
  name: string;
  calculatorType: CalculatorType;
  data: any;
};

const calculatorTypes = [
  {
    id: 'hsa' as const,
    name: 'HSA/FSA Benefits',
    icon: HeartPulse,
    color: 'text-primary',
    bgColor: 'bg-primary',
    description: 'Compare health savings and flexible spending account scenarios'
  },
  {
    id: 'commuter' as const,
    name: 'Commuter Benefits',
    icon: Bus,
    color: 'text-secondary',
    bgColor: 'bg-secondary',
    description: 'Compare pre-tax transit and parking benefit scenarios'
  },
  {
    id: 'life-insurance' as const,
    name: 'Life Insurance',
    icon: Shield,
    color: 'text-accent',
    bgColor: 'bg-accent',
    description: 'Compare life insurance coverage need scenarios'
  },
  {
    id: 'retirement' as const,
    name: '401(k) Retirement',
    icon: TrendingUp,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1',
    description: 'Compare retirement planning scenarios'
  }
];

export default function ComparisonTool() {
  const [, navigate] = useLocation();
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [newScenarioName, setNewScenarioName] = useState("");

  const handleAddScenario = () => {
    if (!selectedCalculator || !newScenarioName.trim()) return;
    
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: newScenarioName.trim(),
      calculatorType: selectedCalculator,
      data: getDefaultDataForCalculator(selectedCalculator)
    };
    
    setScenarios(prev => [...prev, newScenario]);
    setNewScenarioName("");
  };

  const handleRemoveScenario = (scenarioId: string) => {
    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
  };

  const handleUpdateScenario = (scenarioId: string, data: any) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === scenarioId ? { ...scenario, data } : scenario
    ));
  };

  const getDefaultDataForCalculator = (type: CalculatorType) => {
    switch (type) {
      case 'hsa':
        return {
          accountType: 'hsa',
          coverage: 'individual',
          income: 75000,
          contribution: 3000,
          taxBracket: 22
        };
      case 'commuter':
        return {
          transitCost: 200,
          parkingCost: 150,
          taxBracket: 22
        };
      case 'life-insurance':
        return {
          totalDebt: 50000,
          income: 75000,
          mortgageBalance: 250000,
          educationCosts: 100000,
          incomeYears: 10,
          currentInsurance: 100000
        };
      case 'retirement':
        return {
          currentAge: 30,
          retirementAge: 65,
          currentSalary: 75000,
          currentSavings: 25000,
          employeeContribution: 10,
          employerMatch: 100,
          employerMatchCap: 6,
          expectedReturn: 7,
          salaryGrowth: 3,
          contributionType: 'traditional',
          taxBracket: 22
        };
      default:
        return {};
    }
  };

  const selectedCalculatorInfo = calculatorTypes.find(calc => calc.id === selectedCalculator);

  return (
    <div className="space-y-8">
      {/* Header */}
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
              Comparison Tool
            </h2>
            <p className="text-muted-foreground">Compare different benefit scenarios side-by-side</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <GitCompare className="text-primary" size={20} />
            <span className="text-sm font-medium text-foreground">Interactive Comparison</span>
          </div>
        </div>
      </div>

      {!selectedCalculator ? (
        /* Calculator Type Selection */
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-foreground mb-4" data-testid="text-select-calculator">
              Select Calculator Type to Compare
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose which type of financial calculation you want to compare different scenarios for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {calculatorTypes.map((calculator) => {
              const Icon = calculator.icon;
              return (
                <GlassCard
                  key={calculator.id}
                  onClick={() => setSelectedCalculator(calculator.id)}
                  className="text-center hover:scale-105"
                  data-testid={`card-calculator-${calculator.id}`}
                >
                  <div className={`w-16 h-16 ${calculator.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="text-white" size={32} />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-2" data-testid={`text-calculator-name-${calculator.id}`}>
                    {calculator.name}
                  </h4>
                  <p className="text-muted-foreground text-sm" data-testid={`text-calculator-description-${calculator.id}`}>
                    {calculator.description}
                  </p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      ) : (
        /* Scenario Management and Comparison */
        <div className="space-y-8">
          {/* Selected Calculator Info */}
          <GlassCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${selectedCalculatorInfo?.bgColor} rounded-xl flex items-center justify-center`}>
                  {selectedCalculatorInfo?.icon && (
                    <selectedCalculatorInfo.icon className="text-white" size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground" data-testid="text-selected-calculator">
                    {selectedCalculatorInfo?.name} Comparison
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {selectedCalculatorInfo?.description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCalculator(null);
                  setScenarios([]);
                }}
                data-testid="button-change-calculator"
              >
                Change Calculator
              </Button>
            </div>
          </GlassCard>

          {/* Add Scenario */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-foreground mb-4">Add New Scenario</h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="scenario-name" className="text-sm font-medium text-foreground mb-2 block">
                  Scenario Name
                </Label>
                <Input
                  id="scenario-name"
                  placeholder="e.g., Conservative Plan, Aggressive Growth, Current vs Optimized"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  className="glass-input"
                  data-testid="input-scenario-name"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddScenario}
                  disabled={!newScenarioName.trim()}
                  className="glass-button"
                  data-testid="button-add-scenario"
                >
                  <Plus size={16} className="mr-2" />
                  Add Scenario
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Scenarios Display */}
          {scenarios.length === 0 ? (
            <GlassCard>
              <div className="text-center py-12">
                <GitCompare className="mx-auto text-muted-foreground mb-4" size={48} />
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-scenarios">
                  No Scenarios to Compare Yet
                </h3>
                <p className="text-muted-foreground">
                  Add at least two scenarios above to start comparing different approaches.
                </p>
              </div>
            </GlassCard>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground">
                  Scenario Comparison ({scenarios.length})
                </h3>
              </div>
              
              {/* Scenario Comparison Components */}
              {selectedCalculator === 'hsa' && (
                <HSAComparison 
                  scenarios={scenarios} 
                  onUpdateScenario={handleUpdateScenario}
                />
              )}
              
              {selectedCalculator === 'commuter' && (
                <CommuterComparison 
                  scenarios={scenarios} 
                  onUpdateScenario={handleUpdateScenario}
                />
              )}
              
              {selectedCalculator === 'life-insurance' && (
                <LifeInsuranceComparison 
                  scenarios={scenarios} 
                  onUpdateScenario={handleUpdateScenario}
                />
              )}
              
              {selectedCalculator === 'retirement' && (
                <RetirementComparison 
                  scenarios={scenarios} 
                  onUpdateScenario={handleUpdateScenario}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}