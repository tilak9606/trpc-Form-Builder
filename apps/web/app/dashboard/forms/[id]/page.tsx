"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { ArrowRight, Save } from "lucide-react";

import { FieldPalette } from "~/components/form-builder/field-palette";
import { FormCanvas } from "~/components/form-builder/form-canvas";
import { FieldInspector } from "~/components/form-builder/field-inspector";
import { useFormEditorStore } from "~/lib/stores/form-editor-store";
import { mapServerFieldsToEditorFields } from "~/lib/form-field-mapper";

import { toast } from "~/lib/toast";
import { handleTrpcError } from "~/lib/api-error";
import type { FieldType } from "@repo/database/constants/field-types";

export default function FieldsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const formId = params.id;

  const { data: form, isLoading, refetch } = trpc.form.getByIdWithFields.useQuery(
    { formId },
    { enabled: !!formId }
  );

  const store = useFormEditorStore();
  const [isSaving, setIsSaving] = React.useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; label: string } | null>(null);

  const updateFormMutation = trpc.form.updateForm.useMutation();
  const createFieldMutation = trpc.formField.createField.useMutation();
  const updateFieldMutation = trpc.formField.updateField.useMutation();
  const deleteFieldMutation = trpc.formField.deleteField.useMutation();
  const duplicateFieldMutation = trpc.formField.duplicateField.useMutation();
  const reorderFieldMutation = trpc.formField.reorderFields.useMutation();

  // Initialize store from API data on first load, then re-sync title/description when server data changes
  const lastServerTitle = React.useRef<string>("");
  const lastServerDesc = React.useRef<string>("");

  React.useEffect(() => {
    if (!form) return;
    const formData = form as any;

    if (store.formId !== formId) {
      // First mount: full hydrate.
      // Bug #2 fix: this used to re-implement the server->editor field mapping inline,
      // as a second, independent copy of the same transform in form-field-mapper.ts.
      // Two copies of one mapping is exactly how they drift out of sync (see layout.tsx's
      // publish-flow fallback, which used the *other* shape). Now both call the same
      // function, so there is exactly one place that defines "server field -> editor field".
      const mappedFields = mapServerFieldsToEditorFields(formData.fields);

      store.setFormData({
        formId,
        title: formData.title ?? "",
        description: formData.description ?? "",
        fields: mappedFields,
        themeId: formData.themeId,
        coverImageUrl: formData.coverImageUrl,
        customTheme: formData.settings?.customTheme,
        showFieldIcons: formData.settings?.showFieldIcons ?? false,
      });

      lastServerTitle.current = formData.title ?? "";
      lastServerDesc.current = formData.description ?? "";
    } else {
      // Subsequent query updates: sync title/description from server (settings page is source of truth)
      const serverTitle = formData.title ?? "";
      const serverDesc = formData.description ?? "";
      if (lastServerTitle.current !== serverTitle || lastServerDesc.current !== serverDesc) {
        lastServerTitle.current = serverTitle;
        lastServerDesc.current = serverDesc;
        store.setTitle(serverTitle);
        store.setDescription(serverDesc);
      }
    }
  }, [form, formId]);

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (store.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [store.isDirty]);

  const handleSaveDraft = async () => {
    if (!store.isDirty || !formId) return;
    setIsSaving(true);
    try {
      await saveForm();
      toast.success("Draft saved.");
    } catch (err) {
      console.error("Save draft error:", err);
      handleTrpcError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!formId) return;
    setIsSaving(true);
    try {
      await saveForm();
      toast.success("Form saved!");
      router.push(`/dashboard/forms/${formId}/theme`);
    } catch (err) {
      console.error("Save & continue error:", err);
      handleTrpcError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const toApiOptions = (options?: { label: string; value: string }[]) =>
    options?.map((o) => o.label) ?? undefined;

  const toApiValidation = (field: any) => {
    const v: any = {};
    if (field.validations?.minLength) v.minLength = field.validations.minLength;
    if (field.validations?.maxLength) v.maxLength = field.validations.maxLength;
    if (field.validations?.min !== undefined) v.min = field.validations.min;
    if (field.validations?.max !== undefined) v.max = field.validations.max;
    if (field.validations?.pattern) v.pattern = field.validations.pattern;
    return Object.keys(v).length > 0 ? v : undefined;
  };

  const saveForm = async () => {
    if (!formId) return;

    try {
      await updateFormMutation.mutateAsync({
        formId,
        title: store.title,
        description: store.description || undefined,
        coverImageUrl: store.coverImageUrl,
        settings: {
          ...((form as any)?.settings || {}),
          showFieldIcons: store.showFieldIcons,
          customTheme: store.customTheme,
        },
      });
    } catch (err) {
      console.error("Step 1 - update form failed:", err);
      throw err;
    }

    const initialFields = (form as any)?.fields || [];
    const deletedIds = initialFields
      .map((f: any) => f.id)
      .filter((id: string) => !store.fields.find((f) => f.id === id));

    for (const id of deletedIds) {
      try {
        await deleteFieldMutation.mutateAsync({ id, formId });
      } catch (err) {
        console.error(`Step 2 - delete field ${id} failed:`, err);
        throw err;
      }
    }

    const createPromises = store.fields
      .filter((f) => f.id.startsWith("temp_"))
      .map(async (field) => {
        const res = await createFieldMutation.mutateAsync({
          formId,
          type: field.type as FieldType,
          label: field.label,
          placeholder: field.placeholder,
          description: field.helpText,
          isRequired: field.required,
          options: toApiOptions(field.options),
          validation: toApiValidation(field),
          page: field.pageNumber ?? 1,
        });
        return { tempId: field.id, realId: res.id };
      });

    const updatePromises = store.fields
      .filter((f) => !f.id.startsWith("temp_"))
      .map((field) =>
        updateFieldMutation.mutateAsync({
          id: field.id,
          formId,
          label: field.label,
          placeholder: field.placeholder,
          description: field.helpText,
          isRequired: field.required,
          options: toApiOptions(field.options),
          validation: toApiValidation(field),
          page: field.pageNumber ?? 1,
        }),
      );

    let created: { tempId: string; realId: string }[];
    try {
      created = await Promise.all(createPromises);
    } catch (err) {
      console.error("Step 3 - create fields failed:", err);
      throw err;
    }

    try {
      await Promise.all(updatePromises);
    } catch (err) {
      console.error("Step 4 - update fields failed:", err);
      throw err;
    }

    const idMap = new Map(created!.map((c) => [c.tempId, c.realId]));
    const finalIds = store.fields.map((f) => idMap.get(f.id) || f.id);

    try {
      await reorderFieldMutation.mutateAsync({
        formId,
        fieldIds: finalIds,
      });
    } catch (err) {
      console.error("Step 5 - reorder fields failed:", err);
      throw err;
    }

    store.markSaved();
    refetch();
  };

  const handleAddField = (type: FieldType) => {
    store.addField(type);
  };

  const handleSelectField = (fieldId: string) => {
    store.selectField(fieldId);
  };

  const handleReorderFields = (fieldIds: string[]) => {
    store.reorderFields(fieldIds);
  };

  const handleDeleteField = async (fieldId: string) => {
    const field = store.fields.find((f) => f.id === fieldId);
    if (field) {
      setDeleteTarget({ id: fieldId, label: field.label });
    }
  };

  const handleDuplicateField = async (fieldId: string) => {
    try {
      const result = await duplicateFieldMutation.mutateAsync({ id: fieldId, formId });
      if (result?.id) {
        const original = store.fields.find((f) => f.id === fieldId);
        if (original) {
          store.addServerField({
            id: result.id,
            type: original.type,
            label: `Copy of ${original.label}`,
            placeholder: original.placeholder,
            helpText: original.helpText,
            required: original.required,
            pageNumber: original.pageNumber,
            options: original.options,
            validations: original.validations,
            settings: original.settings,
          });
        }
        toast.success("Field duplicated.");
      }
    } catch {
      toast.error("Failed to duplicate field.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.id.startsWith("temp_")) {
      store.deleteField(deleteTarget.id);
    } else {
      await deleteFieldMutation.mutateAsync({ id: deleteTarget.id, formId });
    }
    setDeleteTarget(null);
  };

  const handleUpdateField = (fieldId: string, data: any) => {
    store.updateField(fieldId, data);
  };

  const selectedField = store.fields.find((f) => f.id === store.selectedFieldId) ?? null;

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-56 p-4 border-r"><Skeleton className="h-full rounded-xl" /></div>
        <div className="flex-1 p-8"><Skeleton className="h-96 rounded-xl" /></div>
        <div className="w-64 p-4 border-l"><Skeleton className="h-full rounded-xl" /></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Save bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-4">
          {store.isDirty && (
            <span className="text-xs text-muted-foreground bg-tint-butter/60 px-2 py-0.5 rounded-full">
              Unsaved changes
            </span>
          )}
          <div className="flex items-center gap-2">
            <Switch
              id="show-field-icons"
              checked={store.showFieldIcons}
              onCheckedChange={(checked) => {
                store.setShowFieldIcons(checked);
                store.markDirty();
              }}
            />
            <Label htmlFor="show-field-icons" className="text-xs text-muted-foreground cursor-pointer">
              Show field icons
            </Label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={!store.isDirty || isSaving}
          >
            <Save className="size-3.5 mr-1.5" />
            {isSaving ? "Saving…" : "Save Draft"}
          </Button>
          <Button
            variant="forest"
            size="sm"
            onClick={handleSaveAndContinue}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save & Continue"}
            <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Page tabs */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-background shrink-0 overflow-x-auto">
        {Array.from({ length: store.pageCount }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => store.setCurrentPage(pageNum)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors shrink-0 ${
              store.currentPage === pageNum
                ? "bg-muted"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Page {pageNum}
            {store.pageCount > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  store.removePage(pageNum);
                }}
                className="inline-flex items-center justify-center rounded-full hover:bg-destructive/10 hover:text-destructive size-4 text-xs cursor-pointer"
              >
                ×
              </span>
            )}
          </button>
        ))}
        <button
          onClick={() => store.addPage()}
          className="flex items-center justify-center rounded px-2.5 py-1 text-sm font-medium text-muted-foreground hover:text-foreground shrink-0"
        >
          +
        </button>
      </div>

      {/* 3-panel editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Field Palette */}
        <div className="w-56 shrink-0 border-r border-border bg-background overflow-y-auto">
          <FieldPalette onAddField={handleAddField} />
        </div>

        {/* Center panel — Form Canvas + Fields */}
        <div className="flex-1 overflow-y-auto bg-background">
          <FormCanvas
            fields={store.fields}
            formTitle={store.title}
            formDescription={store.description}
            onUpdateTitle={store.setTitle}
            onUpdateDescription={store.setDescription}
            selectedFieldId={store.selectedFieldId}
            onSelectField={handleSelectField}
            onReorder={handleReorderFields}
            onDeleteField={handleDeleteField}
            onDuplicateField={handleDuplicateField}
            onUpdateField={handleUpdateField}
            showFieldIcons={store.showFieldIcons}
            coverImageUrl={store.coverImageUrl}
            onUpdateCoverImage={store.setCoverImageUrl}
          />
        </div>

        {/* Right panel — Field Inspector */}
        <div className="w-64 shrink-0 border-l border-border bg-background overflow-y-auto">
          <FieldInspector
            field={selectedField}
            onUpdate={handleUpdateField}
          />
        </div>
      </div>

      {/* Leave confirmation */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowLeaveDialog(false);
              if (pendingNavigation) router.push(pendingNavigation);
            }}>
              Leave without saving
            </AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await handleSaveDraft();
              setShowLeaveDialog(false);
              if (pendingNavigation) router.push(pendingNavigation);
            }}>
              Save & leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete field?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.label}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
