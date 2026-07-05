"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, ChevronDown, Copy, Plus, X } from "lucide-react";
import { FIELD_TYPE_ICON_MAP } from "./field-type-picker";
import { cn } from "~/lib/utils";
import { env } from "~/env";
import { Button } from "~/components/ui/button";
import { toast } from "~/lib/toast";
import { Label } from "~/components/ui/label";
import type { EditorField } from "~/lib/stores/form-editor-store";

interface FormCanvasProps {
  fields: EditorField[];
  formTitle: string;
  formDescription?: string;
  onUpdateTitle?: (title: string) => void;
  onUpdateDescription?: (description: string) => void;
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onReorder: (fieldIds: string[]) => void;
  onDeleteField: (id: string) => void;
  onDuplicateField?: (id: string) => void;
  onUpdateField?: (id: string, data: any) => void;
  coverImageUrl: string | null;
  onUpdateCoverImage: (url: string | null) => void;
  showFieldIcons?: boolean;
}

export function FormCanvas({
  fields,
  formTitle,
  formDescription,
  onUpdateTitle,
  onUpdateDescription,
  selectedFieldId,
  onSelectField,
  onReorder,
  onDeleteField,
  onDuplicateField,
  onUpdateField,
  coverImageUrl,
  onUpdateCoverImage,
  showFieldIcons = false,
}: FormCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [isUploading, setIsUploading] = React.useState(false);

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = (env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/trpc").replace("/trpc", "/api/upload");
      const res = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      onUpdateCoverImage(data.url);
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const fieldIds = fields.map((f) => f.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fieldIds.indexOf(active.id as string);
    const newIndex = fieldIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const newIds = [...fieldIds];
    newIds.splice(oldIndex, 1);
    newIds.splice(newIndex, 0, active.id as string);
    onReorder(newIds);
  };

  return (
    <div className="bg-background p-8">
      <div className="max-w-2xl mx-auto bg-card rounded-2xl border border-border/60 shadow-sm p-8 min-h-[600px] relative group">

        {/* Banner Section */}
        <div className="mb-8 relative rounded-xl overflow-hidden bg-muted/30 group/banner transition-all">
          {coverImageUrl ? (
            <div className="relative w-full h-48 group">
              <img src={coverImageUrl} alt="Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button variant="secondary" size="sm" onClick={() => onUpdateCoverImage(null)}>
                  <Trash2 className="size-4 mr-2" />
                  Remove Banner
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-24 border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors">
              <Label className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
                {isUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4"><path d="M7.5 1.5C7.77614 1.5 8 1.72386 8 2V7H13C13.2761 7 13.5 7.22386 13.5 7.5C13.5 7.77614 13.2761 8 13 8H8V13C8 13.2761 7.77614 13.5 7.5 13.5C7.22386 13.5 7 13.2761 7 13V8H2C1.72386 8 1.5 7.77614 1.5 7.5C1.5 7.22386 1.72386 7 2 7H7V2C7 1.72386 7.77614 1.5 7.5 1.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" /></svg>
                    Add Banner Image
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleUploadBanner} disabled={isUploading} />
              </Label>
            </div>
          )}
        </div>

        {/* Form header */}
        <div className="mb-8">
          {onUpdateTitle ? (
            <input
              type="text"
              value={formTitle}
              onChange={(e) => onUpdateTitle(e.target.value)}
              placeholder="Form Title"
              className="text-2xl font-semibold text-foreground w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/50 transition-colors hover:bg-muted/30 focus:bg-muted/30 rounded px-1 -ml-1"
            />
          ) : (
            <h2 className="text-2xl font-semibold text-foreground">{formTitle}</h2>
          )}

          {onUpdateDescription ? (
            <textarea
              value={formDescription || ""}
              onChange={(e) => onUpdateDescription(e.target.value)}
              placeholder="Add a description (optional)"
              className="mt-2 text-sm text-muted-foreground w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 resize-none placeholder:text-muted-foreground/50 overflow-hidden transition-colors hover:bg-muted/30 focus:bg-muted/30 rounded px-1 -ml-1"
              rows={formDescription ? formDescription.split('\n').length : 1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
            />
          ) : (
            formDescription && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{formDescription}</p>
          )}
        </div>

        {/* Fields */}
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground text-sm">
              Click on fields from the left panel to start building your form.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {fields.map((field) => (
                  <SortableFieldRow
                    key={field.id}
                    field={field}
                    isSelected={field.id === selectedFieldId}
                    onSelect={() => onSelectField(field.id)}
                    onDelete={() => onDeleteField(field.id)}
                    onDuplicate={onDuplicateField ? () => onDuplicateField(field.id) : undefined}
                    onUpdateField={onUpdateField}
                    showFieldIcons={showFieldIcons}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

      </div>
    </div>
  );
}

function SortableFieldRow({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdateField,
  showFieldIcons,
}: {
  field: EditorField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onUpdateField?: (id: string, data: any) => void;
  showFieldIcons?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = FIELD_TYPE_ICON_MAP[field.type as keyof typeof FIELD_TYPE_ICON_MAP] || (() => null);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group relative rounded-xl border p-4 cursor-pointer transition-colors",
        isSelected
          ? "border-primary/40 bg-primary/[0.02] shadow-sm"
          : "border-transparent hover:border-border",
        isDragging && "opacity-50 shadow-lg",
      )}
    >
      {/* Drag handle */}
      <button
        className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      {/* Delete button */}
      <button
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        <Trash2 className="size-3.5" />
      </button>

      {/* Duplicate button */}
      {onDuplicate && (
        <button
          className="absolute right-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          title="Duplicate field"
        >
          <Copy className="size-3.5" />
        </button>
      )}

      {/* Field preview */}
      <div className="pl-5">
        <div className="flex items-center text-sm font-medium text-foreground">
          {showFieldIcons && (
            <span className="mr-2 text-muted-foreground shrink-0">
              <Icon className="size-4" />
            </span>
          )}
          {onUpdateField ? (
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
              className="bg-transparent border-none focus:outline-none focus:ring-0 p-0 m-0 w-full hover:bg-muted/30 focus:bg-muted/30 rounded px-1 -ml-1 transition-colors"
            />
          ) : (
            <label className="text-sm font-medium text-foreground">{field.label}</label>
          )}
          {field.required && <span className="text-destructive ml-auto mr-6">*</span>}
        </div>
        <div className="mt-2">
          <FieldPreviewInput field={field} onUpdateField={onUpdateField} />
        </div>
      </div>
    </div>
  );
}

function FieldPreviewInput({ field, onUpdateField }: { field: EditorField; onUpdateField?: (id: string, data: any) => void }) {
  const type = field.type;

  let defaultPlaceholder = "Your answer...";
  if (type === "EMAIL") defaultPlaceholder = "john@example.com";
  else if (type === "NUMBER") defaultPlaceholder = "123";
  else if (type === "TEXT") defaultPlaceholder = "John Doe";
  else if (type === "TEXTAREA") defaultPlaceholder = "Enter your message...";
  else if (type === "DATE") defaultPlaceholder = "mm/dd/yyyy";
  else if (type === "TIME") defaultPlaceholder = "hh:mm";
  else if (type === "SELECT" || type === "MULTI_SELECT") defaultPlaceholder = "Select an option...";
  else if (type === "PASSWORD") defaultPlaceholder = "Enter password";

  const placeholder = field.placeholder || defaultPlaceholder;
  const baseClass = "w-full rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground flex items-center transition-colors";

  const editableClass = onUpdateField ? "hover:bg-muted/30 focus:bg-muted/30 focus:outline-none focus:ring-0 cursor-text" : "pointer-events-none";

  switch (type) {
    case "TEXTAREA":
      return (
        <textarea
          className={cn(baseClass, "h-20 items-start py-2 resize-none", editableClass)}
          placeholder={defaultPlaceholder}
          value={field.placeholder || ""}
          onChange={(e) => onUpdateField?.(field.id, { placeholder: e.target.value })}
          readOnly={!onUpdateField}
        />
      );
    case "CHECKBOX":
      return (
        <div className="space-y-3 mt-1">
          <div className={cn("space-y-2 pl-3 border-l-2 border-border/30", onUpdateField ? "" : "pointer-events-none")}>
            {(field.options ?? []).length > 0 ? (
              (field.options ?? []).map((opt: any, i: number) => (
                <div key={i} className={cn("flex items-center gap-2", onUpdateField && "group/opt")}>
                  <div className="size-4 rounded border border-border shrink-0 bg-background" />
                  {onUpdateField ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <input
                        className="flex-1 text-sm text-foreground bg-transparent border border-transparent hover:border-border/50 focus:border-border rounded px-1 py-0.5 outline-none transition-colors min-w-0"
                        value={opt.label}
                        onChange={(e) => {
                          const newOptions = [...(field.options ?? [])];
                          newOptions[i] = { ...newOptions[i], label: e.target.value, value: e.target.value };
                          onUpdateField(field.id, { options: newOptions });
                        }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); onUpdateField(field.id, { options: (field.options ?? []).filter((_: any, j: number) => j !== i) }); }}
                        className="text-muted-foreground hover:text-destructive shrink-0 p-0.5 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                        aria-label={`Remove ${opt.label}`}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-foreground">{opt.label}</span>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No options added yet</span>
            )}
            {onUpdateField && (
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateField(field.id, { options: [...(field.options ?? []), { label: `Option ${(field.options ?? []).length + 1}`, value: `Option ${(field.options ?? []).length + 1}` }] }); }}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Plus className="size-3" /> Add option
              </button>
            )}
          </div>
        </div>
      );
    case "RATING":
      return (
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="text-lg text-border">&#9733;</span>
          ))}
        </div>
      );
    case "SELECT":
    case "MULTI_SELECT":
    case "RADIO":
      return (
        <div className="space-y-3 mt-1">
          <div className={cn(baseClass, "h-10 flex justify-between items-center")}>
            {onUpdateField ? (
              <input
                 className={cn("bg-transparent border-none p-0 focus:ring-0 w-full text-sm", editableClass)}
                 placeholder={defaultPlaceholder}
                 value={field.placeholder || ""}
                 onChange={(e) => onUpdateField(field.id, { placeholder: e.target.value })}
              />
            ) : (
              <span>{placeholder}</span>
            )}
            <ChevronDown className="size-4 opacity-50 pointer-events-none" />
          </div>
          <div className={cn("space-y-2 pl-3 border-l-2 border-border/30", onUpdateField ? "" : "pointer-events-none")}>
            {(field.options ?? []).length > 0 ? (
              (field.options ?? []).map((opt, i: number) => (
                <div key={i} className={cn("flex items-center gap-2", onUpdateField && "group/opt")}>
                  <div className={cn("size-4 border border-border shrink-0 bg-background", type === "SELECT" || type === "RADIO" ? "rounded-full" : "rounded")} />
                  {onUpdateField ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <input
                        className="flex-1 text-sm text-foreground bg-transparent border border-transparent hover:border-border/50 focus:border-border rounded px-1 py-0.5 outline-none transition-colors min-w-0"
                        value={opt.label}
                        onChange={(e) => {
                          const newOptions = [...(field.options ?? [])];
                          newOptions[i] = { ...newOptions[i], label: e.target.value, value: e.target.value };
                          onUpdateField(field.id, { options: newOptions });
                        }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); onUpdateField(field.id, { options: (field.options ?? []).filter((_: any, j: number) => j !== i) }); }}
                        className="text-muted-foreground hover:text-destructive shrink-0 p-0.5 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                        aria-label={`Remove ${opt.label}`}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-foreground">{opt.label}</span>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No options added yet</span>
            )}
            {onUpdateField && (
              <button
                onClick={(e) => { e.stopPropagation(); onUpdateField(field.id, { options: [...(field.options ?? []), { label: `Option ${(field.options ?? []).length + 1}`, value: `Option ${(field.options ?? []).length + 1}` }] }); }}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Plus className="size-3" /> Add option
              </button>
            )}
          </div>
        </div>
      );
    case "DATE":
      return <input type="date" className={cn(baseClass, "h-10 pointer-events-none")} readOnly />;
    case "TIME":
      return <input type="time" className={cn(baseClass, "h-10 pointer-events-none")} readOnly />;
    default:
      return (
        <input
          type="text"
          className={cn(baseClass, "h-10", editableClass)}
          placeholder={defaultPlaceholder}
          value={field.placeholder || ""}
          onChange={(e) => onUpdateField?.(field.id, { placeholder: e.target.value })}
          readOnly={!onUpdateField}
        />
      );
  }
}
