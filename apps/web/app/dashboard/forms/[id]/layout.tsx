"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Spinner } from "~/components/ui/spinner";
import { StatusBadge } from "~/components/chrome/status-badge";
import {
  ArrowLeft,
  Check,
  MoreHorizontal,
  Share2,
  BarChart2,
  MessageSquare,
  Settings,
  Layout,
  Palette,
  Eye,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { toast } from "~/lib/toast";
import { handleTrpcError } from "~/lib/api-error";
import { ShareModal } from "~/components/form-builder/share-modal";
import { useCreateTemplate } from "~/hooks/api/form-template";
import { useArchiveForm } from "~/hooks/api/form";
import { useFormEditorStore } from "~/lib/stores/form-editor-store";
import { mapServerFieldsToEditorFields } from "~/lib/form-field-mapper";
import { cn } from "~/lib/utils";
import type { FieldType } from "@repo/database/constants/field-types";

const DRAFT_STEPS = [
  { id: "build", label: "Editor", path: "", icon: Layout },
  { id: "design", label: "Design", path: "/theme", icon: Palette },
  { id: "preview", label: "Preview", path: "/preview", icon: Eye },
] as const;

const PUBLISHED_STEPS = [
  { id: "build", label: "Editor", path: "", icon: Layout },
  { id: "design", label: "Design", path: "/theme", icon: Palette },
  { id: "analytics", label: "Analytics", path: "/analytics", icon: BarChart2 },
  { id: "submissions", label: "Submissions", path: "/submissions", icon: MessageSquare },
  { id: "settings", label: "Settings", path: "/settings", icon: Settings },
  { id: "email", label: "Email", path: "/email-settings", icon: MessageSquare },
] as const;

interface FormContextValue {
  form: any;
  isLoading: boolean;
  refetch: () => void;
}

const FormContext = React.createContext<FormContextValue>({
  form: null,
  isLoading: false,
  refetch: () => {},
});

export function useFormContext() {
  return React.useContext(FormContext);
}

export default function FormEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const formId = params.id;

  const { data: form, isLoading, refetch } = trpc.form.getByIdWithFields.useQuery(
    { formId },
    { enabled: !!formId },
  );
  const utils = trpc.useUtils();
  const store = useFormEditorStore();

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState("");
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  const updateMutation = trpc.form.updateForm.useMutation({
    onSuccess: () => {
      utils.form.getByIdWithFields.invalidate({ formId });
      utils.form.listForms.invalidate();
    },
    onError: (err) => handleTrpcError(err),
  });

  const createFieldMutation = trpc.formField.createField.useMutation();
  const updateFieldMutation = trpc.formField.updateField.useMutation();
  const deleteFieldMutation = trpc.formField.deleteField.useMutation({
    onSuccess: () => {
      utils.formField.getFields.invalidate({ formId });
      utils.form.getByIdWithFields.invalidate({ formId });
    },
  });
  const reorderFieldMutation = trpc.formField.reorderFields.useMutation();

  const publishMutation = trpc.form.publishForm.useMutation({
    onSuccess: (data) => {
      utils.form.getByIdWithFields.invalidate({ formId });
      utils.form.listForms.invalidate();
      const url = `${window.location.origin}/form/${data.slug}`;
      toast.success("Form published!", {
        action: {
          label: "Copy Link",
          onClick: () => {
            navigator.clipboard.writeText(url);
            toast.success("Link copied!");
          },
        },
      });
      setIsPublishing(false);
    },
    onError: (err) => {
      handleTrpcError(err);
      setIsPublishing(false);
    },
  });

  const [isPublishing, setIsPublishing] = React.useState(false);

  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    try {
      await updateMutation.mutateAsync({
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

      // Bug #2 fix: `publishFields` is now ALWAYS in EditorField shape (`required`,
      // `helpText`, `pageNumber`), whichever branch runs. Previously the fallback branch
      // used the raw server field shape (`isRequired`, `description`, `page`) directly,
      // which silently produced `description: undefined`, `isRequired: undefined -> false`,
      // and `page: 1` for every field below once mapped through `.helpText`/`.required`/
      // `.pageNumber` (properties that don't exist on the raw shape). The store-hydration
      // guard also now checks `store.formId === formId`, not just array length, so a stale
      // store from a previously-visited form can't be mistaken for "already hydrated".
      const publishFields =
        store.formId === formId && store.fields.length > 0
          ? store.fields
          : mapServerFieldsToEditorFields((form as any)?.fields);

      const serverFields = (form as any)?.fields || [];
      const deletedIds = serverFields
        .map((f: any) => f.id)
        .filter((id: string) => !publishFields.find((f: any) => f.id === id));

      for (const id of deletedIds) {
        await deleteFieldMutation.mutateAsync({ id, formId });
      }

      const toApiOptions = (options?: { label: string; value: string }[]) =>
        options?.map((o) => o.label) ?? undefined;

      const createResults = await Promise.all(
        publishFields
          .filter((f: any) => f.id.startsWith("temp_"))
          .map(async (field: any) => {
            const res = await createFieldMutation.mutateAsync({
              formId,
              type: field.type as FieldType,
              label: field.label,
              placeholder: field.placeholder,
              description: field.helpText,
              isRequired: field.required,
              options: toApiOptions(field.options),
              page: field.pageNumber ?? 1,
            });
            return { tempId: field.id, realId: res.id };
          }),
      );

      await Promise.all(
        publishFields
          .filter((f: any) => !f.id.startsWith("temp_"))
          .map((field: any) =>
            updateFieldMutation.mutateAsync({
              id: field.id,
              formId,
              label: field.label,
              placeholder: field.placeholder,
              description: field.helpText,
              isRequired: field.required,
              options: toApiOptions(field.options),
              page: field.pageNumber ?? 1,
            }),
          ),
      );

      const idMap = new Map(createResults.map((c) => [c.tempId, c.realId]));
      const finalIds = publishFields.map((f: any) => idMap.get(f.id) || f.id);

      await reorderFieldMutation.mutateAsync({ formId, fieldIds: finalIds });
      store.markSaved();

      publishMutation.mutate({ formId });
    } catch (err) {
      handleTrpcError(err);
      setIsPublishing(false);
    }
  };

  const unpublishMutation = trpc.form.unpublishForm.useMutation({
    onSuccess: () => {
      utils.form.getByIdWithFields.invalidate({ formId });
      utils.form.listForms.invalidate();
      toast.success("Form unpublished.");
    },
    onError: (err) => handleTrpcError(err),
  });

    const { archiveFormAsync: archiveMutation, isPending: archivePending } = useArchiveForm();

  const deleteMutation = trpc.form.deleteForm.useMutation({
    onSuccess: () => {
      utils.form.listForms.invalidate();
      toast.success("Form deleted.");
      router.push("/dashboard");
    },
    onError: (err) => handleTrpcError(err),
  });

  const cloneMutation = trpc.form.duplicateForm.useMutation({
    onSuccess: (data: any) => {
      utils.form.listForms.invalidate();
      toast.success("Form cloned!");
      if (data?.id) router.push(`/dashboard/forms/${data.id}`);
    },
    onError: (err) => handleTrpcError(err),
  });

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = React.useState(false);
  const [templateTitle, setTemplateTitle] = React.useState("");
  const { createTemplateAsync, isPending: creatingTemplate } = useCreateTemplate();

  const basePath = `/dashboard/forms/${formId}`;
  const isPublished = (form as any)?.status === "published";
  const activeSteps = isPublished ? PUBLISHED_STEPS : DRAFT_STEPS;

  const handleSaveAsTemplate = async () => {
    const fields = (formData.fields ?? []).map((f: any) => ({
      label: f.label,
      type: f.type,
      description: f.description ?? undefined,
      placeholder: f.placeholder ?? undefined,
      isRequired: f.isRequired ?? undefined,
      options: f.options ?? undefined,
      validation: f.validation ?? undefined,
      page: f.page ?? undefined,
      condition: f.condition ?? undefined,
    }));
    try {
      await createTemplateAsync({
        title: templateTitle.trim() || formData.title,
        description: formData.description ?? undefined,
        fields,
      });
      setShowTemplateDialog(false);
      setTemplateTitle("");
      toast.success("Template saved!");
    } catch {
      toast.error("Failed to save template.");
    }
  };

  const computeStepIndex = React.useCallback(() => {
    const idx = activeSteps.findIndex((s) => {
      if (s.id === "build") {
        return pathname === basePath;
      }
      return pathname.startsWith(`${basePath}${s.path}`);
    });
    return idx >= 0 ? idx : 0;
  }, [activeSteps, pathname, basePath]);

  const [activeStepIndex, setActiveStepIndex] = React.useState(computeStepIndex);

  React.useEffect(() => {
    setActiveStepIndex(computeStepIndex());
  }, [computeStepIndex]);

  const navigateToStep = (index: number) => {
    const step = activeSteps[index];
    if (step) {
      router.push(`${basePath}${step.path}`);
    }
  };

  const startEditingTitle = () => {
    if (!form) return;
    setTitleDraft((form as any).title ?? "");
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const saveTitle = () => {
    if (titleDraft.trim() && titleDraft !== (form as any)?.title) {
      updateMutation.mutate({ formId, title: titleDraft.trim() });
      // Sync Zustand store so the editor canvas reflects the new title
      store.setTitle(titleDraft.trim());
    }
    setIsEditingTitle(false);
  };

  const cancelEditTitle = () => {
    setIsEditingTitle(false);
    setTitleDraft((form as any)?.title ?? "");
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-foreground">Form not found</h2>
        <p className="mt-2 text-muted-foreground">
          This form may have been deleted.
        </p>
        <Button variant="forest" asChild className="mt-4">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const formData = form as any;
  const isDraft = formData.status === "draft";
  const isArchived = formData.status === "archived";
  const isOnPreview = activeSteps[activeStepIndex]?.id === "preview";

  return (
    <FormContext.Provider value={{ form, isLoading, refetch }}>
      <div className="flex flex-col flex-1 min-h-0 h-full">
        {/* Top bar */}
        <div className="sticky top-0 z-40 h-14 flex items-center gap-4 px-6 border-b border-border bg-background/95 backdrop-blur shrink-0">
          {/* Back button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/dashboard")}
            className="shrink-0"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="size-4" />
          </Button>

          {/* Title */}
          <div className="flex items-center gap-2 min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") cancelEditTitle();
                }}
                className="bg-transparent border-b border-foreground outline-none text-sm font-semibold w-48"
                aria-label="Form title"
              />
            ) : (
              <button
                onClick={startEditingTitle}
                className="text-sm font-semibold hover:underline cursor-text truncate max-w-[200px]"
                title="Click to edit title"
              >
                {formData.title}
                {updateMutation.isPending && (
                  <Spinner className="inline-block ml-1 size-3" />
                )}
              </button>
            )}
            <StatusBadge status={formData.status ?? "draft"} />
          </div>

          {/* Stepper — centered */}
          <div className="flex-1 flex justify-center">
            <nav className="flex items-center gap-1" aria-label="Form editor steps">
              {activeSteps.map((step, index) => {
                const isActive = index === activeStepIndex;
                const isCompleted = index < activeStepIndex;
                return (
                  <React.Fragment key={step.id}>
                    {index > 0 && !isPublished && (
                      <div
                        className={cn(
                          "w-8 h-px mx-1",
                          index <= activeStepIndex ? "bg-foreground" : "bg-border",
                        )}
                      />
                    )}
                    <button
                      onClick={() => navigateToStep(index)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        isActive && "bg-foreground text-background",
                        isCompleted && !isPublished && "bg-tint-mint text-tint-mint-ink",
                        !isActive && (!isCompleted || isPublished) && "text-muted-foreground hover:text-foreground hover:bg-secondary",
                      )}
                    >
                      {isCompleted && !isPublished ? (
                        <Check className="size-3" />
                      ) : (
                        <span className={cn(
                          "size-4 rounded-full flex items-center justify-center text-[10px] font-bold border",
                          isActive ? "border-background/50" : "border-current",
                        )}>
                          {isPublished ? <step.icon className="size-3" /> : index + 1}
                        </span>
                      )}
                      {step.label}
                    </button>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Preview step shows Save Draft + Publish */}
            {isOnPreview && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateMutation.mutate({ formId }, {
                      onSuccess: () => toast.success("Draft saved!"),
                    });
                  }}
                  disabled={updateMutation.isPending}
                >
                  <Eye className="size-4 mr-1" />
                  {updateMutation.isPending ? "Saving…" : "Save Draft"}
                </Button>
                {isDraft && (
                  <Button
                    variant="forest"
                    size="sm"
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? "Publishing…" : "Publish"}
                  </Button>
                )}
              </>
            )}

            {isPublished && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => unpublishMutation.mutate({ formId })}
                disabled={unpublishMutation.isPending}
              >
                Unpublish
              </Button>
            )}

            {/* Share */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDraft}
                    onClick={() => {
                      if (!isDraft) setShowShareModal(true);
                    }}
                  >
                    <Share2 className="size-4 mr-1" />
                    Share
                  </Button>
                </TooltipTrigger>
                {isDraft && (
                  <TooltipContent>
                    Publish this form before sharing.
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {/* More menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setTemplateTitle(formData.title || "");
                    setShowTemplateDialog(true);
                  }}
                >
                  Save as Template
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => cloneMutation.mutate({ formId })}
                >
                  Duplicate
                </DropdownMenuItem>
                {!isArchived && (
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        await archiveMutation({ formId });
                        toast.success("Form archived.");
                        router.push("/dashboard");
                      } catch { /* handled by hook */ }
                    }}
                  >
                    <Archive className="size-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">{children}</div>

        {/* Share modal */}
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          slug={formData.slug ?? ""}
          status={formData.status ?? "draft"}
        />

        {/* Delete dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete &ldquo;{formData.title}&rdquo;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All responses and analytics will be
                permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={() => deleteMutation.mutate({ formId })}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Save as Template dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Save this form as a reusable template.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Template title</label>
              <Input
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="My Template"
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveAsTemplate(); }}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveAsTemplate} disabled={creatingTemplate}>
                {creatingTemplate ? "Saving..." : "Save Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FormContext.Provider>
  );
}
