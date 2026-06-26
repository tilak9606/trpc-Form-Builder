"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Settings, Copy, Trash2 } from "lucide-react";

interface FieldRowProps {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  icon: React.ReactNode;
  preview?: React.ReactNode;
  onSettings?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function FieldRow({
  id,
  label,
  type,
  required = false,
  icon,
  preview,
  onSettings,
  onDuplicate,
  onDelete,
}: FieldRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
        isDragging
          ? "opacity-50 border-brand bg-brand/5 shadow-shadow-lg z-50"
          : "border-transparent hover:border-border hover:bg-hover hover:px-5 hover:-mx-2"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-7 text-text-muted group-hover:text-text-secondary cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <label className="flex items-center gap-1 text-sm font-medium text-text-primary mb-2">
          {label}
          {required && (
            <span className="text-error text-xs" aria-label="required">
              *
            </span>
          )}
        </label>

        {preview || (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-base border border-border rounded-lg text-sm text-text-muted">
            <span className="text-text-secondary">{icon}</span>
            <span>{type}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onSettings}
          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-surface transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4 text-text-secondary" />
        </button>
        <button
          onClick={onDuplicate}
          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-surface transition-colors"
          title="Duplicate"
        >
          <Copy className="w-4 h-4 text-text-secondary" />
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-error/10 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-error" />
        </button>
      </div>
    </div>
  );
}
