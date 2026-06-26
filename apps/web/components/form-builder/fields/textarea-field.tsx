"use client";

interface TextareaFieldProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
}

export function TextareaField({
  label = "Multiline text",
  placeholder = "Enter text...",
  helperText,
  required = false,
  disabled = false,
  value = "",
  onChange,
  rows = 4,
}: TextareaFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className="w-full px-3 py-2.5 bg-base border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-border-focus disabled:opacity-50 disabled:cursor-not-allowed resize-none"
      />
      {helperText && (
        <p className="text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
}
