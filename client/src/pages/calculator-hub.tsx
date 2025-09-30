import { HeartPulse, ClipboardList, Bus, Shield } from "lucide-react";
import GlassCard from "@/components/glass-card";
import { useLocation } from "wouter";
import { CALCULATOR_THEME, type CalculatorId } from "@/lib/calculatorTheme";
import { BENEFIT_FACTS } from "@/lib/benefitFacts";

export default function CalculatorHub() {
  const [, navigate] = useLocation();

  const calculators: Array<{
    id: CalculatorId;
    title: string;
    description: string;
    icon: typeof HeartPulse;
    route: string;
    analyticsId: string;
  }> = [
    {
      id: "hsa",
      title: "HSA Strategy Planner",
      description:
        "Show how HDHP premiums, employer HSA deposits, and your own savings affect yearly costs.",
      icon: HeartPulse,
      route: "/hsa",
      analyticsId: "calculator-hsa-entry",
    },
    {
      id: "fsa",
      title: "FSA Election Forecaster",
      description:
        "Size your Flexible Spending Account election quickly with clear guardrails for carryover and deadlines.",
      icon: ClipboardList,
      route: "/fsa",
      analyticsId: "calculator-fsa-entry",
    },
    {
      id: "commuter",
      title: "Commuter Benefits",
      description:
        "See how pre-tax dollars can cover transit and parking for your commute.",
      icon: Bus,
      route: "/commuter",
      analyticsId: "calculator-commuter-entry",
    },
    {
      id: "life",
      title: "Life Insurance Needs",
      description:
        "Add up debts, income replacement, mortgage payoff, and education goals with the DIME method.",
      icon: Shield,
      route: "/life-insurance",
      analyticsId: "calculator-life-entry",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section - Simplified */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-foreground mb-4" data-testid="text-main-title">
          2026 Benefits Calculators
        </h1>
        <p className="text-xl text-muted-foreground" data-testid="text-main-description">
          Plan your pre-tax benefits and insurance coverage in minutes
        </p>
      </div>

      {/* Calculator Cards - Cleaner Layout */}
      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {calculators.map((calculator) => {
          const Icon = calculator.icon;
          const theme = CALCULATOR_THEME[calculator.id];
          const facts = BENEFIT_FACTS[calculator.id];

          // Show only first 2 facts for cleaner UI
          const topFacts = facts.slice(0, 2);

          return (
            <GlassCard
              key={calculator.id}
              onClick={() => navigate(calculator.route)}
              data-testid={`card-calculator-${calculator.id}`}
              analyticsId={calculator.analyticsId}
              className="hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex gap-6">
                {/* Icon Column */}
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 ${theme.bgClass} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="text-white" size={28} />
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`text-title-${calculator.id}`}>
                    {calculator.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed" data-testid={`text-description-${calculator.id}`}>
                    {calculator.description}
                  </p>

                  {/* Key Facts - Compact */}
                  <div className="space-y-1.5">
                    {topFacts.map((fact, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs">
                        <span className="text-primary mt-0.5">•</span>
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{fact.label}</span>
                          <span className="text-muted-foreground"> {fact.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Educational Footer - Concise */}
      <div className="max-w-4xl mx-auto">
        <GlassCard className="bg-primary/5 border-primary/20">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-foreground">How These Calculators Help</h3>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Pre-tax benefits reduce your taxable income, saving you money on every paycheck. Use these tools to find the right contribution amounts, avoid over-election penalties, and maximize your tax savings for 2026.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
