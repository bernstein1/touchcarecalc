import { Check, X, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import GlassCard from "@/components/glass-card";

interface ComparisonAvailability {
  available: boolean;
  detail: string;
  status?: "conditional";
}

interface ComparisonRow {
  feature: string;
  hsa: ComparisonAvailability;
  fsa: ComparisonAvailability;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Rollover of unused funds",
    hsa: {
      available: true,
      detail: "Unlimited rollover—all unused funds carry forward year after year",
    },
    fsa: {
      available: false,
      status: "conditional",
      detail: "Use-it-or-lose-it rule applies (unless plan offers carryover up to $640 or grace period)",
    },
  },
  {
    feature: "Required health plan",
    hsa: {
      available: true,
      detail: "Must be enrolled in a qualified high-deductible or consumer driven health plan (HDHP / CDHP)",
    },
    fsa: {
      available: true,
      detail: "Works with any health plan—no HDHP / CDHP required",
    },
  },
  {
    feature: "Funds available immediately",
    hsa: {
      available: false,
      detail: "Only funds that have been deposited can be used",
    },
    fsa: {
      available: true,
      detail: "Full annual election available on day one (front-loaded)",
    },
  },
  {
    feature: "Can pair with general medical FSA",
    hsa: {
      available: false,
      detail: "Cannot have both HSA and general-purpose medical FSA simultaneously",
    },
    fsa: {
      available: true,
      detail: "FSA works independently—no HSA conflicts",
    },
  },
  {
    feature: "Can pair with Limited Purpose FSA (dental/vision only)",
    hsa: {
      available: true,
      detail: "LPFSA is HSA-compatible for dental and vision expenses; check your benefits guide to confirm it's offered",
    },
    fsa: {
      available: false,
      detail: "Not applicable—general FSA already covers dental/vision",
    },
  },
  {
    feature: "Long-term savings vehicle",
    hsa: {
      available: true,
      detail: "Can invest unused funds and grow tax-free for retirement medical expenses",
    },
    fsa: {
      available: false,
      detail: "FSA is designed for current-year expenses only",
    },
  },
  {
    feature: "Employer contributions",
    hsa: {
      available: true,
      detail: "Employer contributions are common and count toward annual limit",
    },
    fsa: {
      available: false,
      detail: "Employer rarely contributes to FSAs (employee-funded benefit)",
    },
  },
  {
    feature: "Best for...",
    hsa: {
      available: true,
      detail: "People on HDHP / CDHP plans who want long-term savings or can afford upfront medical costs",
    },
    fsa: {
      available: true,
      detail: "People with predictable medical expenses who need immediate access to funds",
    },
  },
];

interface FSAvsHSAComparisonProps {
  variant?: "inline" | "card";
}

export default function FSAvsHSAComparison({ variant = "inline" }: FSAvsHSAComparisonProps) {
  const content = (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground leading-relaxed">
        <p className="mb-3">
          Both FSAs and HSAs allow you to pay for qualified medical, dental and vision expenses using pre-tax dollars, but they work very differently. Understanding these differences helps you choose the right account - or (if available) use both types of accounts, strategically.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-foreground min-w-[200px]">Feature</th>
              <th className="text-center p-3 font-medium text-foreground w-[120px]">
                <div className="flex flex-col items-center">
                  <span className="text-primary font-semibold">HSA</span>
                  <span className="text-xs text-muted-foreground font-normal">(Health Savings Account)</span>
                </div>
              </th>
              <th className="text-center p-3 font-medium text-foreground w-[120px]">
                <div className="flex flex-col items-center">
                  <span className="text-foreground font-semibold">FSA</span>
                  <span className="text-xs text-muted-foreground font-normal">(Flexible Spending Account)</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, index) => (
              <tr key={index} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="p-3 font-medium text-foreground">{row.feature}</td>
                <td className="p-3 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {row.hsa.status === "conditional" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">Conditional</span>
                    ) : row.hsa.available ? (
                      <Check className="text-green-500" size={20} />
                    ) : (
                      <X className="text-red-500" size={20} />
                    )}
                    <span className="text-xs text-muted-foreground text-center">{row.hsa.detail}</span>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {row.fsa.status === "conditional" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">Conditional</span>
                    ) : row.fsa.available ? (
                      <Check className="text-green-500" size={20} />
                    ) : (
                      <X className="text-red-500" size={20} />
                    )}
                    <span className="text-xs text-muted-foreground text-center">{row.fsa.detail}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Strategic pairing: HSA + Limited Purpose FSA (LPFSA)
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If you have an HDHP / CDHP and HSA, you can also enroll in a <em>Limited Purpose FSA</em> to cover dental and vision
          expenses pre-tax without losing HSA eligibility. This combo gives you the best of both worlds: HSA long-term
          savings for medical expenses, and LPFSA front-loaded funds for predictable dental and vision bills.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Limited Purpose FSAs are not available through every organization. Employees should review their benefits guide, platform, or enrollment solution to confirm whether their company offers an LPFSA.
        </p>
      </div>
    </div>
  );

  if (variant === "card") {
    return (
      <GlassCard className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">FSA vs HSA: Understanding the Difference</h3>
        {content}
      </GlassCard>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="fsa-hsa-comparison" className="border border-border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">FSA vs HSA: Which should I use?</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-4">
          {content}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
