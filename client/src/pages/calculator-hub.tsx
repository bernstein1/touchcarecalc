import { HeartPulse, Bus, Shield, TrendingUp } from "lucide-react";
import GlassCard from "@/components/glass-card";
import { useLocation } from "wouter";

export default function CalculatorHub() {
  const [, navigate] = useLocation();

  const calculators = [
    {
      id: "hsa",
      title: "HSA/FSA Calculator",
      description: "Calculate your health savings and flexible spending account benefits with 2025 contribution limits.",
      icon: HeartPulse,
      color: "text-primary",
      bgColor: "bg-primary",
      route: "/hsa",
      stats: [
        { label: "HSA Individual Limit:", value: "$4,300" },
        { label: "HSA Family Limit:", value: "$8,550" },
      ],
    },
    {
      id: "commuter",
      title: "Commuter Benefits",
      description: "Calculate pre-tax savings on transit and parking expenses for your daily commute.",
      icon: Bus,
      color: "text-secondary",
      bgColor: "bg-secondary",
      route: "/commuter",
      stats: [
        { label: "Transit Limit:", value: "$315/month" },
        { label: "Parking Limit:", value: "$315/month" },
      ],
    },
    {
      id: "life",
      title: "Life Insurance Needs",
      description: "Determine the right coverage amount using income replacement and debt analysis methodologies.",
      icon: Shield,
      color: "text-accent",
      bgColor: "bg-accent",
      route: "/life-insurance",
      stats: [
        { label: "Income Replacement:", value: "10-15x Annual" },
        { label: "Method:", value: "DIME Analysis" },
      ],
    },
    {
      id: "retirement",
      title: "401(k) Retirement",
      description: "Plan your retirement with compound interest projections and employer matching calculations.",
      icon: TrendingUp,
      color: "text-chart-1",
      bgColor: "bg-chart-1",
      route: "/retirement",
      stats: [
        { label: "2025 Limit:", value: "$23,000" },
        { label: "50+ Catch-up:", value: "$30,500" },
      ],
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
          return (
            <GlassCard
              key={calculator.id}
              onClick={() => navigate(calculator.route)}
              data-testid={`card-calculator-${calculator.id}`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 ${calculator.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white text-2xl" size={32} />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4" data-testid={`text-title-${calculator.id}`}>
                  {calculator.title}
                </h3>
                <p className="text-muted-foreground mb-6" data-testid={`text-description-${calculator.id}`}>
                  {calculator.description}
                </p>
                <div className="space-y-2 text-sm">
                  {calculator.stats.map((stat, index) => (
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
