"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Info, ChevronDown } from "lucide-react";

interface FormPreviewRendererProps {
  fields: any[];
  formTitle: string;
  formDescription?: string;
  coverImageUrl?: string | null;
  themeConfig?: {
    colors?: {
      background?: string;
      surface?: string;
      foreground?: string;
      foregroundSoft?: string;
      accent?: string;
      accentForeground?: string;
      border?: string;
      success?: string;
      danger?: string;
    };
    fonts?: {
      display?: string;
      body?: string;
      weights?: { display?: number; body?: number };
      scale?: { hero?: number; question?: number; body?: number; helper?: number };
      letterSpacing?: { hero?: string };
      textTransform?: string;
    };
    shape?: {
      radius?: number;
      border?: { width?: number; style?: string; color?: string };
    };
  } | null;
  className?: string;
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  TEXT: "Short Text",
  TEXTAREA: "Long Text",
  EMAIL: "Email",
  NUMBER: "Number",
  DATE: "Date",
  TIME: "Time",
  SELECT: "Single Select",
  MULTI_SELECT: "Multi Select",
  CHECKBOX: "Checkbox",
  RATING: "Rating",
  PASSWORD: "Password",
  YES_NO: "Yes/No",
  TAGS: "Tags",
  TOGGLE: "Toggle",
  RADIO: "Radio",
  FILE_UPLOAD: "File Upload",
};

export function FormPreviewRenderer({
  fields,
  formTitle,
  formDescription,
  coverImageUrl,
  themeConfig,
  className,
}: FormPreviewRendererProps) {
  const colors = themeConfig?.colors ?? {
    background: "#ffffff",
    surface: "#f9fafb",
    foreground: "#111827",
    foregroundSoft: "#6b7280",
    accent: "#0d2e2a",
    accentForeground: "#ffffff",
    border: "#e5e7eb",
    success: "#10b981",
    danger: "#ef4444",
  };

  const fonts = themeConfig?.fonts ?? {
    display: "system-ui, sans-serif",
    body: "system-ui, sans-serif",
    weights: { display: 700, body: 400 },
    scale: { hero: 2.25, question: 1.25, body: 1, helper: 0.875 },
  };

  const shape = themeConfig?.shape ?? {
    radius: 10,
    border: { width: 1, style: "solid", color: colors.border },
  };

  return (
    <div
      className={cn("rounded-2xl overflow-hidden shadow-sm relative", className)}
      style={{ backgroundColor: colors.background }}
    >
      <div className="relative z-10 w-full min-h-full h-full p-4">
        <form className="relative" style={{ backgroundColor: colors.surface }}>
          {/* Cover image */}
          {coverImageUrl && (
            <div className="w-full h-40 overflow-hidden">
              <img
                src={coverImageUrl}
                alt="Form cover"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-5">
            {/* Form title */}
            <div>
              <h2
                style={{
                  color: colors.foreground,
                  fontFamily: fonts.display,
                  fontWeight: fonts.weights?.display ?? 700,
                  fontSize: `${(fonts.scale?.hero ?? 2.25) * 0.7}rem`,
                  letterSpacing: fonts.letterSpacing?.hero,
                  textTransform: fonts.textTransform as any,
                }}
              >
                {formTitle || "Untitled Form"}
              </h2>
              {formDescription && (
                <p
                  className="mt-1"
                  style={{
                    color: colors.foregroundSoft,
                    fontFamily: fonts.body,
                    fontSize: `${(fonts.scale?.helper ?? 0.875)}rem`,
                  }}
                >
                  {formDescription}
                </p>
              )}
            </div>

            {/* Fields */}
            {fields.length === 0 ? (
              <div
                className="py-12 text-center rounded-xl border-2 border-dashed"
                style={{ borderColor: colors.border, color: colors.foregroundSoft }}
              >
                <p style={{ fontFamily: fonts.body, fontSize: `${(fonts.scale?.body ?? 1) * 0.9}rem` }}>
                  No fields added yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field: any) => (
                  <PreviewField
                    key={field.id}
                    field={field}
                    colors={colors}
                    fonts={fonts}
                    shape={shape}
                  />
                ))}
              </div>
            )}

            {/* Submit button */}
            {fields.length > 0 && (
              <button
                type="button"
                className="px-5 py-2.5 font-medium text-sm cursor-default"
                style={{
                  background: colors.accent,
                  color: colors.accentForeground || "#FFFFFF",
                  borderRadius: `${shape.radius}px`,
                  fontFamily: fonts.body,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function PreviewField({
  field,
  colors,
  fonts,
  shape,
}: {
  field: any;
  colors: any;
  fonts: any;
  shape: any;
}) {
  const inputStyle: React.CSSProperties = {
    background: colors.surface,
    border: `${shape.border?.width ?? 1}px ${shape.border?.style ?? "solid"} ${colors.border}`,
    borderRadius: `${shape.radius}px`,
    padding: "8px 12px",
    fontFamily: fonts.body,
    fontSize: `${(fonts.scale?.body ?? 1) * 0.85}rem`,
    color: colors.foregroundSoft,
    width: "100%",
  };

  return (
    <div>
      <label
        className="block mb-1.5"
        style={{
          color: colors.foreground,
          fontFamily: fonts.body,
          fontSize: `${(fonts.scale?.body ?? 1) * 0.85}rem`,
          fontWeight: 500,
        }}
      >
        {field.label}
        {field.required && (
          <span style={{ color: colors.danger }} className="ml-0.5">*</span>
        )}
        {field.helpText && (
          <span
            title={field.helpText}
            className="ml-2 inline-flex cursor-help opacity-50 hover:opacity-100 transition-opacity"
          >
            <Info className="size-4 inline-block" />
          </span>
        )}
      </label>

      {renderFieldInput(field, inputStyle, colors, shape, fonts)}
    </div>
  );
}

function renderFieldInput(
  field: any,
  inputStyle: React.CSSProperties,
  colors: any,
  shape: any,
  fonts: any,
) {
  let defaultPlaceholder = "Your answer...";
  if (field.type === "EMAIL") defaultPlaceholder = "john@example.com";
  else if (field.type === "NUMBER") defaultPlaceholder = "123";
  else if (field.type === "TEXT") defaultPlaceholder = "John Doe";
  else if (field.type === "TEXTAREA") defaultPlaceholder = "Enter your message...";
  else if (field.type === "DATE") defaultPlaceholder = "mm/dd/yyyy";
  else if (field.type === "TIME") defaultPlaceholder = "hh:mm";
  else if (field.type === "SELECT" || field.type === "MULTI_SELECT") defaultPlaceholder = "Select an option...";
  else if (field.type === "PASSWORD") defaultPlaceholder = "Enter password";

  const placeholder = field.placeholder || defaultPlaceholder;

  switch (field.type) {
    case "TEXTAREA":
      return (
        <div style={{ ...inputStyle, height: "80px" }}>
          {placeholder}
        </div>
      );

    case "CHECKBOX":
      return (
        <div className="flex items-center gap-2">
          <div
            className="shrink-0"
            style={{
              width: "18px",
              height: "18px",
              borderRadius: `${Math.min(shape.radius, 4)}px`,
              border: `${shape.border?.width ?? 1}px ${shape.border?.style ?? "solid"} ${colors.border}`,
              background: colors.surface,
            }}
          />
          <span
            style={{
              color: colors.foregroundSoft,
              fontFamily: fonts.body,
              fontSize: `${(fonts.scale?.body ?? 1) * 0.85}rem`,
            }}
          >
            {field.placeholder || "Checkbox"}
          </span>
        </div>
      );

    case "RATING":
      return (
        <div className="flex gap-1">
          {Array.from({ length: field.settings?.ratingMax ?? 5 }).map((_, i) => (
            <span key={i} style={{ color: colors.border, fontSize: "1.25rem" }}>&#9733;</span>
          ))}
        </div>
      );

    case "SELECT":
    case "MULTI_SELECT":
      return (
        <div className="space-y-3 mt-1">
          <div
            className="flex justify-between items-center"
            style={{ ...inputStyle, height: "40px" }}
          >
            {placeholder}
            <ChevronDown className="size-4 opacity-50" />
          </div>
          {field.options && field.options.length > 0 && (
            <div className="space-y-2 pl-3" style={{ borderLeft: `2px solid ${colors.border}` }}>
              {field.options.map((opt: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="shrink-0"
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: field.type === "SELECT" ? "50%" : `${Math.min(shape.radius, 4)}px`,
                      border: `${shape.border?.width ?? 1}px ${shape.border?.style ?? "solid"} ${colors.border}`,
                      background: colors.surface,
                    }}
                  />
                  <span
                    style={{
                      color: colors.foreground,
                      fontFamily: fonts.body,
                      fontSize: `${(fonts.scale?.body ?? 1) * 0.85}rem`,
                    }}
                  >
                    {opt.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    default:
      return <div style={{ ...inputStyle, height: "40px" }}>{placeholder}</div>;
  }
}
