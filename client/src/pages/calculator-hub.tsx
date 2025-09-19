import { HeartPulse, Bus, Shield, TrendingUp } from "lucide-react";
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
  }> = [
    {
      id: "hsa",
      title: "HSA/FSA Calculator",
      description: "Calculate your health savings and flexible spending account benefits with 2025 contribution limits.",
      icon: HeartPulse,
      route: "/hsa",
    },
    {
      id: "commuter",
      title: "Commuter Benefits",
      description: "Calculate pre-tax savings on transit and parking expenses for your daily commute.",
      icon: Bus,
      route: "/commuter",
    },
    {
      id: "life",
      title: "Life Insurance Needs",
      description: "Determine the right coverage amount using income replacement and debt analysis methodologies.",
      icon: Shield,
      route: "/life-insurance",
    },
    {
      id: "retirement",
      title: "401(k) Retirement",
      description: "Plan your retirement with compound interest projections and employer matching calculations.",
      icon: TrendingUp,
      route: "/retirement",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4" data-testid="text-main-title">
          Personal Finance Calculators
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-main-description">
          Make informed decisions about your pre-tax benefits, insurance needs, and tax savings with our 2025-updated calculators.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {calculators.map((calculator) => {
          const Icon = calculator.icon;
          const theme = CALCULATOR_THEME[calculator.id];
          const facts = BENEFIT_FACTS[calculator.id];
          return (
            <GlassCard
              key={calculator.id}
              onClick={() => navigate(calculator.route)}
              data-testid={`card-calculator-${calculator.id}`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 ${theme.bgClass} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white text-2xl" size={32} />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4" data-testid={`text-title-${calculator.id}`}>
                  {calculator.title}
                </h3>
                <p className="text-muted-foreground mb-6" data-testid={`text-description-${calculator.id}`}>
                  {calculator.description}
                </p>
                <div className="space-y-2 text-sm">
                  {facts.map((stat, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-muted-foreground">{stat.label}</span>
                      <span className="font-medium text-foreground" data-testid={`text-stat-${calculator.id}-${index}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
