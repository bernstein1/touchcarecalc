import { Info } from "lucide-react";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  className?: string;
}

export default function Tooltip({ content, className }: TooltipProps) {
  return (
    <ShadcnTooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full p-1 text-muted-foreground transition-colors",
            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
            className
          )}
          aria-label="Show more information"
        >
          <Info className="w-4 h-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 leading-relaxed text-sm" sideOffset={8}>
        <p>{content}</p>
      </TooltipContent>
    </ShadcnTooltip>
  );
}
