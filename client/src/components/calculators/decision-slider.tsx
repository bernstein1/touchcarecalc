import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface DecisionSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  helperText?: string;
  focusLabel?: string;
}

export function DecisionSlider({
  id,
  label,
  value,
  min,
  max,
  step = 50,
  onChange,
  formatValue = (val) => `$${val.toLocaleString()}`,
  helperText,
  focusLabel,
}: DecisionSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </Label>
          {helperText ? (
            <p className="text-xs text-muted-foreground leading-relaxed">{helperText}</p>
          ) : null}
        </div>
        <div className="text-right">
          {focusLabel ? (
            <p className="text-[11px] uppercase tracking-wide text-primary/70 font-semibold">{focusLabel}</p>
          ) : null}
          <p className="text-base font-semibold text-foreground">{formatValue(value)}</p>
        </div>
      </div>

      <Slider
        id={id}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(vals) => onChange(vals[0])}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

export default DecisionSlider;
