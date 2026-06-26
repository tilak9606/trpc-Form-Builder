"use client";

interface TimeFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export function TimeField({
  label = "Time",
  placeholder = "Select time...",
  value,
  onChange,
  required = false,
  disabled = false,
  min,
  max,
}: TimeFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <input
        type="time"
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className="w-full px-3 py-2.5 bg-base border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-border-focus disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}
