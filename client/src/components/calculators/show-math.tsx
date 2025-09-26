import GlassCard from "@/components/glass-card";

export interface ShowMathItem {
  label: string;
  value: string;
  helperText?: string;
  accent?: "muted" | "primary" | "success" | "warning";
}

interface ShowMathSectionProps {
  title: string;
  focusLabel: string;
  description: string;
  items: ShowMathItem[];
}

const accentClasses: Record<NonNullable<ShowMathItem["accent"]>, string> = {
  muted: "text-muted-foreground",
  primary: "text-primary",
  success: "text-emerald-500 dark:text-emerald-400",
  warning: "text-amber-500 dark:text-amber-400",
};

export function ShowMathSection({ title, focusLabel, description, items }: ShowMathSectionProps) {
  return (
    <GlassCard className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <span className="text-xs font-semibold uppercase tracking-wide text-primary/80">
            Focus: {focusLabel}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="border border-border/50 rounded-xl p-4 bg-background/40">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
              <span className={`text-base font-semibold ${item.accent ? accentClasses[item.accent] : "text-foreground"}`}>
                {item.value}
              </span>
            </div>
            {item.helperText ? (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.helperText}</p>
            ) : null}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default ShowMathSection;
