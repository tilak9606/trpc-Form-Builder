"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";

interface TagsFieldProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  maxTags?: number;
}

export function TagsField({
  label = "Tags",
  placeholder = "Add tag...",
  helperText,
  value = [],
  onChange,
  required = false,
  disabled = false,
  maxTags = 10,
}: TagsFieldProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange?.([...value, trimmed]);
      setInput("");
    }
  };

  const removeTag = (tag: string) => {
    onChange?.(value.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}

      <div
        onClick={() => !disabled && inputRef.current?.focus()}
        className={`flex flex-wrap items-center gap-2 px-3 py-2 bg-base border rounded-lg min-h-[42px] transition-colors cursor-text ${
          disabled ? "opacity-50 cursor-not-allowed" : "border-border focus-within:border-border-focus"
        }`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-light text-brand text-xs font-medium rounded-full"
          >
            {tag}
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="hover:text-brand-hover"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {value.length < maxTags && !disabled && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(input);
              } else if (e.key === "Backspace" && !input && value.length > 0) {
                const lastTag = value[value.length - 1];
                if (lastTag) removeTag(lastTag);
              }
            }}
            onBlur={() => input && addTag(input)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[80px] bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        )}
      </div>

      {helperText && (
        <p className="text-xs text-text-muted">
          {helperText} ({value.length}/{maxTags})
        </p>
      )}
    </div>
  );
}
