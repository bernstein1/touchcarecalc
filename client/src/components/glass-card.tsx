import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  analyticsId?: string;
}

export default function GlassCard({ children, className, onClick, analyticsId }: GlassCardProps) {
  const isInteractive = typeof onClick === "function";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={cn(
        "glass-effect rounded-2xl p-8 transition-all",
        isInteractive &&
          "hover:shadow-xl cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      data-analytics-id={analyticsId}
    >
      {children}
    </div>
  );
}
