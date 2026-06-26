"use client";

interface NumberFieldProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({
  label = "Number",
  placeholder = "0",
  helperText,
  required = false,
  disabled = false,
  value,
  onChange,
  min,
  max,
  step = 1,
}: NumberFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange?.(Number(e.target.value))}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2.5 bg-base border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-border-focus disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {helperText && (
        <p className="text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
}
