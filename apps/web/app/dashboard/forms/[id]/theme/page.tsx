"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Palette, Sparkles, Check, Save, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "~/components/ui/resizable";
import { useGetFormWithFields, useUpdateForm } from "~/hooks/api/form";
import { useFormEditorStore } from "~/lib/stores/form-editor-store";
import { FormPreviewRenderer } from "~/components/form-builder/form-preview-renderer";
import { ProGate } from "~/components/pro-gate";
import { toast } from "~/lib/toast";
import { cn } from "~/lib/utils";

const FONT_OPTIONS = [
  { value: "system-ui, sans-serif", label: "System Default" },
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Fira Code', monospace", label: "Fira Code" },
];

const THEME_PRESETS = [
  {
    id: "minimal-light",
    name: "Minimal Light",
    category: "minimal",
    colors: { background: "#ffffff", foreground: "#111827", surface: "#f9fafb", accent: "#111827", accentForeground: "#ffffff", border: "#e5e7eb" },
    fonts: { display: "system-ui, sans-serif", body: "system-ui, sans-serif" },
    shape: { radius: 10 },
  },
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    category: "minimal",
    colors: { background: "#111827", foreground: "#f9fafb", surface: "#1f2937", accent: "#f9fafb", accentForeground: "#111827", border: "#374151" },
    fonts: { display: "system-ui, sans-serif", body: "system-ui, sans-serif" },
    shape: { radius: 10 },
  },
  {
    id: "editorial-cream",
    name: "Editorial Cream",
    category: "editorial",
    colors: { background: "#f0efe3", foreground: "#1a1a1a", surface: "#ffffff", accent: "#1a1a1a", accentForeground: "#f0efe3", border: "#e5e5e5" },
    fonts: { display: "'Playfair Display', serif", body: "'Inter', sans-serif" },
    shape: { radius: 12 },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    category: "corporate",
    colors: { background: "#f0f9ff", foreground: "#0c4a6e", surface: "#ffffff", accent: "#0284c7", accentForeground: "#ffffff", border: "#bae6fd" },
    fonts: { display: "'Montserrat', sans-serif", body: "'Inter', sans-serif" },
    shape: { radius: 8 },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    category: "nature",
    colors: { background: "#f0fdf4", foreground: "#14532d", surface: "#ffffff", accent: "#16a34a", accentForeground: "#ffffff", border: "#bbf7d0" },
    fonts: { display: "'Merriweather', serif", body: "'Lato', sans-serif" },
    shape: { radius: 10 },
  },
  {
    id: "sunset-warm",
    name: "Sunset Warm",
    category: "vibrant",
    colors: { background: "#fefce8", foreground: "#713f12", surface: "#ffffff", accent: "#ea580c", accentForeground: "#ffffff", border: "#fde68a" },
    fonts: { display: "'Playfair Display', serif", body: "'Open Sans', sans-serif" },
    shape: { radius: 14 },
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    category: "vibrant",
    colors: { background: "#faf5ff", foreground: "#581c87", surface: "#ffffff", accent: "#9333ea", accentForeground: "#ffffff", border: "#e9d5ff" },
    fonts: { display: "'Montserrat', sans-serif", body: "'Inter', sans-serif" },
    shape: { radius: 12 },
  },
  {
    id: "sleek-dark",
    name: "Sleek Dark",
    category: "dark",
    colors: { background: "#0a0a0a", foreground: "#fafafa", surface: "#171717", accent: "#a3a3a3", accentForeground: "#0a0a0a", border: "#262626" },
    fonts: { display: "'Inter', sans-serif", body: "'Inter', sans-serif" },
    shape: { radius: 6 },
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "minimal", label: "Minimal" },
  { id: "editorial", label: "Editorial" },
  { id: "corporate", label: "Corporate" },
  { id: "nature", label: "Nature" },
  { id: "vibrant", label: "Vibrant" },
  { id: "dark", label: "Dark" },
] as const;

export default function ThemePage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string | undefined;

  const { form, isLoading } = useGetFormWithFields(formId);
  const { updateFormAsync, isPending } = useUpdateForm();
  const store = useFormEditorStore();

  const [activeCategory, setActiveCategory] = React.useState("all");

  // Initialize store from API data
  React.useEffect(() => {
    if (form && store.formId !== formId) {
      const customTheme = (form as any)?.settings?.customTheme;
      store.setFormData({
        formId: formId!,
        title: form.title ?? "",
        description: form.description ?? "",
        fields: (form.fields ?? []) as any,
        coverImageUrl: null,
        customTheme: customTheme ?? {
          colors: {
            background: "#000000",
            foreground: "#ffffff",
            surface: "#000000",
            accent: "#3b82f6",
            accentForeground: "#ffffff",
            border: "#e5e7eb",
          },
          fonts: {
            display: "Inter",
            body: "Inter",
          },
          shape: {
            radius: 10,
          },
        },
      });
    }
  }, [form, formId]);

  const activeThemeConfig = React.useMemo(() => {
    const custom = store.customTheme;
    if (!custom) {
      return {
        colors: { background: "#ffffff", foreground: "#111827", surface: "#f9fafb", accent: "#111827", accentForeground: "#ffffff", border: "#e5e7eb" },
        fonts: { display: "system-ui, sans-serif", body: "system-ui, sans-serif", weights: { display: 700, body: 400 }, scale: { hero: 2.25, question: 1.25, body: 1, helper: 0.875 } },
        shape: { radius: 10, border: { width: 1, style: "solid", color: "#e5e7eb" } },
      };
    }
    return {
      colors: {
        background: custom.colors?.background ?? "#ffffff",
        foreground: custom.colors?.foreground ?? "#111827",
        surface: custom.colors?.surface ?? "#f9fafb",
        accent: custom.colors?.accent ?? "#111827",
        accentForeground: custom.colors?.accentForeground ?? "#ffffff",
        border: custom.colors?.border ?? "#e5e7eb",
        foregroundSoft: custom.colors?.foregroundSoft ?? "#6b7280",
        success: "#10b981",
        danger: "#ef4444",
      },
      fonts: {
        display: custom.fonts?.display ?? "system-ui, sans-serif",
        body: custom.fonts?.body ?? "system-ui, sans-serif",
        weights: { display: 700, body: 400 },
        scale: { hero: 2.25, question: 1.25, body: 1, helper: 0.875 },
      },
      shape: {
        radius: custom.shape?.radius ?? 10,
        border: { width: 1, style: "solid", color: custom.colors?.border ?? "#e5e7eb" },
      },
    };
  }, [store.customTheme]);

  const handleSaveDraft = async () => {
    if (!store.isDirty || !formId) return;
    try {
      await updateFormAsync({
        formId,
        settings: {
          customTheme: store.customTheme,
        },
      });
      store.markSaved();
      toast.success("Draft saved.");
    } catch {
      toast.error("Failed to save.");
    }
  };

  const handleSaveAndContinue = async () => {
    try {
      await handleSaveDraft();
      router.push(`/dashboard/forms/${formId}/preview`);
    } catch {
      toast.error("Failed to save.");
    }
  };

  const filteredPresets = activeCategory === "all"
    ? THEME_PRESETS
    : THEME_PRESETS.filter((t) => t.category === activeCategory);

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <ProGate feature="Custom Themes" description="Customize your form's appearance with custom themes, colors, and fonts.">
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Save bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          {store.isDirty && (
            <span className="text-xs text-muted-foreground bg-tint-butter/60 px-2 py-0.5 rounded-full">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={!store.isDirty || isPending}
          >
            <Save className="size-3.5 mr-1.5" />
            {isPending ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSaveAndContinue}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save & Continue"}
            <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      <ResizablePanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
        {/* Left panel — Theme selection */}
        <ResizablePanel
          defaultSize={35}
          className="h-full bg-background"
        >
          <div className="h-full overflow-y-auto p-6 space-y-6">
            <Tabs defaultValue="presets" className="space-y-4">
              <TabsList>
                <TabsTrigger value="presets" className="gap-1.5">
                  <Sparkles className="size-4" />
                  Themes
                </TabsTrigger>
                <TabsTrigger value="customize" className="gap-1.5">
                  <Palette className="size-4" />
                  Customize
                </TabsTrigger>
              </TabsList>

              <TabsContent value="presets" className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        activeCategory === cat.id
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPresets.map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      isActive={store.themeId === theme.id}
                      onSelect={() => {
                        store.setThemeId(theme.id);
                        store.setCustomTheme({
                          colors: theme.colors,
                          fonts: { display: theme.fonts.display, body: theme.fonts.body },
                          shape: { radius: theme.shape.radius },
                        });
                      }}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="customize" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Colors</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "background", label: "Background" },
                      { key: "foreground", label: "Text" },
                      { key: "surface", label: "Surface (Cards)" },
                      { key: "accent", label: "Accent (Buttons)" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <Label className="text-xs">{label}</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="color"
                            className="w-12 h-8 p-1"
                            value={store.customTheme?.colors?.[key] || "#000000"}
                            onChange={(e) => store.updateCustomTheme({ colors: { [key]: e.target.value } })}
                          />
                          <Input
                            className="flex-1 font-mono text-xs h-8"
                            value={store.customTheme?.colors?.[key] || ""}
                            onChange={(e) => store.updateCustomTheme({ colors: { [key]: e.target.value } })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Typography</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Display Font</Label>
                      <Select
                        value={store.customTheme?.fonts?.display || "system-ui, sans-serif"}
                        onValueChange={(val) => store.updateCustomTheme({ fonts: { display: val } })}
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs font-mono">
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem key={font.value} value={font.value} className="text-xs" style={{ fontFamily: font.value }}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Body Font</Label>
                      <Select
                        value={store.customTheme?.fonts?.body || "system-ui, sans-serif"}
                        onValueChange={(val) => store.updateCustomTheme({ fonts: { body: val } })}
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs font-mono">
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem key={font.value} value={font.value} className="text-xs" style={{ fontFamily: font.value }}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Shape</h3>
                  <div>
                    <Label className="text-xs">Border Radius (px)</Label>
                    <Input
                      type="number"
                      min={0}
                      className="mt-1 w-24 text-xs h-8"
                      value={store.customTheme?.shape?.radius ?? 10}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value) || 0);
                        store.updateCustomTheme({ shape: { radius: val } });
                      }}
                    />
                  </div>
                </div>

                {!store.customTheme && (
                  <div className="p-4 bg-tint-butter/30 rounded-xl text-sm border border-tint-butter">
                    <p>Select a preset theme first, then customize it here to create your own unique look!</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        const baseTheme = THEME_PRESETS[0];
                        if (!baseTheme) return;
                        store.setCustomTheme({
                          colors: baseTheme.colors,
                          fonts: { display: baseTheme.fonts.display, body: baseTheme.fonts.body },
                          shape: { radius: baseTheme.shape.radius },
                        });
                      }}
                    >
                      Start Customizing
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        {/* Dragger */}
        <ResizableHandle withHandle className="hidden lg:flex" />

        {/* Right panel — Live preview */}
        <ResizablePanel
          defaultSize={65}
          className="hidden lg:block h-full transition-colors duration-300"
        >
          <div
            className="h-full overflow-y-auto p-6"
            style={{ backgroundColor: activeThemeConfig.colors.background }}
          >
            <div className="sticky top-0 space-y-4 max-w-[500px] mx-auto">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Live Preview
              </h3>
              <FormPreviewRenderer
                fields={store.fields}
                formTitle={store.title}
                formDescription={store.description}
                coverImageUrl={store.coverImageUrl}
                themeConfig={activeThemeConfig}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
    </ProGate>
  );
}

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: (typeof THEME_PRESETS)[number];
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border overflow-hidden transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_oklch(0.22_0.04_180/0.15)]",
        isActive
          ? "ring-2 ring-foreground border-foreground"
          : "border-border hover:border-foreground/20",
      )}
      onClick={onSelect}
    >
      {isActive && (
        <div className="absolute top-3 right-3 z-10 size-6 rounded-full bg-foreground text-background flex items-center justify-center">
          <Check className="size-3.5" />
        </div>
      )}

      <div className="h-36 overflow-hidden">
        <div
          className="h-full p-5 flex flex-col justify-center"
          style={{ background: theme.colors.background }}
        >
          <p
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.fonts.display,
              fontSize: "1.1rem",
              fontWeight: 700,
            }}
          >
            What&apos;s your name?
          </p>
          <div
            className="mt-3 h-9 rounded"
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: `${theme.shape.radius}px`,
            }}
          />
          <div
            className="mt-3 h-8 w-24 rounded flex items-center justify-center"
            style={{
              background: theme.colors.accent,
              borderRadius: `${theme.shape.radius}px`,
            }}
          >
            <span
              style={{
                color: theme.colors.accentForeground,
                fontSize: "0.75rem",
                fontFamily: theme.fonts.body,
                fontWeight: 600,
              }}
            >
              Submit
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between bg-card">
        <div>
          <h3 className="text-sm font-semibold">{theme.name}</h3>
          <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full border border-border capitalize">
            {theme.category}
          </span>
        </div>
        <Button
          variant={isActive ? "outline" : "default"}
          size="sm"
          disabled={isActive}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isActive ? "Active" : "Use"}
        </Button>
      </div>
    </div>
  );
}
