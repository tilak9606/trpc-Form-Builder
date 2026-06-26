"use client";

import { create } from "zustand";
import type { FieldType } from "@repo/database/constants/field-types";
import { FIELD_TYPE_LABELS } from "~/components/form-builder/field-type-picker";

export interface EditorField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  pageNumber?: number;
  options?: { label: string; value: string }[];
  validations?: Record<string, any>;
  settings?: Record<string, any>;
}

interface FormEditorState {
  formId: string | null;
  title: string;
  description: string;
  fields: EditorField[];
  selectedFieldId: string | null;
  themeId: string | null;
  coverImageUrl: string | null;
  customTheme: any | null;
  showFieldIcons: boolean;
  isDirty: boolean;
  lastSavedAt: number | null;

  setFormData: (data: {
    formId: string;
    title: string;
    description: string;
    fields: EditorField[];
    themeId?: string | null;
    coverImageUrl?: string | null;
    customTheme?: any | null;
    showFieldIcons?: boolean;
  }) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setShowFieldIcons: (show: boolean) => void;
  setThemeId: (themeId: string | null) => void;
  setCoverImageUrl: (url: string | null) => void;
  updateCustomTheme: (updates: any) => void;
  setCustomTheme: (theme: any) => void;

  addField: (type: FieldType) => void;
  addServerField: (field: EditorField) => void;
  updateField: (fieldId: string, data: Partial<EditorField>) => void;
  deleteField: (fieldId: string) => void;
  reorderFields: (fieldIds: string[]) => void;
  selectField: (fieldId: string | null) => void;

  markSaved: () => void;
  markDirty: () => void;
  reset: () => void;
}

let fieldCounter = 0;

function generateTempId(): string {
  fieldCounter += 1;
  return `temp_${Date.now()}_${fieldCounter}`;
}

export const useFormEditorStore = create<FormEditorState>((set, get) => ({
  formId: null,
  title: "",
  description: "",
  fields: [],
  selectedFieldId: null,
  themeId: null,
  coverImageUrl: null,
  customTheme: null,
  showFieldIcons: false,
  isDirty: false,
  lastSavedAt: null,

  setFormData: (data) =>
    set({
      formId: data.formId,
      title: data.title,
      description: data.description,
      fields: data.fields,
      themeId: data.themeId ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      customTheme: data.customTheme ?? null,
      showFieldIcons: data.showFieldIcons ?? false,
      isDirty: false,
      selectedFieldId: null,
    }),

  setTitle: (title) => set({ title, isDirty: true }),
  setDescription: (description) => set({ description, isDirty: true }),
  setShowFieldIcons: (showFieldIcons) => set({ showFieldIcons, isDirty: true }),
  setThemeId: (themeId) => set({ themeId, isDirty: true }),
  setCoverImageUrl: (coverImageUrl) => set({ coverImageUrl, isDirty: true }),
  updateCustomTheme: (updates) =>
    set((state) => {
      const base = state.customTheme || {};
      return {
        customTheme: {
          ...base,
          ...updates,
          colors: { ...(base.colors || {}), ...(updates.colors || {}) },
          fonts: { ...(base.fonts || {}), ...(updates.fonts || {}) },
          shape: { ...(base.shape || {}), ...(updates.shape || {}) },
        },
        isDirty: true,
      };
    }),
  setCustomTheme: (theme) => set({ customTheme: theme, isDirty: true }),

  addField: (type) => {
    let placeholder = "";
    switch (type) {
      case "TEXT": placeholder = "Type your answer here..."; break;
      case "TEXTAREA": placeholder = "Type your detailed answer here..."; break;
      case "EMAIL": placeholder = "you@example.com"; break;
      case "NUMBER": placeholder = "e.g., 42"; break;
      case "DATE": placeholder = "Pick a date"; break;
      case "TIME": placeholder = "Select time"; break;
      case "SELECT": placeholder = "Select an option"; break;
      case "MULTI_SELECT": placeholder = "Select options"; break;
      case "PASSWORD": placeholder = "Enter password"; break;
      case "YES_NO": placeholder = "Yes or No"; break;
      case "RATING": placeholder = "Rate 1-5"; break;
      case "TAGS": placeholder = "Add tags"; break;
      case "TOGGLE": placeholder = "Toggle on/off"; break;
      case "RADIO": placeholder = "Select one"; break;
      case "CHECKBOX": placeholder = "Check options"; break;
      case "FILE_UPLOAD": placeholder = "Upload file"; break;
    }

    const newField: EditorField = {
      id: generateTempId(),
      type,
      label: FIELD_TYPE_LABELS[type] ?? type,
      placeholder: placeholder || undefined,
      required: false,
    };
    set((state) => ({
      fields: [...state.fields, newField],
      selectedFieldId: newField.id,
      isDirty: true,
    }));
  },

  addServerField: (field) =>
    set((state) => ({
      fields: [...state.fields, field],
      selectedFieldId: field.id,
      isDirty: true,
    })),

  updateField: (fieldId, data) =>
    set((state) => ({
      fields: state.fields.map((f) => (f.id === fieldId ? { ...f, ...data } : f)),
      isDirty: true,
    })),

  deleteField: (fieldId) =>
    set((state) => ({
      fields: state.fields.filter((f) => f.id !== fieldId),
      selectedFieldId: state.selectedFieldId === fieldId ? null : state.selectedFieldId,
      isDirty: true,
    })),

  reorderFields: (fieldIds) =>
    set((state) => {
      const fieldMap = new Map(state.fields.map((f) => [f.id, f]));
      const reordered = fieldIds.map((id) => fieldMap.get(id)).filter(Boolean) as EditorField[];
      return { fields: reordered, isDirty: true };
    }),

  selectField: (fieldId) => set({ selectedFieldId: fieldId }),

  markSaved: () => set({ isDirty: false, lastSavedAt: Date.now() }),
  markDirty: () => set({ isDirty: true }),

  reset: () =>
    set({
      formId: null,
      title: "",
      description: "",
      fields: [],
      selectedFieldId: null,
      themeId: null,
      coverImageUrl: null,
      customTheme: null,
      showFieldIcons: false,
      isDirty: false,
      lastSavedAt: null,
    }),
}));