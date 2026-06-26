"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Monitor, Tablet, Smartphone, ExternalLink } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useFormContext } from "../layout";
import { FormPreviewRenderer } from "~/components/form-builder/form-preview-renderer";
import { useFormEditorStore } from "~/lib/stores/form-editor-store";

const DEVICE_WIDTHS = {
  desktop: "max-w-[1280px]",
  tablet: "max-w-[768px]",
  mobile: "max-w-[375px]",
} as const;

export default function PreviewPage() {
  const params = useParams();
  const formId = params?.id as string;
  const { form, isLoading } = useFormContext();
  const store = useFormEditorStore();
  const [device, setDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop");

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-secondary rounded" />
          <div className="h-96 bg-secondary rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Form not found.</p>
      </div>
    );
  }

  const formData = form as any;

  const themeConfig = {
    colors: {
      background: formData.themeBackgroundColor ?? "#000000",
      surface: formData.themeBackgroundColor ?? "#000000",
      foreground: formData.themeTextColor ?? "#ffffff",
      foregroundSoft: "#9CA3AF",
      accent: formData.themePrimaryColor ?? "#3b82f6",
      accentForeground: formData.themeButtonTextColor ?? "#ffffff",
      border: "#e5e7eb",
    },
    fonts: {
      display: formData.themeFontFamily ?? "Inter",
      body: formData.themeFontFamily ?? "Inter",
      weights: { display: 700, body: 400 },
      scale: { hero: 2.25, question: 1.25, body: 1, helper: 0.875 },
    },
    shape: {
      radius: parseFloat(formData.themeBorderRadius ?? "10") || 10,
      border: { width: 1, style: "solid" as const, color: "#e5e7eb" },
    },
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Device switcher bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background shrink-0">
        <span className="text-xs font-medium text-muted-foreground">Preview mode</span>
        <div className="flex items-center gap-3">
          {store.isDirty && (
            <span className="text-xs text-muted-foreground bg-tint-butter/60 px-2 py-0.5 rounded-full">
              Unsaved changes
            </span>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href={`/form/${formId}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5 mr-1.5" />
              Open in new tab
            </a>
          </Button>
          <ToggleGroup
            type="single"
            value={device}
            onValueChange={(v) => {
              if (v) setDevice(v as typeof device);
            }}
            className="bg-secondary rounded-full p-0.5"
          >
            <ToggleGroupItem value="desktop" size="sm" className="rounded-full size-7 p-0 data-[state=on]:bg-foreground data-[state=on]:text-background">
              <Monitor className="size-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="tablet" size="sm" className="rounded-full size-7 p-0 data-[state=on]:bg-foreground data-[state=on]:text-background">
              <Tablet className="size-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="mobile" size="sm" className="rounded-full size-7 p-0 data-[state=on]:bg-foreground data-[state=on]:text-background">
              <Smartphone className="size-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className={`mx-auto ${DEVICE_WIDTHS[device]} transition-all duration-300`}>
          <div
            className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
            style={{ backgroundColor: themeConfig.colors.background }}
          >
            <FormPreviewRenderer
              fields={store.fields.length > 0 ? store.fields : (formData.fields ?? [])}
              formTitle={store.title || formData.title}
              formDescription={store.description || formData.description || undefined}
              coverImageUrl={store.coverImageUrl}
              themeConfig={themeConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
