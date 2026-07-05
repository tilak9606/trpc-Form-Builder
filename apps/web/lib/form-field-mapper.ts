import type { EditorField } from "~/lib/stores/form-editor-store";

/**
 * Converts a raw server-shaped field (as returned by `form.getByIdWithFields`)
 * into the shape the editor store / publish flow expects.
 *
 * IMPORTANT: this is the single source of truth for that mapping. Do not
 * inline this transform elsewhere — the publish flow silently breaks if the
 * store falls back to unmapped server data (see handlePublish in layout.tsx).
 */
export function mapServerFieldToEditorField(f: any): EditorField {
  return {
    id: f.id,
    type: f.type,
    label: f.label,
    placeholder: f.placeholder ?? undefined,
    helpText: f.description ?? undefined,
    required: f.isRequired ?? false,
    pageNumber: f.page,
    options: f.options?.length
      ? f.options.map((o: string) => ({ label: o, value: o }))
      : undefined,
    validations: f.validation ?? undefined,
    settings: undefined,
  };
}

export function mapServerFieldsToEditorFields(fields: any[] | undefined | null): EditorField[] {
  return (fields ?? []).map(mapServerFieldToEditorField);
}
