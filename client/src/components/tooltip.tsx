import { Info } from "lucide-react";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipProps {
  content: string;
}

export default function Tooltip({ content }: TooltipProps) {
  return (
    <ShadcnTooltip>
      <TooltipTrigger asChild>
        <Info className="inline-block w-4 h-4 text-muted-foreground cursor-help ml-2" />
      </TooltipTrigger>
      <TooltipContent className="max-w-60">
        <p>{content}</p>
      </TooltipContent>
    </ShadcnTooltip>
  );
}
