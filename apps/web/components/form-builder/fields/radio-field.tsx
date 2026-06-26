"use client";

interface RadioFieldProps {
  label?: string;
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  variant?: "default" | "cards";
}

export function RadioField({
  label = "Radio selection",
  options = ["Option 1", "Option 2", "Option 3"],
  value,
  onChange,
  required = false,
  disabled = false,
  variant = "default",
}: RadioFieldProps) {
  if (variant === "cards") {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-primary">
            {label}
            {required && <span className="text-error ml-0.5">*</span>}
          </label>
        )}
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => !disabled && onChange?.(option)}
              disabled={disabled}
              className={`p-4 rounded-xl border text-left transition-all ${
                value === option
                  ? "border-brand bg-brand-light shadow-shadow-sm"
                  : "border-border bg-base hover:border-border-focus/50 hover:bg-hover"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className="text-sm font-medium text-text-primary">
                {option}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
              value === option
                ? "border-brand bg-brand-light"
                : "border-border bg-base hover:border-border-focus/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                value === option ? "border-brand" : "border-border"
              }`}
            >
              {value === option && (
                <div className="w-2.5 h-2.5 rounded-full bg-brand" />
              )}
            </div>
            <span className="text-sm text-text-primary">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
