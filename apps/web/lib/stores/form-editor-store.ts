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
  validations?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface CustomTheme {
  colors?: Record<string, string>;
  fonts?: {
    display?: string;
    body?: string;
    weights?: { display: number; body: number };
    scale?: { hero: number; question: number; body: number; helper: number };
  };
  shape?: {
    radius?: number;
    border?: { width: number; style: string; color: string };
  };
}

interface FormEditorState {
  formId: string | null;
  title: string;
  description: string;
  fields: EditorField[];
  selectedFieldId: string | null;
  themeId: string | null;
  coverImageUrl: string | null;
  customTheme: CustomTheme | null;
  showFieldIcons: boolean;
  isDirty: boolean;
  lastSavedAt: number | null;
  currentPage: number;
  pageCount: number;

  setFormData: (data: {
    formId: string;
    title: string;
    description: string;
    fields: EditorField[];
    themeId?: string | null;
    coverImageUrl?: string | null;
    customTheme?: CustomTheme | null;
    showFieldIcons?: boolean;
  }) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setShowFieldIcons: (show: boolean) => void;
  setThemeId: (themeId: string | null) => void;
  setCoverImageUrl: (url: string | null) => void;
  updateCustomTheme: (updates: Partial<CustomTheme>) => void;
  setCustomTheme: (theme: CustomTheme | null) => void;

  addField: (type: FieldType) => void;
  addServerField: (field: EditorField) => void;
  updateField: (fieldId: string, data: Partial<EditorField>) => void;
  deleteField: (fieldId: string) => void;
  reorderFields: (fieldIds: string[]) => void;
  selectField: (fieldId: string | null) => void;

  markSaved: () => void;
  markDirty: () => void;
  reset: () => void;

  setCurrentPage: (page: number) => void;
  addPage: () => void;
  removePage: (pageNumber: number) => void;
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
  currentPage: 1,
  pageCount: 1,

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
      currentPage: 1,
      pageCount: 1,
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
    let defaultOptions: { label: string; value: string }[] | undefined;
    switch (type) {
      case "TEXT": placeholder = "Type your answer here..."; break;
      case "TEXTAREA": placeholder = "Type your detailed answer here..."; break;
      case "EMAIL": placeholder = "you@example.com"; break;
      case "NUMBER": placeholder = "e.g., 42"; break;
      case "DATE": placeholder = "Pick a date"; break;
      case "TIME": placeholder = "Select time"; break;
      case "SELECT": placeholder = "Select an option"; defaultOptions = [{ label: "Option 1", value: "Option 1" }, { label: "Option 2", value: "Option 2" }]; break;
      case "MULTI_SELECT": placeholder = "Select options"; defaultOptions = [{ label: "Option 1", value: "Option 1" }, { label: "Option 2", value: "Option 2" }]; break;
      case "PASSWORD": placeholder = "Enter password"; break;
      case "YES_NO": placeholder = "Yes or No"; defaultOptions = [{ label: "Yes", value: "true" }, { label: "No", value: "false" }]; break;
      case "RATING": placeholder = "Rate 1-5"; break;
      case "TAGS": placeholder = "Add tags"; break;
      case "TOGGLE": placeholder = "Toggle on/off"; break;
      case "RADIO": placeholder = "Select one"; defaultOptions = [{ label: "Option 1", value: "Option 1" }, { label: "Option 2", value: "Option 2" }]; break;
      case "CHECKBOX": placeholder = "Check options"; defaultOptions = [{ label: "Option 1", value: "Option 1" }, { label: "Option 2", value: "Option 2" }]; break;
      case "FILE_UPLOAD": placeholder = "Upload file"; break;
    }

    const newField: EditorField = {
      id: generateTempId(),
      type,
      label: FIELD_TYPE_LABELS[type] ?? type,
      placeholder: placeholder || undefined,
      required: false,
      options: defaultOptions,
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
      currentPage: 1,
      pageCount: 1,
    }),

  setCurrentPage: (page) =>
    set((state) => ({ currentPage: Math.max(1, Math.min(page, state.pageCount)) })),

  addPage: () =>
    set((state) => ({
      pageCount: state.pageCount + 1,
      currentPage: state.pageCount + 1,
      isDirty: true,
    })),

  removePage: (pageNumber) =>
    set((state) => {
      if (state.pageCount <= 1) return state;
      if (pageNumber < 1 || pageNumber > state.pageCount) return state;

      const newCurrentPage =
        state.currentPage > pageNumber
          ? state.currentPage - 1
          : state.currentPage === pageNumber
            ? 1
            : state.currentPage;

      return {
        pageCount: state.pageCount - 1,
        currentPage: Math.min(newCurrentPage, state.pageCount - 1),
        fields: state.fields
          .filter((f) => (f.pageNumber ?? 1) !== pageNumber)
          .map((f) => {
            const pn = f.pageNumber ?? 1;
            return pn > pageNumber ? { ...f, pageNumber: pn - 1 } : f;
          }),
        isDirty: true,
      };
    }),
 }));