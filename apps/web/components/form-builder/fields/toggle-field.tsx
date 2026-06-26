"use client";

interface ToggleFieldProps {
  label?: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  required?: boolean;
  disabled?: boolean;
}

export function ToggleField({
  label = "Toggle",
  description,
  checked = false,
  onChange,
  required = false,
  disabled = false,
}: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        {label && (
          <label className="block text-sm font-medium text-text-primary">
            {label}
            {required && <span className="text-error ml-0.5">*</span>}
          </label>
        )}
        {description && (
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2 focus:ring-offset-surface ${
          checked ? "bg-brand" : "bg-border"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
