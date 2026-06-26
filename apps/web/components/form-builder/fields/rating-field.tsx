"use client";

import { Star } from "lucide-react";

interface RatingFieldProps {
  label?: string;
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  required?: boolean;
  disabled?: boolean;
  icon?: "star" | "heart" | "emoji";
}

export function RatingField({
  label = "Rating",
  value = 0,
  onChange,
  max = 5,
  required = false,
  disabled = false,
  icon = "star",
}: RatingFieldProps) {
  const renderIcon = (index: number, isFilled: boolean) => {
    const colorClass = isFilled ? "text-warning fill-warning" : "text-text-muted";

    switch (icon) {
      case "heart":
        return (
          <svg
            className={`w-6 h-6 ${colorClass}`}
            viewBox="0 0 24 24"
            fill={isFilled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        );
      case "emoji":
        return (
          <span className="text-2xl">{isFilled ? "😊" : "😐"}</span>
        );
      default:
        return <Star className={`w-6 h-6 ${colorClass}`} />;
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => !disabled && onChange?.(i + 1)}
            disabled={disabled}
            className={`p-1 rounded transition-transform ${
              disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
            }`}
          >
            {renderIcon(i, i < value)}
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm text-text-secondary">{value}/{max}</span>
        )}
      </div>
    </div>
  );
}
