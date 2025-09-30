import { Lightbulb, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import GlassCard from "@/components/glass-card";

export type RecommendationLevel = "optimal" | "good" | "warning" | "critical";

export interface Recommendation {
  level: RecommendationLevel;
  title: string;
  message: string;
  actions?: string[];
}

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const levelConfig = {
  optimal: {
    icon: CheckCircle2,
    bgClass: "bg-emerald-500/10 border-emerald-500/30",
    iconColor: "text-emerald-500",
    titleColor: "text-emerald-700 dark:text-emerald-400"
  },
  good: {
    icon: Lightbulb,
    bgClass: "bg-blue-500/10 border-blue-500/30",
    iconColor: "text-blue-500",
    titleColor: "text-blue-700 dark:text-blue-400"
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-amber-500/10 border-amber-500/30",
    iconColor: "text-amber-500",
    titleColor: "text-amber-700 dark:text-amber-400"
  },
  critical: {
    icon: XCircle,
    bgClass: "bg-red-500/10 border-red-500/30",
    iconColor: "text-red-500",
    titleColor: "text-red-700 dark:text-red-400"
  }
};

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const config = levelConfig[recommendation.level];
  const Icon = config.icon;

  return (
    <GlassCard className={config.bgClass}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h4 className={`text-base font-semibold ${config.titleColor}`}>
              {recommendation.title}
            </h4>
            <p className="text-sm text-foreground/80 mt-1 leading-relaxed">
              {recommendation.message}
            </p>
          </div>

          {recommendation.actions && recommendation.actions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground/70 uppercase tracking-wide">
                Recommended Actions:
              </p>
              <ul className="space-y-1">
                {recommendation.actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground/70">
                    <span className="text-primary mt-0.5">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}