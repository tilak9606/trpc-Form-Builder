"use client";

import { Suspense, useState, useRef, useMemo, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus, MoreVertical, Upload, Search, FolderInput,
} from "lucide-react";
import { EmptyState } from "~/components/chrome/empty-state";
import { EditorialCard, StatusBadge } from "~/components/chrome";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import {
  useCreateForm, useListForms, useImportForm, usePublishForm, useUnpublishForm, useDeleteForm, useDuplicateForm,
} from "~/hooks/api/form";
import { useListFolders, useMoveFormToFolder } from "~/hooks/api/folder";
import { trpc } from "~/trpc/client";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/lib/toast";

type FormStatusFilter = "all" | "draft" | "published" | "archived";

function DashboardFormsContent() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const [importError, setImportError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FormStatusFilter>("all");
  const searchParams = useSearchParams();
  const activeFolder = searchParams.get("folder") || undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createFormAsync, error, status } = useCreateForm();
  const { importFormAsync, isPending: importPending } = useImportForm();
  const { publishFormAsync } = usePublishForm();
  const { unpublishFormAsync } = useUnpublishForm();
  const { deleteFormAsync } = useDeleteForm();
  const { duplicateFormAsync, isPending: duplicatePending } = useDuplicateForm();
  const { folders } = useListFolders();
  const { moveFormToFolderAsync } = useMoveFormToFolder();
  const { forms, isLoading } = useListForms(activeFolder);

  const analyticsQueries = trpc.useQueries((t) =>
    (forms ?? []).map((f: any) => t.formSubmission.getAnalytics({ formId: f.id })),
  );

  const analyticsMap = useMemo(() => {
    const map = new Map<string, any>();
    analyticsQueries.forEach((query, i) => {
      const formId = forms?.[i]?.id;
      if (query.data && formId) map.set(formId, query.data);
    });
    return map;
  }, [analyticsQueries, forms]);

  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveFormId, setMoveFormId] = useState<string | null>(null);
  const [moveFormTitle, setMoveFormTitle] = useState("");

  const activeFolderName = activeFolder ? folders?.find(f => f.id === activeFolder)?.name : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const result = await createFormAsync({
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        folderId: activeFolder ?? null,
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      if (result?.id) router.push(`/dashboard/forms/${result.id}`);
    } catch {
      toast.error("Failed to create form.");
    }
  };

  const handlePublishToggle = async (formId: string, currentStatus: string) => {
    try {
      if (currentStatus?.toUpperCase() === "PUBLISHED") {
        await unpublishFormAsync({ formId });
        toast.success("Form unpublished.");
      } else {
        await publishFormAsync({ formId });
        toast.success("Form published!");
      }
    } catch {
      toast.error("Failed to update form status.");
    }
  };

  const handleDelete = async (formId: string, formTitle: string) => {
    if (!confirm(`Delete "${formTitle}"? This cannot be undone.`)) return;
    try {
      await deleteFormAsync({ formId });
      toast.success("Form deleted.");
    } catch {
      toast.error("Failed to delete form.");
    }
  };

  const handleDuplicate = async (formId: string, formTitle: string) => {
    try {
      const result = await duplicateFormAsync({ formId });
      toast.success(`Duplicated "${formTitle}".`);
      if (result?.id) router.push(`/dashboard/forms/${result.id}`);
    } catch {
      toast.error("Failed to duplicate form.");
    }
  };

  const handleMoveForm = async (folderId: string | null) => {
    if (!moveFormId) return;
    try {
      await moveFormToFolderAsync({ formId: moveFormId, folderId });
      setMoveDialogOpen(false);
      setMoveFormId(null);
      toast.success(folderId ? "Form moved to folder." : "Form removed from folder.");
    } catch {
      toast.error("Failed to move form.");
    }
  };

  const filteredForms = (forms ?? []).filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || form.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-foreground">
            {activeFolderName ? activeFolderName : "Your Forms"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeFolderName ? `Forms in "${activeFolderName}"` : "Manage and track your forms"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const json = JSON.parse(ev.target?.result as string);
                  setImportData(json);
                  setImportError("");
                  setImportOpen(true);
                } catch {
                  setImportError("Invalid JSON file");
                }
              };
              reader.readAsText(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>

          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogContent className="border-border sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import form</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {importData ? `"${importData.title || "Untitled"}" will be imported with ${importData.fields?.length || 0} fields.` : ""}
                </DialogDescription>
              </DialogHeader>
              {importError ? <p className="text-sm text-destructive">{importError}</p> : null}
              <DialogFooter>
                <Button variant="ghost" onClick={() => { setImportOpen(false); setImportData(null); }}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!importData) return;
                    try {
                      const result = await importFormAsync({ data: importData });
                      if (result?.id) {
                        setImportOpen(false);
                        setImportData(null);
                        window.location.href = `/dashboard/forms/${result.id}`;
                      }
                    } catch {
                      toast.error("Failed to import form.");
                    }
                  }}
                  disabled={importPending || !importData}
                >
                  {importPending ? "Importing..." : "Import"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="forest">
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create new form</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Add a title and optional description.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-foreground">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Form title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Optional description"
                  />
                </div>

                {error ? (
                  <p className="text-sm text-destructive">{error.message}</p>
                ) : null}

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={status === "pending" || title.trim().length === 0}
                  >
                    {status === "pending" ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground outline-none focus:border-ring transition-colors"
          />
        </div>

        <ToggleGroup
          type="single"
          value={statusFilter}
          onValueChange={(v) => v && setStatusFilter(v as FormStatusFilter)}
          className="gap-2"
        >
          {(["all", "draft", "published", "archived"] as const).map((s) => (
            <ToggleGroupItem
              key={s}
              value={s}
              className="rounded-full border border-border bg-card hover:bg-secondary text-foreground font-medium h-9 px-4 min-w-[68px] justify-center data-[state=on]:bg-foreground data-[state=on]:text-background"
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : filteredForms.length === 0 ? (
        <EmptyState
          headline={searchQuery ? "No forms found" : "Nothing here yet."}
          description={searchQuery ? `No forms match "${searchQuery}"` : "Create your first form to start collecting."}
          action={
            searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            ) : (
              <Button variant="forest" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form) => (
            <div key={form.id} className="block h-full group">
              <EditorialCard interactive className="h-full flex flex-col relative overflow-hidden">
                <Link href={`/dashboard/forms/${form.id}`} className="absolute inset-0 z-0" />

                <div className="absolute top-3 right-3 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 hover:bg-background shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/forms/${form.id}`)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/forms/${form.id}/analytics`)}>
                        Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/forms/${form.id}/settings`)}>
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicate(form.id, form.title)}
                        disabled={duplicatePending}
                      >
                        {duplicatePending ? "Duplicating..." : "Duplicate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setMoveFormId(form.id);
                          setMoveFormTitle(form.title);
                          setMoveDialogOpen(true);
                        }}
                      >
                        <FolderInput className="h-4 w-4 mr-2" />
                        Move to folder
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePublishToggle(form.id, form.status)}>
                        {form.status?.toUpperCase() === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10"
                        onClick={() => handleDelete(form.id, form.title)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {(form as any).coverImageUrl ? (
                  <div className="h-32 -mx-6 -mt-6 mb-4 shrink-0 relative z-0 pointer-events-none overflow-hidden">
                    <img src={(form as any).coverImageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="h-32 -mx-6 -mt-6 mb-4 shrink-0 relative z-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, var(--tint-mint), var(--tint-peach))`,
                    }}
                  />
                )}

                <div className="flex items-center gap-2 flex-wrap relative z-0 pointer-events-none px-1">
                  <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                    {form.title}
                  </h3>
                  <StatusBadge status={(form.status?.toLowerCase() ?? "draft") as "draft" | "published" | "archived"} />
                </div>

                {form.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1 relative z-0 pointer-events-none px-1">
                    {form.description}
                  </p>
                )}

                <div className="mt-auto pt-4 text-mono-sm text-muted-foreground relative z-0 pointer-events-none px-1">
                  {(analyticsMap.get(form.id)?.totalViews ?? 0)} views · {(analyticsMap.get(form.id)?.totalStarts ?? 0)} starts · {(analyticsMap.get(form.id)?.totalSubmissions ?? 0)} subs
                </div>
              </EditorialCard>
            </div>
          ))}
        </div>
      )}

      {/* Move to folder dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move &ldquo;{moveFormTitle}&rdquo;</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select a folder or remove from current folder.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {activeFolder && (
              <button
                onClick={() => handleMoveForm(null)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
              >
                Remove from folder
              </button>
            )}
            {folders?.map((f) => (
              <button
                key={f.id}
                onClick={() => handleMoveForm(f.id)}
                disabled={f.id === activeFolder}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="truncate">{f.name}</span>
                {f.id === activeFolder && <span className="text-xs text-muted-foreground ml-auto">(current)</span>}
              </button>
            ))}
            {(!folders || folders.length === 0) && (
              <p className="text-sm text-muted-foreground py-2">No folders yet. Create one from the sidebar.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DashboardForms() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <DashboardFormsContent />
    </Suspense>
  );
}
