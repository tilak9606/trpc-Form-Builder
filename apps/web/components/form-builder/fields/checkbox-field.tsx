"use client";

import { Check } from "lucide-react";

interface CheckboxFieldProps {
  label?: string;
  options?: string[];
  value?: string[];
  required?: boolean;
  disabled?: boolean;
}

export function CheckboxField({
  label = "Checkbox group",
  options = ["Option 1", "Option 2", "Option 3"],
  value = [],
  required = false,
  disabled = false,
}: CheckboxFieldProps) {
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
              value.includes(option)
                ? "border-brand bg-brand-light"
                : "border-border bg-base hover:border-border-focus/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                value.includes(option)
                  ? "bg-brand border-brand"
                  : "border-border bg-surface"
              }`}
            >
              {value.includes(option) && (
                <Check className="w-3.5 h-3.5 text-brand-text" />
              )}
            </div>
            <span className="text-sm text-text-primary">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
