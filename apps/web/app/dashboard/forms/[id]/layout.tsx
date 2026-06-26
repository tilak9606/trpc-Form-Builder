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
import { cn } from "~/lib/utils";

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

  const { data: form, isLoading, refetch } = trpc.form.getFormWithFields.useQuery(
    { formId },
    { enabled: !!formId }
  );
  const utils = trpc.useUtils();

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState("");
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  const updateMutation = trpc.form.updateForm.useMutation({
    onSuccess: () => {
      utils.form.getFormWithFields.invalidate({ formId });
      utils.form.listForms.invalidate();
    },
    onError: (err) => handleTrpcError(err),
  });

  const publishMutation = trpc.form.publishForm.useMutation({
    onSuccess: (data) => {
      utils.form.getFormWithFields.invalidate({ formId });
      utils.form.listForms.invalidate();
      toast.success("Form published!", {
        action: {
          label: "Copy Link",
          onClick: () => {
            const slug = (form as any)?.slug;
            if (slug) {
              const url = `${window.location.origin}/form/${slug}`;
              navigator.clipboard.writeText(url);
              toast.success("Link copied!");
            }
          },
        },
      });
    },
    onError: (err) => handleTrpcError(err),
  });

  const unpublishMutation = trpc.form.publishForm.useMutation({
    onSuccess: () => {
      utils.form.getFormWithFields.invalidate({ formId });
      utils.form.listForms.invalidate();
      toast.success("Form unpublished.");
    },
    onError: (err) => handleTrpcError(err),
  });

  const deleteMutation = trpc.form.deleteForm.useMutation({
    onSuccess: () => {
      utils.form.listForms.invalidate();
      toast.success("Form deleted.");
      router.push("/dashboard");
    },
    onError: (err) => handleTrpcError(err),
  });

  const duplicateMutation = trpc.form.duplicateForm.useMutation({
    onSuccess: (data: any) => {
      utils.form.listForms.invalidate();
      toast.success("Form duplicated!");
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
  const isPublished = (form as any)?.status === "PUBLISHED";
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
        return pathname === basePath || pathname === `${basePath}/`;
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
    }
    setIsEditingTitle(false);
  };

  const cancelEditTitle = () => {
    setIsEditingTitle(false);
    setTitleDraft((form as any)?.title ?? "");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-14 border-b border-border bg-background shrink-0 flex items-center px-6 gap-4">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-5 w-48" />
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-px w-8" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-px w-8" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-xl font-semibold text-foreground">Form not found</h2>
        <p className="text-muted-foreground">This form may have been deleted.</p>
        <Button variant="forest" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const formData = form as any;
  const isDraft = formData.status === "DRAFT";
  const isOnPreview = activeSteps[activeStepIndex]?.id === "preview";

  return (
    <FormContext.Provider value={{ form, isLoading, refetch }}>
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="h-14 flex items-center gap-4 px-6 border-b border-border bg-background/95 backdrop-blur shrink-0 z-40">
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
            <StatusBadge status={(formData.status ?? "DRAFT").toLowerCase() as any} />
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
            {isOnPreview && isDraft && (
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
                  {updateMutation.isPending ? "Saving…" : "Save Draft"}
                </Button>
                <Button
                  variant="forest"
                  size="sm"
                  onClick={() => publishMutation.mutate({ formId, status: "PUBLISHED" })}
                  disabled={publishMutation.isPending}
                >
                  {publishMutation.isPending ? "Publishing…" : "Publish"}
                </Button>
              </>
            )}

            {isPublished && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => unpublishMutation.mutate({ formId, status: "CLOSED" })}
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
                  onClick={() => duplicateMutation.mutate({ formId })}
                >
                  Duplicate
                </DropdownMenuItem>
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
          status={formData.status ?? "DRAFT"}
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
