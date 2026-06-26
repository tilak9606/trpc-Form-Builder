"use client";

import { X, Trash2, Copy, Settings } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";

interface FieldConfig {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  options?: string[];
}

interface PropertiesPanelProps {
  field: FieldConfig | null;
  onUpdate?: (fieldId: string, updates: Partial<FieldConfig>) => void;
  onDelete?: (fieldId: string) => void;
  onDuplicate?: (fieldId: string) => void;
}

export function PropertiesPanel({
  field,
  onUpdate,
  onDelete,
  onDuplicate,
}: PropertiesPanelProps) {
  if (!field) {
    return (
      <aside className="w-[260px] bg-surface-2 border-l border-border overflow-y-auto p-4">
        <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
          <Settings className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">Select a field to edit its properties</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[260px] bg-surface-2 border-l border-border overflow-y-auto">
      <div className="sticky top-0 bg-surface-2 border-b border-border p-4 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-text-primary">Field Settings</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicate?.(field.id)}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-hover transition-colors"
            title="Duplicate"
          >
            <Copy className="w-4 h-4 text-text-secondary" />
          </button>
          <button
            onClick={() => onDelete?.(field.id)}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-error/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-error" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="field-label" className="text-sm font-medium text-text-primary">
            Label
          </Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => onUpdate?.(field.id, { label: e.target.value })}
            className="bg-surface border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-placeholder" className="text-sm font-medium text-text-primary">
            Placeholder
          </Label>
          <Input
            id="field-placeholder"
            value={field.placeholder || ""}
            onChange={(e) => onUpdate?.(field.id, { placeholder: e.target.value })}
            className="bg-surface border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-helper" className="text-sm font-medium text-text-primary">
            Helper Text
          </Label>
          <Input
            id="field-helper"
            value={field.helperText || ""}
            onChange={(e) => onUpdate?.(field.id, { helperText: e.target.value })}
            className="bg-surface border-border"
          />
        </div>

        <Separator className="bg-border" />

        <div className="flex items-center justify-between">
          <Label htmlFor="field-required" className="text-sm font-medium text-text-primary">
            Required
          </Label>
          <Switch
            id="field-required"
            checked={field.required || false}
            onCheckedChange={(checked) =>
              onUpdate?.(field.id, { required: checked })
            }
          />
        </div>

        {field.options && field.options.length > 0 && (
          <>
            <Separator className="bg-border" />
            <div className="space-y-2">
              <Label className="text-sm font-medium text-text-primary">Options</Label>
              <div className="space-y-2">
                {field.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...field.options!];
                        newOptions[index] = e.target.value;
                        onUpdate?.(field.id, { options: newOptions });
                      }}
                      className="bg-surface border-border text-sm"
                    />
                    <button
                      onClick={() => {
                        const newOptions = field.options!.filter((_, i) => i !== index);
                        onUpdate?.(field.id, { options: newOptions });
                      }}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-error/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-error" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onUpdate?.(field.id, {
                      options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`],
                    })
                  }
                  className="w-full"
                >
                  + Add Option
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
