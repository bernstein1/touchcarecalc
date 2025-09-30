import { Info, DollarSign, TrendingDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import GlassCard from "@/components/glass-card";

interface PreTaxExplainerProps {
  variant?: "inline" | "card";
  showExamples?: boolean;
}

export default function PreTaxExplainer({ variant = "inline", showExamples = true }: PreTaxExplainerProps) {
  const content = (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <DollarSign className="text-primary mt-1" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">What does "pre-tax" mean?</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pre-tax (or before-tax) means money is taken from your paycheck <em>before</em> income taxes are calculated.
            This lowers the amount of your income that gets taxed, which means you pay less in taxes overall.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <TrendingDown className="text-emerald-500 mt-1" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">How does it save you money?</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you set aside money pre-tax for benefits like HSAs, FSAs, or commuter benefits, you avoid paying
            federal income tax, Social Security tax, and Medicare tax on that money—roughly 20-40% savings depending on
            your income.
          </p>
        </div>
      </div>

      {showExamples && (
        <div className="rounded-lg bg-muted/40 border border-border p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Real-dollar example</h4>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Your annual salary:</span>
              <span className="font-mono text-foreground">$75,000</span>
            </div>
            <div className="flex justify-between">
              <span>You contribute to HSA (pre-tax):</span>
              <span className="font-mono text-foreground">-$3,000</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-medium">Taxable income after HSA:</span>
              <span className="font-mono font-semibold text-foreground">$72,000</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span className="font-medium">Estimated tax savings (22% bracket):</span>
              <span className="font-mono font-semibold">~$660</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-2 border-t border-dashed border-border">
            If you contributed $3,000 <em>after tax</em>, you'd pay around $660 more in taxes with no benefit to show
            for it. Pre-tax contributions let you keep that money.
          </p>
        </div>
      )}

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
        <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Why we ask for your income</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We use your annual income and filing status to estimate your marginal tax rate (the percentage you pay on your
          last dollar of income). This helps calculate exactly how much you save by using pre-tax benefits. The higher
          your tax bracket, the more you save with pre-tax contributions.
        </p>
      </div>
    </div>
  );

  if (variant === "card") {
    return (
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Info className="h-5 w-5" />
          <h3 className="text-lg font-semibold text-foreground">Understanding Pre-Tax Benefits</h3>
        </div>
        {content}
      </GlassCard>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="pretax-explainer" className="border border-border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">What does "pre-tax" mean and why do you need my income?</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-4">
          {content}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}