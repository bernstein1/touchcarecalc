import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  prefix?: string;
  suffix?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefix, suffix, ...props }, ref) => {
    // Handle number input to prevent leading zeros
    const handleNumberInput = (e: React.FormEvent<HTMLInputElement>) => {
      if (type === 'number') {
        const input = e.currentTarget;
        const value = input.value;
        // Remove leading zeros unless the value is just "0"
        if (value && value !== '0' && value.startsWith('0') && value[1] !== '.') {
          input.value = value.replace(/^0+/, '');
        }
      }
    };

    if (prefix || suffix) {
      return (
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-sm text-muted-foreground pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border-2 border-border bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
              prefix ? "pl-8" : "pl-3",
              suffix ? "pr-16" : "pr-3",
              className
            )}
            ref={ref}
            onInput={handleNumberInput}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-sm text-muted-foreground pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
          className
        )}
        ref={ref}
        onInput={handleNumberInput}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
