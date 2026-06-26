"use client";

import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
}

export function SelectField({
  label = "Dropdown",
  placeholder = "Select an option...",
  options = ["Option 1", "Option 2", "Option 3"],
  value,
  onChange,
  required = false,
  disabled = false,
  searchable = true,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-1.5" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-3 py-2.5 bg-base border rounded-lg text-sm text-left outline-none transition-colors ${
            isOpen ? "border-border-focus" : "border-border"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${
            !value ? "text-text-muted" : "text-text-primary"
          }`}
        >
          <span>{value || placeholder}</span>
          <ChevronDown
            className={`w-4 h-4 text-text-muted transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-shadow-lg overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-border">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-2 py-1.5 bg-base border border-border rounded text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-border-focus"
                  autoFocus
                />
              </div>
            )}
            <div className="max-h-48 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-text-muted">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange?.(option);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors ${
                      value === option
                        ? "bg-brand/10 text-brand"
                        : "text-text-primary hover:bg-hover"
                    }`}
                  >
                    <span>{option}</span>
                    {value === option && <Check className="w-4 h-4" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
