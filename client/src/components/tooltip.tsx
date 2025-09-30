import { type ReactNode } from "react";
import { Info } from "lucide-react";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: ReactNode;
  title?: string;
  className?: string;
}

export default function Tooltip({ content, title, className }: TooltipProps) {
  return (
    <ShadcnTooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full p-1.5 text-primary transition-all",
            "hover:text-primary/80 hover:bg-primary/10 hover:scale-110",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
            className
          )}
          aria-label="Show more information"
        >
          <Info className="w-5 h-5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-80 leading-relaxed text-sm" sideOffset={8}>
        <div className="space-y-1">
          {title ? <p className="font-semibold text-foreground">{title}</p> : null}
          <div className="text-muted-foreground [&>p]:mt-0 [&>p]:mb-0">{content}</div>
        </div>
      </TooltipContent>
    </ShadcnTooltip>
  );
}
