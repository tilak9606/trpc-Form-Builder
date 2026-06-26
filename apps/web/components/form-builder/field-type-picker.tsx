"use client";

import * as React from "react";
import { FIELD_TYPES, type FieldType } from "@repo/database/constants/field-types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import {
  Type,
  AlignLeft,
  AtSign,
  Hash,
  Calendar,
  CircleDot,
  ListChecks,
  SquareCheck,
  Star,
  Phone,
  type LucideIcon,
} from "lucide-react";

export const FIELD_TYPE_ICON_MAP: Record<FieldType, LucideIcon> = {
  TEXT: Type,
  TEXTAREA: AlignLeft,
  EMAIL: AtSign,
  NUMBER: Hash,
  DATE: Calendar,
  SELECT: CircleDot,
  MULTI_SELECT: ListChecks,
  CHECKBOX: SquareCheck,
  RATING: Star,
  PASSWORD: Type,
  YES_NO: SquareCheck,
  TIME: Calendar,
  TAGS: ListChecks,
  TOGGLE: CircleDot,
  RADIO: CircleDot,
  FILE_UPLOAD: AlignLeft,
};

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  TEXT: "Short Text",
  TEXTAREA: "Long Text",
  EMAIL: "Email",
  NUMBER: "Number",
  DATE: "Date",
  SELECT: "Single Select",
  MULTI_SELECT: "Multi Select",
  CHECKBOX: "Checkbox",
  RATING: "Rating",
  PASSWORD: "Password",
  YES_NO: "Yes/No",
  TIME: "Time",
  TAGS: "Tags",
  TOGGLE: "Toggle",
  RADIO: "Radio",
  FILE_UPLOAD: "File Upload",
};

interface FieldTypePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: FieldType) => void;
}

export function FieldTypePicker({
  open,
  onOpenChange,
  onSelect,
}: FieldTypePickerProps) {
  const handleSelect = (type: string) => {
    onSelect(type as FieldType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-sm" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Add a field</DialogTitle>
        <Command>
          <CommandInput placeholder="Search field types..." />
          <CommandList>
            <CommandEmpty>No field type found.</CommandEmpty>
            <CommandGroup heading="Field Types">
              {FIELD_TYPES.map((type) => {
                const Icon = FIELD_TYPE_ICON_MAP[type];
                return (
                  <CommandItem
                    key={type}
                    value={type}
                    onSelect={handleSelect}
                    data-testid={`field-type-${type}`}
                  >
                    <Icon className="size-4 mr-2 text-muted-foreground" />
                    {FIELD_TYPE_LABELS[type]}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}